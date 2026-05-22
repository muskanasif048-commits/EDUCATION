import React, { useState } from 'react';
import { 
  Award, 
  Flame, 
  BookMarked, 
  History, 
  Volume2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { UserProfile, SavedLesson, QuizScore } from '../../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
  user: any;
  profile: UserProfile | null;
  quizHistory: QuizScore[];
  savedLessons: SavedLesson[];
  onDeleteLesson: (id: string) => void;
  onUpdateLevel: (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') => void;
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Dashboard({ 
  onNavigate, 
  user, 
  profile, 
  quizHistory, 
  savedLessons, 
  onDeleteLesson, 
  onUpdateLevel, 
  toast 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<SavedLesson | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleSpeakText = async (id: string, text: string) => {
    setPlayingId(id);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      if (data.audio) {
        // Decode base64 to audio element
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        audio.play();
        toast("Playing perfect native audio guide...", "info");
        audio.onended = () => setPlayingId(null);
      } else {
        // Fallback to client browser SpeechSynthesis
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 0.85;
        window.speechSynthesis.speak(utter);
        toast("Synthesizing audio natively in browser...", "info");
        utter.onend = () => setPlayingId(null);
      }
    } catch (err) {
      // Fallback
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
      utter.onend = () => setPlayingId(null);
    }
  };

  const getPercentageColor = (percent: number) => {
    if (percent >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (percent >= 50) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-rose-500 bg-rose-50 border-rose-100";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg relative overflow-hidden">
        <div className="space-y-2 z-10">
          <span className="bg-brand-500/40 text-brand-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Student Space
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight font-display">
            Welcome back, {profile?.name || user?.displayName || "Student"}!
          </h1>
          <p className="text-brand-100/90 text-sm max-w-xl">
            Sustaining a daily rhythm is the easiest way to speak English naturally. Your Current Learning Goal is set for <span className="font-semibold text-white underline">{profile?.targetLanguage || "Urdu to English translation rules"}</span>.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-3 z-10">
          <button
            id="dash-quick-chat"
            onClick={() => onNavigate('chat')}
            className="cursor-pointer bg-white text-brand-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl transition-all text-sm shadow-md"
          >
            Start Conversation
          </button>
          <button
            id="dash-quick-quiz"
            onClick={() => onNavigate('quiz')}
            className="cursor-pointer bg-brand-500 text-white hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl transition-all border border-brand-400 text-sm"
          >
            Take AI Quiz
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-700 rounded-full blur-3xl opacity-30 transform translate-x-12 -translate-y-12"></div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 font-display">{profile?.streak || 3} Days</span>
            <span className="text-xs text-slate-500">Consecutive Streak</span>
          </div>
        </div>

        {/* Experience Points (XP) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 font-display">{profile?.xp || 240} XP</span>
            <span className="text-xs text-slate-500">Academic Score (Rank)</span>
          </div>
        </div>

        {/* Proficiency Level Picker Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 col-span-1">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <span className="font-black text-blue-600 text-xl font-display">{profile?.level || 'B1'}</span>
          </div>
          <div className="flex-grow">
            <span className="block text-xs text-slate-400 font-semibold uppercase">English Level</span>
            <select
              id="dash-level-select"
              value={profile?.level || 'B1'}
              onChange={(e) => {
                onUpdateLevel(e.target.value as any);
                toast(`Level updated to ${e.target.value}! Now generating matching materials.`, 'success');
              }}
              className="mt-0.5 bg-transparent border-none text-sm font-bold text-slate-800 focus:outline-none cursor-pointer p-0 block"
            >
              <option value="A1">A1 - Beginner (ابتدائی)</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper-Int</option>
              <option value="C1">C1 - Advanced (اعلیٰ)</option>
              <option value="C2">C2 - Proficient</option>
            </select>
          </div>
        </div>

        {/* Saved Study metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <BookMarked className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 font-display">{savedLessons.length} Items</span>
            <span className="text-xs text-slate-500">Saved Study Deck</span>
          </div>
        </div>

      </div>

      {/* Main layout with saved study items vs historic quizzes */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left column: Study Deck Manager */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex space-x-2">
              <button
                id="dash-tab-lessons"
                onClick={() => setActiveTab('lessons')}
                className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'lessons' 
                    ? "bg-brand-50 text-brand-700" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Saved Lessons & Vocab ({savedLessons.length})
              </button>
              <button
                id="dash-tab-quizzes"
                onClick={() => setActiveTab('quizzes')}
                className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'quizzes' 
                    ? "bg-brand-50 text-brand-700" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Quiz Score History ({quizHistory.length})
              </button>
            </div>
          </div>

          {activeTab === 'lessons' && (
            <div className="space-y-4">
              {savedLessons.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <BookMarked className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Your Study Deck is Empty</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    While using translation blocks, spoken practice or grammar checker, click the star or &quot;Save&quot; buttons to collect flashcards for instant reviews here.
                  </p>
                  <button
                    id="dashboard-explore-home"
                    onClick={() => onNavigate('home')}
                    className="cursor-pointer inline-flex items-center text-xs text-brand-600 font-bold hover:underline"
                  >
                    Explore Home Lessons <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedLessons.map(lesson => (
                    <div 
                      key={lesson.id} 
                      onClick={() => setSelectedLesson(lesson)}
                      className={`cursor-pointer rounded-2xl border p-4 hover:shadow-md transition-all flex flex-col justify-between ${
                        selectedLesson?.id === lesson.id 
                          ? "border-brand-500 bg-brand-50/10 shadow-sm" 
                          : "border-slate-100 bg-slate-50/30"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            lesson.type === 'vocabulary' ? "bg-indigo-50 text-indigo-700" :
                            lesson.type === 'sentence' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {lesson.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(lesson.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="font-semibold text-slate-800 text-sm line-clamp-2 md:text-base font-sans">
                          {lesson.title}
                        </p>
                        {lesson.translation && (
                          <p className="text-xs text-slate-500 italic mt-1.5 Urdu line-clamp-1">
                            {lesson.translation}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end items-center gap-2 mt-4 pt-3 border-t border-slate-100/60 text-slate-400">
                        <button
                          id={`lesson-listen-${lesson.id}`}
                          title="Listen Pronunciation"
                          disabled={playingId === lesson.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakText(lesson.id, lesson.title);
                          }}
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 hover:text-brand-600 transition-all text-slate-500"
                        >
                          <Volume2 className={`w-4 h-4 ${playingId === lesson.id ? "animate-bounce text-emerald-500" : ""}`} />
                        </button>
                        <button
                          id={`lesson-delete-${lesson.id}`}
                          title="Delete Lesson"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLesson(lesson.id);
                            if (selectedLesson?.id === lesson.id) setSelectedLesson(null);
                            toast("Lesson card removed from dashboard.", "info");
                          }}
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              {quizHistory.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <History className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">No Quizzes Attempted Yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Challenge yourself on spelling, vocabulary, active voice and tenses. Each quiz corrects errors and builds mental agility.
                  </p>
                  <button
                    id="dashboard-take-quiz-now"
                    onClick={() => onNavigate('quiz')}
                    className="cursor-pointer inline-flex items-center text-xs text-brand-600 font-bold hover:underline"
                  >
                    Start AI MCQ Quiz Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {quizHistory.map((history, idx) => (
                    <div key={idx} className="py-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base">{history.quizType}</h4>
                        <p className="text-xs text-slate-400">
                          Completed on {new Date(history.timestamp).toLocaleDateString()} at {new Date(history.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getPercentageColor(history.percentage)}`}>
                          {history.score} / {history.totalQuestions} ({history.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right column: Lesson Spotlight detail panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Detail card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 min-h-[250px] relative overflow-hidden flex flex-col justify-between">
            {selectedLesson ? (
              <div className="space-y-4 z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono bg-brand-500 text-white font-bold px-2 py-0.5 rounded-md">
                    Study Inspection
                  </span>
                  <button
                    id="spot-speak-selected"
                    onClick={() => handleSpeakText(selectedLesson.id, selectedLesson.title)}
                    className="cursor-pointer text-slate-300 hover:text-white"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-sans tracking-tight">{selectedLesson.title}</h3>
                  {selectedLesson.translation && (
                    <p className="text-sm text-slate-300 italic mt-2 border-l-2 border-brand-500 pl-3">
                      ہم معنی جملہ: {selectedLesson.translation}
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-400 pt-2 font-mono whitespace-pre-line leading-relaxed">
                  {selectedLesson.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 z-10 flex flex-col justify-center items-center h-full space-y-3">
                <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
                <h4 className="font-bold text-slate-100 font-display">No Focus Selection</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Select any saved lesson card from the deck on the left to see complete Urdu definitions, Roman script, and vocal tools instantly.
                </p>
              </div>
            )}
            {/* Background spotlight vector styling */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm font-display mb-2">Practice Shortcuts</h3>
            
            <button
              id="shortcuts-chat"
              onClick={() => onNavigate('chat')}
              className="cursor-pointer w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 border border-slate-50 transition-all text-left group"
            >
              <span className="text-slate-700 text-xs font-semibold group-hover:text-brand-700">Chat with English Tutor Bot</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-all" />
            </button>

            <button
              id="shortcuts-grammar"
              onClick={() => onNavigate('grammar')}
              className="cursor-pointer w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 border border-slate-50 transition-all text-left group"
            >
              <span className="text-slate-700 text-xs font-semibold group-hover:text-brand-700">Proofread an Essay or Paragraph</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-all" />
            </button>

            <button
              id="shortcuts-spoken"
              onClick={() => onNavigate('spoken')}
              className="cursor-pointer w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 border border-slate-50 transition-all text-left group"
            >
              <span className="text-slate-700 text-xs font-semibold group-hover:text-brand-700">Spoken Conversational Drills</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-all" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
