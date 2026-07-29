import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';

const CATEGORY_COPY: Record<string, string> = {
  spam_or_solicitation:
    'This form is for people who want to hire us — not for sales, SEO, or lead-generation pitches.',
  troll_or_abusive:
    'The message didn’t read as a good-faith inquiry, so it wasn’t delivered.',
  gibberish:
    'We couldn’t make sense of the message, so it wasn’t delivered.',
  test_submission:
    'That looked like a test submission, so it wasn’t delivered.',
  low_value:
    'The message didn’t include anything we could actually respond to, so it wasn’t delivered.',
};

const Sorry: React.FC = () => {
  const location = useLocation();
  const category = (location.state as { category?: string } | null)?.category ?? '';
  const explanation =
    CATEGORY_COPY[category] ??
    'The message didn’t read as a genuine project inquiry, so it wasn’t delivered.';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg w-full text-center"
        >
          {/* Status icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mb-8 inline-block"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(245, 158, 11, 0.10)', border: '1px solid rgba(245, 158, 11, 0.28)' }}
            >
              <svg className="w-10 h-10" style={{ color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.5m0 3.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            <h1 className="text-4xl md:text-5xl mb-4 text-ink">
              We didn’t send that one.
            </h1>
            <p className="text-muted text-lg leading-relaxed mb-3">{explanation}</p>
            <p className="text-muted text-sm leading-relaxed mb-10">
              Our intake form goes straight to a real person’s inbox, so every submission is screened
              first. Serious inquiries — even short or unpolished ones — always get through.
            </p>
          </motion.div>

          {/* What to do instead */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mb-8 text-left p-5 rounded-2xl border bg-surface"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <p className="text-[13px] font-semibold text-ink mb-3">If you have a real project</p>
            <ul className="space-y-2.5 text-muted text-sm leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-accent flex-none">·</span>
                <span>Tell us what you’re trying to build or fix — a sentence or two is plenty.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent flex-none">·</span>
                <span>Use an email or phone number you actually check, so we can reach you.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent flex-none">·</span>
                <span>
                  Think this was a mistake? Email{' '}
                  <a href="mailto:jeremy@hoppytech.com" className="text-accent hover:underline">
                    jeremy@hoppytech.com
                  </a>{' '}
                  directly and it’ll get read.
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/contact">
              <button
                className="w-full sm:w-auto px-7 py-3.5 font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] text-[15px]"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                Try again
              </button>
            </Link>
            <Link to="/">
              <button
                className="w-full sm:w-auto px-7 py-3.5 border font-medium rounded-xl transition-all duration-200 text-[15px] text-ink"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Return home
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Sorry;
