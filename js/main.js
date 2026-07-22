// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { loadContent } from './content-loader.js';
import { initUIInteractions, startSpotlightScrollEngine } from './ui-interactions.js';
import { initCampaignLoader } from './loader.js';
import { initCampaignPopups } from './campaign-popups.js';
import { loadInitiative }   from './content-loader.js';
import { renderSpotlightStory }  from './spotlight-story.js';


document.addEventListener('DOMContentLoaded', () => {
  initCampaignLoader();
  loadContent();          // fetches content.json
  initCampaignPopups();
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
