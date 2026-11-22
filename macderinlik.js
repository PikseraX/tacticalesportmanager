// Maç hazırlığı, kişilikler ve rekabet geçmişi.
const KISILIKLER={
  dengeli:{ad:'Dengeli',acik:'Ek kişilik etkisi yok.'},
  mentor:{ad:'Mentor',acik:'27 yaş ve üzerindeyken ilk 5’te bulunursa 24 yaş altı kadro oyuncularının antrenman gelişim ihtimaline %5 destek verir. Birden fazla mentorun etkisi birikmez.'},
  rekabetci:{ad:'Büyük maç oyuncusu',acik:'Turnuva yarı finali/finali ve sezonun son dört lig maçında ilk üçteki iki takım karşılaştığında +1 bireysel maç gücü.'},
  sabirsiz:{ad:'Sabırsız',acik:'Üst üste üç hafta yedekte kalıp maça çıkmazsa haftalık moraline ek -1 uygulanır. Bu ek kayıp morali 40 altına indirmez.'}
};
function kisilikAta(o){
  if(Object.prototype.hasOwnProperty.call(KISILIKLER,o.kisilik))return;
  let h=2166136261;for(const c of String(o.ad||''))h=Math.imul(h^c.codePointAt(0),16777619)>>>0;
  o.kisilik=['dengeli','mentor','rekabetci','sabirsiz'][h%4];
}
function kisilikOf(o){return KISILIKLER[o.kisilik]||KISILIKLER.dengeli;}
function kisilikHazirla(){
  tumKadro().concat(kariyer.serbest||[],kariyer.akademi||[],kariyer.adaylar||[],dunya.flatMap(t=>t.oyuncular)).forEach(kisilikAta);
}
function mentorCarpani(o){
  return o.yas<24 && kariyer.oyuncular.some(x=>x.yas>=27 && x.kisilik==='mentor')?1.05:1;
}
function kisilikHaftalik(rapor){
  const hf=kariyer.hafta||1;
  tumKadro().forEach(kisilikAta);
  kariyer.oyuncular.forEach(o=>o.yedekHaftasi=0);
  yedekListe().forEach(o=>{
    o.yedekHaftasi=o.sonOynadigiHafta===hf-1?0:(o.yedekHaftasi||0)+1;
    if(o.kisilik==='sabirsiz' && o.yedekHaftasi>=3 && moralOf(o)>40){o.mor=Math.max(40,moralOf(o)-1);rapor.push(o.ad+': yedek kaldığı için sabırsızlanıyor (ek moral -1).');}
  });
}
function kisilikEkrani(){
  kisilikHazirla();let h='<button class="geri" onclick="kadroEkrani()">← Takım</button><h2>Oyuncu Kişilikleri</h2><p>Kişilik sabittir; ekrana girip çıkarak değişmez. Mentor desteği birikmez, büyük maç etkisi oyuncu başına yalnızca +1 güçtür.</p>';
  tumKadro().forEach(o=>{const k=kisilikOf(o);h+='<section class="gelisim-kart"><small>'+oyunYazisi(o.rol)+' · '+o.yas+' YAŞ</small><h3>'+oyunAdi(o.ad)+'</h3><b>'+k.ad+'</b><p>'+k.acik+'</p></section>';});uygulama.innerHTML=h;
}
const MAC_HAZIRLIK_PLANLARI={
  standart:{ad:'Standart',acik:'Ek hazırlık etkisi yok. Mevcut taktik dengesini korur.'},
  guvenli:{ad:'Güvenli başlangıç',acik:'İlk 6 raund +3, sonraki raundlar -1 güç. İyi başlangıç için uzun maçta küçük bir bedel ödersin.'},
  utility:{ad:'Utility odaklı oyun',acik:'İlk 3 raund -2 güç. Sonrasında Utility ve Takım Oyunu ortalaman rakipten en az 3 yüksekse +2, daha az farkla öndeyse +0,5, gerideyse -2 güç.'},
  yildiz:{ad:'Yıldızı baskıla',acik:'Rakibin en güçlü oyuncusu takım ortalamasından en az 5 GEN yüksekse +2; aksi durumda -2 güç. Kendi Karar Verme ortalaman 55 altındaysa ayrıca -1.'}
};
function hazirlikPlanEtkisi(c){
  const n=c.sa+c.sb+1;
  if(c.hazirlikPlan==='guvenli')return n<=6?3:-1;
  if(c.hazirlikPlan==='utility'){
    if(n<=3)return -2;
    const ort=l=>l.reduce((s,o)=>s+(o.utility+o.takimoyunu)/2,0)/l.length;
    const fark=ort(c.A.oyuncular)-ort(c.B.oyuncular);return fark>=3?2:fark>=0?.5:-2;
  }
  if(c.hazirlikPlan==='yildiz'){
    const fark=Math.max(...c.B.oyuncular.map(o=>o.genel))-ortGuc(c.B.oyuncular);
    return (fark>=5?2:-2)-(c.A.oyuncular.reduce((s,o)=>s+o.karar,0)/c.A.oyuncular.length<55?1:0);
  }
  return 0;
}
function onemliMacMi(B,seri){
  if(seri && seri.playoff)return true;
  if(seri)return !!kariyer.turnuva && kariyer.turnuva.hayatta.length<=4;
  const sz=kariyer.sezon;
  if(!sz || sz.gun<sz.fikstur.length-4)return false;
  const idx=sz.takimlar.findIndex((id,i)=>i>0 && dunya[id]?.ad===B.ad), ilk=siralama().slice(0,3);
  return idx>0 && ilk.includes(0) && ilk.includes(idx);
}
function kisilikMacEtkisi(c){
  if(!c.onemliMac)return 0;
  const etki=l=>l.filter(o=>o.kisilik==='rekabetci').length/l.length;
  return etki(c.A.oyuncular)-etki(c.B.oyuncular);
}
function hazirlikPlanSec(id){
  if(!canli || canli.macEkrani!=='hazirlik' || canli.sa+canli.sb>0 || !Object.prototype.hasOwnProperty.call(MAC_HAZIRLIK_PLANLARI,id))return;
  canli.hazirlikPlan=id;kaydet();ekraniKonumdaGuncelle(canliHazirlikEkrani);
}
function hazirlikPlanHtml(c){
  return '<section class="gelisim-kart"><small>HARİTA HAZIRLIK PLANI</small><h3>'+(MAC_HAZIRLIK_PLANLARI[c.hazirlikPlan]||MAC_HAZIRLIK_PLANLARI.standart).ad+'</h3><p>Bu harita için bir plan seç. Taktikten ayrıdır ve maç başlayınca değişmez.</p><div class="hazirlik-planlari">'+Object.entries(MAC_HAZIRLIK_PLANLARI).map(([id,p])=>'<button class="hazirlik-plan '+((c.hazirlikPlan||'standart')===id?'aktif':'')+'" onclick="hazirlikPlanSec(\''+id+'\')" aria-pressed="'+((c.hazirlikPlan||'standart')===id)+'"><b>'+p.ad+'</b><small>'+p.acik+'</small></button>').join('')+'</div>'+(c.onemliMac?'<p>Önemli karşılaşma: Büyük maç oyuncusu kişiliğinin etkisi etkin.</p>':'')+'</section>';
}
function hizliMacKullanilabilir(){return !kariyer.rehber || ['tamamlandi','atlandi'].includes(kariyer.rehber.durum) || (kariyer.galibiyet||0)+(kariyer.maglubiyet||0)>0;}
function hizliMacModuSec(mod){
  if(!canli || canli.macEkrani!=='hazirlik' || canli.sa+canli.sb>0 || !['canli','hizli'].includes(mod) || (mod==='hizli'&&!hizliMacKullanilabilir()))return;
  canli.macModu=mod;kariyer.macModuTercihi=mod;kaydet();ekraniKonumdaGuncelle(canliHazirlikEkrani);
}
function hizliMacSecimHtml(c){
  if(!hizliMacKullanilabilir())return '<p>Hızlı maç, rehberi tamamladığında veya Atla dediğinde açılır. İlk maçından sonra da kullanılabilir.</p>';
  return '<section class="gelisim-kart"><small>MAÇI NASIL YÖNETECEKSİN?</small><div class="mac-modlari">'+[['canli','Spiker Anlatımı'],['hizli','Hızlı Maç']].map(([id,ad])=>'<button class="buton ikincil" onclick="hizliMacModuSec(\''+id+'\')" aria-pressed="'+((c.macModu||'canli')===id)+'">'+ad+((c.macModu||'canli')===id?' · Seçili':'')+'</button>').join('')+'</div><p>Hızlı maç aynı raund motorunu kullanır. Devre arasında durur; taktik, oyuncu değişikliği ve mola kararı verebilirsin. BO3 haritaları ayrı ayrı yönetilir.</p></section>';
}
function hizliMacDevreMolasi(){
  const c=canli;if(!c || c.macEkrani!=='devre' || c.mola<=0 || c.devreMolasiKullanildi)return;
  c.mola--;c.serA=0;c.molaTur=MOLA_TUR;c.devreMolasiKullanildi=true;c.olaylar.push('Devre arası takım molası ('+c.sa+'-'+c.sb+')');kaydet();ekraniKonumdaGuncelle(yariEkrani);
}
function rekabetHazirla(){kariyer.rekabetler ||= {};kariyer.rekabetHaberleri ||= [];}
function rekabetAnahtari(B){const i=dunya.findIndex(t=>t.ad===B.ad);return i>=0?'r'+i:'ad:'+B.ad;}
function rekabetSonucKaydet(B,s,seri,olay){
  if(!B || !s || s.sa===s.sb)return;
  rekabetHazirla();const key=rekabetAnahtari(B);
  const r=kariyer.rekabetler[key] ||= {ad:B.ad,mac:0,g:0,m:0,yakin:0,sonuclar:[],olaylar:[]};
  if(r.olaylar.includes(olay))return;
  r.olaylar.push(olay);r.olaylar=r.olaylar.slice(-60);r.mac++;s.sa>s.sb?r.g++:r.m++;
  if(seri?s.sa+s.sb===3:Math.abs(s.sa-s.sb)<=3)r.yakin++;
  r.sonuclar.unshift({sezon:kariyer.sezon.no,hafta:kariyer.hafta,sa:s.sa,sb:s.sb,tur:seri?'BO3':'Lig',harita:s.harita||'BO3'});r.sonuclar=r.sonuclar.slice(0,6);
  const yazi=B.ad+' ile '+r.mac+'. karşılaşma: '+s.sa+'–'+s.sb+'.'+(r.mac>=3&&r.yakin>=2?' Çekişmeli rekabet sürüyor.':'');
  kariyer.rekabetHaberleri.unshift({hafta:kariyer.hafta,yazi});kariyer.rekabetHaberleri=kariyer.rekabetHaberleri.slice(0,16);
}
function rekabetHtml(B){
  rekabetHazirla();const r=kariyer.rekabetler[rekabetAnahtari(B)];if(!r)return '';
  const son=r.sonuclar[0];
  return '<section class="gelisim-kart"><small>'+(r.mac>=3&&r.yakin>=2?'ÇEKİŞMELİ REKABET':'GEÇMİŞ KARŞILAŞMALAR')+'</small><h3>'+oyunAdi(B.ad)+'</h3><p>'+r.mac+' karşılaşma · '+r.g+' galibiyet · '+r.m+' mağlubiyet</p><p>Son maç: '+son.tur+' · '+son.sa+'–'+son.sb+' · Sezon '+son.sezon+'</p><p>Rekabet geçmişi maç gücünü değiştirmez.</p></section>';
}
function rekabetEkrani(){
  rekabetHazirla();let h='<button class="geri" onclick="ligMenu()">← Lig ve Turnuva</button><h2>Rekabetler</h2><p>Lig maçları ve BO3 serileri ayrı karşılaşma olarak kaydedilir. Geçmiş bu sürümden itibaren tutulur; önceki maçlar tahmin edilmez.</p>';
  const liste=Object.values(kariyer.rekabetler).sort((a,b)=>b.mac-a.mac);
  if(!liste.length)h+='<p>İlk lig maçını veya BO3 serini tamamladığında rakip geçmişi oluşacak.</p>';
  liste.forEach(r=>{h+=rekabetHtml({ad:r.ad})+'<details class="kadro-detay"><summary>Son karşılaşmalar</summary>'+r.sonuclar.map(s=>'<p>Sezon '+s.sezon+' · '+s.tur+' · '+s.sa+'–'+s.sb+' · '+oyunYazisi(s.harita)+'</p>').join('')+'</details>';});uygulama.innerHTML=h;
}
function rekabetHaftalik(rapor){rekabetHazirla();kariyer.rekabetHaberleri.filter(x=>x.hafta===kariyer.hafta-1).slice().reverse().forEach(x=>rapor.push(x.yazi));}
