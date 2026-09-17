/* =============================================================
   IVAN STUDIO — ИНТЕРАКТИВ
   Без библиотек. Весь контент приходит из data.js.

   1 утилиты · 2 SEO · 3 контакты · 4 тема · 5 курсор · 6 магнит
   7 навигация · 8 обложки · 9 схемы · 10 работы · 11 кейс
   12 услуги · 13 подход · 14 о студии · 15 расчёт · 16 заявка
   17 reveal · 18 параллакс
   ============================================================= */
(function () {
  'use strict';

  /* ---------- 1. УТИЛИТЫ ---------- */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var nf = new Intl.NumberFormat('ru-RU');

  function money(n) {
    var v = Number(n);
    if (!isFinite(v) || v < 0) v = 0;
    return nf.format(Math.round(v)) + ' ₽';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rafThrottle(fn) {
    var queued = false, args = null;
    return function () {
      args = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn.apply(null, args); });
    };
  }
  var smooth = function () { return reduced.matches ? 'auto' : 'smooth'; };
  var particleField = null;   // поле частиц первого экрана, см. раздел 19
  var shaderField = null;     // фон-нити на весь сайт от витрины до подвала, см. раздел 22

  /* ---------- 2. SEO ---------- */
  (function seo() {
    if (typeof SITE === 'undefined' || !SITE.url) return;
    var base = SITE.url.replace(/\/+$/, '') + '/';
    var link = document.createElement('link');
    link.rel = 'canonical';
    link.href = base;
    document.head.appendChild(link);
    var og = document.querySelector('meta[property="og:url"]');
    if (!og) {
      og = document.createElement('meta');
      og.setAttribute('property', 'og:url');
      document.head.appendChild(og);
    }
    og.setAttribute('content', base);
    if (SITE.ogImage) {
      var im = document.createElement('meta');
      im.setAttribute('property', 'og:image');
      im.setAttribute('content', SITE.ogImage);
      document.head.appendChild(im);
    }
  })();

  /* ---------- 3. КОНТАКТЫ ---------- */
  function applyContacts() {
    var map = {
      tg:   { href: CONTACTS.telegramUrl, text: CONTACTS.telegramHandle },
      mail: { href: 'mailto:' + CONTACTS.email, text: CONTACTS.email },
      tel:  { href: CONTACTS.phoneHref, text: CONTACTS.phone }
    };
    Object.keys(map).forEach(function (k) {
      $$('[data-c="' + k + '"]').forEach(function (a) { if (a.tagName === 'A') a.href = map[k].href; });
      $$('[data-c-text="' + k + '"]').forEach(function (s) { s.textContent = map[k].text; });
    });
  }

  /* ---------- 4. ТЕМА ----------
     Переключателя больше нет — сайт всегда тёмный (см. токены :root
     в styles.css). Тут только цвет строки браузера на всякий случай
     (в head.html он уже стоит статически). */
  (function () {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#0A0A0B');
  })();

  /* ---------- 5. КУРСОР ---------- */
  var cursor = $('#cursor'), cLabel = $('#cursorLabel');
  if (cursor && fine.matches && !reduced.matches) {
    document.body.classList.add('cursor-on');
    var cx = 0, cy = 0, tx = 0, ty = 0, running = false;
    function step() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3) { running = false; return; }
      requestAnimationFrame(step);
    }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cursor.classList.contains('on')) { cx = tx; cy = ty; cursor.classList.add('on'); }
      if (!running) { running = true; requestAnimationFrame(step); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('on'); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var labelled = t.closest && t.closest('[data-cursor]');
      if (labelled) {
        cursor.dataset.mode = 'label';
        cLabel.textContent = labelled.getAttribute('data-cursor');
        return;
      }
      var link = t.closest && t.closest('a, button, label, [role="button"], input, textarea');
      cursor.dataset.mode = link ? 'link' : '';
      cLabel.textContent = '';
    }, { passive: true });
  }

  /* ---------- 6. МАГНИТНЫЕ КНОПКИ ---------- */
  function magnetise(node) {
    if (!fine.matches || reduced.matches || node.dataset.magnetised) return;
    node.dataset.magnetised = '1';
    var max = 8, box = null;
    var move = rafThrottle(function (x, y) {
      if (!box) return;
      var dx = (x - (box.left + box.width / 2)) / (box.width / 2);
      var dy = (y - (box.top + box.height / 2)) / (box.height / 2);
      node.style.transform = 'translate(' + (dx * max).toFixed(1) + 'px,' + (dy * max * 0.6).toFixed(1) + 'px)';
    });
    node.addEventListener('mouseenter', function () { box = node.getBoundingClientRect(); });
    node.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
    node.addEventListener('mouseleave', function () { box = null; node.style.transform = ''; });
  }
  function wireMagnets(scope) { $$('[data-magnetic]', scope || document).forEach(magnetise); }

  /* ---------- 7. НАВИГАЦИЯ ---------- */
  var nav = $('#nav'), burger = $('#burger'), sheet = $('#sheet');

  // дублируем подпись для «переката» при наведении
  $$('.nav__link span').forEach(function (s) { s.setAttribute('data-copy', s.textContent); });

  var syncNav = rafThrottle(function () { nav.classList.toggle('stuck', window.scrollY > 20); });
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });

  // светлый текст навигации только пока она над тёмным первым экраном
  (function navOverHero() {
    var hero = $('#top');
    if (!hero) return;
    var io = new IntersectionObserver(function (en) {
      nav.classList.toggle('on-hero', en[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 });
    io.observe(hero);
  })();

  var navLinks = $$('.nav__link');
  var linkBySection = {};
  navLinks.forEach(function (l) {
    var id = l.getAttribute('href').slice(1);
    if (document.getElementById(id)) linkBySection[id] = l;
  });
  var navObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var link = linkBySection[en.target.id];
      navLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(linkBySection).forEach(function (id) { navObs.observe(document.getElementById(id)); });

  function toggleSheet(open) {
    sheet.classList.toggle('open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('is-locked', open);
    $$('.sheet__link', sheet).forEach(function (a, i) {
      a.style.transitionDelay = open ? (0.05 + i * 0.05) + 's' : '';
    });
    if (open) { var f = $('.sheet__link', sheet); if (f) f.focus({ preventScroll: true }); }
    else burger.focus({ preventScroll: true });
  }
  burger.addEventListener('click', function () { toggleSheet(!sheet.classList.contains('open')); });
  $$('.sheet__link, .sheet__foot a', sheet).forEach(function (a) {
    a.addEventListener('click', function () { toggleSheet(false); });
  });

  /* ---------- 9. СХЕМЫ ЭТАПОВ ---------- */
  function visWrap(inner) {
    return '<svg viewBox="0 0 420 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<rect width="420" height="180" fill="var(--ground-2)"/>' + inner + '</svg>';
  }
  var STEP_VIS = [
    function () {
      var g = '';
      for (var y = 0; y < 7; y++) for (var x = 0; x < 16; x++) {
        var on = (x > 4 && x < 11 && y > 1 && y < 5) && ((x + y) % 3 === 0);
        g += '<circle cx="' + (30 + x * 24) + '" cy="' + (24 + y * 22) + '" r="' + (on ? 3.2 : 1.8) +
             '" fill="' + (on ? 'var(--acc)' : 'var(--line-2)') + '"/>';
      }
      return visWrap(g + '<rect x="112" y="34" width="168" height="94" fill="none" stroke="var(--acc)" stroke-width="1.2" stroke-dasharray="5 5"/>');
    },
    function () {
      var g = '<rect x="176" y="20" width="68" height="24" rx="2" fill="var(--acc)"/>' +
              '<path d="M210 44v22M104 66h212M104 66v20M210 66v20M316 66v20" stroke="var(--line-2)" stroke-width="1.2" fill="none"/>';
      var xs = [70, 176, 282];
      for (var i = 0; i < 3; i++) {
        g += '<rect x="' + xs[i] + '" y="86" width="68" height="22" rx="2" fill="none" stroke="var(--line-2)"/>' +
             '<rect x="' + (xs[i] + 10) + '" y="120" width="48" height="6" rx="3" fill="var(--line-2)" opacity=".7"/>' +
             '<rect x="' + (xs[i] + 10) + '" y="134" width="30" height="6" rx="3" fill="var(--line-2)" opacity=".45"/>';
      }
      return visWrap(g);
    },
    function () {
      var g = '<rect x="24" y="22" width="372" height="136" rx="3" fill="none" stroke="var(--line-2)"/>' +
              '<rect x="24" y="22" width="372" height="22" fill="var(--line-2)" opacity=".3"/>' +
              '<rect x="24" y="44" width="86" height="114" fill="var(--line-2)" opacity=".15"/>';
      for (var i = 0; i < 4; i++) {
        g += '<rect x="36" y="' + (58 + i * 22) + '" width="' + (62 - i * 6) + '" height="6" rx="3" fill="var(--line-2)"/>';
      }
      return visWrap(g +
        '<rect x="126" y="58" width="120" height="10" rx="2" fill="var(--acc)"/>' +
        '<rect x="126" y="76" width="200" height="6" rx="3" fill="var(--line-2)"/>' +
        '<rect x="126" y="88" width="160" height="6" rx="3" fill="var(--line-2)" opacity=".6"/>' +
        '<rect x="126" y="112" width="112" height="32" rx="2" fill="none" stroke="var(--acc)"/>' +
        '<rect x="250" y="112" width="112" height="32" rx="2" fill="none" stroke="var(--line-2)"/>');
    },
    function () {
      var g = '<path d="M32 148 C 140 148, 150 34, 300 34" fill="none" stroke="var(--acc)" stroke-width="2"/>' +
              '<path d="M32 148 H388 M32 148 V26" stroke="var(--line-2)" stroke-width="1"/>' +
              '<path d="M32 148 L140 148 M300 34 L300 148" stroke="var(--line-2)" stroke-width="1" stroke-dasharray="4 4"/>' +
              '<circle cx="32" cy="148" r="4" fill="var(--acc)"/><circle cx="300" cy="34" r="4" fill="var(--acc)"/>';
      for (var i = 1; i <= 5; i++) {
        g += '<circle cx="' + (300 + i * 17) + '" cy="34" r="' + (3.2 - i * 0.5) +
             '" fill="var(--acc)" opacity="' + (0.6 - i * 0.1).toFixed(2) + '"/>';
      }
      return visWrap(g);
    }
  ];

  /* ---------- 10. РАБОТЫ ---------- */
  var ALL = PROJECTS.concat(CONCEPTS);
  var OPEN_ABLE = ALL.filter(function (p) { return p.status !== 'soon'; });

  /* ---------- 10б. ПЕРВЫЙ ЭКРАН: УСТРОЙСТВА С РЕАЛЬНЫМ ПРОЕКТОМ ---------- */
  var ARROW = '<svg class="arr" width="15" height="15" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  (function buildHero() {
    var cfg = (typeof HERO !== 'undefined') ? HERO : null;
    if (!cfg) return;
    var project = OPEN_ABLE.filter(function (p) { return p.id === cfg.heroProject; })[0] || OPEN_ABLE[0];

    var el = $('#heroEyebrow'); if (el) el.textContent = cfg.eyebrow || '';
    el = $('#heroText');        if (el) el.textContent = cfg.text || '';
    el = $('#heroScroll');      if (el) el.textContent = cfg.scroll || '';

    el = $('#heroTitle');
    if (el) el.innerHTML = (cfg.lines || []).map(function (l) {
      return '<span class="ln' + (l.soft ? ' ln--soft' : '') + '"><span>' + esc(l.text) + '</span></span>';
    }).join('');

    el = $('#heroCta');
    if (el && cfg.primary && cfg.secondary) {
      el.innerHTML =
        '<a class="btn btn--pill" href="' + esc(cfg.primary.href) + '" data-magnetic>' +
          esc(cfg.primary.label) + ARROW + '</a>' +
        '<a class="link-arrow mono" href="' + esc(cfg.secondary.href) + '">' +
          esc(cfg.secondary.label) + ARROW + '</a>';
      wireMagnets(el);
    }

    el = $('#heroIndex');
    if (el && project) {
      el.textContent = project.number + ' / ' + String(OPEN_ABLE.length).padStart(2, '0');
    }

  })();

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('open')) { toggleSheet(false); }
  });

  /* ---------- 12. УСЛУГИ ---------- */
  var svcList = $('#svcList');
  if (svcList) {
    SERVICES.forEach(function (s, i) {
      var a = document.createElement('a');
      a.className = 'srow';
      a.href = '#brief';
      a.setAttribute('data-cursor', 'Заявка');
      a.setAttribute('aria-label', s.title + ' — перейти к заявке с этим вариантом');
      a.innerHTML =
        '<span class="srow__n mono">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span><span class="srow__lab mono">' + esc(s.label || '') + '</span>' +
        '<h3 class="srow__title">' + esc(s.title) + '</h3></span>' +
        '<p class="srow__scope">' + esc(s.scope) + '</p>' +
        '<span class="srow__price">от ' + money(s.price) + '</span>' +
        '<span class="srow__arr" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden=\"true\"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>';
      a.addEventListener('click', function () { prefillFromService(s); });
      svcList.appendChild(a);
    });
  }
  var svcNote = $('#svcNote');
  if (svcNote && typeof SERVICES_NOTE === 'string') svcNote.textContent = SERVICES_NOTE;

  /* ---------- 13. ПОДХОД ---------- */
  var procList = $('#procList');
  if (procList) {
    APPROACH.forEach(function (s, i) {
      var d = document.createElement('article');
      d.className = 'prow';
      d.innerHTML =
        '<span class="prow__n mono">' + esc(s.number) + '</span>' +
        '<div class="prow__txt">' +
          '<span class="prow__lab mono">' + esc(s.label || '') + '</span>' +
          '<h3>' + esc(s.title) + '</h3>' +
          '<p>' + esc(s.text) + '</p>' +
          '<p>' + esc(s.detail) + '</p>' +
        '</div>' +
        '<div class="prow__vis">' + STEP_VIS[i % STEP_VIS.length]() + '</div>';
      procList.appendChild(d);
    });
    var rail = document.createElement('span');
    rail.className = 'prows__rail';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<i></i>';
    procList.appendChild(rail);
    var fill = $('i', rail);

    var pObs = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target.classList.toggle('active', e.isIntersecting); });
    }, { rootMargin: '-42% 0px -42% 0px' });
    $$('.prow', procList).forEach(function (p) { pObs.observe(p); });

    // линия наполняется по мере прохождения секции
    var syncRail = rafThrottle(function () {
      var box = procList.getBoundingClientRect();
      var vh = window.innerHeight;
      var passed = (vh * 0.62 - box.top) / box.height;
      fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, passed)).toFixed(3) + ')';
    });
    syncRail();
    window.addEventListener('scroll', syncRail, { passive: true });
    window.addEventListener('resize', syncRail, { passive: true });
  }

  /* ---------- 14. О СТУДИИ ---------- */
  var aboutGrid = $('#aboutGrid');
  if (aboutGrid) {
    aboutGrid.innerHTML =
      '<div>' +
        '<p class="about__lead">' + esc(ABOUT.lead || ABOUT.text) + '</p>' +
        (ABOUT.lead ? '<p class="about__body">' + esc(ABOUT.text) + '</p>' : '') +
        (ABOUT.how ? '<p class="about__body">' + esc(ABOUT.how) + '</p>' : '') +
        '<p class="about__kicker">' + esc(ABOUT.kicker) + '</p>' +
        '<ul class="about__roles">' + ABOUT.roles.map(function (r) {
          return '<li>' + esc(r) + '</li>';
        }).join('') + '</ul>' +
      '</div>' +
      '<div>' +
        '<dl class="about__meta">' + (ABOUT.meta || []).map(function (m) {
          return '<div><dt class="mono">' + esc(m.k) + '</dt><dd>' + esc(m.v) + '</dd></div>';
        }).join('') + '</dl>' +
        (ABOUT.portrait
          ? '<div class="about__portrait" style="margin-top:var(--s4)"><img src="' + esc(ABOUT.portrait) +
            '" alt="Иван — дизайнер Ivan Studio" loading="lazy" decoding="async"></div>'
          : '') +
      '</div>';
  }

  /* ---------- 15. РАСЧЁТ (удалено) ---------- */

  /* ---------- 16. ЗАЯВКА ---------- */
  var briefForm = $('#briefForm'), briefMain = $('#briefMain'), briefTicks = $('#briefTicks');
  var answers = {}, stepIndex = 0, sending = false, firstRender = true;

  try {
    var draft = JSON.parse(localStorage.getItem('ivan-brief-draft') || '{}');
    if (draft && typeof draft === 'object') answers = draft;
  } catch (e) {}

  function saveDraft() {
    try { localStorage.setItem('ivan-brief-draft', JSON.stringify(answers)); } catch (e) {}
  }
  function stepDone(s) {
    if (s.type === 'choice') return !!answers[s.id];
    if (s.type === 'contact') return !!(answers.name || answers.telegram || answers.phone || answers.email);
    return !!answers.about;
  }

  function renderTicks() {
    briefTicks.innerHTML = BRIEF_STEPS.map(function (s, i) {
      var cls = i === stepIndex ? 'now' : (stepDone(s) ? 'done' : '');
      var locked = i > stepIndex && !stepDone(s);
      return '<button class="tick ' + cls + '" type="button" data-goto="' + i + '"' +
        (locked ? ' disabled' : '') + (i === stepIndex ? ' aria-current="step"' : '') + '>' +
        '<span class="mono">' + s.number + '</span>' +
        '<span class="tick__t">' + esc(s.short) + '</span></button>';
    }).join('');
    $$('[data-goto]', briefTicks).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Number(b.getAttribute('data-goto'));
        if (!b.disabled) { stepIndex = i; renderStep(); }
      });
    });
    var now = $('.tick.now', briefTicks);
    if (now && briefTicks.scrollWidth > briefTicks.clientWidth) {
      briefTicks.scrollTo({ left: now.offsetLeft - 20, behavior: smooth() });
    }
  }

  function renderStep() {
    var s = BRIEF_STEPS[stepIndex], body;

    if (s.type === 'choice') {
      body = '<fieldset class="tiles-wrap"><legend class="vh">' + esc(s.question) + '</legend>' +
        '<div class="tiles">' + s.options.map(function (o, i) {
          return '<label class="tile"><input type="radio" id="b-' + s.id + '-' + i + '" name="b-' + s.id +
            '" value="' + esc(o) + '"' + (answers[s.id] === o ? ' checked' : '') + '>' +
            '<span>' + esc(o) + '</span></label>';
        }).join('') + '</div></fieldset>';
    } else if (s.type === 'contact') {
      body = '<div class="grid2">' + s.fields.map(function (f) {
        return '<div class="field" data-field="' + f.id + '">' +
          '<label class="mono" for="f-' + f.id + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>' +
          '<input id="f-' + f.id + '" name="' + f.id + '" type="' + f.type + '" autocomplete="' + f.autocomplete +
          '" value="' + esc(answers[f.id] || '') + '" placeholder="' + esc(f.placeholder || '') + '"' +
          (f.required ? ' aria-required="true"' : '') + '>' +
          '<span class="err" id="err-' + f.id + '"></span></div>';
      }).join('') + '</div>';
    } else {
      body = '<div class="field"><label class="vh" for="f-about">Описание проекта</label>' +
        '<textarea id="f-about" name="about" placeholder="' + esc(s.placeholder) + '">' + esc(answers.about || '') + '</textarea></div>';
    }

    var isLast = stepIndex === BRIEF_STEPS.length - 1;
    briefMain.innerHTML =
      '<div class="stage-in">' +
        '<p class="brief__step mono">Шаг ' + s.number + ' / 06</p>' +
        '<h3 class="brief__q" id="briefQ" tabindex="-1">' + esc(s.question) + '</h3>' +
        (s.hint ? '<p class="brief__hint">' + esc(s.hint) + '</p>' : '') +
        '<div class="brief__fields">' + body + '</div>' +
        '<p class="brief__err" id="briefErr" role="alert"></p>' +
      '</div>' +
      '<div class="brief__nav">' +
        (stepIndex > 0 ? '<button class="brief__back" type="button" id="briefBack">← Назад</button>' : '') +
        '<button class="btn" type="button" id="briefNext" data-magnetic>' + (isLast ? 'Отправить заявку' : 'Далее') +
          '<svg class="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>' +
        '</button>' +
        '<span class="brief__count mono">' + s.number + ' / 06</span>' +
      '</div>';

    wireMagnets(briefMain);
    renderTicks();

    $$('input[type="radio"]', briefMain).forEach(function (r) {
      r.addEventListener('change', function () {
        answers[BRIEF_STEPS[stepIndex].id] = r.value;
        saveDraft(); renderTicks(); setErr('');
      });
    });
    $$('input:not([type="radio"]), textarea', briefMain).forEach(function (f) {
      var mark = function () {
        var wrap = f.closest('.field');
        if (wrap) wrap.classList.toggle('is-filled', f.value.trim().length > 1);
      };
      mark();
      f.addEventListener('input', function () {
        answers[f.name] = f.value;
        saveDraft();
        mark();
        var wrap = f.closest('.field');
        if (wrap) {
          wrap.classList.remove('bad');
          var e = $('.err', wrap);
          if (e) e.textContent = '';
        }
      });
    });

    var back = $('#briefBack');
    if (back) back.addEventListener('click', function () { stepIndex--; renderStep(); });
    $('#briefNext').addEventListener('click', onNext);

    if (!firstRender) $('#briefQ').focus({ preventScroll: true });
    firstRender = false;
  }

  function setErr(msg) { var e = $('#briefErr'); if (e) e.textContent = msg || ''; }
  function fieldErr(id, msg) {
    var w = briefMain.querySelector('[data-field="' + id + '"]');
    if (!w) return;
    w.classList.add('bad');
    $('.err', w).textContent = msg;
    var input = $('input', w);
    if (input) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', 'err-' + id); }
  }

  function validate() {
    var s = BRIEF_STEPS[stepIndex];
    setErr('');
    $$('.field', briefMain).forEach(function (w) {
      w.classList.remove('bad');
      var e = $('.err', w); if (e) e.textContent = '';
      var i = $('input', w); if (i) i.removeAttribute('aria-invalid');
    });

    if (s.type === 'choice') {
      if (!answers[s.id]) { setErr('Выберите один из вариантов.'); return false; }
      return true;
    }
    if (s.type === 'contact') {
      var ok = true;
      var name = (answers.name || '').trim();
      var tg = (answers.telegram || '').trim();
      var phone = (answers.phone || '').trim();
      var mail = (answers.email || '').trim();

      if (name.length < 2) { fieldErr('name', 'Введите имя — как к вам обращаться.'); ok = false; }
      if (mail && !/^[^\s@]+@[^\s@]+\.[A-Za-zА-Яа-я]{2,}$/.test(mail)) {
        fieldErr('email', 'Проверьте адрес: нужен формат name@mail.ru'); ok = false;
      }
      if (phone && phone.replace(/\D/g, '').length < 10) {
        fieldErr('phone', 'Номер слишком короткий — нужно минимум 10 цифр.'); ok = false;
      }
      if (!tg && !phone && !mail) {
        setErr('Оставьте хотя бы один способ связи: Telegram, телефон или email.'); ok = false;
      } else if (!ok) {
        setErr('Поправьте отмеченные поля — остальные ответы сохранены.');
      }
      return ok;
    }
    return true;
  }

  function onNext() {
    if (sending) return;
    if (!validate()) {
      var bad = $('.field.bad input', briefMain);
      if (bad) bad.focus();
      return;
    }
    if (stepIndex < BRIEF_STEPS.length - 1) { stepIndex++; renderStep(); return; }
    send();
  }

  function contactsLine() {
    return '<span class="brief__ways">' +
      '<a data-c="tg" href="' + esc(CONTACTS.telegramUrl) + '" target="_blank" rel="noopener">' + esc(CONTACTS.telegramHandle) + '</a>' +
      '<a data-c="mail" href="mailto:' + esc(CONTACTS.email) + '">' + esc(CONTACTS.email) + '</a>' +
      '<a data-c="tel" href="' + esc(CONTACTS.phoneHref) + '">' + esc(CONTACTS.phone) + '</a></span>';
  }

  function showResult(kind) {
    var sent = kind === 'sent';
    briefTicks.innerHTML = '<p class="brief__sidenote mono">' + (sent ? 'Заявка принята' : 'Черновик сохранён') + '</p>';
    briefMain.innerHTML =
      '<div class="brief__done stage-in' + (sent ? '' : ' is-pending') + '">' +
        '<span class="ok" aria-hidden="true">' + (sent
          ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 13 4.5 4.5L19 7"/></svg>'
          : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 8h.01M11 12h1v5h1"/><circle cx="12" cy="12" r="9"/></svg>') +
        '</span>' +
        (sent
          ? '<h3>Заявка отправлена.</h3><p>Свяжусь с вами для обсуждения проекта.</p>'
          : '<h3>Форма пока находится в режиме предварительной настройки.</h3>' +
            '<p>Приём заявок ещё не подключён — ответы сохранены в этом браузере, но ко мне они не ушли. Напишите напрямую, я отвечу.</p>' +
            contactsLine()) +
      '</div>';
    briefMain.setAttribute('role', 'status');
    applyContacts();
  }

  function send() {
    sending = true;
    var btn = $('#briefNext');
    if (btn) { btn.textContent = 'Отправляем…'; btn.disabled = true; }

    var payload = {
      'Что создать': answers.product || '',
      'Что сделать': answers.work || '',
      'Бюджет': answers.budget || '',
      'Сроки': answers.timing || '',
      'Имя': answers.name || '',
      'Telegram': answers.telegram || '',
      'Телефон': answers.phone || '',
      'Email': answers.email || '',
      'О проекте': answers.about || ''
    };

    Promise.resolve(submitBrief(payload)).then(function (res) {
      if (res && res.delivered) {
        try { localStorage.removeItem('ivan-brief-draft'); } catch (e) {}
        showResult('sent');
        return;
      }
      try {
        var box = JSON.parse(localStorage.getItem('ivan-briefs') || '[]');
        box.push({ at: new Date().toISOString(), payload: payload });
        localStorage.setItem('ivan-briefs', JSON.stringify(box));
      } catch (e) {}
      showResult('pending');
    }).catch(function () {
      sending = false;
      if (btn) { btn.textContent = 'Отправить заявку'; btn.disabled = false; }
      setErr('Не получилось отправить — проверьте соединение или напишите в Telegram ' + CONTACTS.telegramHandle + '.');
    });
  }

  if (briefForm) {
    briefForm.addEventListener('submit', function (e) { e.preventDefault(); onNext(); });
    renderStep();
  }

  // Клик по строке услуги: переносим выбор в заявку и открываем следующий незаполненный шаг
  function prefillFromService(s) {
    if (!briefForm || !s) return;
    var productMap = {
      landing: 'Landing', corporate: 'Корпоративный сайт', shop: 'Интернет-магазин',
      uxui: 'Digital product', turnkey: 'Другое'
    };
    var workMap = { uxui: 'Только дизайн' };
    answers.product = productMap[s.id] || 'Другое';
    answers.work = workMap[s.id] || 'Дизайн + разработка';
    answers.budget = s.price < 50000 ? '25–50 тыс. ₽'
      : s.price < 100000 ? '50–100 тыс. ₽'
      : s.price < 200000 ? '100–200 тыс. ₽' : '200 тыс. ₽+';
    stepIndex = 3; // «Когда запуск?» — первый вопрос, ещё не отвеченный
    saveDraft();
    firstRender = true;
    renderStep();
  }

  /* ---------- 17. ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ---------- */
  if (!reduced.matches && 'IntersectionObserver' in window) {
    var targets = $$('.sec, .srow, .prow, .about__grid > *, .brief__box, .contact__top, .ways li');
    var vh = window.innerHeight;
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

    targets.forEach(function (t, i) {
      if (t.getBoundingClientRect().top < vh * 0.94) return;
      t.classList.add('js-reveal');
      t.style.transitionDelay = ((i % 4) * 0.05) + 's';
      revealObs.observe(t);
    });
    window.setTimeout(function () {
      $$('.js-reveal').forEach(function (t) { t.classList.add('in'); });
    }, 4000);
  }

  /* ---------- 18. МЯГКИЙ ПАРАЛЛАКС ПЕРВОГО ЭКРАНА ----------
     Одна пара координат (-0.5…0.5) раздаётся слоям через CSS-переменные;
     амплитуду каждый слой выбирает сам. Только мышь: на тач-устройствах
     и при prefers-reduced-motion не подключается. */
  (function heroParallax() {
    var hero = $('#top');
    if (!hero || !fine.matches || reduced.matches) return;
    var box = null;
    var move = rafThrottle(function (x, y) {
      if (!box) return;
      var dx = (x - (box.left + box.width / 2)) / box.width;
      var dy = (y - (box.top + box.height / 2)) / box.height;
      hero.style.setProperty('--px', dx.toFixed(3));
      hero.style.setProperty('--py', dy.toFixed(3));
    });
    hero.addEventListener('mouseenter', function () { box = hero.getBoundingClientRect(); });
    hero.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      box = null;
      hero.style.setProperty('--px', '0');
      hero.style.setProperty('--py', '0');
    });
  })();

  /* ---------- 18б. ПАРАЛЛАКС ЗНАКА ---------- */
  var stage3d = $('#markStage');
  if (stage3d && fine.matches && !reduced.matches) {
    var host = $('#contact'), box = null;
    var tilt = rafThrottle(function (x, y) {
      if (!box) return;
      var dx = (x - (box.left + box.width / 2)) / box.width;
      var dy = (y - (box.top + box.height / 2)) / box.height;
      stage3d.style.transform = 'rotateY(' + (dx * 14).toFixed(2) + 'deg) rotateX(' + (-dy * 12).toFixed(2) + 'deg)';
    });
    stage3d.classList.add('is-live');
    host.addEventListener('mouseenter', function () { box = host.getBoundingClientRect(); });
    host.addEventListener('mousemove', function (e) { tilt(e.clientX, e.clientY); }, { passive: true });
    host.addEventListener('mouseleave', function () { box = null; stage3d.style.transform = ''; });
  }

  /* ---------- 19. ПОЛЕ ЧАСТИЦ ----------
     Фон первого экрана. Модуль лежит в particles.js и ничего
     не знает о сайте: цвета берёт из CSS-токенов, кадры ставит
     на паузу вне экрана и во вкладке в фоне. */
  (function mountField() {
    var canvas = $('#heroField');
    var cfg = (typeof PARTICLES !== 'undefined') ? PARTICLES : null;
    if (!canvas || !cfg || cfg.enabled === false || !window.ParticleField) {
      if (canvas) canvas.remove();
      return;
    }
    canvas.style.setProperty('--field-opacity', String(cfg.opacity == null ? 1 : cfg.opacity));
    particleField = window.ParticleField.mount(canvas, {
      density: cfg.density,
      speed: cfg.speed,
      linkDistance: cfg.linkDistance,
      pointerRadius: cfg.pointerRadius,
      pointer: cfg.pointerRadius !== 0
    });
  })();

  /* ---------- 20. ИНДИКАТОР ПРОКРУТКИ ---------- */
  (function progress() {
    var bar = $('#progress i');
    if (!bar) return;
    // современные браузеры ведут полосу средствами CSS (animation-timeline),
    // слушатель нужен только там, где этого нет
    try {
      if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) return;
    } catch (e) {}
    var sync = rafThrottle(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)).toFixed(4) + ')';
    });
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
  })();

  /* ---------- 21. ВИТРИНА ПРОЕКТОВ ----------
     Сцена собирается в своей системе координат — «пластине»:
     слева ноутбук, справа телефон, каждый на своём месте и в своих
     пропорциях. Пластина целиком приближается при прокрутке —
     обычный translate + scale, без наезда в экран.

     Прогресс считается ТОЛЬКО от положения секции в документе:
     курсор на него не влияет и ничего не блокирует.

     Внутри экранов лежат карточки работ: снимок сайта, название и
     призыв открыть его. Экран — это ссылка, поэтому клик по нему
     открывает сам сайт в новой вкладке. */
  (function showcase() {
    var cfg = (typeof SHOWCASE !== 'undefined') ? SHOWCASE : null;
    var sec = $('#showcase');
    if (!sec) return;
    var items = OPEN_ABLE.filter(function (p) { return p.live && p.live.path; });
    if (!cfg || cfg.enabled === false || !items.length) { sec.remove(); return; }

    var PW = cfg.plate.width, PH = cfg.plate.height;
    var mac = cfg.mac, pho = cfg.phone;
    var FW = cfg.frame.width, FH = cfg.frame.height;
    var MW = (cfg.phoneFrame || {}).width || 430;
    var MH = (cfg.phoneFrame || {}).height || 932;

    var space = $('#showSpace'), plate = $('#showPlate');
    var macEl = $('#showMac'), phoneBody = $('#showPhoneBody');
    var macScreen = $('#macScreen'), phoneScreen = $('#phoneScreen');
    var noteEl = $('#showNote'), titleEl = $('#showTitle');
    var ui = $('#showUi'), numEl = $('#showNum'), totalEl = $('#showTotal');
    var nameEl = $('#showName'), metaEl = $('#showMeta');
    var openEl = $('#showOpen'), openLabel = $('#showOpenLabel');
    var prevBtn = $('#showPrev'), nextBtn = $('#showNext');

    if (titleEl && cfg.title) titleEl.textContent = cfg.title;
    if (openLabel && cfg.cta) openLabel.textContent = cfg.cta;

    function picture(el, conf) {
      el.src = conf.src;
      if (conf.fallback) {
        el.addEventListener('error', function once() {
          el.removeEventListener('error', once); el.src = conf.fallback;
        });
      }
    }
    macEl.alt = mac.alt || '';
    picture(macEl, mac);
    picture(phoneBody, pho);

    /* ---- карточки работ ---- */
    totalEl.textContent = String(items.length).padStart(2, '0');
    var cards = items.map(function (p) {
      var f = document.createElement('figure');
      f.className = 'card';
      f.innerHTML =
        '<img class="card__shot" src="' + esc(p.live.shot || '') + '" alt="' +
          esc((p.live.label || p.title) + ' — главная страница сайта') + '" loading="lazy" decoding="async">' +
        '<figcaption class="card__bar">' +
          '<span class="card__side">' +
            '<span class="card__title">' + esc(p.live.label || p.title) + '</span>' +
            '<span class="card__meta mono">' + esc(p.live.meta || '') + '</span>' +
          '</span>' +
          '<span class="card__text">' + esc(p.live.card || '') + '</span>' +
          '<span class="card__cta mono">' + esc(cfg.cta || 'Открыть сайт') +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
          '</span>' +
        '</figcaption>';
      macScreen.appendChild(f);
      return f;
    });
    var minis = items.map(function (p) {
      var im = document.createElement('img');
      im.className = 'mini';
      im.src = p.live.mobile || p.live.shot || '';
      im.alt = '';
      im.setAttribute('aria-hidden', 'true');
      im.loading = 'lazy';
      phoneScreen.appendChild(im);
      return im;
    });

    /* ---- переключение работ ---- */
    var current = 0;
    function updateProjectUI(p) {
      numEl.textContent = p.number;
      nameEl.textContent = p.live.label || p.title;
      metaEl.textContent = p.live.meta || '';
      openEl.href = p.live.path;
      macScreen.href = p.live.path;
      phoneScreen.href = p.live.path;
      var label = 'Открыть сайт «' + (p.live.label || p.title) + '» в новой вкладке';
      openEl.setAttribute('aria-label', label);
      macScreen.setAttribute('aria-label', label);
    }
    function loadProject(i, dir) {
      i = (i + items.length) % items.length;
      var from = (dir === 0 ? 0 : dir > 0 ? 70 : -70) + 'px';
      [cards, minis].forEach(function (list) {
        list.forEach(function (el, k) { if (k !== i) el.classList.remove('is-live'); });
        list[i].style.setProperty('--from', from);
      });
      window.requestAnimationFrame(function () {
        cards[i].classList.add('is-live');
        minis[i].classList.add('is-live');
      });
      ui.classList.add('is-turning');
      window.setTimeout(function () {
        updateProjectUI(items[i]);
        ui.classList.remove('is-turning');
      }, dir === 0 ? 0 : 170);
      current = i;
    }
    function nextProject() { loadProject(current + 1, 1); }
    function previousProject() { loadProject(current - 1, -1); }
    nextBtn.addEventListener('click', nextProject);
    prevBtn.addEventListener('click', previousProject);
    wireMagnets(ui);

    /* ---- геометрия: карточки садятся в экраны устройств ---- */
    function unitTo(q) {
      var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1];
      var x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
      var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
      var dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
      var a13 = 0, a23 = 0, den = dx1 * dy2 - dx2 * dy1;
      if ((Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) && Math.abs(den) > 1e-12) {
        a13 = (dx3 * dy2 - dx2 * dy3) / den;
        a23 = (dx1 * dy3 - dx3 * dy1) / den;
      }
      return [
        x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0,
        y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0,
        a13, a23, 1
      ];
    }
    function css(w, h, q) {
      var m = unitTo(q);
      return 'matrix3d(' +
        [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]].join(',') +
        ') scale(' + (1 / w) + ',' + (1 / h) + ')';
    }
    function layout() {
      plate.style.width = PW + 'px';
      plate.style.height = PH + 'px';
      macEl.style.cssText = 'left:' + mac.x + 'px;top:' + mac.y + 'px;width:' + mac.width + 'px;height:' + mac.height + 'px';
      phoneBody.style.cssText = 'left:' + pho.x + 'px;top:' + pho.y + 'px;width:' + pho.width + 'px;height:' + pho.height + 'px';
      macScreen.style.width = FW + 'px';
      macScreen.style.height = FH + 'px';
      macScreen.style.transform = css(FW, FH, mac.screen);
      phoneScreen.style.width = MW + 'px';
      phoneScreen.style.height = MH + 'px';
      phoneScreen.style.transform = css(MW, MH, pho.screen);
    }
    function unlayout() {
      ['width', 'height', 'transform'].forEach(function (k) {
        plate.style[k] = ''; macScreen.style[k] = ''; phoneScreen.style[k] = '';
      });
      macEl.style.cssText = ''; phoneBody.style.cssText = '';
    }

    var flatQuery = window.matchMedia('(max-width: 899px)');
    function isFlat() { return flatQuery.matches || reduced.matches; }

    /* ---- приближение по прокрутке ---- */
    var kStart = 0.62, kEnd = 1, cx = 0, cy = 0;
    function measure() {
      var box = space.getBoundingClientRect();
      var vw = box.width, vh = box.height;
      if (!vw || !vh) return false;
      // сверху остаётся место под заголовок, снизу — под панель
      kEnd = Math.min(vw * 0.86 / PW, vh * 0.64 / PH);
      kStart = kEnd * 0.6;
      cx = vw / 2; cy = vh * 0.57;
      return true;
    }
    function ease(t) { return t * t * (3 - 2 * t); }
    function span(v, a, b) { return Math.max(0, Math.min(1, (v - a) / (b - a))); }

    /* Этапы:
       0.00–0.12  устройства выходят из глубины
       0.12–0.62  композиция приближается
       0.22–0.38  появляются стрелки и подпись под сценой
       0.62–1.00  композиция стоит крупно, можно листать работы   */
    function updateShowcase(p) {
      var enter = span(p, 0, 0.12);
      var k = kStart + (kEnd - kStart) * ease(span(p, 0.12, 0.62));
      var lift = (1 - enter) * 70;
      // origin 0 0: сдвиг считается уже с учётом масштаба
      plate.style.transform =
        'translate3d(' + (cx - PW * k / 2).toFixed(1) + 'px,' + (cy - PH * k / 2 + lift).toFixed(1) + 'px,0)' +
        ' scale(' + k.toFixed(4) + ')';
      plate.style.opacity = enter.toFixed(3);
      sec.style.setProperty('--lead-o', span(p, 0.02, 0.16).toFixed(3));
      sec.style.setProperty('--ui-o', span(p, 0.22, 0.38).toFixed(3));
      sec.style.setProperty('--pool-o', (0.42 * enter).toFixed(3));
      var state = p < 0.12 ? 'enter' : p < 0.62 ? 'approach' : 'stage';
      if (sec.dataset.state !== state) sec.dataset.state = state;
    }

    var initScrollProgress = rafThrottle(function () {
      if (isFlat()) return;
      var box = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      updateShowcase(total > 0 ? Math.max(0, Math.min(1, -box.top / total)) : 0);
    });

    /* ---- мягкий параллакс от мыши: только оформление ---- */
    function initDeviceParallax() {
      if (!fine.matches || reduced.matches) return;
      var box = null;
      var move = rafThrottle(function (x, y) {
        if (!box) return;
        var dx = (x - (box.left + box.width / 2)) / box.width;
        var dy = (y - (box.top + box.height / 2)) / box.height;
        sec.style.setProperty('--mx', dx.toFixed(3));
        sec.style.setProperty('--my', dy.toFixed(3));
      });
      sec.addEventListener('mouseenter', function () { box = sec.getBoundingClientRect(); });
      sec.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
      sec.addEventListener('mouseleave', function () {
        box = null;
        sec.style.setProperty('--mx', '0');
        sec.style.setProperty('--my', '0');
      });
    }

    function toFlat(on) {
      sec.classList.toggle('show--flat', on);
      if (noteEl) noteEl.textContent = (on ? cfg.noteFlat : cfg.note) || '';
      if (on) {
        sec.style.height = '';
        unlayout();
        plate.style.opacity = '';
        ['--lead-o', '--ui-o'].forEach(function (v) { sec.style.setProperty(v, '1'); });
        sec.style.setProperty('--pool-o', '0');
      } else {
        sec.style.height = (cfg.height || 220) + 'vh';
        layout();
      }
    }
    function relayout() {
      var flat = isFlat();
      toFlat(flat);
      if (!flat && measure()) initScrollProgress();
    }

    document.addEventListener('keydown', function (e) {
      if (sec.dataset.state !== 'stage' && !sec.classList.contains('show--flat')) return;
      if (document.activeElement && document.activeElement.closest('input, textarea')) return;
      var box = sec.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      if (e.key === 'ArrowRight') { nextProject(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { previousProject(); e.preventDefault(); }
    });

    loadProject(0, 0);
    relayout();
    initDeviceParallax();
    window.addEventListener('scroll', initScrollProgress, { passive: true });
    window.addEventListener('resize', rafThrottle(relayout), { passive: true });
    if (flatQuery.addEventListener) flatQuery.addEventListener('change', relayout);
    if (reduced.addEventListener) reduced.addEventListener('change', relayout);
  })();

  /* ---------- 22. ФОН СТРАНИЦЫ ----------
     Единый WebGL-канвас на весь экран (.page-shader, см. styles.css):
     проявляется при входе в витрину работ и дальше идёт фоном до
     подвала — эта часть сайта всегда тёмная (.stage-dark), поэтому у
     поля свои постоянные цвета, независимые от переключателя темы.
     Включено и на телефонах — там просто более лёгкие настройки. */
  (function pageShader() {
    var cfg = (typeof SHADER_FIELD !== 'undefined') ? SHADER_FIELD : null;
    var wrap = $('#pageShader');
    var canvas = $('#pageShaderCanvas');
    var stage = $('#stageDark');
    if (!wrap || !canvas || !stage || !cfg || cfg.enabled === false || !window.ShaderField) {
      if (wrap) wrap.remove();
      return;
    }

    var narrow = window.matchMedia('(max-width: 720px)');
    function opts() {
      var m = (narrow.matches && cfg.mobile) ? cfg.mobile : {};
      return {
        scale: m.scale != null ? m.scale : cfg.scale,
        speed: cfg.speed,
        detail: m.detail != null ? m.detail : cfg.detail,
        intensity: m.intensity != null ? m.intensity : cfg.intensity
      };
    }
    function maxOpacity() {
      return (narrow.matches && cfg.mobile && cfg.mobile.opacity != null) ? cfg.mobile.opacity : cfg.opacity;
    }

    shaderField = window.ShaderField.mount(canvas, opts());
    if (!shaderField) { wrap.remove(); return; }

    /* ---- прозрачность: плавно проявляется при входе в витрину, дальше держится до конца страницы ---- */
    var syncOpacity = rafThrottle(function () {
      var vh = window.innerHeight;
      var top = stage.getBoundingClientRect().top;
      var t = (vh - top) / (vh * 0.6);
      canvas.style.opacity = (Math.max(0, Math.min(1, t)) * maxOpacity()).toFixed(3);
    });
    syncOpacity();
    window.addEventListener('scroll', syncOpacity, { passive: true });
    window.addEventListener('resize', syncOpacity, { passive: true });

    /* ---- мягкий дрейф узора по секциям: канвас один на всю страницу,
       меняется только «извод» рисунка, пока читаешь очередной блок ---- */
    var variants = $$('#showcase, #services, #process, #about, #brief, #contact');
    if (variants.length && 'IntersectionObserver' in window) {
      var vObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) shaderField.setVariant(variants.indexOf(en.target));
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      variants.forEach(function (el) { vObs.observe(el); });
    }

    /* ---- переход через брейкпоинт телефон/десктоп: пересобрать с другими настройками ---- */
    var onBreakpoint = function () {
      shaderField.destroy();
      shaderField = window.ShaderField.mount(canvas, opts());
      if (!shaderField) wrap.remove();
    };
    if (narrow.addEventListener) narrow.addEventListener('change', onBreakpoint);
  })();

  /* ---------- ЗАПУСК ---------- */
  applyContacts();
  wireMagnets(document);
  $('#year').textContent = new Date().getFullYear();
})();
