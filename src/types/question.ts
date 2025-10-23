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
  
  // Pour READING COMPREHENSION (1 passage avec 3 questions)
  passage_id?: string | null
  question_number?: number | null
  
  // Pour TEXT COMPLETION (texte avec trous)
  text_with_gaps?: string | null
  gap_choices?: GapChoices | null
}

export interface AnswerState {
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  isSubmitted: boolean
  isCorrect: boolean | null
}

// Pour READING COMPREHENSION : groupe de 3 questions partageant le même passage
export interface ReadingPassage {
  passage_id: string
  image_url: string | null
  questions: Question[]
}
