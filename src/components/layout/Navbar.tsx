import React, { useState } from 'react';
import { Sparkles, Menu, X, GraduationCap, LogOut, LogIn, Award } from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  user: any;
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({ currentTab, onNavigate, user, profile, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const studentLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'Chat Teacher' },
    { id: 'grammar', label: 'Grammar Checker' },
    { id: 'spoken', label: 'Spoken Practice' },
    { id: 'vocab', label: 'Vocabulary' },
    { id: 'quiz', label: 'AI Quiz' }
  ];

  const handleNavigate = (destId: string) => {
    onNavigate(destId);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo"
            onClick={() => handleNavigate('home')} 
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-brand-900 font-serif">
              EnglishMate <span className="italic font-bold text-brand-600">AI</span>
            </span>
          </div>

          {/* Large Screen Nav Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavigate(link.id)}
                className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentTab === link.id 
                    ? "bg-slate-50 text-brand-600" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                }`}
              >
                {link.label}
              </button>
            ))}

            {user && (
              <>
                <div className="h-4 w-px bg-slate-200 mx-2"></div>
                {studentLinks.map(link => (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => handleNavigate(link.id)}
                    className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentTab === link.id 
                        ? "bg-brand-50 text-brand-700 font-extrabold" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Action Login Info */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                
                {/* Streak Badge */}
                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-lg font-bold">
                  🔥 {profile?.streak || 3}d streak
                </span>

                {/* Profile Meta info */}
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800">
                    {profile?.name || user.displayName || "Student"}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    Academic Level: {profile?.level || "B1"}
                  </span>
                </div>

                {/* Logout trigger */}
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50/50 transition-all"
                  title="Logout Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => handleNavigate('login')}
                className="cursor-pointer inline-flex items-center justify-center px-4.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-white hover:bg-slate-850 transition-all shadow"
              >
                <LogIn className="w-3.5 h-3.5 mr-2" />
                Sign In / Register
              </button>
            )}
          </div>

          {/* Hamburger trigger */}
          <div className="lg:hidden">
            <button
              id="nav-mobile-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="cursor-pointer p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-2 shadow-inner">
          {navLinks.map(link => (
            <button
              key={link.id}
              id={`nav-link-mobile-${link.id}`}
              onClick={() => handleNavigate(link.id)}
              className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === link.id 
                  ? "bg-slate-100 text-brand-600" 
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </button>
          ))}

          {user && (
            <>
              <div className="border-t border-slate-100 my-2 pt-2"></div>
              {studentLinks.map(link => (
                <button
                  key={link.id}
                  id={`nav-link-mobile-${link.id}`}
                  onClick={() => handleNavigate(link.id)}
                  className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentTab === link.id 
                      ? "bg-brand-50 text-brand-700 font-extrabold" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              
              <div className="border-t border-slate-100 my-2 pt-2 flex justify-between items-center px-4">
                <span className="text-xs text-slate-500 font-semibold uppercase">
                  Streak: 🔥 {profile?.streak || 3} days
                </span>
                <button
                  id="nav-mobile-logout"
                  onClick={onLogout}
                  className="cursor-pointer text-xs font-bold text-rose-500 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {!user && (
            <div className="pt-4 px-2">
              <button
                id="nav-mobile-login"
                onClick={() => handleNavigate('login')}
                className="cursor-pointer w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-bold bg-slate-950 text-white"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      )}

    </nav>
  );
}
