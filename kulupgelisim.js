// Kulüp hikâyesi ve isteğe bağlı hedefler: para/güç ödülü yok.
function kulupGelisimHazirla() {
  if (!kariyer?.sezon) return;
  kariyer.kulupTarihce ||= {oyuncular:{},enFarkli:null,enFarkliSeri:null};
  if(kariyer.sezonHedefi?.sezon!==kariyer.sezon.no) kariyer.sezonHedefi={sezon:kariyer.sezon.no,id:null,akademi:0};
  kulupEfsaneleriniGuncelle();
}
function kulupEfsaneleriniGuncelle() {
  const t=kariyer.kulupTarihce;
  if(!t)return;
  tumKadro().forEach(o=>{ const s=o.ist || {}; t.oyuncular[oyuncuKimligi(o)]={ad:o.ad,mac:s.m||0,kill:s.ol||0,death:s.od||0}; });
}
const SEZON_HEDEFLERI=[
  {id:'sira',ad:'İlk 5 için mücadele',acik:'Sezonu ligde ilk 5 içinde bitir.'},
  {id:'butce',ad:'Sağlam mali temel',acik:'Sezon ödülleri eklenmeden önce, hedefi seçtiğin andaki bütçeyi koru ve borçsuz kal.'},
  {id:'akademi',ad:'Geleceğe yatırım',acik:'Hedefi seçtikten sonra akademiden en az bir oyuncuyu yedek kadroya yükselt.'},
  {id:'genc',ad:'Bir oyuncuyu geliştir',acik:'Seçim anında 24 yaşından küçük olan bir oyuncunu en az 2 GEN geliştir ve sezon sonuna kadar kadroda tut.'}
];
function sezonHedefSec(id) {
  kulupGelisimHazirla(); const h=kariyer.sezonHedefi;
  if(h.id || h.sonuclandi || kariyer.sezon.bitti || !SEZON_HEDEFLERI.some(x=>x.id===id))return;
  if(id==='akademi' && !(kariyer.scout>0)){alert('Bu hedef için önce scout işe al.');return;}
  const gencler=tumKadro().filter(o=>o.yas<24);
  if(id==='genc' && !gencler.length){alert('Bu hedef için kadroda 24 yaşından küçük bir oyuncu olmalı.');return;}
  Object.assign(h,{id,baslangicButce:kariyer.butce,akademi:0,oyuncular:gencler.map(o=>({id:oyuncuKimligi(o),genel:o.genel}))});
  kaydet(); sezonHedefEkrani();
}
function sezonHedefDurumu(sira) {
  const h=kariyer.sezonHedefi;
  if(!h?.id)return false;
  if(h.id==='sira')return (sira || siralama().indexOf(0)+1)<=5;
  if(h.id==='butce')return kariyer.butce>=Math.max(0,h.baslangicButce);
  if(h.id==='akademi')return h.akademi>=1;
  return (h.oyuncular||[]).some(e=>tumKadro().some(o=>oyuncuKimligi(o)===e.id && o.genel>=e.genel+2));
}
function sezonHedefSonuclandir(sira) {
  kulupGelisimHazirla(); const h=kariyer.sezonHedefi;
  if(!h.id || h.sonuclandi)return;
  h.sonuclandi=true; h.basarili=sezonHedefDurumu(sira);
  (kariyer.hedefGecmisi ||= []).push(JSON.parse(JSON.stringify(h)));
}
function sezonHedefEkrani() {
  kulupGelisimHazirla(); const h=kariyer.sezonHedefi, secili=SEZON_HEDEFLERI.find(x=>x.id===h.id);
  let html='<button class="geri" onclick="kariyerEkrani()">← Ana Ekran</button><h2>Sezon Hedefi</h2><div class="gelisim-ipucu">İsteğe bağlı: sezon başına bir hedef. Başarı, tarihçene bir sezon rozeti ekler; para veya güç kazandırmaz. Başaramazsan ceza yok.</div>';
  if(secili)html+='<section class="gelisim-kart"><small>SEZON '+h.sezon+'</small><h3>'+secili.ad+'</h3><p>'+secili.acik+'</p><b>'+(sezonHedefDurumu()?'Şu an koşul sağlanıyor':'Hedef üzerinde çalışıyorsun')+'</b><p>Sonuç sezon kapanışında kesinleşir. Seçilen hedef bu sezon değişmez.</p>'+(h.id==='butce'?'<p>Korunacak bütçe: '+para(Math.max(0,h.baslangicButce))+'</p>':'')+'</section>';
  else if(!kariyer.sezon.bitti) SEZON_HEDEFLERI.forEach(x=>{html+='<section class="gelisim-kart"><h3>'+x.ad+'</h3><p>'+x.acik+'</p><button class="buton ikincil" onclick="sezonHedefSec(\''+x.id+'\')">Bu Hedefi Seç</button></section>';});
  else html+='<p>Yeni hedefi gelecek sezon seçebilirsin.</p>';
  uygulama.innerHTML=html+'<button class="buton ikincil" onclick="kariyerEkrani()">'+(secili?'Kulübe Dön':'Hedef Seçmeden Devam Et')+'</button>';
}
function kulupMacKaydet(B,s,seri) {
  kulupGelisimHazirla(); const key=seri?'enFarkliSeri':'enFarkli',t=kariyer.kulupTarihce;
  if(s.sa>s.sb && (!t[key] || s.sa-s.sb>t[key].fark)) t[key]={rakip:B.ad,sa:s.sa,sb:s.sb,fark:s.sa-s.sb,harita:s.harita||'BO3',sezon:kariyer.sezon.no};
  kulupEfsaneleriniGuncelle();
}
function kulupTarihceEkrani() {
  kulupGelisimHazirla(); const t=kariyer.kulupTarihce,g=kariyer.gecmis||[],kupalar=(kariyer.turnuvaGecmis||[]).filter(x=>x.yer==='Şampiyon!');
  let h='<button class="geri" onclick="kulupMenu()">← Kulüp</button><h2>Kulüp Tarihçesi</h2><section class="gelisim-kart"><small>KUPA VİTRİNİ</small><div class="analiz-izgara"><div><small>LİG ŞAMPİYONLUĞU</small><b>'+g.filter(x=>x.sira===1).length+'</b></div><div><small>TURNUVA KUPASI</small><b>'+kupalar.length+'</b></div><div><small>YÜKSELME</small><b>'+g.filter(x=>x.yeniLig<x.lig).length+'</b></div><div><small>HEDEF ROZETİ</small><b>'+(kariyer.hedefGecmisi||[]).filter(x=>x.basarili).length+'</b></div></div></section>';
  [t.enFarkli,t.enFarkliSeri].forEach((r,i)=>{if(r)h+='<div class="gelisim-kart"><small>EN FARKLI '+(i?'SERİ':'LİG MAÇI')+' GALİBİYETİ</small><h3>'+r.sa+' – '+r.sb+'</h3><p>'+oyunYazisi(r.rakip)+' · '+oyunYazisi(r.harita)+' · Sezon '+r.sezon+'</p></div>';});
  h+='<h2>Kulüp Efsaneleri</h2><p>En çok maça çıkan oyuncular. Ayrılan oyuncuların kaydı korunur; yeni rekorlar bu sürümden itibaren tutulur.</p>';
  const oyuncular=Object.values(t.oyuncular).filter(o=>o.mac>0).sort((a,b)=>b.mac-a.mac||b.kill-a.kill).slice(0,5);
  if(!oyuncular.length)h+='<p>İlk maçını tamamladığında oyuncular burada görünecek.</p>';
  oyuncular.forEach(o=>{h+='<div class="gelisim-satir"><b>'+oyunYazisi(o.ad)+'</b><span>'+o.mac+' maç · '+o.kill+' öldürme</span></div>';});
  h+='<h2>Sezon Rozetleri</h2>';
  (kariyer.hedefGecmisi||[]).slice().reverse().forEach(x=>{const hedef=SEZON_HEDEFLERI.find(y=>y.id===x.id);h+='<div class="gelisim-satir"><b>Sezon '+x.sezon+' · '+oyunYazisi(hedef?.ad||x.id)+'</b><span>'+(x.basarili?'Tamamlandı':'Tamamlanmadı')+'</span></div>';});
  uygulama.innerHTML=h+'<button class="buton ikincil" onclick="arsivEkrani()">Sezonlar ve Turnuva Arşivi</button>'; kaydet();
}
function macDegerlendirme(c) {
  if(c.sa>c.sb)return null;
  const a=c.A.oyuncular,b=c.B.oyuncular,risk=[];
  function ekle(agirlik,baslik,acik,oneri,fn){risk.push({agirlik,baslik,acik,oneri,fn});}
  const guc=ortGuc(b)-ortGuc(a),form=formEtkisi(a),taktik=taktikUstunluk(c.tA,c.tB);
  if(guc>1)ekle(guc,'Rakibin kadro gücü','Rakibin ortalama GEN değeri '+guc.toFixed(1)+' puan daha yüksekti.','Önce en zayıf rolünü antrenmanla geliştir.','odakEkrani()');
  if(form<0)ekle(-form,'Yorgunluk ve moral','Kadronun form etkisi '+form.toFixed(1)+' güçtü.','Dinlenme ve yedek rotasyonunu değerlendir.','yedekEkrani()');
  if(c.hf<0)ekle(-c.hf,'Harita dezavantajı','Bu haritadaki hazırlık farkı '+c.hf+' güçtü.','Bu haritayı antrenman odağına al veya sonraki yasaklamada değerlendir.','haritaAntrenmanEkrani()');
  if(taktik<0)ekle(-taktik,'Son bölümde taktik dezavantajı',c.tA+' taktiğin rakibin '+c.tB+' planına karşı dezavantajlıydı.','Devre arasında rakibin planını ve karşı taktiği kontrol et.','stratejiRehberi()');
  if(takimKimyasi()<40)ekle(3,'Yeni kadro uyumu','Takım kimyası henüz başlangıç seviyesinin altında.','Kadronun birlikte çalışması için zaman tanı.','kimyaEkrani()');
  if(!risk.length)ekle(0,'Dengeli koşullarda mağlubiyet','Belirgin bir kadro, form veya harita dezavantajı görünmüyor.','Tek maç yüzünden kadroyu dağıtma; birkaç maçlık performansı incele.','istatistikEkrani()');
  risk.sort((x,y)=>y.agirlik-x.agirlik);
  return {rakip:c.B.ad,harita:c.harita,sa:c.sa,sb:c.sb,noktalar:risk.slice(0,2)};
}
function macDegerlendirmeHtml(r, gezinme=true) {
  if(!r)return '';
  const fns=['odakEkrani()','yedekEkrani()','haritaAntrenmanEkrani()','stratejiRehberi()','kimyaEkrani()','istatistikEkrani()'];
  return '<section class="gelisim-kart"><small>MAÇ SONRASI DEĞERLENDİRME</small><h3>Bir sonraki maç için</h3><p>'+oyunYazisi(r.harita)+' · '+r.sa+' – '+r.sb+' · '+oyunYazisi(r.rakip)+'</p><p>Gözlenen koşullar; mağlubiyetin kesin nedenleri değildir. Taktik bilgisi maçın son bölümünü yansıtır.</p>'+r.noktalar.map(x=>'<div class="gelisim-not"><b>'+oyunYazisi(x.baslik)+'</b><p>'+oyunYazisi(x.acik)+'</p><p>'+oyunYazisi(x.oneri)+'</p>'+(gezinme?'<button class="buton ikincil" onclick="'+(fns.includes(x.fn)?x.fn:'istatistikEkrani()')+'">İlgili Ekrana Git</button>':'')+'</div>').join('')+'</section>';
}
