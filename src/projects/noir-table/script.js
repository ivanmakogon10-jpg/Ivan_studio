(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Header: densify on scroll
  --------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  var lastY = window.scrollY;

  function onScrollHeader() {
    var y = window.scrollY;
    if (y > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
    lastY = y;
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------------------------------------------------
     Mobile menu toggle
  --------------------------------------------------------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("is-open");
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });
    mobileMenu.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeMobileMenu);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  /* ---------------------------------------------------------
     Scroll reveal via IntersectionObserver
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var group = el.closest("section, .hero-grid") || el.parentElement;
            var siblings = group ? group.querySelectorAll("[data-reveal]") : [el];
            var idx = Array.prototype.indexOf.call(siblings, el);
            el.style.setProperty("--rd", (Math.max(idx, 0) * 0.08) + "s");
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     Custom cursor dot (desktop, fine pointer only)
  --------------------------------------------------------- */
  var cursorDot = document.querySelector(".cursor-dot");
  var canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var cx = 0, cy = 0, dx = 0, dy = 0;

  if (cursorDot && canHover) {
    window.addEventListener("mousemove", function (e) {
      cx = e.clientX; cy = e.clientY;
      cursorDot.classList.add("is-visible");
    });
    document.addEventListener("mouseleave", function () {
      cursorDot.classList.remove("is-visible");
    });

    function raf() {
      dx += (cx - dx) * 0.18;
      dy += (cy - dy) * 0.18;
      cursorDot.style.transform = "translate(" + dx + "px," + dy + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll("a, button, .menu-row").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursorDot.classList.add("is-large"); });
      el.addEventListener("mouseleave", function () { cursorDot.classList.remove("is-large"); });
    });
  }

  /* ---------------------------------------------------------
     Menu experience: category tabs
  --------------------------------------------------------- */
  var tabs = document.querySelectorAll(".menu-tab");
  var items = document.querySelectorAll(".menu-item");

  function activateCategory(cat, activeTab) {
    tabs.forEach(function (t) {
      var on = t === activeTab || t.getAttribute("data-cat") === cat;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    items.forEach(function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-cat") === cat);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateCategory(tab.getAttribute("data-cat"), tab);
    });
  });

  var initialTab = document.querySelector(".menu-tab.is-active") || tabs[0];
  if (initialTab) activateCategory(initialTab.getAttribute("data-cat"), initialTab);

  /* ---------------------------------------------------------
     Menu experience: cursor-following image preview
  --------------------------------------------------------- */
  var preview = document.getElementById("menuPreview");
  var previewImg = document.getElementById("menuPreviewImg");
  var menuStage = document.querySelector(".menu-stage");

  if (preview && menuStage && canHover) {
    var px = 0, py = 0, tpx = 0, tpy = 0;
    var previewActive = false;

    function movePreview() {
      px += (tpx - px) * 0.16;
      py += (tpy - py) * 0.16;
      preview.style.transform = "translate(" + px + "px," + py + "px)";
      if (previewActive) requestAnimationFrame(movePreview);
    }

    items.forEach(function (item) {
      var row = item.querySelector(".menu-row");
      var img = item.getAttribute("data-img");
      if (!row || !img) return;

      row.addEventListener("mouseenter", function (e) {
        previewImg.src = img;
        preview.classList.add("is-visible");
        tpx = e.clientX + 24; tpy = e.clientY - 150;
        px = tpx; py = tpy;
        if (!previewActive) { previewActive = true; movePreview(); }
      });
      row.addEventListener("mousemove", function (e) {
        tpx = e.clientX + 24; tpy = e.clientY - 150;
      });
      row.addEventListener("mouseleave", function () {
        preview.classList.remove("is-visible");
        previewActive = false;
      });
    });
  }

  /* ---------------------------------------------------------
     Atmosphere gallery: wheel -> horizontal scroll + drag
  --------------------------------------------------------- */
  var track = document.getElementById("atmosphereTrack");
  if (track) {
    track.addEventListener(
      "wheel",
      function (e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          track.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      },
      { passive: false }
    );

    var isDown = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", function (e) {
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      track.addEventListener(ev, function () { isDown = false; });
    });

    track.addEventListener("keydown", function (e) {
      var step = 320;
      if (e.key === "ArrowRight") { track.scrollLeft += step; e.preventDefault(); }
      if (e.key === "ArrowLeft") { track.scrollLeft -= step; e.preventDefault(); }
    });
  }

  /* ---------------------------------------------------------
     Guests suffix pluralisation (Russian)
  --------------------------------------------------------- */
  var guestsInput = document.getElementById("guests");
  var guestsSuffix = document.getElementById("guestsSuffix");

  function pluralGuests(n) {
    n = Math.abs(n) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) return "гостей";
    if (n1 > 1 && n1 < 5) return "гостей";
    if (n1 === 1) return "гостя";
    return "гостей";
  }
  if (guestsInput && guestsSuffix) {
    guestsInput.addEventListener("input", function () {
      var v = parseInt(guestsInput.value, 10) || 0;
      guestsSuffix.textContent = pluralGuests(v);
    });
  }

  /* ---------------------------------------------------------
     Reservation form validation
  --------------------------------------------------------- */
  var form = document.getElementById("reservationForm");
  var formError = document.getElementById("formError");
  var confirmBlock = document.getElementById("reservationConfirm");
  var confirmText = document.getElementById("confirmText");
  var confirmReset = document.getElementById("confirmReset");

  var MONTHS_RU = {
    "январ": 1, "феврал": 2, "март": 3, "апрел": 4, "ма": 5, "июн": 6,
    "июл": 7, "август": 8, "сентябр": 9, "октябр": 10, "ноябр": 11, "декабр": 12
  };
  var MONTHS_EN = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };

  function parseDateLoose(str) {
    str = (str || "").trim().toLowerCase();
    if (!str) return null;
    var m = str.match(/^(\d{1,2})\s+([a-zа-я]+)/i);
    if (!m) return null;
    var day = parseInt(m[1], 10);
    var word = m[2];
    var month = null;
    for (var key in MONTHS_EN) {
      if (word.indexOf(key) === 0) { month = MONTHS_EN[key]; break; }
    }
    if (!month) {
      for (var rkey in MONTHS_RU) {
        if (word.indexOf(rkey) === 0) { month = MONTHS_RU[rkey]; break; }
      }
    }
    if (!month || day < 1 || day > 31) return null;
    return { day: day, month: month };
  }

  function isValidTime(str) {
    var m = (str || "").trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    return !!m;
  }

  function setFieldError(el, on) {
    var wrap = el.closest(".field-wrap");
    if (wrap) wrap.classList.toggle("has-error", on);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      formError.textContent = "";

      var guests = form.querySelector("#guests");
      var date = form.querySelector("#date");
      var time = form.querySelector("#time");
      var name = form.querySelector("#name");
      var phone = form.querySelector("#phone");

      [guests, date, time, name, phone].forEach(function (el) { setFieldError(el, false); });

      var errors = [];

      var guestsVal = parseInt(guests.value, 10);
      if (!guestsVal || guestsVal < 1 || guestsVal > 12) {
        errors.push("Укажите число гостей от 1 до 12.");
        setFieldError(guests, true);
      }

      var parsedDate = parseDateLoose(date.value);
      if (!parsedDate) {
        errors.push("Укажите дату в формате «24 SEPTEMBER».");
        setFieldError(date, true);
      }

      if (!isValidTime(time.value)) {
        errors.push("Укажите время в формате ЧЧ:ММ, например 20:30.");
        setFieldError(time, true);
      }

      if (!name.value.trim() || name.value.trim().length < 2) {
        errors.push("Укажите имя.");
        setFieldError(name, true);
      }

      var phoneDigits = phone.value.replace(/[^\d+]/g, "");
      if (phoneDigits.replace(/\D/g, "").length < 6) {
        errors.push("Проверьте номер телефона.");
        setFieldError(phone, true);
      }

      if (errors.length) {
        formError.textContent = errors[0];
        return;
      }

      confirmText.textContent =
        "Столик для " + guestsVal + " " + pluralGuests(guestsVal) +
        " на " + date.value.trim().toUpperCase() + " в " + time.value.trim() +
        ". Мы свяжемся с вами по телефону, чтобы подтвердить бронь, " + name.value.trim() + ".";

      form.hidden = true;
      confirmBlock.hidden = false;
      confirmBlock.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    });
  }

  if (confirmReset) {
    confirmReset.addEventListener("click", function () {
      form.reset();
      guestsSuffix.textContent = pluralGuests(2);
      confirmBlock.hidden = true;
      form.hidden = false;
      form.querySelector("#name").focus();
    });
  }

})();
