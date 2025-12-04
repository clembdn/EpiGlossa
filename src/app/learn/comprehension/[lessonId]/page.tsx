'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  Star,
  BookOpen,
  Zap,
  Lightbulb,
  FileText
} from 'lucide-react';
import { comprehensionLessons } from '@/data/comprehension-lessons';
import { lessonProgressService } from '@/lib/lesson-progress';
import { useStreak } from '@/hooks/useStreak';

type LessonStep = 'intro' | 'learning' | 'exercises' | 'results';

export default function ComprehensionLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.lessonId as string);
  const { updateStreak } = useStreak();
  
  const lesson = comprehensionLessons.find(l => l.id === lessonId);
  
  const [step, setStep] = useState<LessonStep>('intro');
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [completedStrategies, setCompletedStrategies] = useState<number[]>([]);
  const [hasReadPassage, setHasReadPassage] = useState(false);

  useEffect(() => {
    if (step === 'results' && lesson) {
      const percentage = Math.round((score / (lesson.exercises.length * 10)) * 100);
      const xpEarned = Math.round((percentage / 100) * lesson.xp);
      lessonProgressService.completeLesson('comprehension', lessonId, percentage, xpEarned);
      // Mettre à jour le streak quand une leçon est terminée
      updateStreak();
    }
  }, [step, lessonId, score, lesson, updateStreak]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <p className="text-2xl">❌</p>
          <p className="text-gray-600 mt-2">Leçon introuvable</p>
        </div>
      </div>
    );
  }

  const currentStrategy = lesson.strategies[currentStrategyIndex];
  const currentExercise = lesson.exercises[currentExerciseIndex];
  
  // Calculer la progression : stratégies + passage = 50%, exercices = 50%
  let learningProgress = 0;
  if (!hasReadPassage) {
    learningProgress = (completedStrategies.length / (lesson.strategies.length + 1)) * 50;
  } else {
    learningProgress = 50;
  }
  
  const progress = step === 'learning' 
    ? learningProgress
    : 50 + ((currentExerciseIndex / lesson.exercises.length) * 50);

  const handleNextStrategy = () => {
    if (!completedStrategies.includes(currentStrategyIndex)) {
      setCompletedStrategies([...completedStrategies, currentStrategyIndex]);
    }
    
    if (currentStrategyIndex < lesson.strategies.length - 1) {
      setCurrentStrategyIndex(currentStrategyIndex + 1);
    } else {
      // Passer au passage de lecture
      setHasReadPassage(true);
    }
  };

  const handleStartExercises = () => {
    setStep('exercises');
  };

  const handleNextExercise = () => {
    setShowFeedback(false);
    setUserAnswer('');
    
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

  // Intro Screen
  if (step === 'intro') {
    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-green-100">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-7xl text-center mb-6"
            >
              📖
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {lesson.title}
            </h1>
            
            <p className="text-gray-600 text-center mb-8 text-lg">
              {lesson.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                <Lightbulb className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{lesson.strategies.length}</p>
                <p className="text-sm text-green-600">stratégies</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 text-center">
                <Zap className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-700">{lesson.xp} XP</p>
                <p className="text-sm text-emerald-600">à gagner</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 text-center">
                <Trophy className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-teal-700">{lesson.exercises.length}</p>
                <p className="text-sm text-teal-600">exercices</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 text-center">
                <Star className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-cyan-700">{lesson.duration} min</p>
                <p className="text-sm text-cyan-600">environ</p>
              </div>
            </div>

            <motion.button
              onClick={() => setStep('learning')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Commencer la leçon
            </motion.button>

            <button
              onClick={() => router.push('/learn/comprehension')}
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

  // Learning Phase - Strategies and Passage
  if (step === 'learning') {
    return (
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => router.push('/learn/comprehension')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-sm font-semibold text-gray-600">
                {hasReadPassage 
                  ? `Passage lu - Prêt pour les exercices` 
                  : `${completedStrategies.length}/${lesson.strategies.length} stratégies`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </div>

          {/* Stratégies ou Passage */}
          <AnimatePresence mode="wait">
            {!hasReadPassage ? (
              // Afficher les stratégies
              <motion.div
                key={currentStrategyIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-green-100"
              >
                {/* Strategy Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                      {currentStrategy.title}
                    </h2>
                  </div>

                  <p className="text-xl text-gray-600 font-medium">
                    {currentStrategy.explanation}
                  </p>
                </div>

                {/* Tips */}
                {currentStrategy.tips && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6"
                  >
                    <p className="text-blue-800 font-medium text-center">
                      {currentStrategy.tips}
                    </p>
                  </motion.div>
                )}

                {/* Examples */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg">
                    📝 Exemples :
                  </h3>
                  
                  {currentStrategy.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">✓</span>
                        <p className="font-semibold flex-1 text-lg text-green-800">
                          {example}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={handleNextStrategy}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStrategyIndex < lesson.strategies.length - 1 ? 'Stratégie suivante' : 'Lire le document'}
                </motion.button>
              </motion.div>
            ) : (
              // Afficher le passage de lecture
              <motion.div
                key="passage"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-green-100"
              >
                {/* Passage Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Document à lire
                      </h2>
                      <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {lesson.passages[0].type === 'email' && '📧 Email'}
                        {lesson.passages[0].type === 'memo' && '📋 Mémo'}
                        {lesson.passages[0].type === 'article' && '📰 Article'}
                        {lesson.passages[0].type === 'announcement' && '📢 Annonce'}
                        {lesson.passages[0].type === 'advertisement' && '🛍️ Publicité'}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6"
                  >
                    <p className="text-blue-800 font-medium text-center">
                      💡 Conseil : Lisez attentivement. Les questions porteront sur les détails de ce document.
                    </p>
                  </motion.div>
                </div>

                {/* Passage Content */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-base">
                    {lesson.passages[0].text}
                  </pre>
                </div>

                {/* Start Exercises Button */}
                <motion.button
                  onClick={handleStartExercises}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Répondre aux questions
                </motion.button>
              </motion.div>
            )}
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
                <p className="text-xs text-green-600 font-bold">
                  {score} points
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
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
                          : 'bg-white border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-800'
                      }`}
                      whileHover={!showFeedback ? { scale: 1.02 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    >
                      {option}
                    </motion.button>
                  ))}
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
      <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-green-100 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="text-8xl mb-6"
            >
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '💪'}
            </motion.div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {percentage >= 80 ? 'Incroyable !' : percentage >= 60 ? 'Bien joué !' : 'Continue comme ça !'}
            </h1>

            <p className="text-gray-600 mb-8 text-lg">
              {percentage >= 80
                ? 'Tu as parfaitement maîtrisé cette technique de compréhension !'
                : percentage >= 60
                ? 'Tu fais de bons progrès en compréhension !'
                : 'L\'entraînement fait le maître !'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                <p className="text-5xl font-bold text-green-700 mb-2">{percentage}%</p>
                <p className="text-green-600 font-semibold">Réussite</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-8 h-8 text-emerald-600" />
                  <p className="text-5xl font-bold text-emerald-700">+{xpEarned}</p>
                </div>
                <p className="text-emerald-600 font-semibold">XP gagnés</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                Récapitulatif
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-700">{lesson.strategies.length}</p>
                  <p className="text-sm text-blue-600">stratégies</p>
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
                  setCurrentStrategyIndex(0);
                  setCurrentExerciseIndex(0);
                  setScore(0);
                  setHearts(3);
                  setShowFeedback(false);
                  setCompletedStrategies([]);
                  setHasReadPassage(false);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Refaire la leçon
              </button>

              <button
                onClick={() => router.push('/learn/comprehension')}
                className="w-full bg-white border-2 border-green-300 text-green-700 font-bold py-4 px-8 rounded-2xl hover:bg-green-50 transition-all"
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
