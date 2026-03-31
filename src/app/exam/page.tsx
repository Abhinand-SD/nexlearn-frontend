'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { questionService, authService, answerService, ExamData } from '@/services/api';
import { logoutUser } from '@/redux/authSlice';
import ExamInterface, { AnswerState } from '@/components/ExamInterface';
import { AxiosError } from 'axios';

export default function ExamPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchExam() {
      try {
        setLoading(true);
        const data = await questionService.getList();
        setExamData(data);
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError?.response?.data?.message || 'Failed to load exam data.');
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
        <header className="bg-white px-4 md:px-8 py-3 flex justify-between items-center shadow-sm">
          {/* Spacer for flex centering - hidden on mobile */}
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
  const handleTestSubmit = async (answersObj: Record<number, AnswerState>) => {
    try {
      setIsSubmitting(true);
      setError('');

      const payloadArray = (examData?.questions || []).map((q) => {
        const qId = q.question_id as number;
        const userAnswer = answersObj[qId];
        return {
          question_id: qId,
          selected_option_id: userAnswer?.selected_option_id || null
        };
      });

      const payloadJson = JSON.stringify(payloadArray);
      const response = await answerService.submit(payloadJson);

      if (response?.success || response?.data?.success) {
        // Inject constants onto output payload from exactly the success response scope
        const resultsPayload = {
          ...(response?.data || response),
          total_marks: examData?.total_marks || 100,
          questions_count: examData?.questions_count || 100
        };

        sessionStorage.setItem('examResults', JSON.stringify(resultsPayload));

        router.replace('/results');
      } else {
        setError(response?.message || response?.data?.message || 'Failed to submit exam.');
        setHasStarted(false); // Eject back
      }
    } catch (err: unknown) {
      console.error('Submit error:', err);
      const axiosError = err as AxiosError<{ message?: string }>;
      // Fallback alert or state error mapping can go here if the component errors out
      setError(axiosError?.response?.data?.message || 'Failed to submit exam.');
      setHasStarted(false); // Eject back to dashboard to display the error visually
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExamInterface
      examData={examData}
      isSubmitting={isSubmitting}
      onLogout={handleLogout}
      onSubmitTest={handleTestSubmit}
    />
  );
}
