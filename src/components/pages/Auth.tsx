import React, { useState } from 'react';
import { Mail, Lock, Sparkles, User, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured, 
  dbService 
} from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Auth({ onAuthSuccess, toast }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isFirebaseConfigured && auth) {
        if (isLogin) {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          toast("Successfully logged in!", "success");
          onAuthSuccess(userCredential.user);
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: name });
          }
          // Seed initial Firestore profile
          await dbService.getProfile(userCredential.user.uid);
          toast("Registration complete! Welcome aboard.", "success");
          onAuthSuccess(userCredential.user);
        }
      } else {
        // Run Sandbox Trigger
        const mockUser = {
          uid: 'sandboxed_student_07',
          displayName: name || 'Ameer Hamza',
          email: email,
          isAnonymous: false
        };
        toast("Running in offline Demo Sandbox Mode!", "info");
        onAuthSuccess(mockUser);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Make sure details are valid.");
      toast(err.message || "Authentication error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        await dbService.getProfile(result.user.uid);
        toast("Google login successful!", "success");
        onAuthSuccess(result.user);
      } else {
        // Sandbox bypass
        const mockUser = {
          uid: 'sandboxed_student_07',
          displayName: 'Hamza Khan',
          email: 'hamza.khan@gmail.com',
          photoURL: null
        };
        toast("Google sign-in bypassed via Sandbox mode!", "success");
        onAuthSuccess(mockUser);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Auth cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSandboxAction = () => {
    const mockUser = {
      uid: 'sandboxed_student_07',
      displayName: 'Zainab Fatima',
      email: 'zainab@englishmate.ai',
      isAnonymous: true
    };
    toast("Welcome! Instant student access granted.", "success");
    onAuthSuccess(mockUser);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
        
        {/* Glow behind header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-50 rounded-full blur-3xl opacity-70 -z-10"></div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-950 font-display flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500 animate-pulse-glow" />
            EnglishMate AI
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Sign in to resume tracking your daily English tenses & streak" : "Create your EnglishMate student profile in 10 seconds"}
          </p>
        </div>

        {/* Firebase Config Notice Status Banner */}
        <div className={`p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
          isFirebaseConfigured 
            ? "bg-blue-50/50 border-blue-100 text-blue-700" 
            : "bg-amber-50/60 border-amber-100 text-amber-800"
        }`}>
          {isFirebaseConfigured ? (
            <>
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong>Firebase Live Connected:</strong> Real Firestore database security rules and authentication is synced and active.
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <strong>Offline Sandbox Mode active:</strong> Firebase properties aren&apos;t fully loaded yet. Sign in or use general credentials below to enjoy simulated data tracking saving to `localStorage`.
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleManualAuth}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="auth-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ameer Hamza"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-sm bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@englishmate.ai"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl font-semibold shadow-md transition-all text-sm mt-2"
          >
            {loading ? "Authenticating Account ..." : isLogin ? "Sign In to EnglishMate" : "Create Account"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase font-mono">Or Use Single Sign-On</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Google SSO Login */}
        <button
          id="google-sso-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="cursor-pointer w-full py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm text-slate-700 font-medium font-sans"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          {isFirebaseConfigured ? "Login via Google Account" : "Preview with Sandbox Google"}
        </button>

        {/* Free Sandbox Bypass Card */}
        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center">
          <p className="text-xs text-emerald-800 font-medium mb-2.5">
            🔑 Want an instant, zero-setup developer preview as an expert student?
          </p>
          <button
            id="auth-sandbox-bypass-btn"
            type="button"
            onClick={triggerSandboxAction}
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Launch Instant Demo Student Mode
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            id="auth-switch-mode-btn"
            onClick={() => setIsLogin(!isLogin)}
            className="cursor-pointer text-xs text-brand-600 hover:underline font-semibold"
          >
            {isLogin ? "New to EnglishMate? Create a profile instead" : "Already registered? Sign in here"}
          </button>
        </div>

      </div>
    </div>
  );
}
