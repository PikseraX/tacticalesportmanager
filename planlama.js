const ANTRENMAN_YOGUNLUKLARI={
  hafif:{ad:'Hafif',gelisim:.75,yorgunluk:-4,acik:'Gelişim ihtimali %25 azalır. Haftalık yorgunluk değişimi normalden 4 puan daha düşük olur.'},
  normal:{ad:'Normal',gelisim:1,yorgunluk:0,acik:'Mevcut gelişim ve toparlanma dengesi.'},
  yogun:{ad:'Yoğun',gelisim:1.2,yorgunluk:8,acik:'Dinç oyuncuda gelişim ihtimali %20 artar. Haftalık yorgunluk değişimine +8 eklenir. Yorgunluk 40 üzerindeyken yoğun çalışma verimi azalır.'}
};
function antrenmanYogunlugu(){return Object.prototype.hasOwnProperty.call(ANTRENMAN_YOGUNLUKLARI,kariyer.antrenmanYogunluk)?ANTRENMAN_YOGUNLUKLARI[kariyer.antrenmanYogunluk]:ANTRENMAN_YOGUNLUKLARI.normal;}
function antrenmanGelisimCarpani(o){
  const y=antrenmanYogunlugu();
  return y.gelisim*(y===ANTRENMAN_YOGUNLUKLARI.yogun?Math.max(.5,1-Math.max(0,yorOf(o)-40)/100):1);
}
function antrenmanYogunlukSec(id){
  if(!Object.prototype.hasOwnProperty.call(ANTRENMAN_YOGUNLUKLARI,id))return;
  kariyer.antrenmanYogunluk=id;kaydet();antrenmanYogunlukEkrani();
}
function antrenmanYogunlukEkrani(){
  const secili=antrenmanYogunlugu(),liste=tumKadro(),ort=liste.reduce((s,o)=>s+yorOf(o),0)/Math.max(1,liste.length);
  let h='<button class="geri" onclick="kadroEkrani()">← Takım</button><h2>Antrenman Yoğunluğu</h2><section class="gelisim-kart"><small>HAFTALIK KADRO PLANI</small><h3>'+secili.ad+' çalışma</h3><p>Kadro ortalama yorgunluğu: <b>'+ort.toFixed(0)+'/100</b></p><p>İlk 5 ve yedeklere uygulanır. Akademi ve harita antrenmanı ayrı çalışır. Plan, Haftayı Bitir dediğinde gelişim ve toparlanmaya birlikte uygulanır.</p></section>';
  Object.entries(ANTRENMAN_YOGUNLUKLARI).forEach(([id,y])=>{
    h+='<section class="gelisim-kart yogunluk-kart'+(secili===y?' aktif':'')+'"><small>'+ (secili===y?'SEÇİLİ PLAN':'ANTRENMAN PLANI')+'</small><h3>'+y.ad+'</h3><p>'+y.acik+'</p><button class="buton '+(secili===y?'ikincil':'')+'" onclick="antrenmanYogunlukSec(\''+id+'\')" aria-pressed="'+(secili===y)+'">'+(secili===y?'Seçili':y.ad+' Çalışmayı Seç')+'</button></section>';
  });
  if(secili===ANTRENMAN_YOGUNLUKLARI.yogun && liste.some(o=>yorOf(o)>40)) h+='<div class="uyari">Bazı oyuncuların yorgunluğu 40 üzerinde. Yoğun çalışmanın gelişim verimi bu oyuncularda azalıyor.</div>';
  h+='<div class="gelisim-ipucu">Yoğun çalışma sürekli en iyi seçenek değildir. Yorgunluk maç performansını ve yoğun antrenman verimini etkiler. Yaşa bağlı gerileme ve potansiyel sınırı değişmez.</div><button class="buton ikincil" onclick="odakEkrani()">Oyuncu Odaklarını Düzenle</button>';
  uygulama.innerHTML=h;
}
function izlemeKaydiGecerli(x){
  const s=x?.sonBilgi;
  return !!x && typeof x.id==='string' && /^p[1-9][0-9]*$/.test(x.id) && s && typeof s.ad==='string' && Object.prototype.hasOwnProperty.call(TARZLAR,s.rol) && Number.isFinite(s.yas) && Number.isFinite(s.genel) && Number.isFinite(s.maas) && Number.isFinite(s.bedel) && s.ozellikler && OZELLIKLER.every(z=>Number.isFinite(s.ozellikler[z]));
}
function izlemeHazirla(){
  if(!Array.isArray(kariyer.izlemeListesi))kariyer.izlemeListesi=[];
  const gorulen=new Set();
  kariyer.izlemeListesi=kariyer.izlemeListesi.filter(x=>{if(!izlemeKaydiGecerli(x)||gorulen.has(x.id))return false;gorulen.add(x.id);return true;}).slice(0,20);
  const mevcut=tumKadro().concat(kariyer.serbest||[]);
  kariyer.izlemeListesi.forEach(x=>{const o=mevcut.find(o=>o.kimlik===x.id);if(o){x.sonBilgi=izlemeFotografi(o);x.sonHafta=kariyer.hafta;}});
}
function izlemeFotografi(o){
  return {ad:o.ad,rol:o.rol,yas:o.yas,genel:o.genel,maas:oyuncuMaasi(o),bedel:transferUcreti(o),ozellikler:Object.fromEntries(OZELLIKLER.map(z=>[z,o[z]]))};
}
function izlemeOyuncusu(id){return tumKadro().concat(kariyer.serbest||[]).find(o=>o.kimlik===id);}
function izlemeEkle(o){
  izlemeHazirla();if(!o || !tumKadro().concat(kariyer.serbest||[]).includes(o))return;
  const id=oyuncuKimligi(o);
  if(kariyer.izlemeListesi.some(x=>x.id===id))return;
  if(kariyer.izlemeListesi.length>=20){alert('İzleme listesinde en fazla 20 oyuncu olabilir.');return;}
  kariyer.izlemeListesi.push({id,sonBilgi:izlemeFotografi(o),sonHafta:kariyer.hafta});kaydet();
}
function izlemePiyasaEkle(i){const o=(kariyer.serbest||[])[i];if(o)izlemeEkle(o);transferSec(i);}
function izlemeKadroEkle(i){izlemeEkle(tumKadro()[i]);izlemeEkrani();}
function izlemeSil(i){izlemeHazirla();if(!Number.isInteger(i)||!kariyer.izlemeListesi[i])return;kariyer.izlemeListesi.splice(i,1);kaydet();izlemeEkrani();}
function izlemeSozlesmeUyarilari(){
  izlemeHazirla();const hf=kariyer.hafta||1;
  return kariyer.izlemeListesi.flatMap(x=>{
    const o=izlemeOyuncusu(x.id);
    return o&&tumKadro().includes(o)&&Number.isFinite(o.bitis)&&o.bitis-hf+1<=SOZLESME_UYARI_HAFTA?[{ad:o.ad,kalan:o.bitis-hf+1}]:[];
  });
}
function izlemeEkrani(){
  serbestHazirla();izlemeHazirla();
  let h='<button class="geri" onclick="piyasaMenu()">← Transfer</button><h2>İzleme Listesi</h2><div class="gelisim-ipucu">Piyasada oyuncu detayından takip ekle. Piyasadan ayrılan oyuncunun son bilinen bilgileri korunur. Kadrona kattığında aynı oyuncuyu takip etmeye devam edersin.</div>';
  const u=izlemeSozlesmeUyarilari();
  if(u.length)h+='<section class="gelisim-kart"><small>SÖZLEŞME TAKİBİ</small>'+u.map(x=>'<p><b>'+oyunAdi(x.ad)+'</b> · '+(x.kalan>0?x.kalan+' hafta kaldı':'Sözleşme bitti')+'</p>').join('')+'<button class="buton ikincil" onclick="sozlesmeEkrani()">Sözleşmeleri İncele</button></section>';
  if(!kariyer.izlemeListesi.length)h+='<p>Henüz takip ettiğin oyuncu yok.</p>';
  kariyer.izlemeListesi.forEach((x,i)=>{
    const o=izlemeOyuncusu(x.id),s=x.sonBilgi,benim=o&&tumKadro().includes(o),piyasa=o&&(kariyer.serbest||[]).includes(o);
    h+='<article class="gelisim-kart"><small>'+(!o?'SON BİLİNEN BİLGİ · HAFTA '+x.sonHafta:benim?'KADRONDA':'TRANSFER PİYASASINDA')+'</small><h3>'+oyunAdi(s.ad)+'</h3><p>'+oyunYazisi(s.rol)+' · '+s.yas+' yaş · GEN '+s.genel+'</p><div class="analiz-izgara"><div><small>'+(benim?'MAAŞ / HAFTA':'TAHMİNİ MAAŞ / HAFTA')+'</small><b>'+para(s.maas)+'</b></div><div><small>PİYASA DEĞERİ</small><b>'+para(s.bedel)+'</b></div></div>';
    if(!benim)h+='<p>Sözleşme bitiş bilgisi mevcut değil.</p>';
    if(!o)h+='<p>Bu oyuncu artık mevcut transfer havuzunda değil; buradan transfer başlatılamaz.</p>';
    h+='<button class="buton ikincil" onclick="izlemeKarsilastir('+i+')">Kadronla Karşılaştır</button>';
    if(piyasa)h+='<button class="buton" onclick="transferSec('+kariyer.serbest.indexOf(o)+')">Transfer Detayına Git</button>';
    h+='<button class="izleme-kaldir" onclick="izlemeSil('+i+')">Takibi Bırak</button></article>';
  });
  h+='<details class="kadro-detay"><summary>Kadromdan oyuncu takip et</summary><p>Kendi oyuncularını ekleyerek sözleşmelerini de takip edebilirsin.</p>';
  tumKadro().forEach((o,i)=>{const varMi=kariyer.izlemeListesi.some(x=>x.id===o.kimlik);h+='<button class="takim-butonu" onclick="izlemeKadroEkle('+i+')"'+(varMi?' disabled':'')+'><span>'+oyunAdi(o.ad)+'</span><span>'+(varMi?'Takip ediliyor':'Takibe Ekle')+'</span></button>';});
  uygulama.innerHTML=h+'</details><button class="buton" onclick="transferEkrani()">Transfer Piyasası</button>';kaydet();
}
function izlemeKarsilastir(i,k){
  izlemeHazirla();const x=kariyer.izlemeListesi[i];if(!x){izlemeEkrani();return;}
  const a=x.sonBilgi,liste=tumKadro();
  if(!Number.isInteger(k)||!liste[k]){k=liste.findIndex(o=>o.rol===a.rol);if(k<0)k=0;}
  const b=liste[k];if(!b)return;
  let h="<button class=\"geri\" onclick=\"izlemeEkrani()\">← İzleme Listesi</button><h2>Oyuncu Karşılaştırması</h2><p data-ceviri-isim-on-eki=\"" + oyunYazisi(a.ad) + "\">"+oyunYazisi(a.ad)+(!izlemeOyuncusu(x.id)?' için son bilinen veriler kullanılıyor.':' ile kendi oyuncunu karşılaştır.')+'</p><label class="gelisim-alan" for="izleme-kadro">Kadro oyuncusu<select class="alan" id="izleme-kadro" onchange="izlemeKarsilastir('+i+',Number(this.value))">'+liste.map((o,n)=>dilOyuncuSecenegi(o.ad,o.rol,n,k===n)).join('')+'</select></label><div class="tablo-kutusu"><table class="izleme-tablo"><tr><th>Özellik</th><th>'+oyunAdi(a.ad)+'</th><th>'+oyunAdi(b.ad)+'</th></tr>';
  const rows=[['Rol',a.rol,b.rol],['Yaş',a.yas,b.yas],['GEN',a.genel,b.genel],['Maaş / hafta',para(a.maas),para(oyuncuMaasi(b))],...OZELLIKLER.map(z=>[ODAK_ADLARI[z]||z,a.ozellikler[z],b[z]])];
  rows.forEach(([ad,v,w])=>{h+='<tr><td>'+oyunYazisi(ad)+'</td><td>'+oyunYazisi(v)+'</td><td>'+oyunYazisi(w)+'</td></tr>';});
  uygulama.innerHTML=h+'</table></div><p>GEN rol ağırlıklarıyla hesaplanır. Farklı rolleri karşılaştırırken gerekli özellikleri birlikte değerlendir; fiyatlar pazarlıkla değişebilir.</p>';
}
function izlemeHaftalik(rapor){
  izlemeHazirla();izlemeSozlesmeUyarilari().forEach(x=>rapor.push('Takip: '+x.ad+' · '+(x.kalan>0?'Sözleşmesi '+x.kalan+' hafta sonra bitiyor.':'Sözleşmesi bitti.')));
}
