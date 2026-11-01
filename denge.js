const DENGE_LAB_ACIK = true;

// ---------- Durum yedekleme (test sırasında gerçek veriyi korur) ----------
function labYedekAl() {
  return {
    harita: kariyer.harita,
    personel: kariyer.personel,
    strateji: kariyer.strateji,
    oyuncu: kariyer.oyuncular.map(function (o) { return { o: o, mor: o.mor, yor: o.yor, genel: o.genel, rol: o.rol }; })
  };
}

function labYedekGeri(y) {
  kariyer.harita = y.harita;
  kariyer.personel = y.personel;
  kariyer.strateji = y.strateji;
  y.oyuncu.forEach(function (x) { x.o.mor = x.mor; x.o.yor = x.yor; x.o.genel = x.genel; x.o.rol = x.rol; });
}

function labNotrKur() {
  kariyer.harita = {};
  HARITALAR.forEach(function (h) { kariyer.harita[h] = 0; });
  kariyer.personel = {};
  kariyer.oyuncular.forEach(function (o) { o.mor = 70; o.yor = 0; });
}

// Senin kadronun kopyası: aynı güç, nötr harita ve form
function labRakip() {
  const h = {};
  HARITALAR.forEach(function (x) { h[x] = 0; });
  return {
    ad: "Klon", strateji: kariyer.strateji, harita: h,
    oyuncular: kariyer.oyuncular.map(function (o) {
      const k = JSON.parse(JSON.stringify(o));
      k.mor = 70; k.yor = 0;
      return k;
    })
  };
}

// Taktik kadro uyumunu kapatır (yalnızca taktik üstünlüğü ölçülsün diye). Geri alma fonksiyonu döndürür.
function labRolKapat() {
  const kopya = {};
  Object.keys(TAKTIK_ROLLERI).forEach(function (k) { kopya[k] = TAKTIK_ROLLERI[k]; TAKTIK_ROLLERI[k] = []; });
  return function () { Object.keys(kopya).forEach(function (k) { TAKTIK_ROLLERI[k] = kopya[k]; }); };
}

// ---------- Senaryolar ----------
function labSenaryolar() {
  const H = HARITALAR[0];
  const S = [];
  const hc = HARITA_ETKI_CARPANI;
  function ekle(grup, ad, teorik, kur, k) {
    S.push({ grup: grup, ad: ad, teorik: teorik, kur: kur, k: k });
  }
  ekle("Referans", "Aynı takım, her şey nötr", "0", function () { return {}; });
  [2, 5, 10, 15, 20, 30].forEach(function (k) {
    ekle("GEN", "GEN farkı +" + k, "+" + k, function () {
      kariyer.oyuncular.forEach(function (o) { o.genel += k; });
      return {};
    }, k);
  });
  ekle("Harita", "Harita farkı +5", "+" + (5 * hc), function () { kariyer.harita[H] = 5; return { harita: H }; });
  ekle("Harita", "Harita farkı +10", "+" + (10 * hc), function () { kariyer.harita[H] = 10; return { harita: H }; });
  ekle("Harita", "Harita farkı +20 (sen +10, rakip -10)", "+" + (20 * hc), function (B) {
    kariyer.harita[H] = 10; B.harita[H] = -10;
    return { harita: H };
  });
  ekle("Taktik", "Taktik üstünlüğü (Agresif / Dengeli, kadro uyumu kapalı)", "+" + TAKTIK_USTUN_BONUSU, function () {
    return { tA: "Agresif", tB: "Dengeli", temizle: labRolKapat() };
  });
  ekle("Form", "Moral 100 (herkes)", "+3", function () {
    kariyer.oyuncular.forEach(function (o) { o.mor = 100; });
    return {};
  });
  ekle("Form", "Moral 30 (herkes)", "-4", function () {
    kariyer.oyuncular.forEach(function (o) { o.mor = 30; });
    return {};
  });
  ekle("Form", "Yorgunluk 100 (herkes)", "-10", function () {
    kariyer.oyuncular.forEach(function (o) { o.yor = 100; });
    return {};
  });
  ekle("Form", "Moral 0 ve yorgunluk 100", "-12", function () {
    kariyer.oyuncular.forEach(function (o) { o.mor = 0; o.yor = 100; });
    return {};
  });
  ekle("Strateji", "Strateji uyumu: en kötü / en iyi strateji", "değişken", function (B) {
    let en = STRATEJI_LISTESI[0], az = STRATEJI_LISTESI[0];
    STRATEJI_LISTESI.forEach(function (s) {
      if (stratejiUyumu(kariyer.oyuncular, s) > stratejiUyumu(kariyer.oyuncular, en)) en = s;
      if (stratejiUyumu(kariyer.oyuncular, s) < stratejiUyumu(kariyer.oyuncular, az)) az = s;
    });
    kariyer.strateji = az;
    B.strateji = en;
    const fark = STRATEJI_UYUM_ETKISI[stratejiUyumu(kariyer.oyuncular, az)] - STRATEJI_UYUM_ETKISI[stratejiUyumu(kariyer.oyuncular, en)];
    return { teorik: etkiYazi(fark) };
  });
  ekle("Personel", "Analist seviye 3 hazırlık bonusu", "?", function () {
    kariyer.personel = { analist: 3 };
    return { teorik: "+" + analistHazirlik() };
  });
  ekle("Personel", "Mola (ilk 3 round kaybında kullanılır)", "≈ +" + (MOLA_BONUSU * MOLA_TUR / 26).toFixed(1), function () { return { mola: true }; });
  ekle("Birleşik", "Her şey lehine (harita +10, moral 100, analist 3, taktik üstün, mola)", "≈ +21", function () {
    kariyer.harita[H] = 10;
    kariyer.oyuncular.forEach(function (o) { o.mor = 100; });
    kariyer.personel = { analist: 3 };
    return { harita: H, tA: "Agresif", tB: "Dengeli", mola: true, temizle: labRolKapat() };
  });
  ekle("Birleşik", "Her şey aleyhine (harita -20, moral 30, yorgunluk 100, taktik zayıf)", "≈ -30", function (B) {
    kariyer.harita[H] = -10; B.harita[H] = 10;
    kariyer.oyuncular.forEach(function (o) { o.mor = 30; o.yor = 100; });
    return { harita: H, tA: "Dengeli", tB: "Agresif", temizle: labRolKapat() };
  });
  return S;
}

