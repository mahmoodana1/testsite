/**
 * DOM Utility Functions
 * Helper functions for DOM manipulation
 */

/**
 * Get element by ID (shorthand)
 * @param {string} id - Element ID
 * @returns {HTMLElement} The element
 */
export function getEl(id) {
  return document.getElementById(id);
}

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @returns {HTMLElement} The first matching element
 */
export function s(selector) {
  return document.querySelector(selector);
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID string
 */
export function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
