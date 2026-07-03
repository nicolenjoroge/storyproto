// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { loadContent } from './content-loader.js';
import { initUIInteractions } from './ui-interactions.js';

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadContent();          // fetches content.json
  initUIInteractions();   // animations, scroll effects, carousels, modal — all UX/UI
});
