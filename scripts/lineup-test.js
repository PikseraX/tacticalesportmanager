const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='İlk 5 Testi';run('kariyerBaslat();rehberAtla();kariyer.oyuncular.forEach(o=>{OZELLIKLER.forEach(z=>o[z]=40);genelHesapla(o)});kariyer.yedekler=[0,1].map(i=>{const o={ad:"Yedek Sniper "+i,rol:"Sniper",yas:20};OZELLIKLER.forEach(z=>o[z]=TARZLAR.Sniper.includes(z)?90:20);genelHesapla(o);return o});kimyaHazirla();globalThis.ilk=kariyer.oyuncular.slice();globalThis.hepsi=tumKadro().slice();stratejiSec("Sniper Ağırlıklı")');
assert.equal(run('kariyer.oyuncular.every(o=>ilk.includes(o))'),true,'strateji tıklaması oyuncu değiştirmez');
run('globalThis.before=JSON.stringify(kariyer);globalThis.conf=confirm;confirm=()=>false;stratejiDiz();confirm=conf');assert.equal(run('JSON.stringify(kariyer)'),run('before'));
run('stratejiDiz()');assert.equal(run('kariyer.oyuncular.filter(o=>o.ad.startsWith("Yedek Sniper")).length'),2);assert.equal(run('tumKadro().length'),7);assert.equal(run('new Set(tumKadro()).size'),7);assert.equal(run('stratejiUyumu(kariyer.oyuncular,kariyer.strateji)'),5);assert.equal(run('hepsi.every(o=>tumKadro().includes(o))'),true);
run('kaydet();kayitYukle()');assert.equal(run('kariyer.oyuncular.filter(o=>o.ad.startsWith("Yedek Sniper")).length'),2);
// DP sonucu bağımsız kombinasyon + permütasyon taramasının optimumuyla eşleşmeli.
run('globalThis.seed=731;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}');
for(let n=0;n<20;n++){
 run('globalThis.pool=Array.from({length:8},(_,i)=>rolProfiliUret({ad:"P"+i,rol:TARZ_LISTESI[i],yas:20},35+Math.random()*50));globalThis.roles=STRATEJILER[STRATEJI_LISTESI['+(n%5)+']];globalThis.best=-Infinity;for(let a=0;a<4;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<6;c++)for(let d=c+1;d<7;d++)for(let e=d+1;e<8;e++){const at=rolleriEnIyiDagit([pool[a],pool[b],pool[c],pool[d],pool[e]],roles);best=Math.max(best,at.reduce((s,x)=>s+rolGenel(x.oyuncu,x.rol),0))}');
 assert.equal(run('stratejiEnIyiBes(pool,roles,pool.slice(0,5)).reduce((s,x)=>s+rolGenel(x.oyuncu,x.rol),0)'),run('best'));
}
run('pool.forEach(o=>{OZELLIKLER.forEach(z=>o[z]=60)});globalThis.tie=stratejiEnIyiBes(pool,STRATEJILER.Dengeli,pool.slice(0,5))');assert.equal(run('tie.every(x=>pool.slice(0,5).includes(x.oyuncu))'),true);
console.log('İlk 5 optimizasyonu: strateji seçiminde sabit oyuncular, güçlü yedekler, iptal, tekil/tam kadro, kayıt, 20 bağımsız optimum kontrolü ve eşitlikte mevcut beşli geçti.');
`)(require,__dirname);
