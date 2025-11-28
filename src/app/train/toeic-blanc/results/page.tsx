'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Trophy, Target, Home, RotateCcw, TrendingUp, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { computeToeicSummary, TOEIC_CATEGORY_INFO } from '@/lib/toeic';
import type { ToeicResultEntry } from '@/types/toeic';

interface CategoryScore {
  name: string;
  emoji: string;
  score: number;
  maxScore: number;
  percentage: number;
  questions: number;
}

export default function TepitechBlancResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ToeicResultEntry[]>([]);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les résultats depuis sessionStorage
    const savedResults = sessionStorage.getItem('tepitech_blanc_results');
    if (!savedResults) {
      router.push('/train/toeic-blanc');
      return;
    }

    const parsedResults: ToeicResultEntry[] = JSON.parse(savedResults);
    setResults(parsedResults);
    const summary = computeToeicSummary(parsedResults);

    const categoryScoresList: CategoryScore[] = summary.categoryScores.map((category) => {
      const info = TOEIC_CATEGORY_INFO[category.category];
      const percentage = category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;

      return {
        name: info.name,
        emoji: info.emoji,
        score: category.score,
        maxScore: category.maxScore,
        percentage,
        questions: category.questions,
      };
    });

    setCategoryScores(categoryScoresList);
    setTotalScore(summary.totalScore);
    setLoading(false);
  }, [router]);

  const getTepitechLevel = (score: number) => {
    if (score >= 900) return { level: 'Expert', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 785) return { level: 'Avancé', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 605) return { level: 'Intermédiaire', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score >= 405) return { level: 'Élémentaire', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { level: 'Débutant', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-400 to-emerald-500';
    if (percentage >= 60) return 'from-blue-400 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
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
          <p className="text-gray-600 font-medium text-lg">Calcul des résultats...</p>
        </div>
      </div>
    );
  }

  const level = getTepitechLevel(totalScore);
  const percentage = (totalScore / 990) * 100;

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-8xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Test Terminé !
          </h1>
          <p className="text-gray-600 text-lg">
            Voici vos résultats détaillés
          </p>
        </motion.div>

        {/* Score Total */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100 mb-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-800">Score Total</h2>
            </div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.5 }}
              className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            >
              {totalScore} / 990
            </motion.div>

            <div className={`inline-block px-6 py-3 rounded-2xl ${level.bg} border-2 ${level.border} mb-6`}>
              <span className={`text-2xl font-bold ${level.color}`}>
                Niveau: {level.level}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-gray-600 font-semibold">
              {percentage.toFixed(1)}% de réussite
            </p>
          </div>
        </motion.div>

        {/* Scores par catégorie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Détails par Catégorie</h2>
          </div>

          {/* Résumé en une ligne */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 font-mono break-all">
              {categoryScores.map((cat, index) => (
                <span key={index}>
                  {cat.name}: {cat.score}/{cat.maxScore}
                  {index < categoryScores.length - 1 ? ' - ' : ''}
                </span>
              ))}
            </p>
          </div>

          <div className="space-y-4">
            {categoryScores.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-5 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.questions} question{category.questions > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      {category.score} / {category.maxScore}
                    </div>
                    <div className={`text-sm font-semibold ${getPercentageColor(category.percentage)}`}>
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${getBarColor(category.percentage)} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800">Bonnes Réponses</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {results.filter(r => r.isCorrect).length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800">Erreurs</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {results.filter(r => !r.isCorrect).length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">Taux de Réussite</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {((results.filter(r => r.isCorrect).length / results.length) * 100).toFixed(1)}%
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/train')}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l&apos;entraînement
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('tepitech_blanc_results');
              sessionStorage.removeItem('tepitech_blanc_summary');
              router.push('/train/toeic-blanc');
            }}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Refaire un TEPITECH BLANC
          </button>
        </motion.div>
      </div>
    </div>
  );
}
