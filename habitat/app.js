/* ============================================================
   HABITAT — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- nav scroll state ---------- */
  const nav = document.querySelector('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal (with stagger) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('visible');
      const kids = el.querySelectorAll(':scope > *');
      if (el.hasAttribute('data-stagger')) {
        kids.forEach((k, i) => { k.style.transitionDelay = (i * 90) + 'ms'; });
      }
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, [data-stagger]').forEach((el) => io.observe(el));

  /* ---------- image marquee: clone items for a seamless loop ---------- */
  const galTrack = document.querySelector('.img-marquee-track');
  if (galTrack) {
    Array.prototype.slice.call(galTrack.children).forEach((el) => {
      const c = el.cloneNode(true);
      if (c.removeAttribute) c.removeAttribute('id');
      c.setAttribute('aria-hidden', 'true');
      galTrack.appendChild(c);
    });
  }

  /* ---------- hero mask: slow uniform vertical float (CSS only, no rotation/parallax) ---------- */

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxr3OECy9gjukBvQo4K4VCxjtov79AXnU8YSaxrYOyFdpScswnyR1LDVeCk3zzd-VBGmw/exec';

  /* ---------- main form submit ---------- */
  function wireForm(formId, btnId, successHTML, formularioNombre) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
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
    });
  }

  wireForm('habitatForm', 'submitBtn', `
    <div class="form-success">
      <span class="mono">Solicitud recibida</span>
      <h3>Lo que sucede aquí,<br>se queda aquí.</h3>
      <p>Tu solicitud está siendo revisada.<br>Si encajas con la visión de Habitat, te contactaremos.</p>
    </div>`, 'Habitat');

  wireForm('form023', 'submit023', `
    <div class="form-success">
      <span class="mono" style="color:var(--red);">En la lista</span>
      <h3>Nos vemos en la fila.</h3>
      <p>Tu nombre entra a la lista de 023.<br>El cupo es limitado. Si quedas, recibes la dirección.</p>
    </div>`, '023');

  /* ---------- 023 unlock ---------- */
  const gate = document.getElementById('zero23Gate');
  const reveal = document.getElementById('zero23Reveal');
  function unlock023(scroll) {
    if (!reveal) return;
    document.body.classList.add('z23-unlocked');
    reveal.hidden = false;
    if (gate) gate.classList.add('is-open');
    // trigger reveals inside
    requestAnimationFrame(() => {
      reveal.querySelectorAll('.reveal, [data-stagger]').forEach((el) => el.classList.add('visible'));
    });
    if (scroll) {
      const y = document.getElementById('023').offsetTop - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
  document.querySelectorAll('[data-unlock-023]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      unlock023(true);
    }));
})();
