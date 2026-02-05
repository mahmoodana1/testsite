# JavaScript Modularization Documentation

## Overview
The JavaScript codebase has been successfully extracted from `index.html` (lines 2908-4447) and refactored into a modular ES6 structure. This improves maintainability, testability, and code organization.

## Module Structure

### Core Modules (`src/modules/`)

#### 1. **state.js**
- **Purpose**: Centralized application state management
- **Exports**:
  - `state`: Main application state object
  - `colors`: Color palette constants
  - `activeColor`: Currently selected color
  - `focusTarget`: Target for auto-focus
  - `MAX_DAILY_GOAL`: Maximum daily goal constant
  - `setActiveColor(color)`: Update active color
  - `setFocusTarget(target)`: Update focus target

#### 2. **firebase-config.js**
- **Purpose**: Firebase initialization and configuration
- **Exports**:
  - `auth`: Firebase authentication instance
  - `db`: Firestore database instance
  - `provider`: Google authentication provider

#### 3. **dates.js**
- **Purpose**: Date utility functions
- **Exports**:
  - `getTodayString()`: Get today's date as string
  - `getYesterdayString()`: Get yesterday's date as string
  - `formatTime(seconds)`: Format seconds to MM:SS

#### 4. **dom.js**
- **Purpose**: DOM utility functions
- **Exports**:
  - `getEl(id)`: Get element by ID
  - `generateId()`: Generate unique ID

#### 5. **streak.js**
- **Purpose**: Streak tracking and daily goal management
- **Exports**:
  - `checkAndResetDailyCounter()`: Reset daily counter if needed
  - `getTodayCompletedCount()`: Get today's completed task count
  - `updateStreak()`: Update streak based on completion
  - `checkStreakExpiration()`: Check if streak has expired
- **Dependencies**: state.js, dates.js, storage.js, ui.js

#### 6. **storage.js**
- **Purpose**: Data persistence and Firebase synchronization
- **Exports**:
  - `saveData(shouldRender)`: Save data to Firebase
- **Dependencies**: state.js, firebase-config.js, ui.js (dynamic)
- **Note**: Uses dynamic import for ui.js to avoid circular dependency

#### 7. **tasks.js**
- **Purpose**: Task management operations
- **Exports**:
  - `addTask(text, days)`: Add new task
  - `toggleTask(id)`: Toggle task completion
  - `deleteTask(id)`: Delete task
  - `restoreTask(id)`: Restore completed task
  - `removeCompletedTask(id, element)`: Permanently remove task
  - `renderTasks()`: Render task list
  - `reorderTasks(oldIdx, newIdx)`: Reorder tasks after drag
  - `pickRandomTask()`: Pick random task as focus
  - `setFocus(id)`: Set task as focus
- **Dependencies**: state.js, dom.js, storage.js, ui.js, streak.js

#### 8. **courses.js**
- **Purpose**: Course, category, and goal management
- **Exports**:
  - `addCourse()`: Add new course
  - `updateCourse(id, updates, shouldRender)`: Update course
  - `setCourseColor(id, color)`: Set course color
  - `delCourse(id)`: Delete course
  - `addCategory(cid, name)`: Add category to course
  - `deleteCategory(cid, catId)`: Delete category
  - `addGoal(cid, catId)`: Add goal to category
  - `updateGoal(cid, catId, gid, updates, shouldRender)`: Update goal
  - `toggleGoal(cid, catId, gid)`: Toggle goal completion
  - `deleteGoal(cid, catId, gid)`: Delete goal
  - `convertGoal(cid, catId, gid)`: Convert goal to task
  - `reorderGoals(cid, catId, oldIdx, newIdx)`: Reorder goals
  - `renderCourses()`: Render courses list
  - `openCourseModal(courseId)`: Open course editing modal
  - `closeCourseModal()`: Close course modal
- **Dependencies**: state.js, dom.js, storage.js, ui.js

#### 9. **timer.js**
- **Purpose**: Focus timer functionality
- **Exports**:
  - `toggleTimer()`: Toggle timer start/pause
  - `resetTimer()`: Reset timer to initial duration
  - `setTimer(min)`: Set timer duration
- **Dependencies**: state.js, dom.js, dates.js

#### 10. **themes.js**
- **Purpose**: Theme management and customization
- **Exports**:
  - `themes`: Built-in theme definitions
  - `applyTheme(themeName)`: Apply theme
  - `applyCustomTheme()`: Apply custom theme from localStorage
  - `hexToRgba(hex, alpha)`: Convert hex to rgba
  - `adjustColorBrightness(hex, percent)`: Adjust color brightness
  - `setColorPicker(id, color)`: Set color picker value
  - `setupColorPickerListeners()`: Setup color picker listeners
  - `previewCustomTheme()`: Preview custom theme
  - `getCustomThemeKey(themeName)`: Get storage key for custom theme
  - `saveCustomTheme()`: Save custom theme
  - `applyNamedCustomTheme(themeName)`: Apply named custom theme
  - `renderCustomThemesList()`: Render custom themes list
  - `deleteCustomTheme(themeName)`: Delete custom theme
  - `openCustomThemeModal(themeName)`: Open theme editor
  - `closeCustomThemeModal()`: Close theme editor
- **Dependencies**: dom.js, ui.js

