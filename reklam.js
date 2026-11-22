// İlk 2 maç geçiş reklamı yok. Sonrası: en az 3 maç VE son geçiş reklamından en az 3 dakika.
(function (global) {
  "use strict";
  const KEY = "tem_reklam_siklik_v1", WAIT = 3 * 60 * 1000, ONBOARDING_FREE = 2, MIN_MATCHES = 3;
  function createPolicy(storage, now) {
    let state;
    try { state = JSON.parse(storage.getItem(KEY)); } catch (_) {}
    if (!state || !Number.isFinite(state.lastAt) || !Number.isInteger(state.matches) || state.matches < 0)
      state = { matches: 0, totalMatches: 0, lastAt: now(), first: true };
    if (typeof state.first !== "boolean") state.first = true;
    if (!Number.isInteger(state.totalMatches) || state.totalMatches < state.matches) state.totalMatches = state.matches;
    function save() { try { storage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
    save();
    return {
      startSession() { state = { matches: 0, totalMatches: 0, lastAt: now(), first: true }; save(); },
      completed() { state.matches++; state.totalMatches++; save(); },
      eligible() {
        if (state.totalMatches <= ONBOARDING_FREE) return false;
        if (state.matches < MIN_MATCHES) return false;
        if (state.first) return true;
        return now() - state.lastAt >= WAIT;
      },
      shown(at) { state.matches = 0; state.first = false; state.lastAt = at || now(); save(); }
    };
  }
  function createScheduler(options) {
    let busy = false, retryAt = 0;
    async function tick(force = false) {
      if (busy || (!force && options.now() < retryAt) || options.blocked() || !options.policy.eligible()) return;
      busy = true;
      let cleanup;
      try {
        const status = await options.prepare();
        if (!status.ready) { retryAt = options.now() + 1000; return; }
        // Reklam yüklenirken maç başlayabilir veya uygulama arka plana geçebilir.
        if (options.blocked()) return;
        cleanup = options.openBreak();
        await options.wait(2000);
        if (options.blocked()) return;
        const result = await options.show();
        if (result.shown) options.policy.shown(result.shownAt);
        else retryAt = options.now() + 15000;
      } catch (_) { retryAt = options.now() + 15000; }
      finally { if (cleanup) cleanup(); busy = false; }
    }
    return { tick };
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { createPolicy, createScheduler };
  if (!global.document) return;
  let storage;
  try { storage = global.localStorage; } catch (_) { storage = { getItem() {}, setItem() {} }; }
  const policy = createPolicy(storage, Date.now);
  // İlk maç/8 dakika kuralı her oyun açılışında yeniden başlar; kariyer kaydı etkilenmez.
  policy.startSession();
  const cap = global.Capacitor;
  const native = cap && cap.getPlatform() === "android" && cap.isPluginAvailable("GameAds");
  const call = method => cap.nativePromise("GameAds", method, {});
  let ready = false;
  function matchActive() {
    return (typeof canli !== "undefined" && canli !== null)
      || (typeof canliSeri !== "undefined" && canliSeri !== null)
      || (typeof banDurum !== "undefined" && banDurum !== null);
  }
  function blocked() {
    return !native || !ready || (typeof reklamsiz !== "undefined" && reklamsiz) || !!document.getElementById("reklamsiz-magaza") || !!document.getElementById("kimlik-studyosu") || (typeof kimlikMagazaMesgul !== "undefined" && kimlikMagazaMesgul) || document.hidden || matchActive() || !!document.getElementById("feedback-screen") || !!document.getElementById("rehber-panel")
      || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
  }
  function openBreak() {
    const game = document.getElementById("uygulama");
    const focus = document.activeElement;
    const wasInert = game.inert;
    game.inert = true;
    const layer = document.createElement("div");
    layer.className = "reklam-teknik-mola";
    layer.setAttribute("role", "dialog"); layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-labelledby", "reklam-mola-baslik"); layer.tabIndex = -1;
    layer.innerHTML = '<div class="reklam-mola-kart"><h2 id="reklam-mola-baslik">Teknik Mola</h2><p>Kısa bir reklamın ardından devam ediyoruz.</p><div class="reklam-mola-ilerleme" aria-hidden="true"><span></span></div></div>';
    document.body.appendChild(layer); layer.focus();
    return () => {
      layer.remove(); game.inert = wasInert;
      if (focus?.isConnected) focus.focus({ preventScroll: true });
    };
  }
  const scheduler = createScheduler({
    policy, now: Date.now, blocked, openBreak,
    wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
    prepare: () => call("isInterstitialReady"), show: () => call("showInterstitial")
  });
  global.reklamMacTamamlandi = function () { policy.completed(); void scheduler.tick(true); };
  if (typeof reklamsizArkaPlanKontrolu === "function") void reklamsizArkaPlanKontrolu();
  let initStarted = false;
  function ensureInitialized() {
    if (!native || initStarted || (typeof reklamsiz !== "undefined" && reklamsiz)) return Promise.resolve();
    initStarted = true;
    return cap.nativePromise("GameAds", "setAdsDisabled", { disabled: false })
      .then(() => call("initialize")).then(result => {
      if (!result) return;
      ready = true;
      if (result.privacyRequired && !(typeof reklamsiz !== "undefined" && reklamsiz) && !document.querySelector(".reklam-gizlilik")) {
        const button = document.createElement("button");
        button.textContent = "Reklam gizlilik tercihleri"; button.className = "reklam-gizlilik";
        let privacyBusy = false;
        button.onclick = async () => {
          if (privacyBusy) return;
          privacyBusy = true; ready = false;
          try { await call("privacyOptions"); } catch (_) {}
          finally { privacyBusy = false; ready = true; }
        };
        document.body.appendChild(button);
      }
      void scheduler.tick();
    }).catch(() => { initStarted = false; });
  }
  global.reklamBaslatGerekirse = ensureInitialized;
  if (native) {
    const adFreeInit = typeof reklamsiz !== "undefined" && reklamsiz;
    if (adFreeInit) {
      cap.nativePromise("GameAds", "setAdsDisabled", { disabled: true }).catch(() => {});
    } else {
      void ensureInitialized();
    }
    setInterval(() => { void scheduler.tick(); }, 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) void scheduler.tick(); });
  }
})(typeof window !== "undefined" ? window : globalThis);
