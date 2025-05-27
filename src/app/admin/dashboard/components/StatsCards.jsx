"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { Skeleton, addToast } from "@heroui/react";
import { Book, Users, UserPlus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get("/admin/dashboard/stats");
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        addToast({
          title: "Error fetching stats",
          description: "Unable to fetch statistics. Please try again later.",
          type: "danger",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statItems = stats
    ? [
        {
          title: "Total Courses",
          value: stats.totalCourses,
          icon: <Book size={20} />,
          change: `+${stats.newCourses} new courses this month`,
        },
        {
          title: "Active Users",
          value: stats.activeUsers,
          icon: <Activity size={20} />,
          change: `+${stats.newActiveUsers} active users this month`,
        },
        {
          title: "Total Students",
          value: stats.totalStudents,
          icon: <Users size={20} />,
          change: `+${stats.newStudents} new students this month`,
        },
        {
          title: "New Enrollments",
          value: stats.newEnrollments,
          icon: <UserPlus size={20} />,
          change: `+${stats.enrollmentGrowth} compared to last month`,
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {loading
        ? Array(4)
            .fill(0)
            .map((_, index) => (
              <Card
                key={index}
                className="w-full space-y-5 p-4 rounded-lg shadow-md border border-card"
              >
                <Skeleton className="rounded-lg">
                  <div className="h-5 bg-default-300 rounded-lg" />
                </Skeleton>
                <div className="space-y-3">
                  <Skeleton className="w-3/5 rounded-lg">
                    <div className="h-10 w-3/5 bg-default-200 rounded-lg" />
                  </Skeleton>
                  <Skeleton className="w-[75%] rounded-lg">
                    <div className="h-3 w-full bg-default-300 rounded-lg" />
                  </Skeleton>
                </div>
              </Card>
            ))
        : statItems.map((stat, index) => (
            <Card
              key={index}
              className="bg-[--color-background] py-4 text-[--color-text] shadow-md border border-card rounded-lg transition-all hover:bg-[--color-hover]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="text-[--color-secondary]">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-zinc-400 font-semibold mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
    </div>
  );
}
