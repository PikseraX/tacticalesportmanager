// ---- Canlı maç ayarları ----
const TAKTIKLER = ["Dengeli", "Agresif", "Temkinli"];
const TAKTIK_ACIKLAMA = {
  "Dengeli": "Dengeli oyun. Rol uyumu gerektirmez.",
  "Agresif": "Hızlı girişler. Giriş ve Yıldız rolleri ister.",
  "Temkinli": "Sabırlı, bölge tutan oyun. Anchor, Lurker ve Destek ister."
};
const TAKTIK_ROLLERI = { "Dengeli": [], "Agresif": ["Giriş", "Yıldız"], "Temkinli": ["Anchor", "Lurker", "Destek"] };
const TAKTIK_DIZILIMI = {
  "Agresif": ["Giriş", "Giriş", "Yıldız", "Sniper", "Lider"],
  "Temkinli": ["Anchor", "Anchor", "Destek", "Lurker", "Taktisyen"]
};
const TAKTIK_USTUNLUK = { "Agresif": "Dengeli", "Dengeli": "Temkinli", "Temkinli": "Agresif" };
const TAKTIK_ROL_BONUSU = 2;
const TAKTIK_USTUN_BONUSU = 6;
const SERI_CEZASI = 6;
const MOLA_BONUSU = 12;
const MOLA_TUR = 3;
const DEGISIM_HAKKI = 2;
const MOLA_HAKKI = 2;

let canli = null;
let canliSeri = null;

function taktikRolBonusu(t, oyuncular) {
  const rl = TAKTIK_ROLLERI[t] || [];
  if (rl.length === 0) return 0;
  const n = oyuncular.filter(function (o) { return rl.indexOf(o.rol) >= 0; }).length;
  return (n - 2) * TAKTIK_ROL_BONUSU;
}

// t taktiği, rakipT karşısında: +6 üstün, -6 zayıf, 0 eşit
function taktikUstunluk(t, rakipT) {
  if (TAKTIK_USTUNLUK[t] === rakipT) return TAKTIK_USTUN_BONUSU;
  if (TAKTIK_USTUNLUK[rakipT] === t) return -TAKTIK_USTUN_BONUSU;
  return 0;
}

function aiIlkTaktik(B) {
  if (B.strateji === "Agresif") return "Agresif";
  if (B.strateji === "Taktiksel" || B.strateji === "Savunma") return "Temkinli";
  return "Dengeli";
}

function aiYariTaktik(c) {
  const fark = c.sb - c.sa;
  if (fark <= -2) return "Agresif";
  if (fark >= 2) return "Temkinli";
  return c.tB;
}

// rakip verilmezse bu haftanın lig rakibi kullanılır. seri verilirse takım ve değişiklik hakkı seriden gelir.
function canliKur(harita, rakip, seri) {
  sezonHazirla();
  let B = rakip;
  if (!B) {
    const sz = kariyer.sezon;
    const m = sz.fikstur[sz.gun].find(function (x) { return x[0] === 0 || x[1] === 0; });
    B = ligTakim(m[0] === 0 ? m[1] : m[0]);
  }
  B.oyuncular.forEach(kisilikAta);
  const A = seri ? seri.A : { ad: kariyer.takimAdi, oyuncular: macKadroKopyala(kariyer.oyuncular), strateji: kariyer.strateji };
  const istA = A.oyuncular.map(function (o) { return { o: o, kill: 0, death: 0 }; });
  const istB = B.oyuncular.map(function (o) { return { o: o, kill: 0, death: 0 }; });
  return {
    harita: harita, A: A, B: B, seri: seri || null,
    hazirlikPlan:"standart", onemliMac:onemliMacMi(B,seri),
    macModu:hizliMacKullanilabilir() && kariyer.macModuTercihi==="hizli"?"hizli":"canli",
    hf: haritaEtkisi({ oyuncular: kariyer.oyuncular }, B, harita),
    sa: 0, sb: 0, istA: istA, istB: istB, aktifA: istA.slice(), aktifB: istB.slice(),
    tA: "Dengeli", tB: aiIlkTaktik(B),
    mola: MOLA_HAKKI, molaB: MOLA_HAKKI, molaTur: 0, molaTurB: 0, serA: 0, serB: 0, seriSoruldu: false,
    yariGecti: false, tarafA: Math.random() < 0.5 ? "CT" : "T", hiz: 1, raundNo: 1,
    ot: false, otA: 0, otB: 0, otN: 0,
    degisimHak: seri ? seri.degisimHak : DEGISIM_HAKKI, olaylar: []
  };
}

