// ---------- Rastgelelik (sabit tohumlu) ----------
function tohum(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rastgele = tohum(12345);

function sinirla(d) {
  return Math.max(1, Math.min(99, Math.round(d)));
}

// ---------- Oyuncu ve dünya üretimi ----------
function oyuncuUret(ad, rol, takimGucu) {
  const o = { ad: ad, rol: rol, yas: 17 + Math.floor(rastgele() * 14) };
  rolProfiliUret(o,takimGucu,rastgele);
  return o;
}

function dunyaUret() {
  const adlar = [...OYUNCU_ADLARI];
  return TAKIMLAR.map(function (t) {
    return {
      ad: t.ad,
      guc: t.guc,
      oyuncular: ROLLER.map(function (rol) {
        return oyuncuUret(adlar.shift(), rol, t.guc);
      })
    };
  });
}

const dunya = dunyaUret();
const uygulama = document.getElementById("uygulama");

// ---------- Kariyer ve kayıt ----------
const KAYIT_ANAHTARI = "tactical_esports_manager_kayit";
// Önceki sürümün tarayıcı kaydını yeni oyun adına taşı.
try {
  const oncekiAnahtar = "cs2menajer_kayit";
  const oncekiKayit = localStorage.getItem(oncekiAnahtar);
  if (localStorage.getItem(KAYIT_ANAHTARI) === null && oncekiKayit !== null) {
    localStorage.setItem(KAYIT_ANAHTARI, oncekiKayit);
    localStorage.removeItem(oncekiAnahtar);
  }
} catch (e) {}
const RENKLER = [
  { ad: "Turuncu", kod: "#f59e0b" },
  { ad: "Mavi", kod: "#3b82f6" },
  { ad: "Yeşil", kod: "#10b981" },
  { ad: "Kırmızı", kod: "#ef4444" },
  { ad: "Mor", kod: "#8b5cf6" }
];
const BASLANGIC_ADLARI = ["Poyraz", "Tarkan", "Murat", "Yusuf", "Kağan"];
const BASLANGIC_BUTCE = 500000;
const BASLANGIC_GUC = 48;

let kariyer = null;
let kayitYukleniyor = false;

function kayitVarMi() {
  try { return localStorage.getItem(KAYIT_ANAHTARI) !== null; } catch (e) { return false; }
}

function kaydet() {
  if (!kayitYukleniyor && typeof macKaydiGuncelle === "function") macKaydiGuncelle();
  try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kariyer)); } catch (e) { alert("Kayıt yapılamadı."); }
}

function kayitYukle() {
  macAkisiniTemizle();
  try {
    kariyer = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
  } catch (e) { kariyer = null; }
  if (kariyer) {
    kayitYukleniyor = true;
    try { kariyerEkrani(); macKaydiniYukle(); } finally { kayitYukleniyor = false; }
    kaydet();
  } else { anaMenu(); }
}

function kayitSil() {
  if (confirm("Kariyerin kalıcı olarak silinecek. Emin misin?")) {
    try { localStorage.removeItem(KAYIT_ANAHTARI); } catch (e) {}
    macAkisiniTemizle();
    kariyer = null;
    anaMenu();
  }
}

