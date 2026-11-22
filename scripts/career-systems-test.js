const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, { id, value:'',innerHTML:'',textContent:'',style:{},dataset:{},
    querySelectorAll(){return []},querySelector(){return null},setAttribute(){},remove(){},focus(){},appendChild(){},classList:{add(){},remove(){}} });
  return elements.get(id);
}
const storage = new Map();
const ctx = vm.createContext({console, Math:Object.create(Math), Date, JSON,
  document:{ getElementById:element, querySelector:()=>null,querySelectorAll:()=>[],body:{insertBefore(){},appendChild(){}},createElement:()=>element('created'),hidden:false,addEventListener(){} },
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  MutationObserver:class{observe(){}},confirm:()=>true,alert:()=>{},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){}});
ctx.window=ctx;ctx.scrollTo=()=>{};
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(x=>x[1]);
for(const file of files) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const run=code=>vm.runInContext(code,ctx);
element('takimAdi').value='Test Kulübü';run('kariyerBaslat()');
assert.equal(run('kariyer.oyuncular.length'),5);
assert.equal(run('kariyer.rehber.durum'),'teklif');
assert.equal(run('takimKimyasi()'),40);
const before=run('JSON.stringify(kariyer)');
run('kimyaHazirla();kimyaHazirla()');assert.equal(run('takimKimyasi()'),40,'kimya geçişi tekrar uygulanmaz');
run('kariyer.hafta++;kimyaHaftalik([])');assert.equal(run('takimKimyasi()'),44);
run('kimyaHaftalik([])');assert.equal(run('takimKimyasi()'),44,'haftada tek artış');
run('globalThis.eskisi=kariyer.oyuncular[0];kariyer.oyuncular[0]=serbestOyuncuUret("Yeni");');
assert.ok(run('takimKimyasi()')<44,'yeni oyuncu kimyası sıfırdan');
run('kariyer.oyuncular[0]=eskisi');assert.equal(run('takimKimyasi()'),44,'eski bağlar korunur');
assert.equal(run('kimyaGucEtkisi(dunya[0].oyuncular)'),0,'rakibe kimya eklenmez');
assert.ok(run('kimyaGucEtkisi(kariyer.oyuncular)')<=3);
assert.equal(run('rakipAnalizVerisi(dunya[0],0).yildiz'),undefined);
assert.ok(run('rakipAnalizVerisi(dunya[0],1).yildiz'));
assert.equal(run('rakipAnalizVerisi(dunya[0],1).haritalar'),undefined);
assert.equal(run('rakipAnalizVerisi(dunya[0],2).haritalar.length'),7);
assert.ok(run('rakipAnalizVerisi(dunya[0],3).oneri'));
// Pazarlık: ret/cancel ücret kesmez, sözleşme imzası tek seferde kadroya geçer.
run('serbestHazirla();pazarlikAc(0,"yedek",-1)');const cash=run('kariyer.butce');
element('paz-bonservis').value='0';run('kulupPazarligi()');assert.equal(run('kariyer.butce'),cash);
element('paz-bonservis').value=String(run('pazarlikOyuncusu().transferTalep.bonservis'));run('kulupPazarligi()');assert.equal(run('kariyer.gorusme.asama'),'oyuncu');
element('paz-maas').value=String(run('pazarlikOyuncusu().transferTalep.maas'));
element('paz-imza').value=String(run('pazarlikOyuncusu().transferTalep.imza'));element('paz-sure').value='26';
run('oyuncuPazarligi()');assert.equal(run('kariyer.gorusme.asama'),'tamam');assert.equal(run('kariyer.butce'),cash);
const cost=run('kariyer.gorusme.bonservis+kariyer.gorusme.imza');
run('pazarlikImzala()');assert.equal(run('kariyer.butce'),cash-cost);assert.equal(run('yedekListe().length'),1);
run('pazarlikImzala()');assert.equal(run('kariyer.butce'),cash-cost,'ikinci tıkta para kesilmez');
assert.equal(run('kariyer.oyuncular.length'),5);
run('pazarlikAc(0,"yedek",-1)');element('paz-bonservis').value='-1';run('kulupPazarligi()');assert.equal(run('pazarlikOyuncusu().transferTur.kulup'),0);
// Eksik bütçe ve haftalık teklif sınırı kadroyu/bütçeyi değiştirmemeli.
run('pazarlikAc(0,"yedek",-1)');
element('paz-bonservis').value='0';
run('kulupPazarligi();kulupPazarligi();kulupPazarligi();kulupPazarligi()');
assert.equal(run('pazarlikOyuncusu().transferTur.kulup'),3);
run('kariyer.hafta++;pazarlikEkrani()');
assert.equal(run('pazarlikOyuncusu().transferTur.kulup'),0);
element('paz-bonservis').value=String(run('pazarlikOyuncusu().transferTalep.bonservis'));run('kulupPazarligi()');
element('paz-maas').value=String(run('pazarlikOyuncusu().transferTalep.maas'));
element('paz-imza').value=String(run('pazarlikOyuncusu().transferTalep.imza'));
element('paz-sure').value='26';run('oyuncuPazarligi();kariyer.butce=0');
const rosterBefore=run('JSON.stringify(kariyer.oyuncular.concat(yedekListe()))');
run('pazarlikImzala()');assert.equal(run('kariyer.butce'),0);assert.equal(run('JSON.stringify(kariyer.oyuncular.concat(yedekListe()))'),rosterBefore);
// Scout görevi erken dönmez, tekrarlanmaz; gerçek potansiyel tahmin aralığındadır.
run('kariyer.scout=2;kariyer.butce=500000;scoutGorevBaslat("yerel")');const after=run('kariyer.butce');run('scoutGorevBaslat("kuzey")');assert.equal(run('kariyer.butce'),after);
run('scoutGorevHaftalik([])');assert.ok(run('kariyer.scoutGorevi'));
run('kariyer.hafta+=2;scoutGorevHaftalik([])');assert.equal(run('kariyer.scoutGorevi'),null);const count=run('kariyer.adaylar.length');
assert.ok(run('kariyer.adaylar.every(o=>o.tahmin[0]<=o.pot&&o.tahmin[1]>=o.pot)'));
run('scoutGorevHaftalik([])');assert.equal(run('kariyer.adaylar.length'),count);
run('taraftarHazirla();taraftarMacSonucu(true)');const happy=run('kariyer.taraftar.memnuniyet');run('taraftarMacSonucu(false)');assert.ok(run('kariyer.taraftar.memnuniyet')<happy);
run('taraftarDegis(1000,"test")');assert.equal(run('kariyer.taraftar.memnuniyet'),100);assert.equal(run('taraftarSponsorCarpani()'),1.05);
// Görevsiz öneri yok; yükseltme aday listesini yenilemez, kapasite scout*2.
run('kariyer.scout=0;kariyer.akademi=[];kariyer.adaylar=[];akademiHazirla()');
assert.equal(run('kariyer.adaylar.length'),0);
assert.equal(run('akademiKapasitesi()'),0);
run('kariyer.butce=1000000;scoutYukselt()');
assert.equal(run('kariyer.scout'),1);assert.equal(run('akademiKapasitesi()'),2);
assert.equal(run('kariyer.adaylar.length'),0,'işe alım ücretsiz aday üretmez');
run('scoutYukselt()');assert.equal(run('akademiKapasitesi()'),4);assert.equal(run('kariyer.adaylar.length'),0);
run('scoutYukselt()');assert.equal(run('akademiKapasitesi()'),6);assert.equal(run('kariyer.adaylar.length'),0);
run('globalThis.atananAkademi=bolgeselAday(SCOUT_BOLGELER[0]);kariyer.akademi=[atananAkademi];kariyer.adaylar=[adayUret(),bolgeselAday(SCOUT_BOLGELER[0])];delete kariyer.scoutAdaySurum;akademiHazirla()');
assert.equal(run('kariyer.adaylar.length'),1,'eski görevsiz adaylar temizlenir');assert.equal(run('kariyer.akademi.length'),1,'imzalı akademi oyuncusu korunur');
const beforeCandidates=run('JSON.stringify(kariyer.adaylar)');run('akademiHazirla()');assert.equal(run('JSON.stringify(kariyer.adaylar)'),beforeCandidates,'geçiş tekrarlanmaz');
run('kariyer.scout=1;kariyer.akademi=[atananAkademi,{...atananAkademi,ad:"İkinci"}]');
const beforeFull=run('kariyer.butce');run('adayAl(0)');assert.equal(run('kariyer.butce'),beforeFull);assert.equal(run('kariyer.adaylar.length'),1);
// Belirlenmiş tohumla 20.000 aday/seviye: güçlü aday oranları dar ve artan olmalı.
run('globalThis.eskiRng=Math.random;globalThis.testSeed=71;Math.random=()=>{testSeed=(testSeed*1664525+1013904223)>>>0;return testSeed/4294967296}');
const rates=[];
for(const level of [1,2,3]) {
  const rate=run('(()=>{let elite=0;for(let i=0;i<20000;i++){const p=scoutPotansiyeli('+level+');if(p<45||p>95)throw Error("potansiyel sınırı");if(p>=80)elite++}return elite/20000})()');rates.push(rate);
  assert.ok(Math.abs(rate-[.05,.10,.15][level-1])<.008,'seviye bazlı güçlü aday olasılığı');
}
assert.ok(rates[0]<rates[1]&&rates[1]<rates[2]);
for(let i=0;i<30;i++) {run('kariyer.scoutGorevi={bolge:"yerel",donus:kariyer.hafta};scoutGorevHaftalik([])');assert.ok([1,2].includes(run('kariyer.scoutSonRapor.sayi')));}
run('Math.random=eskiRng');
console.log('Scout testleri: görevsiz aday yok, 2/4/6 kapasite, görevde 1–2 aday; güçlü potansiyel oranları:',rates.map(r=>(r*100).toFixed(2)+'%').join(' / '));
// Eski kayıt: yeni alanlar yokken yükleme, bir lig maçı ve haftayı bitirme.
run('delete kariyer.kimya;delete kariyer.haftaBaslangic;delete kariyer.taraftar;delete kariyer.rehber;kariyerEkrani()');
assert.equal(run('takimKimyasi()'),40);assert.equal(run('kariyer.rehber'),undefined,'eski kayıtta otomatik rehber açılmaz');
run('sezonMaciBitir(macOyna({ad:kariyer.takimAdi,oyuncular:kariyer.oyuncular,strateji:kariyer.strateji},haftaRakip()));haftaGec()');
assert.ok(run('kariyer.sonHaftaOzeti'));assert.equal(run('kariyer.sonHaftaOzeti.sonra.butce'),run('kariyer.butce'));
assert.ok(run('kariyer.sonHaftaOzeti.program').length>0);assert.ok(element('uygulama').innerHTML.includes('Haftalık Özet'));
run('rehberBaslat()');assert.equal(run('kariyer.rehber.durum'),'aktif');run('rehberAtla()');assert.equal(run('kariyer.rehber.durum'),'atlandi');
run('kayitYukle()');assert.equal(run('kariyer.rehber.durum'),'atlandi','atlama kayıtta korunur');
run('rehberBaslat();rehberSonraki();rehberSonraki();rehberSonraki();rehberSonraki()');assert.equal(run('kariyer.rehber.durum'),'tamamlandi');
// Menülerin tamamı veriyle render edilmeli.
for(const fn of ['kimyaEkrani','scoutBolgeEkrani','taraftarEkrani','haftalikOzetEkrani','akademiEkrani','transferEkrani','kulupMenu','kadroEkrani']) run(fn+'()');
console.log('7 kariyer sistemi: eski kayıt, kimya, analiz kilitleri, pazarlık maliyeti, scout süresi, taraftar sınırları, gerçek hafta geçişi, rehber atlama ve menüler geçti.');
