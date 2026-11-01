// ---- Maç izleme prototipi: şematik harita, tek round animasyonu (Aşama 8.1) ----
const IZLE_HARITALAR = {
  "Çöl Kalesi": {
    koridorlar: [
      [[50, 92], [50, 78]],
      [[50, 78], [20, 80], [12, 60], [13, 40], [19, 24]],
      [[50, 78], [80, 80], [88, 60], [87, 40], [81, 24]],
      [[50, 78], [50, 45], [50, 12]],
      [[50, 45], [38, 40], [28, 30], [22, 22]],
      [[50, 45], [62, 40], [72, 30], [78, 22]],
      [[50, 14], [36, 16], [22, 19]],
      [[50, 14], [64, 16], [78, 19]]
    ],
    siteler: { A: { x: 20, y: 20 }, B: { x: 80, y: 20 } },
    kasalar: [[14, 14], [24, 24], [72, 13], [82, 25]]
  }
};

// Saldıranların (T) ve savunanların (C) rotaları. A tarafı için yazıldı, B için ayna alınır.
const IZLE_YOL = {
  tUzun: [[50, 92], [50, 78], [20, 80], [12, 60], [13, 40], [19, 24]],
  tOrta: [[50, 92], [50, 78], [50, 45], [38, 40], [28, 30], [22, 22]],
  tLurk: [[50, 92], [50, 78], [50, 45], [50, 34]],
  ctA: [[50, 10], [36, 16], [23, 19]],
  ctOrta: [[50, 10], [50, 28]]
};

let izleDurum = null;

function izleAyna(yol) {
  return yol.map(function (n) { return [100 - n[0], n[1]]; });
}

function izleOyuncu(takim, no, ad) {
  return {
    takim: takim, no: no, ad: ad,
    ox: (Math.random() * 2 - 1) * 2.2, oy: (Math.random() * 2 - 1) * 2.2,
    hiz: 10 + Math.random() * 1.6, kare: []
  };
}

// Yolu zaman damgalı anahtar karelere çevirir
function izleKareler(yol, t0, hiz, ox, oy) {
  const k = [];
  let t = t0;
  yol.forEach(function (n, i) {
    if (i > 0) {
      const dx = n[0] - yol[i - 1][0], dy = n[1] - yol[i - 1][1];
      t += Math.sqrt(dx * dx + dy * dy) / hiz;
    }
    k.push({ t: t, x: n[0] + ox, y: n[1] + oy });
  });
  return k;
}

function izleKonum(p, t) {
  if (p.olumT !== undefined && t > p.olumT) t = p.olumT;
  const k = p.kare;
  if (t <= k[0].t) return { x: k[0].x, y: k[0].y };
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i].t) {
      const a = k[i - 1], b = k[i];
      const f = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  const s = k[k.length - 1];
  return { x: s.x, y: s.y };
}

// t0 anından itibaren oyuncuyu yeni bir yola yönlendirir
function izleYolEkle(p, yol, t0, hiz) {
  const c = izleKonum(p, t0);
  const k = p.kare.filter(function (x) { return x.t < t0; });
  k.push({ t: t0, x: c.x, y: c.y });
  let t = t0, px = c.x, py = c.y;
  yol.forEach(function (n) {
    const x = n[0] + p.ox, y = n[1] + p.oy;
    t += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py)) / hiz;
    k.push({ t: t, x: x, y: y });
    px = x; py = y;
  });
  p.kare = k;
}

// Savunmacının bomba alanına gidiş yolu (bulunduğu yere göre)
function izleRotasyon(p, t0, site) {
  const c = izleKonum(p, t0);
  const sx = site === "A" ? 20 : 80;
  if (Math.abs(c.x - sx) < 14 && c.y < 30) return [[sx, 21]];
  if (Math.abs(c.x - 50) < 10) return site === "A" ? [[38, 24], [22, 21]] : [[62, 24], [78, 21]];
  return site === "A" ? [[64, 16], [50, 14], [36, 16], [22, 21]] : [[36, 16], [50, 14], [64, 16], [78, 21]];
}

