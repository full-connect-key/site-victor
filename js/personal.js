/* Página Personal: imagem ampliada ao clicar (com setas, Esc e teclado) */
(function () {
  var pieces = [].slice.call(document.querySelectorAll('.piece'));
  var box = document.querySelector('.lightbox');
  if (!pieces.length || !box) return;

  var media = box.querySelector('.lightbox__media');
  var title = box.querySelector('.lightbox__title');
  var meta = box.querySelector('.lightbox__meta');
  var closeBtn = box.querySelector('.lightbox__close');
  var current = 0, lastFocus = null;

  function show(i) {
    current = (i + pieces.length) % pieces.length;
    var p = pieces[current];
    var src = p.querySelector('img, .piece__ph');
    media.innerHTML = '';
    if (src) media.appendChild(src.cloneNode(true));
    title.textContent = p.dataset.title || '';
    meta.textContent = [p.dataset.year, p.dataset.tech].filter(Boolean).join(' · ');
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
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

  pieces.forEach(function (p, i) {
    p.tabIndex = 0;
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', 'Ampliar: ' + (p.dataset.title || 'trabalho'));
    p.addEventListener('click', function () { open(i); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  closeBtn.addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
