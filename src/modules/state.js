/**
 * State Management Module
 * Centralizes application state and provides access methods
 */

export const colors = {
  blue: 'var(--accent-blue)',
  purple: 'var(--accent-purple)',
  green: 'var(--accent-green)',
  orange: 'var(--accent-orange)',
  red: 'var(--accent-red)',
  gray: 'var(--text-tertiary)'
};

export const MAX_DAILY_GOAL = 50;

export let state = {
  user: null,
  todos: [],
  courses: [],
  focusId: null,
  timer: { isRunning: false, timeLeft: 1500, duration: 25 },
  lastUndo: null,
  isLocalUpdate: false,
  currentCourseId: null,
  dailyGoal: 5,
  streak: 0,
  lastCompletionDate: null,
  todayCompletedCount: 0,
  lastResetDate: null
};

export let activeColor = 'blue';
export let focusTarget = null;

// Setters for module-level variables
export function setActiveColor(color) {
  activeColor = color;
}

export function setFocusTarget(target) {
  focusTarget = target;
}

export function setState(newState) {
  state = { ...state, ...newState };
}
