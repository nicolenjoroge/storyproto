// ── UI INTERACTIONS ───────────────────────────────────────────────────────────
//UI/UX Controls - look and feel of the page

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL + SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════════════════

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * ease);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initSmoothScroll() {
  // Intercept all anchor clicks and apply smooth scroll
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 58;
    smoothScrollTo(offsetTop, 900);
  });
}

function initScrollReveal() {
  // Sections fade and slide up as they enter the viewport
  const revealTargets = document.querySelectorAll('.page-section');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        revealObserver.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.08 });

  revealTargets.forEach(el => revealObserver.observe(el));
}

// Global helper — inline HTML uses onclick="scrollToSection('...')"
export function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  // Pause all other videos first
  document.querySelectorAll('.vid-video').forEach(v => {
    if (v.closest('.vid-card-lg')?.id !== id) {
      v.pause();
    }
  });
  
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  section.classList.add('highlight-section', 'sparkle-active');
  setTimeout(() => {
    section.classList.remove('highlight-section', 'sparkle-active');
  }, 2000);
  // After scroll animation completes, find and play the video inside
  setTimeout(() => {
    const video = section.querySelector('video');
    if (video) {
      video.currentTime = 0;   // rewind to start
      video.play().catch(() => {
        // Autoplay blocked by browser — silently ignore
        // user can still click play manually
      });
    }
  }, 800);
}
window.scrollToSection = scrollToSection;

// ═══════════════════════════════════════════════════════════════════════════
// NAV HIGHLIGHT(Underline current section and Bold text)
// ═══════════════════════════════════════════════════════════════════════════

function initNavHighlight() {
  const links = document.querySelectorAll('.masternav-link');
  const targets = Array.from(links).map((a) =>
    document.getElementById(a.dataset.target),
  );

  function onScrollNav() {
    let activeIdx = 0;
    targets.forEach((t, i) => {
      if (t && t.getBoundingClientRect().top < window.innerHeight * 0.4) {
        activeIdx = i;
      }
    });
    links.forEach((a, i) => a.classList.toggle('active', i === activeIdx));
  }

  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL-POSITION DOT INDICATORS (shared by innovation shelves/grids)
// ═══════════════════════════════════════════════════════════════════════════

export function bindScrollDots(scrollEl, dotsEl, itemWidth) {
  if (!scrollEl || !dotsEl) return;

  function updateDots() {
    const dots = dotsEl.querySelectorAll('.sdot');
    const idx = Math.round(scrollEl.scrollLeft / itemWidth);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  dotsEl.querySelectorAll('.sdot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      scrollEl.scrollTo({ left: i * itemWidth, behavior: 'smooth' });
    });
  });

  scrollEl.addEventListener('scroll', updateDots, { passive: true });
  updateDots();
}
window.bindScrollDots = bindScrollDots;

export function bindShelfArrows(scrollEl, leftBtn, rightBtn, itemWidth) {
  if (!scrollEl || !leftBtn || !rightBtn) return;

  function update() {
    leftBtn.classList.toggle('is-hidden', scrollEl.scrollLeft <= 0);
    rightBtn.classList.toggle('is-hidden',
      scrollEl.scrollLeft >= scrollEl.scrollWidth - scrollEl.clientWidth - 4);
  }

  leftBtn.addEventListener('click', () => {
    scrollEl.scrollBy({ left: -itemWidth, behavior: 'smooth' });
  });
  rightBtn.addEventListener('click', () => {
    scrollEl.scrollBy({ left: itemWidth, behavior: 'smooth' });
  });

  scrollEl.addEventListener('scroll', update, { passive: true });
  update();
}
// ═══════════════════════════════════════════════════════════════════════════
// SPOTLIGHT: CONFETTI BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

