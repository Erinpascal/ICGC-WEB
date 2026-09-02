(function () {
  'use strict';

  const announcementBar = document.getElementById('announcementBar');
  const announcementClose = document.getElementById('announcementClose');
  const siteHeader = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  /* Announcement bar */
  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', function () {
      announcementBar.classList.add('hidden');
      siteHeader.classList.add('no-announcement');
      document.body.classList.add('no-announcement');
      setTimeout(function () {
        announcementBar.style.display = 'none';
      }, 300);
    });
  }

  /* Mobile navigation */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* Header scroll effect */
  window.addEventListener('scroll', function () {
    const scrollY = window.pageYOffset;
    const hero = document.getElementById('hero');

    if (siteHeader.classList.contains('site-header--solid')) {
      siteHeader.classList.toggle('scrolled', scrollY > 50);
      return;
    }

    if (scrollY > 80) {
      siteHeader.classList.add('scrolled');
      siteHeader.classList.remove('site-header--over-hero');
    } else if (!hero || scrollY < hero.offsetHeight - 100) {
      siteHeader.classList.remove('scrolled');
      siteHeader.classList.add('site-header--over-hero');
    }
  }, { passive: true });

  /* ===== HERO SLIDER ===== */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const progressBar = document.getElementById('sliderProgress');
  const heroSlider = document.querySelector('.hero-slider');

  let currentSlide = 0;
  let slideInterval = null;
  const SLIDE_DURATION = 6000;
  let progressRAF = null;
  let slideStart = 0;

  function goToSlide(index) {
    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });

    resetProgress();
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function resetProgress() {
    if (progressRAF) cancelAnimationFrame(progressRAF);
    slideStart = performance.now();
    if (progressBar) progressBar.style.width = '0%';

    function tick(now) {
      const elapsed = now - slideStart;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (elapsed < SLIDE_DURATION) {
        progressRAF = requestAnimationFrame(tick);
      }
    }
    progressRAF = requestAnimationFrame(tick);
  }

  function startAutoplay() {
    stopAutoplay();
    resetProgress();
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = null;
    if (progressRAF) cancelAnimationFrame(progressRAF);
  }

  if (slides.length) {
    if (prevBtn) prevBtn.addEventListener('click', function () { stopAutoplay(); prevSlide(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAutoplay(); nextSlide(); startAutoplay(); });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopAutoplay();
        goToSlide(parseInt(dot.dataset.index, 10));
        startAutoplay();
      });
    });

    if (heroSlider) {
      heroSlider.addEventListener('mouseenter', stopAutoplay);
      heroSlider.addEventListener('mouseleave', startAutoplay);

      let touchStartX = 0;
      heroSlider.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      heroSlider.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          stopAutoplay();
          if (diff > 0) nextSlide(); else prevSlide();
          startAutoplay();
        }
      }, { passive: true });
    }

    startAutoplay();
  }

  /* Animated counters */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* Fade-in on scroll */
  const fadeElements = document.querySelectorAll(
    '.about-content, .about-visual, .stat-card, .service-card, .ministry-card, .event-card, .resource-card, .contact-info, .contact-map, .prayer-content, .pastor-bio, .pastor-photo-wrap, .book-featured, .pastor-message-inner'
  );

  fadeElements.forEach(function (el) { el.classList.add('fade-in'); });

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    fadeElements.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Smooth anchor scrolling */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      let headerOffset = siteHeader.offsetHeight;
      if (announcementBar && !announcementBar.classList.contains('hidden')) {
        headerOffset += announcementBar.offsetHeight;
      }

      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
