'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, XCircle, Lightbulb, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Question, Choice } from '@/types/question';
import AudioPlayer from '@/components/ui/audio-player';
import { useCategoryProgress } from '@/hooks/useProgress';
import { XPGainNotification } from '@/components/ProgressComponents';
import { useSingleQuestionCache, useReadingPassageCache } from '@/hooks/useSingleQuestionCache';
import { useStreak } from '@/hooks/useStreak';

const categoryInfo: Record<string, {
  name: string;
  emoji: string;
  color: string;
}> = {
  'audio_with_images': {
    name: 'Audio avec Images',
    emoji: '🎧',
    color: 'from-purple-400 to-pink-400',
  },
  'qa': {
    name: 'Questions & Réponses',
    emoji: '❓',
    color: 'from-blue-400 to-cyan-400',
  },
  'short_conversation': {
    name: 'Conversations Courtes',
    emoji: '💬',
    color: 'from-green-400 to-emerald-400',
  },
  'short_talks': {
    name: 'Exposés Courts',
    emoji: '🎤',
    color: 'from-orange-400 to-red-400',
  },
  'incomplete_sentences': {
    name: 'Phrases à Compléter',
    emoji: '✍️',
    color: 'from-amber-400 to-yellow-400',
  },
  'text_completion': {
    name: 'Textes à Compléter',
    emoji: '📝',
    color: 'from-indigo-400 to-purple-400',
  },
  'reading_comprehension': {
    name: 'Compréhension Écrite',
    emoji: '📚',
    color: 'from-teal-400 to-cyan-400',
  },
};

// Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fonction pour mélanger les choix en gardant les lettres A, B, C, D dans l'ordre
function shuffleChoicesKeepingLabels(choices: Choice[]): Choice[] {
  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const shuffledTexts = shuffleArray(choices);
  
  return shuffledTexts.map((choice, index) => ({
    option: labels[index],
    text: choice.text,
    is_correct: choice.is_correct
  }));
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const questionId = params.questionId as string;
  const info = categoryInfo[category];
  
  // États locaux
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // For READING COMPREHENSION
  const [selectedGapAnswers, setSelectedGapAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Système de progression XP
  const { submitAnswer, refresh: refreshProgress, isQuestionCompleted } = useCategoryProgress(category);
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [wasAlreadyCompleted, setWasAlreadyCompleted] = useState(false);

  // Hook de streak
  const { updateStreak } = useStreak();

  // Hooks de cache conditionnels selon le type de question
  const singleQuestionCache = category !== 'reading_comprehension' 
    ? useSingleQuestionCache(questionId, category)
    : { question: null, loading: false, fromCache: false };
    
  const readingPassageCache = category === 'reading_comprehension'
    ? useReadingPassageCache(questionId)
    : { questions: [], loading: false, fromCache: false };

  // Déterminer question(s) et état de chargement
  const question = category === 'reading_comprehension' ? null : singleQuestionCache.question;
  const questions = category === 'reading_comprehension' ? readingPassageCache.questions : [];
  const loading = category === 'reading_comprehension' ? readingPassageCache.loading : singleQuestionCache.loading;

  // Mélanger les choix une seule fois au chargement
  const [shuffledQuestion, setShuffledQuestion] = useState<Question | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (category === 'reading_comprehension' && questions.length > 0) {
      // Vérifier si on a déjà un ordre mélangé en cache
      const cacheKey = `shuffled_passage_${questionId}`;
      const cachedOrder = sessionStorage.getItem(cacheKey);
      
      let questionsWithShuffledChoices;
      if (cachedOrder) {
        // Utiliser l'ordre en cache
        questionsWithShuffledChoices = JSON.parse(cachedOrder);
      } else {
        // Mélanger pour la première fois et sauvegarder
        questionsWithShuffledChoices = questions.map(q => ({
          ...q,
          choices: shuffleChoicesKeepingLabels(q.choices)
        }));
        sessionStorage.setItem(cacheKey, JSON.stringify(questionsWithShuffledChoices));
      }
      setShuffledQuestions(questionsWithShuffledChoices);
    }
  }, [questions, category, questionId]);

  useEffect(() => {
    if (question && category !== 'reading_comprehension') {
      // Vérifier si on a déjà un ordre mélangé en cache
      const cacheKey = `shuffled_question_${questionId}`;
      const cachedOrder = sessionStorage.getItem(cacheKey);
      
      let questionWithShuffledChoices: Question;
      if (cachedOrder) {
        // Utiliser l'ordre en cache
        questionWithShuffledChoices = JSON.parse(cachedOrder);
      } else {
        // Mélanger pour la première fois
        questionWithShuffledChoices = { ...question };

        if (questionWithShuffledChoices.choices) {
          questionWithShuffledChoices = {
            ...questionWithShuffledChoices,
            choices: shuffleChoicesKeepingLabels(questionWithShuffledChoices.choices)
          };
        }
        
        if (questionWithShuffledChoices.gap_choices) {
          const shuffledGapChoices: Record<string, Choice[]> = {};
          Object.keys(questionWithShuffledChoices.gap_choices).forEach(gapNumber => {
            shuffledGapChoices[gapNumber] = shuffleChoicesKeepingLabels(questionWithShuffledChoices.gap_choices![gapNumber]);
          });
          questionWithShuffledChoices = {
            ...questionWithShuffledChoices,
            gap_choices: shuffledGapChoices
          };
        }
        
        // Sauvegarder l'ordre mélangé en cache
        sessionStorage.setItem(cacheKey, JSON.stringify(questionWithShuffledChoices));
      }
      
      setShuffledQuestion(questionWithShuffledChoices);
    }
  }, [question, category, questionId]);

  const handleSubmit = async () => {
    const currentQuestions = category === 'reading_comprehension' ? shuffledQuestions : [];
    const currentQuestion = category !== 'reading_comprehension' ? shuffledQuestion : null;
    
    if (category === 'reading_comprehension') {
      const totalQuestions = currentQuestions.length;
      const answeredQuestions = Object.keys(selectedAnswers).length;
      if (answeredQuestions < totalQuestions) return;
    }
    else if (currentQuestion?.text_with_gaps && currentQuestion?.gap_choices) {
      const totalGaps = Object.keys(currentQuestion.gap_choices).length;
      const filledGaps = Object.keys(selectedGapAnswers).length;
      if (filledGaps < totalGaps) return;
    } else {
      if (!selectedAnswer) return;
    }
    
    // Vérifier si la question était déjà complétée AVANT de soumettre
    if (category === 'reading_comprehension') {
      const allCompleted = currentQuestions.every(q => isQuestionCompleted(q.id));
      setWasAlreadyCompleted(allCompleted);
    } else {
      setWasAlreadyCompleted(isQuestionCompleted(questionId));
    }
    
    setIsSubmitted(true);
    setShowExplanation(true);
    
    // Sauvegarder la progression
    let totalXpGained = 0;
    
    if (category === 'reading_comprehension') {
      // Pour les passages de lecture, sauvegarder chaque question séparément
      for (const q of currentQuestions) {
        const selectedOption = selectedAnswers[q.id];
        if (selectedOption) {
          const correctChoice = q.choices.find(c => c.is_correct);
          const isQuestionCorrect = selectedOption === correctChoice?.option;
          const result = await submitAnswer(q.id, isQuestionCorrect);
          if (result.success && result.xpGained) {
            totalXpGained += result.xpGained;
          }
        }
      }
    } else {
      // Pour les questions standard, sauvegarder une seule réponse
      const correct = isCorrect();
      const result = await submitAnswer(questionId, correct);
      if (result.success && result.xpGained) {
        totalXpGained = result.xpGained;
      }
    }
    
    // Afficher la notification XP si on a gagné des points
    if (totalXpGained > 0) {
      setXpGained(totalXpGained);
      setShowXPNotification(true);
      
      // Mettre à jour le streak quand l'utilisateur répond correctement
      await updateStreak();
    }
    
    // Rafraîchir les stats
    await refreshProgress();
  };

  const getCorrectAnswer = () => {
    return shuffledQuestion?.choices.find(choice => choice.is_correct);
  };

  const isCorrect = () => {
    const currentQuestions = category === 'reading_comprehension' ? shuffledQuestions : [];
    const currentQuestion = category !== 'reading_comprehension' ? shuffledQuestion : null;
    
    // For READING COMPREHENSION: check all 3 answers
    if (category === 'reading_comprehension') {
      return currentQuestions.every((q) => {
        const selectedOption = selectedAnswers[q.id];
        if (!selectedOption) return false;
        // Trouver le choix sélectionné et vérifier s'il est correct
        const selectedChoice = q.choices.find(c => c.option === selectedOption);
        return selectedChoice?.is_correct === true;
      });
    }
    // For TEXT COMPLETION: check all gaps
    if (currentQuestion?.text_with_gaps && currentQuestion?.gap_choices) {
      return Object.entries(selectedGapAnswers).every(([gapNumber, selectedOption]) => {
        const gapChoices = currentQuestion.gap_choices?.[gapNumber];
        if (!gapChoices) return false;
        const selectedChoice = gapChoices.find(c => c.option === selectedOption);
        return selectedChoice?.is_correct === true;
      });
    }
    // For standard questions - Vérifier directement si le choix sélectionné est correct
    if (!selectedAnswer || !currentQuestion) return false;
    const selectedChoice = currentQuestion.choices?.find(c => c.option === selectedAnswer);
    return selectedChoice?.is_correct === true;
  };

  const handleNextQuestion = () => {
    // Récupérer l'ordre des questions depuis sessionStorage
    const orderStr = sessionStorage.getItem(`question_order_${category}`);
    if (!orderStr) {
      // Si pas d'ordre sauvegardé, retourner à la liste
      router.push(`/train/${category}`);
      return;
    }
    
    const questionOrder = JSON.parse(orderStr);
    const currentIndex = questionOrder.indexOf(questionId);
    
    if (currentIndex >= 0 && currentIndex < questionOrder.length - 1) {
      // Il y a une question suivante
      const nextQuestionId = questionOrder[currentIndex + 1];
      router.push(`/train/${category}/${nextQuestionId}`);
    } else {
      // C'est la dernière question, retourner à la liste
      router.push(`/train/${category}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Chargement de la question...</p>
        </div>
      </div>
    );
  }

  if (!shuffledQuestion && shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <p className="text-6xl mb-4">❌</p>
          <p className="text-gray-600 text-lg font-semibold mb-2">Question introuvable</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // For READING COMPREHENSION: render passage with 3 questions
  if (category === 'reading_comprehension' && shuffledQuestions.length > 0) {
    const passageImage = shuffledQuestions[0]?.image_url;
    
    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour aux questions
            </button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{info.emoji}</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">{info.name}</h1>
                  <p className="text-sm text-gray-500">3 questions sur le passage</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Passage Image */}
          {passageImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100 mb-6"
            >
              <img
                src={passageImage}
                alt="Reading passage"
                className="w-full max-h-64 md:max-h-72 object-contain mx-auto"
              />
            </motion.div>
          )}

          {/* 3 Questions */}
          {questions.map((q, qIndex) => {
            const questionSelectedAnswer = selectedAnswers[q.id];
            
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-teal-100 mb-6"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-bold">
                      Question {q.question_number}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                    {q.question_text}
                  </h2>
                </div>

                {/* Choices for this question */}
                <div className="space-y-3">
                  {q.choices.map((choice, choiceIndex) => {
                    const isSelected = questionSelectedAnswer === choice.option;
                    const isCorrectChoice = choice.is_correct;
                    const showResult = isSubmitted;

                    let borderColor = 'border-gray-200';
                    let bgColor = 'bg-white hover:bg-gray-50';
                    let textColor = 'text-gray-800';

                    if (showResult) {
                      if (isCorrectChoice) {
                        borderColor = 'border-green-400';
                        bgColor = 'bg-green-50';
                        textColor = 'text-green-800';
                      } else if (isSelected && !isCorrectChoice) {
                        borderColor = 'border-red-400';
                        bgColor = 'bg-red-50';
                        textColor = 'text-red-800';
                      }
                    } else if (isSelected) {
                      borderColor = 'border-blue-400';
                      bgColor = 'bg-blue-50';
                      textColor = 'text-blue-800';
                    }

                    return (
                      <motion.button
                        key={choice.option}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: choiceIndex * 0.1 }}
                        onClick={() => !isSubmitted && setSelectedAnswers(prev => ({ ...prev, [q.id]: choice.option }))}
                        disabled={isSubmitted}
                        
                        className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all ${
                          isSubmitted ? 'cursor-default' : 'cursor-pointer'
                        } relative overflow-hidden group`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${
                            showResult && isCorrectChoice
                              ? 'bg-green-500 text-white'
                              : showResult && isSelected && !isCorrectChoice
                              ? 'bg-red-500 text-white'
                              : isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }`}>
                            {choice.option}
                          </div>
                          <span className={`flex-1 font-medium ${textColor}`}>
                            {choice.text}
                          </span>
                          <AnimatePresence>
                            {showResult && isCorrectChoice && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              >
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              </motion.div>
                            )}
                            {showResult && isSelected && !isCorrectChoice && (
                              <motion.div
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              >
                                <XCircle className="w-6 h-6 text-red-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation for this question */}
                {isSubmitted && q.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-blue-900 mb-1">Explication</h4>
                        <p className="text-gray-700 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Submit Button */}
          {!isSubmitted && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                Object.keys(selectedAnswers).length >= questions.length
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-2xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Valider mes réponses ({Object.keys(selectedAnswers).length}/{questions.length})
            </motion.button>
          )}

          {/* Result Card */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`p-6 md:p-8 rounded-3xl shadow-2xl border-2 ${
                  isCorrect()
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                }`}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    className="text-6xl md:text-7xl mb-4"
                  >
                    {isCorrect() ? '🎉' : '💪'}
                  </motion.div>
                  <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${
                    isCorrect() ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect() ? 'Parfait !' : 'Pas tout à fait...'}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {isCorrect()
                      ? (wasAlreadyCompleted 
                          ? 'Tu maintiens ton score ! Excellent travail de révision !' 
                          : 'Tu as répondu correctement aux 3 questions !')
                      : 'Continue à t\'entraîner, tu vas y arriver !'}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 mb-6">
                  {xpGained > 0 && (
                    <div className={`px-6 py-3 rounded-2xl ${
                      isCorrect() ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-6 h-6 ${isCorrect() ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`font-bold text-xl ${isCorrect() ? 'text-green-800' : 'text-red-800'}`}>
                          +{xpGained} XP
                        </span>
                      </div>
                    </div>
                  )}
                  {wasAlreadyCompleted && isCorrect() && (
                    <div className="flex items-center gap-2 bg-blue-100 px-5 py-2 rounded-xl border-2 border-blue-300">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">Passage déjà maîtrisé ✨</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-2xl transition-all"
                >
                  Question suivante
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!shuffledQuestion || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <p className="text-6xl mb-4">❌</p>
          <p className="text-gray-600 text-lg font-semibold mb-2">Question introuvable</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour aux questions
          </button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{info.emoji}</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{info.name}</h1>
                <p className="text-sm text-gray-500">Question #{questionId.slice(0, 8)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100 mb-6"
        >
          {/* Audio Player (if audio question) */}
          {shuffledQuestion.audio_url && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <AudioPlayer
                src={shuffledQuestion.audio_url}
                label="Écoute l'audio"
                description="Clique sur lecture pour démarrer l'écoute."
              />
            </motion.div>
          )}

          {/* Image (if image question) */}
          {shuffledQuestion.image_url && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
                <img
                  src={shuffledQuestion.image_url}
                  alt="Question illustration"
                  className="w-full max-h-64 md:max-h-72 object-contain mx-auto rounded-2xl"
                />
            </motion.div>
          )}

          {/* Question Text */}
          {shuffledQuestion.question_text && !shuffledQuestion.text_with_gaps && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                {shuffledQuestion.question_text}
              </h2>
            </div>
          )}

          {/* TEXT COMPLETION: Text with dropdown menus */}
          {shuffledQuestion.text_with_gaps && shuffledQuestion.gap_choices && (
            <div className="mb-8">
              <div className="prose prose-lg max-w-none">
                {(() => {
                  const text = shuffledQuestion.text_with_gaps;
                  const parts: React.ReactNode[] = [];
                  let lastIndex = 0;
                  const regex = /\{\{(\d+)\}\}/g;
                  let match;

                  while ((match = regex.exec(text)) !== null) {
                    const gapNumber = match[1];
                    const beforeText = text.substring(lastIndex, match.index);
                    
                    // Add text before the gap
                    if (beforeText) {
                      parts.push(
                        <span key={`text-${lastIndex}`} className="text-gray-800 text-lg">
                          {beforeText}
                        </span>
                      );
                    }

                    // Add dropdown menu for the gap
                    const gapChoices = shuffledQuestion.gap_choices?.[gapNumber] || [];
                    const selectedOption = selectedGapAnswers[gapNumber];
                    const isGapSubmitted = isSubmitted;
                    
                    // Calculer les classes CSS en fonction de l'état
                    let selectClasses = 'border-gray-300 bg-white';
                    if (isGapSubmitted && selectedOption) {
                      const selectedChoice = gapChoices.find(c => c.option === selectedOption);
                      if (selectedChoice?.is_correct) {
                        selectClasses = 'border-green-400 bg-green-50';
                      } else {
                        selectClasses = 'border-red-400 bg-red-50';
                      }
                    }

                    parts.push(
                      <select
                        key={`gap-${gapNumber}`}
                        value={selectedOption || ''}
                        onChange={(e) => {
                          if (!isSubmitted) {
                            setSelectedGapAnswers(prev => ({
                              ...prev,
                              [gapNumber]: e.target.value
                            }));
                          }
                        }}
                        disabled={isSubmitted}
                        className={`inline-block mx-1 px-3 py-2 rounded-lg border-2 ${selectClasses} font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isSubmitted ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <option value="" disabled>
                          ({gapNumber})
                        </option>
                        {gapChoices.map((choice) => (
                          <option key={choice.option} value={choice.option}>
                            {choice.option}. {choice.text}
                          </option>
                        ))}
                      </select>
                    );

                    lastIndex = match.index + match[0].length;
                  }

                  // Add remaining text
                  if (lastIndex < text.length) {
                    parts.push(
                      <span key={`text-${lastIndex}`} className="text-gray-800 text-lg">
                        {text.substring(lastIndex)}
                      </span>
                    );
                  }

                  return <div className="leading-relaxed">{parts}</div>;
                })()}
              </div>
            </div>
          )}

          {/* Standard Choices (for non-TEXT COMPLETION questions) */}
          {shuffledQuestion.choices && shuffledQuestion.choices.length > 0 && (
            <div className="space-y-3">
            {shuffledQuestion.choices.map((choice: Choice, index: number) => {
              const isSelected = selectedAnswer === choice.option;
              const isCorrectChoice = choice.is_correct;
              const showResult = isSubmitted;

              let borderColor = 'border-gray-200';
              let bgColor = 'bg-white hover:bg-gray-50';
              let textColor = 'text-gray-800';

              if (showResult) {
                if (isCorrectChoice) {
                  borderColor = 'border-green-400';
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-800';
                } else if (isSelected && !isCorrectChoice) {
                  borderColor = 'border-red-400';
                  bgColor = 'bg-red-50';
                  textColor = 'text-red-800';
                }
              } else if (isSelected) {
                borderColor = 'border-blue-400';
                bgColor = 'bg-blue-50';
                textColor = 'text-blue-800';
              }

              return (
                <motion.button
                  key={choice.option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !isSubmitted && setSelectedAnswer(choice.option)}
                  disabled={isSubmitted}
                  
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all ${
                    isSubmitted ? 'cursor-default' : 'cursor-pointer'
                  } relative overflow-hidden group`}
                >
                  <div className="flex items-center gap-4">
                    {/* Option Letter */}
                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${
                      showResult && isCorrectChoice
                        ? 'bg-green-500 text-white'
                        : showResult && isSelected && !isCorrectChoice
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      {choice.option}
                    </div>

                    {/* Choice Text */}
                    <span className={`flex-1 font-medium ${textColor}`}>
                      {choice.text}
                    </span>

                    {/* Result Icon */}
                    <AnimatePresence>
                      {showResult && isCorrectChoice && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </motion.div>
                      )}
                      {showResult && isSelected && !isCorrectChoice && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <XCircle className="w-6 h-6 text-red-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        {!isSubmitted && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            disabled={shuffledQuestion.text_with_gaps ? Object.keys(selectedGapAnswers).length < Object.keys(shuffledQuestion.gap_choices || {}).length : !selectedAnswer}
            
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
              (shuffledQuestion.text_with_gaps ? Object.keys(selectedGapAnswers).length >= Object.keys(shuffledQuestion.gap_choices || {}).length : selectedAnswer)
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-2xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Valider ma réponse
          </motion.button>
        )}

        {/* Result Card */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`rounded-3xl p-6 md:p-8 shadow-xl border-2 ${
                isCorrect()
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isCorrect() ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isCorrect() ? (
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold ${
                    isCorrect() ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect() ? 'Excellent ! 🎉' : 'Pas tout à fait...'}
                  </h3>
                  <p className={`text-sm font-medium ${
                    isCorrect() ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isCorrect() 
                      ? (wasAlreadyCompleted 
                          ? 'Tu maintiens ton score ! Bravo pour la révision !' 
                          : 'Tu as trouvé la bonne réponse !')
                      : 'Continue à t\'entraîner !'}
                  </p>
                </div>
                {isCorrect() && (
                  <div className="flex flex-col gap-2">
                    {xpGained > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-xl">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                        <span className="font-bold text-yellow-700">+{xpGained} XP</span>
                      </div>
                    )}
                    {wasAlreadyCompleted && (
                      <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">Déjà maîtrisée ✨</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Explanation */}
              {showExplanation && shuffledQuestion.explanation && category !== 'audio_with_images' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 bg-white/50 rounded-2xl p-5 border-2 border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Explication</h4>
                      <p className="text-gray-700 leading-relaxed">{shuffledQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <motion.button
                  onClick={() => router.push(`/train/${category}`)}
                  className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Retour aux questions
                </motion.button>
                <motion.button
                  onClick={handleNextQuestion}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Question suivante
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Notification XP */}
      {showXPNotification && (
        <XPGainNotification 
          xpGained={xpGained} 
          onClose={() => setShowXPNotification(false)}
        />
      )}
    </div>
  );
}
