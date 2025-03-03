"use client";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import { User } from "@/types/user";
import createApiClient from "@/utis/axiosClient";
import React, { useState, useEffect } from "react";


export default function Profile() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    setLoading(true);
    const apiClient = await createApiClient();
    const response = await apiClient.get(`/api/v1/user/me`);
    setUserProfile(response.data);
    setLoading(false);
    
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          userProfile && <UserInfoCard user={userProfile} />
        )}
          {/* <UserMetaCard /> */}
          {/* <UserAddressCard /> */}
        </div>
      </div>
    </div>
  );
}
