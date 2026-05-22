import React, { useState } from 'react';
import { Volume2, Star, Check, Sparkles, Languages, HelpCircle, Save, BookOpen, ChevronRight } from 'lucide-react';
import { UserProfile, SavedLesson } from '../../types';

interface VocabBuilderProps {
  user: any;
  profile: UserProfile | null;
  onSaveLesson: (lesson: Omit<SavedLesson, 'id' | 'savedAt'>) => void;
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES = [
  { id: 'academic', label: 'Academic Vocabulary (امتحانی الفاظ)' },
  { id: 'idioms', label: 'Essential Idioms (محاورے)' },
  { id: 'phrasals', label: 'Business Phrasal Verbs (دفتراتی افعال)' }
];

const VOCAB_DATA = [
  // Academic words
  {
    category: 'academic',
    word: "Meticulous",
    part: "adjective",
    ipa: "/məˈtɪkjələs/",
    urdu: "نہایت محتاط / باریک بین",
    english: "Showing great attention to detail; very careful and precise.",
    usage: "Sarah gave a meticulous preparation for her TOEFL speaking exam.",
    romanized: "Nihayat mohtat, barik been."
  },
  {
    category: 'academic',
    word: "Acquiesce",
    part: "verb",
    ipa: "/ˌæwiˈɛs/",
    urdu: "خاموشی سے قبول کرنا",
    english: "Accept something reluctantly but without protest.",
    usage: "The team had to acquiesce to the client's strict UI requirements.",
    romanized: "Khamoshi se qabool karna."
  },
  // Idioms
  {
    category: 'idioms',
    word: "Burn the midnight oil",
    part: "idiom",
    ipa: "N/A",
    urdu: "دیر رات تک سخت محنت کرنا",
    english: "To read or work late into the night.",
    usage: "Pakistani students burn the midnight oil to crack CSS exams.",
    romanized: "Dair raat tak sakht mehnat karna."
  },
  {
    category: 'idioms',
    word: "Bite the bullet",
    part: "idiom",
    ipa: "N/A",
    urdu: "مشکل کا ہمت سے مقابلہ کرنا",
    english: "To face a difficult situation with courage and execute anyway.",
    usage: "He decided to bite the bullet and give the spoken presentation.",
    romanized: "Mushkil ka himmat se muqabla karna."
  },
  // Business Phrasal
  {
    category: 'phrasals',
    word: "Call off",
    part: "phrasal verb",
    ipa: "N/A",
    urdu: "منسوخ کرنا / روک دینا",
    english: "To cancel an event or an ongoing scheduled activity.",
    usage: "They decided to call off the evening meeting because of the rainfall.",
    romanized: "Mansookh karna."
  },
  {
    category: 'phrasals',
    word: "Get the ball rolling",
    part: "idiom/verb phrase",
    ipa: "N/A",
    urdu: "کام کا آغاز کرنا / پہل کرنا",
    english: "To start an activity or project carefully so progress can initiate.",
    usage: "Let's get the ball rolling on designing the custom UI screens.",
    romanized: "Kaam ka aaghaz karna."
  }
];

export default function VocabBuilder({ user, profile, onSaveLesson, toast }: VocabBuilderProps) {
  const [activeCat, setActiveCat] = useState('academic');
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const filteredVocab = VOCAB_DATA.filter(item => item.category === activeCat);

  const handleSpeakWord = async (word: string) => {
    setPlayingWord(word);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word, voice: 'Kore' })
      });
      const data = await response.json();
      if (data.audio) {
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        audio.play();
        audio.onended = () => setPlayingWord(null);
      } else {
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
        utter.onend = () => setPlayingWord(null);
      }
    } catch (err) {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
      utter.onend = () => setPlayingWord(null);
    }
  };

  const handleSaveVocabCard = (item: typeof VOCAB_DATA[0]) => {
    onSaveLesson({
      userId: user?.uid || 'guest_id',
      type: 'vocabulary',
      title: `${item.word} (${item.part})`,
      content: `Definition: ${item.english}\n\nExample usage: "${item.usage}"\n\nPhonetics/IPA Dialect spelling: ${item.ipa}\nRoman Urdu context: ${item.romanized}`,
      translation: item.urdu
    });
    toast(`"${item.word}" word favorited and saved to dashboard study desk!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title block */}
      <div>
        <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
          Lexicon Builder
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-905 font-display mt-2">
          Interactive Vocabulary & Idiom Vault
        </h1>
        <p className="text-slate-500 text-xs md:text-sm">
          Expand your english expression bank safely. Study common idioms and business verbal phrasals, play high-fidelity auditory speakouts, and collect flashcard sets.
        </p>
      </div>

      {/* Main grids layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side selectors */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Vocabulary Categories
          </span>

          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                id={`vocab-cat-${cat.id}`}
                onClick={() => setActiveCat(cat.id)}
                className={`cursor-pointer w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  activeCat === cat.id
                    ? "border-brand-500 bg-brand-50/50 text-brand-800"
                    : "border-slate-100 bg-slate-50/20 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{cat.label}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 ${activeCat === cat.id ? "text-brand-600" : ""}`} />
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-blue-50/30 border border-blue-100/30 rounded-2xl text-xs text-brand-800 space-y-1 bg-opacity-40">
            💡 <strong>Why memorize Idioms?</strong> Idioms (محاورے) make you sound natural and fluent. Adding metaphors shows high advanced proficiency during evaluation.
          </div>
        </div>

        {/* Right word grids */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
          {filteredVocab.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 uppercase border border-slate-100 font-mono">
                    {item.part}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.ipa}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight flex items-center justify-between">
                  {item.word}
                </h3>

                {/* Urdu transliteration sentence */}
                <h4 className="text-slate-800 text-sm md:text-base font-semibold italic Urdu mt-2 border-l-4 border-brand-500 pl-3">
                  {item.urdu}
                </h4>

                <div className="mt-4 space-y-2.5">
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    <strong>Definition:</strong> {item.english}
                  </p>
                  <p className="text-xs text-brand-800 italic bg-brand-50/20 p-2.5 rounded-xl border border-brand-100/30">
                    💡 <strong>Example Usage:</strong> &quot;{item.usage}&quot;
                  </p>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-4 mt-6 border-t border-slate-100/60 text-slate-400">
                <button
                  id={`vocab-voice-${item.word}`}
                  title="Pronounce Word"
                  disabled={playingWord === item.word}
                  onClick={() => handleSpeakWord(item.word)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-slate-50 hover:text-brand-600 transition-all text-slate-500"
                >
                  <Volume2 className={`w-4 h-4 ${playingWord === item.word ? "animate-bounce text-emerald-500 font-bold" : ""}`} />
                </button>
                <button
                  id={`vocab-save-${item.word}`}
                  title="Favorite and Add to Study Deck"
                  onClick={() => handleSaveVocabCard(item)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition-all text-slate-500"
                >
                  <Star className="w-4 h-4 text-slate-400 hover:text-yellow-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
