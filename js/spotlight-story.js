// Add to landing.js
import { mediaUrl, setById, unskel, elById }          from './helpers.js';

export function renderSpotlightStory(item) {
  const story = item.story   || {};
  const usage = item.metrics?.usage || {};
  const media = item.media   || [];

  // Cold open
  setById('intro-eyebrow', story.eyebrow || '');
  unskel('intro-title'); setById('intro-title', item.title || '');
  unskel('intro-sub');
  const previewBody = story.body || '';
  setById('intro-sub', previewBody.length > 160 ? previewBody.slice(0, 157) + '…' : previewBody);
  elById('intro-chips').innerHTML = 
    [item.stream, item.businessArea].filter(Boolean)
      .map(c => `<span class="chip">${c}</span>`).join('');

  // Panel 1 — Story
  unskel('story-heading'); setById('story-heading', story.heading || item.title || '');
  unskel('story-body');    setById('story-body',    story.body    || '');
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
  setById('close-title', story.closing?.line || `${item.title} is live across NCBA.`);
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
  const visual = m.type === 'video'
    ? `<video poster="${m.poster ? base + '/' + m.poster : ''}"
               preload="none" controls playsinline>
         <source src="${base}/${m.src}" type="video/mp4" />
       </video>`
    : `<img src="${base}/${m.src}" alt="${m.caption || ''}" />`;
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