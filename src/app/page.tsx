'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Dumbbell, Trophy, Star, Flame, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
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
            Apprends l'anglais en t'amusant avec des exercices interactifs, des défis quotidiens et bien plus !
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-4 rounded-2xl shadow-xl mb-8"
          >
            <Flame className="w-8 h-8" fill="white" />
            <div className="text-left">
              <p className="text-sm font-medium opacity-90">Ta série actuelle</p>
              <p className="text-3xl font-bold">0 jours 🔥</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">0</p>
            <p className="text-xs text-gray-500 font-medium">Points XP</p>
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
            <p className="text-2xl font-bold text-gray-800">0</p>
            <p className="text-xs text-gray-500 font-medium">Leçons</p>
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
            <p className="text-2xl font-bold text-gray-800">0%</p>
            <p className="text-xs text-gray-500 font-medium">Progression</p>
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
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
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
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
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
                          S'entraîner
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-200"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-5xl"
            >
              🎯
            </motion.div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Défi du jour
              </h3>
              <p className="text-gray-600 mb-4">
                Complète 3 leçons aujourd'hui pour gagner un bonus de 100 XP !
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full w-0" />
                  </div>
                  <span className="text-sm font-bold text-gray-600">0/3</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