function temizle(m) {
  return m.replace(/[<>&"']/g, "");
}

function para(sayi) {
  return sayi.toLocaleString("tr-TR") + " $";
}

// ---------- Geri bildirim ----------
function geriBildirimButonu() {
  return '<button class="feedback-button" type="button" onclick="geriBildirimAc()"><span class="feedback-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 11h8m-8 4h5"/></svg></span><span class="feedback-label">Geri bildirim<small>Fikirlerini ve sorunları bizimle paylaş</small></span><span class="feedback-arrow" aria-hidden="true">↗</span></button>';
}
const GERI_BILDIRIM_IKONLARI = {"Beğendim":"<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path d=\"m7 37 10-10 4 4-10 10-4-4Z\" fill=\"currentColor\" fill-opacity=\".25\"/><path d=\"m17 27 5-5m-4-3 11-9 12-4-4 12-12 10-7-9Z\" fill=\"currentColor\" fill-opacity=\".12\"/><path d=\"m22 22 15-12M14 24l10 10M10 35l3 3\"/></svg>","Öneri":"<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path d=\"m4 29 2-12 3-2 2 7 1-11 3-1 1 12 2-10 3 1-1 13 3-5 3 2-5 11-2 5H8l-4-10Z\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"m26 34-2-11 3-2 3 5-1-13 3-1 2 10 1-12 3 1 1 11 2-7 3 2 1 12-4 10H28l-2-5Z\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M8 33h11M29 33h12M9 26h8m14 0h8M9 39v4h10v-4m10 0v4h12v-4\"/></svg>","Hata bildir":"<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"10\" y=\"14\" width=\"28\" height=\"29\" rx=\"4\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M17 14V8c0-5 14-5 14 0v6M21 14V9m7 5V9\"/><rect x=\"15\" y=\"19\" width=\"18\" height=\"7\" rx=\"1\"/><path d=\"M16 31h2m5 0h2m5 0h2m-16 5h2m5 0h2m5 0h2M19 22h10\"/></svg>"};
let geriBildirimTaslak = { kategori: "Beğendim", mesaj: "" };
let geriBildirimDonus = null;
function geriBildirimAc() {
  geriBildirimDonus = kariyer ? kariyerEkrani : anaMenu;
  uygulama.innerHTML = '<section class="feedback-screen" id="feedback-screen"><div class="feedback-heading"><span class="feedback-emblem" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 8h8m-8 4h5"/></svg></span><div><span class="feedback-eyebrow">TACTICAL ESPORTS MANAGER</span><h1>Geri bildirim</h1></div></div><p class="feedback-intro">Önerini ya da bulduğun hatayı yaz. E-posta uygulaman hazır bir mesajla açılır, sen gönderirsin.</p><form id="feedback-form" class="feedback-form"><div class="feedback-fields"><span class="feedback-topic-label" id="feedback-topic-label">Konu</span><input id="feedback-category" type="hidden" name="kategori"><details class="feedback-category-picker" id="feedback-picker"><summary aria-labelledby="feedback-topic-label feedback-category-title"><span id="feedback-category-icon" aria-hidden="true"></span><span id="feedback-category-title"></span><svg class="feedback-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="feedback-category-options" role="radiogroup" aria-label="Geri bildirim konusu"><label class="feedback-category-option"><input type="radio" name="feedback-topic" value="Beğendim"><span class="feedback-option-icon" aria-hidden="true"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m7 37 10-10 4 4-10 10-4-4Z" fill="currentColor" fill-opacity=".25"/><path d="m17 27 5-5m-4-3 11-9 12-4-4 12-12 10-7-9Z" fill="currentColor" fill-opacity=".12"/><path d="m22 22 15-12M14 24l10 10M10 35l3 3"/></svg></span><span>Beğendim</span><span class="feedback-option-check" aria-hidden="true"></span></label><label class="feedback-category-option"><input type="radio" name="feedback-topic" value="Öneri"><span class="feedback-option-icon" aria-hidden="true"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m4 29 2-12 3-2 2 7 1-11 3-1 1 12 2-10 3 1-1 13 3-5 3 2-5 11-2 5H8l-4-10Z" fill="currentColor" fill-opacity=".14"/><path d="m26 34-2-11 3-2 3 5-1-13 3-1 2 10 1-12 3 1 1 11 2-7 3 2 1 12-4 10H28l-2-5Z" fill="currentColor" fill-opacity=".14"/><path d="M8 33h11M29 33h12M9 26h8m14 0h8M9 39v4h10v-4m10 0v4h12v-4"/></svg></span><span>Öneri</span><span class="feedback-option-check" aria-hidden="true"></span></label><label class="feedback-category-option"><input type="radio" name="feedback-topic" value="Hata bildir"><span class="feedback-option-icon" aria-hidden="true"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="14" width="28" height="29" rx="4" fill="currentColor" fill-opacity=".14"/><path d="M17 14V8c0-5 14-5 14 0v6M21 14V9m7 5V9"/><rect x="15" y="19" width="18" height="7" rx="1"/><path d="M16 31h2m5 0h2m5 0h2m-16 5h2m5 0h2m5 0h2M19 22h10"/></svg></span><span>Hata bildir</span><span class="feedback-option-check" aria-hidden="true"></span></label></div></details><label class="feedback-message-label" for="feedback-message">Mesajın</label><textarea id="feedback-message" name="mesaj" rows="6" maxlength="4000" required placeholder="Mesajını yaz..."></textarea></div><p id="feedback-status" class="feedback-status" role="status" aria-live="polite"></p><button class="feedback-send" type="submit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/></svg><span>Gönder</span></button><button class="feedback-back" type="button" onclick="geriBildirimGeri()">← Geri</button></form></section>';
  const form = document.getElementById("feedback-form");
  const category = document.getElementById("feedback-category");
  const message = document.getElementById("feedback-message");
  if (geriBildirimTaslak.kategori === "Hata") geriBildirimTaslak.kategori = "Hata bildir";
  if (!GERI_BILDIRIM_IKONLARI[geriBildirimTaslak.kategori]) geriBildirimTaslak.kategori = "Beğendim";
  category.value = geriBildirimTaslak.kategori;
  const categoryIcon = document.getElementById("feedback-category-icon");
  categoryIcon.innerHTML = GERI_BILDIRIM_IKONLARI[category.value];
  const title = document.getElementById("feedback-category-title");
  title.textContent = category.value;
  const picker = document.getElementById("feedback-picker");
  form.querySelectorAll('input[name="feedback-topic"]').forEach(function (radio) {
    radio.checked = radio.value === category.value;
    radio.onchange = function () {
      if (!radio.checked) return;
      category.value = radio.value;
      geriBildirimTaslak.kategori = radio.value;
      categoryIcon.innerHTML = GERI_BILDIRIM_IKONLARI[radio.value];
      title.textContent = radio.value;
      picker.open = false;
      picker.querySelector("summary").focus();
    };
  });
  message.value = geriBildirimTaslak.mesaj;
  message.oninput = function () { geriBildirimTaslak.mesaj = message.value; message.setCustomValidity(""); };
  form.onsubmit = geriBildirimGonder;
  window.scrollTo(0, 0);
}
function geriBildirimGeri() {
  (geriBildirimDonus || anaMenu)();
}
async function geriBildirimGonder(event) {
  event.preventDefault();
  const field = document.getElementById("feedback-message");
  const message = field.value.trim();
  if (!message) { field.setCustomValidity("Lütfen mesajını yaz."); field.reportValidity(); return; }
  const category = document.getElementById("feedback-category").value;
  const subject = "Tactical Esports Manager — " + category;
  const body = "Kategori: " + category + "\n\n" + message;
  const status = document.getElementById("feedback-status");
  const button = document.querySelector(".feedback-send");
  if (button.disabled) return;
  button.disabled = true;
  try {
    const cap = window.Capacitor;
    if (cap && cap.isPluginAvailable("Feedback")) {
      const result = await cap.nativePromise("Feedback", "open", { subject: subject, body: body });
      status.textContent = result.opened ? "Mesajın e-posta uygulamasına hazırlandı. Son gönderimi oradan yapabilirsin." : "E-posta uygulaması bulunamadı. Mesajın burada korunuyor.";
    } else {
      window.location.href = "mailto:tacticalesportsmanager@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Mesajını açılan e-posta uygulamasından gönderebilirsin. Adres: tacticalesportsmanager@gmail.com";
    }
  } catch (_) { status.textContent = "E-posta açılamadı. Mesajın korunuyor. Bize tacticalesportsmanager@gmail.com adresinden ulaşabilirsin."; }
  finally { button.disabled = false; }
}

// ---------- Ekranlar ----------
function anaMenu() {
  let html = '<section class="baslangic-hero"><div class="baslangic-arma">TEM</div><p class="baslangic-ust">ESPOR KULÜP YÖNETİMİ</p><h1>Menajer koltuğu<br>seni bekliyor.</h1><p class="baslangic-alt">Kadronu kur. Stratejini belirle. Zirveye tırman.</p></section><h2 class="baslangic-baslik">Ana Menü</h2>';
  if (kayitVarMi()) {
    html += '<button class="buton baslangic-devam" onclick="kayitYukle()">Kariyere Devam Et <span>›</span></button>';
  }
  html += '<button class="buton baslangic-yeni" onclick="yeniKariyerFormu()">Yeni Kariyer Başlat <span>›</span></button>';
  if (kayitVarMi()) {
    html += '<button class="baslangic-sil" onclick="kayitSil()">Kayıtlı kariyeri sil</button>';
  }
  html += '<button class="buton ikincil" onclick="kayitYedekEkrani()">Kayıt Yedeği</button>';
  html += '<button class="buton ikincil" onclick="kadroEditoru()">Kadro Editörü</button>';
  html += reklamsizMagazaButonu();
  html += geriBildirimButonu();
  uygulama.innerHTML = html;
}

function yeniKariyerFormu() {
  const sablonAd = kadroSablonunuOku()[0]?.ad || "";
  let html = '<button class="geri" onclick="anaMenu()">← Geri</button><h2>Yeni Kariyer</h2>';
  html += '<label for="takimAdi">Takım adı</label><input id="takimAdi" class="alan" type="text" maxlength="40" value="' + oyunYazisi(sablonAd) + '" placeholder="Örn. Anadolu Aslanları">';
  html += kimlikAlanlari({});
  html += '<label for="kariyer-senaryo">Kariyer senaryosu</label><select class="alan" id="kariyer-senaryo">' + senaryoSecenekleri() + '</select><p>Akademi Projesi seviye 1 scout ile başlar. Borçtan Dönüş’te önce bütçeyi toparlaman gerekir.</p>';
  html += '<button class="buton" onclick="kariyerBaslat()">Kariyeri Başlat</button>';
  uygulama.innerHTML = html;
}


function kariyerBaslat() {
  const ad = temizle(document.getElementById("takimAdi").value.trim());
  if (ad === "") { alert("Lütfen bir takım adı yaz."); return; }
  const secim = document.getElementById("kariyer-senaryo")?.value;
  const senaryo = Object.hasOwn(KARIYER_SENARYOLARI, secim) ? secim : "standart";
  const baslangic = KARIYER_SENARYOLARI[senaryo];
  const kimlik = kimlikFormunuOku();
  macAkisiniTemizle();
  kariyer = {
    takimAdi: ad,
    renk: kimlik.renk,
    kimlikTasarimi: kimlik,
    butce: baslangic.butce,
    scout: baslangic.scout,
    senaryo,
    galibiyet: 0,
    maglubiyet: 0,
    hafta: 1,

    oyuncular: ROLLER.map(function (rol, i) {
      return oyuncuUret(BASLANGIC_ADLARI[i], rol, BASLANGIC_GUC);
    })
  };
  kadroSablonunuUygula();
  kariyer.rehber = { durum: "teklif", adim: 0 };
  kimyaHazirla();
  kaydet();
  kariyerEkrani();
}

function tabloHtml(oyuncular) {
  const basliklar = [["nisan", "NİŞ"], ["sprey", "SPR"], ["refleks", "REF"], ["bilgi", "BİL"], ["karar", "KAR"], ["pozisyon", "POZ"], ["iletisim", "İLE"], ["liderlik", "LİD"], ["takimoyunu", "TOP"], ["utility", "UTL"], ["istikrar", "İST"], ["baski", "BAS"]];
  let html = '<div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Rol</th><th>Yaş</th><th>GEN</th>';
  basliklar.forEach(function (b) { html += "<th>" + b[1] + "</th>"; });
  html += "</tr>";
  oyuncular.forEach(function (o) {
    const gerek = TARZLAR[o.rol] || [];
    html += "<tr><td>" + o.ad + "</td><td>" + o.rol + "</td><td>" + o.yas + '</td><td class="genel">' + o.genel + "</td>";
    basliklar.forEach(function (b) {
      const z = b[0];
      const yesil = gerek.indexOf(z) >= 0 && o[z] >= YESIL_ESIK;
      const gerekli = gerek.indexOf(z) >= 0;
      const stil = yesil ? ' style="color:var(--green);font-weight:bold"' : (gerekli ? ' style="color:var(--accent)"' : "");
      html += "<td" + stil + ">" + (o[z] === undefined ? "-" : o[z]) + "</td>";
    });
    html += "</tr>";
  });
  return html + "</table></div>";
}

function kariyerEkrani() {
    rakipleriBagla();
    tarzlariHazirla();
    stratejiHazirla();
    basarimKontrol();
  let html = '<h1 style="color:' + kariyer.renk + '">' + kariyer.takimAdi + "</h1>";
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Galibiyet: <b>" + (kariyer.galibiyet || 0) + "</b> &nbsp; Mağlubiyet: <b>" + (kariyer.maglubiyet || 0) + "</b></div>";
  html += maasKutusu();
  html += sezonKutusu();
  html += olayKutusu();
  html += '<button class="buton ikincil" onclick="kadroEkrani()">Kadro</button>';
  html += '<button class="buton ikincil" onclick="siralamaEkrani()">Dünya Sıralaması</button>';
  html += '<button class="buton ikincil" onclick="ligEkrani()">Ligler</button>';
  html += '<button class="buton ikincil" onclick="turnuvaEkrani()">Turnuvalar</button>';
  html += '<button class="buton ikincil" onclick="ekonomiEkrani()">Finans</button>';
  html += '<button class="buton ikincil" onclick="sponsorEkrani()">Sponsorlar</button>';
  if (teklifSayisi() > 0) html += '<button class="buton" onclick="teklifEkrani()">Satın Alma Teklifleri (' + kariyer.teklifler.length + ")</button>";
  html += '<button class="buton ikincil" onclick="arsivEkrani()">Kariyer Arşivi</button>';
  html += '<button class="buton" onclick="transferEkrani()">Transfer Piyasası</button>';
  html += '<button class="buton ikincil" onclick="sozlesmeEkrani()">Sözleşmeler</button>';
  html += '<button class="buton ikincil" onclick="odakEkrani()">Antrenman Odağı</button>';
  html += '<button class="buton ikincil" onclick="anaMenu()">Ana Menü</button>';
  uygulama.innerHTML = html;
}

function kadroEkrani() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Kadro</h2>';
  html += kadroOzet(kariyer.oyuncular, kariyer.strateji) + tabloHtml(kariyer.oyuncular);
  html += formTablosu(kariyer.oyuncular, "Moral ve Yorgunluk");
  if (yedekListe().length > 0) html += formTablosu(yedekListe(), "Yedek Moral ve Yorgunluk");
  html += haritaTablosu({ oyuncular: kariyer.oyuncular });
  html += '<button class="buton" onclick="stratejiEkrani()">Strateji Belirle</button>';
  html += '<button class="buton ikincil" onclick="yedekEkrani()">Yedek Kadro (' + yedekListe().length + "/" + YEDEK_MAX + ")</button>";
  html += '<button class="buton ikincil" onclick="personelEkrani()">Personel</button>';
  html += '<button class="buton" onclick="haritaAntrenmanEkrani()">Harita Antrenmanı</button>';
  html += '<button class="buton ikincil" onclick="istatistikEkrani()">İstatistikler</button>';
  html += '<button class="buton ikincil" onclick="stratejiRehberi()">Strateji Rehberi</button>';
  html += '<button class="buton ikincil" onclick="rolRehberi()">Rol Rehberi</button>';
  uygulama.innerHTML = html;
}

function takimListesiGoster() {
  let html = '<button class="geri" onclick="anaMenu()">← Ana Menü</button><h2>Rakip Takımlar</h2>';
  dunya.forEach(function (t, i) {
    const ort = Math.round(t.oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / t.oyuncular.length);
    html += '<button class="takim-butonu" onclick="kadroGoster(' + i + ')"><span>' + t.ad + '</span><span>Güç: ' + ort + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function kadroGoster(i) {
  const t = dunya[i];
  let html = '<button class="geri" onclick="takimListesiGoster()">← Geri</button>';
  html += "<h2>" + t.ad + "</h2>" + tabloHtml(t.oyuncular);
  uygulama.innerHTML = html;
}

anaMenu();
