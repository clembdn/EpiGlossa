'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Calendar, Trophy, Target, TrendingUp, 
  Edit2, Save, X, ChevronRight, Award, Zap, Star,
  BarChart3, Clock, CheckCircle2, RefreshCw, Flame
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useGlobalProgress } from '@/hooks/useProgress';
import { useProfileCache } from '@/hooks/useProfileCache';
import { useStreak } from '@/hooks/useStreak';

interface UserProfile {
  email: string;
  full_name?: string;
  created_at: string;
}

interface ToeicTest {
  id: string;
  score: number;
  date: string;
  listening_score: number;
  reading_score: number;
}

interface CategoryScore {
  category: string;
  name: string;
  emoji: string;
  score: number;
  maxScore: number;
  percentage: number;
}

const categoryInfo: Record<string, { name: string; emoji: string; color: string }> = {
  'audio_with_images': { name: 'Audio avec Images', emoji: '🎧', color: 'from-purple-500 to-fuchsia-400' },
  'qa': { name: 'Questions & Réponses', emoji: '❓', color: 'from-sky-500 to-blue-400' },
  'short_conversation': { name: 'Conversations Courtes', emoji: '💬', color: 'from-emerald-500 to-green-400' },
  'short_talks': { name: 'Exposés Courts', emoji: '📻', color: 'from-orange-500 to-amber-400' },
  'incomplete_sentences': { name: 'Phrases Incomplètes', emoji: '✍️', color: 'from-yellow-400 to-lime-300' },
  'text_completion': { name: 'Complétion de Texte', emoji: '📝', color: 'from-indigo-500 to-indigo-400' },
  'reading_comprehension': { name: 'Compréhension Écrite', emoji: '�', color: 'from-rose-500 to-pink-400' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { stats: globalStats, loading: statsLoading } = useGlobalProgress();
  const { streak, longestStreak, loading: streakLoading } = useStreak();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Utiliser le hook de cache pour les données
  const {
    categoryScores,
    toeicTests,
    loading: dataLoading,
    fromCache,
    refresh
  } = useProfileCache(user?.id);

  useEffect(() => {
    loadUserData();
  }, []);

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
          className="mb-8"
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Colonne gauche - Infos personnelles et stats (1/4) */}
          <div className="lg:col-span-1 space-y-6">
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

            {/* Cartes Streaks */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 gap-4"
            >
              {/* Streak actuel */}
              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Flame className="w-8 h-8" fill="white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-90">Série Actuelle</p>
                        <p className="text-xs opacity-75">Continue chaque jour !</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {streakLoading ? '...' : streak}
                    </span>
                    <span className="text-2xl font-semibold opacity-90">
                      jour{streak > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <motion.div 
                        className="bg-white h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: streak > 0 ? '100%' : '0%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="font-medium">{streak > 0 ? 'En feu!' : 'Commence aujourd\'hui'}</span>
                  </div>
                </div>
              </div>

              {/* Record personnel */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-xl text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 -translate-x-14"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 translate-x-10"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-90">Record Personnel</p>
                        <p className="text-xs opacity-75">Ta meilleure série</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {streakLoading ? '...' : longestStreak}
                    </span>
                    <span className="text-2xl font-semibold opacity-90">
                      jour{longestStreak > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-white" />
                    <span className="text-sm font-medium">
                      {longestStreak === streak && streak > 0 
                        ? 'Tu es au top ! 🎉' 
                        : longestStreak > 0 
                          ? 'Continue pour battre ton record !'
                          : 'Commence ta première série !'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Colonne droite - Graphiques et historique (3/4) */}
          <div className="lg:col-span-3 space-y-6">
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
                    Commence à t'entraîner pour voir ton graphe de compétences !
                  </p>
                  <button
                    onClick={() => router.push('/train')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                  >
                    Commencer l'entraînement
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
                    const angle = (index / categoryScores.length) * 2 * Math.PI - Math.PI / 2;
                    const isTop = point.labelY < 200;
                    const isLeft = point.labelX < 200;
                    
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
                    {categoryScores.map((cat, index) => (
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

            {/* Historique TOEIC Blancs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-yellow-500" />
                Historique TOEIC Blancs
              </h2>

              {toeicTests.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">
                    Aucun TOEIC blanc passé
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Lance ton premier test pour voir tes résultats ici
                  </p>
                  <button
                    onClick={() => router.push('/train/toeic-blanc')}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Commencer un test
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {toeicTests.map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                Score: {test.score}/990
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(test.date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">🎧 Listening:</span>
                              <span className="font-bold text-gray-800">{test.listening_score}/495</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">📚 Reading:</span>
                              <span className="font-bold text-gray-800">{test.reading_score}/495</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
