'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Headphones,
  BookOpen,
  Trophy,
  BarChart3,
  ArrowRight,
  Zap,
  Award,
} from 'lucide-react';
import { ToeicStats, ToeicTrend } from '@/hooks/useToeicStats';

interface ToeicStatsCardProps {
  stats: ToeicStats;
  onStartTest?: () => void;
}

function TrendBadge({ trend }: { trend: ToeicTrend }) {
  const config = {
    up: {
      icon: TrendingUp,
      bg: 'bg-green-100',
      text: 'text-green-700',
      sign: '+',
    },
    down: {
      icon: TrendingDown,
      bg: 'bg-red-100',
      text: 'text-red-700',
      sign: '-',
    },
    stable: {
      icon: Minus,
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      sign: '',
    },
  };

  const { icon: Icon, bg, text, sign } = config[trend.direction];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      <span>
        {sign}{trend.points} pts
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
      </div>
    </div>
  );
}

export function ToeicStatsCard({ stats, onStartTest }: ToeicStatsCardProps) {
  const sectionAnalysis = {
    listening: {
      icon: Headphones,
      label: 'Listening',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    reading: {
      icon: BookOpen,
      label: 'Reading',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-700',
    },
    balanced: {
      icon: Zap,
      label: 'Équilibré',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
    },
  };

  const stronger = sectionAnalysis[stats.strongerSection];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-100"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-yellow-500" />
            Statistiques TOEIC
          </h2>
          <p className="text-sm text-gray-500">
            Analyse de {stats.totalTests} test{stats.totalTests > 1 ? 's' : ''} passé{stats.totalTests > 1 ? 's' : ''}
          </p>
        </div>

        {onStartTest && (
          <button
            onClick={onStartTest}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium text-sm"
          >
            Nouveau test
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Score principal + tendance */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 mb-6 border border-yellow-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Dernier score</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-800">{stats.latestScore}</span>
              <span className="text-lg text-gray-500">/990</span>
              <TrendBadge trend={stats.scoreTrend} />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Moyenne</p>
              <p className="text-2xl font-bold text-gray-700">{stats.averageScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Meilleur</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.bestScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Progression</p>
              <p className={`text-2xl font-bold ${stats.overallProgression >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.overallProgression > 0 ? '+' : ''}{stats.overallProgression}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listening vs Reading */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Analyse par section
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Listening */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Listening</span>
              </div>
              <TrendBadge trend={stats.listeningTrend} />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-700">{stats.latestListening}</span>
              <span className="text-sm text-gray-500">/495</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Moy: {stats.averageListening}</span>
              <span>Max: {stats.bestListening}</span>
              <span className={stats.listeningProgression >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.listeningProgression > 0 ? '+' : ''}{stats.listeningProgression} pts
              </span>
            </div>
          </div>

          {/* Reading */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800">Reading</span>
              </div>
              <TrendBadge trend={stats.readingTrend} />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-purple-700">{stats.latestReading}</span>
              <span className="text-sm text-gray-500">/495</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Moy: {stats.averageReading}</span>
              <span>Max: {stats.bestReading}</span>
              <span className={stats.readingProgression >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.readingProgression > 0 ? '+' : ''}{stats.readingProgression} pts
              </span>
            </div>
          </div>
        </div>

        {/* Force/Faiblesse */}
        <div className={`${stronger.lightColor} rounded-xl p-3 flex items-center gap-3`}>
          <stronger.icon className={`w-5 h-5 ${stronger.textColor}`} />
          <span className={`text-sm font-medium ${stronger.textColor}`}>
            {stats.strongerSection === 'balanced'
              ? 'Tes scores Listening et Reading sont équilibrés ! 🎯'
              : stats.strongerSection === 'listening'
              ? `Ta force : Listening (+${Math.abs(stats.listeningVsReadingGap)} pts vs Reading)`
              : `Ta force : Reading (+${Math.abs(stats.listeningVsReadingGap)} pts vs Listening)`}
          </span>
        </div>
      </div>

      {/* Objectif */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-500" />
          Objectif : {stats.targetScore} points
        </h3>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progression vers l&apos;objectif</span>
            <span className="text-sm font-bold text-gray-800">
              {stats.latestScore}/{stats.targetScore}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stats.latestScore / stats.targetScore) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                stats.latestScore >= stats.targetScore
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}
            />
          </div>
          {stats.pointsToTarget > 0 ? (
            <p className="text-xs text-gray-500">
              Il te reste <span className="font-semibold text-yellow-600">{stats.pointsToTarget} points</span> à gagner
              {stats.estimatedTestsToTarget > 0 && (
                <> (~{stats.estimatedTestsToTarget} test{stats.estimatedTestsToTarget > 1 ? 's' : ''} estimé{stats.estimatedTestsToTarget > 1 ? 's' : ''})</>
              )}
            </p>
          ) : (
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Objectif atteint ! 🎉
            </p>
          )}
        </div>
      </div>

      {/* Métriques additionnelles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Trophy}
          label="Meilleur score"
          value={stats.bestScore}
          color="bg-yellow-500"
        />
        <StatCard
          icon={BarChart3}
          label="Tests passés"
          value={stats.totalTests}
          color="bg-blue-500"
        />
        <StatCard
          icon={Award}
          label="Consistance"
          value={`${stats.consistencyScore}%`}
          subValue="Stabilité des scores"
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Progression"
          value={`${stats.overallProgression > 0 ? '+' : ''}${stats.overallProgression}`}
          subValue="Depuis le 1er test"
          color={stats.overallProgression >= 0 ? 'bg-green-500' : 'bg-red-500'}
        />
      </div>
    </motion.div>
  );
}
