'use client';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Clock, CheckCircle2, Play, History } from 'lucide-react';
import Link from 'next/link';
import { LessonHistoryItem } from '@/hooks/useLessonHistory';

interface LessonHistoryCardProps {
  lessons: LessonHistoryItem[];
  loading?: boolean;
  onViewAll?: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function LessonItem({ lesson, index }: { lesson: LessonHistoryItem; index: number }) {
  const href = `/learn/${lesson.category}/${lesson.lessonId}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={href}
        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        {/* Emoji + Badge catégorie */}
        <div className={`w-12 h-12 rounded-xl ${lesson.color} flex items-center justify-center text-white text-xl shrink-0`}>
          {lesson.emoji}
        </div>

        {/* Infos leçon */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 truncate">
              {lesson.title}
            </p>
            {lesson.completed && (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span>{lesson.theme}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(lesson.lastAccessedAt)}
            </span>
          </div>

          {/* Barre de progression */}
          {!lesson.completed && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${lesson.color}`}
                  style={{ width: `${lesson.progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 font-medium">{lesson.progressPercent}%</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="shrink-0">
          {lesson.completed ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              <span>+{lesson.xpEarned} XP</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium group-hover:bg-indigo-200 transition-colors">
              <Play className="w-4 h-4" />
              <span>Reprendre</span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
      </Link>
    </motion.div>
  );
}

export function LessonHistoryCard({ lessons, loading, onViewAll }: LessonHistoryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-indigo-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-100"
      >
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <History className="w-6 h-6 text-indigo-500" />
          Historique des leçons
        </h3>
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-1">Aucune leçon consultée</p>
          <p className="text-gray-400 text-sm">Commence une leçon pour la voir ici</p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Explorer les leçons
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-500" />
          Historique des leçons
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Tout voir
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {lessons.map((lesson, idx) => (
          <LessonItem key={`${lesson.category}-${lesson.lessonId}`} lesson={lesson} index={idx} />
        ))}
      </div>

      {/* Quick action pour continuer */}
      {lessons.some((l) => !l.completed) && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          {(() => {
            const nextLesson = lessons.find((l) => !l.completed);
            if (!nextLesson) return null;
            return (
              <Link
                href={`/learn/${nextLesson.category}/${nextLesson.lessonId}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
              >
                <Play className="w-5 h-5" />
                Continuer : {nextLesson.title}
              </Link>
            );
          })()}
        </div>
      )}
    </motion.div>
  );
}
