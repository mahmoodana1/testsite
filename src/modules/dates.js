/**
 * Date utility functions
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
 * Format seconds to MM:SS format
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
