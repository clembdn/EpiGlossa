'use client';

import { motion } from 'framer-motion';
import { 
  Plus, Users, Activity, Trophy, Target, 
  TrendingUp, BookOpen, Award, Flame,
  RefreshCw, ChevronDown, ChevronUp,
  BarChart3, Clock, Zap, Percent, 
  CalendarDays, UserCheck, Mail, User
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAdminStats, UserStats, TimeRange, DailyStats } from '@/hooks/useAdminStats';

// Composant sélecteur de période
function TimeRangeSelector({ 
  value, 
  onChange 
}: { 
  value: TimeRange; 
  onChange: (range: TimeRange) => void;
}) {
  const options: { value: TimeRange; label: string }[] = [
    { value: 'today', label: "Aujourd'hui" },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
  ];

  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === option.value
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Composant Graphique combiné (Aire + Ligne)
function DualAreaChart({ 
  data, 
  timeRange 
}: { 
  data: DailyStats[];
  timeRange: TimeRange;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (data.length === 0) return null;
  
  const width = 100; // pourcentage
  const height = 40;
  const padding = { top: 4, right: 6, bottom: 4, left: 6 };
  const chartWidth = 100 - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Calculer les max pour l'échelle
  const maxRegistrations = Math.max(...data.map(d => d.registrations), 1);
  const maxActive = Math.max(...data.map(d => d.activeUsers), 1);
  const maxValue = Math.max(maxRegistrations, maxActive);
  
  // Générer les points pour les courbes
  const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / maxValue) * chartHeight;
  
  // Créer le path pour l'aire des inscriptions
  const registrationsAreaPath = data.length > 0 ? `
    M ${getX(0)} ${getY(0)}
    ${data.map((d, i) => `L ${getX(i)} ${getY(d.registrations)}`).join(' ')}
    L ${getX(data.length - 1)} ${padding.top + chartHeight}
    L ${getX(0)} ${padding.top + chartHeight}
    Z
  ` : '';
  
  // Créer le path pour la ligne des utilisateurs actifs
  const activeUsersLinePath = data.length > 0 ? `
    M ${getX(0)} ${getY(data[0].activeUsers)}
    ${data.slice(1).map((d, i) => `L ${getX(i + 1)} ${getY(d.activeUsers)}`).join(' ')}
  ` : '';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === '30d') {
      return date.toLocaleDateString('fr-FR', { day: 'numeric' });
    }
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  return (
    <div className="relative">
      <svg 
        viewBox={`0 0 100 ${height}`} 
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Grille horizontale */}
        {[0, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={100 - padding.right}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke="#e5e7eb"
            strokeWidth="0.15"
            strokeDasharray="1,1"
          />
        ))}
        
        {/* Aire des inscriptions (vert) */}
        <motion.path
          d={registrationsAreaPath}
          fill="url(#registrationsGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Ligne des inscriptions */}
        <motion.path
          d={data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.registrations)}`).join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Ligne des utilisateurs actifs (violet) */}
        <motion.path
          d={activeUsersLinePath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="0.3"
          strokeLinecap="round"
          strokeDasharray="1,0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        
        {/* Points interactifs */}
        {data.map((d, i) => (
          <g key={i}>
            {/* Point inscriptions */}
            <circle
              cx={getX(i)}
              cy={getY(d.registrations)}
              r={hoveredIndex === i ? 0.8 : 0.4}
              fill="#10b981"
              className="transition-all"
            />
            {/* Point actifs */}
            <circle
              cx={getX(i)}
              cy={getY(d.activeUsers)}
              r={hoveredIndex === i ? 0.8 : 0.4}
              fill="#8b5cf6"
              className="transition-all"
            />
            {/* Zone de hover invisible */}
            <rect
              x={getX(i) - (chartWidth / data.length / 2)}
              y={padding.top}
              width={chartWidth / data.length}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            />
          </g>
        ))}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="registrationsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Labels des jours */}
      <div className="flex justify-between px-1 -mt-1">
        {data.filter((_, i) => {
          // Afficher moins de labels si beaucoup de jours
          if (timeRange === '30d') return i % 7 === 0 || i === data.length - 1;
          if (timeRange === '7d') return i === 0 || i === data.length - 1;
          return true;
        }).map((d, i, arr) => (
          <span key={d.date} className="text-[10px] text-gray-400 capitalize">
            {formatDate(d.date)}
          </span>
        ))}
      </div>
      
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-md border border-gray-200 p-2 z-10 pointer-events-none"
          style={{
            left: `${getX(hoveredIndex)}%`,
          }}
        >
          <p className="text-[10px] font-medium text-gray-600 mb-1">
            {new Date(data[hoveredIndex].date).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </p>
          <div className="flex items-center gap-1 text-[10px] mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-gray-500">Inscr:</span>
            <span className="font-bold text-emerald-600">{data[hoveredIndex].registrations}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span className="text-gray-500">Actifs:</span>
            <span className="font-bold text-purple-600">{data[hoveredIndex].activeUsers}</span>
          </div>
        </motion.div>
      )}
      
      {/* Légende */}
      <div className="flex items-center justify-center gap-4 mt-1">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-gray-500">Inscriptions</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          <span className="text-[10px] text-gray-500">Actifs</span>
        </div>
      </div>
    </div>
  );
}

// Composant Camembert (Pie Chart)
function PieChart({ 
  data, 
  size = 200,
  label = 'questions'
}: { 
  data: { name: string; value: number; color: string; emoji?: string }[];
  size?: number;
  label?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  
  let currentAngle = -90; // Commencer en haut
  
  const segments = data.map((d) => {
    const percentage = (d.value / total) * 100;
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    // Calcul du path SVG pour l'arc
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    const radius = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    return { ...d, percentage, path };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="drop-shadow-lg">
        {segments.map((seg, i) => (
          <motion.path
            key={i}
            d={seg.path}
            fill={seg.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
        {/* Cercle central blanc */}
        <circle cx={size/2} cy={size/2} r={size/4} fill="white" />
        <text x={size/2} y={size/2 - 5} textAnchor="middle" className="text-2xl font-bold fill-gray-800">
          {total}
        </text>
        <text x={size/2} y={size/2 + 15} textAnchor="middle" className="text-xs fill-gray-500">
          {label}
        </text>
      </svg>
      
      {/* Légende */}
      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="truncate text-gray-700">{seg.emoji} {seg.name}</span>
            <span className="ml-auto font-semibold text-gray-600">{Math.round(seg.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant Barre horizontale
function HorizontalBarChart({ 
  data 
}: { 
  data: { name: string; value: number; maxValue: number; color: string; emoji?: string }[] 
}) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const percentage = item.maxValue > 0 ? (item.value / item.maxValue) * 100 : 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                {item.emoji && <span>{item.emoji}</span>}
                {item.name}
              </span>
              <span className="text-sm font-bold text-gray-800">{item.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-3 rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Composant KPI Card
function KPICard({ 
  title, 
  value, 
  subtitle,
  trend,
  icon: Icon, 
  color
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-100', icon: 'bg-blue-500', text: 'text-blue-600' },
    green: { bg: 'bg-emerald-100', icon: 'bg-emerald-500', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-100', icon: 'bg-purple-500', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', icon: 'bg-orange-500', text: 'text-orange-600' },
    pink: { bg: 'bg-pink-100', icon: 'bg-pink-500', text: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-100', icon: 'bg-indigo-500', text: 'text-indigo-600' },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} rounded-2xl p-5 border-2 border-gray-100`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend.value < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
      <p className="text-sm text-gray-600 font-medium mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

