/* =========================================================
   Blocos de marca das páginas de projeto
   Tipografia · Paleta de cores · Logo (abas interativas)

   Cada página de projeto tem um <div id="brand"></div> onde os
   blocos aparecem, e um <script type="application/json" id="brand-data">
   com os dados daquele projeto. Só aparece o que estiver nos dados:
   sem "typography", sem bloco de tipografia; sem "logo", sem bloco
   de logo; etc. Formato (todos os campos são opcionais):

   {
     "fontsUrl": "https://fonts.googleapis.com/css2?family=...",   // se a fonte não for do site
     "typographyText": "Parágrafo opcional abaixo do título Typography",
     "paletteText": "Parágrafo opcional abaixo do título Color palette",
     "logoText": "Parágrafo opcional abaixo do título Logo",
     "typographyTextPt" / "paletteTextPt" / "logoTextPt": versão em português (aparece embaixo, menor),
     "order": ["logo", "typography", "palette"],   // ordem das seções (padrão: logo primeiro)
     "typography": [
       { "name": "Nome da fonte", "role": "Primary", "use": "Títulos",
         "family": "'Nome da fonte', sans-serif",
         "weights": [["Regular", 400], ["Bold", 700]],
         "style": "font-stretch:125%",          // CSS extra (opcional)
         "dark": false,                         // cartão preto
         "specimen": false,                     // fonte não carrega no site: sem amostra "Aa"
         "source": "Adobe Fonts" }              // origem da fonte (opcional)
     ],
     "paletteStyle": "bands",                  // opcional: "bands" (faixas, ex.: Piá), "cards" (cards em fundo preto, ex.: Helena; cada cor pode ter "span": 2) "evidence" (faixa proporcional + fichas; cada cor com "weight" em %) ou "blood" (manchas + plaquinhas de evidência, ex.: Metrópole; cada cor pode ter "namePt", "use", "usePt")
     "paletteFont": "'Montserrat', sans-serif", // opcional: fonte dos nomes nas faixas
     "palette": [
       { "name": "Rosa", "hex": "#FF589E", "pantone": "213 C", "weight": 2,
         "rgb": "255 88 158", "cmyk": "0 65 38 0" }   // rgb/cmyk: calculados se faltarem
     ],
     "logo": {
       "src": "../img/logo.png", "alt": "Logo ...",
       "color": "light",                        // "light" = logo branco, "dark" = logo preto
       "backgrounds": ["gradient", "#111111"],  // opcional; padrão = cores da paleta + preto/branco
       "gradientClass": "gradient-bg",          // classe do degradê, se usar "gradient"
       "reduction": "../img/reducao.svg",      // aba Redução (opcional)
       "versions": [{ "src": "...", "label": "Logo · positivo", "bg": "#fff", "small": false }],  // grade de versões (opcional)
       "clearSpace": "x = altura da letra P",   // aba Área de proteção (opcional)
       "sizes": [{ "width": 150, "label": "40 mm · 150 px" }]   // aba Tamanho mínimo (opcional)
     }
   }
   ========================================================= */
