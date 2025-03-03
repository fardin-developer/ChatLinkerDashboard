"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { User } from "@/types/user";

export default function UserInfoCard({ user }: { user: User }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [showApiKey, setShowApiKey] = useState(false);
  
  // const handleSave = () => {
  //   // Handle save logic here
  //   console.log("Saving changes...");
  //   closeModal();
  // };
  
  const toggleApiKey = () => {
    setShowApiKey(!showApiKey);
  };
  
  const copyApiKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    // You could add a toast notification here
    console.log("API key copied to clipboard");
  };
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {/* <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4> */}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                API Key
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-grow relative">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 pr-16 overflow-hidden text-ellipsis whitespace-nowrap">
                    {showApiKey ? user.apiKey : "••••••••••••••••••••••••••"}
                  </p>
                  <button
                    onClick={toggleApiKey}
                    className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showApiKey ? (
                        // Hide icon
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.99989 12C3.99989 11.5858 4.33568 11.25 4.74989 11.25C5.16411 11.25 5.49989 11.5858 5.49989 12C5.49989 14.8995 7.60039 17 10.4999 17C13.3994 17 15.4999 14.8995 15.4999 12C15.4999 9.10051 13.3994 7.00001 10.4999 7.00001C9.3395 7.00001 8.25328 7.41082 7.40381 8.11582C7.09211 8.37504 6.63486 8.33052 6.37564 8.01883C6.11642 7.70713 6.16093 7.24988 6.47263 6.99066C7.56875 6.08334 8.98908 5.50001 10.4999 5.50001C14.2278 5.50001 16.9999 8.27208 16.9999 12C16.9999 15.7279 14.2278 18.5 10.4999 18.5C6.77199 18.5 3.99989 15.7279 3.99989 12ZM9.99989 12C9.99989 11.4477 10.4476 11 10.9999 11C11.5522 11 11.9999 11.4477 11.9999 12C11.9999 12.5523 11.5522 13 10.9999 13C10.4476 13 9.99989 12.5523 9.99989 12Z"
                          fill="currentColor"
                        />
                      ) : (
                        // Show icon
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12ZM12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11Z"
                          fill="currentColor"
                        />
                      )}
                    </svg>
                  </button>
                </div>
                <button
                  onClick={copyApiKey}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Copy API key"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2 4.5C2 3.11929 3.11929 2 4.5 2H11.5C12.8807 2 14 3.11929 14 4.5V6H16.5C17.8807 6 19 7.11929 19 8.5V19.5C19 20.8807 17.8807 22 16.5 22H9.5C8.11929 22 7 20.8807 7 19.5V18H4.5C3.11929 18 2 16.8807 2 15.5V4.5ZM7 16.5V8.5C7 7.11929 8.11929 6 9.5 6H12V4.5C12 4.22386 11.7761 4 11.5 4H4.5C4.22386 4 4 4.22386 4 4.5V15.5C4 15.7761 4.22386 16 4.5 16H7V16.5ZM9.5 8C9.22386 8 9 8.22386 9 8.5V19.5C9 19.7761 9.22386 20 9.5 20H16.5C16.7761 20 17 19.7761 17 19.5V8.5C17 8.22386 16.7761 8 16.5 8H9.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" defaultValue={user.name} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" defaultValue={user.email} />
                  </div>

                  {/* <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" defaultValue="+09 363 398 46" />
                  </div> */}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" disabled>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}