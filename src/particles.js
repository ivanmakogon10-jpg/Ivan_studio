/* =============================================================
   IVAN STUDIO — ПОЛЕ ЧАСТИЦ
   Ванильный порт эффекта Particle Drift под стек сайта:
   без React, без iframe, без внешних библиотек.

   Что делает: медленно дрейфующие точки, тонкие связи между
   близкими соседями и отклик на курсор. Цвета берутся из
   CSS-токенов (--ink-3, --line-2, --acc), поэтому поле само
   переключается вместе с темой.

   Подключение:
     var field = ParticleField.mount(canvasElement, options);
     field.retheme();   // перечитать цвета после смены темы
     field.destroy();   // снять слушатели и остановить кадры

   Опции (все необязательные) — см. DEFAULTS ниже.
   ============================================================= */
(function (global) {
  'use strict';

  var DEFAULTS = {
    density: 1,          // множитель количества точек
    speed: 1,            // множитель скорости дрейфа
    linkDistance: 118,   // px: до какого расстояния соединять соседей
    pointerRadius: 165,  // px: радиус реакции на курсор
    pointerPush: 16,     // px: насколько ближние точки отходят от курсора
    twinkle: 0.5,        // сила редкого мерцания (0 — выключить)
    dotSize: 1.6,        // px: базовый радиус точки
    bigShare: 0.24,      // доля крупных «звёзд» от общего числа точек
    glow: 1,             // множитель мягкого ореола: 0 — выключить
    linkWidth: 1,        // px: толщина связи
    area: 15000,         // px² на одну точку при density = 1
    minNodes: 16,
    maxNodes: 110,
    linkAlpha: 0.45,     // прозрачность связей между точками
    dotAlpha: 0.9,       // прозрачность точек
    accentAlpha: 0.78,   // прозрачность связей с курсором
    pointer: true        // реагировать на курсор
  };

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /* Токены приходят как #RGB / #RRGGBB / rgb(...) — приводим к [r,g,b] */
  function toRgb(value, fallback) {
    var s = String(value || '').trim();
    var m = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      if (h.length >= 6) {
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
    }
    m = /rgba?\(([^)]+)\)/i.exec(s);
    if (m) {
      var parts = m[1].split(',').map(function (n) { return parseFloat(n); });
      if (parts.length >= 3) return [parts[0] | 0, parts[1] | 0, parts[2] | 0];
    }
    return fallback;
  }
  function rgba(rgb, alpha) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha.toFixed(3) + ')';
  }

  function mount(canvas, options) {
    if (!canvas || !canvas.getContext) return null;

    var opt = {};
    Object.keys(DEFAULTS).forEach(function (k) { opt[k] = DEFAULTS[k]; });
    if (options) Object.keys(options).forEach(function (k) {
      if (options[k] !== undefined && options[k] !== null) opt[k] = options[k];
    });

    var ctx = canvas.getContext('2d', { alpha: true });
    var host = canvas.parentElement || canvas;
    var reduced = global.matchMedia('(prefers-reduced-motion: reduce)');
    var fine = global.matchMedia('(hover: hover) and (pointer: fine)');

    var width = 0, height = 0, dpr = 1;
    var nodes = [];
    var palette = { dot: [160, 160, 160], link: [200, 200, 200], accent: [37, 99, 255] };
    var pointer = { x: -9999, y: -9999, on: false };
    var frame = null, visible = true, destroyed = false;

    var linkDist = clamp(opt.linkDistance, 40, 400);
    var linkDist2 = linkDist * linkDist;
    var pointerDist = clamp(opt.pointerRadius, 0, 600);
    var pointerDist2 = pointerDist * pointerDist;

    function readPalette() {
      var cs = getComputedStyle(canvas);
      // --field-dot / --field-link задаются точечно под первый экран,
      // иначе берутся общие токены темы
      palette.dot = toRgb(cs.getPropertyValue('--field-dot') || cs.getPropertyValue('--ink-3'), palette.dot);
      palette.link = toRgb(cs.getPropertyValue('--field-link') || cs.getPropertyValue('--line-2'), palette.link);
      palette.accent = toRgb(cs.getPropertyValue('--acc'), palette.accent);
    }

    function targetCount() {
      var n = Math.round((width * height) / opt.area * opt.density);
      return clamp(n, opt.minNodes, opt.maxNodes);
    }

    /* Часть точек крупнее остальных и светится — поле читается как
       созвездие, а не как равномерный шум. */
    function makeNode() {
      var big = Math.random() < opt.bigShare;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.09,
        vy: Math.random() * 0.16 + 0.04,
        r: big ? 1.15 + Math.random() * 0.75 : 0.5 + Math.random() * 0.35,
        big: big,
        // у каждой точки свой ритм мерцания, поэтому поле не «дышит» разом
        tw: Math.random() * Math.PI * 2,
        ts: 0.004 + Math.random() * 0.01
      };
    }

    /* При изменении размера сохраняем относительные позиции —
       поле не пересобирается рывком. */
    function resize() {
      var box = host.getBoundingClientRect();
      var w = Math.max(1, Math.round(box.width));
      var h = Math.max(1, Math.round(box.height));
      if (w === width && h === height) return;

      var sx = width ? w / width : 1;
      var sy = height ? h / height : 1;
      width = w; height = h;

      dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes.forEach(function (n) { n.x *= sx; n.y *= sy; });

      var want = targetCount();
      while (nodes.length < want) nodes.push(makeNode());
      if (nodes.length > want) nodes.length = want;

      if (reduced.matches) draw(false);
    }

    function step() {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.tw += n.ts;
        n.x += n.vx * opt.speed;
        n.y += n.vy * opt.speed;
        if (n.y > height + 12) { n.y = -12; n.x = Math.random() * width; }
        if (n.x < -12) n.x = width + 12;
        else if (n.x > width + 12) n.x = -12;
      }
    }

    function draw(animated) {
      ctx.clearRect(0, 0, width, height);

      // связи между близкими точками — тонкие волосяные линии
      ctx.shadowBlur = 0;
      ctx.lineWidth = opt.linkWidth;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 > linkDist2) continue;
          var t = 1 - Math.sqrt(d2) / linkDist;
          ctx.strokeStyle = rgba(palette.link, opt.linkAlpha * t);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      /* Курсор раздвигает поле: ближние точки мягко отходят в сторону,
         дальние почти не двигаются. Позиция самой точки не меняется —
         смещение живёт только в кадре, поэтому поле возвращается на
         место, как только курсор ушёл. */
      var hasPointer = opt.pointer && pointer.on && pointerDist > 0;
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        var near = 0, dx = n.x, dy = n.y;
        if (hasPointer) {
          var px = n.x - pointer.x, py = n.y - pointer.y;
          var pd2 = px * px + py * py;
          if (pd2 < pointerDist2) {
            var d = Math.sqrt(pd2) || 0.0001;
            near = 1 - d / pointerDist;
            var push = opt.pointerPush * near * near;
            dx += (px / d) * push;
            dy += (py / d) * push;
          }
        }
        // редкое мягкое мерцание: заметно только на крупных точках
        var tw = opt.twinkle > 0
          ? 1 + opt.twinkle * (n.big ? 0.45 : 0.22) * Math.sin(n.tw)
          : 1;
        var colour = near > 0.45 ? palette.accent : palette.dot;
        var alpha = clamp(opt.dotAlpha * (n.big ? 1 : 0.6) * tw + near * 0.35, 0, 1);
        var size = opt.dotSize * n.r * (1 + near * 0.55) * (0.9 + 0.1 * tw);

        if (opt.glow > 0 && (n.big || near > 0.2)) {
          ctx.shadowColor = rgba(colour, Math.min(1, alpha));
          ctx.shadowBlur = size * (near > 0.2 ? 6 : 4) * opt.glow;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = rgba(colour, alpha);
        ctx.beginPath();
        ctx.arc(dx, dy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      if (animated) frame = global.requestAnimationFrame(loop);
    }

    function loop() {
      if (destroyed) return;
      step();
      draw(true);
    }

    function start() {
      if (destroyed || frame !== null) return;
      if (reduced.matches) { draw(false); return; }   // статичный кадр вместо анимации
      frame = global.requestAnimationFrame(loop);
    }
    function stop() {
      if (frame !== null) { global.cancelAnimationFrame(frame); frame = null; }
    }

    /* --- слушатели --- */
    var resizeTimer = null;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }
    function onPointerMove(e) {
      var box = canvas.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
      pointer.on = true;
    }
    function onPointerLeave() { pointer.on = false; }
    function onVisibility() {
      if (document.hidden) stop();
      else if (visible) start();
    }

    global.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    if (opt.pointer && fine.matches) {
      host.addEventListener('mousemove', onPointerMove, { passive: true });
      host.addEventListener('mouseleave', onPointerLeave);
    }

    // кадры не тратятся, пока блок за пределами экрана
    var io = null;
    if ('IntersectionObserver' in global) {
      io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      }, { rootMargin: '120px' });
      io.observe(host);
    }

    var onMotionChange = function () { stop(); start(); };
    if (reduced.addEventListener) reduced.addEventListener('change', onMotionChange);

    readPalette();
    resize();
    draw(false);   // первый кадр сразу: поле видно ещё до старта анимации
    start();

    return {
      retheme: function () { readPalette(); if (reduced.matches) draw(false); },
      pause: stop,
      resume: start,
      destroy: function () {
        destroyed = true;
        stop();
        clearTimeout(resizeTimer);
        global.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        host.removeEventListener('mousemove', onPointerMove);
        host.removeEventListener('mouseleave', onPointerLeave);
        if (io) io.disconnect();
        if (reduced.removeEventListener) reduced.removeEventListener('change', onMotionChange);
        ctx.clearRect(0, 0, width, height);
      }
    };
  }

  global.ParticleField = { mount: mount, defaults: DEFAULTS };
})(window);