// ---------- Simülasyon (canlı maç kodunun kendisi) ----------
function labMacSim(n, ayar) {
  let kazan = 0;
  for (let i = 0; i < n; i++) {
    const c = canliKur(ayar.harita || HARITALAR[0], ayar.B, null);
    c.tA = ayar.tA || "Dengeli";
    c.tB = ayar.tB || "Dengeli";
    c.mola = ayar.mola ? 1 : 0;
    c.molaB = 0;
    for (;;) {
      const s = canliIlerle(c);
      if (s === "bitti") break;
      if (s === "seri") {
        if (c.mola > 0) { c.mola--; c.serA = 0; c.molaTur = MOLA_TUR; }
        else c.seriSoruldu = true;
      }
    }
    if (c.sa > c.sb) kazan++;
  }
  return kazan * 100 / n;
}

// Kazanma yüzdesini eşdeğer GEN puanına çevirir (kalibrasyon tablosundan)
function labEsdeger(w, kal) {
  const x = Math.abs(w - 50) + 50;
  const isaret = w >= 50 ? 1 : -1;
  for (let i = 1; i < kal.length; i++) {
    if (x <= kal[i].w) {
      const a = kal[i - 1], b = kal[i];
      const t = (x - a.w) / (b.w - a.w);
      return isaret * (a.k + t * (b.k - a.k));
    }
  }
  return isaret * kal[kal.length - 1].k;
}

function labCalistir(n) {
  const S = labSenaryolar();
  const sonuc = [];
  const bas = labYedekAl();
  let i = 0;
  document.getElementById("labKontrol").innerHTML = '<div class="bilgi-kutusu" id="labIlerleme">Hazırlanıyor...</div>';
  document.getElementById("labSonuc").innerHTML = "";

  function adim() {
    if (!document.getElementById("labIlerleme")) { labYedekGeri(bas); return; }
    if (i >= S.length) { labYedekGeri(bas); labBitir(sonuc, n); return; }
    const s = S[i];
    document.getElementById("labIlerleme").textContent = "Senaryo " + (i + 1) + "/" + S.length + ": " + s.ad;
    const y = labYedekAl();
    let ayar = {};
    let w = 0;
    try {
      labNotrKur();
      const B = labRakip();
      ayar = s.kur(B) || {};
      ayar.B = B;
      w = labMacSim(n, ayar);
    } catch (e) {
      labYedekGeri(y);
      if (ayar.temizle) ayar.temizle();
      labYedekGeri(bas);
      document.getElementById("labIlerleme").textContent = "Hata: " + e.message + " (senaryo: " + s.ad + ")";
      return;
    }
    labYedekGeri(y);
    if (ayar.temizle) ayar.temizle();
    sonuc.push({ s: s, w: w, teorik: ayar.teorik || s.teorik });
    i++;
    setTimeout(adim, 5);
  }
  setTimeout(adim, 20);
}

