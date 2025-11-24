'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Lock, CheckCircle2, Circle, Play, Trophy } from 'lucide-react';
import Link from 'next/link';
import { vocabularyLessons } from '@/data/vocabulary-lessons';
import { lessonProgressService } from '@/lib/lesson-progress';

interface Lesson {
  id: number;
  title: string;
  description: string;
  xp: number;
  duration: number;
  locked: boolean;
  completed: boolean;
  status: 'locked' | 'available' | 'completed';
}

const categoryData: Record<string, { name: string; emoji: string; color: string; lessons: Lesson[] }> = {
  vocabulaire: {
    name: 'Vocabulaire',
    emoji: '📚',
    color: 'from-purple-400 to-pink-400',
    lessons: vocabularyLessons
  },
  grammaire: {
    name: 'Grammaire',
    emoji: '💡',
    color: 'from-yellow-400 to-orange-400',
    lessons: [
      { id: 1, title: 'Les articles', description: 'A, an, the', xp: 60, duration: 8, locked: false, completed: false, status: 'available' },
      { id: 2, title: 'Les pronoms', description: 'I, you, he, she, it...', xp: 70, duration: 10, locked: true, completed: false, status: 'locked' },
    ]
  },
  conjugaison: {
    name: 'Conjugaison',
    emoji: '✏️',
    color: 'from-blue-400 to-cyan-400',
    lessons: [
      { id: 1, title: 'Le présent simple', description: 'Base de la conjugaison', xp: 80, duration: 12, locked: false, completed: false, status: 'available' },
    ]
  },
  comprehension: {
    name: 'Compréhension',
    emoji: '📖',
    color: 'from-green-400 to-emerald-400',
    lessons: [
      { id: 1, title: 'Textes courts', description: 'Lis et comprends', xp: 75, duration: 15, locked: false, completed: false, status: 'available' },
    ]
  },
  expression: {
    name: 'Expression',
    emoji: '✍️',
    color: 'from-indigo-400 to-purple-400',
    lessons: [
      { id: 1, title: 'Se présenter', description: 'Écris ta présentation', xp: 70, duration: 10, locked: false, completed: false, status: 'available' },
    ]
  },
  prononciation: {
    name: 'Prononciation',
    emoji: '🗣️',
    color: 'from-red-400 to-pink-400',
    lessons: [
      { id: 1, title: 'Les sons TH', description: 'Maîtrise les th', xp: 65, duration: 8, locked: false, completed: false, status: 'available' },
    ]
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const categoryInfo = categoryData[category];
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (categoryInfo) {
      // Mettre à jour les leçons avec la progression réelle
      const updatedLessons = categoryInfo.lessons.map(lesson => {
        const isCompleted = lessonProgressService.isLessonCompleted(category, lesson.id);
        return {
          ...lesson,
          completed: isCompleted,
          status: lesson.locked ? 'locked' : (isCompleted ? 'completed' : 'available') as 'locked' | 'available' | 'completed'
        };
      });
      setLessons(updatedLessons);

      // Calculer le XP total gagné
      const xp = updatedLessons
        .filter(l => l.completed)
        .reduce((sum, l) => {
          const progress = lessonProgressService.getLessonProgress(category, l.id);
          return sum + (progress?.xpEarned || 0);
        }, 0);
      setTotalXP(xp);
    }
  }, [category, categoryInfo]);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <p className="text-2xl">❌</p>
          <p className="text-gray-600 mt-2">Catégorie introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className={`w-16 h-16 bg-gradient-to-br ${categoryInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <span className="text-4xl">{categoryInfo.emoji}</span>
              </motion.div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {categoryInfo.name}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {lessons.filter(l => l.completed).length}/{lessons.length} leçons complétées
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-700">
                    {totalXP} XP
                  </span>
                </div>
                <p className="text-xs text-gray-500">Total gagné</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(lessons.filter(l => l.completed).length / lessons.length) * 100}%` 
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full bg-gradient-to-r ${categoryInfo.color}`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lessons Path */}
        <div className="relative">
          {/* Path line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 rounded-full" />

          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector dot */}
                <div className={`absolute left-8 top-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white z-10 ${
                  lesson.completed ? 'bg-green-500' : lesson.locked ? 'bg-gray-300' : 'bg-blue-500'
                }`} />

                {/* Lesson Card */}
                <motion.div
                  className={`ml-16 ${
                    lesson.locked 
                      ? 'bg-gray-50 opacity-60' 
                      : 'bg-white hover:shadow-xl'
                  } rounded-2xl p-5 shadow-lg border-2 border-white transition-all duration-300 relative overflow-hidden group`}
                >
                  {/* Status Icon */}
                  <div className="absolute top-4 right-4">
                    {lesson.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <CheckCircle2 className="w-8 h-8 text-green-500" fill="currentColor" />
                      </motion.div>
                    )}
                    {lesson.locked && <Lock className="w-6 h-6 text-gray-400" />}
                    {!lesson.completed && !lesson.locked && (
                      <Circle className="w-6 h-6 text-blue-400" />
                    )}
                  </div>

                  <div className="pr-12">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        lesson.completed ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                        lesson.locked ? 'bg-gray-300' :
                        `bg-gradient-to-br ${categoryInfo.color}`
                      }`}>
                        {lesson.id}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{lesson.xp} XP</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 font-medium">
                        {lesson.duration} min
                      </span>
                    </div>

                    {!lesson.locked && !lesson.completed && (
                      <Link href={`/learn/${category}/${lesson.id}`}>
                        <motion.button
                          className={`mt-4 w-full bg-gradient-to-r ${categoryInfo.color} text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                        >
                          <Play className="w-5 h-5" fill="white" />
                          Commencer la leçon
                        </motion.button>
                      </Link>
                    )}

                    {lesson.completed && (
                      <Link href={`/learn/${category}/${lesson.id}`}>
                        <motion.button
                          className="mt-4 w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          Revoir la leçon
                        </motion.button>
                      </Link>
                    )}

                    {lesson.locked && (
                      <div className="mt-4 w-full bg-gray-200 text-gray-500 font-semibold py-3 px-6 rounded-xl text-center flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Complète les leçons précédentes
                      </div>
                    )}
                  </div>

                  {/* Shine effect */}
                  {!lesson.locked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Motivational footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center bg-white rounded-2xl p-6 shadow-lg"
        >
          <p className="text-2xl mb-2">🎯</p>
          <p className="text-gray-700 font-semibold mb-1">
            Continue comme ça !
          </p>
          <p className="text-gray-500 text-sm">
            Chaque leçon te rapproche de ton objectif
          </p>
        </motion.div>
      </div>
    </div>
  );
}
