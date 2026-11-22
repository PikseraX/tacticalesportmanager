const PIYASA_OYUNCU_SAYISI = 30;
const SERBEST_ADLAR = [
  "Vorex", "Kelvix", "Zorax", "Nexo", "Draven", "Kyro", "Tavil", "Brixen", "Joltan", "Mirax",
  "Hexor", "Quila", "Volta", "Ravix", "Zenko", "Taxel", "Orkan", "Drogo", "Sylex", "Narvo",
  "Fenix", "Lumor", "Cavex", "Bolero", "Ryker", "Tazor", "Elvix", "Morgan", "Kasper", "Zyron"
];

function transferUcreti(o) { return o.genel * o.genel * 40; }
// Satışta oyuncunun piyasa değerinin çoğu korunur; aynı GEN oyuncuda kayıp %10'dur.
function satisFiyati(o) { return Math.round(transferUcreti(o) * 0.9); }
function oyuncuMaasi(o) { return o.maas !== undefined ? o.maas : formulMaas(o); }

function serbestGucSiniri() {
  const kademe = Math.max(1, Math.min(LIG_SAYISI, kariyer.ligNo || LIG_SAYISI));
  const hedef = LIG_HEDEF_GUCU[kademe - 1];
  return { alt: Math.max(35, hedef - 15), ust: Math.min(99, hedef + 5) };
}

function serbestOyuncuUret(ad) {
  const sinir = serbestGucSiniri();
  const g = sinir.alt + Math.random() * (sinir.ust - sinir.alt);
  const o = { ad: ad, rol: TARZ_LISTESI[Math.floor(Math.random() * TARZ_LISTESI.length)], yas: 17 + Math.floor(Math.random() * 14) };
  rolProfiliUret(o,g);
  if (o.genel > sinir.ust) {
    const fark = o.genel - sinir.ust;
    OZELLIKLER.forEach(function (z) { o[z] = Math.max(1, o[z] - fark); });
    genelHesapla(o);
  }
  return o;
}

function serbestHazirla() {
  const sinir = serbestGucSiniri();
  const olusturuldu = !kariyer.serbest;
  if (olusturuldu) kariyer.serbest = [];
  const eskiBoy = kariyer.serbest.length;
  kariyer.serbest = kariyer.serbest.filter(function (o) { return o.genel <= sinir.ust; });
  const temizlendi = kariyer.serbest.length !== eskiBoy;
  serbestDoldur();
  if (olusturuldu || temizlendi || kariyer.serbest.length !== eskiBoy) kaydet();
}

// Piyasayı 30 oyuncuda tutar; aktif görüşmedeki oyuncuyu listeden düşürmez.
function serbestDoldur() {
  while (kariyer.serbest.length < PIYASA_OYUNCU_SAYISI) kariyer.serbest.push(serbestOyuncuUret(yeniAd()));
  if(kariyer.serbest.length>PIYASA_OYUNCU_SAYISI)izlemeHazirla();
  while(kariyer.serbest.length>PIYASA_OYUNCU_SAYISI){
    const i=kariyer.serbest.findIndex(o=>!kariyer.gorusme || o.kimlik!==kariyer.gorusme.oyuncu);
    if(i<0)break;kariyer.serbest.splice(i,1);
  }
}

function serbestOyuncuTemizle(o) {
  if (!o) return o;
  delete o.transferTalep;
  delete o.transferTur;
  delete o.maas;
  delete o.bitis;
  delete o.maasTalebi;
  return o;
}

// Sezon sonunda piyasa tamamen yenilenir
function serbestYenile() {
  izlemeHazirla();
  kariyer.gorusme = null;
  kariyer.serbest = [];
  serbestDoldur();
}

function piyasayaEkle(o) {
  serbestOyuncuTemizle(o);
  serbestHazirla();
  if (o.genel <= serbestGucSiniri().ust) {
    kariyer.serbest.push(o);
    serbestDoldur();
  }
  serbestDoldur();
}

