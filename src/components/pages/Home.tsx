import React, { useState } from 'react';
import { BookOpen, Sparkles, Languages, CheckCircle, GraduationCap, ChevronDown, Award, Globe, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, SavedLesson } from '../../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  user: any;
  profile: UserProfile | null;
  onSaveLesson: (lesson: Omit<SavedLesson, 'id' | 'savedAt'>) => void;
  toast: (msg: string, type?: 'success' | 'info') => void;
}

const FAQS = [
  {
    q: "How does EnglishMate AI teach English?",
    a: "EnglishMate AI combines the advanced linguistic intelligence of Google's Gemini API with structured curricula designed for Urdu & international speakers. It corrects your sentence errors instantly, explains why in Urdu, validates your pronunciation, and generates adaptive quizzes."
  },
  {
    q: "Is EnglishMate AI suitable for beginners?",
    a: "Absolutely! We focus specifically on bridging the gap for native Urdu/Hindi speakers by explaining grammatical rules (Tenses, Prepositions, Active/Passive) in familiar terms with Urdu translations."
  },
  {
    q: "Does this require a paid subscription?",
    a: "EnglishMate AI is completely free to start for everyone during our development phase. Connect your Firebase system to save unlimited lessons and chat history safely!"
  },
  {
    q: "How does the Spoken English practice work?",
    a: "You can select custom conversational prompts, listen to high-fidelity AI-generated pronunciations, practice repeating them, and get immediate feedback on how to improve your accent."
  }
];