// ---------- Round üretimi ----------
function izleRaundUret(tKazandi, adlarT, adlarC) {
  const site = Math.random() < 0.5 ? "A" : "B";
  const sx = site === "A" ? 20 : 80, sy = 21;
  const duz = function (y) { return site === "A" ? y : izleAyna(y); };
  const T = adlarT.map(function (ad, i) { return izleOyuncu("T", i, ad); });
  const C = adlarC.map(function (ad, i) { return izleOyuncu("C", i, ad); });
  T.forEach(function (p, i) {
    const yol = i < 3 ? duz(IZLE_YOL.tUzun) : (i === 3 ? duz(IZLE_YOL.tOrta) : IZLE_YOL.tLurk);
    p.kare = izleKareler(yol, i * 0.18, p.hiz, p.ox, p.oy);
  });
  C.forEach(function (p, i) {
    const yol = i < 2 ? IZLE_YOL.ctA : (i < 4 ? izleAyna(IZLE_YOL.ctA) : IZLE_YOL.ctOrta);
    p.kare = izleKareler(yol, 0.4 + i * 0.2, p.hiz * 0.9, p.ox, p.oy);
  });
  const siteGrup = site === "A" ? [0, 1] : [2, 3];
  const olaylar = [];
  let oncelik = false;
  const canli = function (p) { return p.olumT === undefined; };
  const rep = function (s, n) { const a = []; for (let i = 0; i < n; i++) a.push(s); return a; };
  const zamanlar = function (n, t0) {
    const a = [];
    let t = t0;
    for (let i = 0; i < n; i++) { t += 0.5 + Math.random() * 1.5; a.push(t); }
    return a;
  };
  function agirlikliRastgele(liste, ag) {
    let top = 0;
    ag.forEach(function (a) { top += a; });
    let r = Math.random() * top;
    for (let i = 0; i < liste.length; i++) { r -= ag[i]; if (r <= 0) return liste[i]; }
    return liste[liste.length - 1];
  }
  function oldur(taraf, t, hedef) {
    const olen = (taraf === "T" ? T : C).filter(canli);
    const katil = (taraf === "T" ? C : T).filter(canli);
    let v = hedef;
    if (!v) {
      if (taraf === "C") {
        v = agirlikliRastgele(olen, olen.map(function (p) {
          return siteGrup.indexOf(p.no) >= 0 ? (oncelik ? 1000 : 3) : (p.no === 4 ? 2 : 1);
        }));
      } else {
        v = olen[Math.floor(Math.random() * olen.length)];
      }
    }
    const k = katil[Math.floor(Math.random() * katil.length)];
    v.olumT = t;
    olaylar.push({ t: t, k: k, v: v });
  }

  let neden, tOlum, cOlum;
  const r = Math.random();
  if (tKazandi) {
    if (r < 0.55) { neden = "imha"; cOlum = 5; tOlum = Math.floor(Math.random() * 4); }
    else { neden = "bomba"; cOlum = 2 + Math.floor(Math.random() * 3); tOlum = 1 + Math.floor(Math.random() * 3); }
  } else {
    if (r < 0.65) { neden = "imha"; tOlum = 5; cOlum = Math.floor(Math.random() * 4); }
    else { neden = "defuse"; tOlum = 5; cOlum = Math.floor(Math.random() * 3); }
  }
  const tc = 8.4 + Math.random() * 0.8;
  let bitis, bomba = null, defuse = null, sonucYazi;
  const ilkT = function () { return T.filter(canli).sort(function (a, b) { return a.no - b.no; })[0]; };

  if (neden === "imha") {
    const seq = karistir(rep("T", tOlum).concat(rep("C", cOlum)));
    const kaybeden = tKazandi ? "C" : "T";
    if (seq[seq.length - 1] !== kaybeden) {
      const i = seq.lastIndexOf(kaybeden);
      const x = seq[i]; seq[i] = seq[seq.length - 1]; seq[seq.length - 1] = x;
    }
    const zs = zamanlar(seq.length, tc);
    seq.forEach(function (s, i) { oldur(s, zs[i]); });
    bitis = zs[zs.length - 1] + 1.2;
    sonucYazi = tKazandi ? "Saldıranlar kazandı: tüm savunmacılar elendi." : "Savunanlar kazandı: tüm saldıranlar elendi.";
  } else {
    oncelik = neden === "bomba";
    const postT = neden === "defuse" ? 1 + Math.floor(Math.random() * 2) : 0;
    const seq = karistir(rep("T", tOlum - postT).concat(rep("C", cOlum)));
    const zs = zamanlar(seq.length, tc);
    seq.forEach(function (s, i) { oldur(s, zs[i]); });
    const son = zs.length ? zs[zs.length - 1] : tc;
    const planter = ilkT();
    izleYolEkle(planter, [[sx, sy]], planter.kare[planter.kare.length - 1].t, planter.hiz);
    const tp = Math.max(son + 1.0, planter.kare[planter.kare.length - 1].t + 0.2, 10.0);
    bomba = { site: site, x: sx, y: sy, t: tp, kur: tp + 1.4, patlar: tp + 8.4 };
    if (neden === "bomba") {
      const tr = bomba.kur + 4.5;
      C.filter(canli).forEach(function (p) { izleYolEkle(p, izleRotasyon(p, tr, site), tr, 10); });
      bitis = bomba.patlar + 1.6;
      sonucYazi = "Saldıranlar kazandı: bomba patladı.";
    } else {
      const tr = bomba.t + 0.3;
      let defuser = null, enErken = 1e9;
      C.filter(canli).forEach(function (p) {
        izleYolEkle(p, izleRotasyon(p, tr, site), tr, 10.5);
        const v = p.kare[p.kare.length - 1].t;
        if (v < enErken) { enErken = v; defuser = p; }
      });
      let sonPost = bomba.kur;
      T.filter(canli).forEach(function (p, i) {
        sonPost = bomba.kur + 0.8 + i * 1.1;
        oldur("T", sonPost, p);
      });
      const bas = Math.max(enErken, sonPost + 0.4, bomba.kur + 0.3);
      const bit = bas + 2.0;
      if (bit > bomba.patlar - 0.4) bomba.patlar = bit + 1.2;
      defuse = { bas: bas, bit: bit, oyuncu: defuser };
      bitis = bit + 1.4;
      sonucYazi = "Savunanlar kazandı: bomba etkisizleştirildi.";
    }
  }

  const liste = olaylar.map(function (e) { return { t: e.t, tip: "kill", k: e.k, v: e.v }; });
  if (bomba) liste.push({ t: bomba.kur, tip: "plant", site: site });
  if (defuse) liste.push({ t: defuse.bit, tip: "defuse" });
  if (neden === "bomba") liste.push({ t: bomba.patlar, tip: "patlama" });
  liste.sort(function (a, b) { return a.t - b.t; });
  olaylar.sort(function (a, b) { return a.t - b.t; });

  return { site: site, neden: neden, tKazandi: tKazandi, oyuncular: T.concat(C), olaylar: olaylar, bomba: bomba, defuse: defuse, bitis: bitis, liste: liste, sonucYazi: sonucYazi };
}

