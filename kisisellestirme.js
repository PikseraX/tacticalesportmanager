const KARIYER_SENARYOLARI = {
  standart: { ad: "Standart", butce: BASLANGIC_BUTCE, scout: 0, bilgi: "Dengeli başlangıç." },
  borc: { ad: "Borçtan Dönüş", butce: -60000, scout: 0, bilgi: "Eksi bütçeyle başla ve kulübü toparla." },
  akademi: { ad: "Akademi Projesi", butce: 350000, scout: 1, bilgi: "Birinci seviye scout ile başla. İlk adaylar keşif görevi tamamlanınca gelir." }
};
const KULUP_ARMALARI = [
  ["Elmas", "M12 2 22 12 12 22 2 12Z M12 2v20 M2 12h20"],
  ["Yıldız", "m12 2 3 7 7 .7-5.5 4.8 1.7 7-6.2-3.8-6.2 3.8 1.7-7L2 9.7 9 9Z"],
  ["Altıgen", "m12 2 9 5v10l-9 5-9-5V7Z M8 12l3 3 5-6"],
  ["Şimşek", "m13 2-9 12h7l-1 8 10-12h-7Z"],
  ["Kale", "M4 3h4v4h8V3h4v17H4Z M9 20v-7h6v7"],
  ["Kanat", "M12 20 3 14 2 4l10 6 10-6-1 10Z M12 10v10"],
  ["Alev", "M12 2c1 6 6 7 6 13a6 6 0 0 1-12 0c0-3 2-6 4-8 0 3 1 4 2 4 2-3 1-6 0-9Z"],
  ["Hedef", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M12 1v4 M12 19v4 M1 12h4 M19 12h4"]
];
const ARMA_EKIPMANLARI = [
  ["Karambit", "M10 10C5 11 2 15 2 22c3-4 6-6 10-7l5-6a4 4 0 1 0-3-4Z M20.6 4.8a1.65 1.65 0 1 0-3.3 0 1.65 1.65 0 0 0 3.3 0Z", "M3 19q3-6 8-7l2 2q-6 1-10 5Z"],
  ["Kelebek", "m10 12-5-8 2-3 6 9 6-5 3 1-7 7 6 6-2 3-7-7-7 7-3-2Z", "m6 4 1-1 5 8-1 1Z M13 13l7-6-5 7Z M8 17l1 1-4 4-1-1Z M16 17l4 4 1-1-4-4Z"],
  ["Bayonet", "M2 20l6-7-2-2 1-2 3 2 8-8 5-2-2 6-8 8 2 2-2 1-2-2-6 7Z", "m11 12 9-8-5 7-3 3Z M4 20l5-6 1 1-5 6Z"],
  ["M9 Bayonet", "m2 20 6-7-2-2 2-2 2 2 2-3 2 1 1-3 2 1 1-3 5-3-1 6-9 9 2 2-2 1-2-2-6 6Z", "m12 13 8-8-4 7-3 3Z M4 20l5-6 1 1-5 6Z"],
  ["Talon", "M12 9C5 9 1 15 2 22c2-5 6-6 9-6l6-6a4.3 4.3 0 1 0-3-5Z M20.4 5a1.8 1.8 0 1 0-3.6 0 1.8 1.8 0 0 0 3.6 0Z", "M3 19q3-7 8-8l2 2-4 1q-4 2-6 5Z M12 10h1v1h-1Z M14 8h1v1h-1Z"],
  ["Kukri", "m2 20 7-7 1-4 4-5 8-3-1 5-5 5-4 3-7 9Z", "M11 12q3-6 10-9l-3 4-6 6Z M4 20l5-5 1 1-5 5Z"],
  ["Flip Knife", "M2 20q2-5 8-8l3-7 9-4-2 7-7 6q-4 6-9 9Z", "m12 11 3-5 6-4-3 5-5 5Z M4 20q3-4 6-5l1 1-6 5Z"],
  ["Huntsman", "m2 20 7-7 3-6 4-1 6-5v5l-3 6-6 4-7 7Z", "m11 13 4-5 5-4-3 6-5 4Z M4 20l5-5 1 1-5 5Z"],
  ["C4", "M3 9h18l2 3v8l-2 2H3l-2-2v-8Z M5 9V5q0-4 4-4 3 0 4 3l2 5h-2l-2-5q-1-2-3-1-1 0-1 2v4Z", "M4 12h8v4H4Z M4 18h8v1H4Z M15 12h2v2h-2Z M18 12h2v2h-2Z M15 15h2v2h-2Z M18 15h2v2h-2Z M15 18h5v1h-5Z"]
];
const ARMA_TEMEL_SAYISI = KULUP_ARMALARI.length;
// Eski kayıtlardaki ekipman indekslerini koru. Kaldırılan bayraklar varsayılan armaya döner.
const ARMA_EKIPMAN_BASLANGICI = 20;
KULUP_ARMALARI.length = ARMA_EKIPMAN_BASLANGICI;
KULUP_ARMALARI.push(...ARMA_EKIPMANLARI);
const KULUP_ARMA_SEKILLERI = [
  ["Sivri Kalkan", "M5 5Q50 15 95 5L91 50Q88 76 50 97Q12 76 9 50Z"],
  ["Daire"],
  // Kaldırılan şekillerin kayıt indekslerini ayır.
  , , ,
  ["Yuvarlak Kalkan", "M5 5H95V47C95 74 78 91 50 97C22 91 5 74 5 47Z"],
  ["Fransız Kalkanı", "M5 5H95V57C95 79 76 86 61 88Q53 90 50 97Q47 90 39 88C24 86 5 79 5 57Z"],
  ["Turnuva Kalkanı", "M21 4H79L96 21L88 64L50 97L12 64L4 21Z"],
  ["Klasik Kulüp Arması", "M4 15Q27 15 50 3Q73 15 96 15L93 48Q90 79 50 97Q10 79 7 48Z"]
];
const KULUP_FORMALARI = ["Düz", "Çizgili", "Çapraz", "İkiye Bölünmüş", "Göğüs Şeritli", "Omuz Bloklu", "Çift Şerit", "Gradyan",
  "Şevron", "İnce Çizgili", "Damalı", "Yan Panelli"];
const KULUP_PALETLERI = [
  ["Gece Altını", "#f5b642", "#172033"], ["Buz Mavisi", "#65d9f3", "#164e73"],
  ["Lav", "#ff725e", "#541632"], ["Orman", "#81e6a6", "#174942"],
  ["Neon Mor", "#c39bff", "#382072"], ["Kutup", "#e9efff", "#455979"]
];
const KADRO_SABLON_ANAHTARI = "tem.kadro-sablonu.v1";

function senaryoSecenekleri() {
  return Object.entries(KARIYER_SENARYOLARI).map(([id, s]) =>
    '<option value="' + id + '">' + s.ad + ' · ' + para(s.butce) + '</option>'
  ).join("");
}

function kimlikTasarimi(veri = {}) {
  const renkDogrula = (renk, varsayilan) => /^#[0-9a-f]{6}$/i.test(renk) ? renk : varsayilan;
  const indeks = (i, uzunluk) => Number.isInteger(i) && i >= 0 && i < uzunluk ? i : 0;
  return {
    arma: Number.isInteger(veri.arma) && KULUP_ARMALARI[veri.arma] ? veri.arma : 0,
    forma: indeks(veri.forma, KULUP_FORMALARI.length),
    sekil: Number.isInteger(veri.sekil) && KULUP_ARMA_SEKILLERI[veri.sekil] ? veri.sekil : 0,
    armaDuzen: indeks(veri.armaDuzen, 3),
    armaCerceve: indeks(veri.armaCerceve, 3),
    armaRengiAyri: veri.armaRengiAyri === true,
    armaRenk: renkDogrula(veri.armaRenk, RENKLER[0].kod),
    armaKenar: renkDogrula(veri.armaKenar, "#334155"),
    yaka: indeks(veri.yaka, 4),
    formaKol: indeks(veri.formaKol, 3),
    formaSponsor: typeof veri.formaSponsor === "string"
      ? Array.from(veri.formaSponsor.trim().replace(/\s+/g, " ")).slice(0, 12).join("") : "",
    monogram: typeof veri.monogram === "string" ? veri.monogram.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 3) : "",
    renk: renkDogrula(veri.renk, RENKLER[0].kod),
    ikinciRenk: renkDogrula(veri.ikinciRenk, "#334155")
  };
}

