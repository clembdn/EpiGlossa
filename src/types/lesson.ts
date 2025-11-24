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

export interface LessonProgress {
  lessonId: number;
  category: string;
  completed: boolean;
  score: number;
  xpEarned: number;
  completedAt?: Date;
}
