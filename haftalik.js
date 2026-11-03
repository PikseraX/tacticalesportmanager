function haftaOzetBaslat() {
  kimyaHazirla(); taraftarHazirla();
  if (!kariyer.haftaBaslangic) kariyer.haftaBaslangic = haftaFotografi();
}
function haftaFotografi() {
  return { hafta:kariyer.hafta || 1, butce:kariyer.butce, kimya:takimKimyasi(), itibar:itibarOf(),
    taraftar:kariyer.taraftar.memnuniyet, oyuncular:tumKadro().map(o=>({id:oyuncuKimligi(o),ad:o.ad,genel:o.genel,ozellikler:Object.fromEntries(OZELLIKLER.map(z=>[z,o[z]]))})) };
}
function gelecekProgram() {
  const sz = kariyer.sezon;
  if (!sz || sz.bitti) return "Lig sezonu tamamlandı. Sezon ödülünü alabilirsin.";
  if (sz.hf % 2 === 0) return "Lig maçı: " + haftaRakip().ad;
  const tu = kariyer.turnuva;
  if (tu) {
    const rakip = turnuvaRakibi(tu);
    return "Turnuva: " + (rakip ? rakip.ad : "Kura bekleniyor");
  }
  return "Turnuva haftası: davetleri incele veya dinlen.";
}
function haftaOzetKaydet(rapor, g, sp, faiz) {
  haftaOzetBaslat();
  const once = kariyer.haftaBaslangic, sonra = haftaFotografi();
  const degisimler = sonra.oyuncular.map(o=>{
    const eski = once.oyuncular.find(x=>x.id===o.id);
    return {ad:o.ad, once:eski ? eski.genel : null, sonra:o.genel, ozellikler:eski?.ozellikler ? OZELLIKLER.filter(z=>o.ozellikler[z]!==eski.ozellikler[z]).map(z=>({ad:ODAK_ADLARI[z] || z,once:eski.ozellikler[z],sonra:o.ozellikler[z]})) : []};
  }).filter(x=>x.once === null || x.once !== x.sonra || x.ozellikler.length);
  const sozlesmeler = tumKadro().filter(o=>o.bitis-kariyer.hafta+1<=SOZLESME_UYARI_HAFTA)
    .map(o=>({ad:o.ad,kalan:o.bitis-kariyer.hafta+1}));
  const summary = { hafta:once.hafta, once, sonra, degisimler, sozlesmeler, program:gelecekProgram(),
    notlar:rapor.slice(), maas:g, sponsor:sp, faiz };
  kariyer.sonHaftaOzeti = summary;
  kariyer.haftaOzetleri = (kariyer.haftaOzetleri || []).concat(summary).slice(-8);
  kariyer.haftaBaslangic = sonra;
  kulupGelisimHazirla();
}
function haftalikOzetEkrani(index) {
  const ar = kariyer.haftaOzetleri || [];
  const x = Number.isInteger(index) ? ar[index] : kariyer.sonHaftaOzeti;
  let h = '<button class="geri" onclick="kariyerEkrani()">← Ana Ekran</button><h2>Haftalık Özet</h2>';
  if (!x) { uygulama.innerHTML = h + '<div class="bilgi-kutusu">İlk haftayı tamamladığında bütçe, kadro gelişimi ve yaklaşan maç burada toplanacak.</div>'; return; }
  const net = x.sonra.butce-x.once.butce;
  h += '<section class="gelisim-kart"><small>HAFTA ' + x.hafta + ' · KULÜP RAPORU</small><div class="gelisim-metrik"><b>' + para(x.sonra.butce) + '</b><span>' + etkiYazi(net) + ' $ değişim</span></div><p>Başlangıç bütçesi: ' + para(x.once.butce) + '</p><div class="analiz-izgara"><div><small>SPONSOR GELİRİ</small><b>+' + para(x.sponsor) + '</b></div><div><small>HAFTALIK GİDER</small><b>−' + para(x.maas+x.faiz) + '</b></div><div><small>TAKIM KİMYASI</small><b>' + x.once.kimya + ' → ' + x.sonra.kimya + '</b></div><div><small>TARAFTAR</small><b>' + x.once.taraftar + ' → ' + x.sonra.taraftar + '</b></div><div><small>İTİBAR</small><b>' + x.once.itibar + ' → ' + x.sonra.itibar + '</b></div></div><p>Net değişim hafta içindeki transfer ve diğer işlemleri de kapsar.</p></section>';
  h += '<div class="gelisim-ipucu"><small>SIRADAKİ PROGRAM</small><br><b>' + oyunYazisi(x.program) + '</b></div><h2>Oyuncu Gelişimi</h2>';
  if (!x.degisimler.length) h += '<p>Bu hafta kadrodaki oyuncuların GEN değeri değişmedi.</p>';
  x.degisimler.forEach(o=>{h+='<div class="gelisim-kart"><div class="gelisim-satir"><b>'+oyunYazisi(o.ad)+'</b><span>GEN '+(o.once===null?'Yeni transfer':o.once)+' → '+o.sonra+'</span></div>'+(o.ozellikler || []).map(z=>'<p>'+oyunYazisi(z.ad)+': '+z.once+' → '+z.sonra+'</p>').join('')+'</div>';});
  h += '<h2>Sözleşme Uyarıları</h2>';
  if (!x.sozlesmeler.length) h += '<p>Acil yenileme gerekmiyor.</p>';
  x.sozlesmeler.forEach(o=>{h+='<div class="gelisim-satir"><b>'+oyunYazisi(o.ad)+'</b><span>'+(o.kalan>0?o.kalan+' hafta kaldı':'Sözleşme bitti')+'</span></div>';});
  if (x.sozlesmeler.length) h += '<button class="buton ikincil" onclick="sozlesmeEkrani()">Sözleşmelere Git</button>';
  h += '<h2>Haftanın Notları</h2>';
  x.notlar.forEach(note=>{h+='<p class="gelisim-not">'+oyunYazisi(note)+'</p>';});
  if(ar.length>1) { h+='<h2>Önceki Özetler</h2>'; ar.slice(0,-1).forEach((q,i)=>{h+='<button class="buton ikincil" onclick="haftalikOzetEkrani('+i+')">Hafta '+q.hafta+'</button>';}); }
  h += '<button class="buton" onclick="kariyerEkrani()">Kulübe Dön</button>';
  uygulama.innerHTML = h;
}
