function akademiKapasitesi() { return 2 * Math.max(0, Math.min(3, Math.floor(Number(kariyer.scout) || 0))); }
const AKADEMI_IMZA = 10000;
const AKADEMI_MAAS = 500;
const SCOUT_MAAS = 1000;
const SCOUT_MALIYET = [0, 30000, 80000, 200000]; // hedef seviye
const SCOUT_BELIRSIZLIK = [0, 14, 8, 3];
const AKADEMI_GELISIM_REHBERI = "Akademide gençler takımın GEN ortalamasına kadar hızlı gelişir. Ortalamayı aştıkça mentorluk desteği kademeli azalır; potansiyele yaklaştıkça gelişim de yavaşlar. Koç ve rolün ana özellikleri gelişimi destekler. Potansiyel sınırı aşılmaz.";

function akademiHazirla() {
  let d = false;
  if (!kariyer.akademi) { kariyer.akademi = []; d = true; }
  if (kariyer.scout === undefined) { kariyer.scout = 0; d = true; }
  if (!kariyer.adaylar) { kariyer.adaylar = []; d = true; }
  if (kariyer.scoutAdaySurum !== 2) {
    // Önceki sürümün görevsiz önerilerini kaldır; imzalanmış akademi oyuncuları korunur.
    kariyer.adaylar = kariyer.adaylar.filter(o => !!o.bolge);
    kariyer.scoutAdaySurum = 2; d = true;
  }
  if (d) kaydet();
}

function akademiGideri() {
  return (kariyer.akademi || []).length * AKADEMI_MAAS + (kariyer.scout || 0) * SCOUT_MAAS;
}

function scoutPotansiyeli(seviye) {
  const s = Math.max(1, Math.min(3, Number(seviye) || 1));
  const esikler = [{ elit:.05, iyi:.19 }, { elit:.10, iyi:.33 }, { elit:.15, iyi:.49 }][s-1];
  const r = Math.random();
  if (r < esikler.elit) return Math.random() < .1 ? 90 + Math.floor(Math.random()*6) : 80 + Math.floor(Math.random()*10);
  return r < esikler.iyi ? 65 + Math.floor(Math.random()*15) : 45 + Math.floor(Math.random()*20);
}
function adayUret(kullanilan) {
  const pot = scoutPotansiyeli(kariyer.scout);
  const g = 28 + Math.random() * 12;
  const o = { ad: yeniAd(kullanilan), rol: TARZ_LISTESI[Math.floor(Math.random() * TARZ_LISTESI.length)], yas: 16 + Math.floor(Math.random() * 3), pot: pot };
  rolProfiliUret(o,g);
  const w = SCOUT_BELIRSIZLIK[kariyer.scout];
  const lo = Math.max(1, Math.round(pot - Math.random() * w));
  o.tahmin = [lo, Math.min(99, lo + w)];
  return o;
}

// Gençler kendi rollerinde, ana kadronun gerisindeyken daha hızlı yetişir.
// Bu destek potansiyeli, scout bulma oranlarını veya ana kadronun özelliklerini değiştirmez.
function akademiGelisimSansi(o,z) {
  const kadro=kariyer.oyuncular||[], ort=kadro.length?ortGuc(kadro):o.genel;
  const yetisme=Math.min(0.20,Math.max(0,ort-o.genel)/100);
  const ana=(TARZLAR[o.rol]||[]).includes(z), yas=o.yas<=20?1:o.yas<=23?0.85:0.65;
  const mentor=1/(1+Math.max(0,o.genel-ort)/10);
  const kalan=Math.max(0,o.pot-o.genel), potansiyel=kalan<=0?0:0.30+0.70*Math.min(1,kalan/12);
  return Math.min(0.90,(ana?0.65:0.40)+yetisme+personelSeviye("koc")*0.025)*yas*mentor*potansiyel;
}

