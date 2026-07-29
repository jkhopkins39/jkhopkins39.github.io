import { motion } from 'framer-motion';
import EducationTimeline from "../components/EducationTimeline";
import SkillsDropdown from "../components/SkillsDropdown";
import ResumeSection from "../components/ResumeSection";
import Footer from "../components/Footer";

const educationHistory = [
  {
    title: "Zinnia Internship",
    period: "May 2026",
    description:
      "Interned at Zinnia, applying AI and machine learning to real-world products alongside a growing engineering team.",
    image: "/images/education/zinnia-logo.jpg",
  },
  {
    title: "Hoppy Tech Founded",
    period: "June 2025",
    description:
      "Founded Hoppy Tech to build websites, AI tools, and custom software for small businesses.",
    image: "/icon-512x512.png",
    imageFit: "contain" as const,
  },
  {
    title: "Kennesaw State University",
    period: "Graduated May 2026",
    description:
      "Earned a BS in Computer Science with a focus in Artificial Intelligence, building most of my portfolio projects along the way.",
    image: "/images/education/marietta-campus.jpg",
  },
  {
    title: "University of West Georgia",
    period: "2021–2022",
    description:
      "Built a foundation in test-driven development, object-oriented programming, and software design.",
    image: "/images/education/UWG.jpg",
  },
  {
    title: "Bremen High School",
    period: "2017–2021",
    description:
      "Graduated with National Honor Society membership; marching band brass captain and A/V technician.",
    image: "/images/education/BHS.png",
  },
];

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function About() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* ─── Page header ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <motion.h1
          {...fadeUp(1)}
          className="text-[clamp(2rem,4.4vw,3.6rem)] text-ink"
        >
          The person behind<br />
          <span className="text-accent">the code</span>
        </motion.h1>
        <motion.p {...fadeUp(2)} className="mt-4 text-muted text-lg leading-relaxed max-w-2xl">
          I&apos;m Jeremy Hopkins, KSU Alumni and AI Intern. I enjoy building stuff with new random technologies.
        </motion.p>
      </div>

      {/* ─── Education ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-8">
          <span className="marker-square" aria-hidden="true" />
          <h2 className="text-xl text-ink">My Journey</h2>
        </motion.div>

        <EducationTimeline items={educationHistory} />
      </div>

      {/* ─── Skills ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SkillsDropdown />
      </div>

      {/* ─── Resume ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ResumeSection />
      </div>

      <Footer />
    </div>
  );
}

export default About;
