/* Hafif WebAudio ses efektleri, titreşim ve Android donanım geri tuşu yönetimi. */
(function (global) {
  "use strict";
  const SES_KEY = "tem.ses.v1";
  const TIT_KEY = "tem.titresim.v1";
  let audioCtx = null;

  function oku(key, varsayilan) {
    try {
      const v = global.localStorage && global.localStorage.getItem(key);
      if (v === "0") return false;
      if (v === "1") return true;
    } catch (_) {}
    return varsayilan;
  }

  let sesAcik = oku(SES_KEY, true);
  let titresimAcik = oku(TIT_KEY, true);

  function kaydet() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(SES_KEY, sesAcik ? "1" : "0");
        global.localStorage.setItem(TIT_KEY, titresimAcik ? "1" : "0");
      }
    } catch (_) {}
  }

  function baglam() {
    if (!sesAcik) return null;
    try {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      return audioCtx;
    } catch (_) {
      return null;
    }
  }

  function temSesCal(tur) {
    if (titresimAcik && global.navigator && typeof global.navigator.vibrate === "function") {
      try {
        if (tur === "win") global.navigator.vibrate([18, 35, 24]);
        else if (tur === "loss") global.navigator.vibrate(36);
        else global.navigator.vibrate(10);
      } catch (_) {}
    }
    const ctx = baglam();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notalar = tur === "win" ? [523.25, 659.25, 783.99]
        : tur === "loss" ? [329.63, 261.63]
        : tur === "notify" ? [587.33, 783.99]
        : [440];
      notalar.forEach((frek, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tur === "loss" ? "triangle" : "sine";
        const t = now + idx * 0.065;
        osc.frequency.setValueAtTime(frek, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(tur === "click" ? 0.045 : 0.08, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (tur === "click" ? 0.06 : 0.16));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch (_) {}
  }

  function sesAyarButonlari() {
    const sTxt = sesAcik ? "🔊 Ses: Açık" : "🔇 Ses: Kapalı";
    const tTxt = titresimAcik ? "📳 Titreşim: Açık" : "📴 Titreşim: Kapalı";
    return '<div style="display:flex;gap:8px;margin-top:8px;">'
      + '<button type="button" id="tem-ses-btn" class="buton ikincil" style="flex:1;margin:0;" onclick="temSesDegistir()">' + sTxt + '</button>'
      + '<button type="button" id="tem-titresim-btn" class="buton ikincil" style="flex:1;margin:0;" onclick="temTitresimDegistir()">' + tTxt + '</button>'
      + '</div>';
  }

  function temSesDegistir() {
    sesAcik = !sesAcik;
    kaydet();
    if (sesAcik) temSesCal("notify");
    const btn = global.document && global.document.getElementById("tem-ses-btn");
    if (btn) btn.textContent = sesAcik ? "🔊 Ses: Açık" : "🔇 Ses: Kapalı";
  }

  function temTitresimDegistir() {
    titresimAcik = !titresimAcik;
    kaydet();
    if (titresimAcik && global.navigator && global.navigator.vibrate) {
      try { global.navigator.vibrate(14); } catch (_) {}
    }
    const btn = global.document && global.document.getElementById("tem-titresim-btn");
    if (btn) btn.textContent = titresimAcik ? "📳 Titreşim: Açık" : "📴 Titreşim: Kapalı";
  }

  function temGeriTusuIsle() {
    if (!global.document) return false;
    const mola = global.document.querySelector(".reklam-teknik-mola");
    if (mola) return true;
    const geriBtn = global.document.querySelector("button.geri, button.feedback-back");
    if (geriBtn && geriBtn.offsetParent !== null) {
      geriBtn.click();
      return true;
    }
    if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri) || (typeof banDurum !== "undefined" && banDurum)) {
      return true;
    }
    const anaHero = global.document.querySelector(".baslangic-hero");
    if (!anaHero && typeof global.anaMenu === "function") {
      global.anaMenu();
      return true;
    }
    return false;
  }

  if (global.document && typeof global.document.addEventListener === "function") {
    global.document.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest && e.target.closest("button");
      if (btn && btn.id !== "tem-ses-btn" && btn.id !== "tem-titresim-btn") {
        temSesCal("click");
      }
    });
    global.document.addEventListener("visibilitychange", () => {
      if (global.document.hidden && audioCtx && audioCtx.state === "running") {
        audioCtx.suspend().catch(() => {});
      }
    });
  }

  global.temSesCal = temSesCal;
  global.sesAyarButonlari = sesAyarButonlari;
  global.temSesDegistir = temSesDegistir;
  global.temTitresimDegistir = temTitresimDegistir;
  global.temGeriTusuIsle = temGeriTusuIsle;
})(typeof window !== "undefined" ? window : globalThis);