function initSpotlightConfetti() {
  const canvas = document.getElementById('spotlight-confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLOURS = ['#f8e200', '#3ab3e5', '#9f197e', '#00a8a9', '#ffffff', '#e4032c'];
  const SHAPES = ['circle', 'rect', 'diamond', 'line'];

  let particles = [];
  let W, H, animId;

  function resize() {
    const section = document.getElementById('sec-spotlight');
    W = canvas.width = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function makeParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(-H, 0),
      size: randomBetween(3, 9),
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      speedY: randomBetween(0.4, 1.4),
      speedX: randomBetween(-0.4, 0.4),
      spin: randomBetween(-0.04, 0.04),
      angle: randomBetween(0, Math.PI * 2),
      opacity: randomBetween(0.55, 1),
      shimmer: randomBetween(0, Math.PI * 2),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 160 }, makeParticle).map(p => ({
      ...p,
      y: randomBetween(0, H),
    }));
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.colour;
    ctx.strokeStyle = p.colour;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    const shimmerAmt = (Math.sin(p.shimmer) + 1) / 2;
    ctx.shadowColor = p.colour;
    ctx.shadowBlur = 4 + shimmerAmt * 14;

    switch (p.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rect':
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, 0);
        ctx.lineTo(0, p.size / 2);
        ctx.lineTo(-p.size / 2, 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 'line':
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(p.size, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      drawParticle(p);
      p.y += p.speedY;
      p.x += p.speedX;
      p.angle += p.spin;
      p.shimmer += 0.03;

      if (p.y > H + 20) Object.assign(p, makeParticle(), { y: -20 });
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
    });

    animId = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!animId) tick();
      } else {
        cancelAnimationFrame(animId);
        animId = null;
      }
    });
  }, { threshold: 0.05 });

  window.addEventListener('resize', () => { resize(); });

  init();
  observer.observe(document.getElementById('sec-spotlight'));
}

// ═══════════════════════════════════════════════════════════════════════════
// REA STORY: STAGE PANEL SWITCHER
// ═══════════════════════════════════════════════════════════════════════════


function initReaStoryStage() {
  const track = document.getElementById('stageTrack-reastory');
  if (!track) return;

  const axPips = [
    document.getElementById('axPip0-reastory'),
    document.getElementById('axPip1-reastory'),
  ];
  const axPipsTop = [
    document.getElementById('axPip0Top-reastory'),
    document.getElementById('axPip1Top-reastory'),
  ];
  const axLabels = [
    document.getElementById('axLabel0-reastory'),
    document.getElementById('axLabel1-reastory'),
  ];
  const dots = [
    document.getElementById('dot0-reastory'),
    document.getElementById('dot1-reastory'),
  ];
  const leftArrow = document.getElementById('stageLeft-reastory');
  const rightArrow = document.getElementById('stageRight-reastory');

  let idx = 0;

  function render() {
    track.style.transform = `translateX(-${idx * 50}%)`;
    axPips.forEach((p, i) => p && p.classList.toggle('lit', i === idx));
    axPipsTop.forEach((p, i) => p && p.classList.toggle('lit', i === idx));
    axLabels.forEach((l, i) => l && l.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d && d.classList.toggle('active', i === idx));
    if (leftArrow) leftArrow.disabled = idx === 0;
    if (rightArrow) rightArrow.disabled = idx === 1;
  }

  function switchPanel(i) {
    idx = i;
    render();
  }
  window.switchPanel = switchPanel;

  if (leftArrow) leftArrow.addEventListener('click', () => switchPanel(0));
  if (rightArrow) rightArrow.addEventListener('click', () => switchPanel(1));
  dots.forEach((d, i) => d && d.addEventListener('click', () => switchPanel(i)));

  render();
}

// ═══════════════════════════════════════════════════════════════════════════
// LANDING: PARALLAX SHARDS + VIDEO SLIDER
// ═══════════════════════════════════════════════════════════════════════════

