// app/(admin)/DashboardClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageMetrics } from "@/components/Report/MessageMetrics";
import MonthlyLimit from "@/components/Report/MonthlyTarget";
import MonthlySalesChart from "@/components/Report/MonthlySalesChart";
import StatisticsChart from "@/components/Report/StatisticsChart";
// import RecentOrders from "@/components/Report/RecentOrders";

// Define interface for the data structure
interface MessageMetricsData {
  totalMessagesSent: number;
  totalMessagesReceived: number;
  totalMessages: number;
  messageData: Array<{
    _id: string;
    monthYear: string;
    instance: string;
    user: string;
    __v: number;
    createdAt: string;
    messagesReceived: number;
    messagesSent: number;
  }>;
}
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function DashboardClient() {
  const [data, setData] = useState<MessageMetricsData>({
    totalMessagesSent: 0,
    totalMessagesReceived: 0,
    totalMessages: 0,
    messageData: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default percentage values (could be calculated from historical data later)
  const [sentPercentageChange, setSentPercentageChange] = useState<number>(0);
  const [receivedPercentageChange, setReceivedPercentageChange] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get<MessageMetricsData>(
          `${BASE_URL}/api/v1/report/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(response.data);
        // For demo purposes using placeholder values
        setSentPercentageChange(11.01);
        setReceivedPercentageChange(-9.05);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching message metrics:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (axios.isAxiosError(err)) {
          setError(err.message || "Failed to fetch message metrics");
        } else {
          setError("An unknown error occurred");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <p className="text-error-500">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <MessageMetrics 
          totalMessagesSent={data.totalMessagesSent}
          totalMessagesReceived={data.totalMessagesReceived}
          sentPercentageChange={sentPercentageChange}
          receivedPercentageChange={receivedPercentageChange}
        />
        <MonthlySalesChart messageData={ data.messageData} />
      </div>

      <div className="col-span-12 xl:col-span-5">
      <MonthlyLimit messagedata={data.messageData} />
      </div>

      <div className="col-span-12">
      <StatisticsChart messageData={data.messageData} />

      </div>

      {/* <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}
