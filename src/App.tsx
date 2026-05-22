import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { auth, dbService } from './lib/firebase';
import { UserProfile, SavedLesson, QuizScore, ChatMessage } from './types';

// Page components imports
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Auth from './components/pages/Auth';
import Dashboard from './components/pages/Dashboard';
import ChatTeacher from './components/pages/ChatTeacher';
import GrammarChecker from './components/pages/GrammarChecker';
import SpokenPractice from './components/pages/SpokenPractice';
import VocabBuilder from './components/pages/VocabBuilder';
import QuizSection from './components/pages/QuizSection';

// Toast system interface
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Real-time reactive data bridges
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizScore[]>([]);
  const [savedChats, setSavedChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast Alerts Stack
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Push immediate toast handler
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Bind Firebase / Sandbox Auth status
  useEffect(() => {
    setLoading(true);
    if (!auth) {
      // Offline Demo / Sandbox Mode
      const localUid = localStorage.getItem('last_user_uid');
      if (localUid) {
        const localName = localStorage.getItem('last_user_name') || 'Guest Student';
        const localEmail = localStorage.getItem('last_user_email') || 'student@sandbox.local';
        setUser({ uid: localUid, displayName: localName, email: localEmail });
        syncUserData(localUid, localName, localEmail).then(() => setLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setSavedLessons([]);
        setQuizHistory([]);
        setSavedChats([]);
        setLoading(false);
      }
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load Profile and deck
        await syncUserData(currentUser.uid, currentUser.displayName || 'Learner', currentUser.email || '');
      } else {
        // Double check local storage if client had bypassed previously in sandbox Mode
        const localUid = localStorage.getItem('last_user_uid');
        if (localUid) {
          const localName = localStorage.getItem('last_user_name') || 'Guest Student';
          const localEmail = localStorage.getItem('last_user_email') || 'student@sandbox.local';
          setUser({ uid: localUid, displayName: localName, email: localEmail });
          await syncUserData(localUid, localName, localEmail);
        } else {
          setUser(null);
          setProfile(null);
          setSavedLessons([]);
          setQuizHistory([]);
          setSavedChats([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserData = async (uid: string, fallbackName: string, fallbackEmail: string) => {
    try {
      const userProfile = await dbService.getProfile(uid);
      if (!userProfile.name && (fallbackName || fallbackEmail)) {
        userProfile.name = fallbackName;
        userProfile.email = fallbackEmail;
        await dbService.updateProfile(uid, userProfile);
      }
      setProfile(userProfile);

      // Fetch study cards
      const lessons = await dbService.getSavedLessons(uid);
      setSavedLessons(lessons);

      // Fetch score logs
      const scores = await dbService.getQuizHistory(uid);
      setQuizHistory(scores);

      // Fetch saved conversation chat logs
      const chats = await dbService.getChatHistory(uid);
      setSavedChats(chats);
    } catch (err) {
      console.error("User data synchronization issue:", err);
    }
  };

  const handleAuthSuccess = async (authUser: any) => {
    setUser(authUser);
    localStorage.setItem('last_user_uid', authUser.uid);
    localStorage.setItem('last_user_name', authUser.displayName || '');
    localStorage.setItem('last_user_email', authUser.email || '');

    await syncUserData(authUser.uid, authUser.displayName || 'Student', authUser.email || '');
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Direct Firebase SignOut not supported or bypassed.");
    }
    // Wipe Sandbox details too
    localStorage.removeItem('last_user_uid');
    localStorage.removeItem('last_user_name');
    localStorage.removeItem('last_user_email');

    setUser(null);
    setProfile(null);
    setSavedLessons([]);
    setQuizHistory([]);
    setSavedChats([]);
    setCurrentTab('home');
    triggerToast("Logged out successfully.", "info");
  };

  // Saved lesson addition handler
  const handleSaveLesson = async (lesson: Omit<SavedLesson, 'id' | 'savedAt'>) => {
    const activeUid = user?.uid || 'guest_id';
    try {
      const newLesson = await dbService.saveLesson(activeUid, lesson);
      setSavedLessons(prev => [newLesson, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    const activeUid = user?.uid || 'guest_id';
    try {
      await dbService.deleteSavedLesson(activeUid, lessonId);
      setSavedLessons(prev => prev.filter(l => l.id !== lessonId));
    } catch (err) {
      console.error(err);
    }
  };

  // Update proficiency level selector
  const handleUpdateLevel = async (newLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') => {
    if (!user || !profile) return;
    const updatedProfile = { ...profile, level: newLevel };
    setProfile(updatedProfile);
    await dbService.updateProfile(user.uid, updatedProfile);
  };

  // Add chat message
  const handleAddChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const activeUid = user?.uid || 'guest_id';
    try {
      const savedMsg = await dbService.addChatMessage(activeUid, msg);
      setSavedChats(prev => [...prev, savedMsg]);
    } catch (err) {
      console.error(err);
    }
  };

  // Clear Chats helper
  const handleClearChats = async () => {
    const activeUid = user?.uid || 'guest_id';
    try {
      await dbService.clearChatHistory(activeUid);
      setSavedChats([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Record custom AI Quiz point
  const handleAddQuizScore = async (score: number, total: number, quizType: string) => {
    const activeUid = user?.uid || 'guest_id';
    const percentage = Math.round((score / total) * 105) > 100 ? 100 : Math.round((score / total) * 100);
    const newScore: Omit<QuizScore, 'id' | 'timestamp'> = {
      userId: activeUid,
      score,
      totalQuestions: total,
      percentage,
      quizType
    };

    try {
      const savedScore = await dbService.addQuizScore(activeUid, newScore);
      setQuizHistory(prev => [savedScore, ...prev]);

      // Boost XP profile details
      if (profile) {
        const gainedXp = score * 15; // 15 XP per correct answer
        const updatedProfile = { 
          ...profile, 
          xp: (profile.xp || 0) + gainedXp,
          streak: (profile.streak || 1) + 1 // increment streak daily
        };
        setProfile(updatedProfile);
        await dbService.updateProfile(activeUid, updatedProfile);
        triggerToast(`Awesome! Gained +${gainedXp} XP points! Study streak increased.`, "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Guard routing and navigate manually
  const checkNavigation = (destId: string) => {
    const protectedRoutes = ['dashboard', 'chat', 'grammar', 'spoken', 'vocab', 'quiz'];
    if (protectedRoutes.includes(destId) && !user) {
      triggerToast("Please authenticate or launch Demo Student Mode to access this workspace.", "info");
      setCurrentTab('login');
    } else {
      setCurrentTab(destId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between align-middle bg-slate-50 relative">
      
      {/* Toast Overlay stack alerts */}
      <div className="fixed top-5 right-5 z-[9999] space-y-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-semibold border text-white ${
                t.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
                t.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div>
        {/* Navigation Core */}
        <Navbar 
          currentTab={currentTab} 
          onNavigate={checkNavigation} 
          user={user} 
          profile={profile} 
          onLogout={handleLogout} 
        />

        {/* Dynamic Transition Router View */}
        <main className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              
              {currentTab === 'home' && (
                <Home 
                  onNavigate={checkNavigation} 
                  user={user} 
                  profile={profile} 
                  onSaveLesson={handleSaveLesson}
                  toast={triggerToast}
                />
              )}

              {currentTab === 'about' && <About />}

              {currentTab === 'contact' && <Contact toast={triggerToast} />}

              {currentTab === 'login' && (
                <Auth 
                  onAuthSuccess={handleAuthSuccess} 
                  toast={triggerToast} 
                />
              )}

              {currentTab === 'dashboard' && (
                <Dashboard 
                  onNavigate={checkNavigation}
                  user={user}
                  profile={profile}
                  quizHistory={quizHistory}
                  savedLessons={savedLessons}
                  onDeleteLesson={handleDeleteLesson}
                  onUpdateLevel={handleUpdateLevel}
                  toast={triggerToast}
                />
              )}

              {currentTab === 'chat' && (
                <ChatTeacher 
                  user={user}
                  profile={profile}
                  savedChats={savedChats}
                  onAddChatMessage={handleAddChatMessage}
                  onClearChats={handleClearChats}
                  onSaveLesson={handleSaveLesson}
                  toast={triggerToast}
                />
              )}

              {currentTab === 'grammar' && (
                <GrammarChecker 
                  user={user}
                  profile={profile}
                  onSaveLesson={handleSaveLesson}
                  toast={triggerToast}
                />
              )}

              {currentTab === 'spoken' && (
                <SpokenPractice 
                  user={user}
                  profile={profile}
                  onSaveLesson={handleSaveLesson}
                  toast={triggerToast}
                />
              )}

              {currentTab === 'vocab' && (
                <VocabBuilder 
                  user={user}
                  profile={profile}
                  onSaveLesson={handleSaveLesson}
                  toast={triggerToast}
                />
              )}

              {currentTab === 'quiz' && (
                <QuizSection 
                  user={user}
                  profile={profile}
                  onAddScore={handleAddQuizScore}
                  toast={triggerToast}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Core */}
      <Footer onNavigate={checkNavigation} />

    </div>
  );
}
