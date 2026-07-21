// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { loadContent } from './content-loader.js';
import { initUIInteractions } from './ui-interactions.js';
import { initCampaignLoader } from './loader.js';
import { initCampaignPopups } from './campaign-popups.js';
// ── INIT ──────────────────────────────────────────────────────────────────────

el.innerHTML = DOMPurify.sanitize(html);

document.addEventListener('DOMContentLoaded', () => {
  initCampaignLoader();
  loadContent();          // fetches content.json
  initCampaignPopups();
  initUIInteractions();   // animations, scroll effects, carousels, modal — all UX/UI
});
