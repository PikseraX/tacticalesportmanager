const ODAK_ADLARI = {
  nisan: "Nişan", sprey: "Sprey Kontrolü", refleks: "Refleks",
  bilgi: "Oyun Bilgisi", karar: "Karar Verme", pozisyon: "Pozisyon Alma",
  iletisim: "İletişim", liderlik: "Liderlik", takimoyunu: "Takım Oyunu", utility: "Utility Kullanımı",
  istikrar: "İstikrar", baski: "Baskı Altında Performans"
};

function genelHesapla(o) { o.genel = rolGenelPuani(o,o.rol); }

function gelisimSansi(o, odak) {
  if (o.pot !== undefined && o.genel >= o.pot) return 0;
  if (o.yas < 24) return odak ? 0.55 : 0.11;
  if (o.yas < 30) return odak ? 0.3 : 0.05;
  return 0;
}

function gerilemeSansi(o) {
  if (o.yas >= 33) return 0.25;
  if (o.yas >= 30) return 0.12;
  return 0;
}

function oyuncuOdagi(o) {
  return o.odak || kariyer.odak || "nisan";
}

function antrenmanUygula() {
  const rapor = [];
  tumKadro().forEach(kisilikAta);
  const kat = 1 + 0.1 * personelSeviye("koc");
  rapor.push("Antrenman planı: " + antrenmanYogunlugu().ad);
  if(tumKadro().some(o=>mentorCarpani(o)>1)) rapor.push("Mentor desteği: 24 yaş altı oyuncuların gelişim ihtimali +%5.");
  tumKadro().forEach(function (o) {
    const once = o.genel;
    const odak = oyuncuOdagi(o);
    OZELLIKLER.forEach(function (z) {
      if (Math.random() < gelisimSansi(o, z === odak) * kat * antrenmanGelisimCarpani(o) * mentorCarpani(o)) o[z] = Math.min(99, o[z] + 1);
      if (Math.random() < gerilemeSansi(o)) o[z] = Math.max(1, o[z] - 1);
    });
    genelHesapla(o);
    if (o.genel !== once) rapor.push(o.ad + ": " + once + " → " + o.genel);
  });
  return rapor;
}

function yasKontrol() {
  const sz = kariyer.sezon;
  if (sz && sz.bitti && !sz.yaslandi) {
    sz.yaslandi = true;
    tumKadro().forEach(function (o) { o.yas++; });
    (kariyer.akademi || []).forEach(function (o) { o.yas++; });
    if (kariyer.serbest) kariyer.serbest.forEach(function (o) { o.yas++; });
    dunya.forEach(function (t) { t.oyuncular.forEach(function (o) { o.yas++; }); });
    return true;
  }
  return false;
}

function odakEkrani() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Antrenman Odağı</h2>';
  html += "<p>Bir oyuncuya bas, odağını seç. Yedekler de antrenman yapar.</p>";
  html += '<button class="gelisim-ozet-link" onclick="antrenmanYogunlukEkrani()">Antrenman Yoğunluğu <span>' + antrenmanYogunlugu().ad + ' ›</span></button>';
  tumKadro().forEach(function (o, i) {
    const yedek = i >= kariyer.oyuncular.length ? " · Yedek" : "";
    html += '<button class="takim-butonu" onclick="oyuncuOdakSec(' + i + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (" + o.rol + ", " + o.yas + yedek + ")</span><span>" + ODAK_ADLARI[oyuncuOdagi(o)] + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function oyuncuOdakSec(i) {
  const o = tumKadro()[i];
  const secili = oyuncuOdagi(o);
  let html = '<button class="geri" onclick="odakEkrani()">← Geri</button><h2>' + oyunAdi(o.ad) + "</h2>";
  html += "<p>Seçtiğin özellik her hafta daha hızlı gelişir.</p>";
  OZELLIKLER.forEach(function (z) {
    const renk = z === secili ? ' style="border-color:var(--accent)"' : "";
    html += '<button class="takim-butonu"' + renk + ' onclick="odakKaydet(' + i + ", '" + z + '\')"><span>' + ODAK_ADLARI[z] + "</span><span>" + o[z] + (z === secili ? " · SEÇİLİ" : "") + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function odakKaydet(i, z) {
  tumKadro()[i].odak = z;
  kaydet();
  odakEkrani();
}

function haftaRaporu(g, rapor, yasArtti, sp, faiz) { haftalikOzetEkrani(); }
