/**
 * Theme Management Module
 * Handles theme switching and custom theme creation
 */

import { getEl } from './dom.js';
import { showToast } from './ui.js';

export const themes = {
  'cappuccino': 'Cappuccino (Light)',
  'catppuccin': 'Catppuccin (Dark)',
  'nord': 'Nord',
  'dracula': 'Dracula',
  'gruvbox': 'Gruvbox',
  'solarized-dark': 'Solarized Dark',
  'solarized-light': 'Solarized Light',
  'monokai': 'Monokai',
  'onedark': 'One Dark',
  'tokyonight': 'Tokyo Night'
};

/**
 * Apply a theme
 * @param {string} themeName - Theme name
 */
export function applyTheme(themeName) {
  document.body.classList.remove('dark-mode');
  Object.keys(themes).forEach(theme => {
    document.body.classList.remove(`theme-${theme}`);
  });
  
  if (themeName.startsWith('custom-')) {
    const customThemeName = themeName.substring(7);
    applyNamedCustomTheme(customThemeName);
    localStorage.setItem('theme', themeName);
  } else if (themeName === 'custom') {
    applyCustomTheme();
    localStorage.setItem('theme', 'custom');
  } else {
    document.body.classList.add(`theme-${themeName}`);
    localStorage.setItem('theme', themeName);
  }
  
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.dataset.theme === themeName) {
      opt.classList.add('active');
    }
  });
}

/**
 * Apply custom theme from localStorage
 */
export function applyCustomTheme() {
  const customTheme = localStorage.getItem('customTheme');
  if (!customTheme) return;
  
  const theme = JSON.parse(customTheme);
  const root = document.documentElement;
  
  root.style.setProperty('--bg-body', theme.bgBody);
  root.style.setProperty('--bg-card', theme.bgCard);
  root.style.setProperty('--bg-input', theme.bgInput);
  root.style.setProperty('--bg-hover', adjustColorBrightness(theme.bgInput, 10));
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--text-tertiary', adjustColorBrightness(theme.textSecondary, -20));
  root.style.setProperty('--accent-blue', theme.accentBlue);
  root.style.setProperty('--accent-blue-soft', hexToRgba(theme.accentBlue, 0.15));
  root.style.setProperty('--accent-green', theme.accentGreen);
  root.style.setProperty('--accent-green-soft', hexToRgba(theme.accentGreen, 0.15));
  root.style.setProperty('--accent-orange', theme.accentOrange);
  root.style.setProperty('--accent-red', theme.accentRed);
  root.style.setProperty('--border-color', adjustColorBrightness(theme.bgInput, 5));
  root.style.setProperty('--bg-sidebar', theme.bgCard);
  root.style.setProperty('--bg-glass', hexToRgba(theme.bgBody, 0.85));
}

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha value
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Adjust color brightness
 * @param {string} hex - Hex color
 * @param {number} percent - Percentage to adjust
 * @returns {string} Adjusted hex color
 */