function canliP(c) {
  let fark = takimEtkin(c.A.oyuncular, c.A.strateji) - takimEtkin(c.B.oyuncular, c.B.strateji) + c.hf;
  fark += taktikRolBonusu(c.tA, c.A.oyuncular) - taktikRolBonusu(c.tB, c.B.oyuncular) + taktikUstunluk(c.tA, c.tB);
  fark += analistHazirlik();
  fark += hazirlikPlanEtkisi(c) + kisilikMacEtkisi(c);
  if (c.serA >= 3) fark -= SERI_CEZASI;
  if (c.serB >= 3) fark += SERI_CEZASI;
  if (c.molaTur > 0) fark += MOLA_BONUSU;
  if (c.molaTurB > 0) fark -= MOLA_BONUSU;
  return Math.min(0.7, Math.max(0.3, 1 / (1 + Math.exp(-fark / 80))));
}

function canliDevam() {
  if (!canli) return;
  if (!canli.yariGecti && canli.sa + canli.sb >= 12) {
    canli.yariGecti = true;
    canli.tarafA = canli.tarafA === "CT" ? "T" : "CT";
    canli.olaylar.push("Yarı devre skoru: " + canli.sa + "-" + canli.sb);
    canliIzleDurdur();
    yariEkrani();
  } else if (canli.macaBitti || (!canli.ot && (canli.sa >= 13 || canli.sb >= 13))) {
    canliIzleDurdur();
    canliBitir();
  } else if (canli.macModu === "hizli" && !canli.molaAcik) {
    if(!canli.yariGecti) canliDevreyeAtla(); else canliMaciHizliBitir();
  } else {
    canliIzleBaslat();
  }
}

function canliIptal() {
  const seri = canli && canli.seri;
  canliIzleDurdur();
  canli = null;
  canliSeri = null;
  kaydet();
  if (seri) turnuvaDevam(); else kariyerEkrani();
}

function taktikButonlari(fn, acik, rakipT) {
  const c = canli;
  const rt = rakipT || c.tB;
  let h = "";
  TAKTIKLER.forEach(function (t) {
    const rol = taktikRolBonusu(t, c.A.oyuncular);
    if (acik) {
      const ust = taktikUstunluk(t, rt);
      const net = rol + ust;
      const renk = net > 0 ? ' style="border-color:var(--green)"' : (net < 0 ? ' style="border-color:var(--red)"' : "");
      h += '<button class="takim-butonu"' + renk + ' onclick="' + fn + "('" + t + "')\">" +
        '<span style="text-align:left">' + t + "<br><small>" + TAKTIK_ACIKLAMA[t] + "<br>Kadro uyumu " + etkiYazi(rol) + " · Taktik üstünlüğü " + etkiYazi(ust) + "</small></span><span>Net " + etkiYazi(net) + "</span></button>";
    } else {
      h += '<button class="takim-butonu" onclick="' + fn + "('" + t + "')\">" +
        '<span style="text-align:left">' + t + "<br><small>" + TAKTIK_ACIKLAMA[t] + "<br>Kadro uyumu " + etkiYazi(rol) + " · Taktik üstünlüğü ? (Analist gerekli)</small></span><span>Net ?</span></button>";
    }
  });
  return h;
}

function seriKutusu(seri) {
  let h = '<div class="bilgi-kutusu" style="border-color:' + kariyer.renk + '"><b>BO3 Seri: ' + seri.A.ad + " " + seri.mine + " - " + seri.theirs + " " + seri.rakip.ad + "</b><br>Harita " + (seri.idx + 1) + "/3";
  if (seri.hr.length > 0) h += "<br>Oynanan: " + seri.hr.map(function (x) { return x.h + " " + x.m + "-" + x.t; }).join(", ");
  return h + "</div>";
}

// ---------- Lig maçı ----------
// Harita yasaklama bitince burası çağrılır
function canliMacHazirla(harita) {
  sezonHazirla();
  const sz = kariyer.sezon;
  if (sz.bitti || sz.oynandi) { kariyerEkrani(); return; }
  canli = canliKur(harita);
  canliHazirlikEkrani();
}

