'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  Star,
  BookOpen,
  Zap
} from 'lucide-react';
import { vocabularyLessons } from '@/data/vocabulary-lessons';
import { lessonProgressService } from '@/lib/lesson-progress';
import { useStreak } from '@/hooks/useStreak';

const shuffleArray = (array: string[]) => {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

type LessonStep = 'intro' | 'learning' | 'exercises' | 'results';

export default function VocabularyLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.lessonId as string);
  const { updateStreak } = useStreak();
  
  const lesson = vocabularyLessons.find(l => l.id === lessonId);
  
  const [step, setStep] = useState<LessonStep>('intro');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [completedWords, setCompletedWords] = useState<number[]>([]);
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shuffledRightOptions, setShuffledRightOptions] = useState<string[]>([]);

  // Sauvegarder la progression quand on atteint l'écran de résultats
  useEffect(() => {
    if (step === 'results' && lesson) {
      const percentage = Math.round((score / (lesson.exercises.length * 10)) * 100);
      const xpEarned = Math.round((percentage / 100) * lesson.xp);
      lessonProgressService.completeLesson('vocabulaire', lessonId, percentage, xpEarned);
      // Mettre à jour le streak quand une leçon est terminée
      updateStreak();
    }
  }, [step, lessonId, score, lesson, updateStreak]);

  const currentWord = lesson?.words[currentWordIndex];
  const currentExercise = lesson?.exercises[currentExerciseIndex];
  const progress = lesson
    ? step === 'learning' 
      ? (completedWords.length / lesson.words.length) * 50
      : 50 + ((currentExerciseIndex / lesson.exercises.length) * 50)
    : 0;
  const isMatchingExercise = currentExercise?.type === 'matching';
  const isMatchingReady = Boolean(
    isMatchingExercise &&
    currentExercise?.options &&
    Object.keys(matchingSelections).length === currentExercise.options.length
  );

  useEffect(() => {
    if (!lesson || !currentExercise) {
      setShuffledRightOptions([]);
      setMatchingSelections({});
      setSelectedLeft(null);
      return;
    }

    if (isMatchingExercise && Array.isArray(currentExercise.correctAnswer)) {
      setShuffledRightOptions(shuffleArray(currentExercise.correctAnswer));
    } else {
      setShuffledRightOptions([]);
    }
    setMatchingSelections({});
    setSelectedLeft(null);
  }, [lesson, currentExerciseIndex, currentExercise, isMatchingExercise]);

  if (!lesson || !currentWord || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <p className="text-2xl">❌</p>
          <p className="text-gray-600 mt-2">Leçon introuvable</p>
        </div>
      </div>
    );
  }

  // Fonction pour parler un mot (Text-to-Speech)
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleNextWord = () => {
    if (!completedWords.includes(currentWordIndex)) {
      setCompletedWords([...completedWords, currentWordIndex]);
    }
    
    if (currentWordIndex < lesson.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setStep('exercises');
    }
  };

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === 
      currentExercise.correctAnswer.toString().toLowerCase().trim();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 10);
    } else {
      setHearts(Math.max(0, hearts - 1));
    }
  };

  const handleNextExercise = () => {
    setShowFeedback(false);
    setUserAnswer('');
    setMatchingSelections({});
    setSelectedLeft(null);
    setShuffledRightOptions([]);
    
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      setStep('results');
    }
  };

  const handleMultipleChoice = (option: string) => {
    setUserAnswer(option);
    
    const correct = option === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 10);
    } else {
      setHearts(Math.max(0, hearts - 1));
    }
  };

  const handleSelectLeft = (option: string) => {
    if (showFeedback) return;
    setSelectedLeft((prev) => (prev === option ? null : option));
  };

  const handleSelectRight = (answer: string) => {
    if (showFeedback || !selectedLeft) return;

    setMatchingSelections((prev) => {
      const updated = { ...prev };
      const existingLeft = Object.entries(updated).find(([, value]) => value === answer);
      if (existingLeft) {
        delete updated[existingLeft[0]];
      }
      updated[selectedLeft] = answer;
      return updated;
    });
    setSelectedLeft(null);
  };

  const handleMatchingSubmit = () => {
    if (!isMatchingExercise || !currentExercise.options || !Array.isArray(currentExercise.correctAnswer)) return;

    const correct = currentExercise.options.every((option, index) => {
      return matchingSelections[option] === currentExercise.correctAnswer[index];
    });

    setIsCorrect(correct);
    setShowFeedback(true);
    setSelectedLeft(null);

    if (correct) {
      setScore(score + 10);
    } else {
      setHearts(Math.max(0, hearts - 1));
    }
  };

  // Intro Screen
  if (step === 'intro') {
    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-purple-100">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-7xl text-center mb-6"
            >
              📚
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {lesson.title}
            </h1>
            
            <p className="text-gray-600 text-center mb-8 text-lg">
              {lesson.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">{lesson.words.length}</p>
                <p className="text-sm text-purple-600">nouveaux mots</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 text-center">
                <Zap className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-pink-700">{lesson.xp} XP</p>
                <p className="text-sm text-pink-600">à gagner</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{lesson.exercises.length}</p>
                <p className="text-sm text-blue-600">exercices</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{lesson.duration} min</p>
                <p className="text-sm text-yellow-600">environ</p>
              </div>
            </div>

            <motion.button
              onClick={() => setStep('learning')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Commencer la leçon
            </motion.button>

            <button
              onClick={() => router.back()}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Learning Phase
  if (step === 'learning') {
    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-sm font-semibold text-gray-600">
                {completedWords.length}/{lesson.words.length} mots
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* Word Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-purple-100"
            >
              {/* Word Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  {currentWord.frequency === 'essential' && '🔥 ESSENTIEL'}
                  {currentWord.frequency === 'important' && '⭐ IMPORTANT'}
                  {currentWord.frequency === 'useful' && '💡 UTILE'}
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                    {currentWord.english}
                  </h2>
                  <button
                    onClick={() => speakWord(currentWord.english)}
                    className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Volume2 className="w-6 h-6 text-white" />
                  </button>
                </div>

                {currentWord.phonetic && (
                  <p className="text-gray-500 mb-2">{currentWord.phonetic}</p>
                )}

                <p className="text-2xl text-purple-600 font-semibold mb-2">
                  {currentWord.french}
                </p>

                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {currentWord.category}
                </span>
              </div>

              {/* Tips */}
              {currentWord.tips && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6"
                >
                  <p className="text-yellow-800 font-medium text-center">
                    {currentWord.tips}
                  </p>
                </motion.div>
              )}

              {/* Examples */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  Exemples d&apos;utilisation :
                </h3>
                
                {currentWord.examples.map((example, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <button
                        onClick={() => speakWord(example.english)}
                        className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        <Volume2 className="w-4 h-4 text-white" />
                      </button>
                      <p className="text-gray-800 font-medium flex-1">
                        {example.english}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm pl-10">
                      {example.french}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Next Button */}
              <motion.button
                onClick={handleNextWord}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentWordIndex < lesson.words.length - 1 ? 'Mot suivant' : 'Passer aux exercices'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Exercise Phase
  if (step === 'exercises') {
    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Progress Bar & Hearts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={i >= hearts ? { scale: [1, 0.8, 1] } : {}}
                  >
                    <span className={`text-2xl ${i < hearts ? '' : 'opacity-30'}`}>
                      ❤️
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-600">
                  {currentExerciseIndex + 1}/{lesson.exercises.length}
                </span>
                <p className="text-xs text-purple-600 font-bold">
                  {score} points
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>

          {/* Exercise Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-blue-100"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                {currentExercise.question}
              </h2>

              {/* Multiple Choice */}
              {currentExercise.type === 'multiple-choice' && currentExercise.options && (
                <div className="space-y-3">
                  {currentExercise.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => !showFeedback && handleMultipleChoice(option)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-2xl border-2 font-semibold text-left transition-all ${
                        showFeedback && option === currentExercise.correctAnswer
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : showFeedback && option === userAnswer && !isCorrect
                          ? 'bg-red-100 border-red-500 text-red-700'
                          : 'bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-800'
                      }`}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Fill in the Blank / Translation */}
              {(currentExercise.type === 'fill-blank' || currentExercise.type === 'translation') && (
                <div>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !showFeedback && checkAnswer()}
                    disabled={showFeedback}
                    placeholder="Tape ta réponse..."
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-purple-400 focus:outline-none mb-4"
                  />
                  
                  {!showFeedback && (
                    <button
                      onClick={checkAnswer}
                      disabled={!userAnswer.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      Vérifier
                    </button>
                  )}
                </div>
              )}

              {/* Matching Exercise */}
              {isMatchingExercise && currentExercise.options && Array.isArray(currentExercise.correctAnswer) && (
                <div className="space-y-6">
                  <p className="text-center text-gray-600">
                    Associe chaque mot anglais à sa traduction française.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {currentExercise.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSelectLeft(option)}
                          disabled={showFeedback}
                          className={`w-full p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center justify-between gap-3 ${
                            matchingSelections[option]
                              ? 'border-green-400 bg-green-50 text-green-800'
                              : selectedLeft === option
                              ? 'border-purple-500 bg-purple-50 text-purple-800'
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                          } ${showFeedback ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <span>{option}</span>
                          {matchingSelections[option] && (
                            <span className="text-sm text-green-700">
                              {matchingSelections[option]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {shuffledRightOptions.map((answer) => {
                        const assignedLeft = Object.entries(matchingSelections).find(([, value]) => value === answer)?.[0];
                        return (
                          <button
                            key={answer}
                            onClick={() => handleSelectRight(answer)}
                            disabled={showFeedback}
                            className={`w-full p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center justify-between gap-3 ${
                              assignedLeft
                                ? 'border-green-400 bg-green-50 text-green-800'
                                : selectedLeft
                                ? 'border-blue-400 bg-blue-50 text-blue-800'
                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                            } ${showFeedback ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            <span>{answer}</span>
                            {assignedLeft && (
                              <span className="text-sm text-green-700">
                                {assignedLeft}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!showFeedback && (
                    <button
                      onClick={handleMatchingSubmit}
                      disabled={!isMatchingReady}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      Vérifier
                    </button>
                  )}
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-6 p-6 rounded-2xl ${
                      isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                          <span className="text-2xl font-bold text-green-700">Excellent ! 🎉</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-8 h-8 text-red-600" />
                          <span className="text-2xl font-bold text-red-700">Pas tout à fait...</span>
                        </>
                      )}
                    </div>
                    
                    {currentExercise.explanation && (
                      <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'} mb-4`}>
                        {currentExercise.explanation}
                      </p>
                    )}

                    <button
                      onClick={handleNextExercise}
                      className={`w-full ${
                        isCorrect ? 'bg-green-600' : 'bg-red-600'
                      } text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-all`}
                    >
                      {currentExerciseIndex < lesson.exercises.length - 1 ? 'Continuer' : 'Voir les résultats'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Results Screen
  if (step === 'results') {
    const percentage = Math.round((score / (lesson.exercises.length * 10)) * 100);
    const xpEarned = Math.round((percentage / 100) * lesson.xp);

    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-yellow-100 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="text-8xl mb-6"
            >
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '💪'}
            </motion.div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {percentage >= 80 ? 'Incroyable !' : percentage >= 60 ? 'Bien joué !' : 'Continue comme ça !'}
            </h1>

            <p className="text-gray-600 mb-8 text-lg">
              {percentage >= 80
                ? 'Tu as parfaitement maîtrisé cette leçon !'
                : percentage >= 60
                ? 'Tu fais de bons progrès !'
                : 'L\'entraînement fait le maître !'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                <p className="text-5xl font-bold text-purple-700 mb-2">{percentage}%</p>
                <p className="text-purple-600 font-semibold">Réussite</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  <p className="text-5xl font-bold text-yellow-700">+{xpEarned}</p>
                </div>
                <p className="text-yellow-600 font-semibold">XP gagnés</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                Récapitulatif
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-700">{lesson.words.length}</p>
                  <p className="text-sm text-blue-600">mots appris</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">{score / 10}</p>
                  <p className="text-sm text-green-600">bonnes réponses</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-700">{lesson.exercises.length - score / 10}</p>
                  <p className="text-sm text-red-600">erreurs</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setStep('learning');
                  setCurrentWordIndex(0);
                  setCurrentExerciseIndex(0);
                  setScore(0);
                  setHearts(3);
                  setShowFeedback(false);
                  setCompletedWords([]);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Refaire la leçon
              </button>

              <button
                onClick={() => router.push('/learn/vocabulaire')}
                className="w-full bg-white border-2 border-purple-300 text-purple-700 font-bold py-4 px-8 rounded-2xl hover:bg-purple-50 transition-all"
              >
                Retour aux leçons
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
