const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Denge Kontrolü';run('kariyerBaslat();rehberAtla()');
// İlerlemesi durmuş oyuncuda art arda yenilemeler sınırsız maaş artışı üretmemeli.
run('globalThis.o=kariyer.oyuncular[0];o.genel=60;o.maas=9000;o.mor=70;kariyer.butce=1000000;globalThis.start=kariyer.butce;sozlesmeYenile(0)');
assert.equal(run('o.maas'),run('Math.round(formulMaas(o)*1.2)'));
assert.ok(run('start-kariyer.butce')<15000,'eski şişmiş ücret yenileme maliyetini kilitlemez');
run('for(let i=0;i<15;i++)sozlesmeYenile(0)');
assert.equal(run('o.maas'),run('Math.round(formulMaas(o)*1.2)'));
// Mağlubiyet sonrası toparlanma, piyasa borcundan bağımsız olarak çalışır.
run('o.mor=50;o.bitis=10000;kariyer.personel={};moralMacSonucu(false)');
assert.equal(run('o.mor'),46);run('formHaftalik([])');assert.equal(run('o.mor'),48);
// Başarı yine kayba göre daha güçlü bir moral kazanımı sağlar.
run('o.mor=50;moralMacSonucu(true)');assert.equal(run('o.mor'),55);
// Rol eşiklerinin toplam etkisi sınırlıdır, kuvveti tek haftada büyük sıçratmaz.
assert.equal(run('TARZ_ETKISI.length'),5);assert.ok(run('Math.max(...TARZ_ETKISI)-Math.min(...TARZ_ETKISI)')<=4);
console.log('Denge regresyonları: sınırlı maaş yenilemesi, eski ücret düzeltmesi, moral toparlanması ve rol etkisi sınırı geçti.');
`)(require,__dirname);
