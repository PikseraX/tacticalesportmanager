// Kulüp ve oyuncuyla ayrı görüşme. Kabul edilmeden para ve kadro değişmez.
function transferTalepleri(o) {
  oyuncuKimligi(o);
  if (!o.transferTalep || (o.transferTalep.genel !== undefined && o.transferTalep.genel !== o.genel)) {
    const bedel = transferUcreti(o), maas = formulMaas(o);
    o.transferTalep = { kulup: dunya[Math.floor(Math.random()*dunya.length)].ad,
      bonservis: Math.ceil(bedel * (0.92 + Math.random()*0.08) / 100)*100,
      maas: Math.ceil(maas * (1 + Math.random()*0.1) / 50)*50, imza: Math.ceil(maas*2/100)*100, maasSurum:MAAS_DENGE_SURUMU, genel: o.genel };
  } else if (o.transferTalep.maasSurum !== MAAS_DENGE_SURUMU) {
    // Eski kayıttaki bonservis karşı teklifi korunur; ücret beklentisi bir kez güncellenir.
    const baz = formulMaas(o);
    o.transferTalep.maas = Math.ceil(baz*1.05/50)*50;
    o.transferTalep.imza = Math.ceil(baz*2/100)*100;
    o.transferTalep.maasSurum = MAAS_DENGE_SURUMU;
    o.transferTalep.genel = o.genel;
  }
  if (!o.transferTur || o.transferTur.hafta !== kariyer.hafta)
    o.transferTur = { hafta: kariyer.hafta, kulup: 0, oyuncu: 0 };
  return o.transferTalep;
}
function pazarlikAc(i, mod, hedef) {
  serbestHazirla();
  const o = kariyer.serbest[i];
  if (!o || !["bos","ilk5","yedek"].includes(mod)) return;
  transferTalepleri(o);
  const eski = mod === "ilk5" ? kariyer.oyuncular[hedef] : mod === "yedek" && hedef >= 0 ? yedekListe()[hedef] : null;
  if (eski) oyuncuKimligi(eski);
  kariyer.gorusme = { oyuncu: o.kimlik, mod, hedef, eski: eski ? eski.kimlik : null,
    teklif: transferUcreti(o), maas: o.transferTalep.maas, imza: o.transferTalep.imza, sure: 26, asama: "kulup" };
  kaydet(); pazarlikEkrani();
}
function pazarlikOyuncusu() {
  return kariyer.gorusme && (kariyer.serbest || []).find(o => o.kimlik === kariyer.gorusme.oyuncu);
}
function pazarlikAlan(id, ad, deger, min, step) {
  return '<label class="gelisim-alan" for="' + id + '">' + ad + '<input class="alan" id="' + id + '" type="number" min="' + min + '" step="' + step + '" value="' + deger + '"></label>';
}
function pazarlikEkrani(mesaj) {
  const n = kariyer.gorusme, o = pazarlikOyuncusu();
  if (!o || !n) { transferEkrani(); return; }
  const t = transferTalepleri(o);
  const bitis = n.asama === "tamam";
  let h = '<button class="geri" onclick="transferListesineDon()">← Transfer</button><h2>Transfer Pazarlığı</h2><section class="gelisim-kart"><small>' + (n.asama === "kulup" ? "1 / 2 · KULÜPLE GÖRÜŞME" : "2 / 2 · OYUNCUYLA GÖRÜŞME") + '</small><h3>' + oyunAdi(o.ad) + '</h3><p>' + o.rol + ' · GEN ' + o.genel + ' · ' + o.yas + ' yaş</p><p>Bütçe: <b>' + para(kariyer.butce) + '</b></p></section>';
  if (mesaj) h += '<div class="gelisim-ipucu" role="status">' + oyunYazisi(mesaj) + '</div>';
  if (n.asama === "kulup") {
    h += '<p>Temsilci kulüp: <b>' + oyunAdi(t.kulup) + '</b>. Liste bedeli ' + para(transferUcreti(o)) + '. Haftada en fazla 3 teklif.</p>';
    h += pazarlikAlan("paz-bonservis", "Bonservis teklifin", n.teklif, 0, 100);
    h += '<button class="buton" onclick="kulupPazarligi()">Kulübe Teklif Ver (' + o.transferTur.kulup + '/3)</button>';
  } else if (!bitis) {
    h += '<div class="bilgi-kutusu">Kulüp kabul etti: <b>' + para(n.bonservis) + '</b><br>Oyuncunun beklentisi: ' + para(t.maas) + '/hafta + ' + para(t.imza) + ' imza parası (26 hafta için). Uzun sözleşmelerde ücret beklentisi artar.</div>';
    h += pazarlikAlan("paz-maas", "Haftalık temel maaş", n.maas, 50, 50) + pazarlikAlan("paz-imza", "İmza parası", n.imza, 0, 100);
    h += '<label class="gelisim-alan" for="paz-sure">Sözleşme süresi<select class="alan" id="paz-sure">' + [13,26,52].map(w => '<option value="' + w + '"' + (n.sure === w ? ' selected' : '') + '>' + w + ' hafta</option>').join('') + '</select></label>';
    h += '<button class="buton" onclick="oyuncuPazarligi()">Oyuncuya Teklif Ver (' + o.transferTur.oyuncu + '/3)</button>';
  } else {
    const eski = pazarlikCikanOyuncu(n);
    const gelir = eski ? satisFiyati(eski) : 0;
    h += '<div class="bilgi-kutusu">Bonservis: ' + para(n.bonservis) + '<br>İmza parası: ' + para(n.imza) + '<br>Maaş: ' + para(n.maas) + '/hafta<br>Süre: ' + n.sure + ' hafta<br>Oyuncu satışı: +' + para(gelir) + '<br>Şimdi ödenecek net: <b>' + para(n.bonservis + n.imza - gelir) + '</b></div><button class="buton" onclick="pazarlikImzala()">Anlaşmayı İmzala</button>';
  }
  uygulama.innerHTML = h;
}
function kulupPazarligi() {
  const n = kariyer.gorusme, o = pazarlikOyuncusu();
  if (!o || !n || n.asama !== "kulup") return;
  const t = transferTalepleri(o), v = Number(document.getElementById("paz-bonservis").value);
  if (!Number.isSafeInteger(v) || v < 0 || v > 100000000) { pazarlikEkrani("Geçerli bir ücret gir."); return; }
  if (o.transferTur.kulup >= 3) { pazarlikEkrani("Kulüp bu hafta başka teklif kabul etmiyor. Gelecek hafta yeniden görüşebilirsin."); return; }
  n.teklif = v; o.transferTur.kulup++;
  if (v >= t.bonservis) { n.bonservis = v; n.asama = "oyuncu"; kaydet(); pazarlikEkrani("Kulüple anlaştın. Şimdi oyuncunun şartlarını görüş."); }
  else { kaydet(); pazarlikEkrani("Teklif reddedildi. Kulübün karşı teklifi: " + para(t.bonservis)); }
}
function oyuncuPazarligi() {
  const n = kariyer.gorusme, o = pazarlikOyuncusu();
  if (!o || !n || n.asama !== "oyuncu") return;
  const t = transferTalepleri(o), wage = Number(document.getElementById("paz-maas").value), bonus = Number(document.getElementById("paz-imza").value), weeks = Number(document.getElementById("paz-sure").value);
  if (![wage,bonus].every(Number.isSafeInteger) || wage < 50 || wage > 1000000 || bonus < 0 || bonus > 100000000 || ![13,26,52].includes(weeks)) { pazarlikEkrani("Maaş, imza parası ve süreyi kontrol et."); return; }
  if (o.transferTur.oyuncu >= 3) { pazarlikEkrani("Oyuncu bu hafta görüşmeleri kapattı. Gelecek hafta tekrar deneyebilirsin."); return; }
  n.maas = wage; n.imza = bonus; n.sure = weeks; o.transferTur.oyuncu++;
  const beklenti = (t.maas + t.imza/26) * (weeks === 52 ? 1.08 : weeks === 13 ? 0.98 : 1);
  const kabul = wage >= t.maas*0.9 && wage + bonus/weeks >= beklenti;
  if (kabul) n.asama = "tamam";
  kaydet(); pazarlikEkrani(kabul ? "Oyuncu şartları kabul etti. Son kez maliyeti kontrol edip imzalayabilirsin." : "Oyuncu teklifi reddetti. Maaşı veya imza parasını artırabilir, süreyi kısaltabilirsin.");
}
function pazarlikCikanOyuncu(n) {
  return n.eski ? tumKadro().find(o => o.kimlik === n.eski) : null;
}
function pazarlikImzala() {
  if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri)) { macDevamEkrani(); return; }
  const n = kariyer.gorusme, o = pazarlikOyuncusu();
  if (!n || !o || n.asama !== "tamam") return;
  const liste = n.mod === "yedek" ? yedekListe() : kariyer.oyuncular;
  const eski = pazarlikCikanOyuncu(n);
  if ((n.eski && !eski) || (eski && !liste.includes(eski)) || (!eski && liste.length >= (n.mod === "yedek" ? YEDEK_MAX : 5))) {
    pazarlikEkrani("Kadro değişti. Transfer ekranından görüşmeyi yeniden başlat."); return;
  }
  const satis = eski ? satisFiyati(eski) : 0;
  const bedel = n.bonservis + n.imza, net = bedel - satis;
  if (kariyer.butce < net) { pazarlikEkrani("Anlaşma için bütçen yetersiz. Henüz ücret ödenmedi."); return; }
  if (!confirm(o.ad + " için net " + para(net) + " ve haftalık " + para(n.maas) + " maaş. İmzalansın mı?")) return;
  kariyer.butce -= net;
  maliIsle("gider", "transfer", n.bonservis); maliIsle("gider", "transferImza", n.imza);
  if (satis) maliIsle("gelir", "transfer", satis);
  o.maas = n.maas; o.bitis = (kariyer.hafta || 1) + n.sure - 1; o.mor = 75;
  delete o.maasTalebi;
  delete o.transferTalep;
  delete o.transferTur;
  const adayIndex = kariyer.serbest.indexOf(o);
  if (eski) { serbestOyuncuTemizle(eski); liste[liste.indexOf(eski)] = o; kariyer.serbest[adayIndex] = eski; }
  else { liste.push(o); kariyer.serbest.splice(adayIndex,1); serbestDoldur(); }
  taraftarTransfer(o, eski);
  kariyer.gorusme = null;
  kaydet(); transferEkrani();
}
