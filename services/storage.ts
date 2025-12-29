import { UserStats } from '../types';

const STATS_KEY = 'lf_user_stats';

const DEFAULT_STATS: UserStats = {
  xp: 0,
  streak: 0,
  lastLogin: new Date().toISOString(),
  cardsLearned: 0,
  level: 1
};

export const getStats = (): UserStats => {
  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) return DEFAULT_STATS;
  return JSON.parse(stored);
};

export const updateStats = (newStats: Partial<UserStats>): UserStats => {
  const current = getStats();
  const updated = { ...current, ...newStats };
  
  // Level up logic: every 100 XP
  updated.level = Math.floor(updated.xp / 100) + 1;
  
  localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  return updated;
};

export const checkStreak = (): UserStats => {
  const stats = getStats();
  const lastLogin = new Date(stats.lastLogin);
  const today = new Date();
  
  // Reset time to compare dates only
  lastLogin.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  
  const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = stats.streak;

  if (diffDays === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (diffDays > 1) {
    // Streak broken
    newStreak = 0;
  }
  // If diffDays === 0, same day, do nothing

  const updated = {
    ...stats,
    streak: newStreak,
    lastLogin: new Date().toISOString()
  };
  
  localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  return updated;
};

export const addXp = (amount: number) => {
  const stats = getStats();
  return updateStats({ xp: stats.xp + amount, cardsLearned: stats.cardsLearned + 1 });
};