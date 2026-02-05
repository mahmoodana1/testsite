/**
 * Data Persistence Module
 * Handles Firebase sync and local data management
 */

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { state } from './state.js';
import { db } from './firebase-config.js';

/**
 * Save data to Firebase
 * @param {boolean} shouldRender - Whether to render after saving
 */
export function saveData(shouldRender = true) {
  if (shouldRender) {
    // Import dynamically to avoid circular dependency
    import('./ui.js').then(({ renderAll }) => renderAll());
  }
  
  if (state.user) {
    state.isLocalUpdate = true;
    setDoc(doc(db, 'users', state.user.uid), {
      todos: state.todos,
      courses: state.courses,
      focusId: state.focusId,
      dailyGoal: state.dailyGoal,
      streak: state.streak,
      lastCompletionDate: state.lastCompletionDate,
      todayCompletedCount: state.todayCompletedCount,
      lastResetDate: state.lastResetDate,
      lastUpdated: new Date().toISOString()
    }, { merge: true }).catch(error => console.error("Cloud save failed:", error));
  }
}
