"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import FeaturesSection from "@/components/home/FeaturesSection";
import TopLearners from "@/components/home/TopLearnersSection";
import CourseRecommendations from "@/components/home/CourseRecommendationsSection";
import TrustedCompaniesSection from "@/components/home/TrustedCompaniesSection";
import { ChevronRightIcon } from "lucide-react";
import { RatingsSection } from "@/components/home/RatingsSection";
import { useModal } from "@/context/ModalContext";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { onOpen } = useModal();
  const [animationComplete, setAnimationComplete] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setAnimationComplete(true);
    }, 2500);
  });

  return (
    <main className="min-h-screen w-full bg-background text-text overflow-hidden">
      {/* Startup Animation */}
      {!animationComplete && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.7 }}
        >
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={120}
              height={120}
              priority
              fetchPriority="high"
              className="rounded-full"
            />
          </motion.div>
          <motion.p
            className="mt-4 text-lg font-semibold opacity-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Welcome to E-Learning
          </motion.p>
        </motion.div>
      )}

      {/* Landing Page Content */}
      <motion.div
        className="h-full flex flex-col items-center justify-center px-6 pt-6"
        initial={{ opacity: 0 }}
        animate={animationComplete ? { opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        {/* Hero Image */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={animationComplete ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Image
            src="https://res.cloudinary.com/dgzee4v9w/image/upload/v1746251009/6364b6fd26e2983c58b93d94_3d-cv-education_zeymhi.png"
            alt="Learning Online"
            width={600}
            height={400}
            className="rounded-lg"
          />
        </motion.div>

        {/* Hero Section */}
        <motion.div
          className="w-full max-w-4xl text-center flex flex-col items-center mt-10 sm:mt-10"
          initial={{ y: 30, opacity: 0 }}
          animate={animationComplete ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Unlock Your Learning Potential 🎓
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-lg">
            Learn from experts, anytime, anywhere.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button
              variant="shadow"
              color="primary"
              className="h-11 w-[150px]"
              onPress={onOpen}
            >
              Get Started <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="bordered"
              className="h-11 w-[150px]"
              onPress={() => router.push("/courses")}
            >
              Explore Courses
            </Button>
          </div>
        </motion.div>

        {/* Features Section */}
        <FeaturesSection />

        {/* Top Learners Section */}
        <TopLearners />

        {/* Course Recommendations Section */}
        <CourseRecommendations />

        {/* Ratings Section */}
        <RatingsSection />

        {/* Trusted Companies Section */}
        <TrustedCompaniesSection />
      </motion.div>
    </main>
  );
}
