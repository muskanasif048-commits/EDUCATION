export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  streak: number;
  xp: number;
  joinedAt: string;
  targetLanguage: string;
}

export interface QuizScore {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  quizType: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  urduExplanation: string;
}

export interface QuizObject {
  quizTitle: string;
  questions: QuizQuestion[];
  simulated?: boolean;
}

export interface SavedLesson {
  id: string;
  userId: string;
  type: 'sentence' | 'vocabulary' | 'grammar';
  title: string;
  content: string;
  translation?: string;
  savedAt: string;
}

export interface RecentActivity {
  id: string;
  type: 'quiz' | 'chat' | 'grammar' | 'vocab';
  title: string;
  description: string;
  timestamp: string;
}
