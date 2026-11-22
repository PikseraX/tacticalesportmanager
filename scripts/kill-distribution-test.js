const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Dağılım';run('kariyerBaslat();rehberAtla();globalThis.seed=731;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};globalThis.c=canliKur(HARITALAR[0]);c.A.oyuncular.concat(c.B.oyuncular).forEach(o=>{o.nisan=60;o.refleks=60});globalThis.macIzleKonumBaslat=()=>{throw Error("Konum kullanılmamalı")};globalThis.shares=Array(5).fill(0);globalThis.total=0;');
for(let n=0;n<12000;n++){
 run('macIzleRaundHazirla(c);globalThis.alive=new Set(c.aktifA.concat(c.aktifB));for(const e of c.raundPlan.olaylar){if(!alive.has(e.katil)||!alive.has(e.kurban)||e.katil===e.kurban)throw Error("Ölü oyuncu/tekrar ölüm");alive.delete(e.kurban);const i=c.aktifA.indexOf(e.katil);if(i>=0){shares[i]++;total++}}');
}
const shares=JSON.parse(run('JSON.stringify(shares.map(x=>x/total))'));shares.forEach(x=>assert.ok(x>.18&&x<.22));
run('globalThis.g=macGrafikPaketle(c);globalThis.seedBefore=seed;macIzleRaundHazirla(c);globalThis.first=JSON.stringify(c.raundPlan.olaylar.map(x=>[x.katil.o.ad,x.kurban.o.ad]));c=macGrafikAc(g);c.aktifA.forEach((x,i)=>{x.izX=i*999;x.izY=999});seed=seedBefore;macIzleRaundHazirla(c)');assert.equal(run('JSON.stringify(c.raundPlan.olaylar.map(x=>[x.katil.o.ad,x.kurban.o.ad]))'),run('first'),'konum değişince sonuç değişmemeli');
console.log('12.000 raund: hayatta kalma kuralları ve konumdan bağımsız dağılım geçti. Eşit oyuncuların kill payları:',shares.map(x=>(x*100).toFixed(2)+'%').join(' / '));
`)(require,__dirname);
