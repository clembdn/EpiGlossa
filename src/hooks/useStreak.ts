'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StreakData {
  currentStreak: number;
  lastActivityDate: string | null;
  longestStreak: number;
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastActivityDate: null,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Récupérer ou créer le streak de l'utilisateur
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading streak:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        // Créer un nouveau streak
        const { data: newStreak, error: createError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating streak:', createError);
        } else if (newStreak) {
          setStreak({
            currentStreak: 0,
            lastActivityDate: null,
            longestStreak: 0
          });
        }
      } else {
        // Calculer le streak actuel basé sur la dernière activité
        const calculatedStreak = calculateStreak(data.last_activity_date, data.current_streak);
        
        setStreak({
          currentStreak: calculatedStreak,
          lastActivityDate: data.last_activity_date,
          longestStreak: data.longest_streak
        });

        // Mettre à jour si le streak a changé (reset à 0 si > 1 jour d'inactivité)
        if (calculatedStreak !== data.current_streak) {
          await supabase
            .from('user_streaks')
            .update({ current_streak: calculatedStreak })
            .eq('user_id', user.id);
        }
      }
    } catch (err) {
      console.error('Error in loadStreak:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (lastActivityDate: string | null, currentStreakValue: number): number => {
    if (!lastActivityDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Si dernière activité était hier ou aujourd'hui, garder le streak
    // Sinon, reset à 0
    return diffDays <= 1 ? currentStreakValue : 0;
  };

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Récupérer les données actuelles depuis la DB
      const { data: currentData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!currentData) {
        console.error('No streak data found');
        return;
      }
      
      // Si déjà mis à jour aujourd'hui, ne rien faire
      if (currentData.last_activity_date === today) {
        console.log('Déjà mis à jour aujourd\'hui');
        return;
      }

      let newStreak: number;
      
      // Calculer le nouveau streak
      if (currentData.last_activity_date === null) {
        // Première fois : streak = 1
        newStreak = 1;
        console.log('Première activité, streak = 1');
      } else {
        // Calculer la différence en jours
        const lastActivity = new Date(currentData.last_activity_date);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastActivity.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`Différence: ${diffDays} jours depuis dernière activité`);
        
        if (diffDays === 1) {
          // Activité hier : incrémenter
          newStreak = currentData.current_streak + 1;
          console.log(`Série continue ! ${currentData.current_streak} -> ${newStreak}`);
        } else {
          // Plus de 1 jour : recommencer à 1
          newStreak = 1;
          console.log(`Série interrompue (${diffDays} jours), redémarrage à 1`);
        }
      }

      const newLongestStreak = Math.max(newStreak, currentData.longest_streak);

      console.log(`Mise à jour: current_streak = ${newStreak}, longest_streak = ${newLongestStreak}`);

      // Mettre à jour dans la base de données
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating streak:', error);
        return;
      }

      // Mettre à jour l'état local
      setStreak({
        currentStreak: newStreak,
        lastActivityDate: today,
        longestStreak: newLongestStreak
      });

      console.log('✅ Streak mis à jour avec succès');
      return newStreak;
    } catch (err) {
      console.error('Error in updateStreak:', err);
    }
  };

  return {
    streak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    loading,
    updateStreak,
    refresh: loadStreak
  };
}
