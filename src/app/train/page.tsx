'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Volume2, MessageSquare, Users, Radio, FileText, CheckSquare, BookText, Trophy, Target } from 'lucide-react';

const trainCategories = [
  { 
    name: 'Audio avec Images', 
    href: '/train/audio_with_images',
    icon: Volume2,
    emoji: '🎧',
    color: 'from-purple-400 to-pink-400',
    description: 'Écoute des audios tout en regardant des images pour améliorer ta compréhension orale',
    difficulty: 'Débutant',
    exercises: 45
  },
  { 
    name: 'Questions & Réponses', 
    href: '/train/qa',
    icon: MessageSquare,
    emoji: '❓',
    color: 'from-blue-400 to-cyan-400',
    description: 'Réponds à des questions variées pour tester ta compréhension',
    difficulty: 'Intermédiaire',
    exercises: 38
  },
  { 
    name: 'Conversations Courtes', 
    href: '/train/short_conversation',
    icon: Users,
    emoji: '💬',
    color: 'from-green-400 to-emerald-400',
    description: 'Écoute et comprends des dialogues du quotidien',
    difficulty: 'Débutant',
    exercises: 52
  },
  { 
    name: 'Exposés Courts', 
    href: '/train/short_talks',
    icon: Radio,
    emoji: '📻',
    color: 'from-yellow-400 to-orange-400',
    description: 'Analyse des présentations et discours courts',
    difficulty: 'Avancé',
    exercises: 31
  },
  { 
    name: 'Phrases Incomplètes', 
    href: '/train/incomplete_sentences',
    icon: FileText,
    emoji: '✍️',
    color: 'from-red-400 to-pink-400',
    description: 'Complète les phrases avec le mot ou expression correcte',
    difficulty: 'Intermédiaire',
    exercises: 67
  },
  { 
    name: 'Complétion de Texte', 
    href: '/train/text_completion',
    icon: CheckSquare,
    emoji: '📝',
    color: 'from-indigo-400 to-purple-400',
    description: 'Remplis les blancs dans des textes suivis',
    difficulty: 'Avancé',
    exercises: 29
  },
  { 
    name: 'Compréhension Écrite', 
    href: '/train/reading_comprehension',
    icon: BookText,
    emoji: '📖',
    color: 'from-pink-400 to-rose-400',
    description: 'Lis des textes et réponds aux questions de compréhension',
    difficulty: 'Intermédiaire',
    exercises: 41
  },
];

export default function TrainPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="text-6xl md:text-7xl mb-4"
          >
            💪
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Entraîne-toi !
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Pratique avec des exercices variés et améliore tes compétences en anglais
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">7</p>
            <p className="text-xs text-gray-500 font-medium">Catégories</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">303</p>
            <p className="text-xs text-gray-500 font-medium">Exercices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center col-span-2 md:col-span-1"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">0%</p>
            <p className="text-xs text-gray-500 font-medium">Complétés</p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {trainCategories.map((category, index) => (
            <Link key={category.href} href={category.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-gray-200 h-full"
              >
                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-600 shadow-md">
                  {category.difficulty}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-4xl">{category.emoji}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Target className="w-4 h-4" />
                    <span className="font-semibold">{category.exercises} exercices</span>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100"
        >
          <p className="text-2xl mb-2">🚀</p>
          <p className="text-gray-700 font-semibold mb-1">
            Prêt à relever le défi ?
          </p>
          <p className="text-gray-500 text-sm">
            Commence par n'importe quelle catégorie et progresse à ton rythme !
          </p>
        </motion.div>
      </div>
    </div>
  );
}
