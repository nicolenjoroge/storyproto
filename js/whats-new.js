// ── WHAT'S NEW ────────────────────────────────────────────────────────────────
import { setText } from './helpers.js';

//Render the What's New section
export function renderWhatsNew(wn) {
  if (!wn) return;
  setText('[data-c="wn-sub"]',          wn.sectionSub);
  setText('[data-c="wn-pick-heading"]', wn.editorsPick.heading);
  setText('[data-c="wn-pick-body"]',    wn.editorsPick.body);
  renderBuzzFeed(wn.buzzItems);
}

// Buzz feed cards — list-generated(Below Editor's Pick)
function renderBuzzFeed(items) {
  if (!items) return;
  const el = document.getElementById('grid-buzz');
  if (!el) return;

  const ACCENTS = ['#3ab3e5', '#9f197e', '#00a8a9', '#f8e200', '#e4032c'];

  el.innerHTML = items.map((item, i) => `
    <div class="buzz-card" style="--buzz-accent: ${ACCENTS[i % ACCENTS.length]}">
      <span class="buzz-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="buzz-meta">
        ${item.isNew ? '<span class="pulse new"></span>' : ''}
        ${item.age || ''}
      </div>
      <div class="buzz-headline">${item.headline}</div>
      ${item.body
        ? `<p class="buzz-body">${item.body}</p>`
        : ''}
      ${item.benefits?.length
        ? `<ul class="buzz-benefits">
             ${item.benefits.map(b => `<li class="buzz-benefit">${b}</li>`).join('')}
           </ul>`
        : ''}
    </div>`).join('');
}
