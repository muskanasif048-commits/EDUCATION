import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Volume2, Save, Smile, Trash2, ShieldAlert, Award, Languages } from 'lucide-react';
import { UserProfile, SavedLesson, ChatMessage } from '../../types';
import Markdown from 'react-markdown';

interface ChatTeacherProps {
  user: any;
  profile: UserProfile | null;
  savedChats: ChatMessage[];
  onAddChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onClearChats: () => void;
  onSaveLesson: (lesson: Omit<SavedLesson, 'id' | 'savedAt'>) => void;
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const PRACTICE_TOPICS = [
  { id: 'conv', label: 'General Conversation (مکالمہ)', instruction: 'Let\'s practice casual everyday English conversation. Ask about my day or introduce yourself!' },
  { id: 'ielts', label: 'IELTS Speaking prep', instruction: 'Act as a certified IELTS examiner. Give me a Part 2 cue card question and grade my grammatical range.' },
  { id: 'interview', label: 'Job Interview drill', instruction: 'Simulate a formal professional job interview for a corporate position. Ask me behavioral questions one by one.' },
  { id: 'tenses', label: 'Tenses practice (زمانے)', instruction: 'Focus strictly on testing my usage of Present, Past, and Perfect Continuous tenses. Correct my sentence formations.' }
];

export default function ChatTeacher({ 
  user, 
  profile, 
  savedChats, 
  onAddChatMessage, 
  onClearChats, 
  onSaveLesson, 
  toast 
}: ChatTeacherProps) {
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState('conv');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [savedChats, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userText = inputMsg;
    setInputMsg('');
    setLoading(true);

    // Save user message to parent state (Firebase / LS)
    onAddChatMessage({
      userId: user?.uid || 'guest_id',
      role: 'user',
      content: userText
    });

    const currentTopicObj = PRACTICE_TOPICS.find(t => t.id === activeTopic);
    const contextPrompt = currentTopicObj ? `[Topic: ${currentTopicObj.label}. Intended tone/mode: ${currentTopicObj.instruction}]` : '';

    try {
      const chatPayload = [
        ...savedChats.map(c => ({ role: c.role, content: c.content })),
        { role: 'user', content: `${contextPrompt} \n\n${userText}` }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatPayload,
          userProfile: profile
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        onAddChatMessage({
          userId: user?.uid || 'guest_id',
          role: 'assistant',
          content: data.text
        });
      } else {
        toast(data.error || "Communication issue. Bypassing.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Offline limits met. Please configure server configuration keys.", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakText = async (id: string, text: string) => {
    // Sanitise markdown characters to prevent TTS speaking symbols
    const cleanText = text.replace(/[*#_`~\[\]()]+/g, " ");
    setPlayingId(id);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText.substring(0, 300) }) // constrain length
      });
      const data = await response.json();
      if (data.audio) {
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        audio.play();
        audio.onended = () => setPlayingId(null);
      } else {
        const utter = new SpeechSynthesisUtterance(cleanText);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
        utter.onend = () => setPlayingId(null);
      }
    } catch (err) {
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
      utter.onend = () => setPlayingId(null);
    }
  };

  const handleSaveLessonFromChat = (content: string) => {
    // Save first 80 characters as title
    const cleanTitle = content.replace(/[*#]+/g, '').substring(0, 60) + '...';
    onSaveLesson({
      userId: user?.uid || 'guest_id',
      type: 'grammar',
      title: cleanTitle,
      content: content,
      translation: "Saved from Chat Teacher Lesson Workspace"
    });
    toast("Answer starred and saved to your dashboard study deck!", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[85vh] flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 overflow-hidden">
      
      {/* Left Column: Topics and guides */}
      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between mb-4 lg:mb-0">
        <div className="space-y-6">
          <div>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
              Curriculum Engine
            </span>
            <h2 className="text-2xl font-bold font-display text-slate-900 mt-2">Miss Sarah AI</h2>
            <p className="text-slate-500 text-xs mt-1">
              Your patient and logical bilingual model. Select any practice focus to reshape our conversation focus instantly!
            </p>
          </div>

          {/* Selector buttons */}
          <div className="space-y-2.5">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Focus</span>
            {PRACTICE_TOPICS.map(topic => (
              <button
                key={topic.id}
                id={`practice-topic-${topic.id}`}
                onClick={() => {
                  setActiveTopic(topic.id);
                  toast(`Chat topic changed to: ${topic.label}. Say Hello to starts!`, 'info');
                }}
                className={`cursor-pointer w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  activeTopic === topic.id 
                    ? "border-brand-500 bg-brand-50/50 text-brand-800"
                    : "border-slate-100 bg-slate-50/20 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{topic.label}</span>
                  {activeTopic === topic.id && <Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Clear chat support */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            id="clear-chat-history-btn"
            onClick={() => {
              onClearChats();
              toast("Chat history cleared.", "info");
            }}
            className="cursor-pointer text-xs text-rose-500 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat History
          </button>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-sans">
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            Urdu & Eng Support
          </span>
        </div>
      </div>

      {/* Right Column: Active Interactive Chat Interface */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden h-full">
        
        {/* Chat Message Window */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[55vh] lg:max-h-[62vh]">
          {savedChats.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  AI
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm border ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white border-brand-700 rounded-tr-none' 
                  : 'bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="markdown-body text-slate-800 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <p className="font-sans leading-relaxed text-xs md:text-sm">{msg.content}</p>
                )}

                {/* Response controls widget */}
                {msg.role === 'assistant' && (
                  <div className="flex justify-end gap-3 mt-3 pt-2.5 border-t border-slate-100 text-slate-400 text-xs">
                    <button
                      id={`chat-voice-${msg.id}`}
                      title="Speak Outloud"
                      onClick={() => handleSpeakText(msg.id, msg.content)}
                      disabled={playingId === msg.id}
                      className="cursor-pointer flex items-center gap-1 hover:text-brand-600 transition-all font-semibold"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playingId === msg.id ? "animate-bounce text-emerald-500" : ""}`} />
                      {playingId === msg.id ? "Speaking..." : "Pronounce"}
                    </button>
                    <button
                      id={`chat-save-${msg.id}`}
                      title="Save Explanations to dashboard"
                      onClick={() => handleSaveLessonFromChat(msg.content)}
                      className="cursor-pointer flex items-center gap-1 hover:text-teal-600 transition-all font-semibold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Explanation
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                  ST
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-spin-slow">
                AI
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-600 border border-slate-200 flex items-center space-x-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-150"></span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-300"></span>
                <span className="text-xs font-mono ml-2">Tutor is writing explanations ...</span>
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        {/* Input Text Form Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/50 flex space-x-3 items-center">
          <input
            id="chat-user-input"
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={loading}
            placeholder="Ask me anything in English or Urdu! e.g. What is the difference between active and passive voice?"
            className="flex-grow px-4 py-3 bg-white border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-xs md:text-sm font-sans"
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputMsg.trim() || loading}
            className="cursor-pointer px-4.5 py-3 rounded-xl text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 transition-all flex items-center justify-center shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
