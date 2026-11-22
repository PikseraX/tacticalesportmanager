const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
function fresh(){element('takimAdi').value='Kulüp Testi';run('kariyerBaslat();rehberAtla()');}
fresh();
assert.equal(run('kariyer.sezonHedefi.id'),null,'hedef zorunlu değil');
const cash=run('kariyer.butce');
run('sezonHedefSec("sira");sezonHedefSec("butce")');assert.equal(run('kariyer.sezonHedefi.id'),'sira');
run('sezonHedefSonuclandir(5);sezonHedefSonuclandir(5)');assert.equal(run('kariyer.hedefGecmisi.length'),1);assert.equal(run('kariyer.hedefGecmisi[0].basarili'),true);assert.equal(run('kariyer.butce'),cash,'ekonomi değişmez');
run('kariyer.sezon=yeniSezon(2);kulupGelisimHazirla()');assert.equal(run('kariyer.sezonHedefi.id'),null);
run('sezonHedefSec("butce");kariyer.butce--');assert.equal(run('sezonHedefDurumu()'),false);
run('sezonHedefSonuclandir(1)');assert.equal(run('kariyer.hedefGecmisi[1].basarili'),false);
fresh();run('kariyer.oyuncular[0].yas=20;sezonHedefSec("genc");kariyer.oyuncular[0].genel+=2');assert.equal(run('sezonHedefDurumu()'),true);
run('globalThis.genc=kariyer.oyuncular.shift()');assert.equal(run('sezonHedefDurumu()'),false,'satılan oyuncu hedefi sağlamaz');
fresh();run('kariyer.scout=1;sezonHedefSec("akademi");kariyer.akademi=[adayUret()];akademiYukselt(0)');assert.equal(run('sezonHedefDurumu()'),true);
// Gerçek sezon kapanışı hedefi bir kez arşivler; yeni sezon hedefi boş başlar.
fresh();run('sezonHedefSec("sira");kariyer.sezon.bitti=true;kariyer.sezon.tablo[0].puan=999;sezonuKapat()');
assert.equal(run('kariyer.hedefGecmisi.length'),1);assert.equal(run('kariyer.sezonHedefi.sezon'),2);assert.equal(run('kariyer.sezonHedefi.id'),null);
// GEN değişmese de özellik gelişimi görünür; eski haftalık fotoğraf da okunur.
fresh();run('kariyer.haftaBaslangic=haftaFotografi();kariyer.oyuncular[0].nisan++;haftaOzetKaydet([],0,0,0);haftalikOzetEkrani()');
assert.ok(run('kariyer.sonHaftaOzeti.degisimler[0].ozellikler.some(z=>z.ad==="Nişan")'));
assert.ok(element('uygulama').innerHTML.includes('Nişan'));
run('delete kariyer.haftaBaslangic.oyuncular[0].ozellikler;haftaOzetKaydet([],0,0,0)');
// Gerçek maç sonuçları istatistik ve rekorları tek işlemde günceller.
fresh();run('globalThis.sonuc=macOyna({ad:kariyer.takimAdi,oyuncular:kariyer.oyuncular},haftaRakip());sonuc.sa=13;sonuc.sb=2;sezonMaciBitir(sonuc)');
assert.equal(run('kariyer.kulupTarihce.enFarkli.fark'),11);
run('globalThis.id=oyuncuKimligi(kariyer.oyuncular[0]);globalThis.eski=kariyer.oyuncular.shift();kulupEfsaneleriniGuncelle()');
assert.equal(run('kariyer.kulupTarihce.oyuncular[id].mac'),1,'ayrılan oyuncu korunur');
run('kariyer.oyuncular.unshift(eski)');
// Analiz en fazla iki gözlem gösterir; kadroyu değiştirmez.
run('globalThis.c=canliKur(HARITALAR[0]);c.sa=3;c.sb=13;c.hf=-8;c.tA="Dengeli";c.tB="Agresif";globalThis.roster=JSON.stringify(kariyer.oyuncular);globalThis.r=macDegerlendirme(c)');
assert.ok(run('r.noktalar.length')<=2);assert.ok(run('r.noktalar.some(x=>x.baslik==="Harita dezavantajı")'));
assert.equal(run('JSON.stringify(kariyer.oyuncular)'),run('roster'));
run('c.sa=13;c.sb=3');assert.equal(run('macDegerlendirme(c)'),null);
// Yedek: bütün kariyer, HTML içeren normal maç notları ve canlı grafik aynı kalır.
fresh();run('kariyer.testNot="Normal <b>maç</b><br>notu";canli=canliKur(HARITALAR[0]);canli.sa=6;canli.sb=4;canli.istA[0].kill=7;globalThis.paket=yedekMetni();globalThis.kopya=yedekDogrula(paket)');
assert.equal(run('JSON.stringify(kopya)'),run('JSON.stringify(kariyer)'),'kayıpsız yedek');
const beforeStorage=run('localStorage.getItem(KAYIT_ANAHTARI)');
for(const expression of ['"bozuk"','JSON.stringify({uygulama:"başka",surum:1})','JSON.stringify({...JSON.parse(paket),surum:9})','JSON.stringify({...JSON.parse(paket),kariyer:{...kopya,oyuncular:[]}})','paket.replace("Kulüp Testi","<img src=x onerror=alert(1)>")','paket.replace("\\\"ref\\\":0","\\\"ref\\\":999999")']) {
  assert.throws(()=>run('yedekDogrula('+expression+')'));assert.equal(run('localStorage.getItem(KAYIT_ANAHTARI)'),beforeStorage);
}
run('yedekOnizle(paket)');assert.equal(run('canli.sa'),6,'önizleme kariyeri değiştirmez');run('yedekIptal()');assert.equal(run('yedekAday'),null);
run('yedekOnizle(paket);kariyer.butce=123456;yedegiUygula()');
assert.equal(run('canli.sa'),6);assert.equal(run('canli.istA[0].kill'),7);assert.equal(run('canli.istA[0].o===canli.A.oyuncular[0]'),true,'grafik kimlikleri korunur');
assert.ok(run('localStorage.getItem(KAYIT_ANAHTARI+"_geri_donus")').includes('123456'));
run('yedekOncekiKaydaDon();yedegiUygula()');assert.equal(run('kariyer.butce'),123456);
// Yazma başarısızsa aktif kariyer ve mevcut kayıt korunur.
run('yedekOnizle(paket);globalThis.setBackup=localStorage.setItem;localStorage.setItem=()=>{throw Error("quota")};globalThis.onceAd=kariyer.takimAdi;yedegiUygula();localStorage.setItem=setBackup');assert.equal(run('kariyer.takimAdi'),run('onceAd'));
// İkinci yazma kota hatası verirse ilk yazılan geri dönüş kaydı da geri alınır.
run('yedekOnizle(paket);globalThis.aktifOnce=localStorage.getItem(KAYIT_ANAHTARI);globalThis.geriDonusOnce=localStorage.getItem(KAYIT_ANAHTARI+"_geri_donus");globalThis.kotaHatasi=false;localStorage.setItem=(k,v)=>{if(k===KAYIT_ANAHTARI&&!kotaHatasi){kotaHatasi=true;throw Error("quota")}setBackup(k,v)};yedegiUygula();localStorage.setItem=setBackup');
assert.equal(run('kotaHatasi'),true);
assert.equal(run('localStorage.getItem(KAYIT_ANAHTARI)'),run('aktifOnce'));
assert.equal(run('localStorage.getItem(KAYIT_ANAHTARI+"_geri_donus")'),run('geriDonusOnce'));
assert.equal(run('kariyer.butce'),123456);

for(const fn of ['kulupTarihceEkrani','sezonHedefEkrani','kayitYedekEkrani','kulupMenu'])run(fn+'()');
console.log('Kulüp özellikleri: hedef kilidi/cezasız sonuç/yeni sezon, ayrılan efsane, özellik gelişimi, iki gözlemli analiz, kayıpsız yedek/bozuk dosya/maç devamı/iptal/geri dönüş/kota koruması geçti.');
`)(require,__dirname);
