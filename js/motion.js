/* =========================================================
   Movimento: parallax + entrada dos elementos ao rolar
   - Sem bibliotecas. Funciona em todas as páginas.
   - Quem ativou "reduzir movimento" no sistema não vê animação.
   - Para ajustar a intensidade, mude os números de "speed" abaixo
     (0 = parado, valores maiores = mexe mais, negativo = sentido oposto).
   ========================================================= */
(function () {
  /* cabeçalho fixo: vira barra compacta depois de rolar */
  var hdr = document.querySelector('.site-header');
  if (hdr) {
    var onHdr = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onHdr, { passive: true });
    onHdr();
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var root = document.documentElement;
  root.classList.add('motion');

  /* ---------- 1. Entrada ao rolar (fade + sobe) ---------- */
  var revealSel = [
    '.big-title', '.split .btn', '.about__title', '.about__grad', '.tags__row',
    '.contact__col', '.card', '.project-row__visual',
    '.intro > *', '.gallery .media', '.media--full', '.concept', '.credits > *',
    '.project-nav', '.type__card', '.palette-strip__c', '.lab', '.piece'
  ].join(',');

  var revealEls = [].slice.call(document.querySelectorAll(revealSel));
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    // pequeno atraso em cascata entre irmãos (ex.: tags, galeria)
    var sibs = [].slice.call(el.parentNode.children).filter(function (s) {
      return s.matches(revealSel);
    });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i, 4) * 90 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 2. Parallax ---------- */
  // speed: quanto o elemento se desloca em relação à rolagem
  var layers = [
    // topo da home
    { sel: '.hero', bg: true, speed: 0.35 },
    { sel: '.hero__name', speed: -0.18, fade: true },
    { sel: '.hero__subtitle', speed: -0.08, fade: true },
    { sel: '.hero__cta', speed: 0.05, fade: true },
    // topo das páginas de projeto
    { sel: '.project-hero', bg: true, speed: 0.3 },
    { sel: '.project-hero__logo, .project-hero__title', speed: -0.15, fade: true },
    // home
    { sel: '.split__media img', speed: 0.12, zoom: true },
    { sel: '.split__panel .big-title', speed: -0.06 },
    // work
    { sel: '.project-row__visual', speed: -0.12 },
    { sel: '.project-row .card', speed: 0.06 },
    { sel: '.project-row__bg', speed: 0.18, zoom: true },
    // páginas de projeto
    { sel: 'img.media--full:not([style*="contain"]):not(.media--spread)', speed: 0.1, zoom: true }
  ];

  var items = [];
  layers.forEach(function (l) {
    [].forEach.call(document.querySelectorAll(l.sel), function (el) {
      items.push({ el: el, l: l });
    });
  });

  var desktop = window.matchMedia('(min-width: 801px)');
  var vh = window.innerHeight;
  var ticking = false;

  function update() {
    ticking = false;
    var on = desktop.matches;
    items.forEach(function (it) {
      var el = it.el, l = it.l;
      if (!on) {
        el.style.removeProperty('--py');
        if (l.bg) el.style.backgroundPositionY = '';
        return;
      }
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return; // fora da tela

      if (l.bg) {
        // fundo anda mais devagar que a página
        el.style.backgroundPositionY = 'calc(50% + ' + (-r.top * l.speed).toFixed(1) + 'px)';
        return;
      }

      // distância do centro do elemento até o centro da tela
      var d = (r.top + r.height / 2) - vh / 2;
      var py = d * l.speed;
      if (l.zoom) {
        // imagens com zoom: nunca desloca mais do que a sobra do zoom (15%),
        // para não aparecer borda
        var max = r.height / 1.15 * 0.07;
        py = Math.max(-max, Math.min(max, py));
      }
      el.style.setProperty('--py', py.toFixed(1) + 'px');

      if (l.fade) {
        // some suavemente quando o topo sai da tela
        var o = 1 + Math.min(0, (r.top + r.height / 2) / vh - 0.25) * 1.6;
        el.style.opacity = Math.max(0, Math.min(1, o)).toFixed(3);
      }
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  items.forEach(function (it) {
    if (it.l.bg) return;
    it.el.classList.add('parallax');
    if (it.l.zoom) it.el.classList.add('parallax--zoom');
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; onScroll(); });
  update();
})();
