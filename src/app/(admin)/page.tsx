import type { Metadata } from "next";
import { MessageMetrics } from "@/components/Report/MessageMetrics";
import React from "react";
import MonthlyTarget from "@/components/Report/MonthlyTarget";
import MonthlySalesChart from "@/components/Report/MonthlySalesChart";
import StatisticsChart from "@/components/Report/StatisticsChart";
import RecentOrders from "@/components/Report/RecentOrders";
// import DemographicCard from "@/components/Report/DemographicCard";

export const metadata: Metadata = {
  title:
    "ChatLinker",
  description: "Affordable WhatsApp API",
};

export default function Ecommerce() {
  return (

    <div className="col-span-12 space-y-6 xl:col-span-7">
      <MessageMetrics />
    </div>

    // <div className="grid grid-cols-12 gap-4 md:gap-6">
    //   <div className="col-span-12 space-y-6 xl:col-span-7">
    //     <MessageMetrics />

    //     <MonthlySalesChart />
    //   </div>

    //   <div className="col-span-12 xl:col-span-5">
    //     <MonthlyTarget />
    //   </div>

    //   <div className="col-span-12">
    //     <StatisticsChart />
    //   </div>

    //   <div className="col-span-12 xl:col-span-5">
    //     <DemographicCard />
    //   </div>

    //   <div className="col-span-12 xl:col-span-7">
    //     <RecentOrders />
    //   </div>
    // </div>
  );
}
