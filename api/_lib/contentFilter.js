/**
 * Deterministic content pre-filter.
 *
 * Runs BEFORE the AI screener and needs no network call, so it still works when
 * the model is rate-limited, down, or refuses to classify. This is the backstop
 * that guarantees blatant trolling never reaches the inbox.
 *
 * Deliberately narrow: only patterns that essentially never appear in a genuine
 * business inquiry. Ordinary swearing ("our site is a piece of shit") is NOT
 * blocked here — a frustrated real customer is still a real customer, so that
 * goes to the AI with a flag instead.
 */

/** Map common leetspeak substitutions back to letters. */
const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i', '|': 'i' };

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[01345789@$!|]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Re-join deliberately spaced-out letters: "b o o b" -> "boob". */
function despace(text) {
  return text.replace(/\b(?:[a-z] ){2,}[a-z]\b/g, (run) => run.replace(/ /g, ''));
}

/**
 * Build a regex that tolerates stretched letters and a plural: "boob" matches
 * "boooooob" and "boobs". Word-anchored, so "bob" and "cocktail" do not match.
 */
function stretchy(term) {
  const body = term
    .split(' ')
    .map((word) => word.split('').map((ch) => `${ch}+`).join(''))
    .join(' +');
  return new RegExp(`\\b${body}s*\\b`);
}

/**
 * Crude sexual language and slurs. These do not appear in genuine inquiries.
 * Anatomical/medical terms are deliberately excluded (a clinic may use them),
 * as are words with legitimate trade meanings (nipple, sucker rod, dick).
 */
const EXPLICIT = [
  'boob', 'boobs', 'booby', 'titty', 'titties', 'tiddies', 'tits',
  'cock', 'blowjob', 'blow job', 'handjob', 'rimjob', 'deepthroat',
  'jizz', 'wank', 'wanker', 'jerk off', 'jack off',
  'pussy', 'cunt', 'twat', 'slut', 'whore',
  'suck my', 'sucks my', 'lick my', 'eat my ass', 'blow me', 'up your ass',
  'porn', 'porno', 'pornhub', 'milf', 'bdsm',
  'fuck you', 'fuck off', 'fuck u', 'stfu', 'gtfo',
  'nigger', 'nigga', 'faggot', 'fag', 'tranny', 'retard', 'retarded',
  'kike', 'wetback', 'towelhead', 'raghead',
  'kill yourself', 'kys', 'neck yourself',
].map(stretchy);
// Deliberately excluded as too collision-prone for an auto-reject: "anal"
// (analytics, anal-retentive), "coon" (Coon Rapids), "chink" (chink in the
// armor), "cum"/"cumming" (magna cum laude, and Cumming GA is 40 miles away),
// "spic" (spick and span), "hoe" (garden supply), "dick" (Dick's Sporting
// Goods). The AI screener still catches these in genuinely abusive context.

/** Joke aliases. Overwhelmingly used to waste a form owner's time. */
const JOKE_NAMES = [
  'hugh jass', 'mike hunt', 'mike oxlong', 'mike oxmall', 'mike rotch',
  'ben dover', 'eileen dover', 'seymour butts', 'dixie normous', 'dixie rect',
  'anita bath', 'anita man', 'phil mccracken', 'jack mehoff', 'jacques strap',
  'harry balls', 'harry sack', 'ivana tinkle', 'oliver clothesoff',
  'hugh jorgan', 'pat mycrotch', 'al coholic', 'moe lester', 'connie lingus',
  'amanda hugginkiss', 'bea oproblem', 'i p freely', 'ollie tabooger',
  'deez nuts', 'joe mama', 'your mom', 'ur mom', 'yo mama', 'ligma', 'sugma',
  'john doe', 'jane doe', 'bugs bunny', 'mickey mouse', 'donald duck',
  'john cena', 'elon musk', 'santa claus', 'adolf hitler', 'hitler',
].map(stretchy);

