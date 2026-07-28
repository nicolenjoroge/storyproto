// Add to landing.js
import { mediaUrl, setById, unskel, elById } from './helpers.js';

export function renderSpotlightStory(item) {
  const story  = item.story   || {};
  const usage  = item.metrics?.usage || {};
  const media  = item.media   || [];
  const blocks = story.blocks || [];

  // ── Cold open (always shown) ──────────────────────────────────────────────
  setById('intro-eyebrow', story.eyebrow || '');
  unskel('intro-title'); setById('intro-title', item.title || '');
  unskel('intro-sub');
  const previewBody = _storyBodyText(story, blocks);
  setById('intro-sub', previewBody.length > 160 ? previewBody.slice(0, 157) + '…' : previewBody);
  elById('intro-chips').innerHTML =
    [item.stream, item.businessArea].filter(Boolean)
      .map(c => `<span class="chip">${c}</span>`).join('');

  // ── Panel 1 — Story text (always shown) ───────────────────────────────────
  unskel('story-heading'); setById('story-heading', story.heading || item.title || '');
  unskel('story-body');
  // Use narrative block body if available, else fall back to story.body
  const narrativeBlock = blocks.find(b => b.type === 'narrative');
  setById('story-body', narrativeBlock ? narrativeBlock.body : (story.body || ''));

  elById('story-chips').innerHTML =
    (story.techChips || []).map(c => `<span class="story-chip">${c}</span>`).join('');
  elById('orb-labels').innerHTML =
    (story.techChips || [item.stream, item.businessArea].filter(Boolean))
      .slice(0, 5).map(c => `<div class="orb-label">${c}</div>`).join('');
  spawnParticles();
  requestAnimationFrame(() => {
    const col = elById('story-text-col');
    if (col && col.scrollHeight <= col.clientHeight) col.classList.add('no-overflow');
  });

  // ── Dynamic block panels ──────────────────────────────────────────────────
  // If blocks exist, replace panels 2-3 with block-rendered content.
  // Fall back to legacy usage/media panels if no blocks.
  if (blocks.length > 0) {
    _renderBlockPanels(blocks, item, usage, media, story);
  } else {
    _renderLegacyPanels(usage, media, story, item);
  }
}

// ── Block panel renderer ───────────────────────────────────────────────────
// Injects additional panels into the pin-track between panel 1 and the close panel.

function _renderBlockPanels(blocks, item, usage, media, story) {
  const track    = elById('pin-track');
  const closePanel = track.querySelector('.panel-close');

  // Remove any previously injected block panels
  track.querySelectorAll('.panel-block').forEach(el => el.remove());

  // Render each block as a panel (skip narrative — already in panel 1)
  blocks
    .filter(b => b.type !== 'narrative')
    .forEach(b => {
      const panel = document.createElement('section');
      panel.className = 'panel panel-block';

      switch (b.type) {

        case 'stats-grid':
          panel.innerHTML = _blockStatsGrid(b);
          break;

        case 'bar-chart':
          panel.innerHTML = _blockBarChart(b);
          break;

        case 'media-shelf':
          panel.innerHTML = _blockMediaShelf(b.items || [], item);
          break;

        case 'quote':
          panel.innerHTML = _blockQuote(b);
          break;

        case 'closing':
          // Don't add a separate closing panel — update the existing one instead
          _applyClosing(b.line, b.body);
          return;

        default:
          return;
      }

      track.insertBefore(panel, closePanel);
    });

  // Update the dot count on the scroll rail
  _updateScrollRail(track);

  // Update close panel from story.closing fallback
  const closingBlock = blocks.find(b => b.type === 'closing');
  if (closingBlock) {
    _applyClosing(closingBlock.line, closingBlock.body);
  } else if (story.closing) {
    _applyClosing(story.closing.line, story.closing.body);
  } else {
    setById('close-title', `${item.title} is live across NCBA.`);
  }
}

