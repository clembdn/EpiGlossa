'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, BookOpen, Target, TrendingUp, Award } from 'lucide-react';
import { lessonProgressService } from '@/lib/lesson-progress';
import { vocabularyLessons } from '@/data/vocabulary-lessons';

export default function LearningStats() {
  const [stats, setStats] = useState({
    totalXP: 0,
    completedLessons: 0,
    averageScore: 0,
    vocabulaireProgress: 0
  });

  useEffect(() => {
    const xp = lessonProgressService.getTotalXP();
    const globalStats = lessonProgressService.getStats();
    const vocabProgress = lessonProgressService.getCategoryProgress('vocabulaire', vocabularyLessons.length);
    
    setStats({
      totalXP: xp,
      completedLessons: globalStats.completedLessons,
      averageScore: globalStats.averageScore,
      vocabulaireProgress: vocabProgress
    });
  }, []);

  const statCards = [
    {
      icon: Zap,
      label: 'XP Total',
      value: stats.totalXP,
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'from-yellow-50 to-orange-50',
      emoji: '⚡'
    },
    {
      icon: BookOpen,
      label: 'Leçons Complétées',
      value: stats.completedLessons,
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50',
      emoji: '📚'
    },
    {
      icon: Target,
      label: 'Score Moyen',
      value: `${stats.averageScore}%`,
      color: 'from-green-400 to-emerald-400',
      bgColor: 'from-green-50 to-emerald-50',
      emoji: '🎯'
    },
    {
      icon: TrendingUp,
      label: 'Vocabulaire TOEIC',
      value: `${stats.vocabulaireProgress}%`,
      color: 'from-purple-400 to-pink-400',
      bgColor: 'from-purple-50 to-pink-50',
      emoji: '📈'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Statistiques d'Apprentissage</h2>
          <p className="text-gray-500 text-sm">Ta progression dans les cours</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border-2 border-white shadow-lg hover:shadow-xl transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <span className="text-xl">{stat.emoji}</span>
              </div>
              <stat.icon className={`w-5 h-5 text-gray-400`} />
            </div>
            
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      {stats.completedLessons > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {stats.completedLessons >= vocabularyLessons.length ? '🏆' : 
               stats.completedLessons >= 3 ? '⭐' : '🚀'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">
                {stats.completedLessons >= vocabularyLessons.length
                  ? 'Incroyable ! Tu as terminé toutes les leçons !'
                  : stats.completedLessons >= 3
                  ? 'Excellent progrès ! Continue comme ça !'
                  : 'Super début ! Continue ton apprentissage !'}
              </h3>
              <p className="text-white/90 text-sm">
                {stats.completedLessons >= vocabularyLessons.length
                  ? 'Tu maîtrises maintenant les mots essentiels du TOEIC !'
                  : `Plus que ${vocabularyLessons.length - stats.completedLessons} leçons à compléter !`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Steps */}
      {stats.completedLessons === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Commence ton apprentissage !</h3>
              <p className="text-blue-700 text-sm mb-3">
                Les leçons de vocabulaire TOEIC t'attendent. Commence par les 3 mots les plus fréquents !
              </p>
              <a
                href="/learn"
                className="inline-block bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Découvrir les leçons
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
