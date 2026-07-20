// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { loadContent } from './content-loader.js';
import { initUIInteractions } from './ui-interactions.js';
import { initCampaignLoader } from './loader.js';
// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCampaignLoader();
  loadContent();          // fetches content.json
  initUIInteractions();   // animations, scroll effects, carousels, modal — all UX/UI
});
