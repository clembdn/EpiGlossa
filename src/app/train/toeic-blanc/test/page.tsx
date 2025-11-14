'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Question } from '@/types/question';

// Structure du test TOEIC
const TOEIC_CONFIG = {
  'audio_with_images': { start: 1, count: 20, category: 'audio_with_images', points: 5 },
  'qa': { start: 21, count: 30, category: 'qa', points: 5 },
  'short_conversation': { start: 51, count: 30, category: 'short_conversation', points: 5 },
  'short_talks': { start: 81, count: 19, category: 'short_talks', points: 5 },
  'incomplete_sentences': { start: 100, count: 40, category: 'incomplete_sentences', points: 5 },
  'text_completion': { start: 140, count: 5, category: 'text_completion', points: 5 }, // 5 pts par trou, 4 trous = 20pts par question
  'reading_comprehension': { start: 145, count: 13, category: 'reading_comprehension', points: 5 }, // 3 questions par texte
};

const TOTAL_TIME = 120 * 60; // 2 heures en secondes

export default function ToeicBlancTestPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedGapAnswers, setSelectedGapAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioHasPlayed, setAudioHasPlayed] = useState(false);
  
  // Résultats
  const [results, setResults] = useState<{
    questionNumber: number;
    isCorrect: boolean;
    points: number;
    category: string;
  }[]>([]);
  
  // Détection de changement de page
  const [tabChangeDetected, setTabChangeDetected] = useState(false);

  // Charger toutes les questions du test
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const allTestQuestions: Question[] = [];

        // Charger chaque catégorie
        for (const [, config] of Object.entries(TOEIC_CONFIG)) {
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('category', config.category)
            .limit(config.count);

          if (error) throw error;
          
          if (data) {
            allTestQuestions.push(...data.slice(0, config.count));
          }
        }

        setAllQuestions(allTestQuestions);
        if (allTestQuestions.length > 0) {
          setCurrentQuestion(allTestQuestions[0]);
        }
      } catch (err) {
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Timer
  useEffect(() => {
    if (!hasStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Temps écoulé, terminer le test
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeRemaining]);

  // Démarrer le test automatiquement
  useEffect(() => {
    if (!loading && allQuestions.length > 0) {
      setHasStarted(true);
    }
  }, [loading, allQuestions]);

  // Détection de changement d'onglet/page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && currentQuestion) {
        // L'utilisateur a quitté la page
        setTabChangeDetected(true);
        // Passer automatiquement à la question suivante avec 0 point
        handleTabChangeViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasStarted, currentQuestion, currentQuestionIndex]);

  // Lecture automatique de l'audio
  useEffect(() => {
    if (currentQuestion?.audio_url && !audioHasPlayed && hasStarted) {
      // Attendre un peu avant de lire l'audio
      const timeout = setTimeout(() => {
        if (audioRef.current) {
          setIsAudioPlaying(true);
          audioRef.current.play().catch(err => console.error('Audio play error:', err));
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentQuestion, audioHasPlayed, hasStarted]);

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    setAudioHasPlayed(true);
  };

  const handleTabChangeViolation = useCallback(() => {
    // Enregistrer 0 point pour cette question
    const questionNum = getCurrentQuestionNumber();
    const category = currentQuestion?.category || '';
    
    setResults(prev => [...prev, {
      questionNumber: questionNum,
      isCorrect: false,
      points: 0,
      category,
    }]);

    // Passer à la question suivante
    moveToNextQuestion();
  }, [currentQuestion, currentQuestionIndex]);

  const getCurrentQuestionNumber = () => {
    return currentQuestionIndex + 1;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePoints = (isCorrect: boolean) => {
    if (!isCorrect) return 0;
    
    const category = currentQuestion?.category;
    
    // Pour text_completion, calculer les points par trou
    if (category === 'text_completion' && currentQuestion?.gap_choices) {
      let correctGaps = 0;
      Object.entries(selectedGapAnswers).forEach(([gapNumber, selectedOption]) => {
        const gapChoices = currentQuestion.gap_choices?.[gapNumber];
        const selectedChoice = gapChoices?.find(c => c.option === selectedOption);
        if (selectedChoice?.is_correct) {
          correctGaps++;
        }
      });
      return correctGaps * 5; // 5 points par trou correct
    }
    
    return 5; // 5 points pour les autres questions
  };

  const checkAnswer = () => {
    if (!currentQuestion) return false;

    // Pour text_completion
    if (currentQuestion.text_with_gaps && currentQuestion.gap_choices) {
      return Object.entries(selectedGapAnswers).every(([gapNumber, selectedOption]) => {
        const gapChoices = currentQuestion.gap_choices?.[gapNumber];
        const selectedChoice = gapChoices?.find(c => c.option === selectedOption);
        return selectedChoice?.is_correct === true;
      });
    }

    // Pour les autres questions
    const correctChoice = currentQuestion.choices.find(c => c.is_correct);
    return selectedAnswer === correctChoice?.option;
  };

  const handleSubmitAnswer = () => {
    const isCorrect = checkAnswer();
    const points = calculatePoints(isCorrect);
    const questionNum = getCurrentQuestionNumber();
    const category = currentQuestion?.category || '';

    setResults(prev => [...prev, {
      questionNumber: questionNum,
      isCorrect,
      points,
      category,
    }]);

    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(allQuestions[nextIndex]);
      setSelectedAnswer(null);
      setSelectedGapAnswers({});
      setAudioHasPlayed(false);
      setTabChangeDetected(false);
    } else {
      // Fin du test
      finishTest();
    }
  };

  const finishTest = () => {
    // Sauvegarder les résultats dans sessionStorage
    sessionStorage.setItem('toeic_blanc_results', JSON.stringify(results));
    router.push('/train/toeic-blanc/results');
  };

  const canSubmit = () => {
    if (currentQuestion?.text_with_gaps && currentQuestion?.gap_choices) {
      const totalGaps = Object.keys(currentQuestion.gap_choices).length;
      return Object.keys(selectedGapAnswers).length === totalGaps;
    }
    return selectedAnswer !== null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium text-lg">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-2xl mb-4">❌</p>
          <p className="text-gray-600 text-lg font-semibold">Impossible de charger les questions</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="h-screen flex flex-col lg:flex-row">
        {/* Left Sidebar - Progress & Visual Grid */}
        <div className="lg:w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto flex flex-col">
          <div className="space-y-6 flex-1">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">TOEIC BLANC</h1>
                <p className="text-sm text-gray-600">
                  Test complet
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className={`p-4 rounded-xl ${
              timeRemaining < 600 ? 'bg-red-100 border-2 border-red-300' : 'bg-blue-100 border-2 border-blue-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-5 h-5 ${timeRemaining < 600 ? 'text-red-600' : 'text-blue-600'}`} />
                <span className="text-sm font-medium text-gray-700">Temps restant</span>
              </div>
              <div className={`text-2xl font-bold ${timeRemaining < 600 ? 'text-red-800' : 'text-blue-800'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm font-bold text-blue-600">
                  {results.length} / {allQuestions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                {progress.toFixed(0)}% complété
              </div>
            </div>

            {/* Visual Question Grid */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm">Grille de progression</h3>
              
              {/* Audio with Images (1-20) */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1">
                  <span>🎧</span> Audio + Images (1-20)
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const questionNum = i + 1;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-purple-300 text-purple-600'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Q&A (21-50) */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                  <span>❓</span> Q&A (21-50)
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const questionNum = i + 21;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-blue-300 text-blue-600'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Short Conversation (51-80) */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                  <span>💬</span> Conversations (51-80)
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const questionNum = i + 51;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-green-300 text-green-600'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Short Talks (81-99) */}
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="text-xs font-bold text-yellow-700 mb-2 flex items-center gap-1">
                  <span>📻</span> Exposés (81-99)
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 19 }).map((_, i) => {
                    const questionNum = i + 81;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-yellow-300 text-yellow-700'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Incomplete Sentences (100-139) */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                  <span>✍️</span> Phrases (100-139)
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const questionNum = i + 100;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-amber-300 text-amber-700'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Completion (140-144) */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <div className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
                  <span>📝</span> Textes (140-144)
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const questionNum = i + 140;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-indigo-300 text-indigo-600'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reading Comprehension (145-157) */}
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <div className="text-xs font-bold text-pink-700 mb-2 flex items-center gap-1">
                  <span>📖</span> Lecture (145-157)
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 13 }).map((_, i) => {
                    const questionNum = i + 145;
                    const isAnswered = results.some(r => r.questionNumber === questionNum);
                    const isCorrect = results.find(r => r.questionNumber === questionNum)?.isCorrect;
                    return (
                      <div
                        key={questionNum}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'
                            : 'bg-white border border-pink-300 text-pink-600'
                        }`}
                      >
                        {questionNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alert si changement d'onglet */}
            <AnimatePresence>
              {tabChangeDetected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-100 border-2 border-red-300 rounded-xl p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800 font-semibold">
                      Changement de page détecté ! Question comptée comme incorrecte.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exit Button - Bottom Left */}
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir quitter le test ? Votre progression sera perdue.')) {
                router.push('/');
              }
            }}
            className="mt-4 w-full px-4 py-3 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-xl font-semibold text-gray-700 hover:text-red-600 transition-all shadow-lg"
          >
            ← Quitter le test
          </button>
        </div>

        {/* Right Side - Question Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Question Card */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100 mb-6"
            >
              {/* Audio Player */}
              {currentQuestion.audio_url && (
                <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Volume2 className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-gray-800">
                      {isAudioPlaying ? '🔊 Lecture en cours...' : audioHasPlayed ? '✓ Audio lu' : '⏳ Audio va démarrer...'}
                    </h3>
                  </div>
                  <audio
                    ref={audioRef}
                    src={currentQuestion.audio_url}
                    onEnded={handleAudioEnded}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600">
                    {audioHasPlayed ? 'L\'audio a été lu une fois.' : 'L\'audio va se lire automatiquement.'}
                  </p>
                </div>
              )}

              {/* Image */}
              {currentQuestion.image_url && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.image_url}
                    alt="Question illustration"
                    className="w-full rounded-2xl shadow-lg"
                  />
                </div>
              )}

              {/* Question Text */}
              {currentQuestion.question_text && !currentQuestion.text_with_gaps && (
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.question_text}
                  </h2>
                </div>
              )}

              {/* Text with gaps (pour text_completion) */}
              {currentQuestion.text_with_gaps && currentQuestion.gap_choices && (
                <div className="mb-8">
                  <div className="prose prose-lg max-w-none">
                    {(() => {
                      const text = currentQuestion.text_with_gaps;
                      const parts: React.ReactNode[] = [];
                      let lastIndex = 0;
                      const regex = /\{\{(\d+)\}\}/g;
                      let match;

                      while ((match = regex.exec(text)) !== null) {
                        const gapNumber = match[1];
                        const beforeText = text.substring(lastIndex, match.index);
                        
                        if (beforeText) {
                          parts.push(
                            <span key={`text-${lastIndex}`} className="text-gray-800 text-lg">
                              {beforeText}
                            </span>
                          );
                        }

                        const gapChoices = currentQuestion.gap_choices?.[gapNumber] || [];
                        const selectedOption = selectedGapAnswers[gapNumber];

                        parts.push(
                          <select
                            key={`gap-${gapNumber}`}
                            value={selectedOption || ''}
                            onChange={(e) => {
                              setSelectedGapAnswers(prev => ({
                                ...prev,
                                [gapNumber]: e.target.value
                              }));
                            }}
                            className="inline-block mx-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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

              {/* Choices */}
              {currentQuestion.choices && currentQuestion.choices.length > 0 && (
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice.option;

                    return (
                      <motion.button
                        key={choice.option}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedAnswer(choice.option)}
                        className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {choice.option}
                          </div>
                          <span className={`flex-1 font-medium ${
                            isSelected ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {choice.text}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmitAnswer}
              disabled={!canSubmit()}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all ${
                canSubmit()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex < allQuestions.length - 1 ? 'Question suivante →' : 'Terminer le test 🏁'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