function initLandingParallax() {
  const shards = document.querySelectorAll('.depth-shard');
  const sections = [
    'hero-landing',
    'initiative-landing',
    'video-landing',
    'resolution-landing',
  ].map((id) => document.getElementById(id));
  const markers = document.querySelectorAll('.pf-shard');

  function onScroll() {
    const y = window.scrollY;
    shards.forEach((s) => {
      const speed = parseFloat(s.dataset.speed);
      s.style.transform = `translateY(${y * speed}px)`;
    });
    let activeIdx = 0;
    sections.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.5) {
        activeIdx = i;
      }
    });
    markers.forEach((m, i) => m.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  markers.forEach((m) => {
    m.addEventListener('click', () => {
      const target = document.getElementById(m.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
    m.style.cursor = 'pointer';
  });
}

function initLandingVideoSlider() {
  let slideIndex = 0;
  const totalSlides = 2;

  function updateSlider() {
    const track = document.getElementById('videoTrack-landing');
    if (!track) return;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    document
      .querySelectorAll('.vdot')
      .forEach((d, i) => d.classList.toggle('active', i === slideIndex));
  }

  function moveSlide(dir) {
    slideIndex = (slideIndex + dir + totalSlides) % totalSlides;
    updateSlider();
  }

  function goToSlide(i) {
    slideIndex = i;
    updateSlider();
  }

  // Inline HTML calls these by name
  window.moveSlide_landing = moveSlide;
  window.goToSlide_landing = goToSlide;
}

// ═══════════════════════════════════════════════════════════════════════════
// INNOVATION: VIDEO ZOOM ON SCROLL + PARALLAX SHARDS
// ═══════════════════════════════════════════════════════════════════════════

function initInnovationVideoZoom() {
  const vzInner = document.getElementById('videoZoomInner-innovation');
  const vzSpacer = document.getElementById('vids-innovation');
  if (!vzInner || !vzSpacer) return;

  function onVideoZoomScroll() {
    const rect = vzSpacer.getBoundingClientRect();
    const vh = window.innerHeight;
    let progress = (vh - rect.top) / (vh * 0.9);
    progress = Math.max(0, Math.min(1, progress));
    const scale = 0.86 + progress * 0.14;
    const opacity = 0.5 + progress * 0.5;
    vzInner.style.transform = `scale(${scale})`;
    vzInner.style.opacity = opacity;
  }
  window.addEventListener('scroll', onVideoZoomScroll, { passive: true });
  window.addEventListener('resize', onVideoZoomScroll);
  onVideoZoomScroll();
}

function initInnovationParallax() {
  const shards = document.querySelectorAll('.depth-shard');
  const sections = [
    'top-innovation',
    'deployed-innovation',
    'soon-innovation',
    'vids-innovation',
  ].map((id) => document.getElementById(id));
  const markers = document.querySelectorAll('.pf-shard');

  function onScroll() {
    const y = window.scrollY;
    shards.forEach((s) => {
      const speed = parseFloat(s.dataset.speed);
      s.style.transform = `translateY(${y * speed}px)`;
    });
    let activeIdx = 0;
    sections.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.5) {
        activeIdx = i;
      }
    });
    markers.forEach((m, i) => m.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  markers.forEach((m) => {
    m.addEventListener('click', () => {
      const target = document.getElementById(m.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SPOTLIGHT: ACT NAVIGATION, TESTIMONIAL AUTO-SCROLL, PEOPLE CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

function initSpotlightActNav() {
  const acts = document.querySelectorAll('.sl-act');
  const dots = document.querySelectorAll('.sl-vert-dot');
  const btnUp = document.getElementById('actUp-spotlight');
  const btnDown = document.getElementById('actDown-spotlight');
  if (!btnUp || !btnDown) return;

  let currentAct = 0;
  const totalActs = acts.length;

  function showAct(idx) {
    currentAct = Math.max(0, Math.min(totalActs - 1, idx));
    acts.forEach((a) =>
      a.classList.toggle('active', parseInt(a.dataset.act) === currentAct),
    );
    dots.forEach((d) =>
      d.classList.toggle('active', parseInt(d.dataset.act) === currentAct),
    );
    btnUp.disabled = currentAct === 0;
    btnDown.disabled = currentAct === totalActs - 1;
  }

  btnUp.addEventListener('click', () => showAct(currentAct - 1));
  btnDown.addEventListener('click', () => showAct(currentAct + 1));
  dots.forEach((d) =>
    d.addEventListener('click', () => showAct(parseInt(d.dataset.act))),
  );
  showAct(0);
}

function initSpotlightTestimonials() {
  const testiViewport = document.getElementById('testiViewport-spotlight');
  const testiTrack = document.getElementById('testiTrack-spotlight');
  if (!testiViewport || !testiTrack) return;

  let testiOffset = 0;
  let testiPaused = false;

  function testiStep() {
    if (!testiPaused) {
      testiOffset -= 1;
      const maxOffset = -(testiTrack.scrollHeight - testiViewport.clientHeight);
      if (testiOffset < maxOffset) testiOffset = 0;
      testiTrack.style.transform = `translateY(${testiOffset}px)`;
    }
    requestAnimationFrame(testiStep);
  }

  testiViewport.addEventListener('mouseenter', () => (testiPaused = true));
  testiViewport.addEventListener('mouseleave', () => (testiPaused = false));
  requestAnimationFrame(testiStep);
}


const FALLBACK_PEOPLE_DATA = [
  { name: 'Team member', contribution: 'Submitted the idea behind Document Approval', tag: 'Submitter' },
  { name: 'Team member', contribution: 'Built the Etims invoice automation', tag: 'Builder' },
  { name: 'Team member', contribution: 'Champion for AI Credit Memo across teams', tag: 'Champion' },
  { name: 'Team member', contribution: 'First to pilot the FX Pre Trade checks', tag: 'Pilot' },
];

function initSpotlightPeople() {
  const peopleName = document.getElementById('peopleName-spotlight');
  const peopleContribution = document.getElementById('peopleContribution-spotlight');
  const peopleTag = document.getElementById('peopleTag-spotlight');
  const peopleCounter = document.getElementById('peopleCounter-spotlight');
  const peopleCard = document.getElementById('peopleCard-spotlight');
  const leftBtn = document.getElementById('peopleLeft-spotlight');
  const rightBtn = document.getElementById('peopleRight-spotlight');
  if (!peopleCard || !leftBtn || !rightBtn) return;

  const peopleData = window.__spotlightPeopleData || FALLBACK_PEOPLE_DATA;
  let peopleIdx = 0;

  function renderPerson() {
    peopleCard.style.opacity = 0;
    setTimeout(() => {
      const p = peopleData[peopleIdx];
      peopleName.textContent = p.name;
      peopleContribution.textContent = p.contribution;
      peopleTag.textContent = p.tag;
      peopleCounter.textContent = `${peopleIdx + 1} / ${peopleData.length}`;
      peopleCard.style.opacity = 1;
    }, 150);
  }

  leftBtn.addEventListener('click', () => {
    peopleIdx = (peopleIdx - 1 + peopleData.length) % peopleData.length;
    renderPerson();
  });
  rightBtn.addEventListener('click', () => {
    peopleIdx = (peopleIdx + 1) % peopleData.length;
    renderPerson();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD MODAL (open/close, driven by inline onclick="openCardFromEl(this)")
// ═══════════════════════════════════════════════════════════════════════════

export function openCardModal({ tag, title, description, image }) {
  document.getElementById('cardModalTag').textContent   = tag || '';
  document.getElementById('cardModalTitle').textContent = title || '';
  document.getElementById('cardModalDesc').textContent  = description || 'More details coming soon.';
  // document.getElementById('cardModalImage').src = image || '';

  document.getElementById('cardModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCardModal() {
  document.getElementById('cardModal').classList.remove('open');
  document.body.style.overflow = '';
}

export function openCardFromEl(el) {
  const stats = el.dataset.stats ? JSON.parse(el.dataset.stats) : [];
  openCardModal({
    tag:         el.dataset.tag,
    title:       el.dataset.title,
    description: el.dataset.description,
    image:       el.dataset.image,
    stats
  });
}

function initCardModal() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCardModal();
  });
}

window.openCardModal  = openCardModal;
window.closeCardModal = closeCardModal;
window.openCardFromEl = openCardFromEl;

// ═══════════════════════════════════════════════════════════════════════════
// VIDEO PLAY BUTTONS (innovation video cards)
// ═══════════════════════════════════════════════════════════════════════════
// Content is rendered async by content-loader.js, so this listens for the
// 'contentReady' event rather than assuming cards already exist in the DOM.

function initVideoPlayButtons() {
  document.addEventListener('contentReady', function () {
    document.querySelectorAll('.vid-card-lg').forEach(function (card) {
      const video = card.querySelector('.vid-video');
      const playBtn = card.querySelector('.vid-play-lg');
      if (!video || !playBtn) return;
      playBtn.addEventListener('click', function () {
        video.controls = true;
        video.play();
        playBtn.style.display = 'none';
      });
      video.addEventListener('pause', function () {
        if (video.currentTime > 0 && !video.ended) playBtn.style.display = 'flex';
      });
      video.addEventListener('ended', function () {
        playBtn.style.display = 'flex';
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY POINT — call once on DOMContentLoaded
// ═══════════════════════════════════════════════════════════════════════════

export function initUIInteractions() {
  initSmoothScroll();
  initScrollReveal();
  initNavHighlight();
  initSpotlightConfetti();
  initReaStoryStage();
  initLandingParallax();
  initLandingVideoSlider();
  initInnovationVideoZoom();
  initInnovationParallax();
  initSpotlightActNav();
  initSpotlightTestimonials();
  initSpotlightPeople();
  initCardModal();
  initVideoPlayButtons(); // safe to call before content loads — listens for 'contentReady'
}
