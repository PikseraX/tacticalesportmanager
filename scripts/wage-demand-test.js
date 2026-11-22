const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
run('globalThis.asilKaydet=kaydet');
function fresh(){element('takimAdi').value='Talep Test';run('kariyerBaslat();rehberAtla();kaydet=()=>{};globalThis.o=kariyer.oyuncular[0];OZELLIKLER.forEach(z=>o[z]=80);genelHesapla(o);globalThis.ref=formulMaas(o);o.mor=70;o.bitis=kariyer.hafta+3');}
fresh();run('o.maas=Math.ceil(ref*.75)');assert.equal(run('maasIyilestirmeGerekli(o)'),false,'equal/above 75% is enough');
run('o.maas=Math.ceil(ref*.75)-1');assert.equal(run('maasIyilestirmeGerekli(o)'),true,'below 75% requests adjustment');
assert.ok(run('yenilemeMaasi(o)>=Math.ceil(ref*.75)'),'rounding must clear the threshold');
// Every weekly form tick reduces morale despite normal recovery, for starters and reserves.
run('globalThis.reserve={...o,ad:"Yedek test",mor:70};kariyer.yedekler=[reserve]');
for(let w=0;w<4;w++){const a=run('o.mor'),b=run('reserve.mor');run('formHaftalik([])');assert.ok(run('o.mor')<a);assert.ok(run('reserve.mor')<b)}
run('o.maas=Math.ceil(ref*.75);o.mor=70;formHaftalik([])');assert.equal(run('o.mor'),70,'no wage penalty at the threshold');
// Match wins and ordinary weekly recovery cannot mask an unresolved weekly decline.
fresh();run('o.maas=Math.floor(ref*.4);o.mor=70;kariyer.haftaBaslangic=haftaFotografi();moralMacSonucu(true);formHaftalik([])');assert.ok(run('o.mor<70'));
// Old snapshots do not have morale; they remain compatible and lose morale from the current value.
fresh();run('o.maas=Math.floor(ref*.4);delete kariyer.haftaBaslangic.oyuncular[0].mor;globalThis.morBefore=o.mor;formHaftalik([])');assert.ok(run('o.mor<morBefore'));
// The last contracted week permits a raise even when low morale blocks renewal.
fresh();run('o.maas=Math.floor(ref*.4);o.mor=15;o.bitis=kariyer.hafta;globalThis.oldExpiry=o.bitis;globalThis.oldCash=kariyer.butce;confirm=()=>false;maasIyilestir(0)');
assert.ok(run('maasIyilestirmeGerekli(o)'));assert.equal(run('o.bitis'),run('oldExpiry'));assert.equal(run('kariyer.butce'),run('oldCash'));
run('confirm=()=>true;maasIyilestir(0)');assert.equal(run('maasIyilestirmeGerekli(o)'),false);assert.equal(run('o.maas'),run('Math.ceil(ref*.75)'));assert.equal(run('o.bitis'),run('oldExpiry'));assert.equal(run('kariyer.butce'),run('oldCash'));
run('kariyer.hafta++;sozlesmeKontrol([])');assert.equal(run('kariyer.oyuncular.includes(o)'),true,'the raise prevents immediate departure');
// Unresolved demands cause departure immediately after the last contracted week.
fresh();run('o.maas=Math.floor(ref*.4);o.bitis=kariyer.hafta;maasTalebiniTakipEt(o);globalThis.oldId=oyuncuKimligi(o);kariyer.hafta++;sozlesmeKontrol([])');
assert.equal(run('tumKadro().some(x=>x.kimlik===oldId)'),false);assert.equal(run('kariyer.oyuncular.length'),5);
assert.equal(run('o.maasTalebi'),undefined,'old club demand is cleared on departure');
// Real week transition charges wages, advances the week and resolves departure exactly once.
fresh();run('o.maas=Math.floor(ref*.4);o.bitis=kariyer.hafta;globalThis.oldId=oyuncuKimligi(o);sezonMaciBitir(macOyna({ad:kariyer.takimAdi,oyuncular:kariyer.oyuncular,strateji:kariyer.strateji},haftaRakip()));haftaGec()');
assert.equal(run('kariyer.hafta'),2);assert.equal(run('tumKadro().some(x=>x.kimlik===oldId)'),false);assert.equal(run('kariyer.oyuncular.length'),5);
fresh();run('o.maas=Math.floor(ref*.4)');assert.ok(run('bildirimler()').includes('sozlesmeEkrani()'),'dashboard links wage demand to the contract screen');
assert.ok(run('o.maasTalebi && o.maasTalebi.taban===Math.ceil(ref*.75)'),'the displayed request is remembered');
run('globalThis.locked=o.maasTalebi.taban;OZELLIKLER.forEach(z=>o[z]=50);genelHesapla(o)');
assert.ok(run('o.maas>=Math.ceil(formulMaas(o)*.75)'),'fixture: the market value decreased');
assert.equal(run('maasIyilestirmeGerekli(o)'),true,'an outstanding request survives a later market-value decrease');
assert.equal(run('maasIyilestirmeTutari(o)'),run('locked'));run('confirm=()=>true;maasIyilestir(0)');
assert.equal(run('o.maas'),run('locked'));assert.equal(run('o.maasTalebi'),undefined);
// A remembered demand survives app restart and an old career remains readable.
fresh();run('o.maas=Math.floor(ref*.4);bildirimler();globalThis.locked=o.maasTalebi.taban;kaydet=asilKaydet;kaydet();kayitYukle();o=kariyer.oyuncular[0]');
assert.equal(run('o.maasTalebi.taban'),run('locked'));assert.equal(run('maasIyilestirmeGerekli(o)'),true);
// A normal player retains the original grace period.
fresh();run('o.maas=Math.ceil(ref*.75);o.bitis=kariyer.hafta;kariyer.hafta++;sozlesmeKontrol([])');assert.equal(run('kariyer.oyuncular.includes(o)'),true);
run('kariyer.hafta+=2;sozlesmeKontrol([])');assert.equal(run('kariyer.oyuncular.includes(o)'),false);
// A completed renewal satisfies the demand and delays departure normally.
fresh();run('o.maas=Math.floor(ref*.4);o.mor=70;globalThis.last=o.bitis;confirm=()=>true;sozlesmeYenile(0)');assert.equal(run('maasIyilestirmeGerekli(o)'),false);assert.ok(run('o.bitis>last'));
for(const [lang] of run('OYUN_DILLERI').filter(([x])=>x!=='tr')){run('oyunDili='+JSON.stringify(lang));for(const text of [run('MAAS_REHBERI'),'Maaşı iyileştir'])assert.notEqual(run('dilMetni('+JSON.stringify(text)+')'),text,lang)}
console.log('Wage demand: 75% boundary, weekly morale, last-week raise, immediate departure, grace period, renewal and 11 languages passed.');
`)(require,__dirname);
