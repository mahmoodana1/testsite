/**
 * Date Utility Functions
 * Helper functions for date operations
 */

/**
 * Get today's date as a string
 * @returns {string} Today's date string
 */
export function getTodayString() {
  return new Date().toDateString();
}

/**
 * Get yesterday's date as a string
 * @returns {string} Yesterday's date string
 */
export function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
}

/**
 * Format time in seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
