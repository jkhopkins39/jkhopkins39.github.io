import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { contactInfo } from "../config/socialLinks";

const LAST_UPDATED = "August 21, 2026";

const DataDeletion: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-accent text-[13px] font-mono uppercase tracking-widest">
            Legal
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold leading-[1.1] tracking-tight text-ink font-sans">
            Data Deletion Instructions
          </h1>
          <p className="mt-2 text-muted-2 text-xs">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed max-w-2xl">
            How to request deletion of personal data Hoppy Tech holds about you,
            including data from Facebook Login and Hoppy Social.
          </p>
        </motion.div>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-24"
      >
        <div className="max-w-3xl space-y-10">
          <section>
            <h2 className="text-xl font-bold text-ink mb-3 font-sans">
              Request deletion by email
            </h2>
            <div className="space-y-4 text-muted text-[15px] sm:text-base leading-relaxed">
              <p>
                Email{" "}
                <a
                  href={`mailto:${contactInfo.email}?subject=Data%20deletion%20request`}
                  className="text-accent hover:text-accent-light transition-colors underline-offset-2 hover:underline"
                >
                  {contactInfo.email}
                </a>{" "}
                with the subject line{" "}
                <strong className="text-ink font-medium">
                  Data deletion request
                </strong>
                .
              </p>
              <p>In the body, include:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your full name</li>
                <li>The email address you used with us (if any)</li>
                <li>
                  If this relates to Hoppy Social / Facebook: the Facebook Page
                  name you connected, and that you want your Hoppy Social account
                  data deleted
                </li>
                <li>
                  Optionally, a Facebook profile URL or Messenger conversation
                  context so we can locate the right records
                </li>
              </ul>
              <p>
                We will confirm receipt, verify the request is from you, and
                delete (or de-identify) associated personal data within{" "}
                <strong className="text-ink font-medium">30 days</strong>, unless
                a short legal retention period applies (for example, invoice or
                tax records). We will reply with confirmation when the deletion
                is complete.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3 font-sans">
              What we delete
            </h2>
            <div className="space-y-4 text-muted text-[15px] sm:text-base leading-relaxed">
              <p>Depending on which products you used, this may include:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Website inquiry, quote, referral, and chat-assistant records
                </li>
                <li>
                  Hoppy Social operator identifiers (such as Messenger PSIDs),
                  Page connection records, and stored Page access tokens we hold
                  for your connected Page
                </li>
                <li>
                  Media and drafts you sent through Hoppy Social for posting,
                  and related automation / approval-queue records tied to your
                  account
                </li>
              </ul>
              <p>
                Content already published on a Facebook Page remains under that
                Page&rsquo;s control on Meta&rsquo;s platform. Removing data from
                Hoppy Tech does not automatically remove posts from Facebook; you
                (or a Page admin) can delete those posts in Meta&rsquo;s tools.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3 font-sans">
              Remove Hoppy Social via Facebook
            </h2>
            <div className="space-y-4 text-muted text-[15px] sm:text-base leading-relaxed">
              <p>
                You can also disconnect the app from Facebook. On Facebook, go
                to{" "}
                <strong className="text-ink font-medium">
                  Settings &amp; privacy → Settings → Apps and websites
                </strong>
                , find Hoppy Social (or Hoppy Tech), and remove it. That revokes
                Facebook authorization. For full deletion of data we store,
                still send the email request above so we can purge our systems.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3 font-sans">
              Related policy
            </h2>
            <div className="space-y-4 text-muted text-[15px] sm:text-base leading-relaxed">
              <p>
                For what we collect and why, see our{" "}
                <Link
                  to="/privacy"
                  className="text-accent hover:text-accent-light transition-colors underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>

          <section
            className="mt-4 pt-10 border-t"
            style={{ borderTopColor: "var(--border-color)" }}
          >
            <h2 className="text-xl font-bold text-ink mb-3 font-sans">Contact</h2>
            <div className="space-y-4 text-muted text-[15px] sm:text-base leading-relaxed">
              <p>
                <span className="text-ink font-medium">Hoppy Tech LLC</span>
                <br />
                <a
                  href={`mailto:${contactInfo.email}?subject=Data%20deletion%20request`}
                  className="text-accent hover:text-accent-light transition-colors underline-offset-2 hover:underline"
                >
                  {contactInfo.email}
                </a>
                <br />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-accent hover:text-accent-light transition-colors underline-offset-2 hover:underline"
                >
                  {contactInfo.phone}
                </a>
              </p>
            </div>
          </section>
        </div>
      </motion.article>

      <Footer />
    </div>
  );
};

export default DataDeletion;
