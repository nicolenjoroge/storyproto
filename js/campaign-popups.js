// ── CAMPAIGN POPUP SYSTEM ─────────────────────────────────────────────────────
// All popups are session-aware — each fires at most once per session.
// Config: add your campaign poster images and copy here.

const CAMPAIGNS = {

  // Fires when user has scrolled through 3+ sections
  milestone: {
    image:   'media/Images/campaign-milestone.png',
    title:   'Youve explored REA Buzz',
    body:    '120,000+ hours saved. See what your colleagues are saying.',
    section: 'sec-spotlight',    // fires after this section enters view
  },

  // Fires on scroll pause between sections
  teasers: [
    {
      triggerSection: 'sec-reastory',
      image:   'media/Images/campaign-rea-story.png',
      label:   'Did you know?',
      text:    'Every REA initiative started with one question — why are we still doing this by hand?',
      ctaHref: '#sec-reastory',
      ctaLabel: 'Read the REA Story →',
    },
    {
      triggerSection: 'sec-innovation',
      image:   'media/Images/campaign-innovation.png',
      label:   'Innovation Portfolio',
      text:    '42 initiatives deployed. See which one affected your department.',
      ctaHref: '#sec-innovation',
      ctaLabel: 'Explore the portfolio →',
    },
    {
      triggerSection: 'sec-spotlight',
      image:   'media/Images/campaign-spotlight.png',
      label:   'Spotlight',
      text:    'Real people. Real impact. Meet the team behind the automations.',
      ctaHref: '#sec-spotlight',
      ctaLabel: 'Meet the people →',
    },
  ],

  // Fires on exit intent
  exitBanner: {
    image:     'media/Images/campaign-exit.png',
    headline:  'Before you go — REA has saved KES 380M and counting.',
    sub:       'Share the REA Buzz page with a colleague.',
    ctaLabel:  'Share it →',
    ctaAction: () => navigator.share?.({ title: 'REA Buzz', url: location.href }),
  },

  // Contextual overlays — attach to elements via data-campaign-poster attribute
  // Usage: <div data-campaign-poster="initiative-001">...</div>
  posters: {
    'initiative-001': {
      image:   'media/Images/campaign-doc-approval.png',
      caption: 'Document Approval — 68% faster TAT, 3,200 hours saved. One of REA\'s highest impact initiatives.',
    },
    'initiative-002': {
      image:   'media/Images/campaign-eva.png',
      caption: 'EVA — the AI assistant powering REA. Ask it anything about your workflows.',
    },
  },
};

// ── STATE ─────────────────────────────────────────────────────────────────────
const fired  = new Set(JSON.parse(sessionStorage.getItem('cp-fired') || '[]'));
let teaserIdx      = 0;
let teaserTimeout  = null;
let exitListening  = true;

function markFired(key) {
  fired.add(key);
  sessionStorage.setItem('cp-fired', JSON.stringify([...fired]));
}

// ── LIGHTBOX ─────────────────────────────────────────────────────────────────
export function openCampaignPoster(key) {
  const cfg = CAMPAIGNS.posters[key];
  if (!cfg) return;
  document.getElementById('cp-lightbox-img').src     = cfg.image;
  document.getElementById('cp-lightbox-caption').textContent = cfg.caption || '';
  const bd = document.getElementById('cp-backdrop');
  const lb = document.getElementById('cp-lightbox');
  bd.style.opacity = '1'; bd.style.pointerEvents = 'auto';
  lb.style.opacity = '1'; lb.style.pointerEvents = 'auto';
  lb.style.transform = 'translate(-50%,-50%) scale(1)';
}

window.closeCampaignOverlay = function () {
  const bd = document.getElementById('cp-backdrop');
  const lb = document.getElementById('cp-lightbox');
  bd.style.opacity = '0'; bd.style.pointerEvents = 'none';
  lb.style.opacity = '0'; lb.style.pointerEvents = 'none';
  lb.style.transform = 'translate(-50%,-48%) scale(0.94)';
};

// ── TEASER ────────────────────────────────────────────────────────────────────
function showTeaser(cfg) {
  if (fired.has('teaser-' + cfg.triggerSection)) return;
  document.getElementById('cp-teaser-img').src       = cfg.image;
  document.getElementById('cp-teaser-label').textContent = cfg.label;
  document.getElementById('cp-teaser-text').textContent  = cfg.text;
  const cta = document.getElementById('cp-teaser-cta');
  cta.href        = cfg.ctaHref;
  cta.textContent = cfg.ctaLabel;
  document.getElementById('cp-teaser').style.right = '24px';
  markFired('teaser-' + cfg.triggerSection);
  // Auto-dismiss after 8 seconds
  teaserTimeout = setTimeout(dismissTeaser, 5000);
}

