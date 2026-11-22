const MAAS_AYARLARI = { katsayi:0.60, yildizEsigi:75, yildizArtisi:0.013, farkEsigi:0.75, iyilestirmeTabani:0.75 };
const MAAS_DENGE_SURUMU = 2;
const MAAS_REHBERI = "Maaşı emsalin %75’inin altında kalan oyuncu zam ister ve her hafta moral kaybeder. Talep karşılanmazsa sözleşmesi bitince ayrılır. Sözleşme süresince maaşı iyileştirebilirsin. Normal yenileme zammı %15’tir; emsal maaş en güçlü rolün GEN’ine göre hesaplanır.";
// Ücret, geçici olarak düşük GEN veren bir role geçilerek düşürülemez.
function maasGeneli(o) {
  if (!OZELLIKLER.every(z => Number.isFinite(o[z]))) return o.genel;
  return Math.max(o.genel, ...Object.keys(ROL_GEN_AGIRLIKLARI).map(rol => rolGenelPuani(o,rol)));
}
function formulMaas(o) {
  const gen = maasGeneli(o), yildiz = 1 + Math.max(0,gen-MAAS_AYARLARI.yildizEsigi)*MAAS_AYARLARI.yildizArtisi;
  return Math.round(gen*gen*MAAS_AYARLARI.katsayi*yildiz);
}
function temelMaas(o) { return o.maas !== undefined ? o.maas : formulMaas(o); }
function maasTalebiHedefi(o) {
  const kilitli = Number.isFinite(o.maasTalebi?.taban) ? Math.max(0,o.maasTalebi.taban) : 0;
  return Math.max(Math.ceil(formulMaas(o)*MAAS_AYARLARI.iyilestirmeTabani),kilitli);
}
function maasIyilestirmeGerekli(o) {
  const kilitli=Number.isFinite(o.maasTalebi?.taban)?Math.max(0,o.maasTalebi.taban):0;
  return temelMaas(o)<Math.max(Math.ceil(formulMaas(o)*MAAS_AYARLARI.farkEsigi),kilitli);
}
function maasTalebiniTakipEt(o) {
  if (maasIyilestirmeGerekli(o)) {
    const hedef=maasTalebiHedefi(o);
    if (o.maasTalebi?.taban!==hedef) { o.maasTalebi={taban:hedef}; return true; }
  } else if (o.maasTalebi) { delete o.maasTalebi; return true; }
  return false;
}
function yenilemeMaasi(o) {
  const piyasa=formulMaas(o), normal=Math.min(temelMaas(o)*1.15,piyasa*1.20);
  return Math.round(maasIyilestirmeGerekli(o) ? Math.max(normal,maasTalebiHedefi(o)) : normal);
}
function maasIyilestirmeTutari(o) { return maasTalebiHedefi(o); }
function maasIyilestir(i) {
  const o=tumKadro()[i];
  if (!o || !maasIyilestirmeGerekli(o) || sozlesmeBitti(o)) return;
  const yeni=maasIyilestirmeTutari(o);
  if (!confirm(o.ad + ": " + para(temelMaas(o)) + " → " + para(yeni) + "/hafta. Maaş iyileştirilsin mi?")) return;
  o.maas=yeni; delete o.maasTalebi; kaydet(); sozlesmeEkrani();
}
function yenilemeUcreti(o) { return Math.round(Math.min(temelMaas(o), formulMaas(o) * 1.20) * 4); }

function sozlesmeHazirla() {
  const h = kariyer.hafta || 1;
  tumKadro().forEach(function (o) {
    if (o.bitis === undefined) o.bitis = h + 20;
  });
}

function sozlesmeBitti(o) {
  return (kariyer.hafta || 1) > o.bitis;
}

function maas(o) {
  const baz = temelMaas(o);
  return sozlesmeBitti(o) ? Math.round(baz * 1.25) : baz;
}

