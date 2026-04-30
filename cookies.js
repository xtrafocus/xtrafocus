document.addEventListener("DOMContentLoaded", () => {
  const COOKIE_STORAGE_KEY = "xtrafocus_cookie_preferences_v1";
  const GA_MEASUREMENT_ID = "G-LTPYRZ690W";

  let gaLoaded = false;

  const cookieBanner = document.getElementById("cookie-banner");
  const cookiePanel = document.getElementById("cookie-panel");

  const btnAccept = document.getElementById("cookie-accept");
  const btnReject = document.getElementById("cookie-reject");
  const btnConfigure = document.getElementById("cookie-configure");
  const btnOpenSettings = document.getElementById("open-cookie-settings");

  const btnPanelClose = document.getElementById("cookie-panel-close");
  const btnSaveSelection = document.getElementById("cookie-save-selection");
  const btnAcceptAllPanel = document.getElementById("cookie-accept-all-panel");

  const analyticsToggle = document.getElementById("analytics-consent-toggle");

  console.log("cookies.js cargado");

  function getCookiePreferences() {
    try {
      return JSON.parse(localStorage.getItem(COOKIE_STORAGE_KEY));
    } catch (e) {
      return null;
    }
  }

  function saveCookiePreferences(prefs) {
    localStorage.setItem(
      COOKIE_STORAGE_KEY,
      JSON.stringify({
        ...prefs,
        updatedAt: new Date().toISOString()
      })
    );
  }

  function showCookieBanner() {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  function hideCookieBanner() {
    if (cookieBanner) cookieBanner.hidden = true;
  }

  function openCookiePanel() {
    if (!cookiePanel) return;

    const prefs = getCookiePreferences();
    if (analyticsToggle) {
      analyticsToggle.checked = !!prefs?.analytics;
    }

    cookiePanel.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeCookiePanel() {
    if (!cookiePanel) return;
    cookiePanel.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    if (!GA_MEASUREMENT_ID) return;

    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true
    });

    console.log("Google Analytics cargado");
  }

  function applyConsent(prefs) {
    console.log("applyConsent ejecutado", prefs);

    saveCookiePreferences(prefs);
    hideCookieBanner();
    closeCookiePanel();

    if (prefs.analytics) {
      loadGoogleAnalytics();
    }
  }

  if (btnAccept) {
    btnAccept.addEventListener("click", () => {
      applyConsent({
        necessary: true,
        analytics: true
      });
    });
  } else {
    console.warn("No existe #cookie-accept");
  }

  if (btnReject) {
    btnReject.addEventListener("click", () => {
      applyConsent({
        necessary: true,
        analytics: false
      });
    });
  }

  if (btnConfigure) {
    btnConfigure.addEventListener("click", openCookiePanel);
  }

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener("click", openCookiePanel);
  }

  if (btnPanelClose) {
    btnPanelClose.addEventListener("click", closeCookiePanel);
  }

  if (btnSaveSelection) {
    btnSaveSelection.addEventListener("click", () => {
      applyConsent({
        necessary: true,
        analytics: !!analyticsToggle?.checked
      });
    });
  }

  if (btnAcceptAllPanel) {
    btnAcceptAllPanel.addEventListener("click", () => {
      applyConsent({
        necessary: true,
        analytics: true
      });
    });
  }

  if (cookiePanel) {
    cookiePanel.addEventListener("click", (e) => {
      if (e.target === cookiePanel) {
        closeCookiePanel();
      }
    });
  }

  const prefs = getCookiePreferences();

  if (!prefs) {
    showCookieBanner();
  } else {
    hideCookieBanner();
    if (prefs.analytics) {
      loadGoogleAnalytics();
    }
  }
});