"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

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

export const MessageMetrics: React.FC = () => {
  const [data, setData] = useState<MessageMetricsData>({
    totalMessagesSent: 0,
    totalMessagesReceived: 0,
    totalMessages: 0,
    messageData: []
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
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get<MessageMetricsData>('http://localhost:3000/api/v1/report/messages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setData(response.data);
        
        // You could calculate percentage changes here based on historical data
        // For demo purposes using placeholder values
        setSentPercentageChange(11.01);
        setReceivedPercentageChange(-9.05);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching message metrics:', err);
        
        // Handle the error with proper typing
        if (err instanceof Error) {
          setError(err.message);
        } else if (axios.isAxiosError(err)) {
          // For Axios specific errors
          const axiosError = err as AxiosError;
          setError(axiosError.message || 'Failed to fetch message metrics');
        } else {
          setError('An unknown error occurred');
        }
        
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading metrics...</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading metrics...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <p className="text-error-500">Error: {error}</p>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Messages Sent
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.totalMessagesSent.toLocaleString()}
            </h4>
          </div>
          <Badge color={sentPercentageChange >= 0 ? "success" : "error"}>
            {sentPercentageChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(sentPercentageChange).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Messages Received
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.totalMessagesReceived.toLocaleString()}
            </h4>
          </div>
          <Badge color={receivedPercentageChange >= 0 ? "success" : "error"}>
            {receivedPercentageChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(receivedPercentageChange).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};