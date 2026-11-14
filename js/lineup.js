/* Metrópole: ficha de suspeito ao clicar no line-up de personagens.
   Os textos vêm dos atributos data-* de cada .suspect__btn. */
(function () {
  var dlg = document.querySelector('.dossier');
  var btns = [].slice.call(document.querySelectorAll('.suspect__btn'));
  if (!dlg || !btns.length || typeof dlg.showModal !== 'function') return;
  var cur = 0;
  var img = dlg.querySelector('.dossier__photo');
  function fill(i) {
    cur = (i + btns.length) % btns.length;
    var d = btns[cur].dataset;
    img.src = btns[cur].querySelector('img').src;
    img.alt = d.name;
    dlg.querySelector('[data-f="n"]').textContent = d.n;
    dlg.querySelector('[data-f="name"]').textContent = d.name;
    dlg.querySelector('[data-f="meta"]').textContent = d.meta;
    dlg.querySelector('[data-f="metaPt"]').textContent = d.metaPt;
    dlg.querySelector('[data-f="bio"]').textContent = d.bio;
    dlg.querySelector('[data-f="bioPt"]').textContent = d.bioPt;
    dlg.querySelector('.dossier__card').classList.remove('is-swap');
    void dlg.offsetWidth;
    dlg.querySelector('.dossier__card').classList.add('is-swap');
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { fill(i); dlg.showModal(); document.documentElement.classList.add('has-dossier'); });
  });
  dlg.addEventListener('close', function () { document.documentElement.classList.remove('has-dossier'); btns[cur].focus(); });
  dlg.querySelector('.dossier__close').addEventListener('click', function () { dlg.close(); });
  [].forEach.call(dlg.querySelectorAll('.dossier__nav'), function (n) {
    n.addEventListener('click', function () { fill(cur + Number(n.dataset.step)); });
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // clique fora fecha
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') fill(cur + 1);
    if (e.key === 'ArrowLeft') fill(cur - 1);
  });
})();
