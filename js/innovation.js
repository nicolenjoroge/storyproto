// ── INNOVATION ────────────────────────────────────────────────────────────────
import { setText, mediaUrl, escAttr } from './helpers.js';
import { bindScrollDots, bindShelfArrows } from './ui-interactions.js';

//Render the Innovation section
export function renderInnovation(inn) {
  if (!inn) return;
  setText('[data-c="inn-sub"]', inn.sectionSub);
  renderTopInitiatives(inn.topInitiatives);
  renderDeployed(inn.deployed);
  renderComingSoon(inn.comingSoon);
  renderInnovationVideos(inn.videos);
}

// Top initiatives shelf — list-generated, click Functionality that opens up modal for details, from 2 - 5
function renderTopInitiatives(section) {
  if (!section) return;
  setText('[data-c="inn-top-label"]', section.rowLabel);
  setText('[data-c="inn-top-title"]', section.rowTitle);
  setText('[data-c="inn-top-note"]',  section.rowNote);

  const el     = document.getElementById('shelf-initiatives');
  const dotsEl = document.getElementById('dots-initiatives');
  if (!el) return;

  const CARD_WIDTH = 358;

  el.innerHTML = section.items.map(item => {
    const clickHandler = item.rank === 1 && item.ctaHref
      ? `onclick="location.href='${item.ctaHref}'"`
      : `data-title="${escAttr(item.title)}"
         data-description="${escAttr(item.body || item.description || '')}"
         data-image="${escAttr(mediaUrl(item.image))}"
         data-tag="Initiative · Rank ${item.rank}"
         data-stats="${escAttr(JSON.stringify(item.stats || []))}"
         onclick="openCardFromEl(this)"`;
    return `
      <div class="shelf-card" ${clickHandler}>
        <div class="shelf-rank">${item.rank}</div>
        <div class="shelf-art">
          <img src="${mediaUrl(item.image)}" alt="${escAttr(item.title)}" />
          ${item.rank !== 1 ? `<div class="card-hover-overlay"><span>Click for more</span></div>` : ''}
        </div>
        <div class="shelf-body">
          <h4>${item.title}</h4>
        </div>
      </div>`;
  }).join('');

  if (dotsEl) {
    dotsEl.innerHTML = section.items.map(() => `<div class="sdot"></div>`).join('');
    bindScrollDots(el, dotsEl, CARD_WIDTH);
  }
  bindShelfArrows(
    el,
    document.getElementById('arr-left-initiatives'),
    document.getElementById('arr-right-initiatives'),
    CARD_WIDTH
  );
}

// Deployed initiatives — list-generated, Modal opening for more details
function renderDeployed(section) {
  if (!section) return;
  setText('[data-c="inn-dep-label"]', section.rowLabel);
  setText('[data-c="inn-dep-title"]', section.rowTitle);

  const el     = document.getElementById('grid-deployed');
  const dotsEl = document.getElementById('dots-deployed');
  if (!el) return;

  const CARD_WIDTH = 236;

  el.innerHTML = section.items.map(item => `
    <div class="poster-card"
         style="cursor:pointer"
         data-title="${escAttr(item.title)}"
         data-description="${escAttr(item.description || '')}"
         data-image="${escAttr(mediaUrl(item.image))}"
         data-tag="Deployed initiative"
         onclick="openCardFromEl(this)">
      <div class="card-hover-overlay"><span>Click for more</span></div>
      <div class="poster-art">
        <img src="${mediaUrl(item.image)}" alt="${escAttr(item.title)}" />
      </div>
      <div class="poster-text"><h5>${item.title}</h5></div>
    </div>`).join('');

  if (dotsEl) {
    dotsEl.innerHTML = section.items.map(() => `<div class="sdot"></div>`).join('');
    bindScrollDots(el, dotsEl, CARD_WIDTH);
  }
  bindShelfArrows(
    el,
    document.getElementById('arr-left-deployed'),
    document.getElementById('arr-right-deployed'),
    CARD_WIDTH
  );
}

// Coming soon — list-generated
function renderComingSoon(section) {
  if (!section) return;
  setText('[data-c="inn-soon-label"]', section.rowLabel);
  setText('[data-c="inn-soon-title"]', section.rowTitle);

  const el     = document.getElementById('grid-soon');
  const dotsEl = document.getElementById('dots-soon');
  if (!el) return;

  const CARD_WIDTH = 236;

  el.innerHTML = section.items.map(item => `
    <div class="soon-card"
         style="cursor:pointer"
         data-title="${escAttr(item.title)}"
         data-description="${escAttr(item.body || item.description || '')}"
         data-image="${escAttr(mediaUrl(item.image))}"
         data-tag="Coming soon"
         onclick="openCardFromEl(this)">
      <div class="soon-art">
        <img src="${mediaUrl(item.image)}" alt="${escAttr(item.title)}" />
        <span class="soon-tag">Coming soon</span>
      </div>
      <div class="soon-text">
        <h5>${item.title}</h5>
        <p>${item.body}</p>
      </div>
    </div>`).join('');

  if (dotsEl) {
    dotsEl.innerHTML = section.items.map(() => `<div class="sdot"></div>`).join('');
    bindScrollDots(el, dotsEl, CARD_WIDTH);
  }
  bindShelfArrows(
    el,
    document.getElementById('arr-left-soon'),
    document.getElementById('arr-right-soon'),
    CARD_WIDTH
  );
}

// Innovation video shelf — list-generated, any number of videos supported
function renderInnovationVideos(section) {
  if (!section) return;
  setText('[data-c="inn-vid-label"]', section.rowLabel);
  setText('[data-c="inn-vid-title"]', section.rowTitle);
  setText('[data-c="inn-vid-note"]',  section.rowNote);

  const el     = document.getElementById('shelf-videos');
  const dotsEl = document.getElementById('dots-videos');
  if (!el) return;

  const CARD_WIDTH = 380;

  el.innerHTML = section.items.map((item, i) => `
    <div class="vid-card-lg" id="${item.id}">
      <video
        class="vid-video"
        poster="${mediaUrl(item.poster)}"
        preload="metadata"
        playsinline
        controls>
        <source src="${mediaUrl(item.src)}" type="video/mp4" />
      </video>
      <div class="vid-play-lg"></div>
      <div class="vid-meta-lg">
        <div class="tag">${item.tag}</div>
        <h6>${item.title}</h6>
      </div>
    </div>`).join('');

  if (dotsEl) {
    dotsEl.innerHTML = section.items.map(() => `<div class="sdot"></div>`).join('');
    bindScrollDots(el, dotsEl, CARD_WIDTH);
  }
  bindShelfArrows(
    el,
    document.getElementById('arr-left-videos'),
    document.getElementById('arr-right-videos'),
    CARD_WIDTH
  );
}