import React from 'react';
import { Sparkles, Globe, GraduationCap, Users, ShieldCheck, HelpCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Editorial Title */}
      <div className="text-center space-y-3">
        <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
          Our Charter
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-905 font-display md:text-5xl">
          About EnglishMate AI
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
          We bridge language barriers by combining advanced cognitive AI models with custom curricula focused on native Urdu and international learners.
        </p>
      </div>

      {/* Intro visual banner */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Democratizing English Fluency across borders
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            EnglishMate AI was founded under a simple premise: English is the gateway to global academic excellence, remote careers, and open knowledge. Yet, generic English courses are optimized for European students and do not address the unique syntactic transfers made by Urdu and Hindi speakers.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            Our systems address the direct linguistic offsets. Instead of dry drills, our neural coach gives instantaneous context corrections and translates conceptual rules in natural, comfortable terms.
          </p>
        </div>

        <div className="p-6 bg-brand-900 text-white rounded-2xl space-y-4 relative overflow-hidden shadow-inner">
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-mono uppercase bg-brand-700 text-brand-200 px-2 py-0.5 rounded font-bold">
              Tech Stack Spotlight
            </span>
            <h3 className="font-extrabold text-lg">Harnessing Gemini 3.5 Models</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We leverage Google&apos;s state-of-the-art language processing pipeline. Our Express backend proxy manages secure requests, bypassing client key vulnerabilities, to query models with custom system constraints. This delivers immediate, structured responses.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-800 rounded-full blur-2xl opacity-40"></div>
        </div>
      </div>

      {/* Core values */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-slate-900 text-center">Our Core Pillars</h2>
        
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base">Scientific Pedagogy</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We don&apos;t just tell you a sentence is wrong. We explain the rule, provide Urdu grammar overlays, and test you with immediate related MCQs to solidify habits.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base">Security First</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your profile, streaks, quiz logs, and favorited study cards are kept perfectly safe using Firebase Authentication and hardened Firestore secure rules.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base">Accessible & Equal</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Free to start, lightweight loading speeds, and optimized layouts ensuring learners on mobile setups across any region can study English seamlessly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
