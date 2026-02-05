/**
 * Main Application Entry Point
 * Initializes the app and sets up authentication
 */

import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { auth, db, provider } from './modules/firebase-config.js';
import { state } from './modules/state.js';
import { getEl } from './modules/dom.js';
import { checkStreakExpiration } from './modules/streak.js';
import { setupEventListeners, renderAll } from './modules/ui.js';
import { reorderTasks } from './modules/tasks.js';
import { renderCustomThemesList, applyTheme } from './modules/themes.js';
import { initPdfViewer, setupPdfGlobalFunctions } from './modules/pdf-viewer.js';
import { addCourse, openCourseModal, closeCourseModal, setCourseColor } from './modules/courses.js';

/**
 * Initialize application
 */
function init() {
  setTimeout(() => getEl('loader').style.display = 'none', 800);
  
  const updateTime = () => {
    const now = new Date();
    getEl('currentDate').innerText = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
    const hr = now.getHours();
    getEl('greeting').innerText = hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening';
  };
  updateTime();
  setInterval(updateTime, 60000);
  
  checkStreakExpiration();
  setupEventListeners();
  
  new Sortable(getEl('taskList'), {
    animation: 150,
    ghostClass: 'sortable-ghost',
    delay: 100,
    onEnd: (evt) => reorderTasks(evt.oldIndex, evt.newIndex)
  });
  
  renderCustomThemesList();
  
  if (localStorage.getItem('theme')) {
    applyTheme(localStorage.getItem('theme'));
  } else {
    applyTheme('cappuccino');
  }
  
  setupPdfGlobalFunctions();
  
  // Setup global window functions
  window.openCourseModal = openCourseModal;
  window.closeCourseModal = closeCourseModal;
  window.addCourse = addCourse;
  window.setCourseColor = setCourseColor;
  
  // Import and setup UI utility functions on window
  import('./modules/ui.js').then(({ toggleModal, clearCompletedHistory, openDailyGoalModal, saveDailyGoal, saveTimerSettings }) => {
    window.toggleModal = toggleModal;
    window.clearCompletedHistory = clearCompletedHistory;
    window.openDailyGoalModal = openDailyGoalModal;
    window.saveDailyGoal = saveDailyGoal;
    window.saveTimerSettings = saveTimerSettings;
  });
  
  import('./modules/themes.js').then(({ openCustomThemeModal, closeCustomThemeModal, setColorPicker }) => {
    window.openCustomThemeModal = openCustomThemeModal;
    window.closeCustomThemeModal = closeCustomThemeModal;
  });
  
  import('./modules/timer.js').then(({ setTimer }) => {
    window.setTimer = setTimer;
  });
  
  import('./modules/tasks.js').then(({ toggleCompleted, setFocus }) => {
    window.toggleCompleted = () => {
      import('./modules/ui.js').then(({ toggleCompleted }) => toggleCompleted());
    };
    window.setFocus = setFocus;
  });
}

/**
 * Setup Firebase authentication
 */
onAuthStateChanged(auth, (user) => {
  state.user = user;
  if (user) {
    getEl('loginBtn').innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
    getEl('loginBtn').title = "Sign Out";
    getEl('loginBtn').onclick = () => signOut(auth);

    onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        if (state.isLocalUpdate) {
          state.isLocalUpdate = false;
          return;
        }
        const d = docSnap.data();
        state.todos = d.todos || [];
        state.courses = d.courses || [];
        state.focusId = d.focusId || null;
        state.dailyGoal = d.dailyGoal || 5;
        state.streak = d.streak || 0;
        state.lastCompletionDate = d.lastCompletionDate || null;
        state.todayCompletedCount = d.todayCompletedCount || 0;
        state.lastResetDate = d.lastResetDate || null;
        getEl('dailyGoalValue').innerText = state.dailyGoal;
        checkStreakExpiration();
        renderAll();
      } else {
        state.todos = [];
        state.courses = [];
        state.focusId = null;
        state.dailyGoal = 5;
        state.streak = 0;
        state.lastCompletionDate = null;
        state.todayCompletedCount = 0;
        state.lastResetDate = null;
        getEl('dailyGoalValue').innerText = state.dailyGoal;
        renderAll();
      }
    });
  } else {
    getEl('loginBtn').innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In`;
    getEl('loginBtn').onclick = () => signInWithPopup(auth, provider);
    renderAll();
  }
});

// Initialize PDF viewer after DOM is ready
setTimeout(initPdfViewer, 100);

// Start the app
init();