#### 11. **pdf-viewer.js**
- **Purpose**: PDF viewing and attachment functionality
- **Exports**:
  - `pdfState`: PDF viewer state object
  - `initPdfViewer()`: Initialize PDF viewer controls
  - `openPdfViewer(pdfData, fileName, goalRef)`: Open PDF viewer
  - `closePdfViewer()`: Close PDF viewer
  - `renderAllPages()`: Render all PDF pages
  - `attachPdfToGoal(courseId, categoryId, goalId, pdfData, fileName)`: Attach PDF to goal
  - `removePdfFromGoal()`: Remove PDF from goal
  - `setupPdfGlobalFunctions()`: Setup global window functions
- **Dependencies**: state.js, dom.js, storage.js, ui.js

#### 12. **ui.js**
- **Purpose**: UI rendering and event handling
- **Exports**:
  - `showToast(msg)`: Show toast notification
  - `hideToast()`: Hide toast notification
  - `toggleSidebar()`: Toggle sidebar visibility
  - `toggleCompleted()`: Toggle completed tasks section
  - `renderAll()`: Render all UI components
  - `renderFocus()`: Render focus section
  - `renderStats()`: Render stats section
  - `setupEventListeners()`: Setup event listeners
  - `toggleModal(id)`: Toggle modal visibility
  - `clearCompletedHistory()`: Clear completed tasks
  - `openDailyGoalModal()`: Open daily goal modal
  - `saveDailyGoal()`: Save daily goal
  - `saveTimerSettings()`: Save timer settings
- **Dependencies**: state.js, dom.js, streak.js, tasks.js, courses.js, timer.js, storage.js, themes.js

### Main Application (`src/app.js`)
- **Purpose**: Application initialization and authentication
- **Responsibilities**:
  - Initialize Firebase authentication
  - Setup Sortable for drag-and-drop
  - Initialize PDF viewer
  - Load and apply themes
  - Setup global window functions for HTML onclick handlers
  - Handle user authentication state changes
  - Sync data with Firestore

## Dependency Graph

```
app.js
├── firebase-config.js
├── state.js
├── dom.js
├── dates.js
├── streak.js
│   ├── state.js
│   ├── dates.js
│   ├── storage.js
│   └── ui.js
├── tasks.js
│   ├── state.js
│   ├── dom.js
│   ├── storage.js
│   ├── ui.js
│   └── streak.js
├── courses.js
│   ├── state.js
│   ├── dom.js
│   ├── storage.js
│   └── ui.js
├── timer.js
│   ├── state.js
│   ├── dom.js
│   └── dates.js
├── themes.js
│   ├── dom.js
│   └── ui.js
├── pdf-viewer.js
│   ├── state.js
│   ├── dom.js
│   ├── storage.js
│   └── ui.js
└── ui.js
    ├── state.js
    ├── dom.js
    ├── streak.js
    ├── tasks.js
    ├── courses.js
    ├── timer.js
    ├── storage.js
    └── themes.js
```

## Circular Dependency Handling

The modular structure carefully avoids circular dependencies:
- **storage.js → ui.js**: Uses dynamic import `import('./ui.js').then(...)` for renderAll()
- **ui.js → tasks.js, courses.js, themes.js**: Direct imports
- **tasks.js, courses.js → storage.js**: Direct imports
- **storage.js** uses dynamic imports to break the cycle

## Global Window Functions

For compatibility with inline HTML onclick handlers, these functions are exposed on `window`:
- `window.openCourseModal(courseId)`
- `window.closeCourseModal()`
- `window.addCourse()`
- `window.setCourseColor(id, color)`
- `window.toggleModal(id)`
- `window.clearCompletedHistory()`
- `window.openDailyGoalModal()`
- `window.saveDailyGoal()`
- `window.saveTimerSettings()`
- `window.openCustomThemeModal(themeName)`
- `window.closeCustomThemeModal()`
- `window.setTimer(min)`
- `window.toggleCompleted()`
- `window.setFocus(id)`
- `window.triggerPdfUpload(courseId, categoryId, goalId)`
- `window.openGoalPdf(courseId, categoryId, goalId)`

## Benefits of Modularization

1. **Maintainability**: Each module has a single, clear responsibility
2. **Testability**: Modules can be tested independently
3. **Reusability**: Functions can be imported where needed
4. **Code Organization**: Related functionality is grouped together
5. **Scalability**: Easy to add new features without affecting existing code
6. **Debugging**: Issues are easier to locate and fix
7. **Performance**: Only load what's needed (with tree shaking in production)
8. **Collaboration**: Multiple developers can work on different modules

## File Size Reduction

- **Before**: index.html was 4,448 lines
- **After**: index.html is 2,911 lines (~35% reduction)
- **JavaScript extracted**: ~1,540 lines moved to modules
- **Total module code**: Organized into 13 files for better management

## Usage in HTML

The entire application is now loaded with a single script tag:

```html
<script type="module" src="./src/app.js"></script>
```

All modules use ES6 module syntax and are automatically loaded as needed through the import chain.

## Testing Recommendations

1. Test authentication flow (sign in/out)
2. Test task operations (add, toggle, delete, restore)
3. Test course operations (add, edit, delete courses/categories/goals)
4. Test timer functionality
5. Test theme switching (built-in and custom themes)
6. Test PDF viewer (attach, view, remove PDFs)
7. Test streak tracking and daily goal
8. Test drag-and-drop reordering
9. Test data persistence with Firebase

## Future Improvements

1. Add unit tests for each module
2. Implement TypeScript for type safety
3. Add build process with bundler (Webpack/Vite)
4. Implement lazy loading for PDF viewer
5. Add error boundaries and better error handling
6. Implement service worker for offline support
7. Add end-to-end tests with Playwright/Cypress
