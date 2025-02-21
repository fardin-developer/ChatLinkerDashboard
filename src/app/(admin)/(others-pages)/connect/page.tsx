'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const QRCodePage = () => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to connect WhatsApp');
  const [connectionStatus, setConnectionStatus] = useState('initial'); // 'initial', 'pending', 'connected', 'failed'
  const [connectionId, setConnectionId] = useState('');

  const createConnection = async () => {
    setLoading(true);
    setStatus('Creating connection...');
    
    try {
      const token = await localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/v1/qr/get_qr_code?token=${token}`);
      
      if (!response.ok) throw new Error('Failed to create connection');
      
      const data = await response.json();
      console.log(data.data.sessionId);
      
      setConnectionId(data.data.sessionId);
      setQrCode(data.data.qrCodeUrl);
      setConnectionStatus('pending');
      setStatus('Scan with WhatsApp to connect');
      setLoading(false);
      
      // Start checking connection status after QR code is displayed
      checkConnectionStatus();
    } catch (error) {
      console.error('Error creating connection:', error);
      setStatus('Failed to create connection. Please try again.');
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      if (!connectionId) {
        throw new Error('Connection ID not found');
      }
      
      setLoading(true);
      setStatus('Refreshing QR code...');
      
      const token = await localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/v1/qr/get_qr_code?token=${token}&connectionId=${connectionId}`);
      
      if (!response.ok) throw new Error('Failed to fetch QR code');
      
      const data = await response.json();
      setQrCode(data.data.qrCodeUrl);
      setStatus('Scan with WhatsApp to connect');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setStatus('Failed to load QR code. Please try again.');
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    // Initial 5 second wait to give user time to scan
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Then check connection status every 5 seconds until connected or maximum retries reached
    let retries = 0;
    const maxRetries = 22; // 1 minute (12 x 5 seconds)
    
    const statusCheck = async () => {
      try {
        const token = await localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3000/api/v1/qr/get-status?sessionId=${connectionId}`);
        
        if (!response.ok) throw new Error('Failed to check connection status');
        
        const data = await response.json();
        
        if (data.data.status === 'connected') {
          setConnectionStatus('connected');
          setStatus('WhatsApp connected successfully!');
          return true; // Success, stop checking
        } else if (retries >= maxRetries) {
          setStatus('Connection timed out. Please try again.');
          return true; // Stop checking after max retries
        }
        
        retries++;
        return false; // Continue checking
      } catch (error) {
        console.error('Error checking connection status:', error);
        setStatus('Failed to verify connection. Please try again.');
        return true; // Stop checking on error
      }
    };
    
    // Keep checking status until connected or max retries reached
    const intervalId = setInterval(async () => {
      const shouldStop = await statusCheck();
      if (shouldStop) {
        clearInterval(intervalId);
      }
    }, 5000);
  };

  useEffect(() => {
    // Only refresh QR code periodically if in pending state
    if (connectionStatus === 'pending') {
      const interval = setInterval(() => {
        // fetchQRCode();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [connectionStatus, connectionId]);

  const handleRefresh = () => {
    fetchQRCode();
  };

  const resetConnection = () => {
    setQrCode('');
    setConnectionId('');
    setConnectionStatus('initial');
    setStatus('Ready to connect WhatsApp');
    setLoading(false);
  };

  // Render different views based on connection status
  const renderContent = () => {
    switch (connectionStatus) {
      case 'initial':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-6 rounded-full bg-green-100 p-6">
              <svg className="h-12 w-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
                <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411zm-8.43 18.297c-1.785 0-3.539-.47-5.069-1.359l-.364-.214-3.765.986.999-3.68-.235-.374c-.978-1.55-1.495-3.329-1.495-5.155.001-5.356 4.368-9.73 9.761-9.73 2.609 0 5.055 1.016 6.887 2.857 1.839 1.845 2.86 4.285 2.86 6.896-.003 5.402-4.367 9.773-9.753 9.773z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Connect Your WhatsApp Account</h2>
            <p className="mb-6 max-w-sm text-center text-gray-600">
              Link your WhatsApp account to use our services. This allows you to send and receive messages through our platform.
            </p>
            <button
              onClick={createConnection}
              className="flex items-center rounded-lg bg-green-500 px-6 py-3 text-white transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <span className="mr-2">Create Connection</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        );
        
      case 'pending':
        return (
          <>
            <p className="mb-6 text-center text-gray-600">
              Scan the QR code with your WhatsApp to link your account
            </p>
            
            <div className="relative mx-auto mb-6 h-64 w-64 overflow-hidden rounded-lg border-4 border-gray-100 p-2 shadow-inner">
              {loading ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-50">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                </div>
              ) : qrCode ? (
                <Image 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-50">
                  <p className="text-center text-red-500">QR code unavailable</p>
                </div>
              )}
            </div>
            
            <p className="mb-6 text-center font-medium text-gray-700">{status}</p>
            
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-medium text-gray-700">How to connect:</h3>
              <div className="flex items-start text-sm">
                <div className="mr-2 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p className="text-gray-600">Open WhatsApp on your phone</p>
              </div>
              <div className="flex items-start text-sm">
                <div className="mr-2 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p className="text-gray-600">Tap Menu or Settings and select Linked Devices</p>
              </div>
              <div className="flex items-start text-sm">
                <div className="mr-2 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p className="text-gray-600">Point your phone camera at this screen to scan the QR code</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center space-x-4">
              <button 
                onClick={handleRefresh}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Refresh QR Code
              </button>
              <button 
                onClick={resetConnection}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </>
        );
        
      case 'connected':
        return (
          <div className="mb-6 flex flex-col items-center justify-center py-4">
            <div className="mb-4 rounded-full bg-green-100 p-4">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-green-600">Successfully Connected!</h2>
            <p className="mb-6 max-w-sm text-center text-gray-600">
              Your WhatsApp account is now linked to our service. You can start sending and receiving messages.
            </p>
            <div className="flex items-start rounded-lg bg-blue-50 p-4 text-blue-800">
              <svg className="mr-3 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">
                Your connection ID: <span className="font-mono font-medium">{connectionId}</span>
              </p>
            </div>
            <button 
              onClick={resetConnection}
              className="mt-6 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Disconnect & Start Over
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">WhatsApp Connection</h1>
      
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-center">
          <div className="mr-3 rounded-full bg-green-500 p-2">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
              <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411zm-8.43 18.297c-1.785 0-3.539-.47-5.069-1.359l-.364-.214-3.765.986.999-3.68-.235-.374c-.978-1.55-1.495-3.329-1.495-5.155.001-5.356 4.368-9.73 9.761-9.73 2.609 0 5.055 1.016 6.887 2.857 1.839 1.845 2.86 4.285 2.86 6.896-.003 5.402-4.367 9.773-9.753 9.773z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Connect WhatsApp</h2>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default QRCodePage;