function haftalikGider() {
  let t = kariyer.oyuncular.reduce(function (s, o) { return s + maas(o); }, 0);
  yedekListe().forEach(function (o) { t += Math.round(maas(o) * YEDEK_MAAS_ORANI); });
  return t + akademiGideri() + personelGideri();
}

function maasKutusu() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  let h = '<div class="bilgi-kutusu">Hafta: <b>' + hf + "</b><br>Haftalık maaş gideri: <b>" + para(haftalikGider()) + "</b>";
  if (kariyer.butce < 0) {
    h += '<br><span style="color:var(--red)">Bütçe eksi! Transfer yapamazsın.</span>';
  }
  tumKadro().filter(maasIyilestirmeGerekli).forEach(function(o) {
    h += '<br><span data-ceviri-isim-on-eki="'+oyunYazisi(o.ad)+'">'+oyunYazisi(o.ad)+'</span>: <b>Ücret iyileştirmesi istiyor</b>';
  });
  tumKadro().filter(sozlesmeBitti).forEach(function (o) {
    const ek = maasIyilestirmeGerekli(o) ? 0 : SOZLESME_EK_HAFTA;
    const kaldi = Math.max(1, o.bitis + ek + 1 - hf);
    h += "<br><span style=\"color:var(--red)\" data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + ": sözleşmesi bitti, " + kaldi + " hafta içinde ayrılır (maaş %25 zamlı).</span>";
  });
  const yaklasan = tumKadro().filter(function (o) {
    const kalan = o.bitis - hf + 1;
    return kalan > 0 && kalan <= SOZLESME_UYARI_HAFTA;
  }).map(function (o) { return o.ad + " (" + (o.bitis - hf + 1) + " hf)"; });
  if (yaklasan.length > 0) {
    h += '<br><span style="color:var(--accent)"><span>Sözleşmesi yaklaşan</span>: ' + yaklasan.join(", ") + "</span>";
  }
  return h + "</div>";
}

function haftaGec() {
  if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri)) { macDevamEkrani(); return; }
  sezonHazirla();
  const sz = kariyer.sezon;
  const ligHaftasi = sz.hf % 2 === 0;
  if (!sz.bitti) {
    if (ligHaftasi && !sz.oynandi) { alert("Önce bu haftanın lig maçını oyna."); return; }
    const tu = kariyer.turnuva;
    if (!ligHaftasi && tu && tu.sezon === sz.no && tu.sonHafta !== kariyer.hafta) { alert("Önce bu haftanın turnuva maçını oyna."); return; }
  }
  haftaOzetBaslat();
  const g = haftalikGider();
  const sp = sponsorGeliri();
  if (!confirm("Hafta bitecek. Maaş: -" + para(g) + ", sponsor: +" + para(sp) + ". Onaylıyor musun?")) return;
  kariyer.butce += sp - g;
  maliIsle("gelir", "sponsor", sp);
  maliIsle("gider", "maas", g - personelGideri() - akademiGideri());
  maliIsle("gider", "akademi", akademiGideri());
  maliIsle("gider", "personel", personelGideri());
  let faiz = 0;
  if (kariyer.butce < 0) {
    faiz = Math.round(-kariyer.butce * BORC_FAIZ);
    kariyer.butce -= faiz;
    maliIsle("gider", "faiz", faiz);
  }
  kariyer.hafta = (kariyer.hafta || 1) + 1;
  if (!sz.bitti) {
    sz.oynandi = false;
    sz.hf++;
    sz.gun = Math.floor(sz.hf / 2);
    if (sz.hf >= sz.fikstur.length * 2) sz.bitti = true;
  }
  const rapor = antrenmanUygula();
  kimyaHaftalik(rapor);
  haritaAntrenmaniUygula(rapor);
  akademiHaftalik(rapor);
  formHaftalik(rapor);
  sozlesmeKontrol(rapor);
  olayHaftalik(rapor);
  izlemeHaftalik(rapor);
  rekabetHaftalik(rapor);
  const yasArtti = yasKontrol();
  haftaOzetKaydet(rapor, g, sp, faiz);
  kaydet();
  haftaRaporu(g, rapor, yasArtti, sp, faiz);
}

