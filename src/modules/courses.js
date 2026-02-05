/**
 * Course Management Module
 * Handles all course, category, and goal operations
 */

import { state, colors, focusTarget, setFocusTarget } from './state.js';
import { getEl, generateId } from './dom.js';
import { saveData } from './storage.js';
import { showToast } from './ui.js';

/**
 * Add a new course
 */
export function addCourse() {
  const id = generateId();
  state.courses.push({
    id,
    name: 'New Course',
    color: 'blue',
    categories: [
      { id: generateId(), name: 'Lectures', goals: [] },
      { id: generateId(), name: 'Assignments', goals: [] }
    ]
  });
  saveData();
  setTimeout(() => openCourseModal(id), 100);
}

/**
 * Update course properties
 * @param {string} id - Course ID
 * @param {Object} updates - Updates to apply
 * @param {boolean} shouldRender - Whether to render after update
 */
export function updateCourse(id, updates, shouldRender = true) {
  const c = state.courses.find(x => x.id === id);
  if (c) {
    Object.assign(c, updates);
    saveData(shouldRender);
  }
}

/**
 * Set course color
 * @param {string} id - Course ID
 * @param {string} color - Color name
 */
export function setCourseColor(id, color) {
  updateCourse(id, { color });
}

/**
 * Delete a course
 * @param {string} id - Course ID
 */
export function delCourse(id) {
  state.courses = state.courses.filter(x => x.id !== id);
  saveData();
}

/**
 * Add a category to a course
 * @param {string} cid - Course ID
 * @param {string} name - Category name
 */
export function addCategory(cid, name) {
  const c = state.courses.find(x => x.id === cid);
  c.categories.push({ id: generateId(), name, goals: [] });
  saveData();
}

/**
 * Delete a category from a course
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 */
export function deleteCategory(cid, catId) {
  const c = state.courses.find(x => x.id === cid);
  c.categories = c.categories.filter(x => x.id !== catId);
  saveData();
}

/**
 * Add a goal to a category
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 */
export function addGoal(cid, catId) {
  const c = state.courses.find(x => x.id === cid);
  const cat = c.categories.find(x => x.id === catId);
  const newId = generateId();
  cat.goals.push({ id: newId, title: '', completed: false });
  setFocusTarget({ id: newId });
  saveData();
}

/**
 * Update goal properties
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 * @param {string} gid - Goal ID
 * @param {Object} updates - Updates to apply
 * @param {boolean} shouldRender - Whether to render after update
 */
export function updateGoal(cid, catId, gid, updates, shouldRender = true) {
  const c = state.courses.find(x => x.id === cid);
  const cat = c.categories.find(x => x.id === catId);
  const g = cat.goals.find(x => x.id === gid);
  if (g) {
    Object.assign(g, updates);
    saveData(shouldRender);
  }
}

/**
 * Toggle goal completion status
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 * @param {string} gid - Goal ID
 */
export function toggleGoal(cid, catId, gid) {
  const c = state.courses.find(x => x.id === cid);
  const cat = c.categories.find(x => x.id === catId);
  const g = cat.goals.find(x => x.id === gid);
  if (g) {
    g.completed = !g.completed;
    if (g.completed) confetti({ particleCount: 30, spread: 40, origin: { x: 0.5, y: 0.5 } });
    
    // If this goal is linked to a task, toggle that too
    if (g.linkedTaskId) {
      const t = state.todos.find(x => x.id === g.linkedTaskId);
      if (t) {
        t.completed = g.completed;
        if (t.completed && state.focusId === t.id) state.focusId = null;
      }
    }
    
    saveData();
  }
}

/**
 * Delete a goal
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 * @param {string} gid - Goal ID
 */
export function deleteGoal(cid, catId, gid) {
  const c = state.courses.find(x => x.id === cid);
  const cat = c.categories.find(x => x.id === catId);
  cat.goals = cat.goals.filter(x => x.id !== gid);
  saveData();
}

