'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { authService, SubmitResponse } from '@/services/api';
import { logoutUser } from '@/redux/authSlice';
import Cookies from 'js-cookie';

export default function ResultsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [results, setResults] = useState<(SubmitResponse & { total_marks?: number; questions_count?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Auth Check
    const token = Cookies.get('access_token');
    if (!token) {
      router.replace('/');
      return;
    }

    // Retrieve Results from Session Storage
    const storedResults = sessionStorage.getItem('examResults');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        // API might return standard wrapper or direct object
        setResults(parsed?.data || parsed);
      } catch (e) {
        console.error('Failed to parse results');
      }
    } else {
      // If we land here but no results in memory, user likely refreshed or hasn't taken it. Route back.
      router.replace('/exam');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      dispatch(logoutUser());
      sessionStorage.removeItem('examResults');
      router.push('/');
    }
  };

  const handleDone = () => {
    sessionStorage.removeItem('examResults');
    router.push('/exam'); // Or whatever the final destination is after exam completion.
  };

  if (loading || !results) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] flex items-center justify-center font-sans tracking-wide">
        <svg className="animate-spin h-8 w-8 text-[#1A98B6]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

 // 1. Safely extract the exact stats returned by the API
  const correctCount = results?.correct ?? 0;
  const incorrectCount = results?.wrong ?? 0;
  const notAttendedCount = results?.not_attended ?? 0;
  const marksObtained = results?.score ?? 0;

  // 2. BULLETPROOF CALCULATION: Total Questions = Correct + Wrong + Skipped
  const calculatedTotal = correctCount + incorrectCount + notAttendedCount;
  
  // 3. Fallback to 10 if the calculation fails, ensuring it never says 0 or 100
  const totalQuestions = calculatedTotal > 0 ? calculatedTotal : 10;
  
  // Assuming 1 mark per question based on the API payload
  const totalMarks = results?.total_marks ?? totalQuestions;

  return (
    <div className="min-h-screen bg-[#F4F8FA] font-sans flex flex-col pt-16">
      
      {/* Navbar identical to Exam */}
      <header className="fixed top-0 left-0 right-0 bg-white px-4 md:px-8 py-3 flex justify-between items-center shadow-sm z-50">
        <div className="hidden md:block w-24 border border-transparent" />
        <div className="flex items-center space-x-2 justify-start md:justify-center flex-1">
          {/* Polished Graduation Cap SVG */}
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <path fill="#0993ba" d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18C5 17.18 8.5 20.18 12 20.18C15.5 20.18 19 17.18 19 17.18V13.18L12 17L5 13.18Z" />
          </svg>
          <div className="flex flex-col justify-center pt-1">
             <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none bg-linear-to-r from-cyan-600 to-cyan-900 text-transparent bg-clip-text">NexLearn</h1>
             <p className="text-[9px] font-bold tracking-widest bg-linear-to-r from-cyan-600 to-cyan-900 text-transparent bg-clip-text -mt-0.5">futuristic learning</p>
          </div>
        </div>
        <div className="flex justify-end items-center md:w-24 shrink-0">
          <button 
            onClick={handleLogout}
            className="hidden md:block bg-[#1A98B6] hover:bg-[#137b94] transition-colors text-white text-sm font-medium px-6 py-2 rounded-md"
          >
            Logout
          </button>
          
          {/* Mobile Menu Toggle */}
          <div className="md:hidden relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#0B3A5A] p-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-2 border border-slate-100 z-50">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-5 py-2 text-red-600 hover:bg-slate-50 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Results Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        <div className="w-full max-w-sm flex flex-col items-center">
          
          {/* Top Hero Card */}
          <div className="w-full bg-linear-to-br from-[#1b4353] to-[#1C2A39] text-white rounded-xl shadow-lg flex flex-col items-center justify-center py-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none" />
            
            <p className="text-sm text-slate-300 mb-2 font-medium z-10">Marks Obtained:</p>
            <div className="flex items-baseline space-x-2 z-10">
              <span className="text-5xl font-light tracking-wide">{String(marksObtained)}</span>
              <span className="text-3xl text-slate-400 font-light">/ {totalMarks}</span>
            </div>
          </div>

          {/* Metrics List */}
          <div className="w-full space-y-3 mb-8">
            
            {/* Row 1 - Total */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center text-slate-700 font-medium">
                <div className="w-8 h-8 rounded-lg bg-[#f39c12] flex items-center justify-center mr-3 shadow-inner">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                Total Questions:
              </div>
              <span className="font-bold text-slate-900 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded">{totalQuestions}</span>
            </div>

            {/* Row 2 - Correct */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center text-slate-700 font-medium">
                <div className="w-8 h-8 rounded-lg bg-[#2ecc71] flex items-center justify-center mr-3 shadow-inner">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                Correct Answers:
              </div>
              <span className="font-bold text-slate-900 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded">{String(correctCount).padStart(3, '0')}</span>
            </div>

            {/* Row 3 - Incorrect */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center text-slate-700 font-medium">
                <div className="w-8 h-8 rounded-lg bg-[#e74c3c] flex items-center justify-center mr-3 shadow-inner">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                Incorrect Answers:
              </div>
              <span className="font-bold text-slate-900 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded">{String(incorrectCount).padStart(3, '0')}</span>
            </div>

            {/* Row 4 - Not Attended */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center text-slate-700 font-medium">
                <div className="w-8 h-8 rounded-lg bg-[#536173] flex items-center justify-center mr-3 shadow-inner">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 11h8M8 15h6M4 5h16v14H4z"></path></svg>
                </div>
                Not Attended Questions:
              </div>
              <span className="font-bold text-slate-900 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded">{String(notAttendedCount).padStart(3, '0')}</span>
            </div>

          </div>

          <button 
            onClick={handleDone}
            className="w-full bg-[#1C2A39] hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl shadow-md transition-colors text-base"
          >
            Done
          </button>
        </div>
      </main>
    </div>
  );
}
