import type { Question, QuestionCategory, Choice } from '@/types/question';

const CATEGORY_COUNTS: Record<QuestionCategory, number> = {
  audio_with_images: 20,
  qa: 30,
  short_conversation: 30,
  short_talks: 19,
  incomplete_sentences: 40,
  text_completion: 5,
  reading_comprehension: 13,
};

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  audio_with_images: 'Audio + Images',
  qa: 'Questions & Réponses',
  short_conversation: 'Conversations courtes',
  short_talks: 'Exposés courts',
  incomplete_sentences: 'Phrases à compléter',
  text_completion: 'Textes à compléter',
  reading_comprehension: 'Compréhension écrite',
};

const CHOICE_OPTIONS: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

const createChoices = (category: QuestionCategory, index: number): Choice[] =>
  CHOICE_OPTIONS.map((option, optionIndex) => ({
    option,
    text: `${CATEGORY_LABELS[category]} — proposition ${option} (question ${index + 1})`,
    is_correct: optionIndex === 0,
  }));

const createTextCompletionQuestion = (index: number): Question => {
  const baseId = `mock-text_completion-${index + 1}`;
  return {
    id: baseId,
    category: 'text_completion',
    question_text: null,
    audio_url: null,
    image_url: null,
    choices: [],
    explanation: `Complétez correctement les 4 espaces du texte ${index + 1}.`,
    text_with_gaps:
      `Notre équipe [1] rencontrer le client [2] matin afin de [3] les objectifs ` +
      `prioritaires avant la date [4].`,
    gap_choices: {
      '1': CHOICE_OPTIONS.map((option, optionIndex) => ({
        option,
        text: optionIndex === 0 ? 'va' : optionIndex === 1 ? 'voudra' : optionIndex === 2 ? 'avait' : 'aurait',
        is_correct: optionIndex === 0,
      })),
      '2': CHOICE_OPTIONS.map((option, optionIndex) => ({
        option,
        text: optionIndex === 0 ? 'demain' : optionIndex === 1 ? 'hier' : optionIndex === 2 ? 'tard' : 'souvent',
        is_correct: optionIndex === 0,
      })),
      '3': CHOICE_OPTIONS.map((option, optionIndex) => ({
        option,
        text: optionIndex === 0 ? 'aligner' : optionIndex === 1 ? 'ignorer' : optionIndex === 2 ? 'modifier' : 'interrompre',
        is_correct: optionIndex === 0,
      })),
      '4': CHOICE_OPTIONS.map((option, optionIndex) => ({
        option,
        text: optionIndex === 0 ? 'limite' : optionIndex === 1 ? 'flexible' : optionIndex === 2 ? 'annulée' : 'facultative',
        is_correct: optionIndex === 0,
      })),
    },
  };
};

const createReadingComprehensionQuestions = (count: number): Question[] => {
  const questions: Question[] = [];
  let passageIndex = 1;

  while (questions.length < count) {
    const passageId = `mock-reading-${passageIndex}`;
    const passageImage = `https://placehold.co/800x450?text=Passage+${passageIndex}`;

    for (let questionNumber = 1; questionNumber <= 3 && questions.length < count; questionNumber++) {
      questions.push({
        id: `${passageId}-q${questionNumber}`,
        category: 'reading_comprehension',
        question_text: `D'après le passage ${passageIndex}, quelle est la bonne réponse pour la question ${questionNumber} ?`,
        audio_url: null,
        image_url: passageImage,
        choices: createChoices('reading_comprehension', questions.length),
        explanation: `Dans le passage ${passageIndex}, la section ${questionNumber} justifie cette réponse.`,
        passage_id: passageId,
        question_number: questionNumber,
      });
    }

    passageIndex++;
  }

  return questions;
};

const createStandardQuestion = (category: QuestionCategory, index: number): Question => {
  const id = `mock-${category}-${index + 1}`;
  return {
    id,
    category,
    question_text: `Question ${index + 1} — ${CATEGORY_LABELS[category]}`,
    audio_url:
      category === 'audio_with_images' || category === 'qa' || category === 'short_conversation' || category === 'short_talks'
        ? `https://audio.tepitech.mock/${category}/${index + 1}.mp3`
        : null,
    image_url: category === 'audio_with_images' ? `https://placehold.co/600x400?text=Scene+${index + 1}` : null,
    choices: createChoices(category, index),
    explanation: `La bonne réponse est l'option A pour ${CATEGORY_LABELS[category]} ${index + 1}.`,
  };
};

const buildMockBank = (): Record<QuestionCategory, Question[]> => {
  const bank = {} as Record<QuestionCategory, Question[]>;
  (Object.keys(CATEGORY_COUNTS) as QuestionCategory[]).forEach((category) => {
    const count = CATEGORY_COUNTS[category];
    if (category === 'text_completion') {
      bank[category] = Array.from({ length: count }, (_, index) => createTextCompletionQuestion(index));
    } else if (category === 'reading_comprehension') {
      bank[category] = createReadingComprehensionQuestions(count);
    } else {
      bank[category] = Array.from({ length: count }, (_, index) => createStandardQuestion(category, index));
    }
  });
  return bank;
};

const mockQuestionBank = buildMockBank();

export function getMockQuestions(category: QuestionCategory, count?: number): Question[] {
  const questions = mockQuestionBank[category] || [];
  if (!count || questions.length >= count) {
    return count ? questions.slice(0, count) : questions;
  }

  const extended: Question[] = [];
  while (extended.length < count) {
    extended.push(...questions);
  }
  return extended.slice(0, count);
}

export function findMockQuestion(category: QuestionCategory, id: string): Question | undefined {
  return mockQuestionBank[category]?.find((question) => question.id === id);
}

export function getMockReadingPassage(passageId: string): Question[] {
  return mockQuestionBank.reading_comprehension.filter((question) => question.passage_id === passageId);
}
