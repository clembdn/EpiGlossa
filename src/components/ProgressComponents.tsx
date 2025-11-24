"use client"

import { motion } from 'framer-motion'
import { Trophy, CheckCircle, Circle, Star } from 'lucide-react'
import type { CategoryStats } from '@/lib/progress'

interface CategoryProgressBarProps {
  stats: CategoryStats | null
  totalQuestions: number
  loading?: boolean
}

export function CategoryProgressBar({ stats, totalQuestions, loading }: CategoryProgressBarProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  const currentXP = stats?.xp_earned || 0
  const maxXP = totalQuestions * 50
  const progress = maxXP > 0 ? (currentXP / maxXP) * 100 : 0
  const correctCount = stats?.correct_count || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-xl border-2 border-purple-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Ta Progression</h3>
            <p className="text-sm text-gray-500">
              {correctCount} / {totalQuestions} questions réussies
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {currentXP}
          </div>
          <div className="text-sm text-gray-500">/ {maxXP} XP</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="relative">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-gray-600">
          <span>0%</span>
          <span className="text-purple-600 font-bold">{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Badges de réussite */}
      {progress === 100 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-3 flex items-center gap-3"
        >
          <Star className="w-6 h-6 text-white" fill="white" />
          <div className="flex-1">
            <p className="text-white font-bold">Catégorie Maîtrisée ! 🎉</p>
            <p className="text-white/90 text-sm">Tu as répondu correctement à toutes les questions !</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

interface QuestionStatusBadgeProps {
  isCompleted: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function QuestionStatusBadge({ isCompleted, size = 'md' }: QuestionStatusBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <CheckCircle className={`${sizeClasses[size]} text-green-500`} fill="currentColor" />
      </motion.div>
    )
  }

  return <Circle className={`${sizeClasses[size]} text-gray-300`} />
}

interface XPGainNotificationProps {
  xpGained: number
  onClose: () => void
}

export function XPGainNotification({ xpGained, onClose }: XPGainNotificationProps) {
  if (xpGained === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
      onAnimationComplete={() => {
        setTimeout(onClose, 2000)
      }}
    >
      <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-green-300 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 0.5 }}
        >
          <Star className="w-8 h-8" fill="white" />
        </motion.div>
        <div>
          <p className="font-bold text-lg">+{xpGained} XP</p>
          <p className="text-sm text-white/90">Bonne réponse !</p>
        </div>
      </div>
    </motion.div>
  )
}
