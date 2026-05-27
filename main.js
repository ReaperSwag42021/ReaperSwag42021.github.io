/* ============================================================
   RIKPOSTMA.NL — main.js
   Shared scripts for all pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Custom cursor (desktop only) ── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  if (cursor && cursorRing && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    (function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .skill-tag, .about-card, .project-card, .filter-btn, .value-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorRing.classList.remove('hover');
      });
    });
  }

  /* ── Mobile hamburger menu ── */
  const hamburger  = document.getElementById('navHamburger');
  const navDrawer  = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');

  function closeMenu() {
    hamburger?.classList.remove('open');
    navDrawer?.classList.remove('open');
    navOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    navOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navOverlay?.addEventListener('click', closeMenu);
  navDrawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .timeline-item');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children];
      const idx      = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 90);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Active nav link highlight (scroll-spy for single-page) ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a, .nav-drawer a');

  // Mark active link by current page filename
  const page = location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Scroll-spy for index only
  if (sections.length) {
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 220) current = sec.id;
      });
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.style.color = href === '#' + current ? 'var(--text)' : '';
      });
    });
  }

  /* ── Project filter (work.html) ── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-tags]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tag = btn.dataset.filter;
      projectCards.forEach(card => {
        const tags = card.dataset.tags || '';
        const show = tag === 'all' || tags.includes(tag);
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ── Contact form ── */
  const form = document.getElementById('contactForm');

  // Live tekenteller voor het berichtveld
  const messageField = document.getElementById('message');
  const charCount = document.getElementById('charCount');
  if (messageField && charCount) {
    const max = messageField.getAttribute('maxlength') || 1500;
    const updateCount = () => { charCount.textContent = `${messageField.value.length} / ${max}`; };
    messageField.addEventListener('input', updateCount);
    updateCount();
  }

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn    = form.querySelector('button[type="submit"]');
    const status = document.getElementById('formStatus');
    const original = btn.textContent;

    // Eenvoudige validatie
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    btn.textContent = 'Versturen…';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    if (status) { status.textContent = ''; status.style.color = ''; }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        btn.textContent = 'Verzonden ✓';
        if (status) {
          status.textContent = 'Bedankt! Je bericht is verstuurd.';
          status.style.color = 'var(--accent)';
        }
        form.reset();
        if (messageField && charCount) {
          const max = messageField.getAttribute('maxlength') || 1500;
          charCount.textContent = `0 / ${max}`;
        }
      } else {
        throw new Error(data.message || 'Verzenden mislukt');
      }
    } catch (err) {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.opacity = '';
      if (status) {
        status.textContent = 'Er ging iets mis. Probeer het later opnieuw of mail direct.';
        status.style.color = 'var(--accent2)';
      }
    }
  });

});
