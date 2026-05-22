import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Firestore,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, QuizScore, SavedLesson, ChatMessage } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// Check if we have valid production or provisioned keys
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Validate connection to Firestore as mandated by SKILL.md
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db!, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration client network state.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Firebase SDK init failed. Using simulation fallback.", err);
  }
}

export { db, auth, googleProvider };

// Central Error Handler matching SKILL.md rules
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "mock-user-id",
      email: auth?.currentUser?.email || "mock-user@englishmate.ai",
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Persistence Utility for Sandbox Mode (LocalStorage)
const MOCK_DB_KEY = 'englishmate_offline_data_v1';

interface OfflineData {
  profile: UserProfile | null;
  quizHistory: any[];
  savedLessons: SavedLesson[];
  chats: ChatMessage[];
}

const defaultOfflineData: OfflineData = {
  profile: {
    userId: "student_offline_id",
    name: "Pakistani Student",
    email: "student@englishmate.ai",
    level: "B1",
    streak: 3,
    xp: 240,
    joinedAt: new Date().toISOString(),
    targetLanguage: "Urdu to English"
  },
  quizHistory: [
    {
      id: "q_h1",
      userId: "student_offline_id",
      quizType: "Active/Passive Voice",
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      timestamp: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: "q_h2",
      userId: "student_offline_id",
      quizType: "Prepositions Prep",
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  savedLessons: [
    {
      id: "sl1",
      userId: "student_offline_id",
      type: "sentence",
      title: "Where are you going?",
      content: "Where are you going?",
      translation: "آپ کہاں جا رہے ہیں؟",
      savedAt: new Date().toISOString()
    },
    {
      id: "sl2",
      userId: "student_offline_id",
      type: "vocabulary",
      title: "Persevere (استقلال دکھانا)",
      content: "Persevere: To continue in a course of action even in the face of difficulty or with little or no prospect of success.",
      translation: "مشکلات کے باوجود اپنے کام میں ڈٹے رہنا۔",
      savedAt: new Date().toISOString()
    }
  ],
  chats: [
    {
      id: "c1",
      userId: "student_offline_id",
      role: "assistant",
      content: "Assalam-o-Alaikum! Welcome to EnglishMate AI. What would you like to learn today? You can practice speaking, grammar correction, or quiz preparations here!",
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

function getOfflineData(): OfflineData {
  const data = localStorage.getItem(MOCK_DB_KEY);
  if (!data) {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(defaultOfflineData));
    return defaultOfflineData;
  }
  return JSON.parse(data);
}

function saveOfflineData(data: OfflineData) {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(data));
}

// DB & Auth Facade layer that automatically resolves between Firebase and Offline Storage Sandbox
export const dbService = {
  async getProfile(userId: string): Promise<UserProfile> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}`;
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        } else {
          // Initialize profile
          const initialProfile: UserProfile = {
            userId,
            name: auth?.currentUser?.displayName || "Student",
            email: auth?.currentUser?.email || "student@example.com",
            level: 'B1',
            streak: 1,
            xp: 10,
            joinedAt: new Date().toISOString(),
            targetLanguage: "Urdu & English"
          };
          await setDoc(docRef, initialProfile);
          return initialProfile;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
    
    // Sandbox
    const offline = getOfflineData();
    if (!offline.profile) {
      offline.profile = { ...defaultOfflineData.profile!, userId };
      saveOfflineData(offline);
    }
    return offline.profile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}`;
      try {
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, updates, { merge: true });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }

    // Sandbox
    const offline = getOfflineData();
    if (offline.profile && offline.profile.userId === userId) {
      offline.profile = { ...offline.profile, ...updates };
      saveOfflineData(offline);
    }
  },

  async addQuizScore(userId: string, quizScore: Omit<QuizScore, 'id' | 'timestamp'>): Promise<QuizScore> {
    const timestamp = new Date().toISOString();
    let docId = Math.random().toString(36).substr(2, 9);
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/quizHistory`;
      try {
        const colRef = collection(db, 'users', userId, 'quizHistory');
        const docRef = await addDoc(colRef, {
          ...quizScore,
          timestamp
        });
        docId = docRef.id;
        
        // Reward some XP for finishing quiz
        const userRef = doc(db, 'users', userId);
        const profileSnap = await getDoc(userRef);
        if (profileSnap.exists()) {
          const profile = profileSnap.data();
          await setDoc(userRef, {
            xp: (profile.xp || 0) + quizScore.score * 20,
            streak: (profile.streak || 1) + 1
          }, { merge: true });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      // Sandbox
      const offline = getOfflineData();
      const newScore = {
        id: docId,
        userId,
        ...quizScore,
        timestamp
      };
      offline.quizHistory.unshift(newScore);
      if (offline.profile) {
        offline.profile.xp += quizScore.score * 20;
        offline.profile.streak += 1;
      }
      saveOfflineData(offline);
    }

    return {
      id: docId,
      userId,
      ...quizScore,
      timestamp
    };
  },

  async getQuizHistory(userId: string): Promise<any[]> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/quizHistory`;
      try {
        const colRef = collection(db, 'users', userId, 'quizHistory');
        const q = query(colRef, orderBy('timestamp', 'desc'));
        const querySnap = await getDocs(q);
        return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    }

    // Sandbox
    return getOfflineData().quizHistory;
  },

  async getSavedLessons(userId: string): Promise<SavedLesson[]> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/savedLessons`;
      try {
        const colRef = collection(db, 'users', userId, 'savedLessons');
        const q = query(colRef, orderBy('savedAt', 'desc'));
        const querySnap = await getDocs(q);
        return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedLesson));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    }

    // Sandbox
    return getOfflineData().savedLessons;
  },

  async saveLesson(userId: string, lesson: Omit<SavedLesson, 'id' | 'savedAt'>): Promise<SavedLesson> {
    const savedAt = new Date().toISOString();
    let docId = Math.random().toString(36).substr(2, 9);
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/savedLessons`;
      try {
        const colRef = collection(db, 'users', userId, 'savedLessons');
        const docRef = await addDoc(colRef, {
          ...lesson,
          savedAt
        });
        docId = docRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      // Sandbox
      const offline = getOfflineData();
      const newLesson: SavedLesson = {
        id: docId,
        savedAt,
        ...lesson
      };
      const exists = offline.savedLessons.some(l => l.title === lesson.title);
      if (!exists) {
        offline.savedLessons.unshift(newLesson);
        saveOfflineData(offline);
      }
    }

    return {
      id: docId,
      savedAt,
      ...lesson
    };
  },

  async deleteSavedLesson(userId: string, lessonId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/savedLessons/${lessonId}`;
      try {
        const docRef = doc(db, 'users', userId, 'savedLessons', lessonId);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    // Sandbox
    const offline = getOfflineData();
    offline.savedLessons = offline.savedLessons.filter(l => l.id !== lessonId);
    saveOfflineData(offline);
  },

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/chats`;
      try {
        const colRef = collection(db, 'users', userId, 'chats');
        const q = query(colRef, orderBy('timestamp', 'asc'));
        const querySnap = await getDocs(q);
        return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    }

    // Sandbox
    return getOfflineData().chats;
  },

  async addChatMessage(userId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const timestamp = new Date().toISOString();
    let docId = Math.random().toString(36).substr(2, 9);
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/chats`;
      try {
        const colRef = collection(db, 'users', userId, 'chats');
        const docRef = await addDoc(colRef, {
          ...msg,
          timestamp
        });
        docId = docRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      // Sandbox
      const offline = getOfflineData();
      const newMsg: ChatMessage = {
        id: docId,
        timestamp,
        ...msg
      };
      offline.chats.push(newMsg);
      saveOfflineData(offline);
    }

    return {
      id: docId,
      timestamp,
      ...msg
    };
  },

  async clearChatHistory(userId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      const path = `users/${userId}/chats`;
      try {
        const colRef = collection(db, 'users', userId, 'chats');
        const snap = await getDocs(colRef);
        const batchDeletes = snap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(batchDeletes);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    // Sandbox
    const offline = getOfflineData();
    offline.chats = [
      {
        id: "c_init",
        userId,
        role: "assistant",
        content: "Chat cleared! Let's start a fresh practice lesson. How can I assist you in your English learning journey today?",
        timestamp: new Date().toISOString()
      }
    ];
    saveOfflineData(offline);
  }
};
