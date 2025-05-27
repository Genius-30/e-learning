"use client";

import { Accordion, AccordionItem } from "@heroui/react";

const faqs = [
  {
    question: "How do I sign up?",
    answer:
      "To sign up, click on the 'Sign Up' button on the homepage and fill out the form with your details.",
  },
  {
    question: "How can I reset my password?",
    answer:
      "Click on the 'Forgot Password' link on the login page to reset your password.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer refunds within 30 days of purchase, subject to our refund policy.",
  },
  {
    question: "What courses do you offer?",
    answer:
      "We offer a variety of courses, including programming, web development, and data science. Check out our courses page for more details.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

      <Accordion variant="shadow">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            aria-label={faq.question}
            title={faq.question}
          >
            <p className="mt-2 text-text/60">{faq.answer}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
