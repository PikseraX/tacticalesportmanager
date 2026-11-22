let sonHub = null;

function metrik(deger, ad, kotu) {
  return '<div class="metrik"><b' + (kotu ? ' style="color:var(--red)"' : "") + ">" + deger + "</b><span>" + ad + "</span></div>";
}

function menuSatiri(ad, aciklama, fn, rozet) {
  return '<button class="menu-satir" onclick="' + fn + '"><span><b>' + ad + "</b><small>" + aciklama + "</small></span>" + (rozet ? '<em class="rozet">' + rozet + "</em>" : "<i>›</i>") + "</button>";
}

const MENU_IKONLARI = {
  takim: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  transfer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h14l-4-4M21 7l-4 4M17 17H3l4 4M3 17l4-4"/></svg>',
  kulup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"/></svg>',
  lig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8m-4-4v4M7 4h10l-1 7-4 3-4-3-1-7Z"/><path d="M7 6H4v2a5 5 0 0 0 4 5m9-7h3v2a5 5 0 0 1-4 5"/><path d="m12 6 .7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2L12 6Z"/></svg>'
};

function menuKarti(ikon, ad, aciklama, fn, rozet) {
  const svg = MENU_IKONLARI[ikon] || MENU_IKONLARI.takim;
  return '<button class="menu-kart" onclick="' + fn + '"><span class="ikon">' + svg + "</span>" + ad + "<small>" + aciklama + "</small>" + (rozet ? '<em class="rozet">' + rozet + "</em>" : "") + "</button>";
}

function hubAc(kimlik, baslik, icerik) {
  sonHub = kimlik + "()";
  uygulama.innerHTML = '<button class="geri" data-sabit="1" onclick="kariyerEkrani()">← Ana Ekran</button><h2>' + baslik + "</h2>" + icerik;
}

function sozlesmeUyariSayisi() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  return tumKadro().filter(function (o) { return o.bitis - hf + 1 <= SOZLESME_UYARI_HAFTA; }).length;
}

function uyariKutusu() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  const u = [];
  if (kariyer.butce < 0) u.push("Bütçe eksi: her hafta %" + (BORC_FAIZ * 100) + " faiz işliyor.");
  tumKadro().filter(sozlesmeBitti).forEach(function (o) {
    const ek = maasIyilestirmeGerekli(o) ? 0 : SOZLESME_EK_HAFTA;
    const kaldi = Math.max(1, o.bitis + ek + 1 - hf);
    u.push(o.ad + ": sözleşmesi bitti, " + kaldi + " hafta içinde ayrılır.");
  });
  const yaklasan = tumKadro().filter(function (o) {
    const kalan = o.bitis - hf + 1;
    return kalan > 0 && kalan <= SOZLESME_UYARI_HAFTA;
  }).map(function (o) { return o.ad + " (" + (o.bitis - hf + 1) + " hf)"; });
  if (yaklasan.length > 0) u.push("<span>Sözleşmesi yaklaşan</span>: " + yaklasan.join(", "));
  return u.length === 0 ? "" : '<div class="uyari">' + u.join("<br>") + "</div>";
}

function bildirimler() {
  let h = "";
  let talepDegisti=false;
  tumKadro().forEach(o=>{if(maasTalebiniTakipEt(o))talepDegisti=true});
  if(talepDegisti)kaydet();
  const maasTalepleri=tumKadro().filter(maasIyilestirmeGerekli).length;
  if(maasTalepleri) h += '<button class="buton ikincil" onclick="sozlesmeEkrani()"><span>Ücret iyileştirmesi istiyor</span> (' + maasTalepleri + ')</button>';
  const izlemeUyari=izlemeSozlesmeUyarilari().length;
  if(izlemeUyari) h += '<button class="buton ikincil" onclick="izlemeEkrani()"><span>Takip Edilen Sözleşmeler</span> (' + izlemeUyari + ')</button>';
  if (basinBekliyor()) h += '<button class="buton" onclick="basinEkrani()">Basın Toplantısı</button>';
  if (kariyer.olay) h += '<button class="buton" onclick="olayEkrani()">Takım İçi Olay!</button>';
  if (teklifSayisi() > 0) h += '<button class="buton" onclick="teklifEkrani()"><span>Satın Alma Teklifleri</span> (' + kariyer.teklifler.length + ")</button>";
  return h;
}

