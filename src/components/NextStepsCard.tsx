'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Lightbulb,
  TrendingUp,
  BookOpen,
  Target,
  Flame,
  Trophy,
  Zap,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface CategoryScore {
  category: string;
  name: string;
  emoji: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  emoji: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  href: string;
  color: string;
}

interface NextStepsCardProps {
  categoryScores: CategoryScore[];
  streak: number;
  longestStreak: number;
  toeicCount: number;
  bestToeicScore: number;
  lessonsCompleted: number;
  totalXp: number;
  lastActivityDate?: string;
  loading?: boolean;
}

function generateSuggestions(props: NextStepsCardProps): Suggestion[] {
  const {
    categoryScores,
    streak,
    longestStreak,
    toeicCount,
    bestToeicScore,
    lessonsCompleted,
    totalXp,
    lastActivityDate,
  } = props;

  const suggestions: Suggestion[] = [];

  // 1. Vérifier si l'utilisateur n'a pas pratiqué aujourd'hui (streak = 0 ou pas d'activité récente)
  if (streak === 0) {
    suggestions.push({
      id: 'start-streak',
      title: 'Lance ta série !',
      description: 'Commence une leçon aujourd\'hui pour démarrer une nouvelle série',
      emoji: '🔥',
      priority: 'high',
      action: 'Commencer',
      href: '/learn',
      color: 'from-orange-500 to-red-500',
    });
  }

  // 2. Encourager à maintenir la série si elle est active
  if (streak > 0 && streak < longestStreak) {
    const daysToRecord = longestStreak - streak;
    suggestions.push({
      id: 'beat-record',
      title: `${daysToRecord} jour${daysToRecord > 1 ? 's' : ''} du record !`,
      description: `Continue comme ça pour battre ton record de ${longestStreak} jours`,
      emoji: '🏆',
      priority: 'medium',
      action: 'Continuer',
      href: '/learn',
      color: 'from-amber-500 to-orange-500',
    });
  }

  // 3. Féliciter si on est sur le record
  if (streak > 0 && streak === longestStreak && streak >= 7) {
    suggestions.push({
      id: 'on-record',
      title: 'Tu es sur ton record !',
      description: 'Continue pour établir un nouveau record personnel',
      emoji: '⭐',
      priority: 'medium',
      action: 'Prolonger',
      href: '/learn',
      color: 'from-yellow-400 to-amber-500',
    });
  }

  // 4. Analyser les catégories faibles
  if (categoryScores.length > 0) {
    // Trouver la catégorie la plus faible
    const weakestCategory = [...categoryScores].sort((a, b) => a.percentage - b.percentage)[0];
    
    if (weakestCategory && weakestCategory.percentage < 50) {
      const categoryPaths: Record<string, string> = {
        'incomplete_sentences': '/train/incomplete-sentences',
        'text_completion': '/train/text-completion',
        'reading_comprehension': '/train/reading-comprehension',
        'short_talks': '/train/short-talks',
        'qa': '/train/qa',
      };

      suggestions.push({
        id: 'improve-weak',
        title: `Renforce : ${weakestCategory.name}`,
        description: `Seulement ${Math.round(weakestCategory.percentage)}% de réussite. Un peu de pratique ?`,
        emoji: weakestCategory.emoji,
        priority: 'high',
        action: 'S\'entraîner',
        href: categoryPaths[weakestCategory.category] || '/train',
        color: 'from-purple-500 to-indigo-500',
      });
    }

    // Encourager à diversifier si une seule catégorie est pratiquée
    const practicedCategories = categoryScores.filter(c => c.score > 0);
    if (practicedCategories.length === 1 && categoryScores.length > 1) {
      const unpracticedCategory = categoryScores.find(c => c.score === 0);
      if (unpracticedCategory) {
        suggestions.push({
          id: 'diversify',
          title: `Découvre : ${unpracticedCategory.name}`,
          description: 'Diversifie ton entraînement pour progresser plus vite',
          emoji: unpracticedCategory.emoji,
          priority: 'medium',
          action: 'Explorer',
          href: '/train',
          color: 'from-cyan-500 to-blue-500',
        });
      }
    }
  }

  // 5. Suggérer un TOEIC blanc
  if (toeicCount === 0) {
    suggestions.push({
      id: 'first-toeic',
      title: 'Passe ton premier TOEIC blanc',
      description: 'Évalue ton niveau actuel avec un test complet',
      emoji: '🎯',
      priority: 'high',
      action: 'Commencer',
      href: '/train/toeic-blanc',
      color: 'from-blue-500 to-cyan-500',
    });
  } else if (toeicCount > 0 && toeicCount < 3) {
    suggestions.push({
      id: 'more-toeic',
      title: 'Refais un TOEIC blanc',
      description: `Tu as fait ${toeicCount} test${toeicCount > 1 ? 's' : ''}. Continue pour voir ta progression !`,
      emoji: '📊',
      priority: 'medium',
      action: 'Passer un test',
      href: '/train/toeic-blanc',
      color: 'from-indigo-500 to-purple-500',
    });
  }

  // 6. Objectifs TOEIC basés sur le score
  if (bestToeicScore > 0) {
    if (bestToeicScore < 600) {
      suggestions.push({
        id: 'toeic-600',
        title: 'Objectif : 600 points',
        description: `Plus que ${600 - bestToeicScore} points à gagner. Tu peux le faire !`,
        emoji: '🥉',
        priority: 'medium',
        action: 'S\'entraîner',
        href: '/train',
        color: 'from-green-500 to-emerald-500',
      });
    } else if (bestToeicScore < 785) {
      suggestions.push({
        id: 'toeic-785',
        title: 'Objectif : 785 points (B2)',
        description: `Plus que ${785 - bestToeicScore} points. Le niveau B2 est à portée !`,
        emoji: '🥈',
        priority: 'medium',
        action: 'Continuer',
        href: '/train',
        color: 'from-blue-500 to-indigo-500',
      });
    } else if (bestToeicScore < 945) {
      suggestions.push({
        id: 'toeic-945',
        title: 'Objectif : 945 points (C1)',
        description: `Plus que ${945 - bestToeicScore} points pour l'excellence !`,
        emoji: '🥇',
        priority: 'low',
        action: 'Viser haut',
        href: '/train',
        color: 'from-amber-500 to-yellow-500',
      });
    }
  }

  // 7. Encourager les débutants
  if (lessonsCompleted < 5) {
    suggestions.push({
      id: 'explore-lessons',
      title: 'Explore les leçons',
      description: `Tu as fait ${lessonsCompleted} leçon${lessonsCompleted > 1 ? 's' : ''}. Découvre d'autres contenus !`,
      emoji: '📚',
      priority: lessonsCompleted === 0 ? 'high' : 'medium',
      action: 'Explorer',
      href: '/learn',
      color: 'from-pink-500 to-rose-500',
    });
  }

  // 8. Félicitations pour les milestones XP
  if (totalXp > 0 && totalXp < 100) {
    suggestions.push({
      id: 'xp-100',
      title: `${100 - totalXp} XP pour ton 1er badge`,
      description: 'Continue de t\'entraîner pour débloquer "Collecteur d\'XP"',
      emoji: '⭐',
      priority: 'low',
      action: 'Gagner des XP',
      href: '/train',
      color: 'from-violet-500 to-purple-500',
    });
  }

  // Trier par priorité et limiter à 4 suggestions
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 4);
}

