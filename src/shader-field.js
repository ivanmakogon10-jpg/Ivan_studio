/* =============================================================
   IVAN STUDIO — ФОН «NEURO NOISE»
   Ванильный WebGL-модуль тонких светящихся нитей на тёмном поле:
   без React, без сборки, без внешних библиотек. Живёт на всю
   страницу (см. .page-shader в styles.css) — от витрины работ и
   до подвала, за одним общим фиксированным канвасом.

   Что делает: несколько слоёв поля сгибаются синусами, и там, где
   изгиб проходит близко к нулю, вспыхивает узкая нить — редкие
   светящиеся линии на тёмном фоне вместо сплошной дымки. Курсор
   аккуратно продавливает поле рядом с собой. Цвета читаются из
   CSS-токенов канваса (--ground, --acc, --acc-soft) один раз —
   у .page-shader они объявлены как константы, не зависящие от
   переключателя темы.

   Подключение:
     var field = ShaderField.mount(canvasElement, options);
     field.retheme();        // перечитать цвета (если они всё же меняются)
     field.setIntensity(v);  // 0..1 — сила отклика на курсор
     field.setVariant(i);    // плавно увести рисунок в другой «извод» —
                              // канвас остаётся один на всю страницу,
                              // это лишь мягкий дрейф узора по секциям
     field.pause(); field.resume();
     field.destroy();        // снять слушатели, отпустить контекст

   Если WebGL недоступен, mount() возвращает null — канвас
   остаётся пустым/скрытым, вызывающий код это обрабатывает сам.
   ============================================================= */
