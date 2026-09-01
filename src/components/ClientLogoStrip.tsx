import { motion } from "framer-motion";

export interface ClientLogo {
  name: string;
  href?: string;
  src?: string;
  /** Taller logos (e.g. square marks) */
  scale?: number;
  /** Inline mark instead of an image file */
  variant?: "joshua";
}

export const CLIENT_LOGOS: ClientLogo[] = [
  {
    name: "Cornerstone Coatings",
    href: "https://cornerstonecoatingsga.com",
    src: "/images/client-logos/cornerstone.png",
    scale: 1.05,
  },
  {
    name: "Illuminated Productions",
    href: "https://illuminated-prod.vercel.app",
    src: "/images/client-logos/illuminated.png",
  },
  {
    name: "JB Recycling",
    src: "/images/client-logos/jb-recycling.jpg",
    scale: 1.1,
  },
  {
    name: "The Joshua 1:9 Law Firm",
    href: "https://joshua19lawfirm.com",
    variant: "joshua",
    scale: 0.95,
  },
  {
    name: "Krush Windshield Repair",
    href: "https://krushwindshieldrepair.com",
    src: "/images/client-logos/krush.png",
  },
  {
    name: "Watch Trading Post",
    href: "https://www.watchtradingpost.com",
    src: "/images/client-logos/watch-trading-post.png",
  },
  {
    name: "One Talent Productions",
    href: "https://www.onetalentproductions.com",
    src: "/images/client-logos/one-talent-productions.png",
    scale: 1.08,
  },
];

function JoshuaMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0f172a] text-[#e5b866] ring-1 ring-[#d4a853]/35"
      >
        <span className="font-serif text-base font-semibold leading-none">J</span>
        <span className="ml-0.5 text-[8px] font-semibold tracking-wider text-[#d4a853]">1:9</span>
      </span>
      <span className="min-w-0 text-left leading-tight">
        <span className="block font-serif text-[11px] font-semibold text-ink sm:text-xs">Joshua 1:9</span>
        <span className="block text-[9px] font-medium text-muted sm:text-[10px]">Law Firm</span>
      </span>
    </div>
  );
}

function LogoMark({ client }: { client: ClientLogo }) {
  const inner = (
  <div
    className="client-logo-mark flex h-11 w-full max-w-[168px] items-center justify-center sm:h-12"
    style={{ transform: client.scale ? `scale(${client.scale})` : undefined }}
  >
    {client.variant === "joshua" ? (
      <JoshuaMark />
    ) : client.src ? (
      <img
        src={client.src}
        alt={client.name}
        loading="lazy"
        decoding="async"
        className="client-logo-img max-h-full max-w-full object-contain"
      />
    ) : null}
  </div>
  );

  if (client.href) {
    return (
      <a
        href={client.href}
        target="_blank"
        rel="noopener noreferrer"
        className="client-logo-link group flex min-h-[72px] items-center justify-center rounded-xl border px-4 py-5 transition-colors duration-200"
        aria-label={`${client.name} (opens in new tab)`}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      className="client-logo-link flex min-h-[72px] items-center justify-center rounded-xl border px-4 py-5"
      aria-label={client.name}
    >
      {inner}
    </div>
  );
}

export default function ClientLogoStrip() {
  return (
    <section
      className="client-logo-strip border-y"
      style={{
        borderColor: "var(--border-color)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface-alpha) 80%, transparent), transparent 72%)",
      }}
      aria-labelledby="client-logo-strip-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p
            id="client-logo-strip-heading"
            className="text-accent text-[13px] font-mono uppercase tracking-widest"
          >
            Selected clients
          </p>
          <p className="mt-2 text-muted text-[15px] sm:text-base max-w-lg mx-auto leading-relaxed">
            Businesses we&apos;ve built for across Georgia and the Southeast.
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 sm:gap-4"
        >
          {CLIENT_LOGOS.map((client) => (
            <li key={client.name}>
              <LogoMark client={client} />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