// ---------- Ana ekran ----------
function kariyerEkrani() {
  sonHub = null;
  banDurum = null;
  rakipleriBagla();
  oyuncuIsimleriniDuzelt();
  kimyaHazirla();
  tarzlariHazirla();
  stratejiHazirla();
  rolGenSurumunuGuncelle();
  basarimKontrol();
  sezonHazirla();
  haftaOzetBaslat();
  kulupGelisimHazirla();
  kisilikHazirla();
  rekabetHazirla();
  const sira = benimDunyaSirasi();
  let html = '<div class="hero kariyer-hero">' + kulupKimlikRozeti() + '<h1 style="color:' + kariyer.renk + '">' + oyunAdi(kariyer.takimAdi) + "</h1>";
  html += '<div class="alt">' + LIG_ADLARI[kariyer.ligNo - 1] + " · " + (kariyer.galibiyet || 0) + " galibiyet · " + (kariyer.maglubiyet || 0) + " mağlubiyet</div>";
  html += '<div class="metrikler">' + metrik(para(kariyer.butce), "Bütçe", kariyer.butce < 0) + metrik(para(haftalikGider()), "Haftalık gider") + metrik(sira + ". / 100", "Dünya sırası") + metrik(itibarOf(), "İtibar") + "</div></div>";
  html += '<button class="gelisim-ozet-link" onclick="haftalikOzetEkrani()">Haftalık Özet <span>' + (kariyer.sonHaftaOzeti ? "Hafta " + kariyer.sonHaftaOzeti.hafta : "İlk haftanı tamamla") + ' ›</span></button>';
  html += '<button class="gelisim-ozet-link" onclick="sezonHedefEkrani()">Sezon Hedefi <span>' + (kariyer.sezonHedefi.id ? "İlerlemeyi Gör" : "İsteğe bağlı · hedef seç") + ' ›</span></button>';
  html += uyariKutusu();
  html += sezonKutusu().replace('<button class="buton ikincil" onclick="tabloEkrani()">Puan Tablosu</button>', "");
  html += bildirimler();
  const piyasaRozet = sozlesmeUyariSayisi() + teklifSayisi();
  html += '<div class="menu-izgara">';
  html += menuKarti("takim", "Takım", "Kadro, gelişim, personel", "kadroEkrani()");
  html += menuKarti("transfer", "Transfer", "Piyasa ve sözleşmeler", "piyasaMenu()", piyasaRozet > 0 ? piyasaRozet : "");
  html += menuKarti("kulup", "Kulüp", "Finans, sponsor, arşiv", "kulupMenu()");
  html += menuKarti("lig", "Lig ve Turnuva", "Tablo, lig, sıralama", "ligMenu()");
  html += "</div>";
  html += '<button class="buton ikincil" onclick="anaMenu()">Ana Menü</button>';
  html += '<button class="buton ikincil" onclick="rehberMenu()">Rehber</button>';
  html += reklamsizMagazaButonu();
  html += (typeof odulluMoralButonu === "function" ? odulluMoralButonu() : "");
  html += (typeof sesAyarButonlari === "function" ? sesAyarButonlari() : "");
  html += geriBildirimButonu();
  html += gizlilikPolitikasiButonu();
  uygulama.innerHTML = html;
}

