'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  Flame,
  Clock,
  Gift,
  CheckCircle2,
  Zap,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { Mission } from '@/types/mission';

interface MissionsCardProps {
  missions: Mission[];
  loading?: boolean;
}

function MissionItem({ mission, index }: { mission: Mission; index: number }) {
  const progressPercent = Math.min((mission.currentProgress / mission.requirement) * 100, 100);
  const timeLeft = mission.expiresAt ? getTimeLeft(mission.expiresAt) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`p-4 rounded-2xl border-2 transition-all ${
        mission.completed
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Emoji avec animation si complété */}
        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
          mission.completed 
            ? 'bg-green-100' 
            : mission.type === 'daily' 
              ? 'bg-orange-100' 
              : mission.type === 'weekly' 
                ? 'bg-blue-100' 
                : 'bg-purple-100'
        }`}>
          {mission.completed ? (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              ✅
            </motion.span>
          ) : (
            <span>{mission.emoji}</span>
          )}
          
          {/* Badge type */}
          {!mission.completed && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
              mission.type === 'daily' ? 'bg-orange-500' : 
              mission.type === 'weekly' ? 'bg-blue-500' : 'bg-purple-500'
            }`}>
              {mission.type === 'daily' && <Flame className="w-3 h-3 text-white" />}
              {mission.type === 'weekly' && <Target className="w-3 h-3 text-white" />}
              {mission.type === 'challenge' && <Zap className="w-3 h-3 text-white" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={`font-bold ${mission.completed ? 'text-green-700' : 'text-gray-800'}`}>
              {mission.name}
            </h4>
          </div>
          
          <p className={`text-sm ${mission.completed ? 'text-green-600' : 'text-gray-500'}`}>
            {mission.description}
          </p>

          {/* Progress bar */}
          {!mission.completed && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    mission.type === 'daily' ? 'bg-gradient-to-r from-orange-400 to-amber-400' :
                    mission.type === 'weekly' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                    'bg-gradient-to-r from-purple-400 to-pink-400'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-600 font-semibold whitespace-nowrap">
                {mission.currentProgress}/{mission.requirement}
              </span>
            </div>
          )}
        </div>

        {/* Reward / Status */}
        <div className="shrink-0 text-right">
          {mission.completed ? (
            <div className="flex items-center gap-1.5 text-green-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>+{mission.xpReward} XP</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-amber-600 font-semibold">
                <Gift className="w-4 h-4" />
                <span>+{mission.xpReward} XP</span>
              </div>
              {timeLeft && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{timeLeft}</span>
                </div>
              )}
            </div>
          )}
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

  if (days > 0) return `${days}j`;
  return `${hours}h`;
}

export function MissionsCard({ missions, loading }: MissionsCardProps) {
  const completedCount = missions.filter((m) => m.completed).length;
  const totalXpAvailable = missions.reduce((sum, m) => sum + (m.completed ? 0 : m.xpReward), 0);
  const earnedXp = missions.reduce((sum, m) => sum + (m.completed ? m.xpReward : 0), 0);

  // Séparer les missions par type
  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const otherMissions = missions.filter((m) => m.type !== 'daily');

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-200 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const allCompleted = completedCount === missions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-200 overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={allCompleted ? { rotate: [0, 360] } : { rotate: [0, -10, 10, -10, 0] }}
            transition={allCompleted 
              ? { duration: 2, repeat: Infinity, ease: "linear" }
              : { duration: 2, repeat: Infinity, repeatDelay: 3 }
            }
            className="text-4xl"
          >
            {allCompleted ? '🏆' : '🎯'}
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {allCompleted ? 'Missions accomplies !' : 'Missions du jour'}
            </h3>
            <p className="text-sm text-gray-500">
              {allCompleted 
                ? `+${earnedXp} XP gagnés aujourd'hui`
                : `${totalXpAvailable} XP à gagner`
              }
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {missions.map((m, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  m.completed 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-600">
            {completedCount}/{missions.length}
          </span>
        </div>
      </div>

      {/* Missions quotidiennes */}
      {dailyMissions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-600">Quotidien</span>
          </div>
          <div className="space-y-3">
            {dailyMissions.map((mission, idx) => (
              <MissionItem key={mission.id} mission={mission} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Objectifs & Défis */}
      {otherMissions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-gray-600">Objectifs & Défis</span>
          </div>
          <div className="space-y-3">
            {otherMissions.map((mission, idx) => (
              <MissionItem key={mission.id} mission={mission} index={idx + dailyMissions.length} />
            ))}
          </div>
        </div>
      )}

      {/* Message de félicitations si tout est complété */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-200 text-center"
        >
          <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-700">Bravo ! Tu as tout complété ! 🎉</p>
          <p className="text-sm text-green-600 mt-1">Reviens demain pour de nouveaux défis</p>
        </motion.div>
      )}

      {/* CTA pour aller pratiquer */}
      {!allCompleted && (
        <Link href="/learn">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-5 w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Commencer une leçon
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </Link>
      )}
    </motion.div>
  );
}
