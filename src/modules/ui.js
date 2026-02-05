/**
 * UI Module
 * Handles UI rendering and utility functions
 */

import { state, colors, setActiveColor } from './state.js';
import { getEl } from './dom.js';
import { getTodayCompletedCount } from './streak.js';
import { renderTasks, toggleTask, setFocus, pickRandomTask } from './tasks.js';
import { renderCourses } from './courses.js';
import { toggleTimer, resetTimer } from './timer.js';
import { saveData } from './storage.js';
import { openCustomThemeModal } from './themes.js';

/**
 * Show toast message
 * @param {string} msg - Message to display
 */
export function showToast(msg) {
  getEl('toastMsg').innerText = msg;
  getEl('toast').classList.add('active');
  setTimeout(hideToast, 4000);
}

/**
 * Hide toast message
 */
export function hideToast() {
  getEl('toast').classList.remove('active');
  setTimeout(() => {
    state.lastUndo = null;
  }, 600);
}

/**
 * Toggle sidebar visibility
 */
export function toggleSidebar() {
  if (window.innerWidth > 900) {
    getEl('appLayout').classList.toggle('collapsed');
    const btn = getEl('sidebarToggle');
    btn.style.transform = getEl('appLayout').classList.contains('collapsed') ? "rotate(90deg)" : "rotate(0deg)";
  } else {
    getEl('sidebar').classList.toggle('open');
    getEl('sidebarOverlay').classList.toggle('active');
  }
}

/**
 * Toggle completed tasks section
 */
export function toggleCompleted() {
  const list = getEl('completedList');
  const arrow = getEl('completedArrow');
  if (list.style.display === 'none') {
    list.style.display = 'block';
    arrow.innerText = '▲';
  } else {
    list.style.display = 'none';
    arrow.innerText = '▼';
  }
}

/**
 * Render all UI components
 */
export function renderAll() {
  renderTasks();
  renderFocus();
  renderCourses();
  renderStats();
  if (state.currentCourseId) window.openCourseModal(state.currentCourseId);
}

/**
 * Render focus section
 */
export function renderFocus() {
  const hero = getEl('focusHero');
  const task = state.todos.find(t => t.id === state.focusId && !t.completed);
  if (!task) {
    hero.innerHTML = `
      <div style="opacity:0.5;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      </div>
      <h2 class="text-h2" style="margin-top:16px;">No Active Focus</h2>
      <p class="text-body" style="margin-top:8px;">Select a task from the sidebar to begin.</p>
    `;
    return;
  }
  const color = colors[task.color] || colors.blue;
  const daysText = task.days ? ` • ${task.days} LEFT` : '';

  hero.innerHTML = `
    <div class="focus-progress-bar" style="background:${color}; width:100%;"></div>
    <div class="focus-label" style="color:${color};">CURRENT PRIORITY${daysText}</div>
    <h2 class="focus-title animate-in">${task.text}</h2>
    <div class="focus-subtitle">Stay strictly on this task until completion.</div>
    <button type="button" class="btn-primary" style="margin-top:32px; background:${color}; box-shadow:0 8px 20px -4px ${color}80;">
      Complete Task
    </button>
  `;
  hero.querySelector('button').onclick = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toggleTask(task.id);
  };
}

/**
 * Render stats section
 */