// ---------- Çizim ----------
function izleCiz() {
  const d = izleDurum;
  const cv = document.getElementById("izleCanvas");
  if (!d || !cv) return;
  const ctx = cv.getContext("2d");
  const sc = cv.width / 100;
  const M = IZLE_HARITALAR[d.harita];
  const R = d.raund;
  const t = d.t;
  const rk = function (tk) { return tk === "T" ? d.renkT : d.renkC; };
  const olu = function (p) { return p.olumT !== undefined && t >= p.olumT; };

  ctx.setTransform(sc, 0, 0, sc, 0, 0);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, 100, 100);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  [["#374151", 8.8], ["#18212f", 7]].forEach(function (s) {
    ctx.strokeStyle = s[0];
    ctx.lineWidth = s[1];
    M.koridorlar.forEach(function (yol) {
      ctx.beginPath();
      yol.forEach(function (n, i) { if (i === 0) ctx.moveTo(n[0], n[1]); else ctx.lineTo(n[0], n[1]); });
      ctx.stroke();
    });
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [["SAVUNMA", 3], ["SALDIRI", 86]].forEach(function (z) {
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(39, z[1], 22, 12);
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 0.4;
    ctx.strokeRect(39, z[1], 22, 12);
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 2.6px sans-serif";
    ctx.fillText(z[0], 50, z[1] + 6);
  });

  ["A", "B"].forEach(function (k) {
    const s = M.siteler[k];
    ctx.fillStyle = "rgba(245,158,11,0.10)";
    ctx.fillRect(s.x - 10, s.y - 10, 20, 20);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(s.x - 10, s.y - 10, 20, 20);
    ctx.fillStyle = "rgba(245,158,11,0.40)";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText(k, s.x, s.y - 2);
  });
  ctx.fillStyle = "#2b3649";
  M.kasalar.forEach(function (c) { ctx.fillRect(c[0], c[1], 3.6, 3.6); });

  // Ölüm işaretleri
  R.olaylar.forEach(function (e) {
    if (t < e.t) return;
    const vp = izleKonum(e.v, e.t);
    ctx.strokeStyle = rk(e.v.takim);
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(vp.x - 1.5, vp.y - 1.5); ctx.lineTo(vp.x + 1.5, vp.y + 1.5);
    ctx.moveTo(vp.x + 1.5, vp.y - 1.5); ctx.lineTo(vp.x - 1.5, vp.y + 1.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Bomba
  const B = R.bomba;
  if (B && t >= B.t) {
    if (t < B.kur) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(B.x, B.y, 3.6, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * (t - B.t) / (B.kur - B.t));
      ctx.stroke();
    } else if (!(R.defuse && t >= R.defuse.bit)) {
      const sol = Math.max(0, B.patlar - t);
      const nb = 0.5 + 0.5 * Math.sin(t * (4 + (8 - Math.min(8, sol)) * 1.2));
      ctx.fillStyle = "rgba(239,68,68," + (0.35 + 0.5 * nb) + ")";
      ctx.beginPath();
      ctx.arc(B.x, B.y, 2.3 + nb * 0.9, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#fecaca";
      ctx.font = "bold 2.6px sans-serif";
      ctx.fillText(sol.toFixed(1), B.x, B.y - 5);
    }
    if (R.defuse && t >= R.defuse.bas && t < R.defuse.bit) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(B.x, B.y, 4.6, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * (t - R.defuse.bas) / (R.defuse.bit - R.defuse.bas));
      ctx.stroke();
    }
    if (R.defuse && t >= R.defuse.bit) {
      ctx.fillStyle = "rgba(34,197,94,0.7)";
      ctx.beginPath();
      ctx.arc(B.x, B.y, 2.8, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (R.neden === "bomba" && t >= B.patlar) {
      const g = t - B.patlar;
      if (g < 1.4) {
        ctx.strokeStyle = "rgba(245,158,11," + (1 - g / 1.4) + ")";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(B.x, B.y, 2 + g * 12, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }

  // Ateş çizgileri
  R.olaylar.forEach(function (e) {
    const g = t - e.t;
    if (g < 0 || g > 0.35) return;
    const kp = izleKonum(e.k, e.t), vp = izleKonum(e.v, e.t);
    ctx.strokeStyle = "rgba(255,255,255," + (1 - g / 0.35) + ")";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(kp.x, kp.y);
    ctx.lineTo(vp.x, vp.y);
    ctx.stroke();
  });

  // Oyuncular
  R.oyuncular.forEach(function (p) {
    if (olu(p)) return;
    const q = izleKonum(p, t);
    ctx.fillStyle = rk(p.takim);
    ctx.strokeStyle = "#0b1220";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 2.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b1220";
    ctx.font = "bold 2.3px sans-serif";
    ctx.fillText(String(p.no + 1), q.x, q.y + 0.1);
  });

  // Bilgi yazıları
  const sayi = function (tk) { return R.oyuncular.filter(function (p) { return p.takim === tk && !olu(p); }).length; };
  ctx.font = "bold 2.8px sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = d.renkC;
  ctx.fillText("● Savunan " + sayi("C"), 2, 4);
  ctx.fillStyle = d.renkT;
  ctx.fillText("● Saldıran " + sayi("T"), 2, 96);
  ctx.textAlign = "right";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(t.toFixed(1) + " sn", 98, 96);
}

// ---------- Akış listesi, sonuç ve lejant ----------
function izleOlayYazi(e) {
  const d = izleDurum;
  const renk = function (p) { return p.takim === "T" ? d.renkT : d.renkC; };
  const zaman = '<span style="color:#6b7280">' + e.t.toFixed(1) + "s</span> ";
  if (e.tip === "kill") {
    return zaman + '<span style="color:' + renk(e.k) + '">' + e.k.ad + "</span> → <span style=\"color:" + renk(e.v) + '">' + e.v.ad + "</span>";
  }
  if (e.tip === "plant") return zaman + "Bomba kuruldu (" + e.site + " alanı)";
  if (e.tip === "defuse") return zaman + "Bomba etkisizleştirildi";
  return zaman + "Bomba patladı";
}

function izleOlayGuncelle() {
  const d = izleDurum;
  const el = document.getElementById("izleOlaylar");
  if (!d || !el) return;
  const goster = d.raund.liste.filter(function (e) { return e.t <= d.t; });
  if (goster.length === d.beslem) return;
  d.beslem = goster.length;
  el.innerHTML = goster.length === 0 ? "Round başladı..." : goster.slice().reverse().map(izleOlayYazi).join("<br>");
}

function izleSonucYaz() {
  const d = izleDurum;
  const el = document.getElementById("izleSonuc");
  if (!d || !el || d.t < d.raund.bitis) return;
  const R = d.raund;
  const kazanan = R.tKazandi ? (d.senSaldiran ? "Sen" : "Rakip") : (d.senSaldiran ? "Rakip" : "Sen");
  el.innerHTML = '<div class="ipucu">' + R.sonucYazi + "<br>Round kazananı: <b>" + kazanan + "</b></div>";
}

function izleLejantYaz() {
  const d = izleDurum;
  const el = document.getElementById("izleLejant");
  if (!el) return;
  const sat = function (ad, renk, baslik, adlar) {
    return '<div class="mac-satir" style="border-left:5px solid ' + renk + '"><b>' + baslik + ": " + ad + "</b><br>" + adlar.map(function (a, i) { return (i + 1) + " " + a; }).join(" · ") + "</div>";
  };
  el.innerHTML = sat(d.adC, d.renkC, "Savunma", d.adlarC) + sat(d.adT, d.renkT, "Saldırı", d.adlarT);
}

// ---------- Akış kontrolü ----------
function izleBaslatDongu() {
  const d = izleDurum;
  d.token = (d.token || 0) + 1;
  const tok = d.token;
  d.son = performance.now();
  function kare(ts) {
    if (!izleDurum || izleDurum.token !== tok) return;
    if (!document.getElementById("izleCanvas")) return;
    const dt = Math.min(0.1, (ts - d.son) / 1000);
    d.son = ts;
    if (d.oynuyor) {
      d.t += dt * d.hiz;
      if (d.t >= d.raund.bitis) { d.t = d.raund.bitis; d.oynuyor = false; }
    }
    izleCiz();
    izleOlayGuncelle();
    if (d.oynuyor) requestAnimationFrame(kare);
    else izleSonucYaz();
  }
  requestAnimationFrame(kare);
}

function izleRaundKur() {
  const d = izleDurum;
  rakipleriBagla();
  const rakip = dunya[0];
  const sen = kariyer.oyuncular.map(function (o) { return o.ad; });
  const rk = rakip.oyuncular.map(function (o) { return o.ad; });
  d.adlarT = d.senSaldiran ? sen : rk;
  d.adlarC = d.senSaldiran ? rk : sen;
  d.adT = d.senSaldiran ? kariyer.takimAdi : rakip.ad;
  d.adC = d.senSaldiran ? rakip.ad : kariyer.takimAdi;
  const rakipRenk = String(kariyer.renk).toLowerCase() === "#ef4444" ? "#38bdf8" : "#ef4444";
  d.renkT = d.senSaldiran ? kariyer.renk : rakipRenk;
  d.renkC = d.senSaldiran ? rakipRenk : kariyer.renk;
  d.raund = izleRaundUret(Math.random() < 0.5, d.adlarT, d.adlarC);
  d.t = 0;
  d.oynuyor = true;
  d.beslem = -1;
  const s = document.getElementById("izleSonuc");
  if (s) s.innerHTML = "";
  izleLejantYaz();
  izleBaslatDongu();
}

function izleYeniRaund() { if (izleDurum) izleRaundKur(); }
function izleTarafDegistir() { if (!izleDurum) return; izleDurum.senSaldiran = !izleDurum.senSaldiran; izleRaundKur(); }

function izleTekrar() {
  const d = izleDurum;
  if (!d) return;
  d.t = 0;
  d.oynuyor = true;
  d.beslem = -1;
  const s = document.getElementById("izleSonuc");
  if (s) s.innerHTML = "";
  izleBaslatDongu();
}

function izleAtla() {
  const d = izleDurum;
  if (!d) return;
  d.t = d.raund.bitis;
  d.oynuyor = false;
  izleCiz();
  izleOlayGuncelle();
  izleSonucYaz();
}

function izleDuraklat() {
  const d = izleDurum;
  if (!d) return;
  if (d.oynuyor) { d.oynuyor = false; return; }
  if (d.t >= d.raund.bitis) return;
  d.oynuyor = true;
  izleBaslatDongu();
}

function izleHiz(h) {
  const d = izleDurum;
  if (!d) return;
  d.hiz = h;
  [1, 2, 4, 8].forEach(function (x) {
    const b = document.getElementById("izleHiz" + x);
    if (b) b.className = "etiket" + (x === h ? " yesil" : "");
  });
}

function izleEkrani() {
  const stil = ' style="padding:10px 16px;font-size:14px"';
  let html = '<button class="geri" onclick="kulupMenu()">← Geri</button><h2>Maç İzleme (Prototip)</h2>';
  html += '<div class="bilgi-kutusu">Prototip: yalnızca görünümü denemek için. Rastgele round oynatır, maç sonucuna ve kayda etkisi yok. Noktaların üstündeki numara oyuncu sırasıdır.</div>';
  html += '<canvas id="izleCanvas" style="width:100%;display:block;border-radius:12px;border:1px solid #374151;margin-bottom:10px"></canvas>';
  html += '<div class="etiketler">';
  [1, 2, 4, 8].forEach(function (h) {
    html += '<button id="izleHiz' + h + '" class="etiket' + (h === 2 ? " yesil" : "") + '"' + stil + ' onclick="izleHiz(' + h + ')">' + h + "×</button>";
  });
  html += '<button class="etiket sari"' + stil + ' onclick="izleDuraklat()">Duraklat / Devam</button>';
  html += "</div>";
  html += '<div class="etiketler">';
  html += '<button class="etiket"' + stil + ' onclick="izleAtla()">Sonuca Atla</button>';
  html += '<button class="etiket"' + stil + ' onclick="izleTekrar()">Tekrar İzle</button>';
  html += '<button class="etiket"' + stil + ' onclick="izleYeniRaund()">Yeni Round</button>';
  html += '<button class="etiket"' + stil + ' onclick="izleTarafDegistir()">Taraf Değiştir</button>';
  html += "</div>";
  html += '<div id="izleSonuc"></div><div id="izleLejant"></div>';
  html += '<h2>Round Akışı</h2><div id="izleOlaylar" class="olay-liste">Round başladı...</div>';
  uygulama.innerHTML = html;
  const cv = document.getElementById("izleCanvas");
  const w = Math.floor(cv.clientWidth);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = w * dpr;
  cv.height = w * dpr;
  cv.style.height = w + "px";
  izleDurum = { harita: "Çöl Kalesi", senSaldiran: true, hiz: 2, token: 0 };
  izleRaundKur();
}
