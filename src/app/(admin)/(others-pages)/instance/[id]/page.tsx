'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface Instance {
  _id: string;
  key: string;
  connected: boolean;
  createdAt: string;
  name?: string;
  phoneNumber?: string;
  stats?: {
    messagesReceived?: number;
    messagesSent?: number;
    totalContacts?: number;
    activeChats?: number;
  };
}

interface QRCodeResponse {
  success: boolean;
  data: {
    sessionId: string;
    qrCodeUrl: string;
  }
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'expired';

export default function InstanceDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [disconnecting, setDisconnecting] = useState(false);
  
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrExpireTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
  
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    
    return token;
  }, []);

  const createApiClient = useCallback(() => {
    const token = getAuthToken();
    return axios.create({
      baseURL: `${BASE_URL}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }, [getAuthToken]);

  const fetchInstanceDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const apiClient = createApiClient();
      const response = await apiClient.get(`/instance/${id}`);
      
      if (response.data && response.data.instance) {
        setInstance(response.data.instance);
        setConnectionStatus(response.data.instance.connected ? 'connected' : 'disconnected');
      } else {
        throw new Error('Invalid instance data received');
      }
    } catch (err) {
      console.error('Error fetching instance details:', err);
      setError('Failed to fetch instance details');
    } finally {
      setLoading(false);
    }
  }, [id, createApiClient]);

  const cleanupIntervals = useCallback(() => {
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    
    if (qrExpireTimeoutRef.current) {
      clearTimeout(qrExpireTimeoutRef.current);
      qrExpireTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchInstanceDetails();
    return () => {
      cleanupIntervals();
    };
  }, [fetchInstanceDetails, cleanupIntervals]);

  const handleConnectWhatsapp = async () => {
    try {
      cleanupIntervals();
      setConnectionStatus('connecting');
      const apiClient = createApiClient();
      const response = await apiClient.post<QRCodeResponse>('/qr/get_qr_code', {
        instance_key: id
      });
      
      if (response.data.success && response.data.data.qrCodeUrl) {
        setQrCode(response.data.data.qrCodeUrl);
        
        connectionCheckIntervalRef.current = setInterval(async () => {
          try {
            const statusResponse = await apiClient.get(`/instance/${id}`);
            if (statusResponse.data.instance.connected) {
              setConnectionStatus('connected');
              setQrCode(null);
              setInstance(statusResponse.data.instance);
              cleanupIntervals();
            }
          } catch (err) {
            console.error('Error checking connection status:', err);
          }
        }, 5000);
        
        qrExpireTimeoutRef.current = setTimeout(() => {
          if (connectionStatus !== 'connected') {
            setConnectionStatus('expired');
            cleanupIntervals();
          }
        }, 60000); // 1 minute
      }
    } catch (err) {
      console.error('Error connecting to WhatsApp:', err);
      setConnectionStatus('disconnected');
      setError('Failed to initiate WhatsApp connection');
    }
  };

  const handleDisconnectWhatsapp = async () => {
    try {
      setDisconnecting(true);
      const apiClient = createApiClient();
      await apiClient.post(`/instance/disconnect/`, {
        instance_key: id
      });
      await fetchInstanceDetails();
      setDisconnecting(false);
    } catch (err) {
      console.error('Error disconnecting WhatsApp:', err);
      setError('Failed to disconnect WhatsApp');
      setDisconnecting(false);
    }
  };

  // Removed useCallback wrapper to avoid missing dependency warning.
  const handleReloadQrCode = () => {
    setQrCode(null);
    setConnectionStatus('disconnected');
    handleConnectWhatsapp();
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Instance</h1>
            <p className="text-gray-400">{instance.key}</p>
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
                    connectionStatus === 'connected'
                      ? 'bg-green-500'
                      : connectionStatus === 'connecting'
                      ? 'bg-yellow-500'
                      : connectionStatus === 'expired'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}></div>
                  <span className="text-white font-medium">
                    {connectionStatus === 'connected'
                      ? 'Connected'
                      : connectionStatus === 'connecting'
                      ? 'Connecting...'
                      : connectionStatus === 'expired'
                      ? 'QR Code Expired'
                      : 'Disconnected'}
                  </span>
                </div>

                {connectionStatus === 'connected' ? (
                  <div>
                    <p className="text-gray-300 mb-6">
                      Your WhatsApp is connected and ready to use. You can disconnect at any time.
                    </p>
                    <button
                      onClick={handleDisconnectWhatsapp}
                      disabled={disconnecting}
                      className={`px-6 py-3 rounded-md font-medium text-white transition ${
                        disconnecting ? 'bg-red-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {disconnecting ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-300 mb-6">
                      Connect your WhatsApp account to start using this instance. 
                      Scan the QR code with your phone to link your WhatsApp account.
                    </p>
                    {connectionStatus === 'expired' ? (
                      <button
                        onClick={handleReloadQrCode}
                        className="px-6 py-3 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                      >
                        Reload QR Code
                      </button>
                    ) : (
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
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                {connectionStatus === 'connecting' && qrCode ? (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block mb-3">
                      <Image 
                        src={qrCode}
                        alt="WhatsApp QR Code" 
                        width={256}
                        height={256}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-gray-400 text-sm">Scan with WhatsApp to connect</p>
                  </div>
                ) : connectionStatus === 'expired' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-orange-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-orange-400 font-medium text-lg mb-1">QR Code Expired</h3>
                      <p className="text-orange-300/70 text-sm">Please reload to get a new QR code</p>
                    </div>
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
                      <p className="text-gray-400">Click &quot;Connect WhatsApp&quot; to begin</p>
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
                    <td className="px-6 py-4 text-white">{instance._id}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Instance Key</th>
                    <td className="px-6 py-4 text-white">{instance.key}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Name</th>
                    <td className="px-6 py-4 text-white">{instance.name || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Connection</th>
                    <td className="px-6 py-4">
                      <span className={`flex items-center ${instance.connected ? 'text-green-400' : 'text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${instance.connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {instance.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 bg-gray-700/30 text-gray-300 font-medium">Created At</th>
                    <td className="px-6 py-4 text-white">
                      {instance.createdAt ? new Date(instance.createdAt).toLocaleString() : '-'}
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
