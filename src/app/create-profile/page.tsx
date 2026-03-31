'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '@/services/api';
import { setCredentials } from '@/redux/authSlice';
import { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';

export default function CreateProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const mobile = useSelector((state: RootState) => state.auth.user?.mobile);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Kick out authenticated users back to their active session
    const token = Cookies.get('access_token');
    if (token) {
      router.replace('/exam');
      return;
    }

    // If we land here without a mobile number stored in Redux, redirect to login
    if (!mobile) {
      router.replace('/');
    }
  }, [mobile, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobile) {
      setError('Mobile number is missing. Please start over.');
      return;
    }
    
    if (!name || !qualification || !profileImage) {
      setError('Name, qualification, and profile picture are mandatory.');
      return;
    }

    try {
      setLoading(true);
      const data = await authService.createProfile(mobile, name, email, qualification, profileImage);
      
      // Update tokens from successful profile creation
      if (data.access_token) {
        dispatch(setCredentials({ 
          accessToken: data.access_token, 
          refreshToken: data.refresh_token 
        }));
      }

      router.push('/exam');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError?.response?.data?.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
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
          
          <div className="relative w-full aspect-square mt-8">
            <Image 
              src="/login_images.jpg" 
              alt="Students learning online" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Add Your Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Image Upload */}
              <div className="flex justify-center mb-2">
                {!previewUrl ? (
                  <label className="w-28 h-28 border-[1.5px] border-dashed border-slate-300 flex flex-col items-center justify-center rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors mb-2">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-500 font-medium text-center px-4 leading-tight">
                      Add Your Profile picture
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </label>
                ) : (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                    <Image 
                      src={previewUrl} 
                      alt="Profile preview" 
                      fill 
                      className="object-cover" 
                    />
                    <button 
                      type="button" 
                      onClick={removeImage} 
                      className="absolute top-1.5 right-1.5 bg-slate-900/50 backdrop-blur-sm p-1 rounded-full text-white hover:bg-slate-900/80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Name Input */}
              <div className="relative">
                <label htmlFor="name-input" className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500 z-10 pointer-events-none">
                  Name*
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-4 py-3.5 outline-none text-slate-800 font-medium bg-transparent text-sm"
                    placeholder="Enter your Full Name"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="relative">
                <label htmlFor="email-input" className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500 z-10 pointer-events-none">
                  Email
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3.5 outline-none text-slate-800 font-medium bg-transparent text-sm"
                    placeholder="Enter your Email Address"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Qualification Input */}
              <div className="relative">
                <label htmlFor="qualification-input" className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500 z-10 pointer-events-none">
                  Your qualification*
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
                  <input
                    id="qualification-input"
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="flex-1 px-4 py-3.5 outline-none text-slate-800 font-medium bg-transparent text-sm"
                    placeholder="e.g. B.Tech, MBA, 12th Pass"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !name || !qualification || !profileImage}
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
