import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  category: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      const supabaseAny = supabase as any;
      
      // Load or create user points
      const { data: existingPoints } = await supabaseAny
        .from('user_points')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (!existingPoints) {
        const { data: newPoints } = await supabaseAny
          .from('user_points')
          .insert({ user_id: user!.id, total_points: 0, level: 1 })
          .select()
          .single();
        setUserPoints(newPoints);
      } else {
        setUserPoints(existingPoints);
      }

      // Load achievements
      const { data: achievementsData } = await supabaseAny
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });
      setAchievements(achievementsData || []);

      // Load user achievements
      const { data: userAchievementsData } = await supabaseAny
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user!.id);
      setUserAchievements(userAchievementsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setLoading(false);
    }
  };

  const addPoints = async (points: number, reason: string, category: string) => {
    if (!user || !userPoints) return;

    try {
      const supabaseAny = supabase as any;
      
      // Add transaction
      await supabaseAny
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points,
          reason,
          category,
        });

      // Update total points
      const newTotalPoints = userPoints.total_points + points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      const { data: updatedPoints } = await supabaseAny
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      setUserPoints(updatedPoints);

      // Check for new achievements
      checkAchievements(newTotalPoints);

      toast.success(`+${points} pontos! ${reason}`);
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const checkAchievements = async (totalPoints: number) => {
    if (!user) return;

    const supabaseAny = supabase as any;

    // Find achievements not yet unlocked
    const unlockedIds = userAchievements.map(ua => ua.achievement_id);
    const eligibleAchievements = achievements.filter(
      a => !unlockedIds.includes(a.id) && totalPoints >= a.points_required
    );

    for (const achievement of eligibleAchievements) {
      try {
        await supabaseAny
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        toast.success(`🏆 Conquista desbloqueada: ${achievement.name}!`, {
          description: achievement.description,
        });
      } catch (error) {
        console.error('Error unlocking achievement:', error);
      }
    }

    // Reload user achievements
    if (eligibleAchievements.length > 0) {
      const { data: userAchievementsData } = await supabaseAny
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user.id);
      setUserAchievements(userAchievementsData || []);
    }
  };

  return {
    userPoints,
    achievements,
    userAchievements,
    loading,
    addPoints,
    refreshData: loadGamificationData,
  };
};
