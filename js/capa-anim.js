/* Capa animada (Metrópole): coloca o SVG direto na página, para a animação
   começar do zero toda vez que a página abre, recarrega ou volta pelo histórico. */
(function () {
  var box = document.querySelector('.p-hero__art[data-src]');
  if (!box) return;
  var svgText = null;

  function mount() {
    if (!svgText) return;
    box.innerHTML = svgText; // recria o SVG: as animações recomeçam
  }

  fetch(box.dataset.src)
    .then(function (r) { return r.text(); })
    .then(function (t) { svgText = t.replace(/<\?xml[^>]*\?>/, ''); mount(); })
    .catch(function () {
      // sem fetch (ex.: arquivo aberto direto do computador): mostra a imagem parada
      box.innerHTML = '<img src="' + box.dataset.src + '" alt="" style="width:100%;height:100%;object-fit:cover">';
    });

  // voltando pelo botão "voltar" do navegador a página vem do cache: anima de novo
  window.addEventListener('pageshow', function (e) { if (e.persisted) mount(); });
})();
