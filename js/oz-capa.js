/* =========================================================
   Abertura animada — O Mágico de Oz
   1. a capa (SVG) se constrói no centro: moldura, tijolos, oval,
      título, personagens e autor;
   2. ganha perspectiva e encaixa no livro da foto da cesta;
   3. some, revelando a foto (o fundo da abertura).
   Roda toda vez que a página abre. Sem JS ou com "reduzir movimento",
   aparece só a foto.
   ========================================================= */
(function () {
  var hero = document.querySelector('.project-hero--oz');
  var box = document.querySelector('.oz-intro[data-src]');
  if (!hero || !box) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { box.remove(); return; }

  // foto da cesta: 1774 × 887. Cantos da capa do livro na foto (px da imagem)
  var PHOTO = { w: 1774, h: 887 };
  var BOOK = [[602, 181], [935, 131], [1045, 614], [715, 664]];
  var CW = 439.37, CH = 651.97;   // tamanho da capa (viewBox do SVG)
  var svg, timer;

  // mesma conta do background "cover" da abertura (posição 50% 40%; celular 44% 40%)
  function photoRect() {
    var W = hero.clientWidth, H = hero.clientHeight;
    var s = Math.max(W / PHOTO.w, H / PHOTO.h);
    var w = PHOTO.w * s, h = PHOTO.h * s;
    var px = window.matchMedia('(max-width: 700px)').matches ? 0.44 : 0.5;
    return { x: (W - w) * px, y: (H - h) * 0.4, s: s };
  }
  function bookCorners() {
    var r = photoRect();
    return BOOK.map(function (p) { return [r.x + p[0] * r.s, r.y + p[1] * r.s]; });
  }
  function flatCorners() {
    var W = hero.clientWidth, H = hero.clientHeight;
    var h = Math.min(H * 0.68, (W * 0.8) * CH / CW), w = h * CW / CH;
    var x = (W - w) / 2, y = (H - h) / 2 + H * 0.03;
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  }

  // homografia: retângulo da capa -> 4 cantos (matrix3d)
  function solve(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) {
      var m = i;
      for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k;
      var t = A[i]; A[i] = A[m]; A[m] = t; t = b[i]; b[i] = b[m]; b[m] = t;
      for (k = i + 1; k < n; k++) {
        var f = A[k][i] / A[i][i];
        for (j = i; j < n; j++) A[k][j] -= f * A[i][j];
        b[k] -= f * b[i];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      var s = b[i];
      for (j = i + 1; j < n; j++) s -= A[i][j] * x[j];
      x[i] = s / A[i][i];
    }
    return x;
  }
  function matrix(dst) {
    var src = [[0, 0], [CW, 0], [CW, CH], [0, CH]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], u = dst[i][0], v = dst[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    var h = solve(A, b);
    return 'matrix3d(' + [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1].join(',') + ')';
  }
  function place(c) { svg.style.transform = matrix(c); }
  function mix(a, b, t) { return a.map(function (p, i) { return [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]; }); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // marca as partes da capa para a animação de construção
  function tag() {
    var parts = [].filter.call(svg.children, function (el) { return el.tagName !== 'defs'; });
    // ordem do arquivo: fundo, moldura, tijolos, 2 detalhes rosa, autor, oval x2, arco x2, personagens, título, 2 traços
    var names = ['bg', 'frame', 'bricks', 'arc', 'arc', 'author', 'oval', 'oval', 'arc', 'arc', 'chars', 'title', 'dash', 'dash'];
    parts.forEach(function (el, i) { el.classList.add('oz-' + (names[i] || 'other')); });
    var frame = svg.querySelector('.oz-frame');
    if (frame) frame.setAttribute('pathLength', '1');
    // tijolos: cada fileira entra conforme a altura (de cima para baixo)
    [].forEach.call(svg.querySelectorAll('.oz-bricks > g > g > *'), function (row) {
      var bb = row.getBBox();
      row.classList.add('oz-brick');
      row.style.animationDelay = (0.55 + (bb.y / CH) * 1.1).toFixed(2) + 's';
    });
    // título: O, MÁGICO (letra a letra), DE, OZ
    var t = svg.querySelector('.oz-title');
    if (t) {
      var g = [].slice.call(t.children);
      if (g[0]) g[0].classList.add('oz-t-o');
      if (g[1]) [].forEach.call(g[1].children, function (l, i) { l.classList.add('oz-t-l'); l.style.animationDelay = (2.15 + i * 0.07).toFixed(2) + 's'; });
      if (g[2]) g[2].classList.add('oz-t-de');
      if (g[3]) g[3].classList.add('oz-t-oz');
    }
  }

  function run() {
    clearTimeout(timer);
    box.classList.remove('is-done', 'is-reveal');
    box.innerHTML = box.dataset.svg;
    svg = box.querySelector('svg');
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.style.width = CW + 'px'; svg.style.height = CH + 'px';
    tag();
    place(flatCorners());
    box.classList.add('is-ready');
    // 2. perspectiva até o livro da foto
    timer = setTimeout(function () {
      var from = flatCorners(), t0 = performance.now(), D = 1300;
      box.classList.add('is-reveal');            // o amarelo some e a foto aparece
      (function step(now) {
        var t = Math.min((now - t0) / D, 1);
        place(mix(from, bookCorners(), ease(t)));
        if (t < 1) requestAnimationFrame(step);
        else { box.classList.add('is-done'); }   // 3. a capa some: fica o livro real
      })(t0);
    }, 4600);
  }

  window.addEventListener('resize', function () {
    if (!svg) return;
    place(box.classList.contains('is-reveal') ? bookCorners() : flatCorners());
  });

  fetch(box.dataset.src)
    .then(function (r) { return r.text(); })
    .then(function (t) { box.dataset.svg = t; run(); })
    .catch(function () { box.remove(); });

  window.addEventListener('pageshow', function (e) { if (e.persisted && box.dataset.svg) run(); });
})();
