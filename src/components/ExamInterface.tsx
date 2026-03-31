'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { ExamData, OptionData } from '@/services/api';

export interface AnswerState {
  selected_option_id: number | null;
  status: string;
}

interface ExamInterfaceProps {
  examData: ExamData | null;
  isSubmitting: boolean;
  onLogout: () => void;
  onSubmitTest: (answers: Record<number, AnswerState>) => void;
}

export default function ExamInterface({ examData, isSubmitting, onLogout, onSubmitTest }: ExamInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Time in seconds
  const [timeLeft, setTimeLeft] = useState(() => {
    // examData.total_time is string "90:00" or number 90 or 10
    let mins = 10;
    if (examData?.total_time || examData?.duration) {
      const t = examData.total_time || examData.duration;
      if (typeof t === 'number') mins = t;
      else if (typeof t === 'string' && t.includes(':')) {
        mins = parseInt(t.split(':')[0], 10);
      } else if (typeof t === 'string') {
        mins = parseInt(t, 10);
      }
    }
    return mins * 60;
  });

  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  
  const [isComprehensionModalOpen, setIsComprehensionModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const questions = examData?.questions || [];
  const totalQuestions = examData?.questions_count || questions.length || 10;
  const currentQuestion = questions[currentIndex] || {};
  const questionId = currentQuestion?.question_id || currentQuestion?.id || currentIndex;

  useEffect(() => {
    // Initialize unvisited status for the first question if empty
    if (!answers[questionId]) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: { selected_option_id: null, status: 'unvisited' }
      }));
    }
  }, [currentIndex, questionId, answers]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOptionSelect = (optionId: number) => {
    setAnswers((prev) => {
      const currentStatus = prev[questionId as number]?.status || 'unvisited';
      // If we select an option, and status was just unvisited/not_attended, mark as attended
      // If it was marked_for_review, it becomes answered_and_marked
      let newStatus = currentStatus;
      if (currentStatus === 'marked_for_review') {
        newStatus = 'answered_and_marked';
      } else if (currentStatus === 'unvisited' || currentStatus === 'not_attended') {
        newStatus = 'attended';
      }
      
      return {
        ...prev,
        [questionId]: {
          selected_option_id: optionId,
          status: newStatus as any
        }
      };
    });
  };

  const handleNext = () => {
    setAnswers(prev => {
      const currentAns = prev[questionId] || { selected_option_id: null, status: 'unvisited' };
      let newStatus = currentAns.status;
      
      // If no option selected and not marked for review -> not_attended
      if (currentAns.status === 'unvisited') {
        newStatus = currentAns.selected_option_id ? 'attended' : 'not_attended';
      }
      
      return {
        ...prev,
        [questionId]: {
          ...currentAns,
          status: newStatus as any
        }
      };
    });
    
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsComprehensionModalOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsComprehensionModalOpen(false);
    }
  };

  const handleMarkForReview = () => {
    setAnswers(prev => {
      const currentAns = prev[questionId] || { selected_option_id: null, status: 'unvisited' };
      const newStatus = currentAns.selected_option_id ? 'answered_and_marked' : 'marked_for_review';
      
      return {
        ...prev,
        [questionId]: {
          ...currentAns,
          status: newStatus
        }
      };
    });
    
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsComprehensionModalOpen(false);
    }
  };

  const jumpToQuestion = (index: number) => {
    // Optionally mark current as not_attended before jumping if untouched
    setAnswers(prev => {
      const currentAns = prev[questionId] || { selected_option_id: null, status: 'unvisited' };
      if (currentAns.status === 'unvisited') {
        return {
          ...prev,
          [questionId as number]: { ...currentAns, status: currentAns.selected_option_id ? 'attended' : 'not_attended' }
        };
      }
      return prev;
    });
    
    setCurrentIndex(index);
    setIsComprehensionModalOpen(false);
  };

  const handleFinalSubmit = () => {
    onSubmitTest(answers);
  };

  // Status computation for modals
  const answeredCount = Object.values(answers).filter(a => a.status === 'attended' || a.status === 'answered_and_marked').length;
  const reviewCount = Object.values(answers).filter(a => a.status === 'marked_for_review' || a.status === 'answered_and_marked').length;

  return (
    <div className="min-h-screen bg-[#F4F8FA] font-sans flex flex-col pt-16">
      {/* Top Navbar Fixed */}
      <header className="fixed top-0 left-0 right-0 bg-white px-8 py-3 flex justify-between items-center shadow-sm z-50">
        <div className="flex-1 flex items-center justify-start border border-transparent">
           <h2 className="text-[#0B3A5A] font-semibold text-lg hidden sm:block truncate pr-4">
             {examData?.title || 'Ancient Indian History MCQ'}
           </h2>
        </div>
        
        <div className="flex items-center space-x-2 justify-center flex-1">
          {/* Polished Graduation Cap SVG */}
          <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-md">
            <path fill="#0993ba" d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18C5 17.18 8.5 20.18 12 20.18C15.5 20.18 19 17.18 19 17.18V13.18L12 17L5 13.18Z" />
          </svg>
          <div className="flex flex-col justify-center pt-1">
             <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none bg-linear-to-r from-cyan-600 to-cyan-900 text-transparent bg-clip-text">NexLearn</h1>
             <p className="text-[9px] font-bold tracking-widest bg-linear-to-r from-cyan-600 to-cyan-900 text-transparent bg-clip-text -mt-0.5">futuristic learning</p>
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center">
          <button 
            onClick={onLogout}
            className="bg-[#1A98B6] hover:bg-[#137b94] transition-colors text-white text-sm font-medium px-5 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <main className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto px-4 py-6 gap-6 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Column (Question Area) */}
        <div className="flex-2 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* Header Row of Question */}
          <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
             <span className="text-slate-800 font-medium">Question {currentIndex + 1} of {totalQuestions}</span>
             <span className="bg-white border border-slate-300 text-slate-700 font-semibold px-3 py-1 rounded-md text-sm">
               {currentIndex + 1} / {totalQuestions}
             </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
            
            {/* Comprehension Toggle */}
            {currentQuestion.comprehension && (
              <button 
                onClick={() => setIsComprehensionModalOpen(true)}
                className="mb-6 bg-[#1A98B6] hover:bg-[#158099] text-white text-sm font-medium px-4 py-2 rounded-md shadow flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                Read Comprehensive Paragraph
              </button>
            )}

            {/* Question Text */}
            <div className="text-slate-800 text-lg leading-relaxed mb-6">
              {currentIndex + 1}. {currentQuestion.question || "Identify the missing text for this generated question."}
            </div>

            {/* Optional Image */}
            {currentQuestion.image && (
              <div className="mb-8 relative w-full max-w-lg h-64 rounded-lg overflow-hidden border border-slate-200">
                <Image src={currentQuestion.image} alt="Question figure" fill className="object-cover" />
              </div>
            )}

            {/* Options */}
            <div className="space-y-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">Choose the answer:</p>
              
              {(currentQuestion.options || []).map((opt: OptionData, idx: number) => {
                const isSelected = answers[questionId]?.selected_option_id === opt.id;
                return (
                  <label 
                    key={opt.id || idx}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'border-[#1C2A39] bg-slate-50' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-slate-700 font-medium">{opt.option || opt.text || opt.option_text}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${
                      isSelected ? 'border-[#1C2A39]' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1C2A39]" />}
                    </div>
                    {/* Native hidden input */}
                    <input 
                      type="radio" 
                      name={`question_${questionId}`} 
                      value={opt.id} 
                      className="hidden" 
                      checked={isSelected}
                      onChange={() => handleOptionSelect(opt.id)}
                    />
                  </label>
                );
              })}
            </div>
            {/* Action Buttons (Inside flow) */}
            <div className="mt-10 flex items-center gap-2 sm:gap-4 shrink-0 overflow-x-auto pb-2 custom-scrollbar">
              <button 
                onClick={handleMarkForReview}
                className="bg-[#6f1d5d] hover:bg-[#581649] text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap flex-1 md:flex-none text-sm"
              >
                Mark for review
              </button>
              
              <div className="hidden md:block flex-1" />
              
              <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-8 py-3 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none text-sm sm:text-base"
              >
                Previous
              </button>
              <button 
                onClick={handleNext}
                className="bg-[#1C2A39] hover:bg-slate-800 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors shadow-sm flex-1 md:flex-none text-sm sm:text-base"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Navigation Grid) */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-[320px]">
          
          <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
             <span className="text-slate-800 font-medium">Question No. Sheet:</span>
             <div className="flex items-center bg-[#1C2A39] text-white px-4 py-1.5 rounded-md shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="font-mono text-lg font-medium tracking-wide">{formatTime(timeLeft)}</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Mapping the grid using Array of totalQuestions */}
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const qId = questions[i]?.question_id || questions[i]?.id || i;
                const status = answers[qId]?.status || 'unvisited';
                const isCurrent = currentIndex === i;
                
                // Color Logic
                let bgColor = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                if (status === 'attended') bgColor = 'bg-[#2ecc71] border-[#2ecc71] text-white';
                if (status === 'not_attended') bgColor = 'bg-[#e74c3c] border-[#e74c3c] text-white';
                if (status === 'marked_for_review') bgColor = 'bg-[#8e44ad] border-[#8e44ad] text-white';
                if (status === 'answered_and_marked') bgColor = 'bg-[#8e44ad] border-[#8e44ad] text-white';

                return (
                  <button
                    key={i}
                    onClick={() => jumpToQuestion(i)}
                    className={`relative w-full aspect-square flex items-center justify-center rounded-lg border text-sm font-semibold transition-transform ${bgColor} ${isCurrent ? 'ring-2 ring-offset-2 ring-[#0B3A5A] scale-105 shadow-md' : 'shadow-sm'}`}
                  >
                    {i + 1}
                    {/* Checkmark indicator for Answered & Marked */}
                    {status === 'answered_and_marked' && (
                      <div className="absolute -top-1.5 -right-1.5 bg-[#2ecc71] w-4 h-4 rounded-full border-2 border-white flex items-center justify-center pointer-events-none">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Legend Map */}
            <div className="mt-8 flex flex-wrap justify-between gap-y-4 gap-x-2 text-xs font-medium text-slate-500">
              <div className="flex items-center w-[45%]"><div className="w-3 h-3 bg-[#2ecc71] rounded-sm mr-2"></div>Attended</div>
              <div className="flex items-center w-[45%]"><div className="w-3 h-3 bg-[#e74c3c] rounded-sm mr-2"></div>Not Attended</div>
              <div className="flex items-center w-[45%]"><div className="w-3 h-3 bg-[#8e44ad] rounded-sm mr-2"></div>Marked</div>
              <div className="flex items-center w-[45%] relative">
                <div className="w-3 h-3 bg-[#8e44ad] rounded-sm mr-2 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                Ans & Marked
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 shrink-0 bg-[#F8FAFC]">
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-[#1C2A39] hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>

      </main>

      {/* Comprehension Modal Overlay */}
      {isComprehensionModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-semibold text-slate-800 text-lg">Comprehensive Paragraph</h3>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar text-slate-700 leading-relaxed text-[15px] space-y-4 whitespace-pre-wrap">
              {currentQuestion.comprehension || "No comprehension text provided for this fragment."}
            </div>
            <div className="px-8 py-5 bg-white flex justify-end">
              <button 
                onClick={() => setIsComprehensionModalOpen(false)} 
                className="bg-[#1C2A39] hover:bg-slate-800 text-white w-48 py-3 rounded-lg shadow-sm font-medium transition-colors"
              >
                Minimize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Are you sure you want to submit?</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center text-slate-600 font-medium">
                  <svg className="w-5 h-5 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Remaining Time:
                </div>
                <span className="font-bold text-slate-800">{formatTime(timeLeft)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center text-slate-600 font-medium">
                  <div className="w-5 h-5 rounded bg-[#f39c12] mr-3" />
                  Total Questions:
                </div>
                <span className="font-bold text-slate-800">{totalQuestions}</span>
              </div>
              
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center text-slate-600 font-medium">
                  <div className="w-5 h-5 rounded bg-[#2ecc71] mr-3" />
                  Questions Answered:
                </div>
                <span className="font-bold text-slate-800">{String(answeredCount).padStart(3, '0')}</span>
              </div>

              <div className="flex justify-between items-center p-3">
                <div className="flex items-center text-slate-600 font-medium">
                  <div className="w-5 h-5 rounded bg-[#8e44ad] mr-3" />
                  Marked for review:
                </div>
                <span className="font-bold text-slate-800">{String(reviewCount).padStart(3, '0')}</span>
              </div>
            </div>
            <div className="p-6 pt-2">
              <button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting}
                className="w-full bg-[#1C2A39] hover:bg-slate-800 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Test"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hide global scrollbar for app shell feel */}
      <style dangerouslySetInnerHTML={{__html: `
        body { overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