// ── Legacy panel renderer (no blocks) ────────────────────────────────────
function _renderLegacyPanels(usage, media, story, item) {
  // Panel 2 — Usage
  elById('usage-grid').innerHTML =
    usageBlock('Top users',          usage.topUsers         || [], 'user') +
    usageBlock('Top departments',    usage.topDepartments   || [], 'dept') +
    usageBlock('Top document types', usage.topDocumentTypes || [], 'doc');

  // Panel 3 — Media
  elById('media-shelf').innerHTML =
    media.length
      ? media.slice(0, 4).map(m => mediaCard(m)).join('')
      : `<div class="media-card">
           <div class="media-card-visual">
             <div class="media-placeholder">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                 <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                 <path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="1.5"/>
               </svg>
               Media coming soon
             </div>
           </div>
           <div class="media-card-caption">Screenshots and recordings will appear here.</div>
         </div>`;

  // Panel 4 — Close
  _applyClosing(story.closing?.line, story.closing?.body);
  if (!story.closing?.line) setById('close-title', `${item.title} is live across NCBA.`);
}

// ── Block renderers ───────────────────────────────────────────────────────

function _blockStatsGrid(b) {
  const items = b.items || [];
  const mode  = b.displayMode || 'cards';
  const title = b.title || '';

  if (mode === 'cards') {
    // Stat cards — same as existing stats[]
    const cards = items.map(item => `
      <div class="stat-card">
        <div class="stat-value">${item.value || ''}</div>
        <div class="stat-label">${item.name  || ''}</div>
      </div>`).join('');
    return `
      <div class="panel-inner">
        ${title ? `<p class="panel-eyebrow" style="color:var(--sky)">${title}</p>` : ''}
        <div class="stats-card-grid">${cards}</div>
      </div>`;
  }

  // Table mode — name/value rows with bar chart
  const max = Math.max(...items.map(i => parseFloat(i.value) || 0), 1);
  const rows = items.map((item, idx) => `
    <div class="usage-item">
      <div class="usage-item-top">
        <div class="usage-item-left">
          <div class="usage-item-name-row">
            <span class="usage-rank">${idx + 1}</span>
            <span class="usage-item-name">${item.name || ''}</span>
          </div>
        </div>
        <span class="usage-item-count">${item.value || ''}</span>
      </div>
      <div class="usage-bar-track">
        <div class="usage-bar-fill" style="width:${Math.round(((parseFloat(item.value) || 0) / max) * 100)}%"></div>
      </div>
    </div>`).join('');

  return `
    <div class="panel-inner">
      <p class="panel-eyebrow" style="color:var(--sky)">${title}</p>
      <div class="usage-block" style="max-width:640px;margin-top:24px;">
        <div class="usage-row">${rows}</div>
      </div>
    </div>`;
}

function _blockBarChart(b) {
  const bars  = b.bars  || b.items || [];
  const title = b.title || '';
  const max   = Math.max(...bars.map(bar => parseFloat(bar.value) || 0), 1);

  const barEls = bars.map(bar => `
    <div class="bar-chart-row">
      <div class="bar-chart-label">${bar.label || bar.name || ''}</div>
      <div class="bar-chart-track">
        <div class="bar-chart-fill" style="width:${Math.round(((parseFloat(bar.value) || 0) / max) * 100)}%"></div>
      </div>
      <div class="bar-chart-value">${bar.value || ''}</div>
    </div>`).join('');

  return `
    <div class="panel-inner">
      ${title ? `<p class="panel-eyebrow" style="color:var(--sky)">${title}</p>` : ''}
      <div class="bar-chart-wrap" style="max-width:640px;margin-top:24px;">${barEls}</div>
    </div>`;
}

function _blockMediaShelf(items, item) {
  const cards = items.length
    ? items.slice(0, 4).map(m => mediaCard(m)).join('')
    : `<div class="media-card">
         <div class="media-card-visual">
           <div class="media-placeholder">Media coming soon</div>
         </div>
       </div>`;
  return `
    <div class="panel-inner">
      <p class="panel-eyebrow" style="color:var(--med)">Behind the scenes</p>
      <h2 class="panel-heading">An inside look at the solution</h2>
      <div class="media-shelf">${cards}</div>
    </div>`;
}

