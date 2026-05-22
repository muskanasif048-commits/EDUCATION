import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight, HelpCircle, Save, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { UserProfile, SavedLesson } from '../../types';

interface GrammarCheckerProps {
  user: any;
  profile: UserProfile | null;
  onSaveLesson: (lesson: Omit<SavedLesson, 'id' | 'savedAt'>) => void;
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface Mistake {
  error: string;
  correction: string;
  urduExplanation: string;
}

interface GrammarAnalysis {
  original: string;
  corrected: string;
  score: number;
  mistakes: Mistake[];
  explanation: string;
}

const PRESETS = [
  "I is going to Karachi yesterday for buy a book.",
  "She don't likes the prepositions because it are confusing.",
  "He has been reading since three hours in the study room."
];

export default function GrammarChecker({ user, profile, onSaveLesson, toast }: GrammarCheckerProps) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarAnalysis | null>(null);

  const handleAnalyzeGrammar = async (textToScan: string) => {
    const targetText = textToScan || inputText;
    if (!targetText.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: targetText })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast("Analysis complete! Mistake highlights generated below.", "success");
      } else {
        toast("Grammar analysis service encountered an error.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Offline limits met. Displaying local proofread evaluation.", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCorrectionCard = () => {
    if (!result) return;
    onSaveLesson({
      userId: user?.uid || 'guest_id',
      type: 'grammar',
      title: result.corrected,
      content: `Original text:\n"${result.original}"\n\nAI Diagnostic feedback:\n${result.explanation}\n\nMistakes logged:\n${result.mistakes.map(m => `- Failed: ${m.error} -> Corrected: ${m.correction}\n  Explanatory Tip: ${m.urduExplanation}`).join('\n')}`,
      translation: "AI Grammar Scan and Proofreading"
    });
    toast("Grammar Correction saved to your Student Study Deck!", "success");
  };

  const selectPreset = (val: string) => {
    setInputText(val);
    handleAnalyzeGrammar(val);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (score >= 70) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-rose-500 bg-rose-50 border-rose-100";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header title */}
      <div>
        <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
          Pro Proofreader
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-905 font-display mt-2">
          AI Grammar Correction Workplace
        </h1>
        <p className="text-slate-500 text-xs md:text-sm">
          Paste your paragraphs, class compositions, or general English sentences. Our neural checker points out exact grammatical flaws with detailed Urdu explanations.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Pane */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enter English Text
            </label>
            <textarea
              id="grammar-input-text"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              placeholder="Type or paste your English sentences here (e.g. He do not goes to school yesterday...)"
              className="w-full p-4 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-2xl text-xs md:text-sm bg-slate-50/20"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Quick Presets */}
            <div className="space-y-1.5 flex-grow">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Try practicing these mistake examples:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    id={`grammar-preset-${index}`}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="cursor-pointer text-left px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-[11px] text-slate-600 font-semibold"
                  >
                    Preset {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="analyze-grammar-btn"
              onClick={() => handleAnalyzeGrammar('')}
              disabled={!inputText.trim() || loading}
              className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 font-bold transition-all text-xs shrink-0 shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Proofreading ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Scan Grammar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Pane: Diagnostic Report Card */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
              
              {/* Score card heading */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 font-display">Grammar Quality Index</h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Neural Assessment</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-lg font-black border tracking-tight ${getScoreColor(result.score)}`}>
                  {result.score} / 100
                </div>
              </div>

              {/* Original vs corrected split */}
              <div className="space-y-4">
                <div className="p-3.5 bg-rose-50/35 border border-rose-100/50 rounded-2xl">
                  <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                    Your original text
                  </span>
                  <p className="text-xs text-slate-600 font-sans md:text-sm line-through">
                    &quot;{result.original}&quot;
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                    AI Corrected Revision
                  </span>
                  <p className="text-sm text-slate-800 font-sans font-semibold">
                    &quot;{result.corrected}&quot;
                  </p>
                </div>
              </div>

              {/* Mistake highlights layout */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Errors Analyzed
                </span>
                
                {result.mistakes.length === 0 ? (
                  <div className="p-4 bg-emerald-50 rounded-xl text-emerald-700 font-semibold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    No grammatical issues found! Your sentence format is absolutely flawless.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {result.mistakes.map((mistake, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100/50 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            {mistake.error}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            Correction: {mistake.correction}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic Urdu leading-relaxed border-t border-slate-100/50 pt-1">
                          اردو وضاحت: {mistake.urduExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Global Explanation */}
              <div className="text-xs text-slate-600 bg-blue-50/40 p-4 border border-blue-50 rounded-2xl leading-relaxed whitespace-pre-wrap">
                ℹ️ <strong>Tutor Advice:</strong> {result.explanation}
              </div>

              <button
                id="save-grammar-card-btn"
                onClick={handleSaveCorrectionCard}
                className="cursor-pointer w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Correction to Dashboard Deck
              </button>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 text-center rounded-3xl p-8 h-[400px] flex flex-col justify-center items-center space-y-4">
              <Layers className="w-12 h-12 text-slate-300 animate-pulse-glow" />
              <h3 className="font-bold text-slate-700 font-display">No Diagnostics Generated</h3>
              <p className="text-xs text-slate-400 max-w-[240px]">
                Input your text or choose an interactive template example on the left, then click &quot;Scan Grammar&quot; to review scores and complete analysis logs.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
