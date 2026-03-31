'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '@/services/api';
import { setCredentials } from '@/redux/authSlice';
import { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const reduxMobile = useSelector((state: RootState) => state.auth.user?.mobile);
  const [mobile, setMobile] = useState<string>('');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Kick out authenticated users back to their active session
    const token = Cookies.get('access_token');
    if (token) {
      router.replace('/exam');
      return;
    }

    // Priority: URL query param, fallback to Redux state
    const queryMobile = searchParams.get('mobile');
    if (queryMobile) {
      setMobile(queryMobile);
    } else if (reduxMobile) {
      setMobile(reduxMobile);
    } else {
      // If directly accessed without mobile, redirect back to login
      router.replace('/');
    }
  }, [searchParams, reduxMobile, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }

    try {
      setLoading(true);

      // 1. Strip all non-digit characters (including spaces that used to be plus signs)
      // 2. Grab exactly the last 10 digits
      const cleanNumber = mobile.replace(/\D/g, '').slice(-10);

      // 3. Force the perfect format
      const formattedMobile = `+91${cleanNumber}`;

      // 4. Call the API
      const data = await authService.verifyOtp(formattedMobile, otp);

      if (data.success !== false) {
        if (data.login === false) {
          // NEW USER: Do NOT save tokens (they are undefined). 
          // Route directly to profile creation.
          router.push('/create-profile');
        } else {
          // EXISTING USER: Save tokens securely and route to exam.
          dispatch(setCredentials({
            accessToken: data.access_token,
            refreshToken: data.refresh_token
          }));
          router.push('/exam');
        }
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError('');

      const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
      const formattedMobile = `+91${cleanNumber}`;

      await authService.sendOtp(formattedMobile);
      // Optional: Show a brief success message
      alert('OTP resent successfully!');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError?.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-[#040D1B] flex items-center justify-center p-4 font-sans">
      <div className="max-w-[900px] w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">

        {/* Left Panel */}
        <div className="md:w-1/2 bg-[#0993ba] flex flex-col justify-between p-8 relative items-center text-white">
          <div className="flex flex-col items-center mt-4 z-10">
            <div className="flex items-center space-x-3 mb-2">
              {/* Polished Graduation Cap SVG */}
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path fill="white" d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18C5 17.18 8.5 20.18 12 20.18C15.5 20.18 19 17.18 19 17.18V13.18L12 17L5 13.18Z" />
              </svg>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white">NexLearn</h1>
                <p className="text-[10px] font-bold tracking-widest text-white opacity-90 -mt-1">futuristic learning</p>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[250px] md:h-auto md:aspect-square mt-8">
            <Image
              src="/login_images.jpg"
              alt="Students learning online"
              fill
              className="object-contain md:object-cover mix-blend-normal"
              priority
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter the code we texted you</h2>
            <p className="text-sm text-slate-500 mb-8">
              We've sent an SMS to +91 {mobile.replace(/\D/g, '').slice(-10)}
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="relative">
                <label 
                  htmlFor="otp-input" 
                  className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500 z-10 transition-colors pointer-events-none"
                >
                  SMS code
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-4 py-3 outline-none text-slate-800 font-medium bg-transparent tracking-widest text-lg"
                    placeholder="123 456"
                    required
                    aria-label="One-time password"
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="space-y-4 pt-1">
                <p className="text-[11px] text-slate-500 leading-tight">
                  Your 6 digit code is on its way. This can sometimes take a few moments to arrive.
                </p>

                <div>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm font-semibold text-slate-800 hover:text-slate-600 underline underline-offset-2"
                  >
                    Resend code
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
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

export default function VerifyOtpScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040D1B] flex items-center justify-center text-white">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
