"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Define the shape of each message record
interface MessageRecord {
  _id: string;
  monthYear: string;
  instance: string;
  user: string;
  __v: number;
  createdAt: string;
  messagesReceived: number;
  messagesSent: number;
}

// Define the prop type for the component
interface MonthlySalesChartProps {
  messageData: MessageRecord[];
}

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart({ messageData }: MonthlySalesChartProps) {
  // State for dropdown open/close
  const [isOpen, setIsOpen] = useState(false);
  // Toggle between "sent" and "received" report types
  const [reportType, setReportType] = useState<"sent" | "received">("sent");
  // State for the processed 12-month data
  const [processedData, setProcessedData] = useState<MessageRecord[]>([]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Generate complete 12-month dataset
  useEffect(() => {
    const generateLastTwelveMonthsData = () => {
      const currentDate = new Date();
      const last12Months: MessageRecord[] = [];
      
      // Create a map of existing data for quick lookup
      const existingDataMap = new Map<string, MessageRecord>();
      messageData.forEach(item => {
        existingDataMap.set(item.monthYear, item);
      });
      
      // Generate data for the last 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Use existing data if available, otherwise create placeholder with zeros
        if (existingDataMap.has(monthYear)) {
          last12Months.unshift(existingDataMap.get(monthYear)!);
        } else {
          // Create placeholder with zeros for missing months
          last12Months.unshift({
            _id: `placeholder-${monthYear}`,
            monthYear,
            instance: messageData.length > 0 ? messageData[0].instance : "",
            user: messageData.length > 0 ? messageData[0].user : "",
            __v: 0,
            createdAt: new Date().toISOString(),
            messagesReceived: 0,
            messagesSent: 0
          });
        }
      }
      
      setProcessedData(last12Months);
    };
    
    generateLastTwelveMonthsData();
  }, [messageData]);

  // Format month labels for better readability
  const formatMonthLabel = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year.slice(2)}`;
  };

  // Categories for the x-axis are the formatted monthYear values
  const categories = processedData.map(item => formatMonthLabel(item.monthYear));

  // Compute the series data based on the selected report type
  const seriesData = processedData.map(item =>
    reportType === "sent" ? item.messagesSent : item.messagesReceived
  );

  // Chart options for the bar chart
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: { text: undefined },
      min: 0,
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: reportType === "sent" ? "Messages Sent" : "Messages Received",
      data: seriesData,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Report - {reportType === "sent" ? "Sent" : "Received"}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType("sent")}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              reportType === "sent"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setReportType("received")}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              reportType === "received"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Received
          </button>
        </div>
        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}