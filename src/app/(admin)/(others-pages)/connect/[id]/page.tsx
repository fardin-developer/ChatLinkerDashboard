'use client'
// pages/instances/[id].tsx
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface InstanceDetails {
  id: string;
  name?: string;
  status: string;
  authorized: boolean;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  phoneNumber?: string;
  deviceDetails?: {
    platform?: string;
    deviceManufacturer?: string;
    deviceModel?: string;
    osVersion?: string;
    batteryLevel?: number;
    isConnected?: boolean;
  };
  stats?: {
    messagesReceived?: number;
    messagesSent?: number;
    totalContacts?: number;
    activeChats?: number;
  };
}

export default function InstanceDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [instance, setInstance] = useState<InstanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    if (!id) return;

    const fetchInstanceDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`http://localhost:3000/api/v1/instance/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setInstance(response.data);
        setConnectionStatus(response.data.deviceDetails?.isConnected ? 'connected' : 'disconnected');
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch instance details');
        setLoading(false);
        console.error('Error fetching instance details:', err);
      }
    };

    fetchInstanceDetails();
  }, [id]);

  const handleConnectWhatsapp = async () => {
    try {
      setConnectionStatus('connecting');
      const token = localStorage.getItem('authToken');
      
      // This would be your actual API endpoint to get QR code
      const response = await axios.post(`http://localhost:3000/api/v1/instance/${id}/connect`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Assuming the API returns a QR code string
      setQrCode(response.data.qrCode);
      
      // In a real implementation, you would listen for connection events
      // Here we'll simulate that with a timeout
      const checkConnectionInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`http://localhost:3000/api/v1/instance/${id}/status`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (statusResponse.data.connected) {
            clearInterval(checkConnectionInterval);
            setConnectionStatus('connected');
            setQrCode(null);
            // Refresh instance details
            const detailsResponse = await axios.get(`http://localhost:3000/api/v1/instance/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setInstance(detailsResponse.data);
          }
        } catch (err) {
          console.error('Error checking connection status:', err);
        }
      }, 5000);
      
      // For demo purposes, we'll clear the interval after 30 seconds
      setTimeout(() => clearInterval(checkConnectionInterval), 30000);
      
    } catch (err) {
      setConnectionStatus('disconnected');
      setError('Failed to initiate WhatsApp connection');
      console.error('Error connecting to WhatsApp:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl text-red-400 font-semibold mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <div className="mt-4">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl text-yellow-400 font-semibold mb-2">Instance Not Found</h2>
          <p className="text-yellow-300">The requested instance could not be found.</p>
          <div className="mt-4">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {instance.name || `Instance ${instance.id}`}
            </h1>
            <p className="text-gray-400">{instance.id}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition mr-2"
            >
              Back
            </button>
            <button 
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
              onClick={() => router.push(`/instances/${id}/settings`)}
            >
              Settings
            </button>
          </div>
        </div>

        {/* WhatsApp Connection Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">WhatsApp Connection</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-white font-medium">
                    {connectionStatus === 'connected' ? 'Connected' : 
                     connectionStatus === 'connecting' ? 'Connecting...' :
                     'Disconnected'}
                  </span>
                </div>

                {connectionStatus === 'connected' && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Device Information</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>Phone: {instance.phoneNumber || 'Unknown'}</p>
                      <p>Device: {instance.deviceDetails?.deviceManufacturer || 'Unknown'} {instance.deviceDetails?.deviceModel || ''}</p>
                      <p>Platform: {instance.deviceDetails?.platform || 'Unknown'} {instance.deviceDetails?.osVersion || ''}</p>
                      <p>Battery: {instance.deviceDetails?.batteryLevel ? `${instance.deviceDetails.batteryLevel}%` : 'Unknown'}</p>
                    </div>
                  </div>
                )}

                {connectionStatus !== 'connected' && (
                  <div>
                    <p className="text-gray-300 mb-6">
                      Connect your WhatsApp account to start using this instance. 
                      Scan the QR code with your phone to link your WhatsApp account.
                    </p>
                    <button
                      onClick={handleConnectWhatsapp}
                      disabled={connectionStatus === 'connecting'}
                      className={`px-6 py-3 rounded-md font-medium text-white transition ${
                        connectionStatus === 'connecting'
                          ? 'bg-yellow-700 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect WhatsApp'}
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                {connectionStatus === 'connecting' && qrCode ? (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block mb-3">
                      {/* In a real app, you would render the QR code here */}
                      <div className="w-64 h-64 bg-gray-800 flex items-center justify-center">
                        <p className="text-gray-400 text-sm px-4">QR Code would display here</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Scan with WhatsApp to connect</p>
                  </div>
                ) : connectionStatus === 'connected' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-green-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-green-400 font-medium text-lg mb-1">Successfully Connected</h3>
                      <p className="text-green-300/70 text-sm">Your WhatsApp account is linked and ready to use</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-gray-700/30 border border-gray-700 rounded-lg p-8 text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400">Click "Connect WhatsApp" to begin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instance Details Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Instance Details</h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Instance ID</th>
                    <td className="px-6 py-4 text-white">{instance.id}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Name</th>
                    <td className="px-6 py-4 text-white">{instance.name || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Type</th>
                    <td className="px-6 py-4">
                      <span className="text-green-400 uppercase font-medium">{instance.type || 'DEVELOPER'}</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Status</th>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${instance.authorized ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                        {instance.authorized ? 'Authorized' : 'Not Authorized'}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Connection</th>
                    <td className="px-6 py-4">
                      <span className={`flex items-center ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Created At</th>
                    <td className="px-6 py-4 text-white">
                      {instance.createdAt ? new Date(instance.createdAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Last Updated</th>
                    <td className="px-6 py-4 text-white">
                      {instance.updatedAt ? new Date(instance.updatedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Usage Stats */}
            {instance.stats && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Usage Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Messages Sent</p>
                    <p className="text-white text-2xl font-semibold">{instance.stats.messagesSent?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Messages Received</p>
                    <p className="text-white text-2xl font-semibold">{instance.stats.messagesReceived?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Contacts</p>
                    <p className="text-white text-2xl font-semibold">{instance.stats.totalContacts?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Active Chats</p>
                    <p className="text-white text-2xl font-semibold">{instance.stats.activeChats?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}