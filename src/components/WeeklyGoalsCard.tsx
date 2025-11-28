'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, X, Check, Zap, BookOpen, 
  HelpCircle, ChevronDown, Sparkles, Trophy
} from 'lucide-react';
import { GoalType, WeeklyGoal, WeeklyProgress } from '@/hooks/useWeeklyGoals';

interface GoalOption {
  type: GoalType;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  bgColor: string;
  presets: number[];
  unit: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    type: 'xp',
    label: 'XP à gagner',
    icon: <Zap className="w-5 h-5" />,
    emoji: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    presets: [100, 200, 500, 1000],
    unit: 'XP',
  },
  {
    type: 'lessons',
    label: 'Leçons à compléter',
    icon: <BookOpen className="w-5 h-5" />,
    emoji: '📚',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    presets: [3, 5, 10, 15],
    unit: 'leçons',
  },
  {
    type: 'questions',
    label: 'Questions à répondre',
    icon: <HelpCircle className="w-5 h-5" />,
    emoji: '❓',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    presets: [20, 50, 100, 200],
    unit: 'questions',
  },
];

interface WeeklyGoalsCardProps {
  goals: WeeklyGoal[];
  progress: WeeklyProgress;
  loading: boolean;
  onSetGoal: (type: GoalType, target: number) => Promise<void>;
  onRemoveGoal: (type: GoalType) => Promise<void>;
}

export function WeeklyGoalsCard({
  goals,
  progress,
  loading,
  onSetGoal,
  onRemoveGoal,
}: WeeklyGoalsCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [saving, setSaving] = useState(false);

  const activeGoalTypes = goals.map((g) => g.goal_type);
  const availableOptions = GOAL_OPTIONS.filter(
    (opt) => !activeGoalTypes.includes(opt.type)
  );

  const handleAddGoal = async (type: GoalType, value: number) => {
    setSaving(true);
    await onSetGoal(type, value);
    setSaving(false);
    setIsAdding(false);
    setSelectedType(null);
    setCustomValue('');
  };

  const getProgressValue = (type: GoalType): number => {
    return progress[type] || 0;
  };

  const getMotivationalMessage = (percentage: number): string => {
    if (percentage >= 100) return '🎉 Objectif atteint ! Bravo !';
    if (percentage >= 75) return '🔥 Presque là, continue !';
    if (percentage >= 50) return '💪 Tu es à mi-chemin !';
    if (percentage >= 25) return '🚀 Bon début, garde le rythme !';
    return '✨ C\'est parti pour une super semaine !';
  };

  // Jours restants dans la semaine
  const getDaysRemaining = (): number => {
    const now = new Date();
    const day = now.getDay();
    // Dimanche = 0, donc on calcule les jours jusqu'à dimanche inclus
    return day === 0 ? 0 : 7 - day;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Objectifs de la semaine</h2>
            <p className="text-sm text-gray-500">
              {daysRemaining === 0 
                ? 'Dernier jour de la semaine !'
                : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        
        {availableOptions.length > 0 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {/* Liste des objectifs actifs */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : goals.length === 0 && !isAdding ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-2">Aucun objectif défini</p>
          <p className="text-sm text-gray-400 mb-4">
            Fixe-toi un objectif pour rester motivé !
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium"
          >
            Définir un objectif
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const option = GOAL_OPTIONS.find((o) => o.type === goal.goal_type)!;
            const current = getProgressValue(goal.goal_type);
            const percentage = Math.min((current / goal.target_value) * 100, 100);
            const isCompleted = percentage >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Badge de complétion */}
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${option.bgColor} rounded-xl flex items-center justify-center ${option.color}`}>
                      {option.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{option.label}</p>
                      <p className="text-sm text-gray-500">
                        {current} / {goal.target_value} {option.unit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveGoal(goal.goal_type)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer l'objectif"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Barre de progression */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                          : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {getMotivationalMessage(percentage)}
                    </span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal d'ajout d'objectif */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t-2 border-gray-100"
          >
            {!selectedType ? (
              <>
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Choisis un type d&apos;objectif :
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {availableOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedType(option.type)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left`}
                    >
                      <div className={`w-10 h-10 ${option.bgColor} rounded-xl flex items-center justify-center ${option.color}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{option.emoji} {option.label}</p>
                        <p className="text-xs text-gray-500">Par semaine</p>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">
                    Définis ta cible :
                  </p>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Retour
                  </button>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {GOAL_OPTIONS.find((o) => o.type === selectedType)?.presets.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAddGoal(selectedType, value)}
                      disabled={saving}
                      className="py-2 px-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors font-semibold text-sm disabled:opacity-50"
                    >
                      {value}
                    </button>
                  ))}
                </div>

                {/* Valeur personnalisée */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Autre valeur..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
                    min="1"
                  />
                  <button
                    onClick={() => {
                      const value = parseInt(customValue);
                      if (value > 0) {
                        handleAddGoal(selectedType, value);
                      }
                    }}
                    disabled={!customValue || saving}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {/* Bouton annuler */}
            <button
              onClick={() => {
                setIsAdding(false);
                setSelectedType(null);
                setCustomValue('');
              }}
              className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Annuler
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles decoration */}
      {goals.some((g) => getProgressValue(g.goal_type) >= g.target_value) && (
        <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
      )}
    </motion.div>
  );
}
