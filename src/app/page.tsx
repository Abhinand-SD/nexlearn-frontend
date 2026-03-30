'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { authService } from '@/services/api';
import { setUser } from '@/redux/authSlice';
import Cookies from 'js-cookie';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      router.replace('/exam');
    }
  }, [router]);

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      // Ensure we append +91 or format as expected by API.
      // Assuming the API expects the raw number or nicely formatted.
      // We will send just the number if that's standard, but let's pass it as is.
       const fullMobileNumber = `+91${mobile}`;
      await authService.sendOtp(fullMobileNumber);

      // Store mobile in Redux temporarily so verify-otp can access it
      dispatch(setUser({ mobile: fullMobileNumber }));

      router.push(`/verify-otp?mobile=${fullMobileNumber}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040D1B] flex items-center justify-center p-4 font-sans">
      <div className="max-w-[900px] w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">

        {/* Left Panel */}
        <div className="md:w-1/2 bg-[#1A98B6] flex flex-col justify-between p-8 relative items-center text-white">
          <div className="flex flex-col items-center mt-4">
            <div className="flex items-center space-x-3 mb-2">
              {/* Simple Graduation Cap SVG replacing the lucide-react icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.42 10.922a2 2 0 0 1-.019 3.838L12.83 19.818a2 2 0 0 1-1.66 0L2.6 14.76a2 2 0 0 1-.02-3.839L11.17 6.182a2 2 0 0 1 1.66 0z" />
                <path d="M22 10v6" />
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NexLearn</h1>
                <p className="text-[10px] uppercase tracking-wider opacity-90 -mt-1">futuristic learning</p>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-square mt-8">
            <Image
              src="/illustration.png"
              alt="Students learning online"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter your phone number</h2>
            <p className="text-sm text-slate-500 mb-8">
              We use your mobile number to identify your account
            </p>

            <form onSubmit={handleGetStarted} className="space-y-6">
              <div className="relative">
                <div className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                  Phone number
                </div>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
                  <div className="flex items-center px-4 py-3 bg-slate-50 border-r border-slate-200">
                    <span className="text-lg mr-2">🇮🇳</span>
                    <span className="text-slate-600 font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-4 py-3 outline-none text-slate-800 font-medium bg-transparent"
                    placeholder="123 4567891"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

              <div className="mt-6 text-center">
                <p className="text-[11px] text-slate-400 mb-6">
                  By tapping Get started, you agree to the Terms & Conditions
                </p>
                <button
                  type="submit"
                  disabled={loading || mobile.length < 10}
                  className="w-full bg-[#1C2A39] hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  <span>Get Started</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
