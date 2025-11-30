export type MissionType = 'daily' | 'weekly' | 'challenge';

export interface Mission {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: MissionType;
  requirement: number;
  currentProgress: number;
  completed: boolean;
  xpReward: number;
  expiresAt?: string;
}
