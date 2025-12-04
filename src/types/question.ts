export type QuestionCategory = 
  | 'audio_with_images'
  | 'qa'
  | 'short_conversation'
  | 'short_talks'
  | 'incomplete_sentences'
  | 'text_completion'
  | 'reading_comprehension'

export interface Choice {
  option: 'A' | 'B' | 'C' | 'D'
  text: string
  is_correct: boolean
}

// Pour TEXT COMPLETION : choix pour chaque trou
export interface GapChoices {
  [gapNumber: string]: Choice[] // "1": [choices], "2": [choices], etc.
}

export interface Question {
  id: string
  category: QuestionCategory
  question_text: string | null
  audio_url: string | null
  image_url: string | null
  choices: Choice[]
  explanation: string
  created_at?: string
  
  // Pour TEXT COMPLETION (texte avec trous)
  text_with_gaps?: string | null
  gap_choices?: GapChoices | null
  
  // Pour READING COMPREHENSION (numéro de question dans le passage)
  question_number?: number
  
  // Legacy: pour compatibilité avec l'ancien format TOEIC
  passage_id?: string
}

export interface AnswerState {
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  isSubmitted: boolean
  isCorrect: boolean | null
}

// ===== READING COMPREHENSION (nouveau format) =====

// Une question individuelle dans un passage RC
export interface RCQuestion {
  id: string  // ID de la BDD pour le suivi de progression
  question_text: string
  choices: Choice[]
}

// Un passage RC avec 1 à 3 questions groupées
export interface ReadingPassage {
  category: 'reading_comprehension'
  image_url: string
  questions: {
    [key: string]: RCQuestion // "1", "2", "3"
  }
  explanation: string
}

// Pour compatibilité avec l'ancien système et la base de données
export interface ReadingPassageLegacy {
  passage_id: string
  image_url: string | null
  questions: Question[]
}
