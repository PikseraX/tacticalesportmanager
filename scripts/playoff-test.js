const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
function fresh(league,rank){
  run('macAkisiniTemizle();kariyer=null');element('takimAdi').value='Playoff Test';
  run('kariyerBaslat();rehberAtla()');
  if(league!==5)run('globalThis.swap=kariyer.ligler['+(league-1)+'][0];kariyer.ligler['+(league-1)+'][0]=-1;kariyer.ligler[4][kariyer.ligler[4].indexOf(-1)]=swap;kariyer.ligNo='+league+';kariyer.sezon=yeniSezon(1)');
  run('kariyer.sezon.bitti=true;kariyer.sezon.tablo.forEach((t,i)=>{t.puan=i===0?100-('+rank+'-1)*10:100-(i<'+rank+'?i-1:i)*10;t.rd=0})');
  assert.equal(run('siralama().indexOf(0)+1'),rank);
}
function invariant(){
 assert.deepEqual(JSON.parse(run('JSON.stringify(kariyer.ligler.map(x=>x.length))')),[8,8,8,8,8]);
 assert.equal(run('new Set(kariyer.ligler.flat()).size'),40);
 assert.equal(run('kariyer.ligler.flat().filter(x=>x===-1).length'),1);
}
function start(){
 run('playoffBanBaslat();while(banKalan().length>3)banYap(banKalan()[0]);banOyna()');
 assert.equal(run('canliSeri.playoff'),true);
 assert.equal(run('canli.onemliMac'),true);
}
function finishMap(won){run('canli.sa='+(won?13:7)+';canli.sb='+(won?7:13)+';canliBitir()')}
for(const [league,rank,win,expected] of [[5,2,true,4],[5,2,false,5],[4,7,true,4],[4,7,false,5]]){
 fresh(league,rank);const cash=run('kariyer.butce');
 run('sezonuKapat()');
 assert.equal(run('kariyer.sezon.no'),1);assert.equal(run('kariyer.butce'),cash);
 assert.equal(run('kariyer.ligPlayoff.eslesmeler.filter(e=>e.kazanan===null).length'),1);
 const snapshot=run('JSON.stringify(kariyer.ligPlayoff)');
 run('sezonuKapat();kayitYukle()');
 assert.equal(run('JSON.stringify(kariyer.ligPlayoff)'),snapshot,'aynı eşleşme ve sonuçlar korunur');
 start();finishMap(win);
 assert.equal(run('canliSeri.idx'),1);
 assert.equal(run('yedekDogrula(yedekMetni()).ligPlayoff.sezon'),1);
 run('kayitYukle()');assert.equal(run('canliSeri.playoff'),true);assert.equal(run('canliSeri.idx'),1);
 run('macKaldiginYerdenDevam();canliIptal()');assert.ok(run('canli && canliSeri'),'başlamış seri iptal edilmez');
 finishMap(win);assert.equal(run('canliSeri'),null);
 assert.equal(run('playoffEslesmesi().kazanan===-1'),win);
 assert.equal(run('kariyer.sezon.no'),1);
 const matches=JSON.parse(run('JSON.stringify(kariyer.ligPlayoff.eslesmeler)'));
 const standings=JSON.parse(run('JSON.stringify(kariyer.ligPlayoff.sirali)'));
 run('kayitYukle();sezonuKapat()');assert.equal(run('kariyer.sezon.no'),2);
 assert.equal(run('kariyer.ligNo'),expected);invariant();
 const leagues=JSON.parse(run('JSON.stringify(kariyer.ligler)'));
 for(const e of matches){
   assert.equal(leagues[e.ustLig-1].includes(e.kazanan===e.alt?e.alt:e.ust),true);
   assert.equal(leagues[e.ustLig].includes(e.kazanan===e.alt?e.ust:e.alt),true);
 }
 for(let i=0;i<4;i++){
   assert.equal(leagues[i].includes(standings[i+1][0]),true,'şampiyon doğrudan yükselir');
   assert.equal(leagues[i+1].includes(standings[i][7]),true,'sonuncu doğrudan düşer');
 }
 const after=run('kariyer.butce');run('sezonuKapat()');assert.equal(run('kariyer.butce'),after);
}
for(const [league,rank,expected] of [[5,1,4],[4,8,5],[1,1,1],[5,8,5]]){
 fresh(league,rank);run('sezonuKapat()');assert.equal(run('kariyer.sezon.no'),2);assert.equal(run('kariyer.ligNo'),expected);invariant();
}
// Kapanışın ara adımları yazılmaz. Son yazma başarısız olursa işlem güvenle yeniden denenir.
fresh(5,1);
run('ligPlayoffHazirla(siralama());kaydet();globalThis.aktifKayit=localStorage.getItem(KAYIT_ANAHTARI);globalThis.kapanisYaz=localStorage.setItem;globalThis.kapanisYazilari=[];localStorage.setItem=(k,v)=>{if(k===KAYIT_ANAHTARI){kapanisYazilari.push(JSON.parse(v));throw Error("quota")}kapanisYaz(k,v)};sezonuKapat();localStorage.setItem=kapanisYaz');
assert.equal(run('kapanisYazilari.length'),1);
assert.equal(run('kapanisYazilari[0].sezon.no'),2);
assert.equal(run('localStorage.getItem(KAYIT_ANAHTARI)'),run('aktifKayit'));
assert.equal(run('JSON.stringify(kariyer)'),run('aktifKayit'));
run('sezonuKapat();kayitYukle();sezonuKapat()');
assert.equal(run('kariyer.sezon.no'),2);
assert.equal(run('kariyer.ligNo'),4);
assert.equal(run('kariyer.gecmis.filter(x=>x.sezon===1).length'),1);
assert.equal(run('kariyer.mali.gelir.sezon'),run('kapanisYazilari[0].mali.gelir.sezon'));
invariant();

for(const [lang] of run('OYUN_DILLERI').filter(([code])=>code!=='tr')){
 run('oyunDili='+JSON.stringify(lang));
 for(const text of ['Lig Play-off’u','Seriyi kazanırsan üst lige yükselirsin.','Seriyi kazanırsan ligde kalırsın.','Seriyi kazandın.','Seriyi kaybettin.','Play-off Maçına Geç']){
   assert.notEqual(run('dilMetni('+JSON.stringify(text)+')'),text,lang+': '+text);
 }
}
console.log('Play-off: her iki tarafın galibiyeti/mağlubiyeti, doğrudan düşme-yükselme, sınır ligler, kayıt, tekrar tıklama ve 40 takım bütünlüğü geçti.');
`)(require,__dirname);
