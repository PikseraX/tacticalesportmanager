/* Display translations. Internal role IDs, form values and career data stay in Turkish. */
const OYUN_DILLERI = [
  ["tr", "Türkçe"], ["en", "English"], ["de", "Deutsch"], ["fr", "Français"],
  ["it", "Italiano"], ["es", "Español"], ["pt", "Português"], ["ru", "Русский"],
  ["ja", "日本語"], ["el", "Ελληνικά"], ["zh-CN", "简体中文"], ["zh-TW", "繁體中文"]
];
const DIL_ANAHTARI = "tem.dil.v1";
let oyunDili = "tr";
try {
  const kayit = localStorage.getItem(DIL_ANAHTARI);
  if (OYUN_DILLERI.some(([kod]) => kod === kayit)) oyunDili = kayit;
} catch (_) {}
const dilOrijinalleri = new WeakMap();
let dilGozlemci = null;
let dilAdlari = new Set();
const dilSayisalKaliplar = new Set([
  "{0} oyuncu", "{0} yaş", "{0} galibiyet", "{0} mağlubiyet", "{0}. Lig", "{0} lig", "{0} hafta", "{0} hafta kaldı", "Son {0}", "{0} karşılaşma", "{0}. Lig (senin ligin)", "{0} YAŞ", "Scout Seviyesini Yükselt ({0})", "{0} maç", "{0} öldürme"
]);
const dilRuscaSayim = {
  "{0} oyuncu": ["игрок", "игрока", "игроков"],
  "{0} galibiyet": ["победа", "победы", "побед"],
  "{0} mağlubiyet": ["поражение", "поражения", "поражений"],
  "{0} hafta": ["неделя", "недели", "недель"],
  "{0} hafta kaldı": ["неделя", "недели", "недель"],
  "{0} maç": ["матч", "матча", "матчей"],
  "{0} karşılaşma": ["встреча", "встречи", "встреч"],
  "{0} lig": ["лига", "лиги", "лиг"],
  "{0} öldürme": ["убийство", "убийства", "убийств"]
};
// Only declared name parameters bypass translation; labels never depend on the roster.
const dilIsimAlanlari = {
  "{0}: {1} → {2}/hafta. Maaş iyileştirilsin mi?": [0],
  "{0}. raund başlıyor! {1} {2} tarafında. Skor {3}–{4}.": [
    1
  ],
  "{0}, {1} oyuncusunu düşürüyor. {2} adına önemli bir hamle!": [
    0,
    1,
    2
  ],
  "{0} takımında son oyuncu kaldı.": [
    0
  ],
  "{0} takımında ayakta kalan yok.": [
    0
  ],
  "{0} raundu alıyor! Tabela {1}–{2}.": [
    0
  ],
  "{0} ({1}, {2})": [
    0
  ],
  "{0} ({1} hafta kaldı)": [
    0
  ],
  "{0} için net {1} ve haftalık {2} maaş. İmzalansın mı?": [
    0
  ],
  "{0} ve {1} antrenmanda sert tartıştı. Takım gerginleşti.": [
    0,
    1
  ],
  "{0} tarafını tut": [
    0
  ],
  "{0} (GEN {1}) maaşını artırmanı istiyor. Şu anki maaşı {2}.": [
    0
  ],
  "{0} son zamanlarda isteksiz görünüyor.": [
    0
  ],
  "{0} morali +5, diğerleri +1.": [
    0
  ],
  "{0} sosyal medyada tartışma yarattı, taraftarlar tepkili.": [
    0
  ],
  "İtibar {0}, {1} morali {2}.": [
    1
  ],
  "Arabuluculuk işe yaradı. {0} ve {1} barıştı (moral +4).": [
    0,
    1
  ],
  "{0} moral +6, {1} moral -8.": [
    0,
    1
  ],
  "{0} yeni maaşı {1} (moral +8).": [
    0
  ],
  "{0} morali -2. Konu sezon sonuna ertelendi.": [
    0
  ],
  "{0} yorgunluk -20, moral +2.": [
    0
  ],
  "{0} morali {1}.": [
    0
  ],
  "Çözülmeyen tartışma: {0} ve {1} moral -3.": [
    0,
    1
  ],
  "{0} zam talebine cevap alamadı, moral -5.": [
    0
  ],
  "{0} ilgilenilmediği için moral -3.": [
    0
  ],
  "Değişiklik: {0} çıktı, {1} girdi": [
    0,
    1
  ],
  "{0}: {1} (GEN {2}) ayrıldı, {3} (GEN {4}) geldi.": [
    0,
    1,
    3
  ],
  "{0} (Güç {1})": [
    0
  ],
  "{0} yerine kim girsin?": [
    0
  ],
  "{0} ({1})": [
    0
  ],
  "{0} (GEN {1})": [
    0
  ],
  "{0} (İlk 5 · GEN {1})": [
    0
  ],
  "{0} (Yedek, GEN {1})": [
    0
  ],
  "{0} ({1}, {2} · Yedek)": [
    0
  ],
  "{0}: sözleşmesi bitti, {1} hafta içinde ayrılır.": [
    0
  ],
  "{0} (SÖZLEŞME BİTTİ ({1} hf içinde ayrılır))": [
    0
  ],
  "{0} ile kendi oyuncunu karşılaştır.": [
    0
  ],
  "{0} için son bilinen veriler kullanılıyor.": [
    0
  ],
  "Akademi {0}: {1} → {2}": [
    0
  ],
  "{0} ({1}, GEN {2})": [
    0
  ],
  "{0}: yedek kaldığı için sabırsızlanıyor (ek moral -1).": [
    0
  ],
  "Kadro eksikti, piyasadan alındı: {0} (GEN {1}, {2})": [
    0
  ],
  "{0} ile {1}. karşılaşma: {2}–{3}.": [
    0
  ]
};
const dilKaliplari = Object.keys(DIL_CEVIRILERI).filter(x => /\{\d+\}/.test(x)).map(kaynak => {
  const parcalar = kaynak.split(/(\{\d+\})/);
  const alanlar = [];
  const regex = parcalar.map(x => {
    if (/^\{\d+\}$/.test(x)) {
      alanlar.push(x);
      // The side is a fixed ID; otherwise a multiword team name is split at its first space.
      if (kaynak === "{0}. raund başlıyor! {1} {2} tarafında. Skor {3}–{4}." && x === "{2}") return "(CT|T)";
      return "(.+?)";
    }
    return x.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
  }).join("");
  return { kaynak, alanlar, desen: new RegExp("^" + regex + "$") };
}).sort((a, b) => {
  // Prefer the full sentence over a shorter pattern that could absorb unrelated text.
  const uzunluk = text => text.replace(/\{\d+\}/g, "").length;
  return uzunluk(b.kaynak) - uzunluk(a.kaynak);
});

