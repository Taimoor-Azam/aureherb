(function ($) {
  "use strict";

  var cfg = window.aureherbAnalytics || {};

  function pushDataLayer(obj) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(obj);
  }

  function trackGa4(eventName, payload) {
    if (!cfg.hasGa4 || typeof window.gtag !== "function") {
      return;
    }
    var params = {
      currency: payload.currency,
      value: payload.value,
      items: payload.items || [],
    };
    if (payload.transaction_id) {
      params.transaction_id = payload.transaction_id;
    }
    if (typeof payload.shipping === "number") {
      params.shipping = payload.shipping;
    }
    if (typeof payload.tax === "number") {
      params.tax = payload.tax;
    }
    window.gtag("event", eventName, params);
  }

  function trackMeta(eventName, payload) {
    if (!cfg.hasPixel || typeof window.fbq !== "function") {
      return;
    }
    var data = {
      content_ids: payload.content_ids || [],
      content_type: payload.content_type || "product",
      contents: payload.contents || [],
      currency: payload.currency || "PKR",
      value: payload.value || 0,
      num_items: payload.num_items || 0,
    };
    if (payload.content_name) {
      data.content_name = payload.content_name;
    }
    window.fbq("track", eventName, data);
  }

  function trackEvent(entry) {
    if (!entry || !entry.name || !entry.payload) {
      return;
    }

    var payload = entry.payload;
    var metaName = entry.meta || "";

    pushDataLayer({ ecommerce: null });
    pushDataLayer({
      event: entry.name,
      ecommerce: {
        currency: payload.currency,
        value: payload.value,
        transaction_id: payload.transaction_id,
        shipping: payload.shipping,
        tax: payload.tax,
        items: payload.items || [],
      },
    });

    trackGa4(entry.name, payload);

    if (metaName) {
      trackMeta(metaName, payload);
    }
  }

  function flushPageEvents() {
    var list = window.aureherbAnalyticsPageEvents;
    if (!Array.isArray(list) || !list.length) {
      return;
    }
    list.forEach(trackEvent);
    window.aureherbAnalyticsPageEvents = [];
  }

  function flushFragmentEvents(html) {
    var $node = $(html);
    if (!$node.length) {
      return;
    }
    try {
      var events = JSON.parse($node.text());
      if (Array.isArray(events)) {
        events.forEach(trackEvent);
      }
    } catch (e) {
      // ignore malformed fragment
    }
  }

  $(flushPageEvents);

  $(document.body).on("added_to_cart", function (_event, fragments) {
    if (fragments && fragments["script#aureherb-analytics-atc"]) {
      flushFragmentEvents(fragments["script#aureherb-analytics-atc"]);
      return;
    }
    flushPageEvents();
  });
})(jQuery);