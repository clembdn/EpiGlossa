'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, Trophy, Target, AlertTriangle, Volume2, BookOpen, Play, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const TEPITECH_SAVED_STATE_KEY = 'tepitech_blanc_saved_state';

interface SavedTestState {
  allQuestions: unknown[];
  currentQuestionIndex: number;
  results: unknown[];
  timeRemaining: number;
  savedAt: number;
}

const loadSavedTestState = (): SavedTestState | null => {
  try {
    const raw = localStorage.getItem(TEPITECH_SAVED_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedTestState;
    if (
      !Array.isArray(parsed.allQuestions) ||
      typeof parsed.currentQuestionIndex !== 'number' ||
      !Array.isArray(parsed.results) ||
      typeof parsed.timeRemaining !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const clearSavedTestState = () => {
  try {
    localStorage.removeItem(TEPITECH_SAVED_STATE_KEY);
  } catch (err) {
  console.warn('Unable to clear TEPITECH saved state:', err);
  }
};

const TEPITECH_STRUCTURE = [
  {
    section: 'Compréhension Orale',
    categories: [
      { name: 'Photos (Images)', emoji: '🎧', questions: 20, range: '1-20', points: 100 },
      { name: 'Questions-Réponses', emoji: '❓', questions: 30, range: '21-50', points: 150 },
      { name: 'Conversations Courtes', emoji: '💬', questions: 30, range: '51-80', points: 150 },
      { name: 'Exposés Courts', emoji: '🎤', questions: 19, range: '81-99', points: 95 },
    ],
    total: 99,
    totalPoints: 495,
  },
  {
    section: 'Compréhension Écrite',
    categories: [
      { name: 'Phrases à Compléter', emoji: '✍️', questions: 40, range: '100-139', points: 200 },
      { name: 'Textes à Compléter', emoji: '📝', questions: 5, range: '140-144', points: 100 },
      { name: 'Compréhension Écrite', emoji: '📚', questions: 13, range: '145-157', points: 195 },
    ],
    total: 58,
    totalPoints: 495,
  },
];

export default function TepitechBlancPage() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [savedState, setSavedState] = useState<SavedTestState | null>(null);

  useEffect(() => {
    const state = loadSavedTestState();
    setSavedState(state);
  }, []);

  const totalQuestions = 157;
  const totalPoints = 990;
  const testDuration = '2h00';

  const handleStartTest = () => {
    // Si on commence un nouveau test, effacer l'ancienne sauvegarde
    clearSavedTestState();
    router.push('/train/toeic-blanc/test');
  };

  const handleResumeTest = () => {
    // Reprendre le test (la page test chargera automatiquement l'état sauvegardé)
    router.push('/train/toeic-blanc/test');
  };

  const handleDiscardSavedTest = () => {
    clearSavedTestState();
    setSavedState(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>

          {/* Title Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100">
            <div className="flex items-start gap-4 md:gap-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <span className="text-5xl md:text-6xl">🎯</span>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                  TEPITECH BLANC
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                  Test complet Tepitech en conditions réelles - 157 questions en 2 heures
                </p>

                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-gray-600 font-medium">Questions</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">{totalQuestions}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-gray-600 font-medium">Points Max</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-yellow-600">{totalPoints}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600 font-medium">Durée</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">{testDuration}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resume Saved Test Banner */}
        {savedState && savedState.timeRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 mb-1 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Test en pause détecté
                </h3>
                <p className="text-amber-700 text-sm">
                  Tu as un test en cours avec{' '}
                  <span className="font-semibold">{savedState.results.length} réponses</span> enregistrées
                  et <span className="font-semibold">{formatTime(savedState.timeRemaining)}</span> restantes.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDiscardSavedTest}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-amber-300 text-amber-700 font-semibold rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Abandonner
                </button>
                <button
                  onClick={handleResumeTest}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="w-4 h-4" />
                  Reprendre
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 mb-2">⚠️ Conditions de passage</h3>
              <ul className="space-y-2 text-red-700 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Le chronomètre démarre dès le début et ne se met jamais en pause</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Les audios se lisent automatiquement une seule fois</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Si vous changez de page/onglet, la question actuelle sera comptée comme incorrecte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Vous ne pouvez pas revenir aux questions précédentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Préparez-vous dans un endroit calme et sans interruption</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Test Structure */}
        <div className="space-y-4 mb-8">
          {TEPITECH_STRUCTURE.map((section, sectionIndex) => (
            <motion.div
              key={section.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                {sectionIndex === 0 ? (
                  <Volume2 className="w-6 h-6 text-purple-600" />
                ) : (
                  <BookOpen className="w-6 h-6 text-blue-600" />
                )}
                <h2 className="text-xl font-bold text-gray-800">{section.section}</h2>
                <span className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-700">
                  {section.total} questions • {section.totalPoints} points
                </span>
              </div>

              <div className="space-y-3">
                {section.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-600">Questions {category.range}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{category.questions} Q</div>
                      <div className="text-sm text-yellow-600 font-semibold">{category.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Start Button */}
        {!showConfirm ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setShowConfirm(true)}
            className="w-full py-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-transform duration-200 hover:-translate-y-1"
          >
            {savedState && savedState.timeRemaining > 0
              ? 'Commencer un nouveau test'
              : 'Commencer le TEPITECH BLANC'}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-xl border-2 border-orange-200"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {savedState && savedState.timeRemaining > 0
                  ? 'Abandonner le test en cours ?'
                  : 'Êtes-vous prêt(e) ?'}
              </h3>
              <p className="text-gray-600">
                {savedState && savedState.timeRemaining > 0
                  ? 'Le test en cours sera perdu et un nouveau test commencera.'
                  : 'Le test va commencer immédiatement et le chronomètre se lancera.'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStartTest}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
              >
                Oui, commencer !
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
