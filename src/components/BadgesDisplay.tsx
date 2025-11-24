'use client';

import { motion } from 'framer-motion';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  requirement: string;
}

interface BadgesDisplayProps {
  badges: Badge[];
}

export default function BadgesDisplay({ badges }: BadgesDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        🏅 Badges & Achievements
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative rounded-2xl p-4 border-2 transition-all ${
              badge.unlocked
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg hover:shadow-xl'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            {/* Badge Icon */}
            <div className={`text-4xl mb-2 ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
              {badge.emoji}
            </div>
            
            {/* Badge Info */}
            <h4 className="font-bold text-sm text-gray-800 mb-1">
              {badge.name}
            </h4>
            <p className="text-xs text-gray-600">
              {badge.description}
            </p>
            
            {/* Locked Overlay */}
            {!badge.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
                <span className="text-2xl">🔒</span>
              </div>
            )}
            
            {/* Unlock Animation */}
            {badge.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Progress */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-900">
            Progression des badges
          </span>
          <span className="text-sm font-bold text-blue-700">
            {badges.filter(b => b.unlocked).length}/{badges.length}
          </span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour générer les badges basés sur la progression
export function generateBadges(stats: {
  completedLessons: number;
  totalXP: number;
  averageScore: number;
}): Badge[] {
  return [
    {
      id: 'first-lesson',
      name: 'Premier Pas',
      description: 'Complète ta première leçon',
      emoji: '🎓',
      unlocked: stats.completedLessons >= 1,
      requirement: '1 leçon complétée'
    },
    {
      id: 'three-lessons',
      name: 'Apprenant',
      description: 'Complète 3 leçons',
      emoji: '📚',
      unlocked: stats.completedLessons >= 3,
      requirement: '3 leçons complétées'
    },
    {
      id: 'all-lessons',
      name: 'Expert Vocabulaire',
      description: 'Complète toutes les leçons',
      emoji: '🏆',
      unlocked: stats.completedLessons >= 6,
      requirement: '6 leçons complétées'
    },
    {
      id: 'xp-100',
      name: 'Collectionneur XP',
      description: 'Gagne 100 XP',
      emoji: '⚡',
      unlocked: stats.totalXP >= 100,
      requirement: '100 XP'
    },
    {
      id: 'xp-300',
      name: 'Maître XP',
      description: 'Gagne 300 XP',
      emoji: '💎',
      unlocked: stats.totalXP >= 300,
      requirement: '300 XP'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionniste',
      description: 'Score moyen de 90%+',
      emoji: '🌟',
      unlocked: stats.averageScore >= 90,
      requirement: 'Moyenne 90%+'
    },
    {
      id: 'good-student',
      name: 'Bon Élève',
      description: 'Score moyen de 80%+',
      emoji: '⭐',
      unlocked: stats.averageScore >= 80,
      requirement: 'Moyenne 80%+'
    },
    {
      id: 'motivated',
      name: 'Motivé',
      description: 'Complète une leçon parfaite',
      emoji: '🎯',
      unlocked: stats.averageScore === 100,
      requirement: 'Score 100%'
    }
  ];
}