/**
 * Convert a goal to a task
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 * @param {string} gid - Goal ID
 */
export function convertGoal(cid, catId, gid) {
  const c = state.courses.find(x => x.id === cid);
  const cat = c.categories.find(x => x.id === catId);
  const g = cat.goals.find(x => x.id === gid);
  const taskId = generateId();
  
  state.todos.push({
    id: taskId,
    text: `[${c.name} - ${cat.name}] ${g.title}`,
    days: 0,
    color: c.color,
    completed: g.completed,
    createdAt: new Date().toISOString(),
    linkedGoalId: gid,
    linkedCourseId: cid,
    linkedCategoryId: catId
  });
  
  g.linkedTaskId = taskId;
  showToast("Converted to Task");
  saveData();
}

/**
 * Reorder goals within a category
 * @param {string} cid - Course ID
 * @param {string} catId - Category ID
 * @param {number} oldIdx - Old index
 * @param {number} newIdx - New index
 */
export function reorderGoals(cid, catId, oldIdx, newIdx) {
  if (oldIdx === newIdx) return;
  const c = state.courses.find(x => x.id === cid);
  const cat = c.categories.find(x => x.id === catId);
  const item = cat.goals.splice(oldIdx, 1)[0];
  cat.goals.splice(newIdx, 0, item);
  saveData(false);
}

/**
 * Render all courses
 */
export function renderCourses() {
  const container = getEl('coursesContainer');
  container.innerHTML = '';
  if (state.courses.length === 0) getEl('emptyCourses').classList.remove('hidden');
  else getEl('emptyCourses').classList.add('hidden');

  state.courses.forEach(course => {
    const totalG = course.categories.reduce((acc, c) => acc + c.goals.length, 0);
    const doneG = course.categories.reduce((acc, c) => acc + c.goals.filter(g => g.completed).length, 0);
    const progress = totalG === 0 ? 0 : (doneG / totalG) * 100;
    const cColor = colors[course.color] || colors.blue;
    const card = document.createElement('div');
    card.className = 'course-card-compact';
    card.style.setProperty('--course-color', cColor);
    card.innerHTML = `
      <div class="course-card-title">${course.name}</div>
      <div class="course-card-stats"><span>${doneG}/${totalG} Goals</span><span>${Math.round(progress)}% Done</span></div>
      <div class="course-card-progress"><div class="course-card-progress-fill" style="width:${progress}%; background:${cColor};"></div></div>
    `;
    card.onclick = () => openCourseModal(course.id);
    container.appendChild(card);
  });
}

/**
 * Open course modal for editing
 * @param {string} courseId - Course ID
 */
