const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
function fresh(){element('takimAdi').value='Planlama Testi';run('kariyerBaslat();rehberAtla()');}
fresh();assert.equal(run('antrenmanYogunlugu().ad'),'Normal');
run('kariyer.antrenmanYogunluk="bozuk"');assert.equal(run('antrenmanYogunlugu().ad'),'Normal');
run('antrenmanYogunlukSec("hafif");kayitYukle()');assert.equal(run('kariyer.antrenmanYogunluk'),'hafif');
// Normal plan, önceki algoritmayla aynı rastgele sayılarda aynı sonucu verir.
run('globalThis.orijinal=JSON.stringify(kariyer);globalThis.rng=Math.random;globalThis.seed=123;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};kariyer.antrenmanYogunluk="normal";antrenmanUygula();globalThis.sonuc=JSON.stringify(tumKadro());kariyer=JSON.parse(orijinal);seed=123;const kat=1+.1*personelSeviye("koc");tumKadro().forEach(o=>{OZELLIKLER.forEach(z=>{if(Math.random()<gelisimSansi(o,z===oyuncuOdagi(o))*kat)o[z]=Math.min(99,o[z]+1);if(Math.random()<gerilemeSansi(o))o[z]=Math.max(1,o[z]-1)});genelHesapla(o)});Math.random=rng');
assert.equal(run('JSON.stringify(tumKadro())'),run('sonuc'));
for(const [mode,delta] of [['hafif',-4],['normal',0],['yogun',8]]){
  fresh();run('kariyer.antrenmanYogunluk="'+mode+'";kariyer.yedekler=[serbestOyuncuUret("Yedek")];tumKadro().forEach(o=>{o.yor=40;o.bitis=999});kariyer.haftaMac=true;formHaftalik([])');
  assert.equal(run('kariyer.oyuncular[0].yor'),46+delta);assert.equal(run('kariyer.yedekler[0].yor'),30+delta);
}
run('kariyer.antrenmanYogunluk="yogun";kariyer.oyuncular[0].yor=0');assert.equal(run('antrenmanGelisimCarpani(kariyer.oyuncular[0])'),1.2);
run('kariyer.oyuncular[0].yor=80');assert.ok(run('antrenmanGelisimCarpani(kariyer.oyuncular[0])')<1,'yorgunken yoğun plan üstün değil');
fresh();run('serbestHazirla();globalThis.o=kariyer.serbest[0];globalThis.butce=kariyer.butce;izlemeEkle(o);izlemeEkle(o)');assert.equal(run('kariyer.izlemeListesi.length'),1);assert.equal(run('kariyer.butce'),run('butce'));
run('izlemeKarsilastir(0)');assert.ok(element('uygulama').innerHTML.includes('Oyuncu Karşılaştırması'));assert.ok(element('uygulama').innerHTML.includes('Nişan'));
run('globalThis.id=o.kimlik;kariyer.serbest.reverse();izlemeEkrani()');assert.equal(run('izlemeOyuncusu(id)===o'),true,'liste sırası kimliği bozmaz');
run('kariyer.serbest.splice(kariyer.serbest.indexOf(o),1);kariyer.yedekler.push(o);o.bitis=kariyer.hafta+2;izlemeHazirla()');assert.equal(run('izlemeOyuncusu(id)===o'),true,'satın alınan oyuncu takibi sürer');
assert.equal(run('izlemeSozlesmeUyarilari().length'),1);
run('o.bitis+=30');assert.equal(run('izlemeSozlesmeUyarilari().length'),0,'yenileme uyarıyı kaldırır');
run('kariyer.yedekler=[];kariyer.serbest.push(o);o.bitis=1');assert.equal(run('izlemeSozlesmeUyarilari().length'),0,'piyasada eski sözleşme bilgisi kullanılmaz');
run('globalThis.name=o.ad;serbestYenile();izlemeEkrani()');assert.equal(run('izlemeOyuncusu(id)'),undefined);assert.ok(element('uygulama').innerHTML.includes('SON BİLİNEN BİLGİ'));assert.equal(run('kariyer.izlemeListesi[0].sonBilgi.ad'),run('name'));
run('kaydet();kayitYukle()');assert.equal(run('kariyer.izlemeListesi[0].id'),run('id'));run('izlemeKarsilastir(0)');assert.ok(element('uygulama').innerHTML.includes('son bilinen'));
// Yeni alanlar dışa/içe aktarmada korunur; listeyi görmek bütçeyi değiştirmez.
run('kariyer.antrenmanYogunluk="yogun";globalThis.kopya=yedekDogrula(yedekMetni())');assert.equal(run('kopya.antrenmanYogunluk'),'yogun');assert.equal(run('kopya.izlemeListesi[0].id'),run('id'));
run('izlemeSil(0)');assert.equal(run('kariyer.izlemeListesi.length'),0);
// Gerçek pazarlık/imza aynı oyuncu kimliğiyle izlemeyi sürdürür.
fresh();run('serbestHazirla();izlemeEkle(kariyer.serbest[0]);globalThis.takipId=kariyer.serbest[0].kimlik;pazarlikAc(0,"yedek",-1)');
element('paz-bonservis').value=String(run('pazarlikOyuncusu().transferTalep.bonservis'));run('kulupPazarligi()');
element('paz-maas').value=String(run('pazarlikOyuncusu().transferTalep.maas'));element('paz-imza').value=String(run('pazarlikOyuncusu().transferTalep.imza'));element('paz-sure').value='26';
run('oyuncuPazarligi();pazarlikImzala()');assert.equal(run('yedekListe().some(o=>o.kimlik===takipId)'),true);assert.equal(run('kariyer.izlemeListesi[0].id'),run('takipId'));
assert.throws(()=>run('yedekDogrula(JSON.stringify({...JSON.parse(yedekMetni()),kariyer:{...kariyer,antrenmanYogunluk:"gecersiz"}}))'));
assert.throws(()=>run('yedekDogrula(JSON.stringify({...JSON.parse(yedekMetni()),kariyer:{...kariyer,izlemeListesi:[{id:"p1",sonBilgi:{}}]}}))'));

// Gerçek hafta geçişinde plan ve takip uyarısı haftalık özete girer.
fresh();run('izlemeEkle(kariyer.oyuncular[0]);kariyer.oyuncular[0].bitis=4;antrenmanYogunlukSec("hafif");sezonMaciBitir(macOyna({ad:kariyer.takimAdi,oyuncular:kariyer.oyuncular},haftaRakip()));haftaGec()');
assert.ok(run('kariyer.sonHaftaOzeti.notlar.some(x=>x.includes("Antrenman planı: Hafif"))'));assert.ok(run('kariyer.sonHaftaOzeti.notlar.some(x=>x.startsWith("Takip:"))'));
for(const fn of ['antrenmanYogunlukEkrani','odakEkrani','izlemeEkrani','piyasaMenu','kadroEkrani'])run(fn+'()');
console.log('Planlama testleri: normal plan eşdeğerliği, yorgunluk/verim bedeli, kimlikle takip, karşılaştırma, sözleşme uyarısı/yenileme, arşiv, kayıt-yedek ve gerçek hafta geçişi geçti.');
`)(require,__dirname);