function kimlikArmaHtml(k, monogram = k.monogram) {
  const [, cizim, detay] = KULUP_ARMALARI[k.arma];
  const simge = '<svg viewBox="0 0 24 24" aria-hidden="true"' + (detay ? ' class="arma-ekipman"' : '') +
    '><path d="' + cizim + '"/>' + (detay ? '<path class="arma-ekipman-detay" d="' + detay + '"/>' : '') + '</svg>';
  let icerik = simge;
  if (monogram && k.armaDuzen !== 2) {
    icerik = (k.armaDuzen === 1 ? simge : "") + '<span class="arma-harf">' + monogram + '</span>';
  }
  const disHat = KULUP_ARMA_SEKILLERI[k.sekil][1];
  const kalkan = disHat ? '<svg class="arma-kalkan-zemin" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="' + disHat + '"/>' + (k.armaCerceve === 1 ? '<path class="arma-kalkan-ic" d="' + disHat + '"/>' : '') +
    '</svg>' : "";
  const renk = k.armaRengiAyri ? ' style="--kulup-renk:' + k.armaRenk + ';--kulup-ikinci-renk:' + k.armaKenar + '"' : "";
  return '<span class="kulup-arma arma-sekil-' + k.sekil + ' arma-cerceve-' + k.armaCerceve +
    (disHat ? ' arma-kalkan' : '') + (monogram && k.armaDuzen === 1 ? ' arma-ikili' : '') + '" role="img" aria-label="Kulüp arması · ' + KULUP_ARMALARI[k.arma][0] + '"' + renk + '>' + kalkan + icerik + '</span>';
}

