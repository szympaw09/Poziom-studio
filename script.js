// =========================================================
// POZIOM STUDIO — interactions
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Super płynne przewijanie (własny easing zamiast domyślnego, "szarpanego" scroll-behavior) ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smoothScrollTo = (targetY, duration = 900) => {
    if (prefersReducedMotion) { window.scrollTo(0, targetY); return; }
    const startY = window.scrollY;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const scrollToEl = (el, duration) => {
    if (!el) return;
    smoothScrollTo(el.getBoundingClientRect().top + window.scrollY, duration);
  };
  window.__scrollToEl = scrollToEl; // udostępnione dla innych fragmentów skryptu (np. kalkulator)

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const initialHash = a.getAttribute('href');
    if (!initialHash || initialHash.length < 2) return;
    a.addEventListener('click', (e) => {
      // przyciski .cta-call-mobile mogą mieć w tym momencie podmieniony href na "tel:..." — wtedy nie przechwytujemy kliknięcia
      const hash = a.getAttribute('href');
      if (!hash || !hash.startsWith('#') || hash.length < 2) return;
      let target;
      try { target = document.querySelector(hash); } catch (err) { target = null; }
      if (!target) return;
      e.preventDefault();
      scrollToEl(target);
      history.pushState(null, '', hash);
    });
  });

  /* ---------- CTA "Umów wizytę / konsultację / porozmawiajmy" — na mobile dzwonią wprost do studia ---------- */
  // EDYTUJ TU: numer telefonu (ten sam, co w sekcji Kontakt / szybkim kontakcie)
  const CTA_PHONE = 'tel:+48534315315';
  const CTA_BREAKPOINT = '(max-width:780px)';
  const mobileCallLinks = Array.from(document.querySelectorAll('.cta-call-mobile'));
  if (mobileCallLinks.length) {
    const mq = window.matchMedia(CTA_BREAKPOINT);
    const applyMobileCta = () => {
      mobileCallLinks.forEach(a => {
        if (!a.dataset.hrefDefault) a.dataset.hrefDefault = a.getAttribute('href');
        if (mq.matches) {
          a.setAttribute('href', CTA_PHONE);
        } else {
          a.setAttribute('href', a.dataset.hrefDefault);
        }
      });
    };
    applyMobileCta();
    if (mq.addEventListener) mq.addEventListener('change', applyMobileCta);
    else mq.addListener(applyMobileCta); // starsze przeglądarki
  }

  /* ---------- Sticky header — throttled via rAF ---------- */
  const header = document.getElementById('siteHeader');
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 30);
      scrollTicking = false;
    });
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Marquee — autoplay w lewo + drag ---------- */
  const marqueeEl = document.querySelector('.marquee');
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeEl && marqueeTrack) {
    marqueeTrack.style.animation = 'none';
    marqueeTrack.style.willChange = 'transform';

    const SPEED = 1.2;        // px/frame autoplay
    let cachedHalfW = marqueeTrack.scrollWidth / 2;
    const recalcHalfW = () => { cachedHalfW = marqueeTrack.scrollWidth / 2; };
    window.addEventListener('resize', recalcHalfW, { passive: true });

    let x = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartPosX = 0;

    const tick = () => {
      if (!dragging) x -= SPEED;
      // zawijaj: gdy wyjdziemy poza jedną kopię, skocz o cachedHalfW do przodu
      if (x < -cachedHalfW) x += cachedHalfW;
      if (x > 0)   x -= cachedHalfW;
      marqueeTrack.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const dragStart = (cx) => {
      dragging = true;
      dragStartX = cx;
      dragStartPosX = x;
      marqueeEl.classList.add('dragging');
    };
    const dragMove = (cx) => {
      if (!dragging) return;
      x = dragStartPosX + (cx - dragStartX);
    };
    const dragEnd = () => {
      dragging = false;
      marqueeEl.classList.remove('dragging');
    };

    marqueeEl.addEventListener('mousedown',  e => { e.preventDefault(); dragStart(e.clientX); });
    window.addEventListener('mousemove',     e => dragMove(e.clientX));
    window.addEventListener('mouseup',       () => dragEnd());
    marqueeEl.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
    marqueeEl.addEventListener('touchmove',  e => { e.preventDefault(); dragMove(e.touches[0].clientX); }, { passive: false });
    marqueeEl.addEventListener('touchend',   () => dragEnd());
  }

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
      const rounded = Math.round(pct);
      ba.setAttribute('aria-valuenow', String(rounded));
      ba.setAttribute('aria-valuetext', `${rounded} procent`);
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

    // keyboard support (role, tabindex, aria-label już w HTML)
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
      ba.setAttribute('aria-valuenow', '50');
      ba.setAttribute('aria-valuetext', '50 procent, pozycja środkowa');
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

      // ramka ma teraz stałe proporcje (dopasowane do panelu samoregeneracji), a zdjęcie jest
      // przycinane przez object-fit:cover — trzeba to uwzględnić, żeby podgląd w lupie się nie rozjeżdżał
      const naturalW = loupeImg.naturalWidth || rect.width;
      const naturalH = loupeImg.naturalHeight || rect.height;
      const coverScale = Math.max(rect.width / naturalW, rect.height / naturalH);
      const renderedW = naturalW * coverScale;
      const renderedH = naturalH * coverScale;
      const offsetLeft = (rect.width - renderedW) / 2;   // object-position: center (poziomo)
      const offsetTop = (rect.height - renderedH) * 0.3; // object-position: 30% (pionowo)
      const imgX = x - offsetLeft;
      const imgY = y - offsetTop;

      loupeGlass.style.backgroundSize = (renderedW * ZOOM) + 'px ' + (renderedH * ZOOM) + 'px';
      loupeGlass.style.backgroundPosition = `-${imgX * ZOOM - glassSize / 2}px -${imgY * ZOOM - glassSize / 2}px`;
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

  /* ---------- FAQ akordeon (płynne rozwijanie/zwijanie) ---------- */
  const faqList = document.getElementById('faqList');
  if (faqList) {
    const questions = Array.from(faqList.querySelectorAll('.faq-question'));

    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = document.getElementById(btn.getAttribute('aria-controls'));
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // zamknij pozostałe
        questions.forEach(other => {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
            if (otherAnswer) {
              otherAnswer.classList.remove('is-open');
              otherAnswer.setAttribute('aria-hidden', 'true');
            }
          }
        });

        btn.setAttribute('aria-expanded', String(!isOpen));
        if (answer) {
          answer.classList.toggle('is-open', !isOpen);
          answer.setAttribute('aria-hidden', String(isOpen));
        }
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
        caption: 'Land Rover Defender — głębokie czyszczenie wnętrza. Przywracamy tapicerce i plastikom fabryczny wygląd.'
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
        carChips.forEach(c => {
          const isActive = c === chip;
          c.classList.toggle('active', isActive);
          c.setAttribute('aria-selected', String(isActive));
        });
        afterImg.src = car.after;
        beforeImg.src = car.before;
        afterImg.alt = car.caption;
        beforeImg.alt = car.caption;
        caption.textContent = car.caption;
        if (ba.resetPos) ba.resetPos();
      });
    });
  }

  /* ---------- Gallery lightbox + video hover ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  // Dodaj element wideo do lightboxa
  const lightboxVideo = document.createElement('video');
  lightboxVideo.id = 'lightboxVideo';
  lightboxVideo.controls = true;
  lightboxVideo.style.cssText = 'display:none;max-width:90vw;max-height:80vh;border-radius:8px;';
  lightbox.insertBefore(lightboxVideo, lightboxImg.nextSibling);

  let lightboxVideoSrc = '';

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.style.display = '';
    lightboxVideo.style.display = 'none';
    lightboxVideo.pause();
    lightboxVideo.src = '';
  };

  // Zdjęcia — standardowy lightbox
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.display = '';
      lightboxVideo.style.display = 'none';
      lightboxCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Wideo — hover: autoplay bez głosu; click: odtwarzanie z głosem w lightboxie
  document.querySelectorAll('.gallery-video-item').forEach(item => {
    const video = item.querySelector('.gallery-video');
    if (!video) return;

    // Załaduj wideo przy pierwszym hover
    let loaded = false;
    const loadVideo = () => {
      if (loaded) return;
      loaded = true;
      video.load();
    };

    item.addEventListener('mouseenter', () => {
      loadVideo();
      video.muted = true;
      video.play().catch(() => {});
      item.classList.add('playing');
    });
    item.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
      item.classList.remove('playing');
    });

    // Touch: tap odtwarza/zatrzymuje bez dźwięku
    item.addEventListener('touchstart', () => loadVideo(), { passive: true });

    // Click: otwiera lightbox z pełnym dźwiękiem
    item.addEventListener('click', () => {
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = video.src;
      lightboxVideo.muted = false;
      lightboxVideo.currentTime = 0;
      lightboxCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightboxVideo.play().catch(() => {});
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Zakładki formularza: pełny vs. szybki kontakt (tylko numer) ---------- */
  const tabFull = document.getElementById('tabFull');
  const tabQuick = document.getElementById('tabQuick');
  const carRow = document.getElementById('carRow');
  const msgRow = document.getElementById('msgRow');
  const fContact = document.getElementById('f-contact');
  const fMsg = document.getElementById('f-msg');
  const contactSubmitBtnEl = document.getElementById('contactSubmitBtn');
  const QUICK_MESSAGE = 'Proszę o kontakt telefoniczny — zostawiam tylko numer, oddzwońcie do mnie.';
  let quickMode = false;

  if (tabFull && tabQuick) {
    const setMode = (quick) => {
      quickMode = quick;
      tabFull.classList.toggle('active', !quick);
      tabQuick.classList.toggle('active', quick);
      tabFull.setAttribute('aria-selected', String(!quick));
      tabQuick.setAttribute('aria-selected', String(quick));
      carRow.classList.toggle('is-hidden', quick);
      msgRow.classList.toggle('is-hidden', quick);
      if (fMsg) fMsg.required = !quick;
      if (fContact) {
        fContact.placeholder = quick ? 'Twój numer telefonu' : '';
        fContact.setAttribute('autocomplete', 'tel');
      }
      if (contactSubmitBtnEl) contactSubmitBtnEl.textContent = quick ? 'Oddzwonimy do Ciebie' : 'Wyślij zapytanie';
    };
    tabFull.addEventListener('click', () => setMode(false));
    tabQuick.addEventListener('click', () => setMode(true));
  }

  /* ---------- Contact form (Web3Forms — wysyłka bez przeładowania strony) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = document.getElementById('contactSubmitBtn');
  if (form) {
    form.addEventListener('submit', () => {
      // w trybie "tylko numer" wiadomość jest opcjonalna — wypełnij ją domyślną treścią przed wysyłką
      if (quickMode && fMsg && !fMsg.value.trim()) fMsg.value = QUICK_MESSAGE;
    }, true);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // prosty honeypot antyspamowy — jeśli wypełniony, to bot
      if (form.elements['botcheck'] && form.elements['botcheck'].value) return;

      const accessKey = (form.elements['access_key'] ? form.elements['access_key'].value : '').trim();
      const name = form.elements['name'].value.trim();
      const contact = form.elements['contact'].value.trim();
      const car = (form.elements['car'] ? form.elements['car'].value : '').trim();
      const message = (form.elements['message'] ? form.elements['message'].value : '').trim();
      const configuratorVal = (form.elements['configurator'] ? form.elements['configurator'].value : '').trim();

      if (!name || !contact) {
        formNote.textContent = 'Uzupełnij imię i dane kontaktowe.';
        formNote.classList.add('error');
        return;
      }

      const rodoChecked = form.elements['rodo'] ? form.elements['rodo'].checked : true;
      if (!rodoChecked) {
        formNote.textContent = 'Zaznacz zgodę na przetwarzanie danych osobowych.';
        formNote.classList.add('error');
        const rodoRow = document.querySelector('.form-row-rodo');
        if (rodoRow) { rodoRow.classList.add('flash'); setTimeout(() => rodoRow.classList.remove('flash'), 900); }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wysyłanie…'; }
      formNote.classList.remove('error', 'success');
      formNote.textContent = 'Wysyłanie wiadomości…';

      try {
        const subjectEl = form.elements['subject'];
        const fromNameEl = form.elements['from_name'];

        const payload = {
          access_key: accessKey,
          subject: subjectEl ? subjectEl.value : 'Nowe zapytanie ze strony Poziom Studio',
          from_name: fromNameEl ? fromNameEl.value : 'Formularz — Poziom Studio',
          name,
          contact,
          car: car || '—',
          message: message || '(brak wiadomości)',
          ...(configuratorVal ? { 'Konfiguracja PPF': configuratorVal } : {})
        };

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          form.reset();
          // Ukryj badge po wysyłce
          const configBadge = document.getElementById('configuratorBadge');
          if (configBadge) configBadge.hidden = true;
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

  /* ---------- Cookie banner ---------- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  if (cookieBanner) {
    const COOKIE_KEY = 'poziom_cookie_consent';
    if (!localStorage.getItem(COOKIE_KEY)) {
      setTimeout(() => { cookieBanner.hidden = false; }, 800);
    }
    const closeBanner = () => {
      localStorage.setItem(COOKIE_KEY, 'necessary');
      cookieBanner.style.transition = 'opacity .25s, transform .25s';
      cookieBanner.style.opacity = '0';
      cookieBanner.style.transform = 'translateX(-50%) translateY(12px)';
      setTimeout(() => { cookieBanner.hidden = true; }, 260);
    };
    cookieAccept.addEventListener('click', closeBanner);
  }

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
    const segmentChipsCheck = document.querySelectorAll('#segmentChips .chip');
    const zoneChipsCheck = document.querySelectorAll('#zoneChips .chip');
    const sensitiveChipCheck = document.querySelector('#zoneChips [data-zone="sensitive"]');
    const frostChipCheck = document.getElementById('frostChip');
    const colorChangeChipCheck = document.getElementById('colorChangeChip');
    const frostHintCheck = document.getElementById('frostHint');
    const priceElCheck = document.getElementById('calcPrice');
    const calcCtaCheck = document.getElementById('calcCta');
    const carBodyCheck = document.getElementById('carBody');

    if (!segmentChipsCheck.length || !zoneChipsCheck.length || !sensitiveChipCheck || !frostChipCheck
        || !colorChangeChipCheck || !frostHintCheck || !priceElCheck || !calcCtaCheck || !carBodyCheck) {
      console.warn('Konfigurator PPF: brak wymaganych elementów w HTML — sprawdź, czy index.html jest aktualny (zgodny ze script.js).');
    } else {
    // EDYTUJ TU: ceny orientacyjne (PLN, widełki niska–wysoka) wg segmentu — wartości poglądowe do potwierdzenia
    const SEGMENTS = {
      kompakt: { label: 'Kompakt',       front: [2800, 3500], fullfront: [4000, 4500], fullbody: [11000, 13000] },
      sedan:   { label: 'Sedan / Kombi', front: [3200, 3900], fullfront: [4500, 5000], fullbody: [12000, 14000] },
      suv:     { label: 'SUV',           front: [3600, 4300], fullfront: [5000, 5500], fullbody: [13000, 18000] },
    };
    // Elementy newralgiczne — jedna, stała cena dla wszystkich segmentów, dostępna tylko razem z pakietem Front
    const SENSITIVE = [1000, 1500];
    // Dodatki liczone od pakietu Full Body: mrożenie lakieru, zmiana koloru = mrożenie + 500 zł
    const FROST_ADD = 1500;
    const COLOR_ADD = FROST_ADD + 500;
    const ZONE_LABELS = { sensitive: 'Elementy newralgiczne', front: 'Front', fullfront: 'Full Front', fullbody: 'Full Body' };

    const segmentChips = Array.from(document.querySelectorAll('#segmentChips .chip'));
    const zoneChips = Array.from(document.querySelectorAll('#zoneChips .chip'));
    const sensitiveChip = document.querySelector('#zoneChips [data-zone="sensitive"]');
    const frostChip = document.getElementById('frostChip');
    const colorChangeChip = document.getElementById('colorChangeChip');
    const frostHint = document.getElementById('frostHint');
    const priceEl = document.getElementById('calcPrice');
    const calcCta = document.getElementById('calcCta');
    const svgZones = Array.from(document.querySelectorAll('#carDiagram .zone'));
    const carBody = document.getElementById('carBody');

    let segment = null;
    const selectedZones = new Set();
    let frost = false;
    let colorChange = false;

    const money = (n) => n.toLocaleString('pl-PL') + ' zł';

    const isFull = () => selectedZones.has('fullbody');
    // Elementy newralgiczne: samodzielnie lub razem z "Front" — niedostępne z "Full Front" / "Full Body"
    const sensitiveAllowed = () => !selectedZones.has('fullfront') && !isFull();
    // Mrożenie / zmiana koloru: tylko przy wybranym "Full Body"
    const addonsAllowed = () => isFull();

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
      const allowSensitive = sensitiveAllowed();
      sensitiveChip.disabled = !allowSensitive;
      sensitiveChip.classList.toggle('chip-disabled', !allowSensitive);

      const allowAddons = addonsAllowed();
      frostChip.disabled = !allowAddons;
      frostChip.classList.toggle('chip-disabled', !allowAddons);
      colorChangeChip.disabled = !allowAddons;
      colorChangeChip.classList.toggle('chip-disabled', !allowAddons);
      frostChip.classList.toggle('active', frost);
      colorChangeChip.classList.toggle('active', colorChange);
      frostHint.hidden = allowAddons;
    };

    const updatePrice = () => {
      if (!segment) { priceEl.textContent = 'wybierz segment i zakres'; return; }
      const s = SEGMENTS[segment];
      let low = 0, high = 0;
      if (isFull()) {
        low = s.fullbody[0]; high = s.fullbody[1];
      } else if (selectedZones.size > 0) {
        selectedZones.forEach(z => {
          const range = z === 'sensitive' ? SENSITIVE : s[z];
          if (!range) return;
          low += range[0]; high += range[1];
        });
      } else {
        priceEl.textContent = 'wybierz zakres ochrony';
        return;
      }
      if (frost) { low += FROST_ADD; high += FROST_ADD; }
      if (colorChange) { low += COLOR_ADD; high += COLOR_ADD; }
      const lowR = Math.round(low / 50) * 50;
      const highR = Math.round(high / 50) * 50;
      priceEl.textContent = `${money(lowR)} – ${money(highR)}`;
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
          if (selectedZones.has(zone)) {
            selectedZones.delete(zone);
          } else {
            // "Front" i "Full Front" wzajemnie się wykluczają
            if (zone === 'front') selectedZones.delete('fullfront');
            if (zone === 'fullfront') selectedZones.delete('front');
            selectedZones.add(zone);
          }
        }
        // "Elementy newralgiczne" nie łączy się z "Full Front" ani "Full Body"
        if (!sensitiveAllowed()) selectedZones.delete('sensitive');
        // Mrożenie / zmiana koloru wymagają "Full Body"
        if (!isFull()) { frost = false; colorChange = false; }
        update();
      });
    });

    frostChip.addEventListener('click', () => {
      if (frostChip.disabled) return;
      frost = !frost;
      if (frost) colorChange = false;
      update();
    });

    colorChangeChip.addEventListener('click', () => {
      if (colorChangeChip.disabled) return;
      colorChange = !colorChange;
      if (colorChange) frost = false;
      update();
    });

    calcCta.addEventListener('click', () => {
      const kontakt = document.getElementById('kontakt');
      const msgEl = document.getElementById('f-msg');
      const carEl = document.getElementById('f-car');
      const msgRowEl = document.getElementById('msgRow');
      const carRowEl = document.getElementById('carRow');
      const configInput = document.getElementById('f-configurator');
      const configBadge = document.getElementById('configuratorBadge');
      const configBadgeValue = document.getElementById('configuratorBadgeValue');
      const configBadgeClear = document.getElementById('configuratorBadgeClear');
      const subjectInput = form ? form.querySelector('[name="subject"]') : null;

      // upewnij się, że widoczny jest pełny formularz, a nie wariant "tylko numer"
      const tabFullBtn = document.getElementById('tabFull');
      if (tabFullBtn && !tabFullBtn.classList.contains('active')) tabFullBtn.click();

      const hasZone = isFull() || selectedZones.size > 0;
      const configComplete = segment && hasZone;

      if (configComplete) {
        const s = SEGMENTS[segment];
        const zoneList = isFull()
          ? ['Full Body']
          : Array.from(selectedZones).map(z => ZONE_LABELS[z]);
        if (frost) zoneList.push('Mrożenie lakieru');
        if (colorChange) zoneList.push('Zmiana koloru');

        const zonesStr = zoneList.join(', ') || '—';
        const priceStr = priceEl.textContent;

        const configSummary = `Segment: ${s.label} | Zakres: ${zonesStr} | Wycena orientacyjna: ${priceStr}`;

        if (msgEl && !msgEl.value.trim()) {
          msgEl.value = `Interesuje mnie wycena zgodnie z konfiguratorem ze strony.\nJeśli potrzebujesz — możesz uzupełnić tutaj dodatkowe informacje o aucie lub zakresie.`;
        }

        if (carEl && !carEl.value.trim()) carEl.value = s.label;

        if (configInput) configInput.value = configSummary;
        if (subjectInput) subjectInput.value = `Zapytanie z konfiguratora PPF — ${s.label}, ${zonesStr}`;

        if (configBadge && configBadgeValue) {
          configBadgeValue.textContent = configSummary;
          configBadge.hidden = false;
        }

        [msgRowEl, carRowEl].forEach(row => {
          if (!row) return;
          row.classList.remove('flash');
          void row.offsetWidth;
          row.classList.add('flash');
        });
      } else {
        // Nic nie wybrano — ukryj badge, wyczyść hidden input
        if (configBadge) configBadge.hidden = true;
        if (configInput) configInput.value = '';
        if (subjectInput) subjectInput.value = 'Nowe zapytanie ze strony Poziom Studio';
      }
      if (kontakt) (window.__scrollToEl ? window.__scrollToEl(kontakt) : kontakt.scrollIntoView({ behavior: 'smooth' }));
    });

    // Przycisk czyszczenia badge — rejestruj raz przy starcie, niezależnie od stanu kalkulatora
    const _clearBtn = document.getElementById('configuratorBadgeClear');
    const _badge = document.getElementById('configuratorBadge');
    const _configInput = document.getElementById('f-configurator');
    const _subjectInput = form ? form.elements['subject'] : null;
    if (_clearBtn) {
      _clearBtn.addEventListener('click', () => {
        if (_badge) _badge.hidden = true;
        if (_configInput) _configInput.value = '';
        if (_subjectInput) _subjectInput.value = 'Nowe zapytanie ze strony Poziom Studio';
      });
    }

    update();
    }
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

  /* ===== COUNT-UP ANIMATION ===== */
  const countUps = document.querySelectorAll('.count-up');
  if (countUps.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const duration = 1600;
        const startTime = performance.now();
        function tick(now) {
          const elapsed = Math.min(now - startTime, duration);
          const progress = 1 - Math.pow(1 - elapsed / duration, 3); // ease-out cubic
          const current = target * progress;
          el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
          if (elapsed < duration) requestAnimationFrame(tick);
          else el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    countUps.forEach(el => countObserver.observe(el));
  }

});