export function renderStats() {
  const todayCompleted = getTodayCompletedCount();
  const goal = state.dailyGoal || 5;
  const pct = Math.min(Math.round((todayCompleted / goal) * 100), 100);
  
  getEl('progressPercent').innerText = `${pct}%`;
  getEl('progressText').innerText = `${todayCompleted}/${goal}`;
  getEl('progressBar').style.width = `${pct}%`;
  getEl('streakCount').innerText = state.streak || 0;
  
  const quotes = [
    "Keep the momentum going! 💪",
    "One task at a time! ⭐",
    "You're making progress! 🎯",
    "Stay focused, stay strong! 🔥"
  ];
  
  if (pct >= 100) {
    getEl('progressQuote').innerText = "🎉 Daily goal achieved! Incredible work!";
  } else if (pct >= 75) {
    getEl('progressQuote').innerText = "Almost there! Keep pushing! 🚀";
  } else if (pct >= 50) {
    getEl('progressQuote').innerText = "You're halfway there! 💫";
  } else if (todayCompleted > 0) {
    getEl('progressQuote').innerText = "Great start! Keep going! ✨";
  } else {
    getEl('progressQuote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
  }
}

/**
 * Setup event listeners
 */
export function setupEventListeners() {
  getEl('sidebarToggle').onclick = toggleSidebar;
  getEl('sidebarClose').onclick = toggleSidebar;
  getEl('sidebarOverlay').onclick = toggleSidebar;

  // Theme selector dropdown
  const themeSelectorBtn = getEl('themeSelectorBtn');
  const themeDropdown = getEl('themeDropdown');
  
  themeSelectorBtn.onclick = (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('active');
  };
  
  document.addEventListener('click', (e) => {
    if (!themeSelectorBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
      themeDropdown.classList.remove('active');
    }
  });
  
  // Theme selection
  document.querySelectorAll('.theme-option[data-theme]').forEach(option => {
    option.onclick = () => {
      const themeName = option.dataset.theme;
      import('./themes.js').then(({ applyTheme }) => {
        applyTheme(themeName);
        themeDropdown.classList.remove('active');
      });
    };
  });
  
  // Custom theme button
  getEl('customThemeBtn').onclick = () => {
    themeDropdown.classList.remove('active');
    openCustomThemeModal();
  };

  getEl('addTaskForm').onsubmit = (e) => {
    e.preventDefault();
    const text = getEl('taskInput').value.trim();
    const days = getEl('taskDays').value;
    if (text) {
      // Import dynamically to avoid circular dependency
      import('./tasks.js').then(({ addTask }) => addTask(text, days));
    }
  };

  getEl('btnRandomTask').onclick = pickRandomTask;

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.onclick = () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      setActiveColor(dot.dataset.color);
    };
  });

  getEl('startTimerBtn').onclick = toggleTimer;
  getEl('resetTimerBtn').onclick = resetTimer;

  getEl('toastUndo').onclick = () => {
    if (state.lastUndo) {
      if (state.lastUndo.type === 'task') state.todos.push(state.lastUndo.data);
      saveData();
      renderTasks();
      hideToast();
    }
  };
}

/**
 * Toggle modal visibility
 * @param {string} id - Modal ID
 */
export function toggleModal(id) {
  getEl(id).classList.toggle('active');
}

/**
 * Clear completed task history
 */
export function clearCompletedHistory() {
  const completedTasks = state.todos.filter(t => t.completed);
  if (completedTasks.length === 0) {
    showToast("No completed tasks to clear");
    return;
  }
  if (confirm('Are you sure you want to delete all completed tasks? This cannot be undone.')) {
    state.todos = state.todos.filter(t => !t.completed);
    saveData();
    renderTasks();
    renderStats();
    showToast(`Cleared ${completedTasks.length} completed task(s)`);
  }
}

/**
 * Open daily goal modal
 */
export function openDailyGoalModal() {
  getEl('modalDailyGoalInput').value = state.dailyGoal;
  toggleModal('dailyGoalModal');
}

/**
 * Save daily goal
 */
export function saveDailyGoal() {
  const value = parseInt(getEl('modalDailyGoalInput').value);
  if (value > 0 && value <= 50) {
    state.dailyGoal = value;
    getEl('dailyGoalValue').innerText = value;
    saveData();
    renderStats();
    toggleModal('dailyGoalModal');
  } else {
    alert('Please enter a valid goal between 1 and 50');
  }
}

/**
 * Save timer settings
 */
export function saveTimerSettings() {
  const d = parseInt(getEl('customWorkDur').value);
  if (d > 0) {
    // Import dynamically to avoid circular dependency
    import('./timer.js').then(({ setTimer }) => {
      setTimer(d);
      toggleModal('timerModal');
    });
  }
}
