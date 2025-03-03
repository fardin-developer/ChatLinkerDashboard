"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import createApiClient from "@/utis/axiosClient";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function AdminLayout({
  
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter();


useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/signin"); 
      }
    }
  }, []);
  
  const fetchLoggedInUser = async () => {
    const apiClient = await createApiClient();
    const response = await apiClient.get(`/api/v1/user/me`);
    localStorage.setItem(
      "userData", 
      JSON.stringify({
        name: response.data.name,
        email: response.data.email
      }));
  };

  useEffect(() => {
    fetchLoggedInUser();
  }, []);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">{children}</div>
      </div>
    </div>
  );
}
