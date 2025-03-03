import type { Metadata } from "next";
import { MessageMetrics } from "@/components/Report/MessageMetrics";
import React from "react";
import MonthlyTarget from "@/components/Report/MonthlyTarget";
import MonthlySalesChart from "@/components/Report/MonthlySalesChart";
import StatisticsChart from "@/components/Report/StatisticsChart";
import RecentOrders from "@/components/Report/RecentOrders";
import DemographicCard from "@/components/Report/DemographicCard";

export const metadata: Metadata = {
  title: "ChatLinker",
  description: "Affordable WhatsApp API",
};

export default function Ecommerce() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top row - Message metrics for immediate KPI visibility */}
        <div className="col-span-12">
          <MessageMetrics />
        </div>
        
        {/* Main content area with responsive grid */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Primary chart */}
          <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <MonthlySalesChart />
          </div>
          
          {/* Secondary full-width visualization */}
          <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <StatisticsChart />
          </div>
          
          {/* Detailed data table */}
          <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <RecentOrders />
          </div>
        </div>
        
        {/* Right sidebar with supplementary info */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Target metrics card */}
          <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm h-full">
            <MonthlyTarget />
          </div>
          
          {/* Demographic insights */}
          <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm h-full">
            <DemographicCard />
          </div>
        </div>
      </div>
    </div>
  );
}