function labBitir(sonuc, n) {
  const kal = [{ k: 0, w: 50 }];
  sonuc.filter(function (r) { return r.s.grup === "GEN"; }).forEach(function (r) { kal.push({ k: r.s.k, w: r.w }); });
  kal.sort(function (a, b) { return a.k - b.k; });
  for (let i = 1; i < kal.length; i++) kal[i].w = Math.max(kal[i].w, kal[i - 1].w + 0.01);
  const hata = Math.sqrt(2500 / n);
  const tek = ["Harita", "Taktik", "Form", "Strateji", "Personel"];
  const fazla = [], az = [];
  let html = "<h2>Sonuçlar</h2>";
  html += '<div class="bilgi-kutusu">Her senaryo ' + n + " maç. Ölçüm hatası yaklaşık ±" + hata.toFixed(1) + "% (≈ ±" + (hata / 1.2).toFixed(1) + " puan). Kural: tek faktör 15 puanı aşmamalı, 2 puanın altı hissedilmez. GEN satırları kalibrasyondur (1 GEN puanı yaklaşık %1,2 kazanma şansı).</div>";
  html += '<div class="tablo-kutusu"><table><tr><th>Senaryo</th><th>Beklenen</th><th>Kazanma</th><th>Eşdeğer</th><th>Durum</th></tr>';
  let sonGrup = "";
  sonuc.forEach(function (r) {
    if (r.s.grup !== sonGrup) {
      sonGrup = r.s.grup;
      html += '<tr><td colspan="5" style="text-align:left;color:#f59e0b;font-weight:bold">' + sonGrup + "</td></tr>";
    }
    const es = r.s.grup === "GEN" ? r.s.k : labEsdeger(r.w, kal);
    let durum = "", renk = "#f9fafb";
    if (r.s.grup === "GEN") durum = "Kalibrasyon";
    else if (r.s.grup === "Referans") durum = "Sağlama (≈50)";
    else if (r.s.grup === "Birleşik") durum = "Uç durum";
    else if (tek.indexOf(r.s.grup) >= 0) {
      if (Math.abs(es) >= 15) { durum = "FAZLA"; renk = "#ef4444"; fazla.push({ ad: r.s.ad, es: es }); }
      else if (Math.abs(es) < 2) { durum = "Hissedilmez"; renk = "#f59e0b"; az.push({ ad: r.s.ad, es: es }); }
      else { durum = "Uygun"; renk = "#22c55e"; }
    }
    html += '<tr><td style="white-space:normal;min-width:170px">' + r.s.ad + "</td><td>" + r.teorik + "</td><td>" + r.w.toFixed(1) + '%</td><td>' + (es > 0 ? "+" : "") + es.toFixed(1) + '</td><td style="color:' + renk + ';font-weight:bold">' + durum + "</td></tr>";
  });
  html += "</table></div>";
  html += "<h2>Yorum</h2>";
  if (fazla.length === 0 && az.length === 0) html += '<div class="ipucu">Tek faktörlerin hiçbiri sınırların dışında değil.</div>';
  fazla.forEach(function (f) {
    html += '<div class="uyari"><b>Fazla:</b> ' + f.ad + " (eşdeğer " + f.es.toFixed(1) + " puan). Hedef 10 puan ise etkiyi yaklaşık ×" + (10 / Math.abs(f.es)).toFixed(2) + " ile çarpmayı düşün.</div>";
  });
  az.forEach(function (f) {
    html += '<div class="mac-satir"><b>Hissedilmez:</b> ' + f.ad + " (eşdeğer " + f.es.toFixed(1) + " puan, ölçüm hatası ±" + (hata / 1.2).toFixed(1) + "). Etkisini artırmayı düşün.</div>";
  });
  document.getElementById("labKontrol").innerHTML = labKontrolHtml();
  document.getElementById("labSonuc").innerHTML = html;
}

