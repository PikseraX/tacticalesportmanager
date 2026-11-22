const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Piyasa Testi';run('kariyerBaslat();rehberAtla();serbestHazirla()');assert.equal(run('kariyer.serbest.length'),30);
run('globalThis.eski=kariyer.serbest.slice();kariyer.serbest=kariyer.serbest.slice(0,10);serbestHazirla()');assert.equal(run('kariyer.serbest.length'),30);assert.equal(run('eski.slice(0,10).every(o=>kariyer.serbest.includes(o))'),true);
run('globalThis.once=JSON.stringify(kariyer.serbest);globalThis.stats=JSON.stringify(tumKadro().slice().sort((a,b)=>a.kimlik.localeCompare(b.kimlik)).map(o=>OZELLIKLER.map(z=>o[z])))');
for(const rol of JSON.parse(run('JSON.stringify(TARZ_LISTESI)'))){
 const rows=JSON.parse(run('JSON.stringify(transferListeVerisi('+JSON.stringify(rol)+').map(x=>({i:x.i,gen:x.gen,expected:rolGenel(x.o,'+JSON.stringify(rol)+')})))'));assert.equal(rows.length,30);assert.equal(new Set(rows.map(x=>x.i)).size,30);rows.forEach((x,i)=>{assert.equal(x.gen,x.expected);if(i)assert.ok(rows[i-1].gen>=x.gen)});
 run('transferRolSirasiSec('+JSON.stringify(rol)+')');assert.ok(element('uygulama').innerHTML.includes(rol+' GEN'));
}
assert.equal(run('JSON.stringify(kariyer.serbest)'),run('once'),'filtre özellik/rol/GEN/sıra değiştirmez');
run('stratejiSec("Sniper Ağırlıklı");stratejiDiz()');assert.equal(run('JSON.stringify(tumKadro().slice().sort((a,b)=>a.kimlik.localeCompare(b.kimlik)).map(o=>OZELLIKLER.map(z=>o[z])))'),run('stats'),'rol değişimi ham özellik değiştirmez');
// Aktif pazarlık, 30 kişi sınırı uygulanırken korunur.
run('pazarlikAc(0,"yedek",-1);globalThis.hedef=pazarlikOyuncusu();kariyer.serbest.push(serbestOyuncuUret(yeniAd()));serbestDoldur()');assert.equal(run('kariyer.serbest.length'),30);assert.equal(run('pazarlikOyuncusu()===hedef'),true);
run('kariyer.gorusme=null;serbestYenile()');assert.equal(run('kariyer.serbest.length'),30);assert.equal(run('new Set(kariyer.serbest.map(o=>o.ad)).size'),30);
// Ana rol dışı güçlü özelliklerin ve daha geniş profillerin gerçekten üretildiğini ölç.
run('globalThis.seed=91;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}');
const variety=JSON.parse(run('JSON.stringify((()=>{let disGuclu=0,genis=0;for(let i=0;i<2000;i++){const rol=TARZ_LISTESI[i%8],o=rolProfiliUret({rol},60),ana=TARZLAR[rol],diger=OZELLIKLER.filter(z=>!ana.includes(z));if(diger.some(z=>o[z]>=Math.min(...ana.map(a=>o[a]))))disGuclu++;if(ana.reduce((s,z)=>s+o[z],0)/4-diger.reduce((s,z)=>s+o[z],0)/8<10)genis++;}return {disGuclu,genis}})())'));assert.ok(variety.disGuclu>500);assert.ok(variety.genis>200);
run('kaydet();kayitYukle();serbestHazirla()');assert.equal(run('kariyer.serbest.length'),30);
console.log('Piyasa: 30 oyuncu, eski liste tamamlama, 8 rolde doğru/salt okunur sıralama, ham özelliklerin rol değişiminde korunması, aktif pazarlık ve kayıt geçti. 2.000 profilde çeşitlilik:',variety);
`)(require,__dirname);
