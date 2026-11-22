const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Rol Kontrol';run('kariyerBaslat();rehberAtla();globalThis.seed=913;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}');
for(const rol of JSON.parse(run('JSON.stringify(TARZ_LISTESI)'))){assert.ok(Math.abs(run('Object.values(rolOzellikAgirliklari('+JSON.stringify(rol)+')).reduce((s,x)=>s+x,0)')-1)<1e-9);}
const result=JSON.parse(run('JSON.stringify((()=>{const rows=[];for(const rol of TARZ_LISTESI){let gap=0,spread=0,native=0;for(let n=0;n<1000;n++){const o=rolProfiliUret({rol,yas:20},60);const core=TARZLAR[rol],a=core.reduce((s,z)=>s+o[z],0)/4,b=OZELLIKLER.filter(z=>!core.includes(z)).reduce((s,z)=>s+o[z],0)/8;gap+=a-b;const scores=TARZ_LISTESI.map(r=>rolGenel(o,r));spread+=Math.max(...scores)-Math.min(...scores);if(rolGenel(o,rol)===Math.max(...scores))native++;if(rolGenel(o,rol)!==o.genel)throw Error("GEN tutarsız");if(Math.abs(o.genel-60)>3)throw Error("Üretim güç sınırı: "+JSON.stringify(o))}rows.push({rol,anaDigerFarki:+(gap/1000).toFixed(1),rolGenAraligi:+(spread/1000).toFixed(1),dogalRolEnIyiYuzde:native/10})}return rows})())'));
result.forEach(x=>{assert.ok(x.anaDigerFarki>10);assert.ok(x.rolGenAraligi>8);assert.ok(x.dogalRolEnIyiYuzde>65)});
run('globalThis.o={rol:"Destek",yas:20};OZELLIKLER.forEach(z=>o[z]=50);genelHesapla(o);globalThis.before=o.genel;o.nisan=90;genelHesapla(o)');assert.equal(run('o.genel-before'),0,'Destek nişan +40, ham GEN etkisi +0,4 (yuvarlama)');assert.equal(run('rolOzellikAgirliklari("Destek").nisan'),.01);
run('o.rol="Sniper";o.nisan=50;genelHesapla(o);globalThis.before=o.genel;o.nisan=90;genelHesapla(o)');assert.equal(run('o.genel-before'),14);
// Rol değişimi özellikleri değiştiremez. Geçiş idempotenttir ve kazanılmış özellikler korunur.
run('globalThis.stats=JSON.stringify(kariyer.oyuncular.map(o=>OZELLIKLER.map(z=>o[z])));delete kariyer.rolGenSurum;rolGenSurumunuGuncelle();globalThis.once=JSON.stringify(kariyer);rolGenSurumunuGuncelle()');assert.equal(run('JSON.stringify(kariyer)'),run('once'));assert.equal(run('JSON.stringify(kariyer.oyuncular.map(o=>OZELLIKLER.map(z=>o[z])))'),run('stats'));
// Bölge rolü değişince profil de o role göre üretilir.
run('kariyer.scout=3;globalThis.aday=bolgeselAday(SCOUT_BOLGELER[0])');assert.equal(run('aday.uretimRolu'),run('aday.rol'));
fs.mkdirSync(path.join(root,'reports/roles'),{recursive:true});fs.writeFileSync(path.join(root,'reports/roles/profile-study.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
console.log('8.000 profil: GEN tek kaynaktan tutarlı, ağırlıklar toplamı %100, Destek nişan %1 / Sniper %35, güç sınırı, bölgesel profil ve kayıpsız tek seferlik geçiş geçti.');
`)(require,__dirname);
