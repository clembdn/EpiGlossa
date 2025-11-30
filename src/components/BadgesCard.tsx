'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Lock,
  Sparkles,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Target,
  Gift,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { Badge } from '@/hooks/useBadges';
import type { Mission } from '@/types/mission';

interface BadgesCardProps {
  badges: Badge[];
  missions: Mission[];
  unlockedCount: number;
  totalBadges: number;
  loading?: boolean;
}

const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-600',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-600',
    glow: 'shadow-blue-200',
  },
  epic: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-600',
    glow: 'shadow-purple-200',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    border: 'border-amber-400',
    text: 'text-amber-600',
    glow: 'shadow-amber-200',
  },
};

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

function BadgeItem({ badge, index }: { badge: Badge; index: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const rarity = RARITY_COLORS[badge.rarity];
  const progressPercent = Math.min((badge.currentProgress / badge.requirement) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all cursor-pointer
          ${badge.unlocked
            ? `${rarity.bg} ${rarity.border} shadow-lg ${rarity.glow}`
            : 'bg-gray-100 border-gray-200 grayscale opacity-60'
          }
          ${badge.unlocked ? 'hover:scale-110' : 'hover:opacity-80'}
        `}
      >
        {badge.unlocked ? (
          <>
            <span>{badge.emoji}</span>
            {badge.rarity === 'legendary' && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ 
                  boxShadow: ['0 0 10px rgba(251, 191, 36, 0.3)', '0 0 20px rgba(251, 191, 36, 0.5)', '0 0 10px rgba(251, 191, 36, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </>
        ) : (
          <>
            <span className="opacity-30">{badge.emoji}</span>
            <Lock className="absolute w-4 h-4 text-gray-400 bottom-1 right-1" />
          </>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{badge.emoji}</span>
              <span className="font-semibold text-gray-800 text-sm">{badge.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
            
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.text} font-medium`}>
                {RARITY_LABELS[badge.rarity]}
              </span>
              <span className="text-gray-500">
                {badge.currentProgress}/{badge.requirement}
              </span>
            </div>
            
            {!badge.unlocked && (
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            
            {badge.unlocked && badge.unlockedAt && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MissionItem({ mission, index }: { mission: Mission; index: number }) {
  const progressPercent = Math.min((mission.currentProgress / mission.requirement) * 100, 100);
  const timeLeft = mission.expiresAt ? getTimeLeft(mission.expiresAt) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-xl border-2 transition-all ${
        mission.completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
          mission.completed ? 'bg-green-100' : 'bg-indigo-100'
        }`}>
          {mission.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-800">{mission.name}</h4>
            <div className="flex items-center gap-1.5">
              {mission.type === 'daily' && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                  Quotidien
                </span>
              )}
              {mission.type === 'weekly' && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Hebdo
                </span>
              )}
              {mission.type === 'challenge' && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                  Défi
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-0.5">{mission.description}</p>

          {/* Progress bar */}
          {!mission.completed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {mission.currentProgress}/{mission.requirement}
              </span>
            </div>
          )}

          {/* Footer: XP reward + time left */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-sm">
              {mission.completed ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Complété !
                </span>
              ) : (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  +{mission.xpReward} XP
                </span>
              )}
            </div>
            {timeLeft && !mission.completed && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeLeft}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeLeft(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return 'Expiré';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}j restant${days > 1 ? 's' : ''}`;
  return `${hours}h restante${hours > 1 ? 's' : ''}`;
}

export function BadgesCard({
  badges,
  missions,
  unlockedCount,
  totalBadges,
  loading,
}: BadgesCardProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'missions'>('missions');

  // Grouper les badges par catégorie
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const categoryLabels: Record<string, { label: string; emoji: string }> = {
    streak: { label: 'Série', emoji: '🔥' },
    vocabulary: { label: 'Vocabulaire', emoji: '📚' },
    grammar: { label: 'Grammaire', emoji: '✏️' },
  toeic: { label: 'TEPITECH', emoji: '🎯' },
    progress: { label: 'Progression', emoji: '⭐' },
    special: { label: 'Spéciaux', emoji: '✨' },
  };

  // Compter les missions complétées
  const completedMissions = missions.filter((m) => m.completed).length;
  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const weeklyMissions = missions.filter((m) => m.type === 'weekly' || m.type === 'challenge');

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-16 h-16 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-100"
    >
      {/* Header avec tabs */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'missions'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Target className="w-4 h-4" />
            Missions
            {completedMissions < missions.length && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {missions.length - completedMissions}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'badges'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Badges
            <span className="text-xs text-gray-400">
              {unlockedCount}/{totalBadges}
            </span>
          </button>
        </div>

        {/* Progress global des badges */}
        {activeTab === 'badges' && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {Math.round((unlockedCount / totalBadges) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Contenu selon tab actif */}
      <AnimatePresence mode="wait">
        {activeTab === 'missions' ? (
          <motion.div
            key="missions"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {/* Missions quotidiennes */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Missions du jour
              </h4>
              <div className="grid gap-3">
                {dailyMissions.map((mission, idx) => (
                  <MissionItem key={mission.id} mission={mission} index={idx} />
                ))}
              </div>
            </div>

            {/* Missions hebdo & défis */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Objectifs & Défis
              </h4>
              <div className="grid gap-3">
                {weeklyMissions.map((mission, idx) => (
                  <MissionItem key={mission.id} mission={mission} index={idx} />
                ))}
              </div>
            </div>

            {/* Message motivant */}
            {completedMissions === missions.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center"
              >
                <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-700">Toutes les missions complétées ! 🎉</p>
                <p className="text-sm text-green-600 mt-1">Reviens demain pour de nouveaux défis</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="badges"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
          >
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <span>{categoryLabels[category]?.emoji}</span>
                  {categoryLabels[category]?.label || category}
                  <span className="text-xs text-gray-400 font-normal">
                    ({categoryBadges.filter((b) => b.unlocked).length}/{categoryBadges.length})
                  </span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {categoryBadges.map((badge, idx) => (
                    <BadgeItem key={badge.id} badge={badge} index={idx} />
                  ))}
                </div>
              </div>
            ))}

            {/* Légende des raretés */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Raretés</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(RARITY_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${RARITY_COLORS[key as keyof typeof RARITY_COLORS].bg} ${RARITY_COLORS[key as keyof typeof RARITY_COLORS].border} border`} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
