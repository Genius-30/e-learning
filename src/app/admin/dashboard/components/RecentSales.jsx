"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addToast, Skeleton } from "@heroui/react";

export default function RecentSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const { data } = await api.get("/admin/dashboard/recent-sales");
        setSales(data.recentSales);
      } catch (err) {
        console.error("Error fetching recent sales:", err);
        addToast({
          title: "Error fetching recent sales",
          description: "Unable to fetch sales data. Please try again later.",
          type: "danger",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  return (
    <Card className="md:basis-[40%] shadow-md border border-card rounded-lg">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <ul className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <li
                key={index}
                className="flex items-center justify-between space-x-4"
              >
                <div className="w-full flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="w-full space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </li>
            ))}
          </ul>
        )}
        {!loading && sales?.length === 0 && (
          <p className="text-center text-gray-500">No recent sales</p>
        )}
        {!loading && sales.length > 0 && (
          <ul className="w-full space-y-6 overflow-auto">
            {sales.map((sale, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-x-2"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold uppercase">
                    {sale.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {sale.user.name}{" "}
                      <span className="text-gray-500 text-wrap">
                        ({sale.user.email})
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">{sale.course.title}</p>
                  </div>
                </div>
                {/* Right side (Amount Paid) */}
                <p className="font-bold text-sm">
                  ₹{sale.amount.toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
