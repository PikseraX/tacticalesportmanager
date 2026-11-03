function rakipAnalizVerisi(t, seviye) {
  const r = { ad: t.ad, seviye };
  if (seviye >= 1) {
    r.strateji = t.strateji || "Dengeli";
    r.taktik = aiIlkTaktik(t);
    const h = haritaOf(t);
    r.gucluHarita = HARITALAR.reduce((a,b) => h[a] >= h[b] ? a : b);
    r.yildiz = t.oyuncular.reduce((a,b) => a.genel >= b.genel ? a : b).ad;
  }
  if (seviye >= 2) {
    const h = haritaOf(t);
    r.haritalar = HARITALAR.map(ad => ({ ad, puan: h[ad] }));
    r.zayifHarita = r.haritalar.reduce((a,b) => a.puan <= b.puan ? a : b).ad;
  }
  if (seviye >= 3) r.oneri = r.taktik === "Agresif" ? "Temkinli" : r.taktik === "Temkinli" ? "Dengeli" : "Agresif";
  return r;
}
function rakipAnalizHtml(t) {
  const r = rakipAnalizVerisi(t, personelSeviye("analist"));
  let h = '<section class="gelisim-kart analiz-kart"><small>MAÇ ÖNCESİ İSTİHBARAT · ANALİST ' + r.seviye + '/3</small><h3>' + oyunYazisi(r.ad) + '</h3>';
  if (!r.seviye) return h + '<p>Rakibin planını öğrenmek için bir analist işe al.</p><button class="buton ikincil" onclick="personelEkrani()">Analist İşe Al</button></section>';
  h += '<div class="analiz-izgara"><div><small>OYUN TARZI</small><b>' + r.strateji + '</b></div><div><small>İLK YARI TAKTİĞİ</small><b>' + r.taktik + '</b></div><div><small>YILDIZ OYUNCU</small><b>' + oyunYazisi(r.yildiz) + '</b></div><div><small>GÜÇLÜ HARİTA</small><b>' + r.gucluHarita + '</b></div></div>';
  if (r.haritalar) {
    h += '<p>Harita yasaklama önerisi: <b>' + r.gucluHarita + '</b>. Rakibin zayıf haritası: <b>' + r.zayifHarita + '</b>.</p><div class="analiz-haritalar">';
    r.haritalar.forEach(x => { h += '<span>' + x.ad + '<b>' + etkiYazi(x.puan) + '</b></span>'; });
    h += '</div>';
  } else h += '<p>Analist seviye 2: tüm harita puanları ve yasaklama önerisi.</p>';
  if (r.oneri) h += '<div class="gelisim-ipucu">Karşı taktik önerisi: <b>' + r.oneri + '</b>. Bu öneri rakibin açılış planına dayanır; galibiyet garantisi değildir.</div>';
  else h += '<p>Analist seviye 3: karşı taktik önerisi ve devre arası istihbaratı.</p>';
  return h + '</section>';
}
