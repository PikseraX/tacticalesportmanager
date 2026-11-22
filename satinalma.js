const KIMLIK_URUN = "ozel_kulup_tasarimi";
const KIMLIK_SATIN_ALMA_ANAHTARI = "tem.ozel-tasarim.v1";
let ozelTasarimSahibi = false;
let kimlikUrun = null;
let kimlikMagazaMesgul = false;
try { ozelTasarimSahibi = localStorage.getItem(KIMLIK_SATIN_ALMA_ANAHTARI) === "1"; } catch (_) {}

function iosPlatform() {
  return window.Capacitor?.getPlatform?.() === "ios";
}

function aktifSahiplikMi(p, urunId) {
  if (!p || p.productIdentifier !== urunId) return false;
  if (p.revocationDate) return false;
  if (iosPlatform()) {
    const st = String(p.purchaseState ?? "").toLowerCase();
    return st === "" || st === "1" || st === "purchased";
  }
  return String(p.purchaseState) === "1";
}

async function kimlikSahipliginiYenile(purchases) {
  const sahiplik = purchases.find(p => aktifSahiplikMi(p, KIMLIK_URUN));
  const degisti = ozelTasarimSahibi !== Boolean(sahiplik);
  ozelTasarimSahibi = Boolean(sahiplik);
  try { localStorage.setItem(KIMLIK_SATIN_ALMA_ANAHTARI, ozelTasarimSahibi ? "1" : "0"); } catch (_) {}
  kimlikMagazaCiz();
  if (degisti && document.getElementById?.("kimlik-studyosu")) kimlikOnizlemeyiGuncelle();
  if (!iosPlatform() && sahiplik?.isAcknowledged === false && sahiplik.purchaseToken) {
    try { await playSatinAlma("acknowledgePurchase", { purchaseToken: sahiplik.purchaseToken }); } catch (_) {}
  }
}

function kimlikMagazaCiz(mesaj) {
  const durum = document.getElementById?.("kimlik-magaza-durum");
  if (!durum) return;
  const ios = iosPlatform();
  durum.textContent = mesaj || (ozelTasarimSahibi
    ? "Özel tasarım açık. Tasarımını kariyerinde kullanabilirsin."
    : "Tüm seçenekleri dene. Özel tasarımı kariyerinde kullanmak için bir kez satın al.");
  document.getElementById("kimlik-ozel-baslik").textContent = "Kendi Tasarımını Oluştur · " + (ozelTasarimSahibi ? "Açık" : "Kilitli");
  const buton = document.getElementById("kimlik-satin-al");
  buton.hidden = ozelTasarimSahibi;
  buton.disabled = kimlikMagazaMesgul;
  buton.textContent = kimlikUrun?.priceString
    ? "Kilidi Aç · " + kimlikUrun.priceString
    : (ios ? "App Store Fiyatını Gör" : "Google Play Fiyatını Gör");
  document.getElementById("kimlik-geri-yukle").disabled = kimlikMagazaMesgul;
}

