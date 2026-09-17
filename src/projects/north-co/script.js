/* ============================================================
   NORTH & CO. — INTERACTION LAYER
   Vanilla JS, no dependencies. Every effect below maps to a
   single UX purpose: state feedback, spatial feedback, or a
   scroll-driven reveal. Nothing runs purely for decoration.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- Header on scroll ---------------- */
  var header = document.getElementById("siteHeader");
  function updateHeader() {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------------- Mobile nav ---------------- */
  var burger = document.getElementById("burgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  burger.addEventListener("click", function () {
    var open = mobileNav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobileNav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------------- Hero load-in ---------------- */
  var hero = document.querySelector(".hero");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add("is-loaded"); });
  });

  /* ---------------- Generic scroll reveal ---------------- */
  var revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Custom cursor ---------------- */
  var cursor = document.querySelector(".cursor");
  if (canHover && cursor) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    var label = cursor.querySelector(".cursor__label");

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
    });

    function raf() {
      var ease = reduceMotion ? 1 : 0.2;
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      cursor.style.transform = "translate(" + cx + "px, " + cy + "px)";
      requestAnimationFrame(raf);
    }
    raf();

    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("is-active");
        label.textContent = el.getAttribute("data-cursor");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-active");
      });
    });
  } else if (cursor) {
    document.documentElement.classList.add("no-custom-cursor");
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      var strength = 18;
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var relX = (e.clientX - r.left) / r.width - 0.5;
        var relY = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform = "translate(" + (relX * strength) + "px, " + (relY * strength) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ---------------- What changes: hover / focus / click list ---------------- */
  var changesItems = document.querySelectorAll(".changes__item");
  var changesPanels = document.querySelectorAll(".changes__preview-panel");
  function setChangesActive(key) {
    changesItems.forEach(function (li) { li.classList.toggle("is-active", li.dataset.target === key); });
    changesPanels.forEach(function (p) { p.classList.toggle("is-visible", p.dataset.panel === key); });
  }
  changesItems.forEach(function (li) {
    li.addEventListener("mouseenter", function () { setChangesActive(li.dataset.target); });
    li.addEventListener("focus", function () { setChangesActive(li.dataset.target); });
    li.addEventListener("click", function () { setChangesActive(li.dataset.target); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setChangesActive(li.dataset.target); }
    });
  });

  /* ---------------- Services accordion ---------------- */
  var serviceItems = document.querySelectorAll(".services__item");
  var visualPanels = document.querySelectorAll(".services__visual-panel");
  function openService(item) {
    var key = item.dataset.service;
    serviceItems.forEach(function (li) {
      var isTarget = li === item;
      li.classList.toggle("is-active", isTarget);
      li.querySelector(".services__trigger").setAttribute("aria-expanded", isTarget ? "true" : "false");
    });
    visualPanels.forEach(function (p) { p.classList.toggle("is-visible", p.dataset.visual === key); });
  }
  serviceItems.forEach(function (item) {
    var trigger = item.querySelector(".services__trigger");
    trigger.addEventListener("click", function () { openService(item); });
    if (canHover) {
      item.addEventListener("mouseenter", function () { openService(item); });
    }
  });

  /* ---------------- Process: sequential activation + fill line ---------------- */
  var timeline = document.getElementById("processTimeline");
  var fill = document.getElementById("processFill");
  var steps = document.querySelectorAll(".process__step");

  function updateProcess() {
    var r = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var start = vh * 0.85;
    var end = vh * 0.25;
    var total = r.top - end - (start - end);
    var progress = (start - r.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));

    fill.style.width = (progress * 100) + "%";

    var activeCount = Math.round(progress * steps.length);
    steps.forEach(function (step, i) {
      step.classList.toggle("is-active", i < activeCount || progress >= 0.98);
    });
  }
  window.addEventListener("scroll", updateProcess, { passive: true });
  window.addEventListener("resize", updateProcess);
  updateProcess();

  /* ---------------- Case study: scroll-linked wipe reveal ---------------- */
  var caseFrame = document.getElementById("caseFrame");
  var caseBefore = document.getElementById("caseBefore");

  function updateCase() {
    if (!caseFrame || !caseBefore) return;
    var r = caseFrame.getBoundingClientRect();
    var vh = window.innerHeight;
    var start = vh * 0.9;
    var end = vh * 0.15;
    var progress = (start - r.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));
    caseBefore.style.clipPath = "inset(0 " + (progress * 100) + "% 0 0)";
  }
  window.addEventListener("scroll", updateCase, { passive: true });
  window.addEventListener("resize", updateCase);
  updateCase();

  /* ---------------- Contact form ---------------- */
  var form = document.getElementById("convoForm");
  var errorEl = document.getElementById("formError");
  var thanks = document.getElementById("convoThanks");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = [
      { el: document.getElementById("fieldName"), label: "имя" },
      { el: document.getElementById("fieldBusiness"), label: "бизнес" },
      { el: document.getElementById("fieldNeed"), label: "запрос" },
      { el: document.getElementById("fieldContact"), label: "контакт" }
    ];
    var missing = [];
    fields.forEach(function (f) {
      var empty = f.el.value.trim().length === 0;
      f.el.classList.toggle("is-invalid", empty);
      if (empty) missing.push(f.label);
    });

    if (missing.length) {
      errorEl.textContent = "Заполните, пожалуйста: " + missing.join(", ") + ".";
      var firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    errorEl.textContent = "";
    form.hidden = true;
    thanks.hidden = false;
    thanks.setAttribute("tabindex", "-1");
    thanks.focus();
    /* Front-end only demo: connect to your CRM / mailer / API here. */
  });

  form.querySelectorAll("input").forEach(function (input) {
    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
    });
  });
})();
