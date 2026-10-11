(() => {
  "use strict";
  const KEY = "__llfetcherLearningApiResponses";
  if (window.__llfetcherLearningApiHooked) return;
  Object.defineProperty(window, "__llfetcherLearningApiHooked", { value: true, configurable: false });
  const responses = [];
  try { Object.defineProperty(window, KEY, { value: responses, configurable: false, writable: false }); }
  catch (_) { window[KEY] = responses; }
  const MAX_RESPONSES = 20;
  const MAX_TEXT_LENGTH = 1_500_000;
  const isLearningApi = (value) => {
    try {
      const u = new URL(typeof value === "string" ? value : (value && value.url) || "", location.href);
      return u.hostname === "www.linkedin.com" && u.pathname.startsWith("/learning-api/");
    } catch (_) { return false; }
  };
  const storeJson = (url, text) => {
    try {
      if (typeof text !== "string" || text.length > MAX_TEXT_LENGTH) return;
      const data = JSON.parse(text);
      responses.push({ url: String(url).slice(0, 500), capturedAt: Date.now(), data });
      if (responses.length > MAX_RESPONSES) responses.splice(0, responses.length - MAX_RESPONSES);
    } catch (_) { /* Many API replies are empty, non-JSON, or not course metadata. */ }
  };
  const nativeFetch = window.fetch;
  if (typeof nativeFetch === "function") {
    window.fetch = function(input, init) {
      const requestedUrl = typeof input === "string" ? input : (input && input.url) || "";
      const result = nativeFetch.apply(this, arguments);
      if (isLearningApi(requestedUrl)) {
        result.then((response) => {
          try {
            const contentType = response.headers.get("content-type") || "";
            if (response.ok && /json/i.test(contentType)) {
              response.clone().text().then((text) => storeJson(requestedUrl, text)).catch(() => {});
            }
          } catch (_) {}
        }).catch(() => {});
      }
      return result;
    };
  }
  const NativeXHR = window.XMLHttpRequest;
  if (NativeXHR && NativeXHR.prototype) {
    const nativeOpen = NativeXHR.prototype.open;
    const nativeSend = NativeXHR.prototype.send;
    NativeXHR.prototype.open = function(method, url) {
      this.__lltrLearningApiUrl = url;
      return nativeOpen.apply(this, arguments);
    };
    NativeXHR.prototype.send = function() {
      if (isLearningApi(this.__lltrLearningApiUrl)) {
        this.addEventListener("load", () => {
          try {
            if (this.status >= 200 && this.status < 300) {
              const body = this.responseType === "json" ? JSON.stringify(this.response) : this.responseText;
              storeJson(this.__lltrLearningApiUrl, body);
            }
          } catch (_) {}
        }, { once: true });
      }
      return nativeSend.apply(this, arguments);
    };
  }
})();
