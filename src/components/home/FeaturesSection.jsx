"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with hands-on experience.",
    icon: <CheckCircle className="text-primary" size={32} />,
  },
  {
    title: "Lifetime Access",
    description: "Once purchased, courses are yours forever—no extra fees.",
    icon: <CheckCircle className="text-primary" size={32} />,
  },
  {
    title: "High-Quality Video Lectures",
    description: "Easy-to-follow video lessons you can watch anytime.",
    icon: <CheckCircle className="text-primary" size={32} />,
  },
  {
    title: "Secure & Private Learning",
    description: "Screen recording and screenshots are blocked for security.",
    icon: <CheckCircle className="text-primary" size={32} />,
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-6 text-center mt-20 sm:mt-28">
      <motion.h2
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Why Choose CyberGrow?
      </motion.h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 bg-background rounded-2xl shadow-md flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            {feature.icon}
            <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
            <p className="text-gray-500 mt-2">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
