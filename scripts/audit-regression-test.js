const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
function fresh(){element('takimAdi').value='Hata Kontrolü';run('kariyerBaslat();rehberAtla()')}
fresh();
run('kariyer.hafta=7;kaydet();globalThis.eskiKariyer=localStorage.getItem(KAYIT_ANAHTARI);globalThis.eskiOnay=confirm;confirm=()=>false');
element('takimAdi').value='Yeni Kariyer';
run('kariyerBaslat()');
assert.equal(run('kariyer.hafta'),7);
assert.equal(run('localStorage.getItem(KAYIT_ANAHTARI)'),run('eskiKariyer'));
run('confirm=eskiOnay;kariyerBaslat()');
assert.equal(run('kariyer.hafta'),1);
assert.equal(run('kariyer.takimAdi'),'Yeni Kariyer');

// iOS 15.0–15.3 WebKit sürümlerinde Object.hasOwn yoktur.
run('globalThis.hasOwnOnce=Object.hasOwn;delete Object.hasOwn');
try {
  fresh();
  assert.equal(run('kariyer.hafta'),1);
  assert.equal(run('yedekDogrula(yedekMetni()).takimAdi'),'Hata Kontrolü');
} finally {
  run('Object.hasOwn=hasOwnOnce');
}

fresh();run('hazirlikEkrani();hazirlikIptalEt()');assert.equal(run('banDurum'),null);
run('kariyer.hafta=2;kariyer.sezon.hf=1;kariyer.turnuva={v:2,tid:"yerel",sezon:1,hayatta:[-1,0],katilan:[-1,0],tur:1,sonHafta:0};turnuvaBanBaslat();hazirlikIptalEt()');assert.equal(run('banDurum'),null);
// Sezon sonu sponsor ekranı açıldıktan ve kayıt yeniden yüklendikten sonra bonus tek kez ödenir.
fresh();run('kariyer.hafta=29;kariyer.sezon.bitti=true;kariyer.sezon.tablo[0].g=14;kariyer.sponsorlar=[{ad:"Test",haftalik:100,bitis:28,hedef:{tur:"galibiyet",deger:5},bonus:1000,imzaSezon:1,imzaHf:0}];globalThis.cash=kariyer.butce;sponsorEkrani();kaydet();kayitYukle();sponsorSezonSonu(1)');
assert.equal(run('kariyer.butce-cash'),1000);run('sponsorSezonSonu(1)');assert.equal(run('kariyer.butce-cash'),1000);
// Taktikler yalnızca kopya kadroyu değiştirir; koç/kimya bonusu ve istatistik bağlantısı sürer.
fresh();run('globalThis.roles=kariyer.oyuncular.map(o=>o.rol).join();globalThis.gens=kariyer.oyuncular.map(o=>o.genel).join();canli=canliKur(HARITALAR[0]);canliTaktikRolleriUygula(canli,"Agresif")');
assert.equal(run('kariyer.oyuncular.map(o=>o.rol).join()'),run('roles'));assert.equal(run('kariyer.oyuncular.map(o=>o.genel).join()'),run('gens'));
assert.equal(run('benimTakimMi(canli.A.oyuncular)'),true);assert.equal(run('kimyaGucEtkisi(canli.A.oyuncular)'),run('kimyaGucEtkisi(kariyer.oyuncular)'));
// Canlı skor, aktif oyuncular ve döngü içeren görüş bilgisi kimlikleriyle kaydedilir.
run('canli.sa=6;canli.sb=4;canli.macEkrani="canli";canli.istA[0].kill=7;canli.istA[0].izSonTemas={rakip:canli.istB[0]};canli.istB[0].izSonTemas={rakip:canli.istA[0]};kaydet();globalThis.pending=JSON.parse(localStorage.getItem(KAYIT_ANAHTARI)).macKaydi;macAkisiniTemizle();kayitYukle()');
assert.equal(run('canli.sa'),6);assert.equal(run('canli.sb'),4);assert.equal(run('canli.istA[0].kill'),7);
assert.equal(run('canli.aktifA[0]===canli.istA[0]'),true);assert.equal(run('canli.A.oyuncular[0]===canli.istA[0].o'),true);
assert.equal(run('canli.istA[0].izSonTemas.rakip===canli.istB[0]'),true);assert.equal(run('canli.istB[0].izSonTemas.rakip===canli.istA[0]'),true);
assert.equal(run('macKaynakOyuncu(canli.istA[0].o)===kariyer.oyuncular[0]'),true);
assert.ok(element('uygulama').innerHTML.includes('Devam Eden Maç'));
run('canliIptal();kayitYukle()');assert.equal(run('canli'),null);assert.equal(run('kariyer.macKaydi'),undefined);
// Devre ve mola durumları yeniden açılışta korunur.
fresh();run('canli=canliKur(HARITALAR[0]);canli.sa=7;canli.sb=5;canli.yariGecti=true;canli.macEkrani="devre";kaydet();kayitYukle();macKaldiginYerdenDevam()');assert.equal(run('canli.macEkrani'),'devre');
run('canli.molaAcik=true;canli.mola=1;canli.molaTur=3;kaydet();kayitYukle()');assert.equal(run('canli.molaAcik'),true);assert.equal(run('canli.mola'),1);
// BO3 ilk haritadan sonra kapatılırsa aynı seri ve oyuncu istatistikleri geri gelir.
fresh();run('kariyer.hafta=2;kariyer.sezon.hf=1;kariyer.turnuva={v:2,tid:"yerel",sezon:1,katilan:[-1,0],hayatta:[-1,0],tur:5,toplamTur:5,elendi:{},sonHafta:0};canliSeriBasla(HARITALAR.slice(0,3),"");canli.sa=13;canli.sb=4;canli.yariGecti=true;canli.istA[0].kill=11;canliBitir();kayitYukle()');
assert.equal(run('canli'),null);assert.equal(run('canliSeri.mine'),1);assert.equal(run('canliSeri.idx'),1);assert.equal(run('canliSeri.istatistik[0].kill'),11);
assert.equal(run('kariyer.galibiyet||0'),0,'yarım seri kazanç sayılmaz');
run('macKaldiginYerdenDevam()');
assert.ok(!element('uygulama').innerHTML.includes('canliIptal()'),'başlayan seride geri düğmesi görünmez');
run('canliIptal();kayitYukle();macKaldiginYerdenDevam()');
assert.equal(run('canliSeri.mine'),1);
assert.equal(run('canliSeri.istatistik[0].kill'),11);
run('canli.sa=13;canli.sb=5;canli.yariGecti=true;canli.istA[0].kill=9;canliBitir()');
assert.equal(run('kariyer.galibiyet'),1);assert.equal(run('kariyer.turnuvaGecmis.length'),1);
assert.equal(run('kariyer.oyuncular[0].ist.m'),1);assert.equal(run('kariyer.oyuncular[0].ist.ol'),20);
assert.equal(run('kariyer.macKaydi'),undefined);run('kayitYukle()');assert.equal(run('canliSeri'),null,'bitmiş seri yeniden oynanmaz');
// Gerçek canlı maç motorunda devre atlama ve bitiriş kalıcı oyunculara istatistik yazar.
fresh();run('canli=canliKur(HARITALAR[0]);canli.macEkrani="canli";canliDevreyeAtla();canliMaciHizliBitir()');
assert.equal(run('kariyer.sezon.oynandi'),true);assert.equal(run('canli'),null);
assert.ok(run('kariyer.oyuncular.every(o=>o.ist&&o.ist.m===1)'));assert.equal(run('kariyer.macKaydi'),undefined);
// Uzatma güvenlik sınırı beraberliği sonuç olarak kaydetmez.
fresh();run('canli=canliKur(HARITALAR[0]);canli.sa=12;canli.sb=12;canli.ot=true;canli.yariGecti=true;globalThis.roundBackup=macIzleRaundHazirla;globalThis.playBackup=canliDevam;globalThis.turn=0;macIzleRaundHazirla=c=>{c.raundPlan={aK:turn++%2===0,index:0,olaylar:[],site:"A"}};canliDevam=()=>{};canliMaciHizliBitir()');
assert.equal(run('canli.sa'),42);assert.equal(run('canli.sb'),42);assert.equal(run('kariyer.sezon.oynandi'),false);
run('canliBitir()');assert.equal(run('kariyer.sezon.oynandi'),false);
run('macIzleRaundHazirla=roundBackup;canliDevam=playBackup');
// Aynı rastgele değerlerde bile tüm havuzlarda ve görev içinde isimler benzersizdir.
fresh();run('globalThis.rngBackup=Math.random;Math.random=()=>.123456;globalThis.ad1=yeniAd();kariyer.akademi=[{ad:ad1}];globalThis.ad2=yeniAd();kariyer.yedekler=[{ad:ad2}];globalThis.ad3=yeniAd();globalThis.nameSet=kullanilanAdlar();kariyer.scout=1;globalThis.one=bolgeselAday(SCOUT_BOLGELER[0],nameSet);globalThis.two=bolgeselAday(SCOUT_BOLGELER[0],nameSet);Math.random=rngBackup');
assert.notEqual(run('ad1'),run('ad2'));assert.notEqual(run('ad2'),run('ad3'));assert.notEqual(run('one.ad'),run('two.ad'));
assert.equal(fs.existsSync(path.join(root,'denge.js')),false);assert.ok(!files.includes('denge.js'));
// Sponsor listesi boşalana kadar azalır ve ancak sezon değişince yeniden dolar.
fresh();
run('sponsorEkrani();sponsorImzala(0)');
assert.equal(run('kariyer.sponsorTeklif.length'),5);
run('sponsorIptal(0);ekonomiEkrani()');
assert.ok(element('uygulama').innerHTML.includes('Sponsor fesih cezası'));
assert.ok(run('kariyer.mali.gider.sponsorFesih>0 && kariyer.mali.gider.faiz===undefined'));
run('for(let i=0;i<5;i++)sponsorReddet(0);kayitYukle();sponsorEkrani()');
assert.equal(run('kariyer.sponsorTeklif.length'),0);
run('kariyer.sezon.bitti=true;kariyer.sezon.tablo[0].puan=100;sezonuKapat()');
assert.equal(run('kariyer.sezon.no'),2);
assert.equal(run('kariyer.sponsorTeklif.length'),6);

// Yeni oyuncunun imza parası Finans ekranında ayrı bir giderdir.
fresh();
run('serbestHazirla();pazarlikAc(0,"ilk5",0);globalThis.aday=pazarlikOyuncusu();globalThis.talep=transferTalepleri(aday)');
element('paz-bonservis').value=run('talep.bonservis');
run('kulupPazarligi()');
element('paz-maas').value=run('talep.maas');
element('paz-imza').value=run('talep.imza');
element('paz-sure').value=26;
run('oyuncuPazarligi();pazarlikImzala();ekonomiEkrani()');
assert.equal(run('kariyer.oyuncular[0]===aday'),true);
assert.equal(run('kariyer.mali.gider.transferImza'),run('talep.imza'));
assert.equal(run('kariyer.mali.gider.yenileme'),undefined);
assert.ok(element('uygulama').innerHTML.includes('Transfer imza parası'));
console.log('Denetimdeki hatalar için regresyon testleri geçti; laboratuvar kaynak/yükleme listesinden kaldırıldı.');
`)(require,__dirname);
