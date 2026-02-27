/**
 * script.js — Vercel Landing Page Clone
 * ──────────────────────────────────────
 * Features:
 *  1. Navbar — adds .is-scrolled for backdrop-blur on scroll
 *  2. Fade-in — IntersectionObserver on .fade-target elements
 *  3. Mobile menu — hamburger toggle with aria-expanded
 *
 * No frameworks. No scroll listeners for animation.
 * All interactions are accessible and keyboard-navigable.
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────
   * 1. NAVBAR SCROLL STATE
   *    Adds `.is-scrolled` to #navbar when page scrollY > 8px.
   *    Uses passive scroll listener for performance.
   * ───────────────────────────────────────────────────────── */
  const navbar = document.getElementById("navbar");

  if (navbar) {
    const SCROLL_THRESHOLD = 8;

    function syncNavbarState() {
      const shouldBeScrolled = window.scrollY > SCROLL_THRESHOLD;
      // Only toggle class if state has changed (avoids layout thrashing)
      navbar.classList.toggle("is-scrolled", shouldBeScrolled);
    }

    // Sync immediately on load (handles page refresh at scroll position)
    syncNavbarState();

    window.addEventListener("scroll", syncNavbarState, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
   * 2. INTERSECTION OBSERVER — FADE-IN
   *    Watches every `.fade-target` element.
   *    When 12% of the element enters the viewport,
   *    `.is-visible` is added (triggers CSS transition).
   *    Siblings within the same parent get a small stagger delay.
   * ───────────────────────────────────────────────────────── */
  const fadeTargets = document.querySelectorAll(".fade-target");

  if (fadeTargets.length > 0 && "IntersectionObserver" in window) {
    const THRESHOLD = 0.12;
    const STAGGER_MS = 65; // delay per sibling index

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;

          // Calculate stagger: find this element's position among
          // un-animated siblings inside the same parent container.
          const siblings = Array.from(
            el.parentElement.querySelectorAll(".fade-target:not(.is-visible)")
          );
          const idx = siblings.indexOf(el);
          const delay = Math.max(0, idx) * STAGGER_MS;

          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");

          // Stop observing — animation only fires once
          observer.unobserve(el);
        });
      },
      { threshold: THRESHOLD }
    );

    fadeTargets.forEach((el) => observer.observe(el));

  } else {
    // Fallback: show everything immediately if IO not supported
    fadeTargets.forEach((el) => {
      el.classList.add("is-visible");
    });
  }


  /* ─────────────────────────────────────────────────────────
   * 3. MOBILE HAMBURGER MENU
   *    Toggles `.is-open` on the nav and updates
   *    aria-expanded on the burger button.
   *    Closes on: link click, outside click, Escape key.
   * ───────────────────────────────────────────────────────── */
  const burger  = document.getElementById("navBurger");
  const navMenu = document.getElementById("navMenu");

  if (burger && navMenu) {

    /**
     * @param {boolean} open
     */
    function setMenuState(open) {
      navMenu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));

      // Prevent body scroll while menu is open (mobile UX)
      document.body.style.overflow = open ? "hidden" : "";
    }

    // Toggle on burger click
    burger.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("is-open");
      setMenuState(!isOpen);
    });

    // Close when a nav link is clicked
    navMenu.querySelectorAll(".navbar__link").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    // Close when clicking outside the nav area
    document.addEventListener("click", (event) => {
      if (
        navMenu.classList.contains("is-open") &&
        !navbar.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    // Close on Escape key (accessibility)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        setMenuState(false);
        burger.focus(); // return focus to burger
      }
    });

    // Close menu if viewport is resized above mobile breakpoint
    const mql = window.matchMedia("(min-width: 761px)");
    mql.addEventListener("change", (e) => {
      if (e.matches) setMenuState(false);
    });
  }

})(); // end IIFE
