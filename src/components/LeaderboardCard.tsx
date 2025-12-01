'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Crown, 
  Flame, 
  Target, 
  BookOpen, 
  Zap, 
  TrendingUp,
  X,
  ChevronDown,
  Loader2,
  Star,
  Award
} from 'lucide-react';
import { useLeaderboard, LeaderboardUser } from '@/hooks/useLeaderboard';

// Modal pour les stats d'un utilisateur
function UserStatsModal({ 
  user, 
  onClose 
}: { 
  user: LeaderboardUser; 
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
              user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
              user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
              user.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
              'bg-gradient-to-br from-blue-400 to-purple-500'
            }`}>
              {user.rank <= 3 ? (
                user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'
              ) : (
                <span className="text-white font-bold text-lg">#{user.rank}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{user.displayName}</h3>
              <p className="text-sm text-gray-500">Rang #{user.rank}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* XP Total */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 mb-5 text-white text-center">
          <p className="text-xs font-medium opacity-90 mb-1">XP Total</p>
          <p className="text-3xl font-bold">{user.totalXp.toLocaleString()}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-purple-700">{user.trainingXp}</p>
            <p className="text-[10px] text-purple-600">XP Entraînement</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-700">{user.lessonXp}</p>
            <p className="text-[10px] text-blue-600">XP Leçons</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-700">{user.missionXp}</p>
            <p className="text-[10px] text-green-600">XP Missions</p>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-orange-700">{user.currentStreak}</p>
            <p className="text-[10px] text-orange-600">Série actuelle</p>
          </div>
        </div>

        {/* More Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Taux de réussite
            </span>
            <span className="font-bold text-gray-800">{Math.round(user.successRate)}%</span>
          </div>
          
          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Questions répondues
            </span>
            <span className="font-bold text-gray-800">{user.questionsAnswered}</span>
          </div>
          
          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Leçons complétées
            </span>
            <span className="font-bold text-gray-800">{user.lessonsCompleted}</span>
          </div>
          
          {user.bestToeicScore && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Meilleur TEPITECH
              </span>
              <span className="font-bold text-gray-800">{user.bestToeicScore}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Composant Podium pour un utilisateur
function PodiumUser({ 
  user, 
  position,
  onClick,
  isCurrentUser,
  delay
}: { 
  user: LeaderboardUser | undefined;
  position: 1 | 2 | 3;
  onClick: (user: LeaderboardUser) => void;
  isCurrentUser: boolean;
  delay: number;
}) {
  if (!user) return null;

  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
  const gradients = {
    1: 'from-yellow-400 via-amber-400 to-yellow-500',
    2: 'from-gray-300 via-gray-200 to-gray-400',
    3: 'from-orange-400 via-orange-300 to-orange-500'
  };
  const medals = { 1: '👑', 2: '🥈', 3: '🥉' };
  const sizes = { 1: 'w-16 h-16', 2: 'w-14 h-14', 3: 'w-14 h-14' };
  const textSizes = { 1: 'text-lg', 2: 'text-base', 3: 'text-base' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center cursor-pointer"
      onClick={() => onClick(user)}
    >
      {/* Avatar avec médaille */}
      <motion.div
        className="relative mb-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect for #1 */}
        {position === 1 && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-400 rounded-full blur-lg"
          />
        )}
        
        {/* Avatar circle */}
        <div className={`relative ${sizes[position]} rounded-full bg-gradient-to-br ${gradients[position]} flex items-center justify-center shadow-lg ${
          isCurrentUser ? 'ring-4 ring-blue-400 ring-offset-2' : ''
        }`}>
          <span className="text-2xl">{medals[position]}</span>
        </div>
        
        {/* Crown animé pour le #1 */}
        {position === 1 && (
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" fill="#eab308" />
          </motion.div>
        )}
      </motion.div>

      {/* Nom */}
      <p className={`font-bold text-gray-800 ${textSizes[position]} text-center max-w-[80px] truncate`}>
        {user.displayName}
      </p>
      
      {/* Badge "Toi" */}
      {isCurrentUser && (
        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mt-0.5">
          Toi
        </span>
      )}

      {/* XP */}
      <p className="text-xs font-semibold text-yellow-600 mt-1">
        {user.totalXp.toLocaleString()} XP
      </p>

      {/* Piédestal */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        transition={{ delay: delay + 0.2, duration: 0.4, ease: 'easeOut' }}
        className={`${heights[position]} w-20 mt-2 rounded-t-xl bg-gradient-to-b ${gradients[position]} shadow-lg flex items-center justify-center`}
      >
        <span className="text-white font-bold text-2xl drop-shadow">{position}</span>
      </motion.div>
    </motion.div>
  );
}

// Composant pour une ligne du classement (4ème et 5ème)
function UserRow({ 
  user, 
  onClick,
  isCurrentUser 
}: { 
  user: LeaderboardUser; 
  onClick: () => void;
  isCurrentUser: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-md ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' 
          : 'bg-white hover:bg-gray-50 border border-gray-100'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Rank badge */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white">
        {user.rank}
      </div>

      {/* User info */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2 truncate">
          {user.displayName}
          {isCurrentUser && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
              Toi
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-500" />
            {user.currentStreak}j
          </span>
          <span className="flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-green-500" />
            {Math.round(user.successRate)}%
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="text-right">
        <p className="font-bold text-yellow-600 text-sm">{user.totalXp.toLocaleString()}</p>
        <p className="text-[10px] text-gray-400">XP</p>
      </div>
    </motion.button>
  );
}

// Composant séparateur "..."
function RankGap({ fromRank, toRank }: { fromRank: number; toRank: number }) {
  const gap = toRank - fromRank - 1;
  
  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex flex-col items-center gap-0.5 text-gray-400">
        <ChevronDown className="w-4 h-4" />
        <span className="text-xs font-medium">+{gap} places</span>
      </div>
    </div>
  );
}

interface LeaderboardCardProps {
  className?: string;
}

export function LeaderboardCard({ className = '' }: LeaderboardCardProps) {
  const { data, loading, error, refresh } = useLeaderboard(5);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-8 ${className}`}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-8 ${className}`}
      >
        <div className="text-center py-8">
          <p className="text-4xl mb-2">😕</p>
          <p className="text-gray-600 text-sm mb-3">{error || 'Erreur inconnue'}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </motion.div>
    );
  }

  const { topUsers, currentUser, totalUsers } = data;
  const currentUserInTop = currentUser && currentUser.rank <= 5;
  
  // Séparer le top 3 (podium) et le reste
  const podiumUsers = topUsers.slice(0, 3);
  const restUsers = topUsers.slice(3);

  // Réorganiser pour l'affichage : 2ème, 1er, 3ème
  const user1 = podiumUsers.find(u => u.rank === 1);
  const user2 = podiumUsers.find(u => u.rank === 2);
  const user3 = podiumUsers.find(u => u.rank === 3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-8 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl"
          >
            🏆
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
              Classement
            </h2>
            <p className="text-sm text-gray-500">{totalUsers} participants</p>
          </div>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl"
          >
            🏆
          </motion.div>
        </div>

        {/* Podium - Top 3 */}
        {podiumUsers.length > 0 && (
          <div className="flex items-end justify-center gap-2 md:gap-4 mb-6">
            {/* 2ème place */}
            <PodiumUser
              user={user2}
              position={2}
              onClick={setSelectedUser}
              isCurrentUser={currentUser?.id === user2?.id}
              delay={0.2}
            />
            
            {/* 1ère place */}
            <PodiumUser
              user={user1}
              position={1}
              onClick={setSelectedUser}
              isCurrentUser={currentUser?.id === user1?.id}
              delay={0}
            />
            
            {/* 3ème place */}
            <PodiumUser
              user={user3}
              position={3}
              onClick={setSelectedUser}
              isCurrentUser={currentUser?.id === user3?.id}
              delay={0.4}
            />
          </div>
        )}

        {/* 4ème et 5ème places */}
        {restUsers.length > 0 && (
          <div className="space-y-2 max-w-md mx-auto">
            {restUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <UserRow
                  user={user}
                  onClick={() => setSelectedUser(user)}
                  isCurrentUser={currentUser?.id === user.id}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Current user if not in top 5 */}
        {currentUser && !currentUserInTop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="max-w-md mx-auto"
          >
            <RankGap fromRank={5} toRank={currentUser.rank} />
            <UserRow
              user={currentUser}
              onClick={() => setSelectedUser(currentUser)}
              isCurrentUser={true}
            />
          </motion.div>
        )}

        {/* No users message */}
        {topUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Aucun utilisateur classé pour l&apos;instant.
            </p>
          </div>
        )}
      </motion.div>

      {/* User Stats Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserStatsModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
