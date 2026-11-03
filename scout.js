const SCOUT_BOLGELER = [
  { id:"yerel", ad:"Türkiye ve Balkanlar", sure:2, ucret:12000, roller:["Lider","Destek"], bilgi:"İletişim ve takım oyunu odaklı yetenekler." },
  { id:"kuzey", ad:"Kuzey Avrupa", sure:3, ucret:18000, roller:["Sniper","Anchor"], bilgi:"Pozisyon ve istikrar odaklı yetenekler." },
  { id:"dogu", ad:"Doğu Avrupa", sure:3, ucret:18000, roller:["Yıldız","Giriş"], bilgi:"Nişan ve refleks odaklı yetenekler." },
  { id:"dunya", ad:"Uluslararası Kamp", sure:4, ucret:24000, roller:TARZ_LISTESI, bilgi:"Geniş rol havuzu; daha uzun bir keşif gezisi." }
];
function scoutGorevBaslat(id) {
  akademiHazirla();
  const b = SCOUT_BOLGELER.find(x => x.id === id);
  if (!b || !kariyer.scout || kariyer.scoutGorevi) return;
  if (kariyer.butce < b.ucret) { alert("Keşif bütçen yetersiz."); return; }
  if (!confirm(b.ad + ": " + b.sure + " hafta, " + para(b.ucret) + ". Scout gönderilsin mi?")) return;
  kariyer.butce -= b.ucret; maliIsle("gider","akademi",b.ucret);
  kariyer.scoutGorevi = { bolge:id, baslangic:kariyer.hafta, donus:kariyer.hafta+b.sure };
  kaydet(); scoutBolgeEkrani();
}
function bolgeselAday(b, kullanilan) {
  const o = adayUret(kullanilan);
  const hedef=o.genel;
  o.rol = b.roller[Math.floor(Math.random()*b.roller.length)];
  rolProfiliUret(o,hedef);
  o.bolge = b.ad;
  // GEN yeni role göre hesaplanır, gerçek potansiyel gösterilmez.
  genelHesapla(o); oyuncuKimligi(o);
  return o;
}
function scoutGorevHaftalik(rapor) {
  const g = kariyer.scoutGorevi;
  if (!g || kariyer.hafta < g.donus) return;
  const b = SCOUT_BOLGELER.find(x => x.id === g.bolge);
  if (!b) { kariyer.scoutGorevi = null; return; }
  const ikinciAdaySans = [0,.25,.50,.75][Math.max(1,Math.min(3,kariyer.scout))];
  const sayi = Math.random() < ikinciAdaySans ? 2 : 1;
  const kullanilan = kullanilanAdlar();
  const bulunan = Array.from({length:sayi},()=>bolgeselAday(b,kullanilan));
  kariyer.adaylar = (kariyer.adaylar || []).concat(bulunan).slice(-10);
  kariyer.scoutSonRapor = { hafta:kariyer.hafta, bolge:b.ad, sayi:bulunan.length };
  kariyer.scoutGorevi = null;
  rapor.push("Scout " + b.ad + " gezisinden " + bulunan.length + " adayla döndü. Akademide inceleyebilirsin.");
}
function scoutGorevKutusu() {
  if (!kariyer.scout) return "";
  const g = kariyer.scoutGorevi;
  if (!g) return '<div class="gelisim-ipucu">Scout boşta. Yeni yetenekler için bir bölgeye gönder.</div>';
  const b = SCOUT_BOLGELER.find(x=>x.id===g.bolge);
  return '<div class="gelisim-ipucu"><b>' + (b ? b.ad : "Keşif") + '</b><br>Dönüşe ' + Math.max(0,g.donus-kariyer.hafta) + ' hafta kaldı.</div>';
}
function scoutBolgeEkrani() {
  akademiHazirla();
  let h = '<button class="geri" onclick="akademiEkrani()">← Akademi</button><h2>Yetenek Keşfi</h2><p>Adaylar yalnızca tamamlanan keşif görevlerinden gelir. Scout seviyesi yükseldikçe güçlü yetenek bulma şansı artar ve potansiyel tahmini daralır.</p>';
  if (!kariyer.scout) h += '<div class="bilgi-kutusu">Önce akademi ekranından scout işe al.</div>';
  h += scoutGorevKutusu();
  SCOUT_BOLGELER.forEach(b => {
    h += '<section class="gelisim-kart"><small>KEŞİF BÖLGESİ</small><h3>' + b.ad + '</h3><p>' + b.bilgi + '</p><p>' + b.sure + ' hafta · ' + para(b.ucret) + '</p><button class="buton ikincil"' + ((!kariyer.scout || kariyer.scoutGorevi) ? ' disabled' : '') + ' onclick="scoutGorevBaslat(\'' + b.id + '\')">Scout Gönder</button></section>';
  });
  uygulama.innerHTML = h;
}
