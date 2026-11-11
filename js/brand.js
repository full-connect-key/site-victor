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
     "typography": [
       { "name": "Nome da fonte", "role": "Primary", "use": "Títulos",
         "family": "'Nome da fonte', sans-serif",
         "weights": [["Regular", 400], ["Bold", 700]],
         "style": "font-stretch:125%",          // CSS extra (opcional)
         "dark": false,                         // cartão preto
         "specimen": false,                     // fonte não carrega no site: sem amostra "Aa"
         "source": "Adobe Fonts" }              // origem da fonte (opcional)
     ],
     "palette": [
       { "name": "Rosa", "hex": "#FF589E", "pantone": "213 C", "weight": 2,
         "rgb": "255 88 158", "cmyk": "0 65 38 0" }   // rgb/cmyk: calculados se faltarem
     ],
     "logo": {
       "src": "../img/logo.png", "alt": "Logo ...",
       "color": "light",                        // "light" = logo branco, "dark" = logo preto
       "backgrounds": ["gradient", "#111111"],  // opcional; padrão = cores da paleta + preto/branco
       "gradientClass": "gradient-bg",          // classe do degradê, se usar "gradient"
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
  function lead(text) {
    return text ? '<p class="block__lead">' + esc(text) + '</p>' : '';
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
    html += '<div class="container"><section class="block">' + head('Typography', data.typographyNote) + lead(data.typographyText) + '<div class="type">';
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
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 !?&amp;@#%()</p>' +
        '</article>';
    });
    html += '</div></section></div>';
  }

  /* ---------- Paleta ---------- */
  var palette = data.palette || [];
  if (palette.length) {
    html += '<section class="block block--full"><div class="container">' + head('Color palette', data.paletteNote) + lead(data.paletteText) + '</div><div class="palette-strip" style="--n:' + palette.length + '">';
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

  /* ---------- Logo ---------- */
  var logo = data.logo;
  if (logo && logo.src) {
    var bgs = logo.backgrounds || (function () {
      var list = palette.map(function (c) { return c.hex; });
      ['#111111', '#F4F4F4'].forEach(function (x) { if (list.indexOf(x) < 0) list.push(x); });
      return list;
    })();
    var img = '<img class="lab__art" src="' + esc(logo.src) + '" alt="' + esc(logo.alt || '') + '">';
    var imgDeco = '<img class="lab__art" src="' + esc(logo.src) + '" alt="">';
    var tabs = [{ id: 'logo', long: 'Logo', short: 'Logo' }];
    if (logo.clearSpace) tabs.push({ id: 'space', long: 'Área de proteção', short: 'Proteção' });
    if (logo.sizes && logo.sizes.length) tabs.push({ id: 'sizes', long: 'Tamanho mínimo', short: 'Mínimo' });

    html += '<div class="container"><section class="block">' + head('Logo', data.logoNote) + lead(data.logoText) + '<div class="lab">';
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
    html += '</div></section></div>';
  }

  mount.innerHTML = html;

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
