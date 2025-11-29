import type { QuestionCategory } from '@/types/question';
import type { ToeicResultEntry } from '@/types/toeic';

export const TEPITECH_SECTION_CONFIG: Record<QuestionCategory, {
  start: number;
  count: number;
  category: QuestionCategory;
  pointsPerQuestion: number;
}> = {
  audio_with_images: { start: 1, count: 20, category: 'audio_with_images', pointsPerQuestion: 5 },
  qa: { start: 21, count: 30, category: 'qa', pointsPerQuestion: 5 },
  short_conversation: { start: 51, count: 30, category: 'short_conversation', pointsPerQuestion: 5 },
  short_talks: { start: 81, count: 19, category: 'short_talks', pointsPerQuestion: 5 },
  incomplete_sentences: { start: 100, count: 40, category: 'incomplete_sentences', pointsPerQuestion: 5 },
  text_completion: { start: 140, count: 5, category: 'text_completion', pointsPerQuestion: 5 },
  reading_comprehension: { start: 145, count: 13, category: 'reading_comprehension', pointsPerQuestion: 5 },
};

export const TEPITECH_SECTION_ORDER: QuestionCategory[] = [
  'audio_with_images',
  'qa',
  'short_conversation',
  'short_talks',
  'incomplete_sentences',
  'text_completion',
  'reading_comprehension',
];

export const TEPITECH_CATEGORY_INFO: Record<QuestionCategory, { name: string; emoji: string; maxPoints: number }> = {
  audio_with_images: { name: 'IMAGES', emoji: '🎧', maxPoints: 100 },
  qa: { name: 'Q&A', emoji: '❓', maxPoints: 150 },
  short_conversation: { name: 'SHORT CONVERSATIONS', emoji: '💬', maxPoints: 150 },
  short_talks: { name: 'SHORT TALKS', emoji: '🎤', maxPoints: 95 },
  incomplete_sentences: { name: 'INCOMPLETE SENTENCES', emoji: '✍️', maxPoints: 200 },
  text_completion: { name: 'TEXT COMPLETION', emoji: '📝', maxPoints: 100 },
  reading_comprehension: { name: 'READING COMPREHENSION', emoji: '📚', maxPoints: 195 },
};

export const TEPITECH_LISTENING_CATEGORIES: QuestionCategory[] = [
  'audio_with_images',
  'qa',
  'short_conversation',
  'short_talks',
];

export const TEPITECH_READING_CATEGORIES: QuestionCategory[] = [
  'incomplete_sentences',
  'text_completion',
  'reading_comprehension',
];

const LISTENING_SET = new Set(TEPITECH_LISTENING_CATEGORIES);
const READING_SET = new Set(TEPITECH_READING_CATEGORIES);

export interface ToeicCategoryScore {
  category: QuestionCategory;
  score: number;
  maxScore: number;
  questions: number;
}

export interface ToeicSummary {
  totalScore: number;
  listeningScore: number;
  readingScore: number;
  correctCount: number;
  incorrectCount: number;
  categoryScores: ToeicCategoryScore[];
}

export const buildInitialCategoryScores = (): ToeicCategoryScore[] =>
  Object.entries(TEPITECH_CATEGORY_INFO).map(([key, info]) => ({
    category: key as QuestionCategory,
    score: 0,
    maxScore: info.maxPoints,
    questions: 0,
  }));

export function computeToeicSummary(results: ToeicResultEntry[]): ToeicSummary {
  const categoryScores = buildInitialCategoryScores();
  const categoryMap = new Map<QuestionCategory, ToeicCategoryScore>(
    categoryScores.map((entry) => [entry.category, entry])
  );

  let listeningScore = 0;
  let readingScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  results.forEach((result) => {
    const categoryEntry = categoryMap.get(result.category);
    if (categoryEntry) {
      categoryEntry.score += result.points;
      categoryEntry.questions += 1;
    }

    if (result.isCorrect) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }

    if (LISTENING_SET.has(result.category)) {
      listeningScore += result.points;
    } else if (READING_SET.has(result.category)) {
      readingScore += result.points;
    }
  });

  return {
    totalScore: listeningScore + readingScore,
    listeningScore,
    readingScore,
    correctCount,
    incorrectCount,
    categoryScores,
  };
}
