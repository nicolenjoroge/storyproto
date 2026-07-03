// ── SPOTLIGHT ─────────────────────────────────────────────────────────────────
import { setText } from './helpers.js';

// Render Spotlight section — testimonials, people
export function renderSpotlight(sp) {
  if (!sp) return;
  renderTestimonials(sp.testimonials);
  renderPeople(sp.people);
}

// Testimonial cards — list-generated, auto-scroll JS picks them up after contentReady
function renderTestimonials(t) {
  if (!t) return;
  setText('[data-c="sp-testi-label"]', t.actLabel);
  setText('[data-c="sp-testi-title"]', t.actTitle);
  setText('[data-c="sp-testi-desc"]',  t.actDesc);

  const el = document.getElementById('testiTrack-spotlight');
  if (!el || !t.items) return;
  el.innerHTML = t.items.map(item => `
    <div class="testi-card">
      <div class="testi-mark">"</div>
      <div class="testi-quote">${item.quote}</div>
      <div class="testi-person">
        <div class="testi-avatar"></div>
        <div>
          <div class="testi-name">${item.name}</div>
          <div class="testi-role">${item.role}</div>
        </div>
      </div>
    </div>`).join('');
}

// People — labels updated in place; data passed via global so spotlight JS
function renderPeople(pe) {
  if (!pe) return;
  setText('[data-c="sp-people-label"]', pe.actLabel);
  setText('[data-c="sp-people-title"]', pe.actTitle);
  setText('[data-c="sp-people-desc"]',  pe.actDesc);
  if (pe.items) window.__spotlightPeopleData = pe.items;
}

