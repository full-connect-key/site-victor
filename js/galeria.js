/* =========================================================
   Galeria de fotos do evento (ABF Expo 2026)

   COMO USAR
   1. Coloque as fotos na pasta indicada em data-folder, numeradas:
        001.jpg, 002.jpg, 003.jpg ... 100.jpg
   2. Ajuste data-count com o total de fotos.
   Enquanto uma foto não existir, aparece um espaço cinza no lugar.

   data-step = quantas fotos aparecem de cada vez (botão "See more photos")
   ========================================================= */
(function () {
  var root = document.querySelector('.event-gallery');
  if (!root) return;

  var folder = root.dataset.folder || '';
  var ext = root.dataset.ext || 'jpg';
  var total = parseInt(root.dataset.count, 10) || 0;
  var step = parseInt(root.dataset.step, 10) || 24;
  var alt = root.dataset.alt || 'Foto do evento';

  var grid = root.querySelector('.event-gallery__grid');
  var more = root.querySelector('.event-gallery__more');
  var counter = root.querySelector('.event-gallery__count');
  var shown = 0;

  // proporções variadas só para os espaços vazios (antes das fotos chegarem)
  var ratios = ['3 / 2', '2 / 3', '4 / 3', '1 / 1', '3 / 4', '16 / 10'];

  function pad(n) { return ('00' + n).slice(-3); }

  function placeholder(n) {
    var ph = document.createElement('div');
    ph.className = 'event-gallery__ph';
    ph.style.aspectRatio = ratios[(n * 7) % ratios.length];
    ph.textContent = pad(n);
    return ph;
  }

  function add(n) {
    var btn = document.createElement('button');
    btn.type = 'button';
    // ritmo a cada 12 fotos: a 1ª grande, a 7ª larga (fecha as fileiras certinho)
    btn.className = 'event-gallery__item' + ((n - 1) % 12 === 0 ? ' event-gallery__item--big' : (n - 7) % 12 === 0 ? ' event-gallery__item--wide' : '');
    btn.dataset.n = n;
    btn.setAttribute('aria-label', 'Ampliar foto ' + n + ' de ' + total);
    var img = new Image();
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = alt + ' ' + n;
    img.onerror = function () { btn.replaceChild(placeholder(n), img); };
    img.src = folder + pad(n) + '.' + ext;
    btn.appendChild(img);
    btn.addEventListener('click', function () { open(n); });
    grid.appendChild(btn);
  }

  function showMore() {
    var end = Math.min(total, shown + step);
    for (var n = shown + 1; n <= end; n++) add(n);
    shown = end;
    if (counter) counter.textContent = shown + ' / ' + total;
    if (more) more.hidden = shown >= total;
  }
  if (more) more.addEventListener('click', showMore);
  showMore();

  /* ---------- foto ampliada ---------- */
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Foto ampliada');
  box.hidden = true;
  box.innerHTML =
    '<button class="lightbox__close btn" type="button" aria-label="Fechar">Close ✕</button>' +
    '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Anterior">←</button>' +
    '<figure class="lightbox__fig"><div class="lightbox__media"></div>' +
    '<figcaption class="lightbox__cap"><span class="lightbox__meta"></span></figcaption></figure>' +
    '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Próxima">→</button>';
  document.body.appendChild(box);

  var media = box.querySelector('.lightbox__media');
  var meta = box.querySelector('.lightbox__meta');
  var closeBtn = box.querySelector('.lightbox__close');
  var current = 1, lastFocus = null, touchX = null;

  function show(n) {
    current = ((n - 1 + total) % total) + 1;
    media.innerHTML = '';
    var img = new Image();
    img.alt = alt + ' ' + current;
    img.onerror = function () { media.replaceChild(placeholder(current), img); };
    img.src = folder + pad(current) + '.' + ext;
    media.appendChild(img);
    meta.textContent = current + ' / ' + total;
    // pré-carrega a próxima
    var next = new Image(); next.src = folder + pad((current % total) + 1) + '.' + ext;
  }
  function open(n) {
    lastFocus = document.activeElement;
    show(n);
    box.hidden = false;
    document.documentElement.classList.add('lightbox-open');
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    closeBtn.focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.documentElement.classList.remove('lightbox-open');
    setTimeout(function () { box.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }

  closeBtn.addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // arrastar para os lados no celular
  box.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();