function kimlikFormaHtml({ forma, yaka = 0, formaSponsor = "", formaKol = 0 }) {
  return '<span class="kulup-forma forma-' + forma + ' forma-yaka-' + yaka + ' forma-kol-' + formaKol +
    '" role="img" aria-label="' + (formaSponsor ? 'Forma · ' + oyunYazisi(formaSponsor) : 'Forma') + '">' +
    (formaSponsor ? '<b class="forma-sponsor">' + oyunYazisi(formaSponsor) + '</b>' : '') + '</span>';
}

function kimlikOnizleme(veri) {
  const k = kimlikTasarimi(veri);
  return '<span class="kulup-kimlik" style="--kulup-renk:' + k.renk + ';--kulup-ikinci-renk:' + k.ikinciRenk +
    '">' + kimlikArmaHtml(k) + kimlikFormaHtml(k) + '</span>';
}

function kimlikKartlari(alan, liste, secili, gorsel, baslangic = 0) {
  return '<div class="kimlik-kartlar" role="group" aria-label="' +
    (alan === "arma" ? "Arma seçenekleri" : "Forma seçenekleri") + '">' +
    liste.map((ad, sira) => {
      const i = baslangic + sira;
      return '<button type="button" class="kimlik-kart" data-kimlik-alan="' + alan + '" data-kimlik-indeks="' + i +
      '" aria-pressed="' + (i === secili) + '" onclick="kimlikKartSec(this)">' + gorsel(i) + '<span>' + ad + '</span></button>';
    }).join("") + '</div>';
}

function kimlikKartSec(dugme) {
  document.getElementById("kimlik-" + dugme.dataset.kimlikAlan).value = dugme.dataset.kimlikIndeks;
  if (dugme.dataset.kimlikAlan === "arma" && Number(dugme.dataset.kimlikIndeks) < ARMA_TEMEL_SAYISI) {
    document.getElementById("kimlik-ucretsiz-arma").value = dugme.dataset.kimlikIndeks;
  }
  kimlikOnizlemeyiGuncelle();
}