export default function Home({ onNavigate, user, profile, onSaveLesson, toast }: HomeProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [dailySaved, setDailySaved] = useState(false);

  // High quality sample sentences
  const dailySentence = {
    title: "Daily Practice Sentence",
    content: "Consistency is the key to unlocking your true potential.",
    urdu: "مستقل مزاجی آپ کے اصل جوہر کو بیدار کرنے کی چابی ہے۔",
    vocab: "Consistency = مستقل مزاجی | Unlocking = بیدار کرنا / کھولنا"
  };

  const handleSaveDaily = () => {
    onSaveLesson({
      userId: user?.uid || 'guest_id',
      type: 'sentence',
      title: dailySentence.content,
      content: `${dailySentence.content} \n\nLearning context: ${dailySentence.vocab}`,
      translation: dailySentence.urdu
    });
    setDailySaved(true);
    toast("Daily Sentence saved successfully to your dashboard!", "success");
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column Text */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-brand-700 bg-brand-50 rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin-slow" />
                The Future of Language Learning in Pakistan
              </span>
              
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl font-display">
                Master English with Your Personal <span className="text-brand-600">AI Tutor</span>
              </h1>
              
              <p className="mt-3 text-base text-slate-600 sm:mt-5 sm:text-lg">
                EnglishMate AI helps student learn English with advanced AI. 
                Get direct logical corrections, Urdu translations, vocabulary tools, and tts modules instantly.
              </p>

              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    id="hero-cta-get-started"
                    onClick={() => onNavigate(user ? 'dashboard' : 'login')}
                    className="cursor-pointer inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-white font-medium bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-md transition-all duration-150"
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    {user ? 'Go to Dashboard' : 'Start Learning Free'}
                  </button>
                  <button 
                    id="hero-learn-more"
                    onClick={() => onNavigate('about')}
                    className="cursor-pointer inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-slate-200 text-slate-700 font-medium bg-white hover:bg-slate-50 transition-all"
                  >
                    <BookOpen className="w-5 h-5 mr-2 text-slate-400" />
                    Our Methodology
                  </button>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-8 text-left max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-display">10+</span>
                  <span className="text-xs text-slate-500">Structured Modules</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-display">Gemini</span>
                  <span className="text-xs text-slate-500">AI Powered Intelligence</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-display">Bilingual</span>
                  <span className="text-xs text-slate-500">Urdu & English Explanation</span>
                </div>
              </div>
            </div>

            {/* Right Column Visual Card */}
            <div className="mt-12 sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6">
              <div className="relative mx-auto w-full rounded-2xl shadow-xl overflow-hidden bg-white border border-slate-100 p-6 md:p-8">
                
                {/* Header Graphic */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                      <Languages className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">EnglishMate AI Classroom</h3>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Active Teacher: Miss Sarah AI
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Bilingual Mode</span>
                </div>

                {/* Simulated chat bubble */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center font-bold text-xs text-brand-700 shrink-0">
                      ST
                    </div>
                    <div className="bg-slate-50 rounded-2xl rounded-tl-none p-3 text-sm text-slate-700">
                      &quot;I is reading a English novel.&quot;
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-brand-50 border border-brand-100 rounded-2xl rounded-tr-none p-3.5 text-xs text-slate-800 max-w-[85%]">
                      <p className="font-medium text-brand-800 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-brand-600" /> Correction Explained:
                      </p>
                      <p className="mb-2 italic font-semibold text-slate-900">&quot;I am reading an English novel.&quot;</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li><strong>Rule 1:</strong> Use <strong className="text-brand-700">am</strong> with <strong className="text-brand-700">I</strong>. (I کے ساتھ am کا استعمال کریں۔)</li>
                        <li><strong>Rule 2:</strong> Use <strong className="text-brand-700">an</strong> before vowels (&apos;English&apos; begins with a vowel sound). (انگریزی واؤل آوازوں سے پہلے an لگائیں۔)</li>
                      </ul>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      AI
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <button 
                    id="hero-chat-link"
                    onClick={() => onNavigate('grammar')}
                    className="cursor-pointer text-xs text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center gap-1"
                  >
                    Try the Live Grammar Correction Engine →
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Daily Sentence Spotlight */}
      <section className="bg-brand-900 text-white rounded-3xl py-12 px-6 md:px-12 mx-4 sm:mx-8 lg:mx-auto max-w-6xl shadow-xl relative -mt-8 mb-24 z-10 overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <span className="px-3 py-1 bg-brand-800 text-brand-300 text-xs font-semibold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-4">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              Daily Vocabulary & English Sentence
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Today&apos;s English Mastery</h2>
            
            <div className="mt-6 space-y-3">
              <p className="text-xl md:text-2xl font-semibold border-l-4 border-brand-500 pl-4 py-1 italic font-sans">
                &quot;{dailySentence.content}&quot;
              </p>
              <p className="text-slate-300 text-sm md:text-base italic pl-4">
                اردو ترجمہ: {dailySentence.urdu}
              </p>
            </div>

            <div className="mt-4 text-xs font-mono bg-brand-950/50 p-3 rounded-lg text-brand-200 border border-brand-800">
              💡 {dailySentence.vocab}
            </div>
          </div>

          <div className="md:col-span-4 text-center md:text-right">
            {dailySaved ? (
              <span className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg bg-green-900 border border-green-700 text-green-300 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Saved to Dashboard
              </span>
            ) : (
              <button
                id="save-daily-btn"
                onClick={handleSaveDaily}
                className="cursor-pointer w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold shadow-lg shadow-emerald-500/10 transition-all text-sm"
              >
                Save for Dashboard Practice
              </button>
            )}
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-30 transform translate-x-12 -translate-y-12"></div>
      </section>

      {/* Structured Modules & Features */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display text-slate-900">
            A Rich Language Ecosystem
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Everything Pakistani students need to prepare for IELTS, job interviews, or general school and college exams.
          </p>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display">AI grammar corrector</h3>
              <p className="mt-2 text-sm text-slate-600">
                Paste essays, letters, or daily thoughts. Miss Sarah AI marks every noun, preposition, and punctuation error with detailed structural Urdu analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display">Spoken English Pronunciation</h3>
              <p className="mt-2 text-sm text-slate-600">
                Listen to high-fidelity English speakouts, try pronouncing them yourself, and get feedback to make your spoken conversational skills perfectly clear.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <Languages className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display">Urdu-English Translation</h3>
              <p className="mt-2 text-sm text-slate-600">
                Input in Roman Urdu, standard Urdu script, or English. Convert dynamically with breakdown hints that expand your bilingual vocabulary safely.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <Award className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display">AI Adaptive Quizzes</h3>
              <p className="mt-2 text-sm text-slate-600">
                Test yourself with on-the-fly generated MCQs on specific tenses, prepositions, active-passive voice, complete with detailed Urdu justifications.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display">Progress Dashboard</h3>
              <p className="mt-2 text-sm text-slate-600">
                Maintain a daily study streak. Earn academic points (XP), save critical vocabulary words and custom phrases to review like flashcards.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-xl transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <HelpCircle className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display">Custom Bot Personalities</h3>
              <p className="mt-2 text-sm text-slate-600">
                Choose between conversational tutors, job interview simulators, or formal editors for tailored guidance based on your academic path.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display text-slate-900">Trusted by Pakistani Students</h2>
          <p className="mt-2 text-slate-600">Hear how EnglishMate AI has empowered real learners to excel.</p>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
              <p className="text-slate-600 italic text-sm">
                &quot;The Urdu translation and explanations are a life saver. I was struggling with prepositions for my CSS exams, but the step-by-step logic helped me understand thoroughly.&quot;
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="font-bold text-brand-600 font-display">Ayesha K.</div>
                <div className="text-xs text-slate-400">CSS Aspirant • Lahore</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
              <p className="text-slate-600 italic text-sm">
                &quot;The Spoken English feature corrected my active phone conversational syntax. Practicing in the sandbox mode before real job interviews gave me huge confidence.&quot;
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="font-bold text-brand-600 font-display">Bilal Ahmed</div>
                <div className="text-xs text-slate-400">Software Engineer • Karachi</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
              <p className="text-slate-600 italic text-sm">
                &quot;I enjoy collecting points and keeping my 15-day streak active. Saving vocabulary flashcards directly from lessons has expanded my academic output dramatically.&quot;
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="font-bold text-brand-600 font-display">Sajid Khan</div>
                <div className="text-xs text-slate-400">University Student • Peshawar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center font-display text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="cursor-pointer w-full text-left px-6 py-4 bg-slate-50 hover:bg-slate-100 flex justify-between items-center transition-all focus:outline-none"
                >
                  <span className="font-semibold text-slate-800 text-sm md:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 py-4 bg-white text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 text-white text-center py-16 px-4">
        <h2 className="text-3xl font-display font-bold">Ready to Excel in English?</h2>
        <p className="mt-2 text-brand-100 max-w-lg mx-auto">Get started today on EnglishMate AI and witness instant progress with our customized AI English Teacher.</p>
        <button
          onClick={() => onNavigate(user ? 'dashboard' : 'login')}
          className="cursor-pointer mt-6 inline-flex items-center px-6 py-3 bg-white text-brand-700 font-bold rounded-lg hover:bg-brand-50 shadow-md transition-all text-sm"
        >
          Initialize Account Now
        </button>
      </section>
    </div>
  );
}