const dilHarfEslemeleri = new Map();
for (const anahtar of Object.keys(DIL_CEVIRILERI)) {
  const buyuk = anahtar.toLocaleUpperCase("tr");
  if (!anahtar.includes("{") && !dilHarfEslemeleri.has(buyuk)) dilHarfEslemeleri.set(buyuk, anahtar);
}

function dilMetni(metin, derinlik = 0) {
  if (typeof metin !== "string" || oyunDili === "tr" || derinlik > 8) return metin;
  const kenarlar = metin.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const kaynak = kenarlar[2];
  const sira = OYUN_DILLERI.findIndex(([kod]) => kod === oyunDili) - 1;
  const birebir = DIL_CEVIRILERI[kaynak]?.[sira];
  if (birebir) return kenarlar[1] + birebir + kenarlar[3];
  // Tournament reports keep map IDs in saved text; translate every map in a score list.
  if (typeof HARITALAR !== "undefined" && kaynak.includes(", ")) {
    const parantez = kaynak.startsWith("(") && kaynak.endsWith(")");
    const liste = (parantez ? kaynak.slice(1, -1) : kaynak).split(", ");
    const skorlar = liste.map(x => x.match(/^(.+?) (\d+\s*[-–]\s*\d+)$/));
    if (skorlar.length > 1 && skorlar.every(x => x && HARITALAR.includes(x[1]))) {
      const sonuc = skorlar.map(x => dilMetni(x[1], derinlik + 1) + " " + x[2]).join(", ");
      return kenarlar[1] + (parantez ? "(" + sonuc + ")" : sonuc) + kenarlar[3];
    }
  }
  for (const kalip of dilKaliplari) {
    const eslesme = kaynak.match(kalip.desen);
    if (!eslesme) continue;
    // Player cards end in an age. Attribute-weight lists can also contain commas and parentheses.
    if (kalip.kaynak === "{0} ({1}, {2})" && !/^\d{1,3}$/.test(eslesme[3])) continue;
    if (kalip.kaynak === "{0} ({1})" &&
      !(typeof ROL_GEN_AGIRLIKLARI !== "undefined" && Object.prototype.hasOwnProperty.call(ROL_GEN_AGIRLIKLARI, eslesme[2])) &&
      !(typeof ROLLER !== "undefined" && ROLLER.includes(eslesme[2]))) continue;
    if (dilSayisalKaliplar.has(kalip.kaynak) && !/^[0-9.,/ +−-]+$/.test(eslesme[1])) continue;
    let hedef = DIL_CEVIRILERI[kalip.kaynak][sira];
    // Russian count endings depend on the last digits, except for 11-14.
    const cekim = oyunDili === "ru" && dilRuscaSayim[kalip.kaynak];
    if (cekim && /^\d+$/.test(eslesme[1])) {
      const n = Number(eslesme[1]), son = n % 10, yuz = n % 100;
      const bicim = son === 1 && yuz !== 11 ? 0 : son >= 2 && son <= 4 && (yuz < 12 || yuz > 14) ? 1 : 2;
      hedef = "{0} " + cekim[bicim];
      if (kalip.kaynak === "{0} hafta kaldı") hedef = (bicim === 0 ? "Осталась " : "Осталось ") + hedef;
    }
    const degerler = Object.fromEntries(kalip.alanlar.map((ad, i) =>
      [ad, (dilIsimAlanlari[kalip.kaynak] || []).includes(Number(ad.slice(1, -1))) ? eslesme[i + 1] : dilMetni(eslesme[i + 1], derinlik + 1)]));
    if (kalip.kaynak === "{0} ({1} hafta kaldı)" && /^\d+$/.test(eslesme[2])) {
      hedef = DIL_CEVIRILERI["{0} ({1})"][sira];
      degerler["{1}"] = dilMetni(eslesme[2] + " hafta kaldı", derinlik + 1);
    }
    if (typeof dilSayiliKalip === "function") hedef = dilSayiliKalip(kalip.kaynak, hedef, degerler);
    return kenarlar[1] + hedef.replace(/\{\d+\}/g, ad => degerler[ad]) + kenarlar[3];
  }
  // Translate standalone pieces around UI separators without touching names or numbers.
  for (const ayirac of [" · ", " — ", ": "]) {
    if (kaynak.includes(ayirac)) {
      return kenarlar[1] + kaynak.split(ayirac).map(x => dilMetni(x, derinlik + 1)).join(ayirac) + kenarlar[3];
    }
  }
  const yon = kaynak.match(/^([←↗›·(✓]\s*)(.+)$/);
  if (yon) return kenarlar[1] + yon[1] + dilMetni(yon[2], derinlik + 1) + kenarlar[3];
  const sonIsaret = kaynak.match(/^(.+?)([ :›]+)$/);
  if (sonIsaret) return kenarlar[1] + dilMetni(sonIsaret[1], derinlik + 1) + sonIsaret[2] + kenarlar[3];
  const yuzde = kaynak.match(/^(.+?) \(%(\d+)\)$/);
  if (yuzde && DIL_CEVIRILERI[yuzde[1]]) {
    return kenarlar[1] + dilMetni(yuzde[1], derinlik + 1) + " (" + yuzde[2] + "%)" + kenarlar[3];
  }
  const ozellikler = kaynak.split(", ");
  if (ozellikler.length > 1 && ozellikler.every(x =>
    DIL_CEVIRILERI[x] || /^.+? \(%\d+\)$/.test(x))) {
    return kenarlar[1] + ozellikler.map(x => dilMetni(x, derinlik + 1)).join(", ") + kenarlar[3];
  }
  const cumleler = kaynak.split(/(?<=[.!?])\s+/);
  if (cumleler.length > 1) {
    const sonuc = cumleler.map(x => dilMetni(x, derinlik + 1)).join(" ");
    if (sonuc !== kaynak) return kenarlar[1] + sonuc + kenarlar[3];
  }
  const harfBicimi = dilHarfEslemeleri.get(kaynak.toLocaleUpperCase("tr"));
  if (harfBicimi) {
    const hedef = DIL_CEVIRILERI[harfBicimi][sira];
    const buyuk = kaynak === kaynak.toLocaleUpperCase("tr");
    return kenarlar[1] + (buyuk ? hedef.toLocaleUpperCase(oyunDili) : hedef) + kenarlar[3];
  }
  const sayi = kaynak.match(/^(.*?)(\s+[+−\-]?\d[\s\S]*)$/);
  if (sayi) {
    const baslik = dilMetni(sayi[1], derinlik + 1);
    if (baslik !== sayi[1]) return kenarlar[1] + baslik + sayi[2] + kenarlar[3];
  }
  return metin;
}

// Name markup is used only when rendering HTML; stored data remains plain text.
function oyunAdi(ad) {
  return '<span data-ceviri-yok>' + oyunYazisi(ad) + '</span>';
}
function dilOyuncuSecenegi(ad, rol, deger, secili) {
  return '<option value="' + oyunYazisi(deger) + '" data-ceviri-isim="' + oyunYazisi(ad) +
    '" data-ceviri-rol="' + oyunYazisi(rol) + '"' + (secili ? ' selected' : '') + '>' +
    oyunYazisi(ad) + ' · ' + oyunYazisi(rol) + '</option>';
}

function dilKorumaliAdlar() {
  const adlar = new Set();
  if (typeof kariyer !== "undefined" && kariyer) {
    adlar.add(kariyer.takimAdi);
    for (const s of [...(kariyer.sponsorlar || []), ...(kariyer.sponsorTeklif || []), ...(kariyer.sponsorBekleyen || [])]) {
      adlar.add(s.ad);
    }

    for (const o of [...(kariyer.oyuncular || []), ...(kariyer.yedekler || []), ...(kariyer.akademi || []),
      ...(kariyer.serbest || []), ...(kariyer.adaylar || []), ...(kariyer.izlemeListesi || []).map(x => x.sonBilgi)]) {
      if (o?.ad) adlar.add(o.ad);
    }
  }
  if (typeof dunya !== "undefined") {
    for (const t of dunya) {
      adlar.add(t.ad);
      for (const o of t.oyuncular || []) adlar.add(o.ad);
    }
  }
  if (typeof kadroSablonunuOku === "function") {
    for (const t of Object.values(kadroSablonunuOku())) {
      if (!t || typeof t !== "object") continue;
      if (t.ad) adlar.add(t.ad);
      for (const ad of Array.isArray(t.oyuncular) ? t.oyuncular : []) if (ad) adlar.add(ad);
    }
  }
  return adlar;
}

function dilGorunumuGuncelle() {
  if (!document.createTreeWalker || !document.body) return;
  if (dilGozlemci) dilGozlemci.disconnect();
  try {
    document.documentElement.lang = oyunDili;
    const adlar = dilKorumaliAdlar();
    dilAdlari = adlar;
    const agac = document.createTreeWalker(document.body, 4);
    const liste = [];
    while (agac.nextNode()) liste.push(agac.currentNode);
    for (const dugum of liste) {
      const ebeveyn = dugum.parentElement;
      if (!ebeveyn || ebeveyn.closest("script,style,textarea,code,[data-ceviri-yok]")) continue;
      const kayit = dilOrijinalleri.get(dugum);
      const kaynak = kayit && kayit.son === dugum.nodeValue ? kayit.kaynak : dugum.nodeValue;
      // An option without a value otherwise changes its internal value when its label changes.
      if (ebeveyn.tagName === "OPTION" && !ebeveyn.hasAttribute("value")) {
        ebeveyn.value = ebeveyn.textContent;
      }
      const simgeAdi = { "Yıldız": "Yıldız simgesi", "Hedef": "Hedef simgesi" }[kaynak.trim()];
      const simge = simgeAdi && ebeveyn.closest('[data-kimlik-alan="arma"]');
      const baglamAnahtari = ebeveyn.getAttribute("data-ceviri-anahtari");
      const onAd = ebeveyn.getAttribute("data-ceviri-isim-on-eki");
      let isaret = "\uE000AD\uE001";
      while (kaynak.includes(isaret)) isaret += "_";
      const ilk = kaynak.search(/\S/);
      const isimli = onAd && ilk >= 0 && kaynak.slice(ilk).startsWith(onAd);
      const ceviriKaynak = isimli ? kaynak.slice(0, ilk) + isaret + kaynak.slice(ilk + onAd.length) : kaynak;
      const ceviri = oyunDili !== "tr" && baglamAnahtari ? dilMetni(baglamAnahtari) :
        simge && oyunDili !== "tr" ? dilMetni(simgeAdi) : dilMetni(ceviriKaynak);
      const son = isimli ? ceviri.split(isaret).join(onAd) : ceviri;
      const oyuncuAdi = ebeveyn.getAttribute("data-ceviri-isim");
      const oyuncuRolu = ebeveyn.getAttribute("data-ceviri-rol");
      const gosterim = oyuncuAdi !== null && oyuncuRolu !== null ? oyuncuAdi + " · " + dilMetni(oyuncuRolu) : son;
      dilOrijinalleri.set(dugum, { kaynak, son: gosterim });
      if (dugum.nodeValue !== gosterim) dugum.nodeValue = gosterim;
    }
    for (const eleman of document.body.querySelectorAll("[placeholder],[title],[aria-label]")) {
      if (eleman.closest("[data-ceviri-yok]")) continue;
      const kayit = dilOrijinalleri.get(eleman) || {};
      for (const alan of ["placeholder", "title", "aria-label"]) {
        if (!eleman.hasAttribute(alan)) continue;
        if ((eleman.getAttribute("data-ceviri-haric") || "").split(" ").includes(alan)) continue;
        const deger = eleman.getAttribute(alan);
        const onceki = kayit[alan];
        const kaynak = onceki && onceki.son === deger ? onceki.kaynak : deger;
        const son = dilMetni(kaynak);
        kayit[alan] = { kaynak, son };
        if (deger !== son) eleman.setAttribute(alan, son);
      }
      dilOrijinalleri.set(eleman, kayit);
    }
  } finally {
    if (dilGozlemci) dilGozlemci.observe(document.body, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"]
    });
  }
}