async function kimlikMagazaIslemi(satinAl) {
  if (kimlikMagazaMesgul) return;
  if (sahiplikKontrolu) await sahiplikKontrolu;
  if (magazaMesgul || kimlikMagazaMesgul) return;
  const ios = iosPlatform();
  if (!faturalandirmaVar()) {
    kimlikMagazaCiz("Satın alma ve geri yükleme Android ve iOS uygulamalarında kullanılabilir.");
    return;
  }
  kimlikMagazaMesgul = true;
  kimlikMagazaCiz(ios ? "App Store kontrol ediliyor…" : "Google Play kontrol ediliyor…");
  let mesaj;
  try {
    if (satinAl && kimlikUrun?.priceString && !ozelTasarimSahibi) {
      await playSatinAlma("purchaseProduct", { productIdentifier: KIMLIK_URUN, productType: "inapp", quantity: 1, isConsumable: false, autoAcknowledgePurchases: false });
      mesaj = "Ödeme doğrulaması bekleniyor. Daha sonra geri yüklemeyi dene.";
    } else if (satinAl && !ozelTasarimSahibi) {
      const { products } = await playSatinAlma("getProducts", { productIdentifiers: [KIMLIK_URUN], productType: "inapp" });
      kimlikUrun = products?.find(p => p.identifier === KIMLIK_URUN) || null;
      if (!kimlikUrun?.priceString) {
        mesaj = ios ? "Ürün şu anda App Store’da satışa açık değil." : "Ürün şu anda Google Play’de satışa açık değil.";
      }
    } else if (!satinAl && ios) {
      try { await playSatinAlma("restorePurchases", {}); } catch (_) {}
    }
    const { purchases } = await playSatinAlma("getPurchases", { productType: "inapp" });
    if (!Array.isArray(purchases)) throw new Error("Satın alma listesi alınamadı.");
    await kimlikSahipliginiYenile(purchases);
    if (ozelTasarimSahibi) mesaj = "";
    else if (!satinAl) {
      mesaj = ios
        ? "Bu Apple hesabında tamamlanmış satın alım bulunamadı."
        : "Bu Google Play hesabında tamamlanmış satın alım bulunamadı.";
    }
  } catch (hata) {
    mesaj = /cancel|iptal/i.test(String(hata?.message) + " " + String(hata?.code))
      ? "Satın alma iptal edildi."
      : (ios ? "App Store işlemi tamamlanamadı. Tekrar deneyebilirsin." : "Google Play işlemi tamamlanamadı. Tekrar deneyebilirsin.");
  } finally {
    kimlikMagazaMesgul = false;
    kimlikMagazaCiz(mesaj);
  }
}

const REKLAMSIZ_URUN = "reklamlari_kaldir";
const REKLAMSIZ_ANAHTAR = "tem.reklamsiz.v1";
let reklamsiz = false;
try { reklamsiz = localStorage.getItem(REKLAMSIZ_ANAHTAR) === "1"; } catch (_) {}
let magazaMesgul = false;
let magazaUrun = null;
let sahiplikKontrolu = null;

function faturalandirmaVar() {
  const plat = window.Capacitor?.getPlatform?.();
  return (plat === "android" || plat === "ios") && window.Capacitor.isPluginAvailable("NativePurchases");
}

function playSatinAlma(method, args) {
  return window.Capacitor.nativePromise("NativePurchases", method, args);
}

async function reklamsizDurumuYenile() {
  const { purchases } = await playSatinAlma("getPurchases", { productType: "inapp" });
  if (!Array.isArray(purchases)) throw new Error("Satın alma listesi alınamadı.");
  if (iosPlatform()) {
    await kimlikSahipliginiYenile(purchases);
    return reklamsiz;
  }
  const sahiplik = purchases.find(p => aktifSahiplikMi(p, REKLAMSIZ_URUN));
  reklamsiz = Boolean(sahiplik);
  try { localStorage.setItem(REKLAMSIZ_ANAHTAR, reklamsiz ? "1" : "0"); } catch (_) {}
  if (window.Capacitor.isPluginAvailable("GameAds")) {
    try { await window.Capacitor.nativePromise("GameAds", "setAdsDisabled", { disabled: reklamsiz }); } catch (_) {}
  }
  if (reklamsiz && typeof document !== "undefined") {
    document.querySelectorAll(".reklam-gizlilik").forEach(el => el.remove());
  } else if (!reklamsiz && typeof window.reklamBaslatGerekirse === "function") {
    void window.reklamBaslatGerekirse();
  }
  if (sahiplik?.isAcknowledged === false && sahiplik.purchaseToken) {
    try { await playSatinAlma("acknowledgePurchase", { purchaseToken: sahiplik.purchaseToken }); } catch (_) {}
  }
  await kimlikSahipliginiYenile(purchases);
  return reklamsiz;
}

function reklamsizMagazaButonu() {
  if (iosPlatform()) return "";
  return '<button class="buton ikincil" onclick="reklamsizMagazaAc()">Reklamları Kaldır</button>';
}

