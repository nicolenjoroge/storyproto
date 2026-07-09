// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────
import { CONTENT_BASE } from './helpers.js';
import { renderLanding }   from './landing.js';
import { renderReaStory }  from './rea-story.js';
import { renderInnovation } from './innovation.js';
import { renderSpotlight }  from './spotlight.js';
import { renderWhatsNew }   from './whats-new.js';

//Fetch sequence to load Content from manifest.json, (referencing the current published JSON file)
export async function loadContent() {
  try {
    const manifest = await fetch(`${CONTENT_BASE}/content/manifest.json`).then(r => r.json());
    const data     = await fetch(`${CONTENT_BASE}/content/published/${manifest.liveVersion}.json`).then(r => r.json());
    const index    = buildIndex(data);
    renderAll(data, index);
    document.dispatchEvent(new Event('contentReady'));
  } catch (err) {
    console.warn('[content] Failed to load — falling back to hardcoded HTML', err);
    document.dispatchEvent(new Event('contentReady'));
  }
}

// Lookup, index JSON list items
function buildIndex(data) {
  const index = {};
  const collect = (items) => items && items.forEach(item => { if (item.id) index[item.id] = item; });

  // Section teasers
  ['reaStory', 'innovation', 'spotlight', 'whatsNew'].forEach(section => {
    const teaser = data[section]?.teaser;
    if (teaser?.id) index[teaser.id] = teaser;
  });

  // Referenceable list items
  collect(data.innovation?.topInitiatives?.items);
  collect(data.innovation?.videos?.items);
  collect(data.whatsNew?.buzzItems);

  return index;
}

//Render all sections of the page
function renderAll(data, index) {
  renderLanding(data.landing, index);
  renderReaStory(data.reaStory);
  renderInnovation(data.innovation);
  renderSpotlight(data.spotlight);
  renderWhatsNew(data.whatsNew);
}
