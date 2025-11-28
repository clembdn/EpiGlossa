'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Calendar, Trophy, Target, 
  Edit2, Save, X, Award, Star,
  BarChart3, RefreshCw, Flame, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useGlobalProgress } from '@/hooks/useProgress';
import { useProfileCache } from '@/hooks/useProfileCache';
import { useStreak } from '@/hooks/useStreak';
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals';
import { useActivityTimeline } from '@/hooks/useActivityTimeline';
import { useToeicStats } from '@/hooks/useToeicStats';
import { useLessonHistory } from '@/hooks/useLessonHistory';
import { useBadges } from '@/hooks/useBadges';
import { lessonProgressService } from '@/lib/lesson-progress';
import { WeeklyGoalsCard } from '@/components/WeeklyGoalsCard';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { ToeicStatsCard } from '@/components/ToeicStatsCard';
import { LessonHistoryCard } from '@/components/LessonHistoryCard';
import { BadgesShowcase } from '@/components/BadgesShowcase';
import { NextStepsCard } from '@/components/NextStepsCard';

interface UserProfile {
  email: string;
  full_name?: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { stats: globalStats } = useGlobalProgress();
  const { streak, longestStreak, loading: streakLoading } = useStreak();
  
  const [user, setUser] = useState<{id: string} | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [badgesExpanded, setBadgesExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Hook pour les objectifs hebdomadaires
  const {
    goals: weeklyGoals,
    progress: weeklyProgress,
    loading: goalsLoading,
    setGoal,
    removeGoal,
  } = useWeeklyGoals(user?.id);

  const {
    days: activityDays,
    summary: activitySummary,
    loading: activityLoading,
  } = useActivityTimeline(user?.id);

  // Utiliser le hook de cache pour les données
  const {
    categoryScores,
    toeicTests,
    loading: dataLoading,
    fromCache,
    refresh
  } = useProfileCache(user?.id);

  // Statistiques TOEIC détaillées
  const toeicStats = useToeicStats(toeicTests);

  // Historique des leçons
  const {
    lessons: lessonHistory,
    loading: lessonHistoryLoading,
  } = useLessonHistory(user?.id, 5);

  // Badges (missions sont sur la page d'accueil)
  const {
    badges,
    unlockedCount,
    totalBadges,
    loading: badgesLoading,
  } = useBadges(user?.id);

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronisation automatique des leçons au chargement
  useEffect(() => {
    if (user) {
      lessonProgressService.syncLocalToSupabase().catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!syncStatus) return;
    const timeout = setTimeout(() => setSyncStatus(null), 6000);
    return () => clearTimeout(timeout);
  }, [syncStatus]);

  const loadUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setProfile({
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        created_at: user.created_at
      });
      setEditedName(user.user_metadata?.full_name || '');
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await lessonProgressService.syncLocalToSupabase();
      if (result.success) {
        const synced = result.synced ?? 0;
        const successMessage = synced > 0
          ? `Progression sécurisée dans le cloud (${synced} élément${synced > 1 ? 's' : ''} synchronisé${synced > 1 ? 's' : ''}). Tu peux continuer sur un autre appareil sans rien perdre.`
          : 'Tout est déjà à jour dans le cloud. Tu peux changer d’appareil en toute sérénité.';
        setSyncStatus({ type: 'success', message: successMessage });
      } else {
        setSyncStatus({
          type: 'error',
          message: result.error || 'La synchronisation n’a pas abouti. Tes progrès restent disponibles localement; réessaie dans un instant.'
        });
      }
    } catch (error) {
      console.error('Error syncing progress:', error);
      setSyncStatus({
        type: 'error',
        message: 'Une erreur imprévue est survenue pendant la synchronisation. Tes progrès locaux restent intacts; réessaie dans un instant.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editedName }
      });

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: editedName } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {fromCache ? 'Chargement rapide...' : 'Chargement du profil...'}
          </p>
        </div>
      </div>
    );
  }

  const radarPoints = categoryScores.map((cat, index) => {
    const angle = (index / categoryScores.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 140; // Rayon du graphe
    const value = (cat.percentage / 100) * radius;
    const center = 200; // Centre du SVG
    return {
      x: center + value * Math.cos(angle),
      y: center + value * Math.sin(angle),
      labelX: center + (radius + 70) * Math.cos(angle), // Labels plus éloignés
      labelY: center + (radius + 70) * Math.sin(angle),
      ...cat
    };
  });

  const polygonPoints = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Mon Profil
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Consulte tes statistiques et personnalise ton profil
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
              <button
                onClick={handleManualSync}
                disabled={isSyncing || !user}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                title="Synchroniser manuellement tes progrès sur le cloud"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronisation...' : 'Forcer la synchro'}
              </button>

              {/* Indicateur de cache */}
              {fromCache && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs md:text-sm font-medium w-fit">
                  <span className="hidden md:inline">📦 Cache</span>
                  <span className="md:hidden">📦</span>
                  <button
                    onClick={refresh}
                    className="hover:bg-green-200 rounded-full p-1 transition-colors"
                    title="Actualiser les données"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {syncStatus && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                syncStatus.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {syncStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {syncStatus.type === 'success' ? 'Synchronisation réussie' : 'Synchronisation impossible'}
                </p>
                <p className="text-sm leading-relaxed">{syncStatus.message}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
          badgesExpanded 
            ? 'lg:grid-cols-1' 
            : 'lg:grid-cols-4'
        }`}>
          {/* Colonne gauche - Infos personnelles et stats */}
          <div className={`space-y-6 transition-all duration-300 ${
            badgesExpanded ? 'lg:col-span-1' : 'lg:col-span-1'
          }`}>
            {/* Card Profil */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-500" />
                  Informations
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-blue-500" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="text-sm text-gray-500 font-medium">Nom complet</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      placeholder="Votre nom"
                    />
                  ) : (
                    <p className="mt-1 text-gray-800 font-medium">
                      {profile?.full_name || 'Non renseigné'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="mt-1 text-gray-800 font-medium break-all">
                    {profile?.email}
                  </p>
                </div>

                {/* Date d'inscription */}
                <div>
                  <label className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membre depuis
                  </label>
                  <p className="mt-1 text-gray-800 font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'}
                  </p>
                </div>

                {/* Boutons d'édition */}
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-colors font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(profile?.full_name || '');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bouton de déconnexion */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/auth/login');
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Se déconnecter
              </button>
            </motion.div>

            {/* Stats globales */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6 shadow-xl text-white"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Statistiques Globales
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                  <span className="font-medium">Total XP</span>
                  <span className="text-2xl font-bold">{globalStats?.total_xp || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                  <span className="font-medium">Questions réussies</span>
                  <span className="text-2xl font-bold">{globalStats?.correct_count || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                  <span className="font-medium">Taux de réussite</span>
                  <span className="text-2xl font-bold">
                    {globalStats?.global_success_rate ? `${Math.round(globalStats.global_success_rate)}%` : '0%'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Carte Streaks combinée */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl p-5 shadow-xl text-white overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5" fill="white" />
                  <span className="font-semibold">Séries d&apos;entraînement</span>
                </div>

                {/* Stats en ligne */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Série actuelle */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-xs opacity-80 mb-1">Série actuelle</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {streakLoading ? '...' : streak}
                      </span>
                      <span className="text-sm opacity-80">jour{streak > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <div className="flex-1 bg-white/20 rounded-full h-1.5">
                        <motion.div 
                          className="bg-white h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: streak > 0 ? '100%' : '0%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <span className="opacity-80">{streak > 0 ? '🔥' : '💤'}</span>
                    </div>
                  </div>

                  {/* Record */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-xs opacity-80 mb-1 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Record
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {streakLoading ? '...' : longestStreak}
                      </span>
                      <span className="text-sm opacity-80">jour{longestStreak > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-white" />
                      <span className="opacity-80">
                        {longestStreak === streak && streak > 0 ? 'Au top!' : 'À battre'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message motivant */}
                <p className="text-xs text-center mt-3 opacity-75">
                  {streak === 0
                    ? 'Commence ta série aujourd\'hui !'
                    : longestStreak === streak
                    ? 'Tu es sur ton record ! Continue 🎉'
                    : `Plus que ${longestStreak - streak} jour${longestStreak - streak > 1 ? 's' : ''} pour battre ton record !`}
                </p>
              </div>
            </motion.div>

            {/* Timeline d'activité */}
            <ActivityHeatmap
              days={activityDays}
              summary={activitySummary}
              loading={activityLoading}
              variant="compact"
            />

            {/* Badges showcase */}
            <BadgesShowcase
              badges={badges}
              unlockedCount={unlockedCount}
              totalBadges={totalBadges}
              loading={badgesLoading}
              onExpand={setBadgesExpanded}
            />
          </div>

          {/* Colonne droite - Graphiques et historique */}
          {!badgesExpanded && (
          <div className="lg:col-span-3 space-y-6">
            {/* Prochaines étapes - Suggestions personnalisées */}
            <NextStepsCard
              categoryScores={categoryScores}
              streak={streak}
              longestStreak={longestStreak}
              toeicCount={toeicTests?.length || 0}
              bestToeicScore={toeicStats?.bestScore || 0}
              lessonsCompleted={lessonHistory?.filter(l => l.completed).length || 0}
              totalXp={globalStats?.total_xp || 0}
              loading={dataLoading || streakLoading}
            />

            {/* Objectifs hebdomadaires */}
            <WeeklyGoalsCard
              goals={weeklyGoals}
              progress={weeklyProgress}
              loading={goalsLoading}
              onSetGoal={setGoal}
              onRemoveGoal={removeGoal}
            />

            {/* Graphe radar des compétences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-purple-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-7 h-7 text-purple-500" />
                Compétences par Catégorie
              </h2>

              {categoryScores.length === 0 ? (
                <div className="text-center py-16">
                  <Target className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">
                    Aucune progression enregistrée
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Commence à t&apos;entraîner pour voir ton graphe de compétences !
                  </p>
                  <button
                    onClick={() => router.push('/train')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                  >
                    Commencer l&apos;entraînement
                  </button>
                </div>
              ) : (
              <div className="flex flex-col items-center">
                {/* SVG Radar Chart - Caché sur mobile, visible sur desktop */}
                <svg width="550" height="550" viewBox="0 0 400 400" className="mb-8 overflow-visible hidden md:block">
                  {/* Grille de fond */}
                  {[28, 56, 84, 112, 140].map((radius) => (
                    <polygon
                      key={radius}
                      points={categoryScores.map((_, index) => {
                        const angle = (index / categoryScores.length) * 2 * Math.PI - Math.PI / 2;
                        const r = radius;
                        return `${200 + r * Math.cos(angle)},${200 + r * Math.sin(angle)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Lignes depuis le centre */}
                  {radarPoints.map((point, index) => (
                    <line
                      key={`line-${index}`}
                      x1="200"
                      y1="200"
                      x2={point.labelX}
                      y2={point.labelY}
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Polygone des scores */}
                  <polygon
                    points={polygonPoints}
                    fill="rgba(139, 92, 246, 0.4)"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                  />

                  {/* Points */}
                  {radarPoints.map((point, index) => (
                    <circle
                      key={`point-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#8b5cf6"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Labels avec emoji */}
                  {radarPoints.map((point, index) => {
                    // Calculer l'angle pour positionner le texte dynamiquement
                    
                    return (
                      <g key={`label-${index}`}>
                        <text
                          x={point.labelX}
                          y={point.labelY - 10}
                          textAnchor="middle"
                          className="text-2xl"
                        >
                          {point.emoji}
                        </text>
                        <text
                          x={point.labelX}
                          y={point.labelY + 10}
                          textAnchor="middle"
                          className="text-sm font-bold fill-gray-700"
                        >
                          {point.name}
                        </text>
                        <text
                          x={point.labelX}
                          y={point.labelY + 26}
                          textAnchor="middle"
                          className="text-xs font-semibold fill-purple-600"
                        >
                          {Math.round(point.percentage)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Légende détaillée - Cartes de progression */}
                <div className="w-full">
                  {/* Message pour mobile */}
                  <div className="md:hidden text-center mb-6">
                    <p className="text-sm text-gray-600 font-medium">
                      📊 Tes compétences par catégorie
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryScores.map((cat) => (
                      <div
                        key={cat.category}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200 hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl md:text-3xl">{cat.emoji}</span>
                          <div className="flex-1">
                            <p className="text-base md:text-base font-bold text-gray-800">{cat.name}</p>
                            <p className="text-sm text-gray-600">
                              {cat.score} / {cat.maxScore} XP
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                              {Math.round(cat.percentage)}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </motion.div>

            {/* Statistiques TOEIC détaillées */}
            {toeicStats ? (
              <ToeicStatsCard
                stats={toeicStats}
                onStartTest={() => router.push('/train/toeic-blanc')}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-100"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-yellow-500" />
                  Statistiques TOEIC
                </h2>
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">
                    Aucun TOEIC blanc passé
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Lance ton premier test pour voir tes statistiques détaillées
                  </p>
                  <button
                    onClick={() => router.push('/train/toeic-blanc')}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Commencer un test
                  </button>
                </div>
              </motion.div>
            )}

            {/* Historique des leçons */}
            <LessonHistoryCard
              lessons={lessonHistory}
              loading={lessonHistoryLoading}
              onViewAll={() => router.push('/learn')}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
