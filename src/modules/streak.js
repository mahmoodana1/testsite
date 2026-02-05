/**
 * Streak Management Module
 * Handles daily counter, streak tracking and goal completion
 */

import { state } from './state.js';
import { getTodayString, getYesterdayString } from './dates.js';
import { saveData } from './storage.js';
import { showToast } from './ui.js';

/**
 * Check if daily counter needs to be reset and reset if needed
 */
export function checkAndResetDailyCounter() {
  const today = getTodayString();
  if (state.lastResetDate !== today) {
    state.todayCompletedCount = 0;
    state.lastResetDate = today;
    // Persist the reset immediately to avoid losing previous day's data
    if (state.user) {
      saveData(false);
    }
  }
}

/**
 * Get today's completed task count
 * @returns {number} Count of tasks completed today
 */
export function getTodayCompletedCount() {
  checkAndResetDailyCounter();
  return state.todayCompletedCount;
}

/**
 * Update streak based on daily goal completion
 */
export function updateStreak() {
  const today = getTodayString();
  const todayCompleted = getTodayCompletedCount();
  
  // Check if daily goal is met
  if (todayCompleted >= state.dailyGoal) {
    const lastDate = state.lastCompletionDate ? new Date(state.lastCompletionDate).toDateString() : null;
    
    if (lastDate !== today) {
      // Check if this is a consecutive day
      if (lastDate) {
        const yesterdayStr = getYesterdayString();
        
        if (lastDate === yesterdayStr) {
          // Consecutive day - increment streak
          state.streak = (state.streak || 0) + 1;
        } else {
          // Streak broken - reset to 1
          state.streak = 1;
        }
      } else {
        // First time - start streak
        state.streak = 1;
      }
      
      state.lastCompletionDate = new Date().toISOString();
      
      if (state.streak > 1) {
        showToast(`🔥 ${state.streak} day streak! Keep it up!`);
      }
    }
  }
}

/**
 * Check if streak has expired and reset if needed
 */
export function checkStreakExpiration() {
  if (state.lastCompletionDate) {
    const lastDate = new Date(state.lastCompletionDate).toDateString();
    const today = getTodayString();
    const yesterdayStr = getYesterdayString();
    
    // If last completion was more than yesterday, reset streak
    if (lastDate !== today && lastDate !== yesterdayStr) {
      state.streak = 0;
    }
  }
}
