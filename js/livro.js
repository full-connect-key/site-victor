/* =========================================================
   Leitor do livro (O Mágico de Oz)
   As páginas ficam em data-folder, numeradas 001.webp, 002.webp...
   data-count = total de páginas.
   Desktop: página dupla (a capa abre sozinha, à direita).
   Celular: uma página por vez.
   Setas, teclado (← →), arrastar para o lado e tela cheia.
   ========================================================= */
(function () {
  var root = document.querySelector('.reader');
  if (!root) return;

  var folder = root.dataset.folder;
  var ext = root.dataset.ext || 'webp';
  var total = parseInt(root.dataset.count, 10);
  var book = root.querySelector('.reader__book');
  var L = root.querySelector('.reader__page--left img');
  var R = root.querySelector('.reader__page--right img');
  var flip = root.querySelector('.reader__flip');
  var flipFront = flip.querySelector('.reader__face--front img');
  var flipBack = flip.querySelector('.reader__face--back img');
  var count = root.querySelector('.reader__count');
  var range = root.querySelector('.reader__range');
  var prevBtn = root.querySelector('.reader__nav--prev');
  var nextBtn = root.querySelector('.reader__nav--next');
  var fsBtn = root.querySelector('.reader__fs');
  var mq = window.matchMedia('(max-width: 760px)');
  var busy = false;

  // pos = número da página da esquerda (no modo duplo) ou a página única
  // no duplo: 0 = capa sozinha à direita; depois 2-3, 4-5...
  var pos = 0;

  function src(n) { return folder + ('00' + n).slice(-3) + '.' + ext; }
  function single() { return mq.matches; }
  function set(img, n) {
    if (n >= 1 && n <= total) { img.src = src(n); img.alt = 'Página ' + n; img.parentNode.classList.remove('is-empty'); }
    else { img.removeAttribute('src'); img.alt = ''; img.parentNode.classList.add('is-empty'); }
  }
  function preload(n) { if (n >= 1 && n <= total) { var i = new Image(); i.src = src(n); } }

  function clamp() {
    if (single()) { pos = Math.min(Math.max(pos, 1), total); }
    else {
      if (pos % 2) pos -= 1;            // esquerda sempre par (0, 2, 4...)
      pos = Math.min(Math.max(pos, 0), total % 2 ? total - 1 : total);
    }
  }

  function render() {
    clamp();
    root.classList.toggle('is-single', single());
    if (single()) { set(R, pos); set(L, 0); }
    else { set(L, pos); set(R, pos + 1); }
    root.classList.toggle('is-cover', !single() && pos === 0);
    root.classList.toggle('is-end', !single() && pos + 1 > total);
    var label = single() ? pos : (pos === 0 ? 1 : (pos + 1 <= total ? pos + '–' + (pos + 1) : pos));
    count.textContent = label + ' / ' + total;
    range.value = single() ? pos : Math.max(pos, 1);
    prevBtn.disabled = single() ? pos <= 1 : pos <= 0;
    nextBtn.disabled = single() ? pos >= total : pos + 1 >= total;
    for (var k = 1; k <= 3; k++) { preload(pos + k + 1); preload(pos - k); }
  }

  function go(dir) {
    if (busy) return;
    var step = single() ? 1 : 2;
    var target = pos + dir * step;
    if (single() ? (target < 1 || target > total) : (target < 0 || target > total)) return;
    if (single() || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      book.classList.remove('is-slide-next', 'is-slide-prev');
      void book.offsetWidth;
      pos = target; render();
      book.classList.add(dir > 0 ? 'is-slide-next' : 'is-slide-prev');
      return;
    }
    // virada de página (modo duplo)
    busy = true;
    if (dir > 0) {
      set(flipFront, pos + 1); set(flipBack, target);
      flip.className = 'reader__flip is-next';
      set(R, target + 1);                 // por baixo já aparece a próxima direita
    } else {
      set(flipFront, pos); set(flipBack, target + 1);
      flip.className = 'reader__flip is-prev';
      set(L, target);                     // por baixo já aparece a esquerda anterior
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () { flip.classList.add('is-turning'); }); });
    setTimeout(function () {
      pos = target; render();
      flip.className = 'reader__flip';
      busy = false;
    }, 720);
  }

  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });
  // clicar na página da direita avança; na da esquerda volta
  root.querySelector('.reader__page--right').addEventListener('click', function () { go(1); });
  root.querySelector('.reader__page--left').addEventListener('click', function () { go(-1); });
  range.max = total;
  range.addEventListener('input', function () { pos = parseInt(range.value, 10); render(); });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  var tx = null;
  book.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  book.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    tx = null;
  });

  if (fsBtn) {
    if (!root.requestFullscreen) fsBtn.hidden = true;
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else root.requestFullscreen();
    });
    document.addEventListener('fullscreenchange', function () {
      root.classList.toggle('is-fullscreen', document.fullscreenElement === root);
      fsBtn.textContent = document.fullscreenElement === root ? 'Exit ✕' : 'Full screen ⤢';
    });
  }

  if (mq.addEventListener) mq.addEventListener('change', render);
  render();
})();
