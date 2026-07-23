// ── CONTENT LOADER ────────────────────────────────────────────────────────────
import { renderLanding }        from './landing.js';
import { renderReaStory }       from './rea-story.js';
import { renderInnovation }     from './innovation.js';
import { renderSpotlight }      from './spotlight.js';
import { renderWhatsNew }       from './whats-new.js';
import { initCampaignPopups } from './campaign-popups.js';

// ── CACHE ─────────────────────────────────────────────────────────────────────
// Fetched once and reused by both loadContent and loadInitiative.
// Stored as a promise so concurrent callers share the same in-flight request.
let _dataPromise = null;

function fetchData() {
  if (_dataPromise) return _dataPromise;
  _dataPromise = (async () => {
    const base = (window.CONTENT_BASE_URL || '').replace(/\/$/, '');
    const manifest = await fetch(`${base}/content/manifest.json`).then(r => {
      if (!r.ok) throw new Error(`manifest ${r.status}`);
      return r.json();
    });
    const version = manifest.liveVersion;
    const data = await fetch(`${base}/content/published/v${version}.json`).then(r => {
      if (!r.ok) throw new Error(`content ${r.status}`);
      return r.json();
    });
    return data;
  })();
  return _dataPromise;
}

// ── MAIN PAGE LOAD ────────────────────────────────────────────────────────────
export async function loadContent() {
  try {
    const data  = await fetchData();
    const index = buildIndex(data);
    renderAll(data, index);
  } catch (err) {
    console.warn('[content] Failed to load — falling back to hardcoded HTML', err);
  } finally {
    document.dispatchEvent(new Event('contentReady'));
  }
}

// ── SPOTLIGHT PAGE LOAD ───────────────────────────────────────────────────────
export async function loadInitiative() {
  try {
    const data  = await fetchData();
    const items = data.innovation?.topInitiatives?.items || [];
    const item  = items.find(i => i.featured)
               || items.find(i => i.rank === 1)
               || items[0];
    if (!item) throw new Error('No initiative found in JSON');
    console.log('[spotlight] item found:', item.title);
    return item;
  } catch (err) {
    console.warn('[spotlight] Using mock data —', err.message);
    return SPOTLIGHT_MOCK;
  }
}

// ── INDEX ─────────────────────────────────────────────────────────────────────
function buildIndex(data) {
  const index   = {};
  const collect = items => items?.forEach(item => { if (item.id) index[item.id] = item; });

  // Section teasers
  ['reaStory', 'innovation', 'spotlight', 'whatsNew'].forEach(key => {
    const teaser = data[key]?.teaser;
    if (teaser?.id) index[teaser.id] = teaser;
  });

  // Referenceable list items
  collect(data.innovation?.topInitiatives?.items);
  collect(data.innovation?.videos?.items);
  collect(data.whatsNew?.buzzItems);

  return index;
}

// ── RENDER ALL ────────────────────────────────────────────────────────────────
function renderAll(data, index) {
  renderLanding(data.landing, index);
  renderReaStory(data.reaStory);
  renderInnovation(data.innovation);
  renderSpotlight(data.spotlight);
  renderWhatsNew(data.whatsNew);
  initCampaignPopups(data.campaigns)
  // Note: renderSpotlightStory is called from spotlight.html via loadInitiative
  // not here — story data lives on the initiative item, not at the root
}

// ── SPOTLIGHT MOCK ────────────────────────────────────────────────────────────
// Fallback data used when the fetch fails on spotlight.html
export const SPOTLIGHT_MOCK = {
  title:        'Document Approval, reimagined',
  stream:       'IBPS',
  businessArea: 'Operations',
  image:        'media/images/topapprove.png',
  story: {
    eyebrow:   'Highest impact · #1 deployed initiative',
    heading:   'The workflow that quietly changed how the bank signs off on everything.',
    body:      'The Document Approval workflow digitises and automates document routing, approvals, and notifications across business units. It eliminates paper-based approvals, reduces turnaround time, improves visibility into approval status, and ensures every approval is fully auditable.',
    techChips: ['IBPS', 'Operations', 'DocuSign'],
    closing: {
      line: 'Document Approval is one of many deployed BPM initiatives now live across NCBA.',
      body: '96% same-day completion rate across all document types and business units.',
    },
  },
  metrics: {
    usage: {
      topUsers: [
        { name: 'Jane Mwangi',  role: 'Operations Officer', count: 312 },
        { name: 'Brian Otieno', role: 'Branch Manager',      count: 278 },
        { name: 'Amina Hassan', role: 'Credit Analyst',      count: 241 },
      ],
      topDepartments: [
        { name: 'Operations',     count: 1840 },
        { name: 'Credit',         count: 1203 },
        { name: 'Branch Network', count: 974  },
      ],
      topDocumentTypes: [
        { name: 'Credit Approval Memo',   count: 2310 },
        { name: 'Vendor Payment Request', count: 1876 },
        { name: 'HR Onboarding Form',     count: 1102 },
      ],
    },
  },
  media: [
    { type: 'image', src: 'media/images/Document Approval 1.png', caption: 'Document routing dashboard' },
    { type: 'image', src: 'media/images/topapprove.png',          caption: 'Approval status overview'   },
  ],
};