(function () {
  var mount = document.getElementById('brand');
  var dataEl = document.getElementById('brand-data');
  if (!mount || !dataEl) return;

  var data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { console.error('brand-data inválido', e); return; }

  if (data.fontsUrl) {
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = data.fontsUrl;
    document.head.appendChild(l);
  }

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* mancha de sangue procedural (SVG): manchas fundidas por um filtro "goo",
     com filetes de respingo e gotas soltas; cada semente gera um desenho diferente */
  function splatter(seed) {
    var r = (function (a) { return function () { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; }; })(seed * 7919 + 13);
    var f = function (v) { return v.toFixed(1); };
    var body = '', drops = '', k, q, id = 'goo' + seed;
    // 2 ou 3 núcleos de tamanhos diferentes, encostados
    var cores = [[100, 100, 34 + r() * 6]];
    var nc = 1 + Math.floor(r() * 2) + 1;
    for (k = 1; k < nc; k++) {
      var a0 = r() * Math.PI * 2, base = cores[0];
      cores.push([base[0] + Math.cos(a0) * (30 + r() * 14), base[1] + Math.sin(a0) * (24 + r() * 10), 14 + r() * 12]);
    }
    cores.forEach(function (c) {
      body += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(c[2] * .8) + '"/>';
      var m = 12 + Math.floor(r() * 8);                     // borda irregular: bolinhas no contorno
      for (q = 0; q < m; q++) {
        var a = r() * Math.PI * 2, d = c[2] * (.6 + r() * .5), s = c[2] * (.1 + r() * .26);
        body += '<circle cx="' + f(c[0] + Math.cos(a) * d) + '" cy="' + f(c[1] + Math.sin(a) * d) + '" r="' + f(s) + '"/>';
      }
    });
    // filetes: linhas afinando para fora, com gota na ponta
    var ns = 12 + Math.floor(r() * 8), c0 = cores[0];
    for (k = 0; k < ns; k++) {
      var b = r() * Math.PI * 2, from = c0[2] * .7, len = c0[2] * (.35 + r() * 1.1), w = 1.6 + r() * 3.2;
      var x1 = c0[0] + Math.cos(b) * from, y1 = c0[1] + Math.sin(b) * from;
      var x2 = c0[0] + Math.cos(b) * (from + len), y2 = c0[1] + Math.sin(b) * (from + len);
      var nx = -Math.sin(b) * w, ny = Math.cos(b) * w;
      body += '<polygon points="' + f(x1 + nx) + ',' + f(y1 + ny) + ' ' + f(x1 - nx) + ',' + f(y1 - ny) + ' ' + f(x2) + ',' + f(y2) + '"/>';
      if (r() < .7) body += '<circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="' + f(1.6 + r() * 2.6) + '"/>';
    }
    // gotas soltas: grandes perto, pequenas longe
    var nd = 14 + Math.floor(r() * 10);
    for (k = 0; k < nd; k++) {
      var g = r() * Math.PI * 2, t = r(), dist = c0[2] * (1.3 + t * 1.5), sz = Math.max(1.4, (1 - t) * (2 + r() * 8));
      drops += '<circle class="drop" style="--d:' + (k * .025 + .15).toFixed(2) + 's" cx="' + f(c0[0] + Math.cos(g) * dist) + '" cy="' + f(c0[1] + Math.sin(g) * dist * .85) + '" r="' + f(sz) + '"/>';
    }
    return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs>' +
      '<g class="splat"><g filter="url(#' + id + ')"><g class="blob">' + body + '</g>' + drops + '</g></g></svg>';
  }

  /* plaquinha de evidência em "tenda" (A-frame) branca, com o número na face da frente */
  function marker(num) {
    var ruler = '', k;
    for (k = 0; k < 8; k++) {                                   // régua quadriculada (escala forense)
      var x = 22 + k * 14;
      ruler += '<rect x="' + x + '" y="' + (k % 2 ? 112 : 106) + '" width="14" height="6" fill="#121212"/>';
      ruler += '<line x1="' + x + '" y1="118" x2="' + x + '" y2="130" stroke="#121212" stroke-width="1"/>';
      ruler += '<line x1="' + (x + 7) + '" y1="124" x2="' + (x + 7) + '" y2="130" stroke="#121212" stroke-width=".7"/>';
    }
    return '<svg class="pal-crime__marker" viewBox="0 0 200 150" aria-hidden="true">' +
      '<ellipse cx="104" cy="143" rx="94" ry="6" fill="rgba(0,0,0,.6)"/>' +
      '<polygon points="160,10 166,140 196,132" fill="#8f8c84"/>' +                 // interior da tenda
      '<polygon points="160,10 166,9 200,132 196,132" fill="#cfccc3"/>' +          // borda do painel de trás
      '<polygon points="14,136 166,140 160,10 18,8" fill="#F2F0E9"/>' +            // face da frente
      '<path d="M18 8 L160 10 L160 14 L18 12Z" fill="#fff"/>' +                    // dobra do topo
      '<circle cx="90" cy="14" r="1.6" fill="#b9b6ad"/>' +                          // furinho
      '<rect x="22" y="106" width="112" height="24" fill="none" stroke="#121212" stroke-width="1"/>' + ruler +
      '<text x="27" y="117" font-family="serenity, sans-serif" font-weight="700" font-size="6" fill="#F2F0E9">cm</text>' +
      '<text x="88" y="98" text-anchor="middle" font-family="serenity, Archivo, sans-serif" font-weight="700" font-size="92" fill="#121212">' + num + '</text>' +
      '</svg>';
  }

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
  }
  function toCmyk(rgb) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, k = 1 - Math.max(r, g, b);
    if (k === 1) return '0 0 0 100';
    return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k]
      .map(function (v) { return Math.round(v * 100); }).join(' ');
  }
  function isDark(hex) {
    var c = hexToRgb(hex).map(function (v) {
      v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    });
    // escuro = texto/logo branco tem mais contraste que preto
    return (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) < .179;
  }

  var n = 0;
  // texto de abertura de cada seção; com a versão em português (…TextPt), aparece embaixo, menor
  function lead(text, pt) {
    if (!text && !pt) return '';
    return '<div class="block__leadwrap">' + (text ? '<p class="block__lead">' + esc(text) + '</p>' : '') +
      (pt ? '<p class="block__lead-pt" lang="pt-BR">' + esc(pt) + '</p>' : '') + '</div>';
  }
  function head(title, note) {
    n++;
    return '<header class="block__head"><span class="block__num">' + (n < 10 ? '0' : '') + n +
      '</span><h2 class="block__title">' + esc(title) + '</h2>' +
      (note ? '<p class="block__note">' + esc(note) + '</p>' : '') + '</header>';
  }

  var html = '';
  var pillColors = ['var(--yellow)', 'var(--blue)', 'var(--pink)', 'var(--white)'];

  /* ---------- Tipografia ---------- */
  if (data.typography && data.typography.length) {
    html += '<div class="container"><section class="block">' + head('Typography', data.typographyNote) + lead(data.typographyText, data.typographyTextPt) + '<div class="type' + (data.typography.length === 3 ? ' type--3' : '') + '">';
    data.typography.forEach(function (f, i) {
      // "specimen": false → a fonte não carrega no site (ex.: Adobe Fonts sem kit):
      // mostra só nome, função e origem, sem desenhar a amostra com outra fonte.
      if (f.specimen === false) {
        html += '<article class="type__card type__card--name' + (f.dark ? ' type__card--dark' : '') + '">' +
          '<div class="type__top"><div>' +
            '<p class="type__name type__name--big">' + esc(f.name) + '</p>' +
            (f.use ? '<p class="type__use">' + esc(f.use) + '</p>' : '') +
          '</div>' + (f.role ? '<span class="pill" style="background:' + pillColors[i % 4] + '">' + esc(f.role) + '</span>' : '') + '</div>' +
          (f.weights && f.weights.length ? '<div class="type__weights">' + f.weights.map(function (w) {
            return '<span>' + esc(w[0]) + '</span>';
          }).join('') + '</div>' : '') +
          (f.source ? '<p class="type__source">' + esc(f.source) + '</p>' : '') +
          '</article>';
        return;
      }
      var st = 'font-family:' + f.family + ';' + (f.style || '');
      var heavy = f.weights && f.weights.length ? f.weights[f.weights.length - 1][1] : 700;
      html += '<article class="type__card' + (f.dark ? ' type__card--dark' : '') + '" style="' + esc(st) + '">' +
        '<div class="type__top"><div>' +
          '<p class="type__name" style="font-weight:' + heavy + '">' + esc(f.name) + '</p>' +
          (f.use ? '<p class="type__use">' + esc(f.use) + '</p>' : '') +
        '</div>' + (f.role ? '<span class="pill" style="background:' + pillColors[i % 4] + '">' + esc(f.role) + '</span>' : '') + '</div>' +
        '<p class="type__aa" style="font-weight:' + heavy + '">Aa</p>' +
        (f.weights && f.weights.length ? '<div class="type__weights">' + f.weights.map(function (w) {
          return '<span style="font-weight:' + w[1] + '">' + esc(w[0]) + '</span>';
        }).join('') + '</div>' : '') +
        '<p class="type__glyphs" style="font-weight:' + (f.glyphWeight || heavy) + '">' +
          (f.glyphs ? esc(f.glyphs).replace(/\n/g, '<br>') : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 !?&amp;@#%()') + '</p>' +
        '</article>';
    });
    html += '</div></section></div>';
  }

  var secType = html; html = '';

  /* ---------- Paleta ---------- */
  var palette = data.palette || [];
  if (palette.length) {
    if (data.paletteStyle === 'cards') {
      // cards arredondados em fundo preto, larguras variadas (span 1 ou 2 de 3 colunas)
      html += '<section class="block block--full"><div class="container">' + head('Color palette', data.paletteNote) + lead(data.paletteText, data.paletteTextPt) + '</div>' +
        '<div class="pal-cards-wrap"><div class="container"><div class="pal-cards">';
      palette.forEach(function (c, i) {
        var rgb = hexToRgb(c.hex);
        var cmyk = (c.cmyk || toCmyk(rgb)).split(' ').map(function (v) { return v + '%'; }).join(' ');
        html += '<button class="pal-card" type="button" style="--c:' + esc(c.hex) + ';--i:' + i + ';grid-column:span ' + (c.span || 1) + '" data-hex="' + esc(c.hex.toUpperCase()) + '" aria-label="' + esc(c.name) + ', copiar ' + esc(c.hex.toUpperCase()) + '">' +
          '<span class="pal-card__codes">' +
            '<span><b>RGB</b> ' + esc(c.rgb || rgb.join(' ')) + '</span>' +
            '<span><b>CMYK</b> ' + esc(cmyk) + '</span>' +
            '<span><b>HEX</b> ' + esc(c.hex.toUpperCase().replace('#', '')) + '</span>' +
          '</span><span class="pal-card__name">' + esc(c.name) + '</span></button>';
      });
      html += '</div></div></div><span class="pill pal-toast" role="status" aria-live="polite"></span></section>';
    } else if (data.paletteStyle === 'blood') {
      // manchas de sangue, uma por cor, com plaquinhas de evidência numeradas (ex.: Metrópole)
      html += '<section class="block block--full"><div class="container">' + head('Color palette', data.paletteNote) + lead(data.paletteText, data.paletteTextPt) + '</div>' +
        '<div class="pal-crime"><div class="container"><ol class="pal-crime__list">';
      palette.forEach(function (c, i) {
        var rgb = hexToRgb(c.hex);
        var lum = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114;
        html += '<li class="pal-crime__item" data-hex="' + esc(c.hex.toUpperCase()) + '" style="--c:' + esc(c.hex) + ';--i:' + i + ';--hl:' + (lum > 150 ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.16)') + (lum < 60 ? ';--rim:rgba(242,240,233,.55)' : '') + '">' +
          '<div class="pal-crime__scene">' +
            '<button class="pal-crime__stain" type="button" data-hex="' + esc(c.hex.toUpperCase()) + '" aria-label="' + esc(c.name) + ', copiar ' + esc(c.hex.toUpperCase()) + '">' + splatter(i + 3) + '</button>' +
            marker(i + 1) +
          '</div>' +
          '<div class="pal-crime__info">' +
            '<p class="pal-crime__kicker">Evidence Nº ' + ('0' + (i + 1)).slice(-2) + '</p>' +
            '<p class="pal-crime__name">' + esc(c.name) + (c.namePt ? '<span lang="pt-BR">' + esc(c.namePt) + '</span>' : '') + '</p>' +
            (c.use ? '<p class="pal-crime__use">' + esc(c.use) + (c.usePt ? '<span lang="pt-BR">' + esc(c.usePt) + '</span>' : '') + '</p>' : '') +
            '<p class="pal-crime__codes"><span><b>HEX</b> ' + esc(c.hex.toUpperCase()) + '</span><span><b>RGB</b> ' + esc(c.rgb || rgb.join(' ')) + '</span><span><b>CMYK</b> ' + esc(c.cmyk || toCmyk(rgb)) + '</span></p>' +
          '</div></li>';
      });
      html += '</ol></div></div><span class="pill pal-toast" role="status" aria-live="polite"></span></section>';
    } else if (data.paletteStyle === 'bands') {
      // faixas empilhadas: nome em 2 linhas e códigos ao lado, alternando o lado
      html += '<section class="block block--full"><div class="container">' + head('Color palette', data.paletteNote) + lead(data.paletteText, data.paletteTextPt) + '</div><div class="pal-bands"' + (data.paletteFont ? ' style="--pf:' + esc(data.paletteFont) + '"' : '') + '>';
      palette.forEach(function (c, i) {
        var rgb = hexToRgb(c.hex);
        var parts = String(c.name).split(' ');
        var first = parts.shift();
        var name = '<p class="pal-band__name"><b>' + esc(first) + '</b>' + (parts.length ? '<span>' + esc(parts.join(' ')) + '</span>' : '') + '</p>';
        var codes = '<p class="pal-band__codes">' +
          '<span><b>RGB</b> ' + esc(c.rgb || rgb.join(', ')) + '</span>' +
          '<span><b>CMYK</b> ' + esc(c.cmyk || toCmyk(rgb)) + '</span>' +
          '<span><b>HEX</b> ' + esc(c.hex.toUpperCase()) + '</span>' +
          (c.pantone ? '<span><b>PMS</b> ' + esc(c.pantone) + '</span>' : '') + '</p>';
        html += '<button class="pal-band' + (i % 2 ? ' pal-band--rev' : '') + '" style="--c:' + esc(c.hex) + ';--i:' + i + '" data-hex="' + esc(c.hex.toUpperCase()) + '" aria-label="' + esc(c.name) + ', copiar ' + esc(c.hex.toUpperCase()) + '">' +
          (i % 2 ? codes + name : name + codes) + '</button>';
      });
      html += '</div><span class="pill pal-toast" role="status" aria-live="polite"></span></section>';
    } else {
    html += '<section class="block block--full"><div class="container">' + head('Color palette', data.paletteNote) + lead(data.paletteText, data.paletteTextPt) + '</div><div class="palette-strip" style="--n:' + palette.length + '">';
    palette.forEach(function (c) {
      var rgb = hexToRgb(c.hex);
      var text = isDark(c.hex) ? '#fff' : '';
      html += '<div class="palette-strip__c" style="--c:' + esc(c.hex) + ';--w:' + (c.weight || 1) + (text ? ';--t:' + text : '') + '">' +
        '<p class="palette-strip__name">' + esc(c.name) + '</p>' +
        '<p class="palette-strip__codes"><b>' + esc(c.hex.toUpperCase()) + '</b>' +
          '<span>RGB ' + esc(c.rgb || rgb.join(' ')) + '</span>' +
          '<span>CMYK ' + esc(c.cmyk || toCmyk(rgb)) + '</span>' +
          (c.pantone ? '<span>Pantone ' + esc(c.pantone) + '</span>' : '') +
        '</p></div>';
    });
    html += '</div></section>';
    }
  }

  var secPalette = html; html = '';

  /* ---------- Logo ---------- */
  var logo = data.logo;
  if (logo && logo.layout === 'cards' && logo.versions) {
    // logo em cards (ex.: Helena): um card largo e dois menores, sem o bloco interativo
    html += '<div class="container"><section class="block">' + head('Logo', data.logoNote) + lead(data.logoText, data.logoTextPt) +
      '<div class="logo-cards">' + logo.versions.map(function (v, i) {
        return '<figure class="logo-card" style="--bg:' + esc(v.bg || '#000') + ';--i:' + i + (v.span ? ';grid-column:span ' + v.span : '') + '">' +
          '<img src="' + esc(v.src) + '" alt="' + esc(v.alt || '') + '" style="width:' + esc(v.width || '60%') + '"></figure>';
      }).join('') + '</div></section></div>';
  } else if (logo && logo.src) {
    var bgs = logo.backgrounds || (function () {
      var list = palette.map(function (c) { return c.hex; });
      ['#111111', '#F4F4F4'].forEach(function (x) { if (list.indexOf(x) < 0) list.push(x); });
      return list;
    })();
    var img = '<img class="lab__art" src="' + esc(logo.src) + '" alt="' + esc(logo.alt || '') + '">';
    var imgDeco = '<img class="lab__art" src="' + esc(logo.src) + '" alt="">';
    var tabs = [{ id: 'logo', long: 'Logo', short: 'Logo' }];
    if (logo.reduction) tabs.push({ id: 'reduction', long: 'Redução', short: 'Redução' });
    if (logo.clearSpace) tabs.push({ id: 'space', long: 'Área de proteção', short: 'Proteção' });
    if (logo.sizes && logo.sizes.length) tabs.push({ id: 'sizes', long: 'Tamanho mínimo', short: 'Mínimo' });

    html += '<div class="container"><section class="block">' + head('Logo', data.logoNote) + lead(data.logoText, data.logoTextPt) + '<div class="lab">';
    if (tabs.length > 1) {
      html += '<div class="lab__tabs" role="tablist" aria-label="Logo"><span class="lab__ink" aria-hidden="true"></span>' +
        tabs.map(function (t, i) {
          return '<button class="lab__tab" role="tab" aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : '') + '>' +
            '<span class="lab__long">' + t.long + '</span><span class="lab__short">' + t.short + '</span></button>';
        }).join('') + '</div>';
    }
    html += '<div class="lab__stage"><div class="lab__glow" aria-hidden="true"></div>';
    tabs.forEach(function (t, i) {
      html += '<div class="lab__panel' + (i === 0 ? ' is-active' : '') + '" role="tabpanel">';
      if (t.id === 'logo') html += '<div class="lab__logo">' + img + '</div>';
      if (t.id === 'reduction') html += '<div class="lab__logo lab__logo--reduction"><img class="lab__art" src="' + esc(logo.reduction) + '" alt="' + esc((logo.alt || 'Logo') + ' — redução') + '"></div>';
      if (t.id === 'space') html += '<div class="lab__logo lab__logo--guide"><div class="lab__guide">' + imgDeco +
        '<span class="lab__x lab__x--t">x</span><span class="lab__x lab__x--r">x</span>' +
        '<span class="lab__x lab__x--b">x</span><span class="lab__x lab__x--l">x</span></div></div>' +
        '<span class="pill lab__caption">' + esc(logo.clearSpace) + '</span>';
      if (t.id === 'sizes') html += '<div class="lab__sizes">' + logo.sizes.map(function (s) {
        return '<figure><img class="lab__art" src="' + esc(logo.src) + '" alt="" style="width:' + (+s.width || 100) + 'px">' +
          '<figcaption class="pill">' + esc(s.label || '') + '</figcaption></figure>';
      }).join('') + '</div>';
      html += '</div>';
    });
    html += '</div>';
    if (bgs.length > 1) {
      html += '<div class="lab__bar"><p class="lab__hint"><b>Passe o mouse</b> ou toque no logo · escolha um fundo →</p><div class="lab__colors">' +
        bgs.map(function (b, i) {
          var grad = b === 'gradient';
          return '<button class="lab__color" aria-pressed="' + (i === 0) + '" data-bg="' + esc(b) + '" aria-label="' + (grad ? 'Degradê' : esc(b)) + '"' +
            ' style="' + (grad ? 'background:linear-gradient(135deg,#ff589e,#ffd900 50%,#ace107 70%,#58aeff)' : '--c:' + esc(b)) + '"></button>';
        }).join('') + '</div></div>';
    }
    html += '</div>'; // fecha o .lab
    if (logo.versions && logo.versions.length) {
      html += '<div class="logo-versions">' + logo.versions.map(function (v) {
        return '<figure class="logo-version" style="--bg:' + esc(v.bg || '#000') + '">' +
          '<img src="' + esc(v.src) + '" alt="' + esc(v.alt || v.label || '') + '"' + (v.small ? ' class="is-small"' : '') + '>' +
          '<figcaption class="pill">' + esc(v.label || '') + '</figcaption></figure>';
      }).join('') + '</div>';
    }
    html += '</section></div>';
  }

  var secLogo = html;
  // ordem das seções: Logo → Tipografia → Paleta (pode trocar com "order" nos dados)
  var parts = { logo: secLogo, typography: secType, palette: secPalette };
  html = (data.order || ['logo', 'typography', 'palette']).map(function (k) { return parts[k] || ''; }).join('');
  // renumera 01, 02, 03 na ordem final
  var k = 0;
  html = html.replace(/<span class="block__num">\d+<\/span>/g, function () { k++; return '<span class="block__num">' + (k < 10 ? '0' : '') + k + '</span>'; });

  mount.innerHTML = html;

  /* ---------- Logo em cards: entrada ao rolar ---------- */
  var lc = mount.querySelector('.logo-cards');
  if (lc) {
    if ('IntersectionObserver' in window) {
      var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { lc.classList.add('is-in'); lio.disconnect(); } }); }, { threshold: .2 });
      lio.observe(lc);
    } else lc.classList.add('is-in');
  }

  /* ---------- Paleta em faixas: entrada ao rolar + copiar o código ---------- */
  var bands = [].slice.call(mount.querySelectorAll('.pal-band, .pal-card, .pal-ev__seg, .pal-crime__item'));
  if (bands.length) {
    if ('IntersectionObserver' in window) {
      // observa o bloco (as faixas começam fora da tela, deslocadas para o lado)
      var bio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { bands.forEach(function (b) { b.classList.add('is-in'); }); bio.disconnect(); }
        });
      }, { threshold: .15 });
      bio.observe(mount.querySelector('.pal-bands, .pal-cards, .pal-ev, .pal-crime'));
    } else bands.forEach(function (b) { b.classList.add('is-in'); });
    var toast = mount.querySelector('.pal-toast'), tt;
    bands.forEach(function (b) {
      b.addEventListener('click', function () {
        var hex = b.dataset.hex;
        if (navigator.clipboard) navigator.clipboard.writeText(hex).catch(function () {});
        toast.textContent = hex + ' copiado!';
        toast.style.background = hex;
        toast.classList.add('is-on');
        clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 1500);
      });
    });
  }

  /* ---------- Interação do bloco de logo ---------- */
  var lab = mount.querySelector('.lab');
  if (!lab) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabEls = [].slice.call(lab.querySelectorAll('.lab__tab'));
  var panels = [].slice.call(lab.querySelectorAll('.lab__panel'));
  var ink = lab.querySelector('.lab__ink');
  var stage = lab.querySelector('.lab__stage');
  var glow = lab.querySelector('.lab__glow');
  var colorEls = [].slice.call(lab.querySelectorAll('.lab__color'));
  var logoIsLight = (logo.color || 'dark') === 'light';

  function bounce(panel, cls) {
    if (reduce || !panel) return;
    var el = panel.querySelector('.lab__logo');
    if (!el) return;
    el.classList.remove('is-pop', 'is-squash');
    void el.offsetWidth;
    el.classList.add(cls || 'is-pop');
  }
  function activePanel() { return panels.filter(function (p) { return p.classList.contains('is-active'); })[0]; }
  function moveInk(t) { if (ink && t) { ink.style.left = t.offsetLeft + 'px'; ink.style.width = t.offsetWidth + 'px'; } }
  function select(i) {
    tabEls.forEach(function (t, j) { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach(function (p, j) { p.classList.toggle('is-active', i === j); });
    moveInk(tabEls[i]);
    bounce(panels[i]);
  }
  tabEls.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      var j = (i + k + tabEls.length) % tabEls.length;
      tabEls[j].focus(); select(j);
    });
  });
  if (tabEls.length) {
    var place = function () { moveInk(tabEls.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]); };
    window.addEventListener('resize', place);
    if (document.fonts) document.fonts.ready.then(place); else place();
    setTimeout(place, 300);
  }

  function setBg(b) {
    var grad = b === 'gradient';
    var gc = logo.gradientClass || 'gradient-bg';
    stage.classList.toggle(gc, grad);
    stage.classList.toggle('has-image', grad);
    stage.style.setProperty('--stage', grad ? '' : b);
    var dark = grad ? false : isDark(b);
    stage.classList.toggle('is-dark', dark);
    // logo branco some em fundo claro → vira preto; logo preto some em fundo escuro → vira branco
    stage.classList.toggle('logo-to-dark', logoIsLight && !grad && !dark);
    stage.classList.toggle('logo-to-light', !logoIsLight && dark);
  }
  colorEls.forEach(function (c) {
    c.addEventListener('click', function () {
      colorEls.forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      setBg(c.dataset.bg);
      bounce(activePanel());
    });
  });
  setBg(bgs[0]);

  if (!reduce) {
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      [].forEach.call(stage.querySelectorAll('.lab__logo'), function (el) {
        el.style.setProperty('--ry', (x * 22).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 18).toFixed(2) + 'deg');
        el.style.setProperty('--tx', (x * 26).toFixed(1) + 'px');
        el.style.setProperty('--ty', (y * 18).toFixed(1) + 'px');
      });
      glow.style.setProperty('--gx', (x + .5) * 100 + '%');
      glow.style.setProperty('--gy', (y + .5) * 100 + '%');
    });
    stage.addEventListener('pointerleave', function () {
      [].forEach.call(stage.querySelectorAll('.lab__logo'), function (el) {
        ['--rx', '--ry', '--tx', '--ty'].forEach(function (p) { el.style.removeProperty(p); });
      });
    });
    stage.addEventListener('click', function (e) {
      if (e.target.closest('.lab__logo')) bounce(e.target.closest('.lab__panel'), 'is-squash');
    });
  }
})();
