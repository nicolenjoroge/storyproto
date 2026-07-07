// ── REA STORY ─────────────────────────────────────────────────────────────────
import { setText, setAttr, mediaUrl } from './helpers.js';

//Render the REA Story section
export function renderReaStory(story) {
  if (!story) return;
  const { rea, bpm } = story;

  setText('[data-c="rea-tag"]',     rea.tag);
  setText('[data-c="rea-heading"]', rea.heading);
  setText('[data-c="rea-body"]',    rea.body);

  // Video needs load() after src change
  const source = document.querySelector('[data-c="rea-video-src"]');
  if (source && rea.video) {
    source.src = mediaUrl(rea.video);
    source.closest('video')?.load();
  }

  setText('[data-c="bpm-tag"]',     bpm.tag);
  setText('[data-c="bpm-heading"]', bpm.heading);
  setText('[data-c="bpm-body"]',    bpm.body);
  setAttr('[data-c="bpm-image"]', 'src', mediaUrl(bpm.image));
}