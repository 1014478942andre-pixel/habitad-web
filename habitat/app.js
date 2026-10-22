/* ============================================================
   habitat. — interacciones
   ============================================================ */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxr3OECy9gjukBvQo4K4VCxjtov79AXnU8YSaxrYOyFdpScswnyR1LDVeCk3zzd-VBGmw/exec';

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileMenu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !open;
    nav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- manifesto: split into words ---------- */
  const statement = document.querySelector('[data-words]');
  let words = [];
  if (statement) {
    const text = statement.textContent.trim();
    statement.setAttribute('aria-label', text);
    statement.innerHTML = text.split(/\s+/)
      .map((w) => '<span class="w" aria-hidden="true">' + w + '</span>')
      .join(' ');
    words = Array.prototype.slice.call(statement.querySelectorAll('.w'));
    if (reduce) words.forEach((w) => w.classList.add('on'));
  }

  /* ---------- scroll-linked: nav border, hero mask, manifesto ---------- */
  const mask = document.querySelector('.hero-mask');
  const glow = document.querySelector('.hero-glow');
  let ticking = false;

  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle('scrolled', y > 8);

    if (!reduce && mask && y < vh * 1.2) {
      const p = Math.min(y / vh, 1);
      mask.style.transform = 'translateY(' + (p * 18) + '%) scale(' + (1 - p * 0.14) + ')';
      mask.style.opacity = String(1 - p * 0.75);
      if (glow) glow.style.opacity = String(1 - p);
    }

    if (!reduce && words.length) {
      const r = statement.getBoundingClientRect();
      const start = vh * 0.85;
      const span = Math.max(r.height + vh * 0.25, 1);
      const p = Math.min(Math.max((start - r.top) / span, 0), 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- tile reveal ---------- */
  const tiles = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    tiles.forEach((t) => io.observe(t));
  } else {
    tiles.forEach((t) => t.classList.add('in'));
  }

  /* ---------- photo rail ---------- */
  const rail = document.getElementById('rail');
  const railBtns = document.querySelectorAll('[data-rail]');
  function railState() {
    const max = rail.scrollWidth - rail.clientWidth - 4;
    railBtns.forEach((b) => {
      const dir = Number(b.dataset.rail);
      b.disabled = dir < 0 ? rail.scrollLeft <= 4 : rail.scrollLeft >= max;
    });
  }
  if (rail) {
    railBtns.forEach((b) => b.addEventListener('click', () => {
      const step = Math.max(rail.clientWidth * 0.7, 280);
      rail.scrollBy({ left: Number(b.dataset.rail) * step, behavior: reduce ? 'auto' : 'smooth' });
    }));
    rail.addEventListener('scroll', railState, { passive: true });
    window.addEventListener('resize', railState);
    window.addEventListener('load', railState);
    railState();
  }

  /* ---------- forms → Google Sheets ---------- */
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function validate(form) {
    let first = null;
    form.querySelectorAll('[required]').forEach((el) => {
      const ok = el.type === 'checkbox' ? el.checked : el.checkValidity() && String(el.value).trim() !== '';
      el.classList.toggle('bad', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (!ok && !first) first = el;
    });
    return first;
  }

  function wireForm(formId, btnId, successHTML, formularioNombre) {
    const form = document.getElementById(formId);
    if (!form) return;
    const err = form.querySelector('.form-error');

    form.addEventListener('input', (e) => {
      if (e.target.classList.contains('bad')) validate(form);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = validate(form);
      if (bad) {
        err.textContent = bad.type === 'checkbox'
          ? 'Falta aceptar los términos para enviar la solicitud.'
          : 'Revisa los campos marcados: hay datos que faltan o no son válidos.';
        err.hidden = false;
        bad.focus();
        return;
      }
      err.hidden = true;

      const btn = document.getElementById(btnId);
      btn.textContent = 'Enviando…';
      btn.disabled = true;

      const fields = {};
      new FormData(form).forEach((val, key) => { fields[key] = val; });
      fields.formulario = formularioNombre;

      try {
        await fetch(SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(fields)
        });
      } catch (_) {}

      form.innerHTML = successHTML;
      form.setAttribute('tabindex', '-1');
      form.focus({ preventScroll: true });
    });
  }

  wireForm('habitatForm', 'submitBtn', `
    <div class="form-success" role="status">
      <div class="ok">${CHECK}</div>
      <h3>Lo que sucede aquí,<br>se queda aquí.</h3>
      <p>Tu solicitud está siendo revisada.<br>Si encajas con la visión de Habitat, te contactaremos.</p>
    </div>`, 'Habitat');

  wireForm('form023', 'submit023', `
    <div class="form-success" role="status">
      <div class="ok">${CHECK}</div>
      <h3>Nos vemos en la fila.</h3>
      <p>Tu nombre entra a la lista de 023.<br>El cupo es limitado. Si quedas, recibes la dirección.</p>
    </div>`, '023');

  /* ---------- 023 unlock ---------- */
  const reveal = document.getElementById('zero23Reveal');
  function unlock023(scroll) {
    if (!reveal) return;
    document.body.classList.add('z23-unlocked');
    reveal.hidden = false;
    if (scroll) {
      const y = document.getElementById('023').getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  document.querySelectorAll('[data-unlock-023]').forEach((b) =>
    b.addEventListener('click', (e) => { e.preventDefault(); unlock023(true); }));
  if (location.hash === '#023' || location.hash === '#ingreso023') unlock023(false);
})();