function reklamsizMagazaCiz(mesaj) {
  if (!document.getElementById("reklamsiz-magaza")) return;
  const durum = document.getElementById("reklamsiz-durum");
  durum.textContent = mesaj || (reklamsiz ? "Reklamsız oyun etkin." : "");
  const satinAl = document.getElementById("reklamsiz-satin-al");
  satinAl.disabled = magazaMesgul || reklamsiz || !magazaUrun?.priceString;
  satinAl.textContent = reklamsiz ? "Satın alındı" : magazaUrun?.priceString ? "Satın Al · " + magazaUrun.priceString : "Satın Al";
  document.getElementById("reklamsiz-geri-yukle").disabled = magazaMesgul || !faturalandirmaVar();
}

async function reklamsizMagazaAc() {
  const geri = kariyer ? "kariyerEkrani()" : "anaMenu()";
  uygulama.innerHTML = '<section id="reklamsiz-magaza"><button class="geri" data-sabit="1" onclick="' + geri + '">← Geri</button><h2>Reklamları Kaldır</h2><div class="gelisim-kart"><h3>Tek seferlik satın alma</h3><p>Banner ve maç arası reklamları kaldırır. Aynı Google Play hesabıyla satın alımını geri yükleyebilirsin.</p><p id="reklamsiz-durum" role="status"></p><button class="buton" id="reklamsiz-satin-al" onclick="reklamsizSatinAl()" disabled>Satın Al</button><button class="buton ikincil" id="reklamsiz-geri-yukle" onclick="reklamsizGeriYukle()">Satın Alımı Geri Yükle</button></div></section>';
  if (sahiplikKontrolu) await sahiplikKontrolu;
  if (!document.getElementById("reklamsiz-magaza")) return;
  if (magazaMesgul || kimlikMagazaMesgul) { reklamsizMagazaCiz("Google Play kontrol ediliyor…"); return; }
  magazaUrun = null;
  await reklamsizMagazaIslemi(async () => {
    if (await reklamsizDurumuYenile()) return "Reklamsız oyun etkin.";
    const { products } = await playSatinAlma("getProducts", { productIdentifiers: [REKLAMSIZ_URUN], productType: "inapp" });
    magazaUrun = products?.find(p => p.identifier === REKLAMSIZ_URUN) || null;
    return magazaUrun?.priceString ? "" : "Ürün şu anda Google Play’de satışa açık değil.";
  });
}

async function reklamsizMagazaIslemi(islem) {
  if (magazaMesgul || kimlikMagazaMesgul) return;
  if (!faturalandirmaVar()) { reklamsizMagazaCiz("Google Play satın alma bu ortamda kullanılamıyor."); return; }
  magazaMesgul = true;
  reklamsizMagazaCiz("Google Play kontrol ediliyor…");
  let mesaj;
  try { mesaj = await islem(); }
  catch (hata) {
    const neden = String(hata?.message || "") + " " + String(hata?.code || "");
    mesaj = /cancel|iptal/i.test(neden) ? "Satın alma iptal edildi." : "Google Play işlemi tamamlanamadı. Tekrar deneyebilirsin.";
  } finally {
    magazaMesgul = false;
    reklamsizMagazaCiz(mesaj);
  }
}

function reklamsizSatinAl() {
  if (reklamsiz || !magazaUrun?.priceString) return;
  return reklamsizMagazaIslemi(async () => {
    await playSatinAlma("purchaseProduct", { productIdentifier: REKLAMSIZ_URUN, productType: "inapp", quantity: 1, isConsumable: false, autoAcknowledgePurchases: false });
    return await reklamsizDurumuYenile() ? "Satın alma tamamlandı. Reklamlar kaldırıldı." : "Ödeme doğrulaması bekleniyor. Daha sonra geri yüklemeyi dene.";
  });
}

function reklamsizGeriYukle() {
  return reklamsizMagazaIslemi(async () =>
    await reklamsizDurumuYenile() ? "Satın alım geri yüklendi." : "Bu Google Play hesabında tamamlanmış satın alım bulunamadı."
  );
}

async function reklamsizArkaPlanKontrolu() {
  if (magazaMesgul || kimlikMagazaMesgul || !faturalandirmaVar()) return;
  magazaMesgul = true;
  sahiplikKontrolu = reklamsizDurumuYenile().catch(() => {});
  try { await sahiplikKontrolu; }
  finally { sahiplikKontrolu = null; magazaMesgul = false; reklamsizMagazaCiz(); }
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void reklamsizArkaPlanKontrolu();
});