window.dismissTeaser = function () {
  clearTimeout(teaserTimeout);
  document.getElementById('cp-teaser').style.right = '-340px';
};

// ── MILESTONE TOAST ───────────────────────────────────────────────────────────
function showToast() {
  if (fired.has('milestone')) return;
  const cfg = CAMPAIGNS.milestone;
  document.getElementById('cp-toast-img').src         = cfg.image;
  document.getElementById('cp-toast-title').textContent = cfg.title;
  document.getElementById('cp-toast-body').textContent  = cfg.body;
  const el = document.getElementById('cp-toast');
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  el.style.pointerEvents = 'auto';
  markFired('milestone');
  setTimeout(dismissToast, 6000);
}

window.dismissToast = function () {
  const el = document.getElementById('cp-toast');
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
  el.style.pointerEvents = 'none';
};

// ── EXIT BANNER ───────────────────────────────────────────────────────────────
function showExitBanner() {
  if (fired.has('exit') || !exitListening) return;
  const cfg = CAMPAIGNS.exitBanner;
  document.getElementById('cp-exit-img').src            = cfg.image;
  document.getElementById('cp-exit-headline').textContent = cfg.headline;
  document.getElementById('cp-exit-sub').textContent      = cfg.sub;
  const btn = document.getElementById('cp-exit-cta');
  btn.textContent = cfg.ctaLabel;
  btn.onclick = () => { cfg.ctaAction?.(); dismissExitBanner(); };
  document.getElementById('cp-exit-banner').style.bottom = '0';
  markFired('exit');
}

window.dismissExitBanner = function () {
  document.getElementById('cp-exit-banner').style.bottom = '-120px';
};

// ── INTERSECTION OBSERVER ─────────────────────────────────────────────────────
function initObservers() {
  const sectionMap = {};
  CAMPAIGNS.teasers.forEach(t => { sectionMap[t.triggerSection] = t; });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id  = entry.target.id;
      const cfg = sectionMap[id];

      // Section teaser — fires 1.5s after section enters view
      if (cfg && !fired.has('teaser-' + id)) {
        setTimeout(() => showTeaser(cfg), 1500);
      }

      // Milestone toast — fires after spotlight section
      if (id === CAMPAIGNS.milestone.section && !fired.has('milestone')) {
        setTimeout(showToast, 2000);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.page-section').forEach(el => obs.observe(el));
}

// ── EXIT INTENT ───────────────────────────────────────────────────────────────
function initExitIntent() {
  if (fired.has('exit')) return;
  // Only trigger after user has been on page for 30 seconds
  let ready = false;
  setTimeout(() => { ready = true; }, 30000);

  document.addEventListener('mouseleave', e => {
    if (ready && e.clientY <= 0) showExitBanner();
  });

  // Mobile: trigger on back gesture (popstate)
  window.addEventListener('popstate', () => {
    if (ready) showExitBanner();
  });
}

// ── CONTEXTUAL POSTERS ────────────────────────────────────────────────────────
function initContextualPosters() {
  document.querySelectorAll('[data-campaign-poster]').forEach(el => {
    const key = el.getAttribute('data-campaign-poster');
    if (!CAMPAIGNS.posters[key]) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', e => {
      // Only intercept if not clicking a link or button inside
      if (e.target.closest('a, button')) return;
      openCampaignPoster(key);
    });
  });
}

// ── MUTUAL EXCLUSION ──────────────────────────────────────────────────────────
// Only one popup fires at a time — if teaser is showing, delay exit banner etc.
function onlyOneAtATime() {
  const teaser = document.getElementById('cp-teaser');
  const origShow = showExitBanner;
  // If teaser is visible, skip exit banner until it's gone
  window.dismissTeaser = function () {
    clearTimeout(teaserTimeout);
    teaser.style.right = '-340px';
  };
}

// ── INIT ──────────────────────────────────────────────────────────────────────
export function initCampaignPopups() {
  initObservers();
  initExitIntent();
  initContextualPosters();
  onlyOneAtATime();
}