function kimlikPaletSec(indeks) {
  const palet = KULUP_PALETLERI[indeks];
  if (!palet) return;
  document.getElementById("kimlik-ucretsiz-renk").value = palet[1];
  document.getElementById("kimlik-ucretsiz-ikinci").value = palet[2];
  document.getElementById("kimlik-renk").value = palet[1];
  document.getElementById("kimlik-ikinci").value = palet[2];
  kimlikOnizlemeyiGuncelle();
}

function ucretsizKimlik(veri) {
  return kimlikTasarimi({
    arma: veri.arma < ARMA_TEMEL_SAYISI ? veri.arma : 0,
    forma: veri.forma, renk: veri.renk, ikinciRenk: veri.ikinciRenk
  });
}

function kulupKimlikRozeti() {
  const kimlik = { ...kariyer.kimlikTasarimi, renk: kariyer.renk };
  return kimlikOnizleme(ozelTasarimSahibi ? kimlik : ucretsizKimlik(kimlik.ucretsiz || kimlik));
}

function kimlikAlanlari(veri) {
  const k = kimlikTasarimi(veri);
  const temel = ucretsizKimlik(veri.ucretsiz || k);
  const armaKartlari = (baslangic, son) =>
    kimlikKartlari("arma", KULUP_ARMALARI.slice(baslangic, son).map(a => a[0]), baslangic === 0 && !ozelTasarimSahibi ? temel.arma : k.arma,
      i => kimlikArmaHtml({ ...(baslangic === 0 && !ozelTasarimSahibi ? temel : k), arma: i }, ""), baslangic);
  const secim = (id, etiket, liste, secili) => '<label for="' + id + '">' + etiket +
    '</label><select class="alan" id="' + id + '">' + liste.map((ad, i) =>
      '<option value="' + i + '"' + (i === secili ? ' selected' : '') + '>' + ad + '</option>'
    ).join("") + '</select>';
  return '<section id="kimlik-studyosu" class="gelisim-kart" style="--kulup-renk:' + k.renk + ';--kulup-ikinci-renk:' + k.ikinciRenk +
    '" oninput="kimlikOnizlemeyiGuncelle()" onchange="kimlikOnizlemeyiGuncelle()"><h3>Kulüp Tasarım Stüdyosu</h3>' +
    '<div class="kimlik-sahne"><span>KARİYERDE KULLANILACAK</span><div id="kimlik-onizleme">' + kimlikOnizleme(ozelTasarimSahibi ? k : temel) + '</div></div>' +
    '<h4>Arma</h4><input type="hidden" id="kimlik-arma" value="' + k.arma + '">' +
    '<input type="hidden" id="kimlik-ucretsiz-arma" value="' + temel.arma + '">' +
    '<input type="hidden" id="kimlik-ucretsiz-renk" value="' + temel.renk + '">' +
    '<input type="hidden" id="kimlik-ucretsiz-ikinci" value="' + temel.ikinciRenk + '">' +
    armaKartlari(0, ARMA_TEMEL_SAYISI) +
    '<h4>Hazır formalar</h4>' +
    kimlikKartlari("forma", KULUP_FORMALARI, k.forma, i => kimlikFormaHtml({ forma: i })) +
    '<h4>Renk paleti</h4><div class="kimlik-paletler">' + KULUP_PALETLERI.map(([ad, ana, ikinci], i) =>
      '<button type="button" class="kimlik-palet" data-palet="' + i + '" aria-pressed="' + (k.renk === ana && k.ikinciRenk === ikinci) + '" onclick="kimlikPaletSec(' + i +
      ')"><span aria-hidden="true" style="background:linear-gradient(135deg,' + ana + ' 50%,' + ikinci + ' 50%)"></span>' + ad + '</button>'
    ).join("") + '</div>' +
    '<details class="kadro-detay kimlik-ozel"><summary id="kimlik-ozel-baslik">Kendi Tasarımını Oluştur · ' + (ozelTasarimSahibi ? "Açık" : "Kilitli") + '</summary>' +
    '<div class="gelisim-kart"><p id="kimlik-magaza-durum" role="status">' + (ozelTasarimSahibi
      ? "Özel tasarım açık. Tasarımını kariyerinde kullanabilirsin."
      : "Tüm seçenekleri dene. Özel tasarımı kariyerinde kullanmak için bir kez satın al.") +
    '</p><button type="button" class="buton" id="kimlik-satin-al" onclick="kimlikMagazaIslemi(true)"' +
      (ozelTasarimSahibi ? ' hidden' : '') + '>' +
      (kimlikUrun?.priceString ? "Kilidi Aç · " + oyunYazisi(kimlikUrun.priceString) : "Google Play Fiyatını Gör") +
    '</button><button type="button" class="buton ikincil" id="kimlik-geri-yukle" onclick="kimlikMagazaIslemi(false)">Satın Alımı Geri Yükle</button></div>' +
    '<div class="kimlik-sahne kimlik-ozel-onizleme"><span>ÖZEL TASARIM ÖNİZLEMESİ</span><div id="kimlik-ozel-onizleme">' + kimlikOnizleme(k) + '</div></div>' +
    '<fieldset><legend>Arma düzeni</legend><h4>Bıçaklar ve C4</h4>' +
    armaKartlari(ARMA_EKIPMAN_BASLANGICI, KULUP_ARMALARI.length) +
    secim("kimlik-sekil", "Arma şekli", KULUP_ARMA_SEKILLERI.map(sekil => sekil[0]), k.sekil) +
    secim("kimlik-arma-duzen", "Simge ve yazı", ["Yazı varsa yalnızca yazı", "Simge ve yazı birlikte", "Yalnızca simge"], k.armaDuzen) +
    secim("kimlik-arma-cerceve", "Çerçeve", ["İnce", "Çift çizgi", "Çerçevesiz"], k.armaCerceve) +
    '<label for="kimlik-monogram">Arma harfleri</label><input class="alan" id="kimlik-monogram" maxlength="3" placeholder="Örn. TEM" value="' + k.monogram + '">' +
    '<label class="kimlik-onay"><input type="checkbox" id="kimlik-arma-ayri"' + (k.armaRengiAyri ? ' checked' : '') + '> Arma için ayrı renkler kullan</label>' +
    '<div class="kimlik-renkler" id="kimlik-arma-renkler"' + (k.armaRengiAyri ? '' : ' hidden') + '>' +
    '<label>Arma zemini <input type="color" id="kimlik-arma-renk" value="' + k.armaRenk + '"></label>' +
    '<label>Arma kenarı <input type="color" id="kimlik-arma-kenar" value="' + k.armaKenar + '"></label></div></fieldset>' +
    '<fieldset><legend>Forma detayları</legend>' +
    secim("kimlik-forma", "Temel forma", KULUP_FORMALARI, k.forma) +
    secim("kimlik-yaka", "Yaka", ["Yuvarlak", "V yaka", "Kontrast yaka", "Polo yaka"], k.yaka) +
    secim("kimlik-kol", "Kol detayı", ["Deseni sürdür", "Kontrast kollar", "Çift manşet çizgisi"], k.formaKol) +
    '<label for="kimlik-sponsor">Sponsor yazısı (isteğe bağlı)</label><input class="alan" id="kimlik-sponsor" maxlength="12" placeholder="Örn. NOVA" value="' + oyunYazisi(k.formaSponsor) + '">' +
    '<div class="kimlik-renkler"><label>Ana renk <input type="color" id="kimlik-renk" value="' + k.renk + '"></label>' +
    '<label>İkinci renk <input type="color" id="kimlik-ikinci" value="' + k.ikinciRenk + '"></label></div></fieldset>' +
    '</details></section>';

}