// Hafta sonunda: akademi gelişimi ve aday yenileme (haftaGec içinden çağrılır)
function akademiHaftalik(rapor) {
  (kariyer.akademi || []).forEach(function (o) {
    const once = o.genel;
    if (o.genel < o.pot) {
      const ort=kariyer.oyuncular.length?ortGuc(kariyer.oyuncular):o.genel;
      const tekrar=o.yas<=20 && ort-o.genel>=15 ? 2 : 1;
      for (let tur=0;tur<tekrar;tur++) OZELLIKLER.forEach(function (z) {
        if (o.genel < o.pot && Math.random() < akademiGelisimSansi(o,z)) {
          o[z] = Math.min(99,o[z]+1); genelHesapla(o);
        }
      });
    }
    if (o.genel !== once) rapor.push("Akademi " + o.ad + ": " + once + " → " + o.genel);
  });
  scoutGorevHaftalik(rapor);
}

function tahminYazi(o) {
  return o.tahmin ? o.tahmin[0] + " - " + o.tahmin[1] : "bilinmiyor";
}

function akademiEkrani() {
  akademiHazirla();
  const a = kariyer.akademi;
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Akademi ve Scout</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Akademi: <b>" + a.length + "/" + akademiKapasitesi() + "</b> (haftalık " + para(a.length * AKADEMI_MAAS) + ")<br>Scout seviyesi: <b>" + (kariyer.scout || "yok") + "</b>" + (kariyer.scout ? " (haftalık " + para(kariyer.scout * SCOUT_MAAS) + ")" : "") + "<br>Yedek kadro: <b>" + yedekListe().length + "/" + YEDEK_MAX + "</b></div>";
  if (kariyer.scout < 3) {
    const hedef = kariyer.scout + 1;
    html += '<button class="buton" onclick="scoutYukselt()">' + (kariyer.scout === 0 ? "Scout İşe Al" : "Scout Seviyesini Yükselt (" + hedef + ")") + ": " + para(SCOUT_MALIYET[hedef]) + "</button>";
  }
  html += '<p>Akademi kapasitesi scout seviyesine göre 2 / 4 / 6 oyuncudur. Her keşif görevi 1–2 aday getirir.</p>';
  html += '<p class="gelisim-ipucu">' + AKADEMI_GELISIM_REHBERI + '</p>';
  html += "<h2>Akademi Oyuncuları</h2>";
  if (a.length === 0) html += "<p>Akademide oyuncu yok.</p>";
  a.forEach(function (o, i) {
    html += '<button class="takim-butonu" onclick="akademiOyuncu(' + i + ")\"><span style=\"text-align:left\" data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (" + o.rol + ", " + o.yas + ")<br><small>Potansiyel tahmini: " + tahminYazi(o) + "</small></span><span>GEN " + o.genel + "</span></button>";
  });
  html += "<h2>Scout Adayları</h2>" + scoutGorevKutusu();
  html += '<button class="buton ikincil" onclick="scoutBolgeEkrani()">Scout' + "’" + 'u Bölgeye Gönder</button>';
  if (!kariyer.scout) {
    html += "<p>Aday görmek için scout işe al. Scout’u bir bölgeye göndermeden aday önerilmez.</p>";
  } else {
    if (!kariyer.adaylar.length) html += "<p>Henüz keşfedilmiş aday yok. Scout’u bir bölgeye gönder.</p>";
    (kariyer.adaylar || []).forEach(function (o, i) {
      html += '<button class="takim-butonu" onclick="adayGoster(' + i + ")\"><span style=\"text-align:left\" data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (" + o.rol + ", " + o.yas + ")<br><small>Potansiyel tahmini: " + tahminYazi(o) + "</small></span><span>GEN " + o.genel + "</span></button>";
    });
  }
  uygulama.innerHTML = html;
}

function scoutYukselt() {
  const hedef = (kariyer.scout || 0) + 1;
  if (hedef > 3) return;
  const m = SCOUT_MALIYET[hedef];
  if (kariyer.butce - m < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm("Scout seviyesi " + hedef + " olacak: " + para(m) + ". Haftalık scout maaşı " + para(hedef * SCOUT_MAAS) + " olur. Onaylıyor musun?")) return;
  kariyer.butce -= m;
  maliIsle("gider", "akademi", m);
  kariyer.scout = hedef;
  kaydet();
  akademiEkrani();
}