export function openCourseModal(courseId) {
  state.currentCourseId = courseId;
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  const modal = getEl('courseModal');
  const titleInput = getEl('modalCourseTitle');
  const body = getEl('courseModalBody');
  const colorsDiv = getEl('modalCourseColors');

  titleInput.value = course.name;
  titleInput.onblur = () => updateCourse(courseId, { name: titleInput.value }, false);

  body.innerHTML = '';
  course.categories.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.style.setProperty('--course-color', colors[course.color]);

    section.innerHTML = `
      <div class="category-header">
        <div class="category-title">${cat.name}</div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn-add-goal" data-action="add-goal">+ Goal</button>
          <button type="button" class="btn-delete-task" style="width:24px; height:24px;" data-action="delete-cat">✕</button>
        </div>
      </div>
      <div class="goals-container"></div>
    `;
    section.querySelector('[data-action="add-goal"]').onclick = () => addGoal(courseId, cat.id);
    section.querySelector('[data-action="delete-cat"]').onclick = () => {
      if (confirm("Are you sure you want to delete this category?")) deleteCategory(courseId, cat.id);
    };

    const goalsCont = section.querySelector('.goals-container');
    cat.goals.forEach(goal => {
      const gItem = document.createElement('div');
      gItem.className = 'goal-item';
      gItem.dataset.goalId = goal.id;
      
      const hasPdf = goal.pdfAttachment && goal.pdfAttachment.data;
      const pdfIndicator = hasPdf ? 
        `<span class="pdf-indicator" onclick="event.stopPropagation(); openGoalPdf('${courseId}', '${cat.id}', '${goal.id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          PDF
        </span>` : '';
      
      gItem.innerHTML = `
        <div class="checkbox ${goal.completed ? 'checked' : ''}" style="margin-top:4px;">${goal.completed ? '✓' : ''}</div>
        <div class="goal-inputs">
          <div style="display:flex; align-items:center;">
            <input class="goal-main-input" value="${goal.title}" placeholder="New Goal..." style="flex:1;">
            ${pdfIndicator}
          </div>
          <input class="goal-sub-input" value="${goal.subtitle || ''}" placeholder="Add details...">
        </div>
        <div class="goal-actions">
          <button type="button" class="btn-attach-pdf ${hasPdf ? 'has-pdf' : ''}" title="${hasPdf ? 'View PDF' : 'Attach PDF'}" data-action="pdf">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>
          <button type="button" class="btn-delete-task" title="Convert">➔</button>
          <button type="button" class="btn-delete-task" style="color:var(--accent-red);" title="Delete">✕</button>
        </div>
      `;
      gItem.querySelector('.checkbox').onclick = () => toggleGoal(courseId, cat.id, goal.id);

      const mainIn = gItem.querySelector('.goal-main-input');
      mainIn.onblur = () => updateGoal(courseId, cat.id, goal.id, { title: mainIn.value }, false);
      mainIn.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.target.blur();
          addGoal(courseId, cat.id);
        }
      };

      const subIn = gItem.querySelector('.goal-sub-input');
      subIn.onblur = () => updateGoal(courseId, cat.id, goal.id, { subtitle: subIn.value }, false);

      gItem.querySelector('[data-action="pdf"]').onclick = () => {
        if (hasPdf) {
          window.openGoalPdf(courseId, cat.id, goal.id);
        } else {
          window.triggerPdfUpload(courseId, cat.id, goal.id);
        }
      };

      gItem.querySelector('[title="Convert"]').onclick = () => convertGoal(courseId, cat.id, goal.id);
      gItem.querySelector('[title="Delete"]').onclick = () => deleteGoal(courseId, cat.id, goal.id);
      goalsCont.appendChild(gItem);

      if (focusTarget && goal.id === focusTarget.id) {
        // Use requestAnimationFrame for more reliable focus timing after DOM update
        requestAnimationFrame(() => {
          mainIn.focus();
          mainIn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        setFocusTarget(null);
      }
    });
    
    new Sortable(goalsCont, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      delay: 100,
      delayOnTouchOnly: true,
      onEnd: (evt) => reorderGoals(courseId, cat.id, evt.oldIndex, evt.newIndex)
    });
    
    body.appendChild(section);
  });

  const addCatDiv = document.createElement('div');
  addCatDiv.style.textAlign = "center";
  addCatDiv.innerHTML = `<button type="button" class="btn-ghost" style="width:100%; border:1px dashed var(--border-color);">+ Add Category</button>`;
  addCatDiv.onclick = () => {
    const name = prompt("Category Name:");
    if (name) addCategory(courseId, name);
  };
  body.appendChild(addCatDiv);

  colorsDiv.innerHTML = '';
  Object.keys(colors).forEach(k => {
    const dot = document.createElement('div');
    dot.className = `cc-dot ${course.color === k ? 'active' : ''}`;
    dot.style.background = colors[k];
    dot.onclick = () => setCourseColor(courseId, k);
    colorsDiv.appendChild(dot);
  });
  
  getEl('modalDeleteBtn').onclick = () => {
    if (confirm("Delete this course?")) {
      delCourse(courseId);
      closeCourseModal();
    }
  };
  
  modal.classList.add('active');
}

/**
 * Close course modal
 */
export function closeCourseModal() {
  getEl('courseModal').classList.remove('active');
  state.currentCourseId = null;
}
