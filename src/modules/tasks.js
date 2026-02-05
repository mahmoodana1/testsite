/**
 * Task Management Module
 * Handles all task-related operations
 */

import { state, colors, activeColor } from './state.js';
import { getEl, generateId } from './dom.js';
import { saveData } from './storage.js';
import { showToast, hideToast } from './ui.js';
import { checkAndResetDailyCounter, updateStreak } from './streak.js';

/**
 * Add a new task
 * @param {string} text - Task text
 * @param {number} days - Days left
 */
export function addTask(text, days) {
  state.todos.push({
    id: generateId(),
    text,
    days,
    color: activeColor,
    completed: false,
    createdAt: new Date().toISOString()
  });
  getEl('taskInput').value = '';
  getEl('taskDays').value = '';
  if (!state.focusId) state.focusId = state.todos[state.todos.length - 1].id;
  saveData();
}

/**
 * Toggle task completion status
 * @param {string} id - Task ID
 */
export function toggleTask(id) {
  const t = state.todos.find(x => x.id === id);
  if (t) {
    t.completed = !t.completed;
    if (t.completed) {
      t.completedAt = new Date().toISOString();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      if (state.focusId === id) state.focusId = null;
      
      // Increment daily counter
      checkAndResetDailyCounter();
      state.todayCompletedCount++;
      
      // Update streak
      updateStreak();
    } else {
      t.completedAt = null;
    }
    
    // If this task is linked to a course goal, toggle that too
    if (t.linkedGoalId && t.linkedCourseId && t.linkedCategoryId) {
      const c = state.courses.find(x => x.id === t.linkedCourseId);
      if (c) {
        const cat = c.categories.find(x => x.id === t.linkedCategoryId);
        if (cat) {
          const g = cat.goals.find(x => x.id === t.linkedGoalId);
          if (g) {
            g.completed = t.completed;
          }
        }
      }
    }
    
    saveData();
  }
}

/**
 * Delete a task
 * @param {string} id - Task ID
 */
export function deleteTask(id) {
  const idx = state.todos.findIndex(x => x.id === id);
  if (idx > -1) {
    state.lastUndo = { type: 'task', data: state.todos[idx] };
    state.todos.splice(idx, 1);
    if (state.focusId === id) state.focusId = null;
    showToast("Task deleted");
    saveData();
  }
}

/**
 * Restore a completed task to active
 * @param {string} id - Task ID
 */
export function restoreTask(id) {
  const task = state.todos.find(t => t.id === id);
  if (task && task.completed) {
    task.completed = false;
    task.completedAt = null;
    showToast("Task restored");
    saveData();
  }
}

/**
 * Permanently remove a completed task with animation
 * @param {string} id - Task ID
 * @param {HTMLElement} element - Task element
 */
export function removeCompletedTask(id, element) {
  if (element) {
    element.classList.add('removing');
    setTimeout(() => {
      const idx = state.todos.findIndex(x => x.id === id);
      if (idx > -1) {
        state.lastUndo = { type: 'task', data: state.todos[idx] };
        state.todos.splice(idx, 1);
        showToast("Task removed");
        saveData();
      }
    }, 300);
  } else {
    const idx = state.todos.findIndex(x => x.id === id);
    if (idx > -1) {
      state.lastUndo = { type: 'task', data: state.todos[idx] };
      state.todos.splice(idx, 1);
      showToast("Task removed");
      saveData();
    }
  }
}

/**
 * Render all tasks
 */
export function renderTasks() {
  const list = getEl('taskList');
  list.innerHTML = '';
  const active = state.todos.filter(t => !t.completed);
  if (active.length === 0) getEl('emptyState').classList.remove('hidden');
  else getEl('emptyState').classList.add('hidden');

  active.forEach(t => {
    const el = document.createElement('div');
    el.className = 'task-item animate-in';
    el.style.setProperty('--task-color', colors[t.color] || colors.blue);
    const daysLeft = t.days ? `<span style="background:var(--bg-input); padding:2px 6px; border-radius:4px;">${t.days}d left</span>` : '';

    el.innerHTML = `
      <div class="checkbox"></div>
      <div class="task-content">
        <div class="task-text">${t.text}</div>
        <div class="task-meta">${daysLeft}</div>
      </div>
      <button type="button" class="btn-delete-task">✕</button>
    `;
    el.onclick = (e) => { if (!e.target.closest('.checkbox') && !e.target.closest('button')) setFocus(t.id); };
    el.querySelector('.checkbox').onclick = (e) => { e.stopPropagation(); toggleTask(t.id); };
    el.querySelector('button').onclick = (e) => { e.stopPropagation(); deleteTask(t.id); };
    list.appendChild(el);
  });

  const compList = getEl('completedList');
  compList.innerHTML = '';
  const completedTasks = state.todos.filter(t => t.completed);
  
  if (completedTasks.length === 0) {
    compList.innerHTML = '<div style="text-align:center; color:var(--text-tertiary); padding:12px; font-size:0.85rem;">No completed tasks yet</div>';
  } else {
    completedTasks.forEach((t, idx) => {
      const div = document.createElement('div');
      div.className = 'completed-item';
      if (idx < 10) div.style.animationDelay = `${idx * 0.05}s`;
      div.innerHTML = `
        <div class="checkbox checked" style="width:18px;height:18px;font-size:10px;flex-shrink:0;">✓</div>
        <div class="completed-text">${t.text}</div>
        <div class="completed-item-actions">
          <button type="button" class="btn-restore-task" title="Restore Task" aria-label="Restore task to active list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button type="button" class="btn-remove-task" title="Delete Permanently" aria-label="Delete task permanently">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
      div.querySelector('.checkbox').onclick = () => toggleTask(t.id);
      div.querySelector('.btn-restore-task').onclick = (e) => { e.stopPropagation(); restoreTask(t.id); };
      div.querySelector('.btn-remove-task').onclick = (e) => { e.stopPropagation(); removeCompletedTask(t.id, div); };
      compList.appendChild(div);
    });
  }
}

/**
 * Reorder tasks after drag and drop
 * @param {number} oldIdx - Old index
 * @param {number} newIdx - New index
 */
export function reorderTasks(oldIdx, newIdx) {
  const active = state.todos.filter(t => !t.completed);
  const item = active.splice(oldIdx, 1)[0];
  active.splice(newIdx, 0, item);
  state.todos = [...active, ...state.todos.filter(t => t.completed)];
  saveData();
}

/**
 * Pick a random task and set it as focus
 */
export function pickRandomTask() {
  const active = state.todos.filter(t => !t.completed);
  if (active.length === 0) {
    showToast("No tasks!");
    return;
  }
  const randomTask = active[Math.floor(Math.random() * active.length)];
  setFocus(randomTask.id);
  setTimeout(() => {
    const items = document.querySelectorAll('.task-item');
    items.forEach(item => {
      if (item.innerHTML.includes(randomTask.text)) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.classList.add('highlight-task');
        setTimeout(() => item.classList.remove('highlight-task'), 1000);
      }
    });
  }, 100);
  showToast("Random task picked!");
}

/**
 * Set a task as the current focus
 * @param {string} id - Task ID
 */
export function setFocus(id) {
  state.focusId = id;
  saveData();
  if (window.innerWidth < 900) {
    getEl('sidebar').classList.remove('open');
    getEl('sidebarOverlay').classList.remove('active');
  }
}
