import React from 'react';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-800 pb-8">
          
          <div className="md:col-span-6 space-y-3 text-left">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-extrabold text-base font-display">
                EnglishMate AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Helping Pakistani and international students conquer grammatical tenses, spoken pronunciation, and vocabulary obstacles using next-generation bilingual AI guidance.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-wrap gap-x-6 gap-y-2 md:justify-end text-xs font-semibold">
            <button id="footer-link-home" onClick={() => onNavigate('home')} className="cursor-pointer hover:text-white transition-all text-slate-400">Home</button>
            <button id="footer-link-about" onClick={() => onNavigate('about')} className="cursor-pointer hover:text-white transition-all text-slate-400">About Science</button>
            <button id="footer-link-contact" onClick={() => onNavigate('contact')} className="cursor-pointer hover:text-white transition-all text-slate-400">Support Desk</button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 font-mono">Bilingual Urdu-English Edition</span>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-sans">
          <p>© {new Date().getFullYear()} EnglishMate AI. Created to empower youth education pathways.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for globally connected students.
          </p>
        </div>
      </div>
    </footer>
  );
}
