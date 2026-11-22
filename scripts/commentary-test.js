const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Spiker Testi';run('kariyerBaslat();rehberAtla();canli=canliKur(HARITALAR[0]);canli.macEkrani="canli";globalThis.macIzleNavigasyonHazirla=()=>{throw Error("Görsel navigasyon çağrılmamalı")};canliIzleBaslat()');
assert.ok(element('uygulama').innerHTML.includes('SPİKER KABİNİ'));assert.ok(!element('uygulama').innerHTML.includes('mac-harita-alani'));
run('spikerAdim(1.8)');assert.equal(run('canli.raundPlan.index'),0,'Eski sürede olay ilerlememeli');run('spikerAdim(1.8)');assert.equal(run('canli.raundPlan.index'),1);assert.ok(run('canli.spikerAkisi[0].metin.includes("düşürüyor")'));
run('globalThis.skor=canli.sa+":"+canli.sb;globalThis.index=canli.raundPlan.index;kaydet();kayitYukle();macKaldiginYerdenDevam()');assert.equal(run('canli.raundPlan.index'),run('index'));assert.equal(run('canli.sa+":"+canli.sb'),run('skor'));
run('canliMola();spikerAdim(20)');assert.equal(run('canli.raundPlan.index'),run('index'));run('canliMolaDevam();canliHizAyarla(4)');assert.equal(run('canli.hiz'),4);
let guard=0;while(run('canli.macEkrani!=="devre"')&&guard++<200)run('spikerAdim(4)');
assert.equal(run('canli.sa+canli.sb'),12);assert.equal(run('kariyer.sezon.oynandi'),false);assert.ok(run('canli.spikerAkisi.length')<=40);
run('globalThis.before=canli.sa+":"+canli.sb;spikerAdim(20)');assert.equal(run('canli.sa+":"+canli.sb'),run('before'));
run('canliYariDevam("Dengeli")');guard=0;while(run('!!canli')&&guard++<1000)run('spikerAdim(4)');assert.equal(run('canli'),null);assert.equal(run('kariyer.sezon.oynandi'),true);assert.ok(run('kariyer.oyuncular.every(o=>o.ist.m===1)'));
console.log('Spiker: haritasız ekran, gerçek olay anlatımı, ara olay kaydı, mola durması, hız, 12 raund devre, maç sonu ve tek istatistik geçti.');
`)(require,__dirname);
