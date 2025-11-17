'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookText, 
  Languages, 
  MessageSquare, 
  Lightbulb,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  emoji: string;
  progress: number;
  lessons: number;
  minutes: number;
}

const categories: Category[] = [
  {
    id: 'vocabulaire',
    name: 'Vocabulaire',
    description: 'Mots essentiels pour réussir le Tepitech',
    icon: BookText,
    color: 'from-purple-400 to-pink-400',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
    emoji: '📚',
    progress: 35,
    lessons: 24,
    minutes: 15
  },
  {
    id: 'grammaire',
    name: 'Grammaire',
  description: 'Règles grammaticales clés du Tepitech',
    icon: Lightbulb,
    color: 'from-yellow-400 to-orange-400',
    gradient: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    emoji: '💡',
    progress: 20,
    lessons: 18,
    minutes: 20
  },
  {
    id: 'conjugaison',
    name: 'Conjugaison',
  description: 'Temps et verbes pour le Tepitech',
    icon: Languages,
    color: 'from-blue-400 to-cyan-400',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    emoji: '✏️',
    progress: 45,
    lessons: 30,
    minutes: 12
  },
  {
    id: 'comprehension',
    name: 'Compréhension',
    description: 'Lecture et analyse de documents professionnels',
    icon: MessageSquare,
    color: 'from-green-400 to-emerald-400',
    gradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
    emoji: '📖',
    progress: 60,
    lessons: 20,
    minutes: 25
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export default function LearnPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block text-6xl md:text-7xl mb-4"
          >
            🎓
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Cours spécialisés Tepitech
          </h1>
          <p className="text-gray-600 text-base md:text-lg font-medium">
            Choisis une catégorie pour commencer ton apprentissage
          </p>
        </motion.div>

        {/* Carte de progression globale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-2 border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Progression totale</h3>
                <p className="text-sm text-gray-500">Continue comme ça !</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                35%
              </p>
              <p className="text-xs text-gray-500">130 leçons</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '35%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Grille des catégories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={`/learn/${category.id}`}>
                <motion.div
                  className={`relative overflow-hidden ${category.gradient} rounded-3xl p-6 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                >
                  {/* Badge de progression */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                    <span className="text-sm font-bold text-gray-700">
                      {category.progress}%
                    </span>
                  </div>

                  {/* Icône et émoji */}
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-3xl">{category.emoji}</span>
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                        {category.name}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <BookText className="w-4 h-4" />
                      <span className="font-medium">{category.lessons} leçons</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{category.minutes} min</span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${category.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full bg-gradient-to-r ${category.color} rounded-full`}
                    />
                  </div>

                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
