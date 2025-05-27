export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Help & Support</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">📌 Getting Started</h2>
        <p className="text-text/60">
          If you're new, check out our{" "}
          <a href="/faq" className="text-blue underline">
            FAQ
          </a>{" "}
          page to get started with the most common questions.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">💡 Technical Issues</h2>
        <p className="text-text/60">
          If you are experiencing bugs or technical difficulties, try refreshing
          your browser or clearing your cache. Still having trouble? Reach out
          to us using the form below.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">📬 Contact Support</h2>
        <p className="text-text/60 mb-4">
          For personalized help, contact our support team at:
        </p>
        <ul className="text-text/60 list-disc ml-5">
          <li>
            Email:{" "}
            <a
              href="mailto:e-learningsupport@gmail.com"
              className="text-blue underline"
            >
              cybergrowsupport@gmail.com
            </a>
          </li>
          <li>Phone: +91-XXXXXXXXXX (if applicable)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">📘 Resources</h2>
        <ul className="text-text/60 list-disc ml-5 space-y-2">
          <li>
            <a href="/terms" className="text-blue underline">
              Terms of Service
            </a>
          </li>
          <li>
            <a href="/privacy-policy" className="text-blue underline">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/contact" className="text-blue underline">
              Contact Us
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
