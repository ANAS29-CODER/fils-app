(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(".page-progress span");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const languageButton = document.querySelector("[data-language-switch]");
  const languageLabel = document.querySelector("[data-language-label]");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const metadata = {
    ar: {
      title: "فلس العالمية | مستقبل التجارة التفاعلية",
      description:
        "فلس العالمية شركة كويتية متخصصة في حلول التجارة التفاعلية، تجمع المتاجر الرقمية والمزادات والتسوق المباشر والدفع والتوصيل في منظومة واحدة.",
    },
    en: {
      title: "Fils International | Interactive Commerce",
      description:
        "Fils International is a Kuwaiti interactive-commerce company bringing digital storefronts, auctions, live shopping, payments and delivery into one ecosystem.",
    },
  };

  const language = () => (root.lang === "en" ? "en" : "ar");
  const datasetValue = (element, prefix, lang) =>
    element.dataset[`${prefix}${lang === "en" ? "En" : "Ar"}`];

  function updateMenuLabel() {
    if (!menuToggle) return;
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute(
      "aria-label",
      language() === "en"
        ? open
          ? "Close menu"
          : "Open menu"
        : open
          ? "إغلاق القائمة"
          : "فتح القائمة",
    );
  }

  function setLanguage(nextLanguage, persist = true) {
    const lang = nextLanguage === "en" ? "en" : "ar";
    root.lang = lang;
    root.dir = lang === "en" ? "ltr" : "rtl";
    body.classList.toggle("is-english", lang === "en");

    document.querySelectorAll("[data-ar][data-en]").forEach((element) => {
      element.innerHTML = element.dataset[lang];
    });
    document
      .querySelectorAll("[data-aria-ar][data-aria-en]")
      .forEach((element) => {
        element.setAttribute("aria-label", datasetValue(element, "aria", lang));
      });
    document
      .querySelectorAll("[data-alt-ar][data-alt-en]")
      .forEach((element) => {
        element.alt = datasetValue(element, "alt", lang);
      });

    document.title = metadata[lang].title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", metadata[lang].description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", metadata[lang].title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", metadata[lang].description);
    if (languageLabel)
      languageLabel.textContent = lang === "en" ? "العربية" : "EN";
    languageButton?.setAttribute(
      "aria-label",
      lang === "en" ? "التبديل إلى العربية" : "Switch to English",
    );

    const activeTab = document.querySelector(".product-tab.is-active");
    const screen = document.querySelector("#product-screen");
    if (activeTab && screen)
      screen.alt = datasetValue(activeTab, "screenAlt", lang);
    updateMenuLabel();

    if (persist) {
      try {
        localStorage.setItem("fils-language", lang);
      } catch (_) {}
      const url = new URL(location.href);
      if (lang === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  let savedLanguage = null;
  try {
    savedLanguage = localStorage.getItem("fils-language");
  } catch (_) {}
  const requestedLanguage = new URLSearchParams(location.search).get("lang");
  if (requestedLanguage === "en" || requestedLanguage === "ar")
    setLanguage(requestedLanguage, false);
  else if (savedLanguage === "en") setLanguage("en", false);

  languageButton?.addEventListener("click", () => {
    languageButton.classList.remove("is-switching");
    void languageButton.offsetWidth;
    languageButton.classList.add("is-switching");
    setLanguage(language() === "en" ? "ar" : "en");
    closeMenu();
    window.setTimeout(
      () => languageButton.classList.remove("is-switching"),
      480,
    );
  });

  function openMenu() {
    menuToggle?.setAttribute("aria-expanded", "true");
    navMenu?.classList.add("is-open");
    backdrop?.classList.add("is-visible");
    body.classList.add("menu-open");
    updateMenuLabel();
  }

  function closeMenu(returnFocus = false) {
    menuToggle?.setAttribute("aria-expanded", "false");
    navMenu?.classList.remove("is-open");
    backdrop?.classList.remove("is-visible");
    body.classList.remove("menu-open");
    updateMenuLabel();
    if (returnFocus) menuToggle?.focus();
  }

  menuToggle?.addEventListener("click", () =>
    menuToggle.getAttribute("aria-expanded") === "true"
      ? closeMenu()
      : openMenu(),
  );
  backdrop?.addEventListener("click", () => closeMenu(true));
  navMenu
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu(true);
  });
  window.addEventListener(
    "resize",
    () => {
      if (innerWidth > 900) closeMenu();
    },
    { passive: true },
  );

  let scrollFrame = 0;
  function updateScroll() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    header?.classList.toggle("is-scrolled", scrollY > 38);
    if (progress)
      progress.style.transform = `scaleX(${distance > 0 ? Math.min(scrollY / distance, 1) : 0})`;
    scrollFrame = 0;
  }
  addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  updateScroll();

  const revealItems = document.querySelectorAll("[data-reveal]");
  revealItems.forEach((item) => {
    if (item.dataset.delay)
      item.style.setProperty("--reveal-delay", `${item.dataset.delay}ms`);
  });
  if (
    reduceMotion ||
    new URLSearchParams(location.search).has("snapshot") ||
    !("IntersectionObserver" in window)
  ) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -45px" },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const navLinks = Array.from(
    document.querySelectorAll('.nav-links a[href^="#"]'),
  );
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (!current) return;
        navLinks.forEach((link) =>
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${current.target.id}`,
          ),
        );
      },
      { rootMargin: "-30% 0px -60%", threshold: 0 },
    );
    observedSections.forEach((section) => navObserver.observe(section));
  }

  const tabs = Array.from(document.querySelectorAll(".product-tab"));
  const productScreen = document.querySelector("#product-screen");
  function activateTab(index, focus = false) {
    if (!tabs.length || !productScreen) return;
    const safeIndex = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === safeIndex;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const tab = tabs[safeIndex];
    productScreen.classList.add("is-changing");
    setTimeout(
      () => {
        productScreen.src = tab.dataset.screen;
        productScreen.alt = datasetValue(tab, "screenAlt", language());
        productScreen.classList.remove("is-changing");
      },
      reduceMotion ? 0 : 160,
    );
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(index));
    tab.addEventListener("keydown", (event) => {
      if (
        !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      event.preventDefault();
      activateTab(
        index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1),
        true,
      );
    });
  });

  const heroVisual = document.querySelector("[data-parallax]");
  if (
    heroVisual &&
    !reduceMotion &&
    matchMedia("(hover:hover) and (pointer:fine)").matches
  ) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty("--move-x", `${(x * 7).toFixed(2)}px`);
      heroVisual.style.setProperty("--move-y", `${(y * 5).toFixed(2)}px`);
    });
    heroVisual.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--move-x", "0px");
      heroVisual.style.setProperty("--move-y", "0px");
    });
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
