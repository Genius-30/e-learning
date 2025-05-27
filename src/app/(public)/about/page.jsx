import TrustedCompaniesSection from "@/components/home/TrustedCompaniesSection";
import { Button, Link } from "@heroui/react";
import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">About E-Learning</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-text/60">
          E-Learning was founded with a passion to revolutionize digital
          learning. We started with a simple idea—to make high-quality education
          accessible, engaging, and career-driven. Today, we're building one of
          India's most impactful e-learning platforms.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-text/60">
          To empower learners with industry-relevant skills, helping them grow
          personally and professionally through affordable and practical
          education.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
        <p className="text-text/60">
          To become a global leader in personalized and practical e-learning,
          transforming the future of education.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Core Values</h2>
        <ul className="list-disc list-inside text-text/60">
          <li>Quality Education</li>
          <li>Student Success</li>
          <li>Innovation & Growth</li>
          <li>Honesty & Transparency</li>
          <li>Empathy & Community</li>
        </ul>
      </section>

      <section className="text-center mt-16">
        <p className="text-text/60">Want to connect with us?</p>
        <Button
          showAnchorIcon
          as={Link}
          color="primary"
          href=""
          variant="solid"
          className="mt-2"
        >
          Contact Us
        </Button>
      </section>

      <TrustedCompaniesSection />
    </div>
  );
}
