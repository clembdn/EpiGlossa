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

export interface Question {
  id: string
  category: QuestionCategory
  question_text: string | null
  audio_url: string | null
  image_url: string | null
  choices: Choice[]
  explanation: string
  created_at?: string
}

export interface AnswerState {
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  isSubmitted: boolean
  isCorrect: boolean | null
}
