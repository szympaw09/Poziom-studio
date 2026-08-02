// =========================================================
// POZIOM STUDIO — interactions
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Before / After slider ---------- */
  const ba = document.getElementById('baSlider');
  if (ba) {
    const handle = ba.querySelector('.ba-handle');
    let dragging = false;

    const setPos = (clientX) => {
      const rect = ba.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      ba.style.setProperty('--pos', pct + '%');
      handle.style.left = pct + '%';
    };

    const start = (e) => {
      dragging = true;
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const move = (e) => {
      if (!dragging) return;
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const end = () => { dragging = false; };

    ba.addEventListener('mousedown', start);
    ba.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    ba.addEventListener('click', (e) => setPos(e.clientX));

    ba.setAttribute('tabindex', '0');
    ba.setAttribute('role', 'slider');
    ba.setAttribute('aria-label', 'Suwak porównania przed i po zabiegu');
    ba.addEventListener('keydown', (e) => {
      const current = parseFloat(getComputedStyle(ba).getPropertyValue('--pos')) || 50;
      const rect = ba.getBoundingClientRect();
      if (e.key === 'ArrowLeft') setPos(rect.left + (rect.width * (current - 5) / 100));
      if (e.key === 'ArrowRight') setPos(rect.left + (rect.width * (current + 5) / 100));
    });

    ba.resetPos = () => {
      ba.style.setProperty('--pos', '50%');
      handle.style.left = '50%';
    };
  }

  /* ---------- Wybór auta do porównania ---------- */
  const frostCarSelect = document.getElementById('frostCarSelect');
  if (frostCarSelect && ba) {
    const FROST_CARS = {
      bentley: {
        after:   'frost-after.jpg',
        before:  'frost-before.jpg',
        caption: 'Bentley Bentayga — zmiana wykończenia lakieru z połysku na mat (frost), zabieg w pełni odwracalny.'
      },
      lexus: {
        after:   'frost-lexus-after.jpg',
        before:  'frost-lexus-before.jpg',
        caption: 'Lexus LC 500 Cabrio — zmiana wykończenia lakieru z połysku na mat (frost), zabieg w pełni odwracalny.'
      },
      bmw: {
        after:   'frost-bmw-after.jpg',
        before:  'frost-bmw-before.jpg',
        caption: 'BMW X7 — zmiana wykończenia lakieru z połysku na mat (frost), zabieg w pełni odwracalny.'
      },
      mercedes: {
        after:   'mercedes-after.jpg',
        before:  'mercedes-before.jpg',
        caption: 'Mercedes-AMG CLA 45 — zmiana koloru lakieru z czarnego połysku na głęboki mat w odcieniu Military Green, zabieg w pełni odwracalny.'
      }
    };

    const afterImg  = document.getElementById('baAfterImg');
    const beforeImg = document.getElementById('baBeforeImg');
    const caption   = document.getElementById('frostCaption');
    const carChips  = Array.from(frostCarSelect.querySelectorAll('.chip'));

    carChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const car = FROST_CARS[chip.dataset.car];
        if (!car) return;
        carChips.forEach(c => c.classList.toggle('active', c === chip));
        afterImg.src  = car.after;
        beforeImg.src = car.before;
        caption.textContent = car.caption;
        if (ba.resetPos) ba.resetPos();
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose   = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Contact form ---------- */
  const form     = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.name.value.trim();
      const contact = form.contact.value.trim();
      const car     = form.car.value.trim();
      const message = form.message.value.trim();

      const subject = encodeURIComponent(`Zapytanie ze strony — ${name}`);
      const body    = encodeURIComponent(
        `Imię i nazwisko: ${name}\nKontakt: ${contact}\nAuto: ${car || '—'}\n\nWiadomość:\n${message}`
      );
      window.location.href = `mailto:kontakt@poziom-studio.pl?subject=${subject}&body=${body}`;

      formNote.textContent = 'Otworzyliśmy program pocztowy z gotową wiadomością — wystarczy ją wysłać.';
      formNote.classList.add('success');
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- QUIZ ---------- */
  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    const steps      = Array.from(quizCard.querySelectorAll('.quiz-step'));
    const dots       = Array.from(quizCard.querySelectorAll('.quiz-progress .dot'));
    const result     = document.getElementById('quizResult');
    const resultTitle = document.getElementById('quizResultTitle');
    const resultDesc  = document.getElementById('quizResultDesc');
    const resultLink  = document.getElementById('quizResultLink');
    const restartBtn  = document.getElementById('quizRestart');

    const SERVICE_INFO = {
      ppf: {
        title: 'Folie ochronne PPF',
        desc:  'Przy Twoim stylu jeżdżenia priorytetem jest ochrona przed odpryskami i rysami — folia PPF to najlepsza inwestycja w trwały wygląd lakieru.'
      },
      detailing: {
        title: 'Detailing',
        desc:  'Najbardziej zależy Ci na czystości i pielęgnacji — pełny detailing wnętrza i karoserii odświeży auto od podstaw.'
      },
      rysy: {
        title: 'Usuwanie rys',
        desc:  'Korekta lakieru zredukuje mikrorysy i przywróci głębię koloru — idealne rozwiązanie dla auta w tym wieku.'
      },
      renowacja: {
        title: 'Renowacja i polerowanie',
        desc:  'Twój lakier zasługuje na pełną renowację — wielostopniowe polerowanie przywróci mu fabryczny, a czasem lepszy niż fabryczny, wygląd.'
      },
      mrozenie: {
        title: 'Mrożenie lakieru',
        desc:  'Skoro zależy Ci na wyróżniającym się wyglądzie na zlotach i wyjazdach — mrożenie da Twojemu autu głęboki, satynowy charakter.'
      }
    };

    let currentStep = 0;
    const tally = { ppf: 0, detailing: 0, rysy: 0, renowacja: 0, mrozenie: 0 };

    const showStep = (i) => {
      steps.forEach((s, idx) => { s.hidden = idx !== i; });
      dots.forEach((d, idx) => d.classList.toggle('active', idx <= i));
    };

    const showResult = () => {
      let best = 'ppf', bestScore = -1;
      Object.keys(tally).forEach(key => {
        if (tally[key] > bestScore) { bestScore = tally[key]; best = key; }
      });
      const info = SERVICE_INFO[best];
      resultTitle.textContent = info.title;
      resultDesc.textContent  = info.desc;
      resultLink.setAttribute('href', '#realizacje');
      quizCard.querySelector('.quiz-progress').hidden = true;
      steps.forEach(s => { s.hidden = true; });
      result.hidden = false;
    };

    quizCard.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-service]');
      if (!btn) return;
      tally[btn.dataset.service] += 1;
      if (currentStep < steps.length - 1) {
        currentStep += 1;
        showStep(currentStep);
      } else {
        showResult();
      }
    });

    restartBtn.addEventListener('click', () => {
      Object.keys(tally).forEach(k => { tally[k] = 0; });
      currentStep = 0;
      result.hidden = true;
      quizCard.querySelector('.quiz-progress').hidden = false;
      showStep(0);
    });
  }

  /* ---------- KALKULATOR PPF — nowy SVG ---------- */
  const calcBlock = document.getElementById('kalkulator');
  if (calcBlock) {
    const SEGMENTS = {
      kompakt: { label: 'Kompakt',       sensitive: 700,  front: 1800, fullfront: 3400, fullbody: 8500,  frost: 4500 },
      sedan:   { label: 'Sedan / Kombi', sensitive: 800,  front: 2100, fullfront: 3900, fullbody: 9800,  frost: 5200 },
      suv:     { label: 'SUV',           sensitive: 950,  front: 2600, fullfront: 4600, fullbody: 12500, frost: 6500 },
    };
    const ZONE_LABELS = {
      sensitive: 'Elementy newralgiczne',
      front:     'Front',
      fullfront:  'Full Front',
      fullbody:  'Full Body'
    };

    // Mapowanie zakresów na strefy SVG (data-zone w HTML)
    const ZONE_MAP = {
      sensitive: ['s-headlight-l','s-headlight-r','s-handle-l','s-handle-r','s-pillar-l','s-pillar-r','s-trunk-lip'],
      front:     ['front-bumper','hood'],
      fullfront: ['front-bumper','hood','fender-fl','fender-fr','mirror-l','mirror-r','roof-front',
                  's-headlight-l','s-headlight-r','s-handle-l','s-handle-r','s-pillar-l','s-pillar-r','s-trunk-lip'],
      fullbody:  ['front-bumper','hood','fender-fl','fender-fr','mirror-l','mirror-r',
                  'roof-front','roof-rear','door-l','door-r','fender-rl','fender-rr','rear-bumper',
                  's-headlight-l','s-headlight-r','s-handle-l','s-handle-r','s-pillar-l','s-pillar-r','s-trunk-lip']
    };

    const segmentChips = Array.from(document.querySelectorAll('#segmentChips .chip'));
    const zoneChips    = Array.from(document.querySelectorAll('#zoneChips .chip'));
    const frostChip    = document.getElementById('frostChip');
    const frostHint    = document.getElementById('frostHint');
    const priceEl      = document.getElementById('calcPrice');
    const calcCta      = document.getElementById('calcCta');
    const allSvgZones  = Array.from(document.querySelectorAll('#carDiagram .zone'));

    let segment = null;
    const selectedZones = new Set();
    let frost = false;

    const money = (n) => n.toLocaleString('pl-PL') + ' zł';
    const isFull = () => selectedZones.has('fullbody');

    const updateVisual = () => {
      // wyłącz wszystkie
      allSvgZones.forEach(z => z.classList.remove('active'));

      let activePackage = null;
      if (isFull()) {
        activePackage = 'fullbody';
      } else if (selectedZones.has('fullfront')) {
        activePackage = 'fullfront';
      } else if (selectedZones.has('front')) {
        activePackage = 'front';
      } else if (selectedZones.has('sensitive')) {
        activePackage = 'sensitive';
      }

      if (activePackage) {
        const zonesToLight = ZONE_MAP[activePackage] || [];
        zonesToLight.forEach(zoneId => {
          const el = document.querySelector(`#carDiagram [data-zone="${zoneId}"]`);
          if (el) el.classList.add('active');
        });
      }
    };

    const updateChips = () => {
      segmentChips.forEach(c => c.classList.toggle('active', c.dataset.segment === segment));
      const fullOn = isFull();
      zoneChips.forEach(c => {
        if (c.dataset.zone === 'fullbody') {
          c.classList.toggle('active', fullOn);
        } else {
          c.classList.toggle('active', !fullOn && selectedZones.has(c.dataset.zone));
        }
      });
      frostChip.classList.toggle('active', frost);
      frostHint.hidden = !frost;
    };

    const updatePrice = () => {
      if (!segment) { priceEl.textContent = 'wybierz segment i zakres'; return; }
      const s = SEGMENTS[segment];
      let base = 0;
      if (isFull()) {
        base = s.fullbody;
      } else if (selectedZones.size > 0) {
        selectedZones.forEach(z => { base += s[z] || 0; });
      } else {
        priceEl.textContent = 'wybierz zakres ochrony';
        return;
      }
      if (frost) base += s.frost;
      const low  = Math.round(base / 50) * 50;
      const high = Math.round((base * 1.15) / 50) * 50;
      priceEl.textContent = `${money(low)} – ${money(high)}`;
    };

    const update = () => { updateChips(); updateVisual(); updatePrice(); };

    segmentChips.forEach(chip => {
      chip.addEventListener('click', () => {
        segment = chip.dataset.segment;
        update();
      });
    });

    zoneChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const zone = chip.dataset.zone;
        if (zone === 'fullbody') {
          if (isFull()) { selectedZones.delete('fullbody'); }
          else { selectedZones.clear(); selectedZones.add('fullbody'); }
        } else {
          selectedZones.delete('fullbody');
          if (selectedZones.has(zone)) selectedZones.delete(zone);
          else { selectedZones.clear(); selectedZones.add(zone); }
        }
        update();
      });
    });

    frostChip.addEventListener('click', () => {
      frost = !frost;
      if (frost) { selectedZones.clear(); selectedZones.add('fullbody'); }
      update();
    });

    calcCta.addEventListener('click', () => {
      const kontakt = document.getElementById('kontakt');
      const msgEl   = document.getElementById('f-msg');
      const carEl   = document.getElementById('f-car');
      if (segment && msgEl) {
        const s = SEGMENTS[segment];
        const zoneList = isFull()
          ? ['Full Body']
          : Array.from(selectedZones).map(z => ZONE_LABELS[z]);
        if (frost) zoneList.push('Mrożenie lakieru');
        const summary = `Interesuje mnie wycena PPF.\nSegment: ${s.label}\nZakres: ${zoneList.join(', ') || '—'}\nOrientacyjna wycena ze strony: ${priceEl.textContent}`;
        if (!msgEl.value.trim()) msgEl.value = summary;
        if (carEl && !carEl.value.trim()) carEl.value = s.label;
      }
      if (kontakt) kontakt.scrollIntoView({ behavior: 'smooth' });
    });

    update();
  }

  /* ---------- SYMULATOR SAMOREGENERACJI PPF ---------- */
  const healBtn      = document.getElementById('healBtn');
  const healScratches = document.getElementById('healScratches');
  const healWave     = document.getElementById('healWave');

  if (healBtn && healScratches && healWave) {
    let healed = false;
    let animating = false;

    healBtn.addEventListener('click', () => {
      if (animating) return;

      if (healed) {
        // reset
        healScratches.classList.remove('healed');
        healWave.classList.remove('animating');
        // force reflow
        void healWave.offsetWidth;
        healBtn.textContent = '🔥 Aktywuj samoregenerację';
        healed = false;
        return;
      }

      animating = true;
      healBtn.disabled = true;

      // uruchom falę
      healWave.classList.add('animating');

      // w połowie animacji fali — znikają rysy
      setTimeout(() => {
        healScratches.classList.add('healed');
      }, 900);

      // koniec animacji
      setTimeout(() => {
        healWave.classList.remove('animating');
        void healWave.offsetWidth; // reset
        healBtn.textContent = '↩ Zresetuj panel';
        healBtn.disabled = false;
        animating = false;
        healed = true;
      }, 2000);
    });
  }

  /* ---------- INTERAKTYWNA LUPA ---------- */
  const loupeWrap = document.getElementById('loupeWrap');
  const loupeEl   = document.getElementById('loupe');
  const loupeImg  = document.getElementById('loupeImg');

  if (loupeWrap && loupeEl && loupeImg) {
    const ZOOM = 2.8;
    let loupeSize = 150;

    const updateLoupeSize = () => {
      loupeSize = window.innerWidth <= 560 ? 110 : 150;
    };
    updateLoupeSize();
    window.addEventListener('resize', updateLoupeSize, { passive: true });

    const moveLoupe = (x, y) => {
      const rect    = loupeWrap.getBoundingClientRect();
      const imgW    = loupeImg.naturalWidth  || loupeImg.offsetWidth;
      const imgH    = loupeImg.naturalHeight || loupeImg.offsetHeight;
      const dispW   = loupeWrap.offsetWidth;
      const dispH   = loupeWrap.offsetHeight;

      // pozycja lupy (wyśrodkowana na kursorze)
      loupeEl.style.left = x + 'px';
      loupeEl.style.top  = y + 'px';
      loupeEl.style.width  = loupeSize + 'px';
      loupeEl.style.height = loupeSize + 'px';

      // oblicz powiększony background
      const bgW = dispW * ZOOM;
      const bgH = dispH * ZOOM;
      const bgX = x * ZOOM - loupeSize / 2;
      const bgY = y * ZOOM - loupeSize / 2;

      loupeEl.style.backgroundImage    = `url(${loupeImg.src})`;
      loupeEl.style.backgroundSize     = `${bgW}px ${bgH}px`;
      loupeEl.style.backgroundPosition = `-${bgX}px -${bgY}px`;
    };

    // Mouse
    loupeWrap.addEventListener('mouseenter', () => {
      loupeEl.classList.add('visible');
    });
    loupeWrap.addEventListener('mouseleave', () => {
      loupeEl.classList.remove('visible');
    });
    loupeWrap.addEventListener('mousemove', (e) => {
      const rect = loupeWrap.getBoundingClientRect();
      moveLoupe(e.clientX - rect.left, e.clientY - rect.top);
    });

    // Touch
    loupeWrap.addEventListener('touchstart', (e) => {
      e.preventDefault();
      loupeWrap.classList.add('touch-active');
      loupeEl.classList.add('visible');
      const rect  = loupeWrap.getBoundingClientRect();
      const touch = e.touches[0];
      moveLoupe(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    loupeWrap.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect  = loupeWrap.getBoundingClientRect();
      const touch = e.touches[0];
      moveLoupe(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    loupeWrap.addEventListener('touchend', () => {
      loupeEl.classList.remove('visible');
      loupeWrap.classList.remove('touch-active');
    });
  }

  /* ---------- Przycisk szybkiego kontaktu ---------- */
  const quickContact = document.getElementById('quickContact');
  const quickToggle  = document.getElementById('quickToggle');
  if (quickContact && quickToggle) {
    quickToggle.addEventListener('click', () => {
      const open = quickContact.classList.toggle('open');
      quickToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!quickContact.contains(e.target)) {
        quickContact.classList.remove('open');
        quickToggle.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        quickContact.classList.remove('open');
        quickToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

});
