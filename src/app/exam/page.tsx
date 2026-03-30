'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { questionService, authService, answerService } from '@/services/api';
import { logoutUser } from '@/redux/authSlice';
import ExamInterface from '@/components/ExamInterface';

export default function ExamPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    async function fetchExam() {
      try {
        setLoading(true);
        const data = await questionService.getList();
        setExamData(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load exam data.');
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      dispatch(logoutUser());
      router.push('/');
    }
  };

  const startTest = () => {
    setHasStarted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-[#1A98B6] mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-600 font-medium">Loading Exam Data...</span>
        </div>
      </div>
    );
  }

  // --- Render Instructions Dashboard ---
  if (!hasStarted) {
    // Dynamic fallback structure adapting to potential API signature variations
    const title = examData?.title || examData?.data?.title || "Ancient Indian History MCQ";
    const totalMCQs = examData?.questions_count || 10;
    const totalMarks = examData?.total_marks || 10;
    const totalTime = examData?.total_time || "10:00";

    return (
      <div className="min-h-screen bg-[#F4F8FA] font-sans flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white px-8 py-3 flex justify-between items-center shadow-sm">
          <div className="w-24 border border-transparent" /> {/* Spacer for flex centering */}
          
          <div className="flex items-center space-x-2 justify-center flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#1A98B6" stroke="#1A98B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.42 10.922a2 2 0 0 1-.019 3.838L12.83 19.818a2 2 0 0 1-1.66 0L2.6 14.76a2 2 0 0 1-.02-3.839L11.17 6.182a2 2 0 0 1 1.66 0z" />
              <path d="M22 10v6" />
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
            </svg>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold tracking-tight text-[#0B3A5A] leading-none">NexLearn</h1>
              <span className="text-[10px] uppercase tracking-wider text-[#1A98B6] font-medium leading-none mt-1">futuristic learning</span>
            </div>
          </div>

          <div className="w-24 flex justify-end">
            <button 
              onClick={handleLogout}
              className="bg-[#1A98B6] hover:bg-[#137b94] transition-colors text-white text-sm font-medium px-6 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 flex flex-col items-center pt-10 pb-16 px-4">
          
          <h2 className="text-2xl font-medium text-slate-800 mb-6">{title}</h2>

          {/* Metrics Card */}
          <div className="bg-[#1C2A39] text-white rounded-xl shadow-lg flex flex-col sm:flex-row w-full max-w-2xl overflow-hidden mb-8">
            <div className="flex-1 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-600">
              <span className="text-sm text-slate-300 font-medium mb-2">Total MCQ's:</span>
              <span className="text-4xl font-light">{totalMCQs}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-600">
              <span className="text-sm text-slate-300 font-medium mb-2">Total marks:</span>
              <span className="text-4xl font-light">{totalMarks}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <span className="text-sm text-slate-300 font-medium mb-2">Total time:</span>
              <span className="text-4xl font-light">{totalTime}</span>
            </div>
          </div>

          {/* Instructions Block */}
          <div className="max-w-2xl w-full">
            <h3 className="text-slate-700 font-semibold mb-3">Instructions:</h3>
            {examData?.instruction ? (
              <div 
                className="prose prose-sm max-w-none text-slate-500 text-[14px] prose-ol:list-decimal prose-ol:pl-4 prose-li:mb-2.5"
                dangerouslySetInnerHTML={{ __html: examData.instruction }} 
              />
            ) : (
              <ol className="list-decimal list-outside ml-4 space-y-2.5 text-slate-500 text-[14px]">
                <li>You have {totalTime} minutes to complete the test.</li>
                <li>Test consists of {totalMCQs} multiple-choice q's.</li>
                <li>You are allowed 2 retest attempts if you do not pass on the first try.</li>
                <li>Each incorrect answer will incur a negative mark of -1/4.</li>
                <li>Ensure you are in a quiet environment and have a stable internet connection.</li>
                <li>Keep an eye on the timer, and try to answer all questions within the given time.</li>
                <li>Do not use any external resources such as dictionaries, websites, or assistance.</li>
                <li>Complete the test honestly to accurately assess your proficiency level.</li>
                <li>Check answers before submitting.</li>
                <li>Your test results will be displayed immediately after submission, indicating whether you have passed or need to retake the test.</li>
              </ol>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-10 max-w-md w-full mx-auto">
            <button 
              onClick={startTest}
              className="w-full bg-[#1C2A39] hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors shadow-md text-base"
            >
              Start Test
            </button>
            {error && <p className="text-red-500 text-center mt-3 text-sm">{error}</p>}
          </div>

        </main>
      </div>
    );
  }

  // --- Render Active Exam Dashboard ---
  const handleTestSubmit = async (answersObj: any) => {
    try {
      setLoading(true);
      setError('');
      
      const payloadArray = Object.keys(answersObj).map(questionId => {
         return {
            question_id: questionId,
            selected_option_id: answersObj[questionId].selected_option_id
         };
      });
      
      const payloadJson = JSON.stringify(payloadArray);
      await answerService.submit(payloadJson);
      
      router.replace('/results');
    } catch (err: any) {
      console.log('Submit error', err);
      // Fallback alert or state error mapping can go here if the component errors out
      setError(err?.response?.data?.message || 'Failed to submit exam.');
      setHasStarted(false); // Eject back to dashboard to display the error visually
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExamInterface 
      examData={examData} 
      onLogout={handleLogout} 
      onSubmitTest={handleTestSubmit} 
    />
  );
}
