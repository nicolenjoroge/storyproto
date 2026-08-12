// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { loadContent }                                    from './content-loader.js';
import { initUIInteractions, startSpotlightScrollEngine } from './ui-interactions.js';
import { initCampaignLoader }                             from './loader.js';
import { initCampaignPopups }                             from './campaign-popups.js';
import { loadInitiative }                                 from './content-loader.js';
import { renderSpotlightStory }                           from './spotlight-story.js';
import { initAuth, getAccount, signOut }                  from './auth.js';

async function boot() {
  // Auth gate — must resolve before anything else runs
  const account = await initAuth();
  if (!account) return;   // loginRedirect is in flight — page will reload after login

  document.body.classList.add('auth-ready');

  // Populate nav user display
  const nameEl = document.getElementById('nav-user-name');
  if (nameEl) nameEl.textContent = account.name || account.username;

  // Expose sign out globally for the onclick
  window.signOutUser = signOut;

  // Spotlight page — different flow
  const isSpotlight = document.body.id === 'page-spotlight'
    || document.title.includes('Spotlight');

  if (isSpotlight) {
    const item = await loadInitiative();
    renderSpotlightStory(item);
    startSpotlightScrollEngine();
    return;
  }

  // Main page
  initCampaignLoader();
  await loadContent();
  initUIInteractions();
  initCampaignPopups();
}

document.addEventListener('DOMContentLoaded', boot);