// ---------- Turnuva serisi ----------
function canliSeriBasla(kalan, banYazi) {
  const tu = kariyer.turnuva;
  if (!tu) { kariyerEkrani(); return; }
  const rakip = turnuvaRakibi(tu);
  if (!rakip) { turnuvaDevam(); return; }
  canliSeri = {
    A: { ad: kariyer.takimAdi, oyuncular: macKadroKopyala(kariyer.oyuncular), strateji: kariyer.strateji },
    rakip: rakip, liste: karistir(kalan), idx: 0, mine: 0, theirs: 0,
    hr: [], notlar: [], degisimHak: DEGISIM_HAKKI, kalan: kalan, banYazi: banYazi
  };
  canli = canliKur(canliSeri.liste[0], rakip, canliSeri);
  canliHazirlikEkrani();
}

function canliSeriSonraki() {
  const seri = canliSeri;
  if (!seri) { kariyerEkrani(); return; }
  canli = canliKur(seri.liste[seri.idx], seri.rakip, seri);
  canliHazirlikEkrani();
}

function canliSeriIsle(seri, s) {
  const kaz = s.sa > s.sb;
  if (kaz) seri.mine++; else seri.theirs++;
  seri.hr.push({ h: s.harita, m: s.sa, t: s.sb });
  seri.istatistik = seri.istatistik || [];
  s.istA.forEach(x => {
    const id = x.o.macKaynakId || x.o.kimlik;
    let kayit = seri.istatistik.find(y => (y.o.macKaynakId || y.o.kimlik) === id);
    if (!kayit) { kayit = {o:x.o,kill:0,death:0}; seri.istatistik.push(kayit); }
    kayit.kill += x.kill; kayit.death += x.death;
  });
  seri.notlar.push(s.harita + ": " + s.not);
  seri.idx++;
  if (seri.mine >= 2 || seri.theirs >= 2) {
    const sonuc = { mine: seri.mine, theirs: seri.theirs, hr: seri.hr, istA: seri.istatistik, not: seri.notlar.join("<br>") };
    canliSeri = null;
    turnuvaTurOyna(seri.kalan, seri.banYazi, sonuc);
    return;
  }
  let html = "<h2>Harita Bitti</h2>";
  html += macDegerlendirmeHtml(s.analiz,false);
  html += '<div class="bilgi-kutusu"><b>' + seri.A.ad + " " + s.sa + " - " + s.sb + " " + seri.rakip.ad + "</b><br>" + s.harita + (kaz ? " · Kazandın" : " · Kaybettin") + "<br>Seri: <b>" + seri.mine + " - " + seri.theirs + "</b></div>";
  html += '<button class="buton" onclick="canliSeriSonraki()">Sonraki Harita: ' + seri.liste[seri.idx] + "</button>";
  uygulama.innerHTML = html;
}

// ---------- Ortak ekranlar ----------
function canliHazirlikEkrani() {
  const c = canli;
  const an = personelSeviye("analist");
  let html = '<button class="geri" onclick="canliIptal()">← Geri</button><h2>Maç Öncesi Taktik</h2>';
  if (c.seri) html += seriKutusu(c.seri);
  html += '<div class="bilgi-kutusu">Rakip: <b>' + c.B.ad + "</b><br>Güç: <b>" + Math.round(ortGuc(c.B.oyuncular)) + "</b>";
  if (an >= 1) html += "<br>Strateji: <b>" + c.B.strateji + "</b><br>Rakibin ilk yarı taktiği: <b>" + c.tB + "</b>";
  else html += "<br>Strateji ve taktik: gizli (Analist gerekli)";
  html += "<br>Harita: <b>" + c.harita + "</b>";
  if (an >= 2) html += " (harita farkı " + etkiYazi(c.hf) + ")";
  if (an >= 3) html += "<br>Analist hazırlığı: <b>+" + analistHazirlik() + " güç</b>";
  html += "</div>";
  html += "<p>İlk yarı için taktik seç." + (an >= 1 ? " Net değer, kadro uyumu ve rakibin taktiğine karşı üstünlüğün toplamıdır." : " Rakibin taktiğini bilmediğin için yalnızca kadro uyumunu görebilirsin.") + "</p>";
  html += taktikButonlari("canliBasla", an >= 1, c.tB);
  uygulama.innerHTML = html;
}