/**
 * Messages that are nothing but laughter or filler. Anchored to the whole
 * string, so "lol yeah we need a new site" is unaffected.
 */
const LAUGHTER = /^(?:l+[oa]+l+(?:[oa]+l+)*|l+m+f?a+o+|(?:ha){2,}h?|(?:he){2,}h?|(?:hi){2,}|(?:ja){2,}|r+o+f+l+|x+d+|k+e+k+|b+a+h+a+|t+e+h+e+|y+e+e+t+|l+m+a+o+)+$/;

/**
 * Single tokens that are unambiguously not a request. Greetings ("hi", "hey")
 * are deliberately absent — a lazy but real person may write one, so those go
 * to the AI with the rest of the form for context.
 */
const FILLER_ONLY = new Set([
  'lol', 'lmao', 'lmfao', 'rofl', 'haha', 'hehe', 'hah', 'heh', 'xd', 'kek',
  'yeet', 'poggers', 'bruh', 'meh', 'nvm', 'blah', 'blahblah',
  'asdf', 'asdfasdf', 'asdfghjkl', 'qwerty', 'qwertyuiop', 'aaa', 'aaaa',
  'test', 'testing', 'testtest', 'ignorethis', 'deeznuts',
]);

function matchAny(patterns, text) {
  for (const re of patterns) {
    if (re.test(text)) return re.source.replace(/\\b|\+/g, '');
  }
  return null;
}

/**
 * @param {{ name?: string, company?: string, problem?: string }} submission
 * @returns {{ category: string, reason: string, matched: string }|null}
 *          Non-null means reject outright. Null means "not obviously junk" —
 *          hand it to the AI screener.
 */
export function prefilter(submission) {
  const name = despace(normalize(submission.name));
  const company = despace(normalize(submission.company));
  const problem = despace(normalize(submission.problem));
  const all = [name, company, problem].filter(Boolean).join(' | ');

  const explicit = matchAny(EXPLICIT, all);
  if (explicit) {
    return {
      category: 'troll_or_abusive',
      reason: 'Submission contains explicit or abusive language.',
      matched: explicit,
    };
  }

  const joke = matchAny(JOKE_NAMES, `${name} ${company}`.trim());
  if (joke) {
    return {
      category: 'troll_or_abusive',
      reason: 'Submitted under a joke alias.',
      matched: joke,
    };
  }

  // Laughter-only / filler-only message with nothing else to act on.
  if (problem) {
    const collapsed = problem.replace(/\s+/g, '');
    if (LAUGHTER.test(collapsed)) {
      return {
        category: 'troll_or_abusive',
        reason: 'Message is nothing but laughter.',
        matched: 'laughter',
      };
    }
    if (FILLER_ONLY.has(collapsed)) {
      return {
        category: 'test_submission',
        reason: 'Message contains no actual request.',
        matched: collapsed,
      };
    }
    // A long run with no vowels at all is keyboard mashing. The threshold is
    // generous so tech shorthand ("php css js") is never caught.
    if (collapsed.length >= 10 && !/[aeiouy]/.test(collapsed)) {
      return {
        category: 'gibberish',
        reason: 'Message is not readable text.',
        matched: 'no-vowels',
      };
    }
  }

  return null;
}

/** Softer signal handed to the AI rather than auto-rejected. */
const MILD_PROFANITY = [
  'fuck', 'fucking', 'shit', 'shitty', 'bullshit', 'bitch', 'bastard',
  'asshole', 'dumbass', 'jackass', 'damn', 'crap', 'piss', 'dick', 'prick',
  'idiot', 'stupid', 'moron', 'sucks', 'garbage', 'trash',
].map(stretchy);

export function hasMildProfanity(submission) {
  const text = despace(normalize(
    [submission.name, submission.company, submission.problem].filter(Boolean).join(' '),
  ));
  return Boolean(matchAny(MILD_PROFANITY, text));
}
