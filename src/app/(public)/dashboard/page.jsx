"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CourseRecommendations from "@/components/home/CourseRecommendationsSection";
import { useAuth } from "@/context/AuthContext";
import EnrolledCoursesSection from "@/components/home/EnrolledCoursesSection";
import { Avatar } from "@heroui/react";

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Welcome");

  const { user, name } = useAuth();

  useEffect(() => {
    // Set dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <main className="min-h-screen w-full bg-background text-text overflow-hidden">
      <motion.div
        className="h-full flex flex-col items-center justify-center px-6 pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        {/* Hero Section */}
        <motion.div
          className="w-full lg:max-w-[80%] text-center flex flex-col items-center mx-auto mt-10 sm:mt-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {/* Profile Picture */}
          <motion.div
            className="w-20 h-20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Avatar
              size="lg"
              isBordered
              color="default"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || name
              )}&background=random&color=fff&size=200`}
              className="w-full h-full"
            />
          </motion.div>

          {/* Greeting Message */}
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold">
            {greeting}, {user?.name || name}! 👋
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-lg">
            Keep learning and growing. 🚀
          </p>
          {/* Enrolled Courses Section */}
          <EnrolledCoursesSection userId={user?.id} />
        </motion.div>

        {/* Course Recommendations Section */}
        <CourseRecommendations />
      </motion.div>
    </main>
  );
}