function canliBasla(t) {
  canliTaktikRolleriUygula(canli, t);
  canli.tA = t;
  canli.macEkrani = "canli";
  kaydet();
  canli.olaylar.push("Hazırlık planı: " + (MAC_HAZIRLIK_PLANLARI[canli.hazirlikPlan] || MAC_HAZIRLIK_PLANLARI.standart).ad);
  canli.olaylar.push("İlk yarı taktikleri: sen " + t + ", rakip " + canli.tB);
  canliDevam();
}

function yariEkrani() {
  const c = canli;
  const an = personelSeviye("analist");
  const tahmin = aiYariTaktik(c);
  const rakipT = an >= 3 ? tahmin : c.tB;
  let html = "<h2>Yarı Devre</h2>";
  if (c.seri) html += seriKutusu(c.seri);
  html += '<div class="bilgi-kutusu"><b>' + c.A.ad + " " + c.sa + " - " + c.sb + " " + c.B.ad + "</b><br>Harita: <b>" + c.harita + "</b><br>Taktikler: sen <b>" + c.tA + "</b> · rakip <b>" + c.tB + "</b><br>Mola hakkın: <b>" + c.mola + "</b><br>Oyuncu değişikliği hakkın: <b>" + c.degisimHak + "</b></div>";
  html += istTablo(c.A.ad, c.aktifA) + istTablo(c.B.ad, c.aktifB);
  if (an >= 3) {
    html += '<div class="bilgi-kutusu" style="border-color:var(--green)">Analist: rakip ikinci yarıda <b>' + tahmin + "</b> oynayacak" + (tahmin !== c.tB ? " (taktik değiştiriyor)" : " (taktik değişmiyor)") + ".</div>";
  } else {
    html += "<p>Rakip ikinci yarıda taktik değiştirebilir. Aşağıdaki değerler rakibin ilk yarı taktiğine göre hesaplandı. Analist seviye 3 rakibin ikinci yarı taktiğini önceden gösterir.</p>";
  }
  html += '<button class="buton" onclick="canliMaciHizliBitir()">Maçı Bitir · 2. yarıyı simüle et</button>';
  if (c.degisimHak > 0 && yedekListe().length > 0) {
    html += '<button class="buton ikincil" onclick="degisimEkrani()">Oyuncu Değişikliği</button>';
  }
  html += "<h2>İkinci Yarı Taktiği</h2>" + taktikButonlari("canliYariDevam", an >= 3, rakipT);
  uygulama.innerHTML = html;
}

function canliMaciHizliBitir() {
  const c = canli;
  if (!c || !c.yariGecti) return;
  c.macEkrani="canli";
  macIzleDurdur();
  const oncekiTaktik = c.tA;
  c.tB = aiYariTaktik(c);
  c.olaylar.push("İkinci yarı hızlı simüle edildi: sen " + c.tA + ", rakip " + c.tB + ".");
  let guvenlik = 0;
  c.hizliSimulasyon = true;
  while (!c.macaBitti && (c.ot || (c.sa < 13 && c.sb < 13)) && guvenlik++ < 60) {
    if (!c.raundPlan) macIzleRaundHazirla(c);
    while (c.raundPlan && c.raundPlan.index < c.raundPlan.olaylar.length) {
      macIzleOlayUygula(c, c.raundPlan.olaylar[c.raundPlan.index++], false);
    }
    macIzleRaundBitir(c);
  }
  c.hizliSimulasyon = false;
  c.tA = oncekiTaktik;
  if (c.ot ? !c.macaBitti : (c.sa < 13 && c.sb < 13)) { c.macModu="canli";c.olaylar.push("Uzatma sürüyor; canlı akışa dönüldü.");kaydet(); canliDevam(); return; }
  canliBitir();
}

function canliYariDevam(t) {
  const c = canli;
  const ai = aiYariTaktik(c);
  canliTaktikRolleriUygula(c, t);
  c.olaylar.push("İkinci yarı taktikleri: sen " + t + ", rakip " + ai);
  c.tA = t;
  c.tB = ai;
  c.macEkrani = "canli";
  kaydet();
  canliDevam();
}