function transferRolSirasiSec(rol){
  if(rol!=="tum"&&!TARZ_LISTESI.includes(rol))return;
  kariyer.piyasaRolSirasi=rol;kaydet();ekraniKonumdaGuncelle(transferEkrani);
}
function transferListeVerisi(rol){
  const secili=TARZ_LISTESI.includes(rol)?rol:null;
  return kariyer.serbest.map((o,i)=>({o,i,gen:secili?rolGenel(o,secili):o.genel})).sort((a,b)=>b.gen-a.gen||a.i-b.i);
}
let transferListeDonus=null;
function transferListesineDon(){
  const konum=transferListeDonus;
  transferEkrani();
  if(konum && konum.kariyer===kariyer && konum.rol===(kariyer.piyasaRolSirasi||"tum"))
    ekranKaydirmaHedefi={x:konum.x,y:konum.y};
}
function transferEkrani() {
  serbestHazirla();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2 id="transfer-piyasa-baslik">Transfer Piyasası</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Yedek: <b>" + yedekListe().length + "/" + YEDEK_MAX + "</b></div>";
  if (pazarlikOyuncusu()) html += '<button class="buton ikincil" onclick="pazarlikEkrani()">Devam Eden Transfer Görüşmesi</button>';
  html += '<button class="buton ikincil" onclick="izlemeEkrani()">İzleme Listesini Aç</button>';
  html += transferSatisHtml();
  html += "<h2>Oyuncu Al</h2>";
  html += '<p>Oyuncuların seviyeleri bulunduğun lige göre belirlenir. Bir oyuncu seçip önce kulüple, sonra oyuncuyla şartları görüş.</p>';
  const secili=TARZ_LISTESI.includes(kariyer.piyasaRolSirasi)?kariyer.piyasaRolSirasi:"tum";
  html += '<label class="gelisim-alan" for="piyasa-rol">GEN sıralaması<select class="alan" id="piyasa-rol" onchange="transferRolSirasiSec(this.value)"><option value="tum"'+(secili==='tum'?' selected':'')+'>Mevcut rollerine göre GEN</option>'+TARZ_LISTESI.map(r=>'<option value="'+r+'"'+(secili===r?' selected':'')+'>'+r+' rolünde GEN</option>').join('')+'</select></label><p>'+kariyer.serbest.length+' oyuncu · En yüksek GEN üstte. Rol seçimi oyuncunun özelliklerini veya mevcut rolünü değiştirmez; bütün adayları seçtiğin rolde değerlendirir.</p>';
  transferListeVerisi(secili).forEach(function ({o,i,gen}) {
    html += '<button class="takim-butonu" onclick="transferSec(' + i + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (" + o.rol + ", " + o.yas + ")</span><span>" + (secili==='tum'?'GEN':secili+' GEN') + " " + gen + " · " + para(transferUcreti(o)) + " · Maaş " + para(oyuncuMaasi(o)) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function transferSatisHtml() {
  const y = yedekListe();
  let html = "<h2>Kadrodan Oyuncu Sat</h2><p>İlk 5'ten satış yapınca yedek oyuncu otomatik olarak kadroya geçer. Yedekleri ise ilk 5'i bozmadan satabilirsin.</p>";
  kariyer.oyuncular.forEach(function (o, k) {
    const engel = y.length === 0 || kariyer.oyuncular.length < 5 ? ' disabled title="İlk 5 oyuncuyu korumak için yedek gerekir"' : "";
    html += '<button class="takim-butonu"' + engel + ' onclick="transferOyuncuSat(' + k + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (İlk 5 · GEN " + o.genel + ")</span><span>Satış geliri: " + para(satisFiyati(o)) + (y.length === 0 ? " · Yedek yok" : "") + "</span></button>";
  });
  if (y.length > 0) {
    html += "<h3>Yedek Oyuncular</h3><p>Yedek satışı ilk 5 kadronu değiştirmez.</p>";
    y.forEach(function (o, i) {
      html += '<button class="takim-butonu" onclick="transferYedekSat(' + i + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (Yedek · GEN " + o.genel + ")</span><span>Satış geliri: " + para(satisFiyati(o)) + "</span></button>";
    });
  }
  return html;
}

function transferSec(i) {
  const yeni = kariyer.serbest[i];
  if(!yeni)return;
  if(uygulama.querySelector('#transfer-piyasa-baslik'))
    transferListeDonus={kariyer,rol:kariyer.piyasaRolSirasi||"tum",x:window.scrollX||0,y:window.scrollY||0};
  const y = yedekListe();
  let html = '<button class="geri" onclick="transferListesineDon()">← Geri</button><h2>' + oyunAdi(yeni.ad) + "</h2>";
  kisilikAta(yeni);
  html += '<div class="gelisim-ipucu"><b>'+kisilikOf(yeni).ad+'</b><br>'+kisilikOf(yeni).acik+'</div>';
  html += tabloHtml([yeni]);
  izlemeHazirla();
  const takip=kariyer.izlemeListesi.some(x=>x.id===yeni.kimlik);
  html += '<button class="buton ikincil" onclick="izlemePiyasaEkle(' + i + ')"' + (takip?' disabled':'') + '>' + (takip?'İzleme Listesinde':'İzleme Listesine Ekle') + '</button>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b></div>";
  if (kariyer.oyuncular.length < 5) {
    html += '<button class="buton" onclick="transferBosKadroyaAl(' + i + ')">Boş kadro yerine al: ' + para(transferUcreti(yeni)) + "</button>";
  }
  if (y.length < YEDEK_MAX) {
    html += '<button class="buton" onclick="transferYedek(' + i + ', -1)">Satış yapmadan kadroya al (yedek): ' + para(transferUcreti(yeni)) + "</button>";
  }
  html += "<p>Ya da ilk 5'ten birinin yerine al (o oyuncu satılır):</p>";
  kariyer.oyuncular.forEach(function (e, k) {
    const net = transferUcreti(yeni) - satisFiyati(e);
    const yazi = net >= 0 ? "Ödenecek: " + para(net) : "Kazanç: " + para(-net);
    html += '<button class="takim-butonu" onclick="transferYap(' + i + ", " + k + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(e.ad) + "\">" + oyunYazisi(e.ad) + " (GEN " + e.genel + ")</span><span>" + yazi + "</span></button>";
  });
  if (y.length > 0) {
    html += "<p>Ya da bir yedeğin yerine al (o oyuncu satılır):</p>";
    y.forEach(function (e, j) {
      const net = transferUcreti(yeni) - satisFiyati(e);
      const yazi = net >= 0 ? "Ödenecek: " + para(net) : "Kazanç: " + para(-net);
      html += '<button class="takim-butonu" onclick="transferYedek(' + i + ", " + j + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(e.ad) + "\">" + oyunYazisi(e.ad) + " (Yedek, GEN " + e.genel + ")</span><span>" + yazi + "</span></button>";
    });
  }
  uygulama.innerHTML = html;
}

function transferOyuncuSat(k) {
  if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri)) { macDevamEkrani(); return; }
  const y = yedekListe();
  const satilan = kariyer.oyuncular[k];
  if (!satilan) return;
  if (kariyer.oyuncular.length < 5 || y.length === 0) { alert("İlk 5'ten oyuncu satmak için yedek kadroda bir oyuncu olmalı."); return; }
  const gelir = satisFiyati(satilan);
  const terfi = y[0];
  if (!confirm(terfi.ad + " ilk 5'e geçecek, " + satilan.ad + " satılacak. Gelir: " + para(gelir) + ". Onaylıyor musun?")) return;
  taraftarTransfer(null, satilan);
  kariyer.oyuncular[k] = terfi;
  y.shift();
  kariyer.butce += gelir;
  maliIsle("gelir", "transfer", gelir);
  piyasayaEkle(satilan);
  kaydet();
  transferEkrani();
}

function transferYedekSat(i) {
  if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri)) { macDevamEkrani(); return; }
  const y = yedekListe();
  const satilan = y[i];
  if (!satilan) return;
  const gelir = satisFiyati(satilan);
  if (!confirm(satilan.ad + " satılacak. İlk 5 kadron değişmeyecek. Satış geliri: " + para(gelir) + ". Onaylıyor musun?")) return;
  taraftarTransfer(null, satilan);
  y.splice(i, 1);
  kariyer.butce += gelir;
  maliIsle("gelir", "transfer", gelir);
  piyasayaEkle(satilan);
  kaydet();
  transferEkrani();
}

function transferBosKadroyaAl(i) { pazarlikAc(i, "bos", -1); }


function transferYap(i, k) { pazarlikAc(i, "ilk5", k); }


// j = -1: yeni yedek olarak al, j >= 0: o yedeğin yerine al
function transferYedek(i, j) { pazarlikAc(i, "yedek", j); }