export function adjustColorBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (val) => Math.max(0, Math.min(255, val));
  const R = clamp((num >> 16) + amt);
  const G = clamp((num >> 8 & 0x00FF) + amt);
  const B = clamp((num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * Set color picker value
 * @param {string} id - Element ID
 * @param {string} color - Color value
 */
export function setColorPicker(id, color) {
  getEl(id).value = color;
  getEl(id + 'Hex').value = color;
}

/**
 * Setup color picker listeners for live preview
 */
export function setupColorPickerListeners() {
  const colorFields = [
    'customBgBody', 'customBgCard', 'customBgInput',
    'customTextPrimary', 'customTextSecondary',
    'customAccentBlue', 'customAccentGreen', 'customAccentOrange', 'customAccentRed'
  ];
  
  const isValidHexColor = (value) => /^#[0-9A-F]{6}$/i.test(value);
  
  colorFields.forEach(fieldId => {
    const colorInput = getEl(fieldId);
    const hexInput = getEl(fieldId + 'Hex');
    
    colorInput.oninput = () => {
      hexInput.value = colorInput.value;
      previewCustomTheme();
    };
    
    hexInput.oninput = () => {
      if (isValidHexColor(hexInput.value)) {
        colorInput.value = hexInput.value;
        previewCustomTheme();
      }
    };
  });
  
  getEl('applyCustomThemeBtn').onclick = () => {
    saveCustomTheme();
    getEl('customThemeModal').classList.remove('active');
  };
}

/**
 * Preview custom theme in real-time
 */
export function previewCustomTheme() {
  const root = document.documentElement;
  const theme = {
    bgBody: getEl('customBgBody').value,
    bgCard: getEl('customBgCard').value,
    bgInput: getEl('customBgInput').value,
    textPrimary: getEl('customTextPrimary').value,
    textSecondary: getEl('customTextSecondary').value,
    accentBlue: getEl('customAccentBlue').value,
    accentGreen: getEl('customAccentGreen').value,
    accentOrange: getEl('customAccentOrange').value,
    accentRed: getEl('customAccentRed').value
  };
  
  root.style.setProperty('--bg-body', theme.bgBody);
  root.style.setProperty('--bg-card', theme.bgCard);
  root.style.setProperty('--bg-input', theme.bgInput);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent-blue', theme.accentBlue);
  root.style.setProperty('--accent-green', theme.accentGreen);
  root.style.setProperty('--accent-orange', theme.accentOrange);
  root.style.setProperty('--accent-red', theme.accentRed);
}

/**
 * Get custom theme storage key
 * @param {string} themeName - Theme name
 * @returns {string} Storage key
 */
export function getCustomThemeKey(themeName) {
  return 'custom-' + themeName;
}

/**
 * Save custom theme to localStorage
 */
export function saveCustomTheme() {
  let themeName = getEl('customThemeName').value.trim();
  
  if (!themeName) {
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
    let counter = 1;
    do {
      themeName = 'Untitled Theme ' + counter;
      counter++;
    } while (customThemes.some(t => t.name === themeName));
  }
  
  const theme = {
    name: themeName,
    bgBody: getEl('customBgBody').value,
    bgCard: getEl('customBgCard').value,
    bgInput: getEl('customBgInput').value,
    textPrimary: getEl('customTextPrimary').value,
    textSecondary: getEl('customTextSecondary').value,
    accentBlue: getEl('customAccentBlue').value,
    accentGreen: getEl('customAccentGreen').value,
    accentOrange: getEl('customAccentOrange').value,
    accentRed: getEl('customAccentRed').value
  };
  
  let customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
  const existingIndex = customThemes.findIndex(t => t.name === themeName);
  
  if (existingIndex >= 0) {
    customThemes[existingIndex] = theme;
    showToast('✨ Theme "' + themeName + '" updated!');
  } else {
    customThemes.push(theme);
    showToast('✨ Theme "' + themeName + '" created!');
  }
  
  localStorage.setItem('customThemes', JSON.stringify(customThemes));
  applyNamedCustomTheme(themeName);
  localStorage.setItem('theme', getCustomThemeKey(themeName));
  renderCustomThemesList();
}

/**
 * Apply a named custom theme
 * @param {string} themeName - Theme name
 */
export function applyNamedCustomTheme(themeName) {
  const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
  const theme = customThemes.find(t => t.name === themeName);
  if (!theme) return;
  
  const root = document.documentElement;
  
  root.style.setProperty('--bg-body', theme.bgBody);
  root.style.setProperty('--bg-card', theme.bgCard);
  root.style.setProperty('--bg-input', theme.bgInput);
  root.style.setProperty('--bg-hover', adjustColorBrightness(theme.bgInput, 10));
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--text-tertiary', adjustColorBrightness(theme.textSecondary, -20));
  root.style.setProperty('--accent-blue', theme.accentBlue);
  root.style.setProperty('--accent-blue-soft', hexToRgba(theme.accentBlue, 0.15));
  root.style.setProperty('--accent-green', theme.accentGreen);
  root.style.setProperty('--accent-green-soft', hexToRgba(theme.accentGreen, 0.15));
  root.style.setProperty('--accent-orange', theme.accentOrange);
  root.style.setProperty('--accent-red', theme.accentRed);
  root.style.setProperty('--border-color', adjustColorBrightness(theme.bgInput, 5));
  root.style.setProperty('--bg-sidebar', theme.bgCard);
  root.style.setProperty('--bg-glass', hexToRgba(theme.bgBody, 0.85));
}

/**
 * Render custom themes list in dropdown
 */
export function renderCustomThemesList() {
  const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
  const container = getEl('customThemesList');
  
  if (customThemes.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = customThemes.map(theme => {
    const gradient = `linear-gradient(135deg, ${theme.bgBody} 30%, ${theme.accentBlue} 70%)`;
    return `
      <div class="custom-theme-item">
        <button class="theme-option" data-custom-theme="${theme.name}">
          <div class="theme-color-preview" style="background: ${gradient};"></div>
          <span>${theme.name}</span>
        </button>
        <button class="custom-theme-delete" data-theme-name="${theme.name}" title="Delete theme">×</button>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.theme-option[data-custom-theme]').forEach(btn => {
    btn.onclick = () => {
      const themeName = btn.dataset.customTheme;
      applyNamedCustomTheme(themeName);
      localStorage.setItem('theme', getCustomThemeKey(themeName));
      document.querySelector('.theme-dropdown').classList.remove('active');
      showToast('✨ Applied "' + themeName + '"');
    };
  });
  
  container.querySelectorAll('.custom-theme-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const themeName = btn.dataset.themeName;
      if (confirm('Delete theme "' + themeName + '"?')) {
        deleteCustomTheme(themeName);
      }
    };
  });
}

/**
 * Delete a custom theme
 * @param {string} themeName - Theme name
 */
export function deleteCustomTheme(themeName) {
  let customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
  customThemes = customThemes.filter(t => t.name !== themeName);
  localStorage.setItem('customThemes', JSON.stringify(customThemes));
  
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === getCustomThemeKey(themeName)) {
    applyTheme('cappuccino');
  }
  
  renderCustomThemesList();
  showToast('🗑️ Theme "' + themeName + '" deleted');
}

// Store original theme state before opening modal
let originalThemeState = null;

/**
 * Store current theme CSS variables for restoration
 */
function storeOriginalTheme() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  originalThemeState = {
    bgBody: computedStyle.getPropertyValue('--bg-body').trim(),
    bgCard: computedStyle.getPropertyValue('--bg-card').trim(),
    bgInput: computedStyle.getPropertyValue('--bg-input').trim(),
    bgHover: computedStyle.getPropertyValue('--bg-hover').trim(),
    textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
    textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
    textTertiary: computedStyle.getPropertyValue('--text-tertiary').trim(),
    accentBlue: computedStyle.getPropertyValue('--accent-blue').trim(),
    accentBlueSoft: computedStyle.getPropertyValue('--accent-blue-soft').trim(),
    accentGreen: computedStyle.getPropertyValue('--accent-green').trim(),
    accentGreenSoft: computedStyle.getPropertyValue('--accent-green-soft').trim(),
    accentOrange: computedStyle.getPropertyValue('--accent-orange').trim(),
    accentRed: computedStyle.getPropertyValue('--accent-red').trim(),
    borderColor: computedStyle.getPropertyValue('--border-color').trim(),
    bgSidebar: computedStyle.getPropertyValue('--bg-sidebar').trim(),
    bgGlass: computedStyle.getPropertyValue('--bg-glass').trim()
  };
}

/**
 * Restore original theme CSS variables
 */
function restoreOriginalTheme() {
  if (!originalThemeState) return;
  
  const root = document.documentElement;
  root.style.setProperty('--bg-body', originalThemeState.bgBody);
  root.style.setProperty('--bg-card', originalThemeState.bgCard);
  root.style.setProperty('--bg-input', originalThemeState.bgInput);
  root.style.setProperty('--bg-hover', originalThemeState.bgHover);
  root.style.setProperty('--text-primary', originalThemeState.textPrimary);
  root.style.setProperty('--text-secondary', originalThemeState.textSecondary);
  root.style.setProperty('--text-tertiary', originalThemeState.textTertiary);
  root.style.setProperty('--accent-blue', originalThemeState.accentBlue);
  root.style.setProperty('--accent-blue-soft', originalThemeState.accentBlueSoft);
  root.style.setProperty('--accent-green', originalThemeState.accentGreen);
  root.style.setProperty('--accent-green-soft', originalThemeState.accentGreenSoft);
  root.style.setProperty('--accent-orange', originalThemeState.accentOrange);
  root.style.setProperty('--accent-red', originalThemeState.accentRed);
  root.style.setProperty('--border-color', originalThemeState.borderColor);
  root.style.setProperty('--bg-sidebar', originalThemeState.bgSidebar);
  root.style.setProperty('--bg-glass', originalThemeState.bgGlass);
  
  originalThemeState = null;
}

/**
 * Open custom theme modal
 * @param {string} themeName - Optional theme name to edit
 */
export function openCustomThemeModal(themeName = null) {
  // Store current theme state before any modifications
  storeOriginalTheme();
  
  if (themeName) {
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
    const theme = customThemes.find(t => t.name === themeName);
    if (theme) {
      getEl('customThemeName').value = theme.name;
      setColorPicker('customBgBody', theme.bgBody);
      setColorPicker('customBgCard', theme.bgCard);
      setColorPicker('customBgInput', theme.bgInput);
      setColorPicker('customTextPrimary', theme.textPrimary);
      setColorPicker('customTextSecondary', theme.textSecondary);
      setColorPicker('customAccentBlue', theme.accentBlue);
      setColorPicker('customAccentGreen', theme.accentGreen);
      setColorPicker('customAccentOrange', theme.accentOrange);
      setColorPicker('customAccentRed', theme.accentRed);
    }
  } else {
    getEl('customThemeName').value = '';
    setColorPicker('customBgBody', '#FAFAFA');
    setColorPicker('customBgCard', '#FFFFFF');
    setColorPicker('customBgInput', '#F5F5F5');
    setColorPicker('customTextPrimary', '#111111');
    setColorPicker('customTextSecondary', '#666666');
    setColorPicker('customAccentBlue', '#5B7C99');
    setColorPicker('customAccentGreen', '#7A9B7E');
    setColorPicker('customAccentOrange', '#B89968');
    setColorPicker('customAccentRed', '#B87E7E');
  }
  
  setupColorPickerListeners();
  getEl('customThemeModal').classList.add('active');
}

/**
 * Close custom theme modal
 */
export function closeCustomThemeModal() {
  getEl('customThemeModal').classList.remove('active');
  // Restore the original theme state instead of just reapplying from localStorage
  restoreOriginalTheme();
}
