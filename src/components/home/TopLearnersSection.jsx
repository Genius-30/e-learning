"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BorderBeam } from "@/components/magicui/border-beam";
import { cn } from "@/lib/utils";
import { Spinner } from "@heroui/react";
import api from "@/utils/axiosInstance";

export default function TopLearners() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopLearners() {
      try {
        setLoading(true);
        const response = await api.get("/courses/top-learners");
        setLearners(response.data.topLearners);
      } catch (err) {
        console.error("Error fetching top learners:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopLearners();
  }, []);

  return (
    <section className="w-full max-w-4xl mx-auto px-6 mt-20 sm:mt-28">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary">
        Our Top Achievers 🏆
      </h2>
      <p className="text-lg text-muted-foreground text-center mt-2">
        Meet some of our best learners who have excelled in their courses.
      </p>

      {loading && (
        <div className="flex items-center justify-center mt-10">
          <Spinner variant="default" color="white" size="lg" />
        </div>
      )}

      {learners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
          {learners.map((learner, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative overflow-hidden bg-card text-text border p-6 rounded-xl shadow-lg transition-all duration-300"
              )}
            >
              <h3 className="text-xl font-semibold text-center">
                {learner.name}
              </h3>
              <h4 className="text-lg text-center text-text/40">
                {learner.courseTitle}
              </h4>
              <p className="text-muted-foreground text-center mt-1">
                🎯 Completion Rate:{" "}
                <span className="font-semibold">{learner.completionRate}%</span>
              </p>

              {/* Border Beam Animations */}
              <BorderBeam
                duration={6}
                size={400}
                className="from-transparent via-red-500 to-transparent"
              />
              <BorderBeam
                duration={6}
                delay={3}
                size={400}
                className="from-transparent via-blue-500 to-transparent"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-6">
          No top learners yet. Keep learning! 🚀
        </p>
      )}
    </section>
  );
}
