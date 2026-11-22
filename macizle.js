const MAC_IZLE_HIZLARI = [1, 2, 4];

function macIzleTakimTarafi(c, takim) {
  return takim === "A" ? c.tarafA : (c.tarafA === "CT" ? "T" : "CT");
}

function raundRastgeleOyuncu(liste){return liste[Math.floor(Math.random()*liste.length)];}

function raundKatilSec(liste){
  const agirlik=x=>.75+(Math.max(1,Math.min(99,x.o.nisan))+Math.max(1,Math.min(99,x.o.refleks)))/396;
  let r=Math.random()*liste.reduce((sum,x)=>sum+agirlik(x),0);
  for(const x of liste){r-=agirlik(x);if(r<=0)return x;}
  return liste[liste.length-1];
}

function macIzleRaundHazirla(c) {
  c.aktifA.concat(c.aktifB).forEach(x=>{x.izHayatta=true;});
  const aK = Math.random() < canliP(c);
  const kazananlar = aK ? c.aktifA.slice() : c.aktifB.slice();
  const kaybedenler = aK ? c.aktifB.slice() : c.aktifA.slice();
  const kayipAdedi = Math.floor(Math.random() * 5);
  const olaylar = [];
  const tTaktik = macIzleTakimTarafi(c, "A") === "T" ? c.tA : c.tB;
  const site = tTaktik === "Agresif" ? (Math.random() < 0.72 ? "A" : "B") : (Math.random() < 0.5 ? "A" : "B");
  const hayattaKazananlar = kazananlar.slice();
  const hayattaKaybedenler = kaybedenler.slice();

  // Raundun sonunda kaybeden tarafın elindeki son çatışmaları oynat,
  // ardından kazanan tarafın kalan oyuncuları temizlemesini göster.
  for (let i = 0; i < kayipAdedi && hayattaKazananlar.length > 1; i++) {
    const katil = raundKatilSec(hayattaKaybedenler);
    const kurban = raundRastgeleOyuncu(hayattaKazananlar);
    hayattaKazananlar.splice(hayattaKazananlar.indexOf(kurban), 1);
    olaylar.push({ katil: katil, kurban: kurban, takim: aK ? "B" : "A" });
  }
  while (hayattaKaybedenler.length > 0) {
    const katil = raundKatilSec(hayattaKazananlar.length ? hayattaKazananlar : kazananlar);
    const kurban = raundRastgeleOyuncu(hayattaKaybedenler);
    hayattaKaybedenler.splice(hayattaKaybedenler.indexOf(kurban), 1);
    olaylar.push({ katil: katil, kurban: kurban, takim: aK ? "A" : "B" });
  }
  c.raundPlan = { aK: aK, olaylar: olaylar, index: 0, site: site, adim: 0, ctBilgi: { mid: false, midKayip:false, site: null, dusmusAlanlar:{A:false,B:false}, tehditler:[] } };
  c.bombaKuruldu = false;
  c.bombaYeri = null;
  c.aktifPlan = site + " bölgesine " + (tTaktik === "Temkinli" ? "kontrollü ilerleme" : "takım hücumu") + " · Mid kontrolü";
  c.killFeed = [];
  c.raundNo = c.sa + c.sb + 1;
}

function macIzleDurdur() {
  if (canli) {
    canli.izAnimasyonSurum=(canli.izAnimasyonSurum||0)+1;
    if(canli.izleZamanlayici) cancelAnimationFrame(canli.izleZamanlayici);
    canli.izleZamanlayici = null;
  }
}

function canliHizAyarla(hiz) {
  if (MAC_IZLE_HIZLARI.indexOf(hiz) < 0 || !canli || canli.molaAcik) return;
  canli.hiz = hiz;
  canliIzleBaslat();
}

function macIzleOlayUygula(c, olay, feedEkle) {
  olay.katil.kill++;
  olay.kurban.death++;
  olay.kurban.izHayatta = false;
  if (feedEkle) {
    c.killFeed.unshift(olay);
    c.killFeed = c.killFeed.slice(0, 4);
  }
}

function macIzleRaundBitir(c) {
  const plan = c.raundPlan;
  const kazananTakim = plan.aK ? "A" : "B";
  const tarafKazanan = macIzleTakimTarafi(c, kazananTakim);
  if (c.hizliSimulasyon && !c.bombaKuruldu && tarafKazanan === "T") {
    c.bombaKuruldu = true;
    c.bombaYeri = plan.site;
  }
  if (c.bombaKuruldu) c.olaylar.push(c.bombaYeri + " alanında bomba kuruldu; " + (tarafKazanan === "T" ? "bomba patladı, T tarafı raundu aldı." : "CT tarafı sahayı temizleyip bombayı etkisizleştirdi."));
  else if (tarafKazanan === "CT") c.olaylar.push("CT savunması " + plan.site + " yaklaşımını tuttu; bomba kurulamadı.");
  if (plan.aK) { c.sa++; c.serA = 0; c.serB++; }
  else { c.sb++; c.serB = 0; c.serA++; }
  if (c.molaTur > 0) c.molaTur--;
  if (c.molaTurB > 0) c.molaTurB--;
  if (c.serB >= 3 && c.molaB > 0) {
    c.molaB--;
    c.serB = 0;
    c.molaTurB = MOLA_TUR;
    c.olaylar.push("Rakip mola aldı (" + c.sa + "-" + c.sb + ")");
  }
  if (!c.ot && c.sa === 12 && c.sb === 12) {
    c.ot = true;
    c.otA = 0; c.otB = 0; c.otN = 0;
  } else if (c.ot) {
    c.otN++;
    if (plan.aK) c.otA++; else c.otB++;
    if (c.otN === 6) {
      if (c.otA >= 4 || c.otB >= 4) c.macaBitti = true;
      else { c.otA = 0; c.otB = 0; c.otN = 0; }
    }
  }
  c.raundPlan = null;
  c.raundNo = c.sa + c.sb + 1;
  if (!c.hizliSimulasyon) kaydet();
}

function canliDevreyeAtla() {
  const c = canli;
  if (!c || c.yariGecti || c.molaAcik) return;
  macIzleDurdur();
  c.hizliSimulasyon = true;
  while (!c.macaBitti && c.sa + c.sb < 12) {
    if (!c.raundPlan) macIzleRaundHazirla(c);
    while (c.raundPlan && c.raundPlan.index < c.raundPlan.olaylar.length) {
      macIzleOlayUygula(c, c.raundPlan.olaylar[c.raundPlan.index++], false);
    }
    macIzleRaundBitir(c);
  }
  c.hizliSimulasyon = false;
  canliDevam();
}

window.canliIzleDurdur = macIzleDurdur;
window.canliHizAyarla = canliHizAyarla;
window.canliDevreyeAtla = canliDevreyeAtla;
