import type { QuestionCategory } from './question';

export interface ToeicResultEntry {
  questionInstanceId: string;
  questionNumber: number;
  isCorrect: boolean;
  points: number;
  category: QuestionCategory;
}
