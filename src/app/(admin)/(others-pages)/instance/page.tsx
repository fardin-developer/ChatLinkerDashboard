'use client';
/// pages/instances/index.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";

interface Instance {
  id: string;
  name?: string;
  status: string;
  authorized: boolean;
  type: string;
}

export default function InstancesDashboard() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [token, setToken] = useState<string | null>(null)

  const router = useRouter();


  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // setToken(token);

        
        const response = await axios.get('http://localhost:3000/api/v1/instance/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Handle different possible response structures
        let instancesData = [];
        if (Array.isArray(response.data)) {
          instancesData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with instances property
          if (Array.isArray(response.data.instances)) {
            instancesData = response.data.instances;
          } else {
            // If it's an object with instance data directly
            const keys = Object.keys(response.data);
            if (keys.length > 0) {
              // Convert object to array if needed
              instancesData = keys.map(key => ({
                id: key,
                ...(typeof response.data[key] === 'object' ? response.data[key] : {}),
              }));
            }
          }
        }
        
        console.log('Parsed instances data:', instancesData);
        setInstances(instancesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch instances');
        setLoading(false);
        console.error('Error fetching instances:', err);
      }
    };

    fetchInstances();
  }, []);

  useEffect(() => {
    // Debug log to help diagnose issues
    console.log('Current instances state:', instances);
  }, [instances]);

  const handleCreateInstance = async () => {
    console.log('Create instance clicked');
  
    // Retrieve the latest token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/v1/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({}), 
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Instance created successfully:', data);
  
        // Ensure correct data structure before updating state
        const newInstance = {
          id: data.instance.id,  
          name: data.instance.key || 'New Instance',
          status: 'Active', 
          authorized: false, 
          type: 'DEFAULT', 
        };
  
        // Update the instances state with the new instance
        setInstances((prevInstances) => [...prevInstances, newInstance]);
      } else {
        console.error('Error creating instance:', data);
      }
    } catch (error) {
      console.error('Request failed:', error);
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
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          onClick={() => setLoading(true)}
        >
          Retry
        </button>
      </div>
    );
  }

  // Safety check - if instances is not an array, show fallback
  if (!Array.isArray(instances)) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-yellow-800 text-yellow-200 p-4 rounded-lg mb-6">
          <p>Unable to display instances. Data format unexpected.</p>
          <p className="text-sm mt-2">Received: {JSON.stringify(instances).substring(0, 100)}...</p>
        </div>
        
        {/* Create Instance Card */}
        <div 
          className="rounded-lg overflow-hidden shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition duration-300 max-w-md mx-auto"
          onClick={handleCreateInstance}
        >
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-500">Create an instance</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.length > 0 ? instances.map((instance) => (
          <div key={instance.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg" onClick={() => router.push(`http://localhost:3001/instance/${instance.id}`)}>
            <div className="p-5">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{instance.name || instance.id}</h3>
                  <p className="text-gray-400 text-sm">{instance.id}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${instance.authorized ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                  {instance.authorized ? 'Authorized' : 'Not Authorized'}
                </span>
                <span className="text-green-400 uppercase text-sm font-medium">{instance.type || 'DEVELOPER'}</span>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-400 text-sm">The instance works with restrictions</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
                  Upgrade
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center p-6 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No instances found</p>
          </div>
        )}
        
        {/* Create Instance Card */}
        <div 
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition duration-300"
          onClick={handleCreateInstance}
        >
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-500">Create an instance</h3>
          </div>
        </div>
      </div>
    </div>
  );
}