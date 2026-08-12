// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { loadContent } from './content-loader.js';
import { initUIInteractions, startSpotlightScrollEngine } from './ui-interactions.js';
import { initCampaignLoader } from './loader.js';
import { initCampaignPopups } from './campaign-popups.js';
import { loadInitiative } from './content-loader.js';
import { renderSpotlightStory } from './spotlight-story.js';
import { initAuth, getAccount, signOut } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const account = await initAuth();
  if (!account) return;   // loginRedirect is in flight — stop here

  document.body.classList.add('auth-ready');

  // Populate nav user display
  const nameEl = document.getElementById('nav-user-name');
  if (nameEl) nameEl.textContent = account.name || account.username;

  // Expose sign out globally for the onclick
  window.signOutUser = signOut;

  
  initCampaignLoader();
  loadContent();          // fetches content.json
  initUIInteractions();   // animations, scroll effects, carousels, modal — all UX/UI
});

//For spotlight story page
const isSpotlight = document.body.id === 'page-spotlight'
  || document.title.includes('Spotlight');

if (isSpotlight) {
  loadInitiative().then(item => {
    renderSpotlightStory(item);
    startSpotlightScrollEngine();
  });
}
