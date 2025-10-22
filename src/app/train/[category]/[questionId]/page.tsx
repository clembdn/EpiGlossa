'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, XCircle, Lightbulb, Trophy, Timer, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Question, Choice } from '@/types/question';

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
    color: 'from-pink-400 to-rose-400',
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

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const questionId = params.questionId as string;
  const info = categoryInfo[category];

  const [question, setQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]); // For READING COMPREHENSION
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // For READING COMPREHENSION
  const [selectedGapAnswers, setSelectedGapAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        
        if (category === 'reading_comprehension') {
          // Fetch all 3 questions for this passage
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('passage_id', questionId)
            .order('question_number', { ascending: true });

          if (error) throw error;
          setQuestions(data || []);
        } else {
          // Fetch single question
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('id', questionId)
            .single();

          if (error) throw error;
          setQuestion(data);
        }
      } catch (err) {
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, category]);

  useEffect(() => {
    if (!isSubmitted && !loading) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSubmitted, loading]);

  const handleSubmit = () => {
    // For READING COMPREHENSION: check if all 3 questions are answered
    if (category === 'reading_comprehension') {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(selectedAnswers).length;
      if (answeredQuestions < totalQuestions) return;
    }
    // For TEXT COMPLETION: check if all gaps are filled
    else if (question?.text_with_gaps && question?.gap_choices) {
      const totalGaps = Object.keys(question.gap_choices).length;
      const filledGaps = Object.keys(selectedGapAnswers).length;
      if (filledGaps < totalGaps) return;
    } else {
      // For standard questions
      if (!selectedAnswer) return;
    }
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswer = () => {
    return question?.choices.find(choice => choice.is_correct);
  };

  const isCorrect = () => {
    // For READING COMPREHENSION: check all 3 answers
    if (category === 'reading_comprehension') {
      return questions.every((q) => {
        const selectedOption = selectedAnswers[q.id];
        if (!selectedOption) return false;
        const correctChoice = q.choices.find(c => c.is_correct);
        return selectedOption === correctChoice?.option;
      });
    }
    // For TEXT COMPLETION: check all gaps
    if (question?.text_with_gaps && question?.gap_choices) {
      return Object.entries(selectedGapAnswers).every(([gapNumber, selectedOption]) => {
        const gapChoices = question.gap_choices?.[gapNumber];
        if (!gapChoices) return false;
        const selectedChoice = gapChoices.find(c => c.option === selectedOption);
        return selectedChoice?.is_correct === true;
      });
    }
    // For standard questions
    const correctAnswer = getCorrectAnswer();
    return selectedAnswer === correctAnswer?.option;
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

  if (!question && questions.length === 0) {
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
  if (category === 'reading_comprehension' && questions.length > 0) {
    const passageImage = questions[0]?.image_url;
    
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

              {/* Timer */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-md border-2 border-gray-100">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-gray-800">{formatTime(timeElapsed)}</span>
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
                className="w-full rounded-2xl shadow-lg"
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
                        whileHover={!isSubmitted ? { scale: 1.02, x: 4 } : {}}
                        whileTap={!isSubmitted ? { scale: 0.98 } : {}}
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
              whileHover={Object.keys(selectedAnswers).length >= questions.length ? { scale: 1.02 } : {}}
              whileTap={Object.keys(selectedAnswers).length >= questions.length ? { scale: 0.98 } : {}}
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
                      ? 'Tu as répondu correctement aux 3 questions !'
                      : 'Continue à t\'entraîner, tu vas y arriver !'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`px-6 py-3 rounded-2xl ${
                    isCorrect() ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-6 h-6 ${isCorrect() ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`font-bold text-xl ${isCorrect() ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect() ? '+150 XP' : '+0 XP'}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-blue-100 border-2 border-blue-300">
                    <div className="flex items-center gap-2">
                      <Timer className="w-6 h-6 text-blue-600" />
                      <span className="font-bold text-xl text-blue-800">{formatTime(timeElapsed)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.back()}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-2xl transition-all"
                >
                  Retour aux questions
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!question || !info) {
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

            {/* Timer */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-md border-2 border-gray-100">
              <Timer className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-800">{formatTime(timeElapsed)}</span>
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
          {question.audio_url && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-gray-800">Écoute l'audio</h3>
              </div>
              <audio controls className="w-full" src={question.audio_url}>
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </motion.div>
          )}

          {/* Image (if image question) */}
          {question.image_url && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <img
                src={question.image_url}
                alt="Question illustration"
                className="w-full rounded-2xl shadow-lg"
              />
            </motion.div>
          )}

          {/* Question Text */}
          {question.question_text && !question.text_with_gaps && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                {question.question_text}
              </h2>
            </div>
          )}

          {/* TEXT COMPLETION: Text with dropdown menus */}
          {question.text_with_gaps && question.gap_choices && (
            <div className="mb-8">
              <div className="prose prose-lg max-w-none">
                {(() => {
                  const text = question.text_with_gaps;
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
                    const gapChoices = question.gap_choices?.[gapNumber] || [];
                    const selectedOption = selectedGapAnswers[gapNumber];
                    const isGapSubmitted = isSubmitted;
                    
                    let selectBorderColor = 'border-gray-300';
                    let selectBgColor = 'bg-white';
                    
                    if (isGapSubmitted && selectedOption) {
                      const selectedChoice = gapChoices.find(c => c.option === selectedOption);
                      if (selectedChoice?.is_correct) {
                        selectBorderColor = 'border-green-400 bg-green-50';
                      } else {
                        selectBorderColor = 'border-red-400 bg-red-50';
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
                        className={`inline-block mx-1 px-3 py-2 rounded-lg border-2 ${selectBorderColor} ${selectBgColor} font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
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
          {question.choices && question.choices.length > 0 && (
            <div className="space-y-3">
            {question.choices.map((choice: Choice, index: number) => {
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
                  whileHover={!isSubmitted ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.98 } : {}}
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
            disabled={question.text_with_gaps ? Object.keys(selectedGapAnswers).length < Object.keys(question.gap_choices || {}).length : !selectedAnswer}
            whileHover={(question.text_with_gaps ? Object.keys(selectedGapAnswers).length >= Object.keys(question.gap_choices || {}).length : selectedAnswer) ? { scale: 1.02 } : {}}
            whileTap={(question.text_with_gaps ? Object.keys(selectedGapAnswers).length >= Object.keys(question.gap_choices || {}).length : selectedAnswer) ? { scale: 0.98 } : {}}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
              (question.text_with_gaps ? Object.keys(selectedGapAnswers).length >= Object.keys(question.gap_choices || {}).length : selectedAnswer)
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
                    {isCorrect() ? 'Tu as trouvé la bonne réponse !' : 'Continue à t\'entraîner !'}
                  </p>
                </div>
                {isCorrect() && (
                  <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-xl">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <span className="font-bold text-yellow-700">+50 XP</span>
                  </div>
                )}
              </div>

              {/* Explanation */}
              {showExplanation && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 bg-white/50 rounded-2xl p-5 border-2 border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Explication</h4>
                      <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.back()}
                  className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Retour aux questions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // TODO: Navigate to next question
                    router.back();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Question suivante
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
