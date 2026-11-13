/* Página de projeto: movimento ao rolar (ver css/projeto.css) */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = innerHeight;

  /* ---- Texto palavra por palavra ---- */
  var words = [];
  [].forEach.call(document.querySelectorAll('.words'), function (el) {
    var parts = el.textContent.trim().split(/\s+/);
    el.innerHTML = parts.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = words.concat([].slice.call(el.querySelectorAll('.w')));
  });

  /* ---- Imagens: cortina ao entrar na tela ---- */
  var shots = [].slice.call(document.querySelectorAll('.shot'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    shots.forEach(function (s, i) {
      var sib = [].slice.call(s.parentNode.children).indexOf(s);
      if (sib > 0) s.style.transitionDelay = (sib * 0.12) + 's';
      io.observe(s);
    });
  } else shots.forEach(function (s) { s.classList.add('is-in'); });

  if (reduce) { words.forEach(function (w) { w.classList.add('on'); }); return; }

  var fulls = [].slice.call(document.querySelectorAll('.shot--full .shot__in'));
  var stories = [].slice.call(document.querySelectorAll('.stories .shot'));
  var track = document.querySelector('.marquee__track');
  var lastY = scrollY, ticking = false;

  function update() {
    ticking = false;
    var y = scrollY;
    // palavras acendem conforme passam de 80% da tela
    words.forEach(function (w) { w.classList.toggle('on', w.getBoundingClientRect().top < vh * .8); });
    // parallax nas imagens largas
    fulls.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.setProperty('--py', (((r.top + r.height / 2) - vh / 2) * -.12).toFixed(1) + 'px');
    });
    // stories: a do meio anda em outra velocidade
    stories.forEach(function (el, i) {
      var r = el.parentNode.getBoundingClientRect();
      var d = (r.top + r.height / 2) - vh / 2;
      var sy = Math.max(-90, Math.min(90, d * (i === 1 ? -.18 : .06)));
      el.style.setProperty('--sy', sy.toFixed(1) + 'px');
    });
    // faixa de palavras acelera com a rolagem
    if (track) {
      var half = track.scrollWidth / 2;
      track.style.setProperty('--mx', (-(y * .5) % half).toFixed(1) + 'px');
    }
    lastY = y;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', function () { vh = innerHeight; update(); });
  update();

  /* ---- Cursor "VER" ---- */
  var cur = document.querySelector('.cursor');
  if (cur && matchMedia('(hover: hover)').matches) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
    [].forEach.call(document.querySelectorAll('[data-cursor]'), function (el) {
      el.addEventListener('pointerenter', function () { cur.textContent = el.dataset.cursor; cur.classList.add('is-on'); });
      el.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
    });
  }
})();
