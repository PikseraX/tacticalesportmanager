// Canlı yayın: görsel harita yerine gerçek raund olaylarından spiker anlatımı.
function spikerSoyle(c,metin,tur){
  c.spikerAkisi=c.spikerAkisi||[];
  c.spikerAkisi.unshift({raund:c.raundNo||c.sa+c.sb+1,metin,tur:tur||'olay'});
  c.spikerAkisi=c.spikerAkisi.slice(0,40);
}
function spikerHazirla(c){
  if(!c.raundPlan)macIzleRaundHazirla(c);
  const n=c.raundNo||c.sa+c.sb+1;
  if(c.spikerRaund!==n){
    c.spikerRaund=n;c.spikerBekleme=0;
    spikerSoyle(c,n+'. raund başlıyor! '+c.A.ad+' '+macIzleTakimTarafi(c,'A')+' tarafında. Skor '+c.sa+'–'+c.sb+'.','baslangic');
  }
}
let spikerEkranMaci=null;
function spikerMolaHtml(){return '<div class="mac-mola-katmani"><div class="mac-mola-kart"><h2>Takım Molası</h2><p>Spiker: Menajer takımını topladı. Dönüşte ilk '+MOLA_TUR+' raund için +'+MOLA_BONUSU+' güç desteği var.</p><button class="buton" onclick="canliMolaDevam()">Yayına Devam Et</button></div></div>';}
function spikerGecmisHtml(c){return (c.spikerAkisi||[]).slice(1,25).map(x=>'<article><small>RAUND '+x.raund+'</small><p>'+oyunYazisi(x.metin)+'</p></article>').join('');}
function spikerGuncelle(c){
  const x=window.scrollX,y=window.scrollY;
  document.getElementById('spiker-son').textContent=c.spikerAkisi?.[0]?.metin||'Takımlar hazırlanıyor…';
  document.getElementById('spiker-skor').innerHTML=skorTahtasi(oyunYazisi(c.A.ad),oyunYazisi(c.B.ad),c.sa,c.sb,false,macIzleTakimTarafi(c,'A'),macIzleTakimTarafi(c,'B')).replace('CANLI · YARI DEVRE','CANLI · SPİKER');
  document.getElementById('spiker-raund').textContent='Raund '+(c.raundNo||c.sa+c.sb+1);
  document.getElementById('spiker-ist').innerHTML=istTablo(oyunYazisi(c.A.ad),c.istA)+istTablo(oyunYazisi(c.B.ad),c.istB);
  document.getElementById('spiker-gecmis').innerHTML=spikerGecmisHtml(c);
  const mola=document.getElementById('spiker-mola');mola.disabled=c.mola<=0;mola.textContent='Takım Molası · '+c.mola+' / 2';
  uygulama.querySelectorAll('[data-spiker-hiz]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.spikerHiz)===c.hiz));
  const panel=uygulama.querySelector('.mac-mola-katmani');
  if(panel&&!c.molaAcik)panel.remove();
  if(!panel&&c.molaAcik)uygulama.querySelector('.spiker-ekrani').insertAdjacentHTML('beforeend',spikerMolaHtml());
  window.scrollTo(x,y);
}
function spikerEkrani(){
  const c=canli;if(!c)return;
  if(spikerEkranMaci===c && uygulama.querySelector('.spiker-ekrani')){spikerGuncelle(c);return;}
  spikerEkranMaci=c;
  let h='<section class="spiker-ekrani">';
  if(c.seri)h+=seriKutusu(c.seri);
  h+='<div id="spiker-skor">'+skorTahtasi(oyunYazisi(c.A.ad),oyunYazisi(c.B.ad),c.sa,c.sb,false,macIzleTakimTarafi(c,'A'),macIzleTakimTarafi(c,'B')).replace('CANLI · YARI DEVRE','CANLI · SPİKER')+'</div>';
  h+='<div class="etiketler">'+etiket('CANLI ANLATIM','sari')+'<span class="etiket" id="spiker-raund">Raund '+(c.raundNo||c.sa+c.sb+1)+'</span>'+etiket(oyunYazisi(c.harita))+'</div>';
  h+='<section class="spiker-yayin"><small>SPİKER KABİNİ · CANLI</small><h2>Karşılaşmanın nabzı</h2><p class="spiker-son" id="spiker-son" role="status" aria-live="polite">'+oyunYazisi(c.spikerAkisi?.[0]?.metin||'Takımlar hazırlanıyor…')+'</p></section>';
  h+='<div class="spiker-kontroller">';
  MAC_IZLE_HIZLARI.forEach(x=>{h+='<button class="buton ikincil" data-spiker-hiz="'+x+'" onclick="canliHizAyarla('+x+')" aria-pressed="'+(c.hiz===x)+'">'+x+'×</button>';});
  h+='</div><button class="buton" id="spiker-mola" onclick="canliMola()"'+(c.mola<=0?' disabled':'')+'>Takım Molası · '+c.mola+' / 2</button>';
  h+=c.yariGecti?'<button class="buton ikincil" onclick="canliMaciHizliBitir()">Kalan Raundları Simüle Et</button>':'<button class="buton ikincil" onclick="canliDevreyeAtla()">Devre Arasına Atla</button>';
  h+='<details class="kadro-detay"><summary>Oyuncu İstatistikleri</summary><div id="spiker-ist">'+istTablo(oyunYazisi(c.A.ad),c.istA)+istTablo(oyunYazisi(c.B.ad),c.istB)+'</div></details><h2>Yayın Akışı</h2><div class="spiker-gecmis" id="spiker-gecmis">';
  (c.spikerAkisi||[]).slice(1,25).forEach(x=>{h+='<article><small>RAUND '+x.raund+'</small><p>'+oyunYazisi(x.metin)+'</p></article>';});
  h+='</div>';
  if(c.molaAcik)h+='<div class="mac-mola-katmani"><div class="mac-mola-kart"><h2>Takım Molası</h2><p>Spiker: Menajer takımını topladı. Dönüşte ilk '+MOLA_TUR+' raund için +'+MOLA_BONUSU+' güç desteği var.</p><button class="buton" onclick="canliMolaDevam()">Yayına Devam Et</button></div></div>';
  uygulama.innerHTML=h+'</section>';
}
function spikerAdim(delta){
  const c=canli;if(!c||c.molaAcik||c.macEkrani!=='canli')return;
  spikerHazirla(c);
  c.spikerBekleme=(c.spikerBekleme||0)+(delta===undefined?2:delta);
  if(c.spikerBekleme<3.6)return;
  c.spikerBekleme=0;
  const p=c.raundPlan;
  if(p.index<p.olaylar.length){
    const olay=p.olaylar[p.index++];
    macIzleOlayUygula(c,olay,true);
    const takim=c.aktifA.includes(olay.katil)?c.A.ad:c.B.ad;
    const kalan=c.aktifA.includes(olay.kurban)?c.aktifA:c.aktifB;
    const savunan=c.aktifA.includes(olay.kurban)?c.A.ad:c.B.ad;
    const sayi=kalan.filter(x=>x.izHayatta!==false).length;
    const giris=p.index===1?'İlk temas! ':p.index%2?'Çatışma kızışıyor! ':'Bir oyuncu daha oyun dışında! ';
    spikerSoyle(c,giris+olay.katil.o.ad+', '+olay.kurban.o.ad+' oyuncusunu düşürüyor. '+takim+' adına önemli bir hamle!'+(sayi===1?' '+savunan+' takımında son oyuncu kaldı.':sayi===0?' '+savunan+' takımında ayakta kalan yok.':''));
    kaydet();spikerEkrani();return;
  }
  const kazanan=p.aK?c.A.ad:c.B.ad;
  const oncekiSim=c.hizliSimulasyon;c.hizliSimulasyon=true;
  macIzleRaundBitir(c);c.hizliSimulasyon=oncekiSim;
  spikerSoyle(c,kazanan+' raundu alıyor! Tabela '+c.sa+'–'+c.sb+'.'+(c.sa===c.sb?' Skora yeniden denge geldi!':Math.abs(c.sa-c.sb)===1?' Fark yalnızca bir raund!':''),'sonuc');
  c.spikerAkisi[0].raund=c.raundNo-1;
  kaydet();canliDevam();
}
function spikerBaslat(){
  const c=canli;if(!c||c.molaAcik)return;
  c.macEkrani='canli';macIzleDurdur();spikerHazirla(c);spikerEkrani();
  const surum=c.izAnimasyonSurum;let son=null;
  function kare(t){
    if(canli!==c||c.molaAcik||c.izAnimasyonSurum!==surum)return;
    const dt=son===null?0:Math.min(250,Math.max(0,t-son));son=t;
    spikerAdim(dt*(c.hiz||1)/1000);
    if(canli===c&&!c.molaAcik&&c.izAnimasyonSurum===surum)c.izleZamanlayici=requestAnimationFrame(kare);
  }
  c.izleZamanlayici=requestAnimationFrame(kare);
}
// Eski görsel çağrılar da aynı anlatım ekranına yönlenir; kayıtlar uyumludur.
window.macIzleBaslat=spikerBaslat;
window.canliIzleBaslat=spikerBaslat;
window.macIzleEkrani=spikerEkrani;
window.canliIzleEkrani=spikerEkrani;
window.macIzleAdim=spikerAdim;