function sozlesmeEkrani() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Sözleşmeler</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Hafta: <b>" + hf + "</b><br>Yenileme: +26 hafta. Ücret 4 haftalık maaş; ücret ve yeni maaş güncel piyasa değerine göre sınırlandırılır.<br>" + "Zam talebi karşılanmazsa oyuncu sözleşme bitiminde ayrılır; diğer oyuncular için " + SOZLESME_EK_HAFTA + " hafta ek süre vardır. Morali 40'ın altındaki oyuncu yenilemeyi reddeder.</div>";
  html += '<p class="gelisim-ipucu">' + MAAS_REHBERI + '</p>';
  tumKadro().forEach(function (o, i) {
    const kalan = o.bitis - hf + 1;
    const ek = maasIyilestirmeGerekli(o) ? 0 : SOZLESME_EK_HAFTA;
    const durum = kalan > 0 ? kalan + " hafta kaldı" : "SÖZLEŞME BİTTİ (" + Math.max(1, o.bitis + ek + 1 - hf) + " hf içinde ayrılır)";
    const renk = kalan > 0 ? (kalan <= SOZLESME_UYARI_HAFTA ? ' style="border-color:var(--accent)"' : "") : ' style="border-color:var(--red)"';
    const yedek = i >= kariyer.oyuncular.length ? " · Yedek" : "";
    const iyilestirme = maasIyilestirmeGerekli(o);
    html += '<button class="takim-butonu"' + renk + ' onclick="sozlesmeYenile(' + i + ")\"><span style=\"text-align:left\" data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (" + durum + ")<br>Yaş " + o.yas + " · GEN " + o.genel + " · " + tarzYazi(o) + yedek + "<br>Moral " + moralOf(o) + " · Maaş: " + para(temelMaas(o)) + '<br><small>Ücret GEN’i</small>: ' + maasGeneli(o) + '<br><small>Emsal maaş</small>: ' + para(formulMaas(o)) + '<br><small>Yeni maaş</small>: <b>' + para(yenilemeMaasi(o)) + '</b>' + (iyilestirme ? '<br><strong style="color:var(--accent)">Ücret iyileştirmesi istiyor</strong>' : '') + "</span><span>Ücret: " + para(yenilemeUcreti(o)) + "</span></button>";
    if (iyilestirme && !sozlesmeBitti(o)) html += '<button class="buton ikincil" onclick="maasIyilestir('+i+')"><span>Maaşı iyileştir</span> · '+para(maasIyilestirmeTutari(o))+'/hafta</button>';
  });
  uygulama.innerHTML = html;
}

function sozlesmeYenile(i) {
  const o = tumKadro()[i];
  if (moralOf(o) < 40) {
    alert(o.ad + " yenilemeyi reddetti (moral " + moralOf(o) + "). Morali 40'ın üstüne çıkana kadar sözleşme yenilemez.");
    return;
  }
  const baz = temelMaas(o);
  const ucret = yenilemeUcreti(o);
  const yeniMaas = yenilemeMaasi(o);
  if (kariyer.butce - ucret < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm(o.ad + " için " + para(ucret) + " ödenecek. Maaşı " + para(baz) + " → " + para(yeniMaas) + " olacak, sözleşme 26 hafta uzayacak. Onaylıyor musun?")) return;
  kariyer.butce -= ucret;
  maliIsle("gider", "yenileme", ucret);
  o.maas = yeniMaas;
  delete o.maasTalebi;
  o.mor = sinir100(moralOf(o) + 10);
  const h = kariyer.hafta || 1;
  o.bitis = Math.max(o.bitis, h) + 26;
  kaydet();
  sozlesmeEkrani();
}