// ---------- Takım menüsü (eski Kadro ekranının yerini alır) ----------
function kadroEkrani() {
  const u = stratejiUyumu(kariyer.oyuncular, kariyer.strateji);
  let h = menuSatiri("Takım Kimyası", "Birlikte oynama ve rol uyumu · " + takimKimyasi() + "/100", "kimyaEkrani()");
  h += menuSatiri("Kadro", "İlk 5 · ortalama GEN " + Math.round(ortGuc(kariyer.oyuncular)), "kadroDetay()");
  h += menuSatiri("Strateji Belirle", kariyer.strateji + " · uyum " + u + "/5", "stratejiEkrani()");
  h += menuSatiri("Yedek Kadro", yedekListe().length + "/" + YEDEK_MAX + " oyuncu", "yedekEkrani()");
  h += '<div class="alt-baslik">Gelişim</div>';
  h += menuSatiri("Antrenman Yoğunluğu", antrenmanYogunlugu().ad + " · gelişim ve toparlanma", "antrenmanYogunlukEkrani()");
  h += menuSatiri("Antrenman Odağı", "Oyuncu başına gelişim odağı", "odakEkrani()");
  h += menuSatiri("Harita Antrenmanı", "Odak: " + (kariyer.haritaOdak || "seçilmedi"), "haritaAntrenmanEkrani()", kariyer.haritaOdak ? "" : "!");
  h += menuSatiri("Akademi ve Scout", "Akademi " + (kariyer.akademi || []).length + "/" + akademiKapasitesi() + " · scout seviye " + (kariyer.scout || 0), "akademiEkrani()");
  h += '<div class="alt-baslik">Ekip</div>';
  h += menuSatiri("Personel", "Koç " + personelSeviye("koc") + " · Fizyo " + personelSeviye("fizyo") + " · Analist " + personelSeviye("analist"), "personelEkrani()");
  h += menuSatiri("Oyuncu Kişilikleri", "Mentor, büyük maç ve yedek beklentisi", "kisilikEkrani()");
  h += menuSatiri("İstatistikler", "Sezon ve kariyer", "istatistikEkrani()");
  hubAc("kadroEkrani", "Takım", h);
}

function kadroDetay() {
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Kadro</h2>';
  html += kadroOzet(kariyer.oyuncular, kariyer.strateji) + kimyaKutusu();
  html += '<h2>İlk 5</h2><div class="kadro-kartlar">' + kadroKartlari(kariyer.oyuncular) + '</div>';
  if (yedekListe().length > 0) html += '<h2>Yedekler</h2><div class="kadro-kartlar">' + kadroKartlari(yedekListe()) + '</div>';
  html += '<details class="kadro-detay"><summary>12 özellik tablosu</summary>' + tabloHtml(kariyer.oyuncular) + '</details>';
  html += '<details class="kadro-detay"><summary>Harita puanları</summary>' + haritaTablosu({ oyuncular: kariyer.oyuncular }) + '</details>';
  uygulama.innerHTML = html;
}

function kadroKartlari(oyuncular) {
  return oyuncular.map(function (o) {
    const gerekli = TARZLAR[o.rol] || [];
    const ozellik = gerekli.map(function (z) {
      const deger = o[z];
      const cls = deger >= YESIL_ESIK ? " iyi" : "";
      return '<span class="kadro-ozellik' + cls + '">' + (ODAK_ADLARI[z] || z) + " " + deger + "</span>";
    }).join("");
    return '<article class="kadro-oyuncu"><div class="kadro-oyuncu-ust"><div><b>' + oyunAdi(o.ad) + '</b><small>' + o.rol + ' · ' + o.yas + ' yaş · ' + kisilikOf(o).ad + '</small></div><strong>GEN ' + o.genel + '</strong></div><div class="kadro-form"><span>Moral <b>' + moralOf(o) + '</b></span><span>Yorgunluk <b>' + yorOf(o) + '</b></span></div><div class="kadro-ozellikler">' + ozellik + '</div></article>';
  }).join("");
}

// ---------- Diğer menüler ----------
function piyasaMenu() {
  const yak = sozlesmeUyariSayisi();
  let h = menuSatiri("Transfer Piyasası", "Transfer havuzu · bütçe " + para(kariyer.butce), "transferEkrani()");
  h += menuSatiri("İzleme Listesi", "Takip ve oyuncu karşılaştırması", "izlemeEkrani()", (kariyer.izlemeListesi || []).length || "");
  h += menuSatiri("Sözleşmeler", "Yenileme ve maaşlar", "sozlesmeEkrani()", yak > 0 ? yak : "");
  if (teklifSayisi() > 0) h += menuSatiri("Satın Alma Teklifleri", "Rakip kulüpler teklif yaptı", "teklifEkrani()", kariyer.teklifler.length);
  hubAc("piyasaMenu", "Transfer", h);
}