function kimlikFormunuOku(onizleme = false) {
  const oku = id => document.getElementById("kimlik-" + id)?.value;
  const tasarim = kimlikTasarimi({
    arma: Number(oku("arma")), forma: Number(oku("forma")), sekil: Number(oku("sekil")),
    monogram: oku("monogram"), renk: oku("renk"), ikinciRenk: oku("ikinci"),
    armaDuzen: Number(oku("arma-duzen")), armaCerceve: Number(oku("arma-cerceve")),
    armaRengiAyri: document.getElementById("kimlik-arma-ayri")?.checked === true,
    armaRenk: oku("arma-renk"), armaKenar: oku("arma-kenar"),
    yaka: Number(oku("yaka")),
    formaKol: Number(oku("kol")), formaSponsor: oku("sponsor")
  });
  if (onizleme) return tasarim;
  const temel = ucretsizKimlik({
    arma: Number(oku("ucretsiz-arma")), forma: tasarim.forma,
    renk: oku("ucretsiz-renk"), ikinciRenk: oku("ucretsiz-ikinci")
  });
  return ozelTasarimSahibi ? { ...tasarim, ucretsiz: temel } : temel;
}

function kimlikOnizlemeyiGuncelle() {
  const kimlik = kimlikFormunuOku(true);
  const uygulanacak = kimlikFormunuOku();
  const studyo = document.getElementById("kimlik-studyosu");
  studyo.style.setProperty("--kulup-renk", kimlik.renk);
  studyo.style.setProperty("--kulup-ikinci-renk", kimlik.ikinciRenk);
  const onizleme = kimlikOnizleme(kimlik);
  document.getElementById("kimlik-onizleme").innerHTML = kimlikOnizleme(uygulanacak);
  document.getElementById("kimlik-ozel-onizleme").innerHTML = onizleme;
  document.getElementById("kimlik-arma-renkler").hidden = !kimlik.armaRengiAyri;
  studyo.querySelectorAll("[data-kimlik-alan]").forEach(kart => {
    kart.setAttribute("aria-pressed", String((Number(kart.dataset.kimlikIndeks) < ARMA_TEMEL_SAYISI && !ozelTasarimSahibi ? uygulanacak : kimlik)[kart.dataset.kimlikAlan] === Number(kart.dataset.kimlikIndeks)));
  });
  studyo.querySelectorAll("[data-palet]").forEach(kart => {
    const [, ana, ikinci] = KULUP_PALETLERI[Number(kart.dataset.palet)];
    kart.setAttribute("aria-pressed", String(uygulanacak.renk.toLowerCase() === ana && uygulanacak.ikinciRenk.toLowerCase() === ikinci));
  });
}

