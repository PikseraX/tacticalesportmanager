const YESIL_ESIK = 62;
const TARZ_ETKISI = [-2, -1, 0, 1, 2]; // 0..4 yeşil özellik

const TARZLAR = {
  "Lider": ["liderlik", "iletisim", "karar", "bilgi"],
  "Yıldız": ["nisan", "refleks", "baski", "sprey"],
  "Destek": ["utility", "takimoyunu", "iletisim", "istikrar"],
  "Giriş": ["refleks", "nisan", "pozisyon", "baski"],
  "Sniper": ["nisan", "refleks", "pozisyon", "istikrar"],
  "Lurker": ["bilgi", "pozisyon", "karar", "istikrar"],
  "Anchor": ["pozisyon", "istikrar", "utility", "baski"],
  "Taktisyen": ["bilgi", "karar", "iletisim", "takimoyunu"]
};
const TARZ_LISTESI = Object.keys(TARZLAR);

function yesilSayisi(o, tarz) {
  const g = TARZLAR[tarz];
  if (!g) return 0;
  return g.filter(function (z) { return o[z] >= YESIL_ESIK; }).length;
}

function tarzEtkisi(o) {
  return TARZ_ETKISI[yesilSayisi(o, o.rol)];
}

function takimEtkin(oyuncular, strateji) {
  const t = oyuncular.reduce(function (s, o) { return s + tarzEtkisi(o); }, 0) / oyuncular.length;
  return ortGuc(oyuncular) + t + stratejiEtkisi(oyuncular, strateji) + formEtkisi(oyuncular) + (typeof kimyaGucEtkisi === "function" ? kimyaGucEtkisi(oyuncular) : 0);
}

function tarzYazi(o) {
  return o.rol;
}

function yakin(a, b) {
  return sinirla((a + b) / 2 + Math.random() * 8 - 4);
}

// Eski 6 özellikten yeni 6 özelliği türetir
function yeniOzellikleriTuret(o) {
  if (o.sprey !== undefined) return;
  o.sprey = yakin(o.nisan, o.istikrar);
  o.karar = yakin(o.bilgi, o.baski);
  o.pozisyon = yakin(o.bilgi, o.istikrar);
  o.liderlik = yakin(o.iletisim, o.bilgi);
  o.takimoyunu = yakin(o.iletisim, o.istikrar);
  o.utility = yakin(o.bilgi, o.refleks);
}

function tumOyuncular() {
  let l = [];
  dunya.forEach(function (t) { l = l.concat(t.oyuncular); });
  l = l.concat(kariyer.oyuncular);
  if (kariyer.serbest) l = l.concat(kariyer.serbest);
  return l;
}

// Eski kayıtları ve yan tarzları düzeltir, GEN'i role göre yeniden hesaplar
function tarzlariHazirla() {
  let degisti = false;
  tumOyuncular().forEach(function (o) {
    if (o.yan !== undefined) { delete o.yan; degisti = true; }
    if (o.sprey === undefined) { yeniOzellikleriTuret(o); degisti = true; }
  });
  if (kariyer.ozV !== 2) {
    tumOyuncular().forEach(genelHesapla);
    kariyer.ozV = 2;
    degisti = true;
  }
  if (degisti) kaydet();
}

function rolRehberi() {
  let html = '<button class="geri" onclick="rehberMenu()">← Rehber</button><h2>Rol Rehberi</h2>';
  html += "<p>Rolün istediği 4 özellik " + YESIL_ESIK + " ve üzerindeyse yeşil yanar. Oyuncu başına takım gücü etkisi: " + TARZ_ETKISI.map(function(e,i){return i + " yeşil " + etkiYazi(e);}).join(" · ") + ". GEN hesabında rolün dört ana özelliğinin toplam ağırlığı %85, diğerlerinin toplamı %15’tir. Destek rolünde nişanın ağırlığı yalnızca %1’dir.</p>";
  html += "<p>Rol değişince GEN, aynı özellikler yeni role göre ağırlıklandırıldığı için değişebilir; bu doğrudan özellik artışı değildir. Rol etkileri takım ortalamasına girer. Yeşil özellikler tek başına galibiyet garantilemez.</p>";
  TARZ_LISTESI.forEach(function (t) {
    html += '<div class="bilgi-kutusu"><b>' + t + "</b><br>" + TARZLAR[t].map(function (z) { return ODAK_ADLARI[z]+" (%"+ROL_GEN_AGIRLIKLARI[t][z]+")"; }).join(", ") + "</div>";
  });
  uygulama.innerHTML = html;
}
