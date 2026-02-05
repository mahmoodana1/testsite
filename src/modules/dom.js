/**
 * DOM utility functions
 */

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement} Element
 */
export const getEl = (id) => document.getElementById(id);

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