function seriEkrani() {
  const c = canli;
  c.seriSoruldu = true;
  let html = "<h2>Kritik An</h2>";
  html += '<div class="bilgi-kutusu"><b>' + c.A.ad + " " + c.sa + " - " + c.sb + " " + c.B.ad + "</b><br>Takımın üst üste " + c.serA + " round kaybetti. Seri kaybeden takım -" + SERI_CEZASI + " güç cezası alır.<br>Mola seriyi sıfırlar ve sonraki " + MOLA_TUR + " round'a +" + MOLA_BONUSU + " verir.</div>";
  html += '<button class="buton" onclick="canliMola()">Mola Al (kalan ' + c.mola + ")</button>";
  html += '<button class="buton ikincil" onclick="canliDevam()">Devam Et</button>';
  uygulama.innerHTML = html;
}

function canliMola() {
  const c = canli;
  if (!c || c.mola <= 0 || c.molaAcik) return;
  canliIzleDurdur();
  c.mola--;
  c.serA = 0;
  c.molaTur = MOLA_TUR;
  c.molaAcik = true;
  kaydet();
  c.olaylar.push("Takım molası (" + c.sa + "-" + c.sb + ")");
  canliIzleEkrani();
}

function canliMolaDevam() {
  if (!canli) return;
  canli.molaAcik = false;
  kaydet();
  canliIzleBaslat();
}

function canliTaktikRolleriUygula(c, taktik) {
  const roller = taktik === "Dengeli" ? (STRATEJILER[c.A.strateji] || STRATEJILER.Dengeli) : TAKTIK_DIZILIMI[taktik];
  if (roller) rolDagiliminiUygula(c.A.oyuncular, roller);
}

function degisimEkrani() {
  const c = canli;
  let html = '<button class="geri" onclick="yariEkrani()">← Geri</button><h2>Oyuncu Değişikliği</h2>';
  html += "<p>Kalan hak: <b>" + c.degisimHak + "</b>. " + (c.seri ? "Değişiklik serinin geri kalanında geçerlidir." : "Değişiklik yalnızca bu maç için geçerlidir.") + " Çıkacak oyuncuyu seç:</p>";
  c.A.oyuncular.forEach(function (o, k) {
    html += '<button class="takim-butonu" onclick="degisimYedekSec(' + k + ')"><span>' + o.ad + " (" + o.rol + ")</span><span>GEN " + o.genel + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function degisimYedekSec(k) {
  const c = canli;
  const cikan = c.A.oyuncular[k];
  let html = '<button class="geri" onclick="degisimEkrani()">← Geri</button><h2>' + cikan.ad + " yerine kim girsin?</h2>";
  let bulundu = false;
  yedekListe().forEach(function (o, j) {
    if (c.A.oyuncular.some(x => macKaynakOyuncu(x) === o)) return;
    bulundu = true;
    html += '<button class="takim-butonu" onclick="degisimYap(' + k + ", " + j + ')"><span>' + o.ad + " (" + o.rol + ")</span><span>GEN " + o.genel + "</span></button>";
  });
  if (!bulundu) html += "<p>Girebilecek yedek yok.</p>";
  uygulama.innerHTML = html;
}

function degisimYap(k, j) {
  const c = canli;
  const giren = macOyuncuKopyala(yedekListe()[j]);
  const cikan = c.A.oyuncular[k];
  c.A.oyuncular[k] = giren;
  canliTaktikRolleriUygula(c, c.tA);
  const yeni = { o: giren, kill: 0, death: 0 };
  c.istA.push(yeni);
  c.aktifA[k] = yeni;
  c.degisimHak--;
  kaydet();
  c.olaylar.push("Değişiklik: " + cikan.ad + " çıktı, " + giren.ad + " girdi");
  yariEkrani();
}

function canliBitir() {
  const c = canli;
  if (!c || c.sa === c.sb || (c.ot ? !c.macaBitti : (c.sa < 13 && c.sb < 13))) return;
  canliIzleDurdur();
  const gelisim = haritaMacGelisimi(c.harita);
  if (gelisim) c.olaylar.push("Harita " + c.harita + " maç pratiğiyle gelişti: " + gelisim.once + " → " + gelisim.sonra + ".");
  const s = { sa: c.sa, sb: c.sb, istA: c.istA, istB: c.istB, uzatma: c.ot, harita: c.harita, not: c.olaylar.join("<br>") };
  s.hazirlikPlan=c.hazirlikPlan || "standart";
  s.analiz=macDegerlendirme(c);
  kariyer.sonMacDegerlendirme=s.analiz;
  canli = null;
  if (c.seri) {
    c.seri.degisimHak = c.degisimHak;
    canliSeriIsle(c.seri, s);
  } else {
    sezonMaciBitir(s);
  }
}
