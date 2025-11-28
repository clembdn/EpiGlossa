'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Trophy,
  Lock,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import { Badge } from '@/hooks/useBadges';

interface BadgesShowcaseProps {
  badges: Badge[];
  unlockedCount: number;
  totalBadges: number;
  loading?: boolean;
  onExpand?: (expanded: boolean) => void;
}

const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    ring: 'ring-gray-200',
    label: 'Commun',
    labelBg: 'bg-gray-100 text-gray-600',
  },
  rare: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    ring: 'ring-blue-200',
    label: 'Rare',
    labelBg: 'bg-blue-100 text-blue-600',
  },
  epic: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    ring: 'ring-purple-200',
    label: 'Épique',
    labelBg: 'bg-purple-100 text-purple-600',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    border: 'border-amber-400',
    ring: 'ring-amber-200',
    label: 'Légendaire',
    labelBg: 'bg-amber-100 text-amber-600',
  },
};

const CATEGORY_INFO: Record<string, { label: string; emoji: string }> = {
  streak: { label: 'Série', emoji: '🔥' },
  vocabulary: { label: 'Vocabulaire', emoji: '📚' },
  grammar: { label: 'Grammaire', emoji: '✏️' },
  toeic: { label: 'TOEIC', emoji: '🎯' },
  progress: { label: 'Progression', emoji: '⭐' },
  special: { label: 'Spéciaux', emoji: '✨' },
};