function _blockQuote(b) {
  return `
    <div class="panel-inner" style="max-width:740px;">
      <blockquote style="
        font-size:clamp(20px,3vw,34px);
        font-weight:bold;
        line-height:1.35;
        letter-spacing:-0.01em;
        color:#fff;
        border-left:3px solid var(--sky);
        padding-left:28px;
        margin-bottom:20px;
      ">${b.text || ''}</blockquote>
      ${b.attribution ? `<p style="font-size:13px;color:rgba(255,255,255,0.45);padding-left:28px;">— ${b.attribution}</p>` : ''}
    </div>`;
}

function _applyClosing(line, body) {
  if (line) setById('close-title', line);
  if (body) setById('close-body',  body);
}

// ── Scroll rail updater ───────────────────────────────────────────────────
// Adds dots for dynamically injected panels

function _updateScrollRail(track) {
  const rail       = elById('scroll-rail');
  if (!rail) return;
  const panelCount = track.querySelectorAll('.panel').length;
  rail.innerHTML   = Array.from({ length: panelCount }, (_, i) =>
    `<span class="rail-dot" data-panel="${i}"></span>`
  ).join('') + `<span class="rail-label" id="rail-label">Scroll</span>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function _storyBodyText(story, blocks) {
  const nb = blocks.find(b => b.type === 'narrative');
  return (nb ? nb.body : story.body) || '';
}

function usageBlock(label, items, type) {
  if (!items.length) return `
    <div class="usage-block">
      <div class="usage-block-label">${label}</div>
      <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:8px">No data yet</p>
    </div>`;
  const max  = Math.max(...items.map(i => i.count));
  const rows = items.slice(0, 3).map((item, idx) => `
    <div class="usage-item">
      <div class="usage-item-top">
        <div class="usage-item-left">
          <div class="usage-item-name-row">
            <span class="usage-rank">${idx + 1}</span>
            <span class="usage-item-name">${item.name}</span>
          </div>
          ${type === 'user' && item.role
            ? `<div class="usage-item-sub">${item.role}</div>` : ''}
        </div>
        <span class="usage-item-count">${item.count.toLocaleString()}</span>
      </div>
      <div class="usage-bar-track">
        <div class="usage-bar-fill" style="width:${Math.round((item.count / max) * 100)}%"></div>
      </div>
    </div>`).join('');
  return `
    <div class="usage-block">
      <div class="usage-block-label">${label}</div>
      <div class="usage-row">${rows}</div>
    </div>`;
}

function mediaCard(m) {
  const base   = (window.CONTENT_BASE_URL || '').replace(/\/$/, '');
  const src    = m.src   ? (m.src.startsWith('http')   ? m.src   : `${base}/${m.src}`)   : '';
  const poster = m.poster ? (m.poster.startsWith('http') ? m.poster : `${base}/${m.poster}`) : '';
  const visual = m.type === 'video'
    ? `<video poster="${poster}" preload="none" controls playsinline>
         <source src="${src}" type="video/mp4" />
       </video>`
    : `<img src="${src}" alt="${m.caption || ''}" />`;
  return `
    <div class="media-card">
      <div class="media-card-visual">${visual}</div>
      ${m.caption ? `<div class="media-card-caption">${m.caption}</div>` : ''}
    </div>`;
}

function spawnParticles() {
  const container = elById('orb-particles');
  if (!container) return;
  const SIZES    = [3, 4, 5, 3, 4];
  const COLOURS  = ['#3ab3e5', '#00a8a9', '#f8e200', '#9f197e', '#3ab3e5'];
  const DURATION = [3, 4, 5, 3.5, 4.5];
  const DELAY    = [0, 0.8, 1.6, 2.4, 3.2];
  const LEFTS    = ['30%', '45%', '55%', '38%', '62%'];
  container.innerHTML = SIZES.map((size, i) => `
    <div class="orb-particle" style="
      width: ${size}px; height: ${size}px;
      background: ${COLOURS[i]};
      left: ${LEFTS[i]}; bottom: 30%;
      animation-duration: ${DURATION[i]}s;
      animation-delay: ${DELAY[i]}s;
    "></div>`).join('');
}