function adayGoster(i) {
  const o = kariyer.adaylar[i];
  if (!o) { akademiEkrani(); return; }
  let html = '<button class="geri" onclick="akademiEkrani()">← Geri</button><h2>' + oyunAdi(o.ad) + "</h2>";
  html += tabloHtml([o]) + (o.bolge ? '<div class="gelisim-ipucu">Keşif bölgesi: ' + oyunYazisi(o.bolge) + '</div>' : "");
  html += '<div class="bilgi-kutusu">Potansiyel tahmini: <b>' + tahminYazi(o) + "</b><br>İmza ücreti: <b>" + para(AKADEMI_IMZA) + "</b><br>Akademi maaşı: <b>" + para(AKADEMI_MAAS) + "</b>/hafta</div>";
  html += '<button class="buton" onclick="adayAl(' + i + ')">Akademiye Al</button>';
  uygulama.innerHTML = html;
}

function adayAl(i) {
  akademiHazirla();
  const aday = kariyer.adaylar[i];
  if (!aday || !aday.bolge) return;
  if (kariyer.akademi.length >= akademiKapasitesi()) { alert("Akademi dolu. Önce birini yükselt veya serbest bırak."); return; }
  if (kariyer.butce - AKADEMI_IMZA < 0) { alert("Bütçen yetersiz."); return; }
  const o = kariyer.adaylar[i];
  if (!confirm(o.ad + " akademiye alınacak: " + para(AKADEMI_IMZA) + ". Onaylıyor musun?")) return;
  kariyer.butce -= AKADEMI_IMZA;
  maliIsle("gider", "akademi", AKADEMI_IMZA);
  kariyer.akademi.push(o);
  kariyer.adaylar.splice(i, 1);
  kaydet();
  akademiEkrani();
}

function akademiOyuncu(i) {
  const o = kariyer.akademi[i];
  if (!o) { akademiEkrani(); return; }
  let html = '<button class="geri" onclick="akademiEkrani()">← Geri</button><h2>' + oyunAdi(o.ad) + "</h2>";
  html += tabloHtml([o]);
  html += '<div class="bilgi-kutusu">Potansiyel tahmini: <b>' + tahminYazi(o) + "</b><br>" + (o.genel >= o.pot ? "Potansiyeline ulaştı, artık gelişmez." : "Akademide haftalık gelişiyor.") + "</div>";
  html += '<button class="buton" onclick="akademiYukselt(' + i + ')">Yedek Kadroya Yükselt</button>';
  html += '<button class="buton tehlike" onclick="akademiCikar(' + i + ')">Serbest Bırak</button>';
  uygulama.innerHTML = html;
}

function akademiYukselt(i) {
  if (yedekListe().length >= YEDEK_MAX) { alert("Yedek kadro dolu. Önce bir yedeği sat veya ilk 5'e al."); return; }
  const o = kariyer.akademi[i];
  if (!o) { akademiEkrani(); return; }
  if (!confirm(o.ad + " yedek kadroya yükseltilecek. Onaylıyor musun?")) return;
  kariyer.akademi.splice(i, 1);
  o.bitis = (kariyer.hafta || 1) + 30;
  delete o.tahmin;
  yedekListe().push(o);
  kulupGelisimHazirla();
  if(kariyer.sezonHedefi.id === "akademi" && !kariyer.sezonHedefi.sonuclandi) kariyer.sezonHedefi.akademi++;
  kaydet();
  akademiEkrani();
}

function akademiCikar(i) {
  const o = kariyer.akademi[i];
  if (!o) { akademiEkrani(); return; }
  if (!confirm(o.ad + " serbest bırakılacak, geri ödeme yok. Onaylıyor musun?")) return;
  kariyer.akademi.splice(i, 1);
  kaydet();
  akademiEkrani();
}
