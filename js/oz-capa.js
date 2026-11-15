/* =========================================================
   Construção da capa — O Mágico de Oz (seção "Visual identity")
   A capa (SVG) se monta quando a seção aparece na tela:
   moldura, tijolos, oval, arco, título, personagens e autor.
   O botão "Replay" monta de novo.
   ========================================================= */
(function () {
  var box = document.querySelector('.oz-build[data-src]');
  if (!box) return;
  var replay = document.querySelector('.oz-build__replay');
  var CH = 651.97, svgText = null, played = false;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tag(svg) {
    var parts = [].filter.call(svg.children, function (el) { return el.tagName !== 'defs'; });
    // ordem do arquivo: fundo, moldura, tijolos, 2 detalhes rosa, autor, oval x2, arco x2, personagens, título, 2 traços
    var names = ['bg', 'frame', 'bricks', 'arc', 'arc', 'author', 'oval', 'oval', 'arc', 'arc', 'chars', 'title', 'dash', 'dash'];
    parts.forEach(function (el, i) { el.classList.add('oz-' + (names[i] || 'other')); });
    var frame = svg.querySelector('.oz-frame');
    if (frame) frame.setAttribute('pathLength', '1');
    [].forEach.call(svg.querySelectorAll('.oz-bricks > g > g > *'), function (row) {
      var bb = row.getBBox();
      row.classList.add('oz-brick');
      row.style.animationDelay = (0.55 + (bb.y / CH) * 1.1).toFixed(2) + 's';
    });
    var t = svg.querySelector('.oz-title');
    if (t) {
      var g = [].slice.call(t.children);
      if (g[0]) g[0].classList.add('oz-t-o');
      if (g[1]) [].forEach.call(g[1].children, function (l, i) { l.classList.add('oz-t-l'); l.style.animationDelay = (2.15 + i * 0.07).toFixed(2) + 's'; });
      if (g[2]) g[2].classList.add('oz-t-de');
      if (g[3]) g[3].classList.add('oz-t-oz');
    }
  }

  function mount() {
    if (!svgText) return;
    box.classList.remove('is-play');
    box.innerHTML = svgText;
    var svg = box.querySelector('svg');
    svg.removeAttribute('width'); svg.removeAttribute('height');
    if (!still) { tag(svg); void box.offsetWidth; box.classList.add('is-play'); }
  }

  fetch(box.dataset.src)
    .then(function (r) { return r.text(); })
    .then(function (t) {
      svgText = t;
      if (!('IntersectionObserver' in window)) { mount(); return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !played) { played = true; mount(); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(box);
    })
    .catch(function () { box.innerHTML = '<img src="../img/oz/livro-frente.jpg" alt="">'; });

  if (replay) replay.addEventListener('click', function () { played = true; mount(); });
})();