function kulupKimlikEkrani() {
  uygulama.innerHTML = '<button class="geri" onclick="kulupMenu()">← Kulüp</button><h2>Kulüp Kimliği</h2>' +
    kimlikAlanlari({ ...kariyer.kimlikTasarimi, renk: kariyer.renk }) +
    '<button class="buton" onclick="kulupKimliginiKaydet()">Kaydet</button><p id="kimlik-durum" role="status"></p>';
}

function kulupKimliginiKaydet() {
  const kimlik = kimlikFormunuOku();
  kariyer.kimlikTasarimi = kimlik;
  kariyer.renk = kimlik.renk;
  kaydet();
  document.getElementById("kimlik-durum").textContent = ozelTasarimSahibi ? "Kulüp kimliği kaydedildi." : "Hazır arma ve forma kaydedildi. Özel tasarım önizlemede kaldı.";
}

function kadroSablonunuOku() {
  try {
    const kayit = JSON.parse(localStorage.getItem(KADRO_SABLON_ANAHTARI));
    return kayit && typeof kayit === "object" && !Array.isArray(kayit) ? kayit : {};
  } catch (_) { return {}; }
}

function editorTakimAdi(slot) {
  if (slot === 0) return "Kendi kulübün";
  return DUNYA_ILK[slot - 1]?.ad || "Rakip " + slot;
}