function BadgeItem({ 
  badge, 
  index, 
  size = 'normal',
  showDetails = false 
}: { 
  badge: Badge; 
  index: number; 
  size?: 'small' | 'normal' | 'large';
  showDetails?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const rarity = RARITY_COLORS[badge.rarity];
  const progressPercent = Math.min((badge.currentProgress / badge.requirement) * 100, 100);

  const sizeClasses = {
    small: 'w-12 h-12 text-lg rounded-xl',
    normal: 'w-14 h-14 text-xl rounded-2xl',
    large: 'w-16 h-16 text-2xl rounded-2xl',
  }[size];

  if (showDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.02 }}
        className={`p-3 rounded-xl border-2 transition-all ${
          badge.unlocked
            ? `${rarity.bg} ${rarity.border}`
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`relative ${sizeClasses} flex items-center justify-center shrink-0 ${
            badge.unlocked ? '' : 'opacity-40'
          }`}>
            <span>{badge.emoji}</span>
            {!badge.unlocked && (
              <Lock className="absolute w-3 h-3 text-gray-400 bottom-0 right-0" />
            )}
            {badge.unlocked && badge.rarity === 'legendary' && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{ 
                  boxShadow: ['0 0 8px rgba(251, 191, 36, 0.4)', '0 0 16px rgba(251, 191, 36, 0.6)', '0 0 8px rgba(251, 191, 36, 0.4)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`font-semibold text-sm truncate ${badge.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {badge.name}
              </p>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${rarity.labelBg}`}>
                {rarity.label}
              </span>
            </div>
            <p className={`text-xs ${badge.unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
              {badge.description}
            </p>
            {!badge.unlocked && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {badge.currentProgress}/{badge.requirement}
                </span>
              </div>
            )}
            {badge.unlocked && (
              <p className="text-xs text-green-600 font-medium mt-1">✓ Débloqué</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`relative ${sizeClasses} flex items-center justify-center border-2 transition-all cursor-pointer
          ${badge.unlocked
            ? `${rarity.bg} ${rarity.border} shadow-md ring-2 ${rarity.ring}`
            : 'bg-gray-50 border-gray-200 opacity-40'
          }
          ${badge.unlocked ? 'hover:scale-110 hover:shadow-lg' : 'hover:opacity-60'}
        `}
      >
        {badge.unlocked ? (
          <>
            <span>{badge.emoji}</span>
            {badge.rarity === 'legendary' && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{ 
                  boxShadow: ['0 0 8px rgba(251, 191, 36, 0.4)', '0 0 16px rgba(251, 191, 36, 0.6)', '0 0 8px rgba(251, 191, 36, 0.4)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </>
        ) : (
          <>
            <span className="opacity-20">{badge.emoji}</span>
            <Lock className="absolute w-3 h-3 text-gray-400 bottom-0.5 right-0.5" />
          </>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2.5 bg-white rounded-xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{badge.emoji}</span>
              <span className="font-semibold text-gray-800 text-sm truncate">{badge.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
            
            {!badge.unlocked && (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Progression</span>
                  <span className="text-gray-600 font-medium">{badge.currentProgress}/{badge.requirement}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            )}
            
            {badge.unlocked && (
              <div className="text-xs text-green-600 font-medium">✓ Débloqué</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BadgesShowcase({ badges, unlockedCount, totalBadges, loading, onExpand }: BadgesShowcaseProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Trier : débloqués d'abord (par rareté), puis verrouillés proches du déblocage
  const sortedBadges = [...badges].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    
    if (a.unlocked && b.unlocked) {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    
    const progressA = a.currentProgress / a.requirement;
    const progressB = b.currentProgress / b.requirement;
    return progressB - progressA;
  });

  // Grouper par catégorie pour la vue étendue
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const displayedBadges = sortedBadges.slice(0, 12);
  const remainingCount = badges.length - displayedBadges.length;

  const nextBadge = badges
    .filter((b) => !b.unlocked)
    .sort((a, b) => (b.currentProgress / b.requirement) - (a.currentProgress / a.requirement))[0];

  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpand?.(newState);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-amber-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
      className="bg-white rounded-2xl p-5 shadow-lg border border-amber-100 overflow-hidden"
    >
      {/* Header */}
      <motion.div layout="position" className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-800">Mes badges</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
            <Star className="w-4 h-4" />
            {unlockedCount}/{totalBadges}
          </div>
        </div>
      </motion.div>

      {/* Barre de progression globale */}
      <motion.div layout="position" className="mb-4">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* Vue compacte */
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Grille de badges compacte */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {displayedBadges.map((badge, idx) => (
                <BadgeItem key={badge.id} badge={badge} index={idx} size="small" />
              ))}
            </div>

            {/* Prochain badge */}
            {nextBadge && (
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm border border-indigo-100">
                    {nextBadge.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-600 font-medium">Prochain badge</p>
                    <p className="font-semibold text-gray-800 text-sm truncate">{nextBadge.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(nextBadge.currentProgress / nextBadge.requirement) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {nextBadge.currentProgress}/{nextBadge.requirement}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton voir tous les badges */}
            <motion.button
              onClick={handleToggleExpand}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:from-amber-200 hover:to-orange-200 transition-all"
            >
              Voir tous les badges
              {remainingCount > 0 && <span className="text-amber-500">+{remainingCount}</span>}
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          /* Vue étendue */
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Badges par catégorie */}
            <div className="space-y-4 mb-4">
              {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
                const info = CATEGORY_INFO[category] || { label: category, emoji: '🏆' };
                const unlockedInCategory = categoryBadges.filter(b => b.unlocked).length;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-100 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.emoji}</span>
                        <h4 className="font-semibold text-gray-700 text-sm">{info.label}</h4>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {unlockedInCategory}/{categoryBadges.length}
                      </span>
                    </div>
                    
                    {/* Grille responsive */}
                    <div className="grid grid-cols-1 gap-2">
                      {categoryBadges.map((badge, idx) => (
                        <BadgeItem 
                          key={badge.id} 
                          badge={badge} 
                          index={idx} 
                          size="normal"
                          showDetails={true}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Légende des raretés */}
            <div className="p-3 bg-gray-50 rounded-xl mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Raretés</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(RARITY_COLORS).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${value.bg} ${value.border} border`} />
                    <span className="text-xs text-gray-500">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton réduire */}
            <motion.button
              onClick={handleToggleExpand}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
            >
              <ChevronUp className="w-4 h-4" />
              Réduire
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
