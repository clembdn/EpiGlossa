import { Mission } from '@/types/mission';

export interface MissionStatsSnapshot {
  lessonsCompleted: number;
  currentStreak: number;
  toeicCount: number;
  perfectLessons: number;
}

export const buildMissions = (stats: MissionStatsSnapshot, referenceDate: Date = new Date()): Mission[] => {
  const today = referenceDate;
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const endOfWeek = new Date(today);
  const daysUntilEndOfWeek = (7 - today.getDay()) % 7;
  endOfWeek.setDate(today.getDate() + daysUntilEndOfWeek);
  endOfWeek.setHours(23, 59, 59, 999);

  return [
    {
      id: 'daily-lesson',
      name: 'Leçon du jour',
      description: 'Termine une leçon aujourd\'hui',
      emoji: '📖',
      type: 'daily',
      requirement: 1,
      currentProgress: stats.lessonsCompleted > 0 ? 1 : 0,
      completed: stats.lessonsCompleted > 0,
      xpReward: 20,
      expiresAt: endOfDay.toISOString(),
    },
    {
      id: 'daily-streak',
      name: 'Garde ta flamme',
      description: 'Connecte-toi aujourd\'hui pour maintenir ta série',
      emoji: '🔥',
      type: 'daily',
      requirement: 1,
      currentProgress: stats.currentStreak > 0 ? 1 : 0,
      completed: stats.currentStreak > 0,
      xpReward: 10,
      expiresAt: endOfDay.toISOString(),
    },
    {
      id: 'weekly-toeic',
      name: 'TEPITECH de la semaine',
      description: 'Fais un TEPITECH blanc cette semaine',
      emoji: '🎯',
      type: 'weekly',
      requirement: 1,
      currentProgress: Math.min(stats.toeicCount, 1),
      completed: stats.toeicCount > 0,
      xpReward: 50,
      expiresAt: endOfWeek.toISOString(),
    },
    {
      id: 'weekly-lessons',
      name: 'Semaine productive',
      description: 'Termine 5 leçons cette semaine',
      emoji: '📚',
      type: 'weekly',
      requirement: 5,
      currentProgress: Math.min(stats.lessonsCompleted, 5),
      completed: stats.lessonsCompleted >= 5,
      xpReward: 75,
      expiresAt: endOfWeek.toISOString(),
    },
    {
      id: 'challenge-perfect',
      name: 'Défi perfection',
      description: 'Obtiens 100% sur une leçon',
      emoji: '💯',
      type: 'challenge',
      requirement: 1,
      currentProgress: Math.min(stats.perfectLessons, 1),
      completed: stats.perfectLessons >= 1,
      xpReward: 100,
    },
  ];
};

export const calculateMissionXp = (missions: Mission[]): number => {
  return missions.reduce((sum, mission) => sum + (mission.completed ? mission.xpReward : 0), 0);
};
