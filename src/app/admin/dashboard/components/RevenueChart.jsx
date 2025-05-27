"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addToast, Skeleton } from "@heroui/react";
import api from "@/utils/axiosInstance";

export default function RevenueChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const { data } = await api.get("/admin/dashboard/revenue");
        setData(data.revenueData);
      } catch (err) {
        console.log("Error fetching revenue data:", err);
        addToast({
          title: "Error fetching revenue",
          description: "Could not load revenue data. Please try again later.",
          type: "danger",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, []);

  return (
    <Card className="md:basis-[60%] bg-background p-4 shadow-md rounded-lg border-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text">
          Revenue Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 sm:px-4">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "8px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  color: "#666",
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#6366F1" radius={8}>
                <LabelList
                  position="top"
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="leading-none text-sm text-muted-foreground">
          Showing total revenue for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
