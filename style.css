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
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
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

    // click anywhere on the strip to jump
    ba.addEventListener('click', (e) => setPos(e.clientX));

    // keyboard support
    ba.setAttribute('tabindex', '0');
    ba.setAttribute('role', 'slider');
    ba.setAttribute('aria-label', 'Suwak porównania przed i po mrożeniu lakieru');
    ba.addEventListener('keydown', (e) => {
      const current = parseFloat(getComputedStyle(ba).getPropertyValue('--pos')) || 50;
      const rect = ba.getBoundingClientRect();
      if (e.key === 'ArrowLeft') setPos(rect.left + (rect.width * (current - 5) / 100));
      if (e.key === 'ArrowRight') setPos(rect.left + (rect.width * (current + 5) / 100));
    });

    // reset to center helper (used when switching cars)
    ba.resetPos = () => {
      ba.style.setProperty('--pos', '50%');
      handle.style.left = '50%';
    };
  }

  /* ---------- Samoregeneracja PPF ---------- */
  const healBtn = document.getElementById('healBtn');
  const healPanel = document.getElementById('healPanel');
  if (healBtn && healPanel) {
    let healed = false;
    healBtn.addEventListener('click', () => {
      if (!healed) {
        healPanel.classList.add('healing');
        healPanel.classList.add('healed');
        healed = true;
        healBtn.textContent = 'Zresetuj panel';
      } else {
        healPanel.classList.remove('healing');
        healPanel.classList.remove('healed');
        healed = false;
        healBtn.textContent = '🔥 Aktywuj samoregenerację (Użyj ciepła)';
        // wymuś reflow, aby animacja mogła wystartować od nowa przy kolejnym kliknięciu
        void healPanel.offsetWidth;
      }
    });
  }

  /* ---------- Interaktywna lupa ---------- */
  const loupeWrap = document.getElementById('loupeWrap');
  if (loupeWrap) {
    const loupeImg = document.getElementById('loupeImg');
    const loupeGlass = document.getElementById('loupeGlass');
    const ZOOM = 2.5;

    const positionGlass = (clientX, clientY) => {
      const rect = loupeWrap.getBoundingClientRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      const glassSize = loupeGlass.offsetWidth;
      loupeGlass.style.left = (x - glassSize / 2) + 'px';
      loupeGlass.style.top = (y - glassSize / 2) + 'px';
      loupeGlass.style.backgroundImage = `url(${loupeImg.currentSrc || loupeImg.src})`;
      loupeGlass.style.backgroundSize = (rect.width * ZOOM) + 'px ' + (rect.height * ZOOM) + 'px';
      loupeGlass.style.backgroundPosition = `-${x * ZOOM - glassSize / 2}px -${y * ZOOM - glassSize / 2}px`;
    };

    loupeWrap.addEventListener('mouseenter', () => loupeWrap.classList.add('active'));
    loupeWrap.addEventListener('mouseleave', () => loupeWrap.classList.remove('active'));
    loupeWrap.addEventListener('mousemove', (e) => positionGlass(e.clientX, e.clientY));

    loupeWrap.addEventListener('touchstart', (e) => {
      loupeWrap.classList.add('active');
      const t = e.touches[0];
      if (t) positionGlass(t.clientX, t.clientY);
    }, { passive: true });
    loupeWrap.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) positionGlass(t.clientX, t.clientY);
    }, { passive: true });
    loupeWrap.addEventListener('touchend', () => loupeWrap.classList.remove('active'));

    const loupeMobileBtn = document.getElementById('loupeMobileBtn');
    if (loupeMobileBtn) {
      loupeMobileBtn.addEventListener('click', () => {
        const isActive = loupeWrap.classList.toggle('active');
        if (isActive) {
          const rect = loupeWrap.getBoundingClientRect();
          positionGlass(rect.left + rect.width / 2, rect.top + rect.height / 2);
          loupeMobileBtn.textContent = 'Zmniejsz';
        } else {
          loupeMobileBtn.textContent = 'Powiększ detale';
        }
      });
    }
  }

  /* ---------- FAQ akordeon ---------- */
  const faqList = document.getElementById('faqList');
  if (faqList) {
    const questions = Array.from(faqList.querySelectorAll('.faq-question'));
    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = document.getElementById(btn.getAttribute('aria-controls'));
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        // zamknij pozostałe (akordeon - jedno pytanie na raz)
        questions.forEach(other => {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
            if (otherAnswer) otherAnswer.hidden = true;
          }
        });
        btn.setAttribute('aria-expanded', String(!isOpen));
        if (answer) answer.hidden = isOpen;
      });
    });
  }

  /* ---------- Wybór auta do porównania mrożenia ---------- */
  const frostCarSelect = document.getElementById('frostCarSelect');
  if (frostCarSelect && ba) {
    // EDYTUJ TU: pliki i opisy dla każdego auta w porównaniu mrożenia
    const FROST_CARS = {
      bentley: {
        after: 'frost-after.jpg',
        before: 'frost-before.jpg',
        caption: 'Bentley Bentayga — zmiana wykończenia lakieru z połysku na mat (frost), zabieg w pełni odwracalny.'
      },
      lexus: {
        after: 'frost-lexus-after.jpg',
        before: 'frost-lexus-before.jpg',
        caption: 'Lexus LC 500 Cabrio — zmiana wykończenia lakieru z połysku na mat (frost), zabieg w pełni odwracalny.'
      },
      bmw: {
        after: 'frost-bmw-after.jpg',
        before: 'frost-bmw-before.jpg',
        caption: 'BMW X7 — zmiana wykończenia lakieru z połysku na mat (frost), zabieg w pełni odwracalny.'
      },
      mercedes: {
        after: 'frost-mercedes-after.jpg',
        before: 'frost-mercedes-before.jpg',
        caption: 'Mercedes CLA — zmiana koloru nadwozia folią, bez lakierowania i w pełni odwracalnie.'
      },
      defender: {
        after: 'frost-defender-after.jpg',
        before: 'frost-defender-before.jpg',
        caption: 'Land Rover Defender — folia bezbarwna PPF. Efekt celowo niewidoczny: folia chroni lakier, nie zmieniając wyglądu auta.'
      }
    };

    const afterImg = document.getElementById('baAfterImg');
    const beforeImg = document.getElementById('baBeforeImg');
    const caption = document.getElementById('frostCaption');
    const carChips = Array.from(frostCarSelect.querySelectorAll('.chip'));

    carChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const car = FROST_CARS[chip.dataset.car];
        if (!car) return;
        carChips.forEach(c => c.classList.toggle('active', c === chip));
        afterImg.src = car.after;
        beforeImg.src = car.before;
        caption.textContent = car.caption;
        if (ba.resetPos) ba.resetPos();
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

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

  /* ---------- Contact form (Web3Forms — wysyłka bez przeładowania strony) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = document.getElementById('contactSubmitBtn');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // prosty honeypot antyspamowy — jeśli wypełniony, to bot
      if (form.botcheck && form.botcheck.value) return;

      const accessKey = form.access_key ? form.access_key.value : '';
      const name = form.name.value.trim();
      const contact = form.contact.value.trim();
      const car = form.car.value.trim();
      const message = form.message.value.trim();

      // Fallback: klucz Web3Forms nie został jeszcze wklejony — użyj mailto, żeby formularz działał od razu
      if (!accessKey || accessKey.indexOf('WKLEJ_TU') === 0) {
        const subject = encodeURIComponent(`Zapytanie ze strony — ${name}`);
        const body = encodeURIComponent(
          `Imię i nazwisko: ${name}\nKontakt: ${contact}\nAuto: ${car || '—'}\n\nWiadomość:\n${message}`
        );
        window.location.href = `mailto:kontakt@poziom-studio.pl?subject=${subject}&body=${body}`;
        formNote.textContent = 'Otworzyliśmy program pocztowy z gotową wiadomością — wystarczy ją wysłać. (Podłącz Web3Forms, aby wysyłać bez tego kroku.)';
        formNote.classList.remove('error');
        formNote.classList.add('success');
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wysyłanie…'; }
      formNote.classList.remove('error', 'success');
      formNote.textContent = 'Wysyłanie wiadomości…';

      try {
        const payload = {
          access_key: accessKey,
          subject: form.subject ? form.subject.value : 'Nowe zapytanie ze strony Poziom Studio',
          from_name: form.from_name ? form.from_name.value : 'Formularz — Poziom Studio',
          name,
          contact,
          car: car || '—',
          message
        };
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          form.reset();
          formNote.textContent = 'Dziękujemy! Wiadomość została wysłana — odezwiemy się najszybciej, jak to możliwe.';
          formNote.classList.add('success');
        } else {
          throw new Error(data.message || 'Nieznany błąd wysyłki');
        }
      } catch (err) {
        formNote.textContent = 'Nie udało się wysłać formularza. Zadzwoń lub napisz na kontakt@poziom-studio.pl.';
        formNote.classList.add('error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Wyślij zapytanie'; }
      }
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- QUIZ: dobierz usługę ---------- */
  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    const steps = Array.from(quizCard.querySelectorAll('.quiz-step'));
    const dots = Array.from(quizCard.querySelectorAll('.quiz-progress .dot'));
    const result = document.getElementById('quizResult');
    const resultTitle = document.getElementById('quizResultTitle');
    const resultDesc = document.getElementById('quizResultDesc');
    const resultLink = document.getElementById('quizResultLink');
    const restartBtn = document.getElementById('quizRestart');

    // EDYTUJ TU: treści rekomendacji wyświetlanych po quizie
    const SERVICE_INFO = {
      ppf: {
        title: 'Folie ochronne PPF',
        desc: 'Przy Twoim stylu jeżdżenia priorytetem jest ochrona przed odpryskami i rysami — folia PPF to najlepsza inwestycja w trwały wygląd lakieru.'
      },
      detailing: {
        title: 'Detailing',
        desc: 'Najbardziej zależy Ci na czystości i pielęgnacji — pełny detailing wnętrza i karoserii odświeży auto od podstaw.'
      },
      rysy: {
        title: 'Usuwanie rys',
        desc: 'Korekta lakieru zredukuje mikrorysy i przywróci głębię koloru — idealne rozwiązanie dla auta w tym wieku.'
      },
      renowacja: {
        title: 'Renowacja i polerowanie',
        desc: 'Twój lakier zasługuje na pełną renowację — wielostopniowe polerowanie przywróci mu fabryczny, a czasem lepszy niż fabryczny, wygląd.'
      },
      mrozenie: {
        title: 'Mrożenie lakieru',
        desc: 'Skoro zależy Ci na wyróżniającym się wyglądzie na zlotach i wyjazdach — mrożenie da Twojemu autu głęboki, satynowy charakter.'
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
      resultDesc.textContent = info.desc;
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

  /* ---------- KALKULATOR / KONFIGURATOR PPF ---------- */
  const calcBlock = document.getElementById('kalkulator');
  if (calcBlock) {
    // EDYTUJ TU: ceny orientacyjne (PLN) wg segmentu — wartości poglądowe do potwierdzenia
    const SEGMENTS = {
      kompakt: { label: 'Kompakt',       sensitive: 700, front: 1800, fullfront: 3400, fullbody: 8500,  frost: 4500 },
      sedan:   { label: 'Sedan / Kombi', sensitive: 800, front: 2100, fullfront: 3900, fullbody: 9800,  frost: 5200 },
      suv:     { label: 'SUV',           sensitive: 950, front: 2600, fullfront: 4600, fullbody: 12500, frost: 6500 },
    };
    const ZONE_LABELS = { sensitive: 'Elementy newralgiczne', front: 'Front', fullfront: 'Full Front', fullbody: 'Full Body' };

    const segmentChips = Array.from(document.querySelectorAll('#segmentChips .chip'));
    const zoneChips = Array.from(document.querySelectorAll('#zoneChips .chip'));
    const frostChip = document.getElementById('frostChip');
    const frostHint = document.getElementById('frostHint');
    const priceEl = document.getElementById('calcPrice');
    const calcCta = document.getElementById('calcCta');
    const svgZones = Array.from(document.querySelectorAll('#carDiagram .zone'));
    const carBody = document.getElementById('carBody');

    let segment = null;
    const selectedZones = new Set();
    let frost = false;

    const money = (n) => n.toLocaleString('pl-PL') + ' zł';

    const isFull = () => selectedZones.has('fullbody');

    const updateVisual = () => {
      const fullOn = isFull();
      carBody.classList.toggle('full-active', fullOn);
      svgZones.forEach(z => {
        const tokens = (z.dataset.zone || '').split(' ').filter(Boolean);
        const on = fullOn || tokens.some(t => selectedZones.has(t));
        z.classList.toggle('active', on);
      });
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
      const low = Math.round(base / 50) * 50;
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
          if (isFull()) {
            selectedZones.delete('fullbody');
          } else {
            selectedZones.clear();
            selectedZones.add('fullbody');
          }
        } else {
          selectedZones.delete('fullbody');
          if (selectedZones.has(zone)) selectedZones.delete(zone);
          else selectedZones.add(zone);
        }
        update();
      });
    });

    frostChip.addEventListener('click', () => {
      frost = !frost;
      if (frost) {
        selectedZones.clear();
        selectedZones.add('fullbody');
      }
      update();
    });

    calcCta.addEventListener('click', () => {
      const kontakt = document.getElementById('kontakt');
      const msgEl = document.getElementById('f-msg');
      const carEl = document.getElementById('f-car');
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

  /* ---------- Przycisk szybkiego kontaktu ---------- */
  const quickContact = document.getElementById('quickContact');
  const quickToggle = document.getElementById('quickToggle');
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
