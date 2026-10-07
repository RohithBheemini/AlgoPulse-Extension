import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlgoPulseOverlay } from './overlay';

function initAlgoPulse() {
  // Prevent duplicate mounts
  if (document.getElementById('algopulse-overlay-root')) {
    return;
  }

  // Create mount container
  const container = document.createElement('div');
  container.id = 'algopulse-overlay-root';
  container.className = 'dark algopulse-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<AlgoPulseOverlay />);

  console.log('[AlgoPulse] In-page review overlay mounted.');
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAlgoPulse);
} else {
  initAlgoPulse();
}

// Handle LeetCode SPA dynamic client navigation (history pushState/replaceState)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Ensure overlay container exists if page re-rendered
    if (!document.getElementById('algopulse-overlay-root')) {
      initAlgoPulse();
    }
  }
}).observe(document, { subtree: true, childList: true });