function dilSec(kod) {
  if (!OYUN_DILLERI.some(([deger]) => deger === kod)) return;
  oyunDili = kod;
  try { localStorage.setItem(DIL_ANAHTARI, kod); } catch (_) {}
  dilSecimEkrani();
}

function dilButonu() {
  const ad = OYUN_DILLERI.find(([kod]) => kod === oyunDili)[1];
  return '<button type="button" class="buton ikincil dil-butonu" onclick="dilSecimEkrani()">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z"/></svg>' +
    '<span class="dil-butonu-metin"><small>' + dilMetni("Dil") +
    '</small><span data-ceviri-yok>' + ad + '</span></span></button>';
}

function dilSecimEkrani() {
  uygulama.innerHTML = '<button class="geri" onclick="anaMenu()">← Geri</button>' +
    '<h2>Dil Seçimi</h2><div class="dil-listesi">' +
    OYUN_DILLERI.map(([kod, ad]) => '<button type="button" lang="' + kod +
      '" data-ceviri-yok class="dil-secenegi" aria-pressed="' + (kod === oyunDili) +
      '" onclick="dilSec(\'' + kod + '\')"><span>' + ad + '</span><span aria-hidden="true">' +
      (kod === oyunDili ? '✓' : '') + '</span></button>').join("") + '</div>';
  dilGorunumuGuncelle();
}

function dilBaslat() {
  if (!document.createTreeWalker || !document.body) return;
  dilGozlemci = new MutationObserver(dilGorunumuGuncelle);
  for (const ad of ["alert", "confirm", "prompt"]) {
    const asil = window[ad];
    if (typeof asil === "function") {
      window[ad] = function(metin, ...args) { return asil.call(window, dilMetni(metin), ...args); };
    }
  }
  dilGorunumuGuncelle();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", dilBaslat, { once: true });
else dilBaslat();
