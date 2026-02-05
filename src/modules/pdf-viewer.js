/**
 * PDF Viewer Module
 * Handles PDF attachment, viewing, and manipulation
 */

import { state } from './state.js';
import { getEl } from './dom.js';
import { saveData } from './storage.js';
import { showToast } from './ui.js';

// PDF.js worker initialization
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const PDF_MIN_ZOOM = 0.25;
const PDF_MAX_ZOOM = 3.0;
const PDF_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export let pdfState = {
  doc: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  currentGoalRef: null,
  pdfData: null,
  fileName: ''
};

/**
 * Initialize PDF viewer controls and event listeners
 */
export function initPdfViewer() {
  const overlay = getEl('pdfViewerOverlay');
  const closeBtn = getEl('pdfCloseBtn');
  const prevBtn = getEl('pdfPrevPage');
  const nextBtn = getEl('pdfNextPage');
  const zoomInBtn = getEl('pdfZoomIn');
  const zoomOutBtn = getEl('pdfZoomOut');
  const fitWidthBtn = getEl('pdfFitWidth');
  const pageInput = getEl('pdfPageInput');
  const removeBtn = getEl('pdfRemoveAttachment');
  const fileInput = getEl('pdfFileInput');
  
  closeBtn.onclick = closePdfViewer;
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closePdfViewer();
    }
  };
  
  const container = document.querySelector('.pdf-viewer-container');
  if (container) {
    container.onclick = (e) => {
      e.stopPropagation();
    };
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closePdfViewer();
    }
  });
  
  prevBtn.onclick = () => goToPage(pdfState.currentPage - 1);
  nextBtn.onclick = () => goToPage(pdfState.currentPage + 1);
  
  pageInput.onchange = () => {
    const page = parseInt(pageInput.value);
    if (page >= 1 && page <= pdfState.totalPages) {
      goToPage(page);
    } else {
      pageInput.value = pdfState.currentPage;
    }
  };
  
  zoomInBtn.onclick = () => setZoom(pdfState.scale + 0.25);
  zoomOutBtn.onclick = () => setZoom(pdfState.scale - 0.25);
  fitWidthBtn.onclick = fitToWidth;
  removeBtn.onclick = removePdfFromGoal;
  fileInput.onchange = handlePdfFileSelect;
  
  const externalToolsToggle = getEl('externalToolsToggle');
  if (externalToolsToggle) {
    externalToolsToggle.onclick = () => {
      const panel = getEl('externalToolsPanel');
      panel.classList.toggle('open');
    };
  }
  
  setupTouchZoom();
}

/**
 * Setup touch zoom (pinch to zoom)
 */
function setupTouchZoom() {
  const body = getEl('pdfViewerBody');
  let initialDistance = 0;
  let initialScale = 1;
  
  body.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches[0], e.touches[1]);
      initialScale = pdfState.scale;
    }
  }, { passive: true });
  
  body.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = currentDistance / initialDistance;
      const newScale = Math.min(Math.max(initialScale * scaleFactor, PDF_MIN_ZOOM), PDF_MAX_ZOOM);
      setZoom(newScale, false);
    }
  }, { passive: true });
  
  body.addEventListener('touchend', () => {
    initialDistance = 0;
  }, { passive: true });
}

/**
 * Get distance between two touch points
 * @param {Touch} touch1 - First touch
 * @param {Touch} touch2 - Second touch
 * @returns {number} Distance
 */
function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Open PDF viewer with a file
 * @param {string} pdfData - PDF data (base64)
 * @param {string} fileName - File name
 * @param {Object} goalRef - Goal reference {courseId, categoryId, goalId}
 */
export function openPdfViewer(pdfData, fileName, goalRef) {
  pdfState.currentGoalRef = goalRef;
  pdfState.pdfData = pdfData;
  pdfState.fileName = fileName;
  
  getEl('pdfViewerTitle').textContent = fileName;
  getEl('pdfViewerOverlay').classList.add('active');
  getEl('pdfLoading').style.display = 'flex';
  getEl('pdfError').style.display = 'none';
  getEl('pdfCanvasWrapper').innerHTML = '';
  
  loadPdf(pdfData);
}

/**
 * Close PDF viewer
 */
export function closePdfViewer() {
  getEl('pdfViewerOverlay').classList.remove('active');
  const toolsPanel = getEl('externalToolsPanel');
  if (toolsPanel) toolsPanel.classList.remove('open');
  pdfState.doc = null;
  pdfState.currentGoalRef = null;
  setTimeout(() => {
    getEl('pdfCanvasWrapper').innerHTML = '';
  }, 300);
}

/**
 * Load PDF from base64 data
 * @param {string} pdfData - PDF data
 */