(function (global) {
  'use strict';

  var VERT =
    'attribute vec2 a_pos;' +
    'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }';

  var FRAG =
    'precision highp float;' +
    'uniform vec2 u_res;' +
    'uniform float u_time;' +
    'uniform vec2 u_pointer;' +
    'uniform float u_pointerOn;' +
    'uniform float u_intensity;' +
    'uniform float u_detail;' +
    'uniform vec3 u_bg;' +
    'uniform vec3 u_mid;' +
    'uniform vec3 u_hi;' +
    'uniform float u_seed;' +

    /* Поле нитей: на каждом витке луч слегка гнётся синусами (свой изгиб
       у каждого слоя), и там, где изгиб проходит близко к нулю, вклад
       1/ridge² даёт узкую яркую нить — так вместо сплошной дымки
       получаются редкие светящиеся линии на тёмном фоне. */
    'float threadField(vec2 p, float t){' +
    '  float acc = 0.0;' +
    '  float amp = 1.0;' +
    '  for (int i = 0; i < 7; i++) {' +
    '    float fi = float(i);' +
    '    if (fi >= u_detail) break;' +
    '    p += vec2(' +
    '      sin(p.y * (1.5 + fi * 0.16) + t * (0.5 + fi * 0.07) + u_seed * 4.1),' +
    '      cos(p.x * (1.4 + fi * 0.18) - t * (0.4 + fi * 0.06) + u_seed * 2.3)' +
    '    ) * (0.3 + u_intensity * 0.24);' +
    '    float ridge = abs(sin(p.x * 0.9 + p.y * 0.9 + fi * 0.9));' +
    '    acc += amp / (0.032 + ridge * ridge * 10.0);' +
    '    amp *= 0.6;' +
    '    p = p.yx * vec2(-1.07, 1.05);' +
    '  }' +
    '  return acc;' +
    '}' +
    'void main(){' +
    '  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);' +

    '  vec2 pd = uv - u_pointer;' +
    '  float pdist = length(pd);' +
    '  vec2 warp = u_pointerOn * pd * 0.45 * smoothstep(0.95, 0.0, pdist);' +

    '  vec2 p = uv * 1.75 + warp;' +
    '  float t = u_time * 0.06;' +

    '  float f = threadField(p, t);' +
    '  float glow = 1.0 - exp(-f * 0.05);' +

    '  vec3 col = mix(u_bg, u_mid, clamp(glow * 1.2, 0.0, 1.0));' +
    '  col = mix(col, u_hi, pow(clamp(glow, 0.0, 1.0), 4.0) * 0.9);' +

    '  float vig = smoothstep(1.2, 0.1, length(uv));' +
    '  col = mix(u_bg, col, vig);' +

    '  gl_FragColor = vec4(col, 1.0);' +
    '}';

  var DEFAULTS = {
    scale: 0.65,      // масштаб внутреннего рендера относительно CSS-размера
    speed: 0.85,
    detail: 5,        // число слоёв поля нитей (3..7)
    intensity: 1,     // сила отклика поля на курсор
    seed: 0
  };

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function toRgb01(value, fallback) {
    var s = String(value || '').trim();
    var m = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      if (h.length >= 6) {
        return [
          parseInt(h.slice(0, 2), 16) / 255,
          parseInt(h.slice(2, 4), 16) / 255,
          parseInt(h.slice(4, 6), 16) / 255
        ];
      }
    }
    m = /rgba?\(([^)]+)\)/i.exec(s);
    if (m) {
      var parts = m[1].split(',').map(function (n) { return parseFloat(n); });
      if (parts.length >= 3) return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    }
    return fallback;
  }

  function compileShader(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function mount(canvas, options) {
    if (!canvas || !canvas.getContext) return null;

    var opt = {};
    Object.keys(DEFAULTS).forEach(function (k) { opt[k] = DEFAULTS[k]; });
    if (options) Object.keys(options).forEach(function (k) {
      if (options[k] !== undefined && options[k] !== null) opt[k] = options[k];
    });

    var gl = null;
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' }) ||
           canvas.getContext('experimental-webgl');
    } catch (e) { gl = null; }
    if (!gl) return null;

    var vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uPointer = gl.getUniformLocation(prog, 'u_pointer');
    var uPointerOn = gl.getUniformLocation(prog, 'u_pointerOn');
    var uIntensity = gl.getUniformLocation(prog, 'u_intensity');
    var uDetail = gl.getUniformLocation(prog, 'u_detail');
    var uBg = gl.getUniformLocation(prog, 'u_bg');
    var uMid = gl.getUniformLocation(prog, 'u_mid');
    var uHi = gl.getUniformLocation(prog, 'u_hi');
    var uSeed = gl.getUniformLocation(prog, 'u_seed');

    var host = canvas.parentElement || canvas;
    var reduced = global.matchMedia('(prefers-reduced-motion: reduce)');
    var fine = global.matchMedia('(hover: hover) and (pointer: fine)');

    var width = 0, height = 0, dpr = 1;
    var palette = { bg: [0.04, 0.03, 0.05], mid: [0.15, 0.38, 1], hi: [0.86, 0.9, 1] };
    var pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
    var intensity = clamp(opt.intensity, 0, 1);
    var seedOffset = 0, seedOffsetTarget = 0;   // плавный переход рисунка между секциями (setVariant)
    var frame = null, visible = true, destroyed = false, start0 = null;

    function readPalette() {
      var cs = global.getComputedStyle(canvas);
      palette.bg = toRgb01(cs.getPropertyValue('--ground'), palette.bg);
      palette.mid = toRgb01(cs.getPropertyValue('--acc'), palette.mid);
      palette.hi = toRgb01(cs.getPropertyValue('--acc-soft'), palette.hi);
    }

    function resize() {
      var box = host.getBoundingClientRect();
      var w = Math.max(1, Math.round(box.width));
      var h = Math.max(1, Math.round(box.height));
      if (w === width && h === height) return;
      width = w; height = h;
      dpr = Math.min(global.devicePixelRatio || 1, 2) * clamp(opt.scale, 0.3, 1);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (reduced.matches) draw(0, false);
    }

    function draw(ts, animated) {
      if (start0 === null) start0 = ts;
      var time = ((ts - start0) / 1000) * opt.speed;

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.on += (pointer.ton - pointer.on) * 0.08;
      seedOffset += (seedOffsetTarget - seedOffset) * 0.015;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced.matches ? 0 : time);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPointerOn, pointer.on);
      gl.uniform1f(uIntensity, intensity);
      gl.uniform1f(uDetail, clamp(opt.detail, 3, 7));
      gl.uniform3f(uBg, palette.bg[0], palette.bg[1], palette.bg[2]);
      gl.uniform3f(uMid, palette.mid[0], palette.mid[1], palette.mid[2]);
      gl.uniform3f(uHi, palette.hi[0], palette.hi[1], palette.hi[2]);
      gl.uniform1f(uSeed, opt.seed + seedOffset);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (animated) frame = global.requestAnimationFrame(loop);
    }

    function loop(ts) { if (!destroyed) draw(ts, true); }

    function start() {
      if (destroyed || frame !== null) return;
      if (reduced.matches) { draw(0, false); return; }
      frame = global.requestAnimationFrame(loop);
    }
    function stop() {
      if (frame !== null) { global.cancelAnimationFrame(frame); frame = null; }
    }

    /* --- слушатели --- */
    var ro = null;
    if ('ResizeObserver' in global) {
      ro = new ResizeObserver(function () { resize(); });
      ro.observe(host);
    } else {
      global.addEventListener('resize', resize, { passive: true });
    }

    function onPointerMove(e) {
      var box = host.getBoundingClientRect();
      var nx = (e.clientX - box.left - box.width / 2) / Math.min(box.width, box.height);
      var ny = -(e.clientY - box.top - box.height / 2) / Math.min(box.width, box.height);
      pointer.tx = nx; pointer.ty = ny; pointer.ton = 1;
    }
    function onPointerLeave() { pointer.ton = 0; }
    function onVisibility() {
      if (document.hidden) stop();
      else if (visible) start();
    }

    if (fine.matches) {
      host.addEventListener('mousemove', onPointerMove, { passive: true });
      host.addEventListener('mouseleave', onPointerLeave);
    }
    document.addEventListener('visibilitychange', onVisibility);

    var io = null;
    if ('IntersectionObserver' in global) {
      io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { rootMargin: '160px' });
      io.observe(host);
    }

    var onMotionChange = function () { stop(); start0 = null; start(); };
    if (reduced.addEventListener) reduced.addEventListener('change', onMotionChange);

    readPalette();
    resize();
    draw(0, false);
    start();

    return {
      retheme: function () { readPalette(); if (reduced.matches) draw(0, false); },
      setIntensity: function (v) { intensity = clamp(v, 0, 1); },
      setVariant: function (i) { seedOffsetTarget = (i || 0) * 0.85; },
      pause: stop,
      resume: start,
      destroy: function () {
        destroyed = true;
        stop();
        if (ro) ro.disconnect(); else global.removeEventListener('resize', resize);
        host.removeEventListener('mousemove', onPointerMove);
        host.removeEventListener('mouseleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        if (io) io.disconnect();
        if (reduced.removeEventListener) reduced.removeEventListener('change', onMotionChange);
      }
    };
  }

  global.ShaderField = { mount: mount, defaults: DEFAULTS };
})(window);
