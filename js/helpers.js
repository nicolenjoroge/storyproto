// ── HELPERS ───────────────────────────────────────────────────────────────────
// import { CONTENT_BASE_URL} from './env.js';
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
  return `${CONTENT_BASE}/${path}`;
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
