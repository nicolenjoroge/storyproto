// ── HELPERS ───────────────────────────────────────────────────────────────────
//Update the Content URL base path (from local to production) for fetching JSON content
export const CONTENT_BASE = window.CONTENT_BASE_URL || '';

//Update text for the elements with (data-c="...") attribute selector, if the value is not null/undefined
export function setText(selector, value) {
  if (value == null) return;
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

//Add attribute
export function setAttr(selector, attr, value) {
  if (value == null) return;
  const el = document.querySelector(selector);
  if (el) el[attr] = value;
}

//Set a media URL path, prepending the CONTENT_BASE path to the relative path
export function mediaUrl(path) {
  const url = `${CONTENT_BASE}/${path}`;
  return url;
}

// Escapes a string for safe use inside an HTML attribute value
export function escAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Add to helpers.js
export function elById(id)      { return document.getElementById(id); }
export function setById(id, t)  { const e = elById(id); if (e) e.textContent = t; }
export function unskel(id)      { const e = elById(id); if (e) e.classList.remove('skel'); }

// Prevent XSS

export function safeHtml(html) {
  if (typeof DOMPurify === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'img', 'video', 'source', 'ul', 'li', 'strong', 'em', 'br'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'href', 'src', 'alt', 'poster', 'type',
      'data-title', 'data-description', 'data-image', 'data-tag',
      'data-stats', 'data-slide', 'data-c', 'onclick',
      'style', 'controls', 'playsinline', 'preload', 'autoplay', 'muted', 'loop'
    ]
  });
}