// ---------- Etki aralıkları (kodda tanımlı sabitlerden, anlık veriyle) ----------
function labEtkiTablosu() {
  const b = haritaOf({ oyuncular: kariyer.oyuncular });
  const fark = [];
  dunya.forEach(function (t) {
    const r = haritaOf(t);
    HARITALAR.forEach(function (m) { fark.push(Math.abs(b[m] - r[m])); });
  });
  const ort = fark.length ? fark.reduce(function (s, x) { return s + x; }, 0) / fark.length : 0;
  const mx = fark.length ? Math.max.apply(null, fark) : 0;
  const g = dunya.map(function (t) { return ortGuc(t.oyuncular); });
  const gm = ortGuc(kariyer.oyuncular);
  const satir = function (a, b2, c2) { return "<tr><td>" + a + "</td><td>" + b2 + '</td><td style="white-space:normal;min-width:160px">' + c2 + "</td></tr>"; };
  let h = '<h2>Etki Aralıkları</h2><div class="tablo-kutusu"><table><tr><th>Faktör</th><th>Aralık</th><th>Not</th></tr>';
  h += satir("GEN farkı", Math.round(gm - Math.max.apply(null, g)) + " .. +" + Math.round(gm - Math.min.apply(null, g)), "Rakip ortalaması " + Math.round(Math.min.apply(null, g)) + "-" + Math.round(Math.max.apply(null, g)) + ", senin " + Math.round(gm) + ". Round şansı 0,30-0,70 arasına sıkışır (fark ±68 üstü etkisiz).");
  h += satir("Harita farkı", "-20 .. +20", "Şu anki gerçek veride ortalama |fark| " + ort.toFixed(1) + ", en büyük " + mx + ".");
  h += satir("Taktik kadro uyumu", (0 - 2) * TAKTIK_ROL_BONUSU + " .. +" + (5 - 2) * TAKTIK_ROL_BONUSU, "İki takımın uyumunun farkı alınır.");
  h += satir("Taktik üstünlüğü", "±" + TAKTIK_USTUN_BONUSU, "Agresif > Dengeli > Temkinli > Agresif.");
  h += satir("Strateji uyumu", Math.min.apply(null, STRATEJI_UYUM_ETKISI) + " .. +" + Math.max.apply(null, STRATEJI_UYUM_ETKISI), "Koç, negatif etkiyi azaltır.");
  h += satir("Rol / yeşil özellik", Math.min.apply(null, TARZ_ETKISI) + " .. +" + Math.max.apply(null, TARZ_ETKISI), "Takım ortalaması.");
  h += satir("Form (moral/yorgunluk)", "-17 .. +3", "Moral 0 = -7, yorgunluk 100 = -10, moral 100 = +3.");
  h += satir("Analist hazırlığı", "+3", "Yalnızca seviye 3.");
  h += satir("Mola", "+" + MOLA_BONUSU + " (" + MOLA_TUR + " round)", "Maç başına 1 hak.");
  h += satir("Seri cezası", "∓" + SERI_CEZASI, "3 round üst üste kaybeden takım.");
  return h + "</table></div>";
}

function labKontrolHtml() {
  return '<button class="buton" onclick="labCalistir(600)">Hızlı Test (600 maç / senaryo)</button><button class="buton ikincil" onclick="labCalistir(2400)">Hassas Test (2400 maç / senaryo)</button>';
}

function dengeEkrani() {
  let html = '<button class="geri" onclick="kulupMenu()">← Geri</button><h2>Denge Laboratuvarı</h2>';
  html += '<div class="bilgi-kutusu">Senin kadronun bir kopyasıyla senin kadron arasında binlerce canlı maç simüle edilir. Her senaryoda yalnızca bir faktör değişir. Kayıtların etkilenmez. Test sürerken ekranı açık tut ve başka uygulamaya geçme.</div>';
  html += '<div id="labKontrol">' + labKontrolHtml() + '</div><div id="labSonuc"></div>';
  html += labEtkiTablosu();
  uygulama.innerHTML = html;
}
