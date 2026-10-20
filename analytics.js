// MoneySaver Copilot — analytics loader (GA4 + Plausible, privacy-light)
// Loads only if an ID is present in config.js. Otherwise stays silent.
(function () {
  var c = window.MSC_CONFIG || {};

  // ---- Google Analytics 4 ----
  if (c.GA4_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(c.GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', c.GA4_ID, { anonymize_ip: true, send_page_view: true });
  }

  // ---- Plausible ----
  if (c.PLAUSIBLE_DOMAIN) {
    var p = document.createElement('script');
    p.defer = true;
    p.setAttribute('data-domain', c.PLAUSIBLE_DOMAIN);
    p.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(p);
  }

  // Unified event forwarder — called from app.js track()
  window.mscTrack = function (name, data) {
    try {
      if (window.gtag) window.gtag('event', name, data || {});
      if (window.plausible) window.plausible(name, { props: data || {} });
    } catch (e) {}
  };

  // Convenience for Plausible custom events once loaded
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
})();
