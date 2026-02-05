/**
 * Timer Module
 * Handles focus timer functionality
 */

import { state } from './state.js';
import { getEl } from './dom.js';
import { formatTime } from './dates.js';

let timerInterval;

/**
 * Toggle timer between running and paused
 */
export function toggleTimer() {
  const btn = getEl('startTimerBtn');
  if (state.timer.isRunning) {
    clearInterval(timerInterval);
    state.timer.isRunning = false;
    btn.innerText = "Resume";
    btn.style.background = "var(--accent-green)";
  } else {
    if (state.timer.timeLeft === undefined) state.timer.timeLeft = state.timer.duration * 60;
    state.timer.isRunning = true;
    btn.innerText = "Pause";
    btn.style.background = "var(--accent-orange)";
    timerInterval = setInterval(() => {
      if (state.timer.timeLeft > 0) {
        state.timer.timeLeft--;
        getEl('timerDisplay').innerText = formatTime(state.timer.timeLeft);
      } else {
        clearInterval(timerInterval);
        state.timer.isRunning = false;
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
        alert("Focus Session Complete!");
        resetTimer();
      }
    }, 1000);
  }
}

/**
 * Reset timer to initial duration
 */
export function resetTimer() {
  clearInterval(timerInterval);
  state.timer.isRunning = false;
  state.timer.timeLeft = state.timer.duration * 60;
  getEl('timerDisplay').innerText = formatTime(state.timer.timeLeft);
  const btn = getEl('startTimerBtn');
  btn.innerText = "Start Focus";
  btn.style.background = "var(--text-primary)";
}

/**
 * Set timer duration
 * @param {number} min - Duration in minutes
 */
export function setTimer(min) {
  state.timer.duration = min;
  resetTimer();
}
