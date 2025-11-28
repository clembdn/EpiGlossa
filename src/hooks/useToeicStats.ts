'use client';

import { useMemo } from 'react';

export interface ToeicTest {
  id: string;
  score: number;
  date: string;
  listening_score: number;
  reading_score: number;
}

export interface ToeicTrend {
  direction: 'up' | 'down' | 'stable';
  points: number;
  percentage: number;
}

export interface ToeicStats {
  // Scores moyens
  averageScore: number;
  averageListening: number;
  averageReading: number;

  // Meilleurs scores
  bestScore: number;
  bestListening: number;
  bestReading: number;

  // Dernier test
  latestScore: number;
  latestListening: number;
  latestReading: number;

  // Tendances (comparaison dernier vs avant-dernier)
  scoreTrend: ToeicTrend;
  listeningTrend: ToeicTrend;
  readingTrend: ToeicTrend;

  // Progression globale (premier vs dernier)
  overallProgression: number;
  listeningProgression: number;
  readingProgression: number;

  // Analyse forces/faiblesses
  strongerSection: 'listening' | 'reading' | 'balanced';
  listeningVsReadingGap: number;

  // Objectifs
  targetScore: number;
  pointsToTarget: number;
  estimatedTestsToTarget: number;

  // Métriques additionnelles
  totalTests: number;
  consistencyScore: number; // Écart-type inversé (plus stable = plus haut)
  lastTestDate: string | null;
}

const DEFAULT_TARGET = 800;

function computeTrend(current: number, previous: number): ToeicTrend {
  const diff = current - previous;
  const percentage = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  if (diff > 10) {
    return { direction: 'up', points: diff, percentage };
  } else if (diff < -10) {
    return { direction: 'down', points: Math.abs(diff), percentage: Math.abs(percentage) };
  }
  return { direction: 'stable', points: Math.abs(diff), percentage: Math.abs(percentage) };
}

function computeConsistency(scores: number[]): number {
  if (scores.length < 2) return 100;

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Inverser: plus l'écart-type est petit, plus le score est haut
  // Max stdDev réaliste ~200, on normalise
  const normalized = Math.max(0, 100 - (stdDev / 2));
  return Math.round(normalized);
}

export function useToeicStats(tests: ToeicTest[], targetScore: number = DEFAULT_TARGET): ToeicStats | null {
  return useMemo(() => {
    if (!tests || tests.length === 0) return null;

    // Trier par date (plus ancien au plus récent pour la progression)
    const sorted = [...tests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const scores = sorted.map((t) => t.score);
    const listeningScores = sorted.map((t) => t.listening_score);
    const readingScores = sorted.map((t) => t.reading_score);

    // Calculs de base
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr: number[]) => (arr.length > 0 ? sum(arr) / arr.length : 0);

    const averageScore = Math.round(avg(scores));
    const averageListening = Math.round(avg(listeningScores));
    const averageReading = Math.round(avg(readingScores));

    const bestScore = Math.max(...scores);
    const bestListening = Math.max(...listeningScores);
    const bestReading = Math.max(...readingScores);

    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const first = sorted[0];

    // Tendances
    const scoreTrend = previous
      ? computeTrend(latest.score, previous.score)
      : { direction: 'stable' as const, points: 0, percentage: 0 };

    const listeningTrend = previous
      ? computeTrend(latest.listening_score, previous.listening_score)
      : { direction: 'stable' as const, points: 0, percentage: 0 };

    const readingTrend = previous
      ? computeTrend(latest.reading_score, previous.reading_score)
      : { direction: 'stable' as const, points: 0, percentage: 0 };

    // Progression globale
    const overallProgression = latest.score - first.score;
    const listeningProgression = latest.listening_score - first.listening_score;
    const readingProgression = latest.reading_score - first.reading_score;

    // Analyse forces/faiblesses (sur le dernier test)
    const listeningVsReadingGap = latest.listening_score - latest.reading_score;
    let strongerSection: 'listening' | 'reading' | 'balanced';
    if (listeningVsReadingGap > 30) {
      strongerSection = 'listening';
    } else if (listeningVsReadingGap < -30) {
      strongerSection = 'reading';
    } else {
      strongerSection = 'balanced';
    }

    // Objectif
    const pointsToTarget = Math.max(0, targetScore - latest.score);

    // Estimation du nombre de tests pour atteindre l'objectif
    // Basé sur la progression moyenne par test
    let estimatedTestsToTarget = 0;
    if (pointsToTarget > 0 && sorted.length > 1) {
      const avgProgressionPerTest = overallProgression / (sorted.length - 1);
      if (avgProgressionPerTest > 0) {
        estimatedTestsToTarget = Math.ceil(pointsToTarget / avgProgressionPerTest);
      } else {
        estimatedTestsToTarget = -1; // Progression négative ou nulle
      }
    }

    return {
      averageScore,
      averageListening,
      averageReading,
      bestScore,
      bestListening,
      bestReading,
      latestScore: latest.score,
      latestListening: latest.listening_score,
      latestReading: latest.reading_score,
      scoreTrend,
      listeningTrend,
      readingTrend,
      overallProgression,
      listeningProgression,
      readingProgression,
      strongerSection,
      listeningVsReadingGap,
      targetScore,
      pointsToTarget,
      estimatedTestsToTarget,
      totalTests: tests.length,
      consistencyScore: computeConsistency(scores),
      lastTestDate: latest.date,
    };
  }, [tests, targetScore]);
}