async function loadPdf(pdfData) {
  try {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js library not loaded');
    }
    
    let base64Content;
    if (pdfData.startsWith('data:')) {
      const parts = pdfData.split(',');
      if (parts.length < 2) {
        throw new Error('Invalid PDF data format');
      }
      base64Content = parts[1];
    } else {
      base64Content = pdfData;
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: atob(base64Content) });
    pdfState.doc = await loadingTask.promise;
    pdfState.totalPages = pdfState.doc.numPages;
    pdfState.currentPage = 1;
    
    getEl('pdfTotalPages').textContent = pdfState.totalPages;
    getEl('pdfPageInput').max = pdfState.totalPages;
    getEl('pdfLoading').style.display = 'none';
    
    await fitToWidth();
    
  } catch (error) {
    console.error('Error loading PDF:', error);
    getEl('pdfLoading').style.display = 'none';
    getEl('pdfError').style.display = 'flex';
    getEl('pdfErrorMsg').textContent = 'Failed to load PDF: ' + error.message;
  }
}

/**
 * Render all pages of the PDF
 */
export async function renderAllPages() {
  if (!pdfState.doc) return;
  
  const wrapper = getEl('pdfCanvasWrapper');
  wrapper.innerHTML = '';
  
  for (let i = 1; i <= pdfState.totalPages; i++) {
    const page = await pdfState.doc.getPage(i);
    const viewport = page.getViewport({ scale: pdfState.scale });
    
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    canvas.id = `pdf-page-${i}`;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    wrapper.appendChild(canvas);
  }
}

/**
 * Go to a specific page
 * @param {number} pageNum - Page number
 */
function goToPage(pageNum) {
  if (pageNum < 1 || pageNum > pdfState.totalPages) return;
  
  pdfState.currentPage = pageNum;
  getEl('pdfPageInput').value = pageNum;
  
  const pageCanvas = document.getElementById(`pdf-page-${pageNum}`);
  if (pageCanvas) {
    pageCanvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Set zoom level
 * @param {number} scale - Zoom scale
 * @param {boolean} rerender - Whether to re-render
 */
async function setZoom(scale, rerender = true) {
  pdfState.scale = Math.min(Math.max(scale, PDF_MIN_ZOOM), PDF_MAX_ZOOM);
  getEl('pdfZoomLevel').textContent = Math.round(pdfState.scale * 100) + '%';
  
  if (rerender) {
    await renderAllPages();
  }
}

/**
 * Fit PDF to viewer width
 */
async function fitToWidth() {
  if (!pdfState.doc) return;
  
  const page = await pdfState.doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const containerWidth = getEl('pdfViewerBody').clientWidth - 40;
  const newScale = containerWidth / viewport.width;
  
  await setZoom(newScale);
}

/**
 * Handle PDF file selection
 * @param {Event} event - File input change event
 */
function handlePdfFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.type !== 'application/pdf') {
    showToast('Please select a PDF file');
    return;
  }
  
  if (file.size > PDF_MAX_FILE_SIZE) {
    showToast('PDF file is too large (max 10MB)');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result;
    const goalRef = pdfState.currentGoalRef;
    
    if (goalRef) {
      attachPdfToGoal(goalRef.courseId, goalRef.categoryId, goalRef.goalId, base64Data, file.name);
      showToast('📎 PDF attached to goal');
      openPdfViewer(base64Data, file.name, goalRef);
    }
  };
  reader.readAsDataURL(file);
  
  event.target.value = '';
}

/**
 * Attach PDF to a goal
 * @param {string} courseId - Course ID
 * @param {string} categoryId - Category ID
 * @param {string} goalId - Goal ID
 * @param {string} pdfData - PDF data (base64)
 * @param {string} fileName - File name
 */
export function attachPdfToGoal(courseId, categoryId, goalId, pdfData, fileName) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;
  
  const category = course.categories.find(cat => cat.id === categoryId);
  if (!category) return;
  
  const goal = category.goals.find(g => g.id === goalId);
  if (!goal) return;
  
  goal.pdfAttachment = {
    data: pdfData,
    fileName: fileName,
    attachedAt: new Date().toISOString()
  };
  
  saveData();
}

/**
 * Remove PDF from goal
 */
export function removePdfFromGoal() {
  const goalRef = pdfState.currentGoalRef;
  if (!goalRef) return;
  
  if (!confirm('Remove PDF attachment from this goal?')) return;
  
  const course = state.courses.find(c => c.id === goalRef.courseId);
  if (!course) return;
  
  const category = course.categories.find(cat => cat.id === goalRef.categoryId);
  if (!category) return;
  
  const goal = category.goals.find(g => g.id === goalRef.goalId);
  if (!goal) return;
  
  delete goal.pdfAttachment;
  saveData();
  closePdfViewer();
  showToast('📎 PDF removed from goal');
  
  if (state.currentCourseId) {
    window.openCourseModal(state.currentCourseId);
  }
}

/**
 * Setup global PDF functions for window
 */
export function setupPdfGlobalFunctions() {
  window.triggerPdfUpload = (courseId, categoryId, goalId) => {
    pdfState.currentGoalRef = { courseId, categoryId, goalId };
    getEl('pdfFileInput').click();
  };
  
  window.openGoalPdf = (courseId, categoryId, goalId) => {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const category = course.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const goal = category.goals.find(g => g.id === goalId);
    if (!goal || !goal.pdfAttachment) return;
    
    openPdfViewer(
      goal.pdfAttachment.data,
      goal.pdfAttachment.fileName,
      { courseId, categoryId, goalId }
    );
  };
}
