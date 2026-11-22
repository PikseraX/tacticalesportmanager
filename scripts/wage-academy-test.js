const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Maaş ve Akademi';run('kariyerBaslat();rehberAtla()');
// GEN-based demand is higher, especially for stars, with no player attribute mutation.
run('globalThis.p={genel:60};globalThis.low=formulMaas(p);p.genel=90;globalThis.high=formulMaas(p)');
assert.ok(run('low')>2070);assert.ok(run('high/4658>low/2070'));
run('globalThis.o=kariyer.oyuncular[0];o.maas=2000;globalThis.savedStats=JSON.stringify(OZELLIKLER.map(z=>o[z]));OZELLIKLER.forEach(z=>o[z]=80);genelHesapla(o);globalThis.market=formulMaas(o);o.maas=Math.round(market*.9)');
assert.equal(run('maasIyilestirmeGerekli(o)'),false);
assert.equal(run('yenilemeMaasi(o)'),run('Math.round(o.maas*1.15)'));
run('o.maas=Math.round(market*.5)');
assert.equal(run('maasIyilestirmeGerekli(o)'),true);
assert.ok(run('yenilemeMaasi(o)')>=run('Math.ceil(market*.75)'));
assert.ok(run('yenilemeMaasi(o)>o.maas*1.15'));
// Development and simply opening the screen cannot change an agreed salary.
run('globalThis.oldPay=o.maas;OZELLIKLER.forEach(z=>o[z]=85);genelHesapla(o);sozlesmeHazirla();sozlesmeEkrani()');
assert.equal(run('o.maas'),run('oldPay'));
assert.ok(element('uygulama').innerHTML.includes('Ücret iyileştirmesi istiyor'));
assert.ok(element('uygulama').innerHTML.includes('Emsal maaş'));
// Changing roles preserves attributes and cannot hide the player's earning power.
run('globalThis.profile=rolProfiliUret({ad:"Uzman",rol:"Destek",yas:20},75);globalThis.stats=JSON.stringify(OZELLIKLER.map(z=>profile[z]));globalThis.price=formulMaas(profile);profile.rol="Sniper";genelHesapla(profile)');
assert.equal(run('formulMaas(profile)'),run('price'));
assert.equal(run('JSON.stringify(OZELLIKLER.map(z=>profile[z]))'),run('stats'));
// Declining/cancelling cannot charge money or change the contract; acceptance uses the visible demand.
run('o.mor=70;kariyer.butce=500000;globalThis.beforeCash=kariyer.butce;globalThis.beforeExpiry=o.bitis;globalThis.asked=yenilemeMaasi(o);globalThis.fee=yenilemeUcreti(o);confirm=()=>false;sozlesmeYenile(0)');
assert.equal(run('kariyer.butce'),run('beforeCash'));assert.equal(run('o.bitis'),run('beforeExpiry'));assert.equal(run('o.maas'),run('oldPay'));
run('confirm=()=>true;sozlesmeYenile(0)');assert.equal(run('o.maas'),run('asked'));assert.equal(run('beforeCash-kariyer.butce'),run('fee'));assert.equal(run('o.bitis'),run('Math.max(beforeExpiry,kariyer.hafta)+26'));
run('o.mor=39;globalThis.state=JSON.stringify(kariyer);sozlesmeYenile(0)');assert.equal(run('JSON.stringify(kariyer)'),run('state'));
run('o.mor=70;kariyer.butce=0;globalThis.state=JSON.stringify(kariyer);sozlesmeYenile(0)');assert.equal(run('JSON.stringify(kariyer)'),run('state'));
run('kariyer.butce=1000000;o.maas=20000;for(let i=0;i<15;i++)sozlesmeYenile(0)');assert.equal(run('o.maas'),run('Math.round(formulMaas(o)*1.2)'));
// Old saves keep signed salaries. Only a cached market demand is refreshed, once, preserving its club offer.
run('serbestHazirla();globalThis.target=kariyer.serbest[0];target.transferTalep={kulup:"Korunacak",bonservis:12345,maas:50,imza:100};target.transferTur={hafta:kariyer.hafta,kulup:2,oyuncu:1};transferTalepleri(target);globalThis.cached=JSON.stringify(target.transferTalep)');
assert.equal(run('target.transferTalep.bonservis'),12345);assert.equal(run('target.transferTalep.kulup'),'Korunacak');assert.ok(run('target.transferTalep.maas>=formulMaas(target)'));assert.equal(run('target.transferTur.kulup'),2);
run('transferTalepleri(target)');assert.equal(run('JSON.stringify(target.transferTalep)'),run('cached'));
// Save round-trip must keep the negotiated salary and development state intact.
run('o.maas=3210;o.mor=70;kaydet();kayitYukle()');assert.equal(run('kariyer.oyuncular[0].maas'),3210);
// A seeded cohort tests actual catch-up, profile preservation and the potential boundary.
const growth=JSON.parse(run('JSON.stringify((()=>{let seed=193;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};kariyer.personel={koc:2};OZELLIKLER.forEach(z=>kariyer.oyuncular.forEach(o=>o[z]=80));kariyer.oyuncular.forEach(genelHesapla);const make=(age,pot)=>{const o=rolProfiliUret({ad:"Aday"+seed,rol:"Destek",yas:age,pot},34);o.testStart=o.genel;return o};const young=Array.from({length:300},()=>make(17,85)),older=Array.from({length:300},()=>make(25,85)),capped=Array.from({length:60},()=>make(17,45));kariyer.akademi=young.concat(older,capped);const core=TARZLAR.Destek;const sums=l=>l.map(o=>({gen:o.genel,core:core.reduce((s,z)=>s+o[z],0)/4,other:OZELLIKLER.filter(z=>!core.includes(z)).reduce((s,z)=>s+o[z],0)/8}));const start=sums(young);for(let w=0;w<56;w++){akademiHaftalik([]);if(w===27)globalThis.after28=sums(young);if(kariyer.akademi.some(o=>o.genel>o.pot||OZELLIKLER.some(z=>o[z]>99||o[z]<1)))throw Error("Potential/attribute cap");}const avg=(l,f)=>l.reduce((s,x)=>s+f(x),0)/l.length;return {young28:avg(after28,x=>x.gen),young56:avg(young,x=>x.genel),older56:avg(older,x=>x.genel),coreGain:avg(sums(young),(x)=>x.core)-avg(start,x=>x.core),otherGain:avg(sums(young),x=>x.other)-avg(start,x=>x.other),cappedMax:Math.max(...capped.map(o=>o.genel))}})())'));
console.log('Seeded academy cohort:',growth);
assert.ok(growth.young28>=65,'a young prospect should approach a developed first team in one season');
assert.ok(growth.young56>=78&&growth.young56<=85,'a strong prospect must catch up without exceeding potential');
assert.ok(growth.young56<84.8,'reaching full potential should slow down after passing the first-team average');
assert.ok(growth.young56>growth.older56);assert.ok(growth.coreGain>growth.otherGain);assert.equal(growth.cappedMax,45);
// Same player and potential: mentoring weakens progressively above the team's actual average.
const rates=JSON.parse(run('JSON.stringify((()=>{const o={rol:"Destek",yas:17,pot:99,genel:60};kariyer.oyuncular.forEach(p=>{OZELLIKLER.forEach(z=>p[z]=60);genelHesapla(p)});return [50,60,65,70,80].map(g=>{o.genel=g;return akademiGelisimSansi(o,"utility")})})())'));
for(let i=1;i<rates.length;i++)assert.ok(rates[i]<rates[i-1],'mentoring must decrease smoothly as the player overtakes the team');
run('globalThis.near={rol:"Destek",yas:17,pot:85,genel:80};globalThis.nearRate=akademiGelisimSansi(near,"utility");near.pot=99');
assert.ok(run('nearRate<akademiGelisimSansi(near,"utility")'),'approaching the potential limit adds a separate slowdown');
run('near.genel=near.pot');assert.equal(run('akademiGelisimSansi(near,"utility")'),0);
// Both new explanations and labels are translated in every supported language.
const labels=run('[MAAS_REHBERI,AKADEMI_GELISIM_REHBERI,"Maaş dengesi","Gelişim programı","Ücret GEN’i","Emsal maaş","Ücret iyileştirmesi istiyor"]');
for(const [lang] of run('OYUN_DILLERI').filter(([k])=>k!=='tr')){run('oyunDili='+JSON.stringify(lang));for(const text of labels){assert.notEqual(run('dilMetni('+JSON.stringify(text)+')'),text,lang+': '+text)}}
console.log('Maaş ve akademi: normal %15 zam, emsal iyileştirmesi, rol güvenliği, ret/onay/muhasebe, eski kayıt/pazarlık, potansiyel sınırı ve 11 çeviri geçti.',growth);
`)(require,__dirname);