function UserRow({ user, rank }: { user: UserStats; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className="bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer flex items-center gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
          {getRankBadge(rank)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {user.full_name ? (
              <>
                <User className="w-4 h-4 text-gray-400" />
                <p className="font-semibold text-gray-800 truncate">{user.full_name}</p>
              </>
            ) : (
              <p className="font-semibold text-gray-800 truncate">{user.email}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {user.full_name && (
              <>
                <Mail className="w-3 h-3" />
                <span className="truncate">{user.email}</span>
                <span className="mx-1">•</span>
              </>
            )}
            <span>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-bold text-purple-600">{user.total_xp}</p>
            <p className="text-xs text-gray-500">XP</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-blue-600">{user.questions_answered}</p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-green-600">{Math.round(user.success_rate)}%</p>
            <p className="text-xs text-gray-500">Réussite</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-orange-600 flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {user.current_streak}
            </p>
            <p className="text-xs text-gray-500">Streak</p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t-2 border-gray-100 p-4 bg-gray-50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total XP</p>
              <p className="text-lg font-bold text-purple-600">{user.total_xp}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Questions répondues</p>
              <p className="text-lg font-bold text-blue-600">{user.questions_answered}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Taux de réussite</p>
              <p className="text-lg font-bold text-green-600">{Math.round(user.success_rate)}%</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Streak actuel</p>
              <p className="text-lg font-bold text-orange-600">{user.current_streak} jours</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Meilleur streak</p>
              <p className="text-lg font-bold text-yellow-600">{user.longest_streak} jours</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Tests TOEIC</p>
              <p className="text-lg font-bold text-indigo-600">{user.toeic_tests_count}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Meilleur TOEIC</p>
              <p className="text-lg font-bold text-pink-600">
                {user.best_toeic_score ? `${user.best_toeic_score}/990` : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Dernière activité</p>
              <p className="text-sm font-semibold text-gray-600">
                {user.last_activity 
                  ? new Date(user.last_activity).toLocaleDateString('fr-FR')
                  : 'Aucune'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { platformStats, users, loading, error, refresh } = useAdminStats(timeRange);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const displayedUsers = showAllUsers ? users : users.slice(0, 10);
  
  // Label pour la période sélectionnée
  const periodLabel = timeRange === 'today' ? "aujourd'hui" : timeRange === '7d' ? '7 jours' : '30 jours';

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Gérez les questions et suivez les statistiques de la plateforme</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refresh}
                  disabled={loading}
                  className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl text-purple-700 transition-colors disabled:opacity-50"
                  title="Actualiser les données"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Link href="/train">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors">
                    Retour
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions Rapides */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Actions Rapides</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/admin/add">
                <div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-400 group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">➕</div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">Ajouter une Question</h3>
                  <p className="text-sm text-gray-600">Formulaire dynamique</p>
                </div>
              </Link>
              <Link href="/admin/questions">
                <div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-400 group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">Gérer les Questions</h3>
                  <p className="text-sm text-gray-600">Liste et modification</p>
                </div>
              </Link>
              <Link href="/admin/import">
                <div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-400 group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📤</div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">Import JSON</h3>
                  <p className="text-sm text-gray-600">Import en masse</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Chargement des statistiques...</p>
            </div>
          </div>
        ) : platformStats && (
          <>
            {/* KPI Cards principales */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-purple-500" />
                  Indicateurs Clés (KPI)
                </h2>
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              </div>
              
              {/* Helper pour calculer le % de variation */}
              {(() => {
                const calcTrend = (current: number, previous: number) => {
                  if (previous === 0) return current > 0 ? 100 : 0;
                  return Math.round(((current - previous) / previous) * 100);
                };
                
                const trendLabel = timeRange === 'today' ? 'vs hier' : timeRange === '7d' ? 'vs 7j' : 'vs 30j';
                
                const activeUsersTrend = calcTrend(
                  platformStats.activeUsersWeek, 
                  platformStats.previousPeriod.activeUsersWeek
                );
                
                const successRateTrend = calcTrend(
                  platformStats.globalSuccessRate,
                  platformStats.previousPeriod.globalSuccessRate
                );

                const retentionCurrent = platformStats.totalUsers > 0 
                  ? (platformStats.activeUsersWeek / platformStats.totalUsers) * 100 
                  : 0;
                const retentionPrevious = platformStats.totalUsers > 0 
                  ? (platformStats.previousPeriod.activeUsersWeek / platformStats.totalUsers) * 100 
                  : 0;
                const retentionTrend = calcTrend(retentionCurrent, retentionPrevious);

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard
                      title="Utilisateurs inscrits"
                      value={platformStats.totalUsers}
                      subtitle="Total sur la plateforme"
                      icon={Users}
                      color="blue"
                    />
                    <KPICard
                      title={`Actifs (${periodLabel})`}
                      value={platformStats.activeUsersWeek}
                      subtitle={`${platformStats.activeUsersToday} aujourd'hui`}
                      trend={{ value: activeUsersTrend, label: trendLabel }}
                      icon={Activity}
                      color="green"
                    />
                    <KPICard
                      title="Taux de réussite"
                      value={`${Math.round(platformStats.globalSuccessRate)}%`}
                      subtitle={`Sur ${periodLabel}`}
                      trend={{ value: successRateTrend, label: trendLabel }}
                      icon={Percent}
                      color="purple"
                    />
                    <KPICard
                      title={`Rétention (${periodLabel})`}
                      value={`${Math.round(retentionCurrent)}%`}
                      subtitle="Utilisateurs actifs / inscrits"
                      trend={{ value: retentionTrend, label: trendLabel }}
                      icon={UserCheck}
                      color="orange"
                    />
                  </div>
                );
              })()}
            </motion.div>

            {/* Section Graphiques */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Camembert - Répartition des questions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-purple-100"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  Répartition des entraînements
                </h3>
                <PieChart 
                  data={platformStats.questionsPerCategory.map((cat, i) => {
                    const colors = ['#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#eab308', '#06b6d4'];
                    return {
                      name: cat.name,
                      value: cat.count,
                      color: colors[i % colors.length],
                      emoji: cat.emoji
                    };
                  })}
                  size={220}
                />
              </motion.div>

              {/* Barres - Questions par catégorie */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-500" />
                  Répartition des leçons
                </h3>
                <PieChart 
                  data={platformStats.lessonsPerCategory.map((cat, i) => {
                    const colors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6'];
                    return {
                      name: cat.name,
                      value: cat.count,
                      color: colors[i % colors.length],
                      emoji: cat.emoji
                    };
                  })}
                  size={220}
                  label="leçons"
                />
              </motion.div>
            </div>

            {/* Stats secondaires */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* TOEIC Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Tests TOEIC
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Tests passés</span>
                    <span className="text-2xl font-bold text-yellow-600">{platformStats.totalToeicTests}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Score moyen</span>
                    <span className="text-2xl font-bold text-orange-600">{Math.round(platformStats.averageToeicScore)}<span className="text-sm text-gray-500">/990</span></span>
                  </div>
                </div>
              </motion.div>

              {/* Engagement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Engagement
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Questions totales</span>
                    <span className="text-2xl font-bold text-emerald-600">{platformStats.totalQuestionsAnswered.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <span className="text-gray-600 font-medium">XP distribué</span>
                    <span className="text-2xl font-bold text-green-600">{platformStats.totalXpDistributed.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>

              {/* Activité */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-pink-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-pink-500" />
                  Activité
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Actifs ce mois</span>
                    <span className="text-2xl font-bold text-pink-600">{platformStats.activeUsersMonth}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Moy. questions/user</span>
                    <span className="text-2xl font-bold text-rose-600">
                      {platformStats.totalUsers > 0 ? Math.round(platformStats.totalQuestionsAnswered / platformStats.totalUsers) : 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Graphique combiné Inscriptions + Utilisateurs actifs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-100 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Activité ({timeRange === 'today' ? "aujourd'hui" : timeRange === '7d' ? '7 derniers jours' : '30 derniers jours'})
              </h3>
              <DualAreaChart data={platformStats.dailyStats} timeRange={timeRange} />
            </motion.div>

            {/* Liste des utilisateurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-purple-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-500" />
                  Classement des utilisateurs
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Trié par XP
                </div>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Aucun utilisateur inscrit</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {displayedUsers.map((user, index) => (
                      <UserRow key={user.id} user={user} rank={index + 1} />
                    ))}
                  </div>

                  {users.length > 10 && (
                    <button
                      onClick={() => setShowAllUsers(!showAllUsers)}
                      className="w-full mt-4 py-3 text-purple-600 font-medium hover:bg-purple-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllUsers ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          Voir moins
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          Voir tous les {users.length} utilisateurs
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
