'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Instance {
  _id: string;
  name?: string;
  key: string;
  connected: boolean;
  authorized: boolean;
  type: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Helper functions
const truncateId = (id: string) =>
  id.length > 8 ? `${id.substring(0, 4)}...${id.substring(id.length - 4)}` : id;
const getLast4 = (str: string) =>
  str.length > 4 ? str.substring(str.length - 4) : str;

export default function InstancesDashboard() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInstances = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`${BASE_URL}/api/v1/instance/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Parse instances data
        const instancesData = Array.isArray(data)
          ? data
          : data?.instances && Array.isArray(data.instances)
          ? data.instances
          : Object.values(data);

        const processedInstances: Instance[] = instancesData.map((instance: any) => ({
          _id: instance._id,
          name: instance.name || 'Instance',
          key: instance.key || '',
          connected: !!instance.connected,
          authorized: !!instance.authorized,
          type: instance.type || 'DEFAULT',
        }));

        setInstances(processedInstances);
      } catch {
        setError('Failed to fetch instances');
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  const handleCreateInstance = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v1/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      if (response.ok) {
        const newInstance: Instance = {
          _id: data.instance._id,
          name: data.instance.name || 'New Instance',
          key: data.instance.key || data.instance._id,
          connected: !!data.instance.connected,
          authorized: false,
          type: data.instance.type || 'DEFAULT',
        };
        setInstances((prev) => [...prev, newInstance]);
      } else {
        console.error('Error creating instance:', data);
      }
    } catch (err) {
      console.error('Request failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-100 rounded-lg m-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.length ? (
          instances.map((instance) => (
            <div
              key={instance._id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer border border-gray-700 hover:border-green-500 hover:shadow-green-900/20 transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => router.push(`/instance/${instance.key}`)}
            >
              <div className="p-6">
                {/* Status Indicator */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${instance.connected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-xs font-medium text-gray-400">
                      {instance.connected ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-md bg-gray-700 text-xs font-medium text-gray-300">
                    {instance.type}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex items-start space-x-4">
                  <div 
                    className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                      instance.authorized ? 'bg-green-900/30' : 'bg-gray-700'
                    }`}
                  >
                    <svg 
                      className={`w-7 h-7 ${instance.authorized ? 'text-green-400' : 'text-gray-400'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{instance.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center bg-gray-700/50 rounded-md px-2 py-1">
                        <span className="text-gray-400 text-xs font-medium mr-1">ID:</span>
                        <span className="text-gray-300 text-xs font-mono">{truncateId(instance._id)}</span>
                      </div>
                      <div className="flex items-center bg-gray-700/50 rounded-md px-2 py-1">
                        <span className="text-gray-400 text-xs font-medium mr-1">Key:</span>
                        <span className="text-gray-300 text-xs font-mono">••••{getLast4(instance.key)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">
                    {instance.authorized 
                      ? "Full access enabled" 
                      : "Limited access mode"}
                  </p>
                  <button 
                    className={`text-white px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                      instance.authorized 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Your upgrade handler here
                    }}
                  >
                    {instance.authorized ? 'Manage' : 'Upgrade'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center p-6 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No instances found</p>
          </div>
        )}

        {/* Create Instance Card */}
        <div
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:bg-gray-700 border border-dashed border-green-500/50 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
          onClick={handleCreateInstance}
        >
          <div className="p-6 flex flex-col items-center justify-center h-full min-h-48">
            <div className="w-16 h-16 bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-500 mb-2">Create new instance</h3>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              Add a new instance to manage your connections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}