function SuggestionItem({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={suggestion.href}>
        <div className={`group relative p-4 rounded-2xl bg-gradient-to-r ${suggestion.color} text-white overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]`}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative flex items-center gap-4">
            {/* Emoji */}
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shrink-0">
              {suggestion.emoji}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white truncate">{suggestion.title}</h4>
                {suggestion.priority === 'high' && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium shrink-0">
                    Priorité
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm mt-0.5 line-clamp-1">
                {suggestion.description}
              </p>
            </div>

            {/* Action */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-medium shrink-0 group-hover:bg-white/30 transition-colors">
              {suggestion.action}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function NextStepsCard(props: NextStepsCardProps) {
  const { loading } = props;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-100 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const suggestions = generateSuggestions(props);

  // Si pas de suggestions, montrer un message de félicitations
  if (suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 shadow-xl border-2 border-green-200"
      >
        <div className="text-center py-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Excellent travail !
          </h3>
          <p className="text-green-600">
            Tu es sur la bonne voie. Continue comme ça !
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-green-600" />
          </div>
          Prochaines étapes personnalisées
        </h2>
      </div>

      {/* Subtitle */}
      <p className="text-gray-500 text-sm mb-5">
        Suggestions basées sur ta progression et tes objectifs actuels
      </p>

      {/* Suggestions */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <SuggestionItem key={suggestion.id} suggestion={suggestion} index={index} />
        ))}
      </div>

      {/* Footer motivation */}
      <div className="mt-5 pt-4 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Chaque pas compte vers ton objectif !
        </p>
      </div>
    </motion.div>
  );
}
