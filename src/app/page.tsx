'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Dumbbell, Trophy, Star, Flame, TrendingUp, AlertCircle, X, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGlobalProgress } from '@/hooks/useProgress';
import { useStreak } from '@/hooks/useStreak';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/lib/supabase';
import { MissionsCard } from '@/components/MissionsCard';

export default function Home() {
  const searchParams = useSearchParams();
  const [showUnauthorizedError, setShowUnauthorizedError] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [showXpDetails, setShowXpDetails] = useState(false);
  const { stats, loading, lessonXp, missionXp, baseXp } = useGlobalProgress();
  const { streak, loading: streakLoading } = useStreak();
  const { missions, loading: missionsLoading } = useBadges(userId);

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setShowUnauthorizedError(true);
    }
  }, [searchParams]);

  // Récupérer l'ID utilisateur
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
        {/* Unauthorized error message */}
        {showUnauthorizedError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-700 mb-1">Accès refusé</h3>
              <p className="text-sm text-red-600">
                Vous devez être administrateur pour accéder à cette section. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez un administrateur.
              </p>
            </div>
            <button
              onClick={() => setShowUnauthorizedError(false)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="text-7xl md:text-8xl mb-6"
          >
            🌟
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bienvenue sur EpiGlossa !
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 font-medium mb-8 max-w-2xl mx-auto">
            Apprends l&apos;anglais en t&apos;amusant avec des exercices interactifs, des défis quotidiens et bien plus !
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-4 rounded-2xl shadow-xl mb-8 cursor-pointer"
          >
            <Flame className="w-8 h-8" fill="white" />
            <div className="text-left">
              <p className="text-sm font-medium opacity-90">Ta série actuelle</p>
              <p className="text-3xl font-bold">
                {streakLoading ? '...' : `${streak} jour${streak > 1 ? 's' : ''}`}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center relative group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : stats?.total_xp || 0}
            </p>
            <p className="text-xs text-gray-500 font-medium">Points XP</p>
            
            {/* Bouton info discret sur desktop */}
            <button
              onClick={() => setShowXpDetails(!showXpDetails)}
              className="hidden md:flex absolute top-2 right-2 w-5 h-5 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Voir le détail"
            >
              <Info className="w-3 h-3" />
            </button>

            {/* Tooltip détaillé (desktop seulement) */}
            {showXpDetails && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="hidden md:block absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 p-3"
              >
                <p className="text-xs font-semibold text-gray-600 mb-2">Répartition XP</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      Entraînements
                    </span>
                    <span className="font-bold text-gray-700">{baseXp || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Leçons
                    </span>
                    <span className="font-bold text-gray-700">{lessonXp || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Défis
                    </span>
                    <span className="font-bold text-gray-700">{missionXp || 0}</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-600">Total</span>
                  <span className="text-gray-800">{stats?.total_xp || 0}</span>
                </div>
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45 mb-[-5px]" />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" fill="white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : stats?.correct_count || 0}
            </p>
            <p className="text-xs text-gray-500 font-medium">Réussies</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : Math.round(stats?.global_success_rate || 0)}%
            </p>
            <p className="text-xs text-gray-500 font-medium">Réussite</p>
          </motion.div>
        </div>

        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/learn">
              <motion.div
                className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                          Apprendre
                        </h2>
                        <p className="text-white/90 text-sm md:text-base">
                          Découvre de nouvelles leçons
                        </p>
                      </div>
                    </div>
                    <span className="text-4xl">📚</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
                      6 catégories
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
                      130+ leçons
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/train">
              <motion.div
                className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Dumbbell className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                          S&apos;entraîner
                        </h2>
                        <p className="text-white/90 text-sm md:text-base">
                          Pratique avec des exercices
                        </p>
                      </div>
                    </div>
                    <span className="text-4xl">💪</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
                      Exercices variés
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
                      Temps réel
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Missions du jour - Composant fonctionnel */}
        <MissionsCard missions={missions} loading={missionsLoading || !userId} />
      </div>
    </div>
  );
}