function kadroEditoru(slot = 0) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= TOPLAM_TAKIM) return;
  const sablon = kadroSablonunuOku();
  const takim = sablon[slot] || {};
  const secenekler = Array.from({ length: TOPLAM_TAKIM }, (_, i) =>
    '<option value="' + i + '"' + (i === slot ? ' selected' : '') + '>' +
    oyunYazisi(sablon[i]?.ad || editorTakimAdi(i)) + (sablon[i] ? ' ✓' : '') + '</option>'
  ).join("");
  uygulama.innerHTML = '<button class="geri" onclick="anaMenu()">← Ana Menü</button><h2>Kadro Editörü</h2>' +
    '<p>Takım seç, istediğin adları yaz ve kaydet. Şablon sonraki yeni kariyerlerine uygulanır. Boş alanlar oyunun kendi adlarını kullanır.</p>' +
    '<label for="editor-slot">Takım</label><select class="alan" id="editor-slot" onchange="kadroEditoru(Number(this.value))">' + secenekler + '</select>' +
    '<label for="editor-takim">Takım adı</label><input class="alan" id="editor-takim" maxlength="40" placeholder="' + oyunYazisi(editorTakimAdi(slot)) +
    '" value="' + oyunYazisi(takim.ad || "") + '">' +
    ROLLER.map((rol, i) => '<label for="editor-oyuncu-' + i + '">Oyuncu ' + (i + 1) + ' · ' + rol + '</label><input class="alan" id="editor-oyuncu-' + i +
      '" maxlength="40" placeholder="' + oyunYazisi(slot === 0 ? BASLANGIC_ADLARI[i] : DUNYA_ILK[slot - 1]?.oyuncular[i]?.ad || "Otomatik ad") +
      '" value="' + oyunYazisi(takim.oyuncular?.[i] || "") + '">').join("") +
    '<button class="buton" onclick="editorTakimiKaydet()">Takımı Kaydet</button><p id="editor-durum" role="status"></p>';
}

function editorAdiDogrula(deger) {
  const ad = typeof deger === "string" ? deger.trim() : "";
  if (ad.length > 40 || /[<>&"'\u0000-\u001f\u007f]/.test(ad)) throw new Error("Adlar en fazla 40 karakter olmalı ve HTML işareti içermemeli.");
  return ad;
}

function editorTakimiKaydet() {
  const slot = Number(document.getElementById("editor-slot").value);
  if (!Number.isInteger(slot) || slot < 0 || slot >= TOPLAM_TAKIM) return;
  try {
    const sablon = kadroSablonunuOku();
    const ad = editorAdiDogrula(document.getElementById("editor-takim").value);
    const oyuncular = ROLLER.map((_, i) => editorAdiDogrula(document.getElementById("editor-oyuncu-" + i).value));
    if (ad || oyuncular.some(Boolean)) sablon[slot] = { ad, oyuncular };
    else delete sablon[slot];
    const adlar = Object.values(sablon).flatMap(t => [t.ad, ...(t.oyuncular || [])]).filter(Boolean);
    if (new Set(adlar).size !== adlar.length) throw new Error("Şablondaki takım ve oyuncu adları benzersiz olmalı.");
    localStorage.setItem(KADRO_SABLON_ANAHTARI, JSON.stringify(sablon));
    kadroEditoru(slot);
    document.getElementById("editor-durum").textContent = "Yeni kariyerler için kaydedildi.";
  } catch (hata) { document.getElementById("editor-durum").textContent = hata.message; }
}

function kadroSablonunuUygula() {
  const sablon = kadroSablonunuOku();
  if (!Object.keys(sablon).length) return;
  kariyer.rakipler = JSON.parse(JSON.stringify(DUNYA_ILK));
  dunyaGenislet();
  const kullanilan = new Set([kariyer.takimAdi]);
  const otomatikler = [];
  function uygula(nesne, ad) {
    try { ad = editorAdiDogrula(ad); } catch (_) { ad = ""; }
    if (ad && !kullanilan.has(ad)) { nesne.ad = ad; kullanilan.add(ad); }
    else otomatikler.push(nesne);
  }
  kariyer.oyuncular.forEach((o, i) => uygula(o, sablon[0]?.oyuncular?.[i]));
  kariyer.rakipler.forEach((t, i) => {
    const kayit = sablon[i + 1];
    uygula(t, kayit?.ad);
    t.oyuncular.forEach((o, j) => uygula(o, kayit?.oyuncular?.[j]));
  });
  otomatikler.forEach(nesne => {
    if (kullanilan.has(nesne.ad)) nesne.ad = benzersizAd(kullanilan);
    else kullanilan.add(nesne.ad);
  });
}
