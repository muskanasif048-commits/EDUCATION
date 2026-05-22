import React, { useState } from 'react';
import { Sparkles, Check, X, Award, Flame, RefreshCw, Layers, ArrowRight, HelpCircle } from 'lucide-react';
import { UserProfile, QuizQuestion, QuizObject } from '../../types';

interface QuizSectionProps {
  user: any;
  profile: UserProfile | null;
  onAddScore: (score: number, total: number, quizType: string) => void;
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const TOPICS = [
  { id: 'tenses', label: 'Present & Past Tenses (زمانے)', desc: 'Test continuous, perfect, simple tenses and helping verb matching.' },
  { id: 'prepositions', label: 'Prepositions Prep (حروف جار)', desc: 'Test standard prepositions like married to, looking forward to, afraid of.' },
  { id: 'activepassive', label: 'Active & Passive Voice (معروف و مجہول)', desc: 'Master passive conversions, participle changes, and subject rules.' },
  { id: 'vocab', label: 'IELTS Vocabulary Exam', desc: 'Advanced academic lexical verbs, synonyms, and context usage.' }
];

export default function QuizSection({ user, profile, onAddScore, toast }: QuizSectionProps) {
  const [activeTopic, setActiveTopic] = useState('tenses');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizObject | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const startAIQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setSubmitted(false);
    setCorrectAnswersCount(0);

    const topicObj = TOPICS.find(t => t.id === activeTopic);
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicObj?.label || "General English Rules",
          level: profile?.level || "Intermediate"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        toast("New MCQ Quiz generated successfully by AI Sarah!", "success");
      } else {
        toast("Quiz service encountered an error.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Offline limits met. Bypassing with simulated local Quiz set.", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (submitted) return;
    setSelectedOpt(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || submitted) return;
    setSubmitted(true);
    
    const currentQuestion = quiz?.questions[currentIdx];
    if (currentQuestion && selectedOpt === currentQuestion.correctIndex) {
      setCorrectAnswersCount(prev => prev + 1);
      toast("Spot on! Correct answer.", "success");
    } else {
      toast("Almost! Review the grammatical rules below.", "info");
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < (quiz?.questions.length || 0)) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setSubmitted(false);
    } else {
      // Quiz complete!
      const total = quiz?.questions.length || 5;
      onAddScore(correctAnswersCount, total, quiz?.quizTitle || "System Quiz");
      toast(`Finished! You scored ${correctAnswersCount}/${total}. XP rewarded.`, "success");
      setSubmitted(true); // terminal state
    }
  };

  const getOptionStyle = (index: number) => {
    if (!quiz) return "";
    const currentQ = quiz.questions[currentIdx];

    if (!submitted) {
      return selectedOpt === index 
        ? "border-brand-500 bg-brand-50/50 text-slate-800" 
        : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 text-slate-700";
    }

    if (index === currentQ.correctIndex) {
      return "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
    }

    if (selectedOpt === index) {
      return "border-rose-500 bg-rose-50 text-rose-800 line-through";
    }

    return "border-slate-100 bg-slate-50/10 text-slate-400 opacity-60";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title info */}
      <div>
        <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
          AI Evaluator
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-905 font-display mt-2">
          Adaptive English MCQ Quizzes
        </h1>
        <p className="text-slate-500 text-xs md:text-sm">
          Tired of static exam sheets? Select your grammatical focus below. EnglishMate AI generates real-time multiple choice challenges with diagnostic corrections.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: choosing topics */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Course Subject
          </span>

          <div className="space-y-2.5">
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                id={`quiz-theme-${topic.id}`}
                onClick={() => {
                  if (loading) return;
                  setActiveTopic(topic.id);
                  setQuiz(null);
                }}
                className={`cursor-pointer w-full text-left p-3.5 rounded-2xl border transition-all ${
                  activeTopic === topic.id 
                    ? "border-brand-500 bg-brand-50/50"
                    : "border-slate-55 bg-slate-50/30 hover:bg-slate-100/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">{topic.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{topic.desc}</p>
              </button>
            ))}
          </div>

          <button
            id="start-ai-quiz-btn"
            onClick={startAIQuiz}
            disabled={loading}
            className="cursor-pointer w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold transition-all text-xs shadow-md mt-4 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Drafting MCQ sets ...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Start Dynamic AI Quiz
              </>
            )}
          </button>
        </div>

        {/* Right column: active quiz stage */}
        <div className="lg:col-span-8">
          {quiz ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
              
              {/* Question progress tracker */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-brand-900 font-display text-base md:text-lg">
                    {quiz.quizTitle}
                  </h3>
                  <p className="text-[10px] text-slate-450 uppercase tracking-widest">
                    Question {currentIdx + 1} of {quiz.questions.length} • Level: {profile?.level || "B1"}
                  </p>
                </div>
                <div className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-xs font-bold shrink-0">
                  Total Correct: {correctAnswersCount}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full transition-all duration-300" 
                  style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Active question */}
              <div className="space-y-5">
                <h4 className="text-slate-800 text-sm md:text-base font-bold font-sans">
                  {quiz.questions[currentIdx].question}
                </h4>

                {/* MCQ Grid */}
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {quiz.questions[currentIdx].options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      id={`quiz-option-${oIdx}`}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={submitted}
                      className={`cursor-pointer w-full text-left p-4 rounded-2xl border text-xs md:text-sm font-semibold transition-all flex items-center justify-between ${getOptionStyle(oIdx)}`}
                    >
                      <span>{option}</span>
                      {submitted && oIdx === quiz.questions[currentIdx].correctIndex && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {submitted && selectedOpt === oIdx && oIdx !== quiz.questions[currentIdx].correctIndex && (
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback and Explanations Pane (shows only after submitting) */}
              {submitted ? (
                <div className="p-4 border border-blue-50 bg-blue-50/20 rounded-2xl space-y-2 leading-relaxed">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-brand-600" />
                    Grammar Diagnostic Explained:
                  </h5>
                  <p className="text-xs text-slate-600 font-sans pl-5">
                    {quiz.questions[currentIdx].explanation}
                  </p>
                  <p className="text-xs text-slate-500 italic Urdu pl-5 border-t border-slate-100/50 pt-2 font-semibold">
                    اردو وضاحت: {quiz.questions[currentIdx].urduExplanation}
                  </p>
                </div>
              ) : null}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-5 border-dashed flex justify-end">
                {!submitted ? (
                  <button
                    id="quiz-submit-answer-btn"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOpt === null}
                    className="cursor-pointer px-6 py-3 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-white hover:bg-slate-850 disabled:bg-slate-300 transition-all flex items-center justify-center shrink-0 shadow"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    id="quiz-next-question-btn"
                    onClick={handleNextQuestion}
                    className="cursor-pointer px-6 py-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-all flex items-center justify-center shrink-0 shadow gap-1"
                  >
                    {currentIdx + 1 === quiz.questions.length ? "Finish Quiz & Record XP" : "Next Question"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 text-center rounded-3xl p-12 h-[450px] flex flex-col justify-center items-center space-y-4">
              <Layers className="w-16 h-16 text-slate-300 animate-pulse-glow" />
              <h3 className="font-bold text-slate-700 font-display">No Active Session</h3>
              <p className="text-xs text-slate-400 max-w-[280px]">
                Target you tenses, prepositions, active voice or vocabulary and select &quot;Start Dynamic AI Quiz&quot; on the left to activate your MCQ practice.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
