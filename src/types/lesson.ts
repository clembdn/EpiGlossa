export interface VocabularyWord {
  english: string;
  french: string;
  phonetic?: string;
  category: string;
  examples: {
    english: string;
    french: string;
  }[];
  tips?: string;
  frequency: 'essential' | 'important' | 'useful'; // Fréquence d'apparition au TOEIC
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: {
    english: string;
    french: string;
    correct: boolean;
  }[];
  tips?: string;
}

export interface ConjugationRule {
  title: string;
  explanation: string;
  examples: {
    english: string;
    french: string;
    correct: boolean;
  }[];
  tips?: string;
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'matching' | 'fill-blank' | 'translation' | 'listening';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  audio?: string;
}

export interface VocabularyLesson {
  id: number;
  title: string;
  description: string;
  theme: string;
  xp: number;
  duration: number;
  words: VocabularyWord[];
  exercises: Exercise[];
  locked: boolean;
  completed: boolean;
  status: 'locked' | 'available' | 'completed';
}

export interface GrammarLesson {
  id: number;
  title: string;
  description: string;
  theme: string;
  xp: number;
  duration: number;
  rules: GrammarRule[];
  exercises: Exercise[];
  locked: boolean;
  completed: boolean;
  status: 'locked' | 'available' | 'completed';
}

export interface ConjugationLesson {
  id: number;
  title: string;
  description: string;
  theme: string;
  xp: number;
  duration: number;
  tense: string;
  rules: ConjugationRule[];
  exercises: Exercise[];
  locked: boolean;
  completed: boolean;
  status: 'locked' | 'available' | 'completed';
}

export interface ComprehensionStrategy {
  title: string;
  explanation: string;
  tips?: string;
  examples: string[];
}

export interface ComprehensionPassage {
  id: string;
  text: string;
  type: 'email' | 'memo' | 'article' | 'announcement' | 'advertisement';
}

export interface ComprehensionLesson {
  id: number;
  title: string;
  description: string;
  theme: string;
  xp: number;
  duration: number;
  strategies: ComprehensionStrategy[];
  passages: ComprehensionPassage[];
  exercises: Exercise[];
  locked: boolean;
  completed: boolean;
  status: 'locked' | 'available' | 'completed';
}

export interface LessonProgress {
  lessonId: number;
  category: string;
  completed: boolean;
  score: number;
  xpEarned: number;
  completedAt?: Date;
}
