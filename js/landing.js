// ── LANDING PAGE───────────────────────────────────────────────────────────────────
import { setText, setAttr, mediaUrl } from './helpers.js';

//Render the landing page sections, resolved from index via refIds
export function renderLanding(landing, index) {
  if (!landing) return;
  renderMarquee(landing.marquee);
  renderHero(landing.hero);
  renderFeaturedInitiative(landing.featuredInitiative, index);
  renderLandingVideos(landing.videoSlides, index);
  renderStoryhub(landing.storyhub, index);
}

// Marquee — horizontal scrolling ticker of items
function renderMarquee(items) {
  if (!items) return;
  const html = [...items, ...items].map(item => `
    <span class="marquee-item${item.highlight ? ' highlight' : ''}">
      <span class="shard"></span><b>${item.value}</b> ${item.label}
    </span>`).join('');
  document.querySelectorAll('.marquee').forEach(el => el.innerHTML = html);
}

// Hero — main headline and subheadline
function renderHero(hero) {
  if (!hero) return;
  setText('[data-c="hero-eyebrow"]',   hero.eyebrow);
  setText('[data-c="hero-h1-line1"]',  hero.headingLine1);
}

// Featured initiative — fixed single panel, resolved from index via refId
function renderFeaturedInitiative(config, index) {
  if (!config?.refId) return;
  const item = index[config.refId];
  if (!item) return;

  setText('[data-c="fi-label"]',       item.rank ? `Featured initiative` : '');
  setText('[data-c="fi-title"]',       item.title);
  setText('[data-c="fi-body"]',        item.body);
  setText('[data-c="fi-cta"]',         item.ctaLabel);
  setAttr('[data-c="fi-image"]', 'src', mediaUrl(item.image));
  if (item.stats?.[0]) {
    setText('[data-c="fi-stat0-val"]',   item.stats[0].value);
    setText('[data-c="fi-stat0-label"]', item.stats[0].label);
  }
  if (item.stats?.[1]) {
    setText('[data-c="fi-stat1-val"]',   item.stats[1].value);
    setText('[data-c="fi-stat1-label"]', item.stats[1].label);
  }
}

// Landing page video slider — two slides resolved from index via refIds
function renderLandingVideos(config, index) {
  if (!config?.refIds) return;
  const items = config.refIds.map(id => index[id]).filter(Boolean);
  items.forEach((item, i) => {
    setText(`[data-c="video-tag-${i}"]`,   item.tag);
    setText(`[data-c="video-title-${i}"]`, item.title);
    setAttr(`[data-c="video-thumb-${i}"]`, 'src', mediaUrl(item.thumbnail));
  });
}

// Storyhub "Around the storyhub" panel — ordered list of section teasers
function renderStoryhub(config, index) {
  if (!config?.refIds) return;
  const el = document.getElementById('list-storyhub');
  if (!el) return;
  const items = config.refIds.map(id => index[id]).filter(Boolean);
  el.innerHTML = items.map(teaser => `
    <a href="${teaser.href}">
      <div class="headline-item">
        <span class="dot"></span>
        <div class="htext">
          <div class="sec">${teaser.sectionLabel}</div>
          <h5>${teaser.headline}</h5>
        </div>
      </div>
    </a>`).join('');
}
