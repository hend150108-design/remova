/**
 * Remova - Main Entry Point
 */

import './css/style.css';
import './css/responsive.css';
import { initApp } from './js/app.js';

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