function kulupMenu() {
  const sp = (kariyer.sponsorlar || []).filter(sponsorAktif).length;
  const bs = BASARIMLAR.filter(function (b) { return (kariyer.basarimlar || {})[b.id]; }).length;
  let h = menuSatiri("Taraftar ve İtibar", "Kulübün sesi · sponsor etkisi", "taraftarEkrani()");
  h += menuSatiri("Haftalık Özet", "Son 8 haftanın raporları", "haftalikOzetEkrani()");
  h += menuSatiri("Finans", "Gelir, gider ve sezon özeti", "ekonomiEkrani()");
  h += menuSatiri("Sponsorlar", "Aktif " + sp + "/" + SPONSOR_MAX + " · haftalık +" + para(sponsorHaftalik()), "sponsorEkrani()");
  h += menuSatiri("Kariyer Arşivi", "Geçmiş sezonlar · başarım " + bs + "/" + BASARIMLAR.length, "arsivEkrani()");
  h += menuSatiri("Kulüp Tarihçesi", "Rekorlar, efsaneler ve sezon rozetleri", "kulupTarihceEkrani()");
  h += menuSatiri("Sezon Hedefi", "İsteğe bağlı · başarısızlık cezası yok", "sezonHedefEkrani()");
  h += menuSatiri("Kayıt Yedeği", "Dosyaya aktar veya yedeği geri yükle", "kayitYedekEkrani()");
  h += menuSatiri("Kulüp Kimliği", "Arma, renk ve forma deseni", "kulupKimlikEkrani()");
  hubAc("kulupMenu", "Kulüp", h);
}

function ligMenu() {
  const davet = TURNUVALAR.filter(function (T) { return turnuvaDurum(T) === "hazir"; }).length;
  let h = menuSatiri("Puan Tablosu", "Lig sıran: " + (siralama().indexOf(0) + 1) + ".", "tabloEkrani()");
  h += menuSatiri("Rekabetler", "Rakip geçmişi ve çekişmeli karşılaşmalar", "rekabetEkrani()");
  h += menuSatiri("Ligler", "5 lig · yükselme ve düşme", "ligEkrani()");
  h += menuSatiri("Turnuvalar", davet > 0 ? "Davetin var!" : "Davetler dünya sıralamana göre", "turnuvaEkrani()", davet > 0 ? davet : "");
  h += menuSatiri("Dünya Sıralaması", "Sıran " + benimDunyaSirasi() + ". / 100", "siralamaEkrani()");
  hubAc("ligMenu", "Lig ve Turnuva", h);
}

// Menüden açılan ekranlarda Geri tuşunu ana ekran yerine o menüye döndürür
let ekranKaydirmaHedefi=null;
function ekraniKonumdaGuncelle(ciz){
  const eski=ekranKaydirmaHedefi,baslangic=uygulama.firstChild,html=uygulama.innerHTML;
  ekranKaydirmaHedefi={x:window.scrollX||0,y:window.scrollY||0};
  try{ciz();}catch(e){ekranKaydirmaHedefi=eski;throw e;}
  if(uygulama.firstChild===baslangic && uygulama.innerHTML===html)ekranKaydirmaHedefi=eski;
}
function geriDuzelt() {
  const konum=ekranKaydirmaHedefi;ekranKaydirmaHedefi=null;
  window.scrollTo(konum?konum.x:0,konum?konum.y:0);
  if (!sonHub) return;
  uygulama.querySelectorAll(".geri").forEach(function (g) {
    if (g.dataset.sabit) return;
    if (g.getAttribute("onclick") === "kariyerEkrani()") g.setAttribute("onclick", sonHub);
  });
}

new MutationObserver(geriDuzelt).observe(uygulama, { childList: true });
