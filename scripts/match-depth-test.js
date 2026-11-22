const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
function fresh(){element('takimAdi').value='Maç Derinliği';run('kariyerBaslat();rehberAtla()');}
fresh();
// Kişilik geçişi tekrar uygulanmaz; rastgele sayı tüketmez.
run('globalThis.oldRandom=Math.random;Math.random=()=>{throw Error("Kişilik RNG kullanmamalı")};kisilikHazirla();globalThis.kisilikler=JSON.stringify(tumKadro().map(o=>o.kisilik));kisilikHazirla();Math.random=oldRandom');assert.equal(run('JSON.stringify(tumKadro().map(o=>o.kisilik))'),run('kisilikler'));
run('kariyer.oyuncular.forEach(o=>o.kisilik="dengeli");kariyer.oyuncular[0].kisilik="mentor";kariyer.oyuncular[0].yas=28;kariyer.oyuncular[1].yas=20');assert.equal(run('mentorCarpani(kariyer.oyuncular[1])'),1.05);
run('kariyer.oyuncular[2].kisilik="mentor";kariyer.oyuncular[2].yas=29');assert.equal(run('mentorCarpani(kariyer.oyuncular[1])'),1.05,'mentor birikmez');
run('kariyer.oyuncular[1].yas=25');assert.equal(run('mentorCarpani(kariyer.oyuncular[1])'),1);
run('kariyer.yedekler=[serbestOyuncuUret("Sabırsız")];kariyer.yedekler[0].kisilik="sabirsiz";kariyer.yedekler[0].mor=60;kariyer.hafta=10;kisilikHaftalik([]);kisilikHaftalik([]);kisilikHaftalik([])');assert.equal(run('kariyer.yedekler[0].mor'),59);
run('kariyer.yedekler[0].sonOynadigiHafta=9;kisilikHaftalik([])');assert.equal(run('kariyer.yedekler[0].yedekHaftasi'),0);
// Hazırlık planları şartlarına göre artı/eksi verir; başlama sonrası değişmez.
fresh();run('canli=canliKur(HARITALAR[0]);canliHazirlikEkrani();hazirlikPlanSec("guvenli")');assert.equal(run('hazirlikPlanEtkisi(canli)'),3);
run('canli.sa=6');assert.equal(run('hazirlikPlanEtkisi(canli)'),-1);
run('canli.macEkrani="canli";hazirlikPlanSec("yildiz")');assert.equal(run('canli.hazirlikPlan'),'guvenli');
run('canli.hazirlikPlan="utility";canli.sa=0;canli.sb=0');assert.equal(run('hazirlikPlanEtkisi(canli)'),-2);
run('canli.sa=3;canli.A.oyuncular.forEach(o=>{o.utility=70;o.takimoyunu=70});canli.B.oyuncular.forEach(o=>{o.utility=50;o.takimoyunu=50})');assert.equal(run('hazirlikPlanEtkisi(canli)'),2);
run('canli.A.oyuncular.forEach(o=>{o.utility=40;o.takimoyunu=40})');assert.equal(run('hazirlikPlanEtkisi(canli)'),-2);
run('canli.onemliMac=true;canli.A.oyuncular.forEach(o=>o.kisilik="rekabetci");canli.B.oyuncular.forEach(o=>o.kisilik="dengeli")');assert.equal(run('kisilikMacEtkisi(canli)'),1);
run('canli.onemliMac=false');assert.equal(run('kisilikMacEtkisi(canli)'),0);
// Hikâye güç vermez; aynı olay iki kez kaydedilmez, BO3 haritaları ayrı maç sayılmaz.
fresh();run('globalThis.B=haftaRakip();globalThis.base=canliP(canliKur(HARITALAR[0],B));rekabetSonucKaydet(B,{sa:13,sb:11},false,"a");rekabetSonucKaydet(B,{sa:13,sb:11},false,"a");rekabetSonucKaydet(B,{sa:11,sb:13},false,"b");rekabetSonucKaydet(B,{sa:2,sb:1},true,"c")');
assert.equal(run('kariyer.rekabetler[rekabetAnahtari(B)].mac'),3);assert.equal(run('kariyer.rekabetler[rekabetAnahtari(B)].yakin'),3);assert.ok(run('rekabetHtml(B).includes("ÇEKİŞMELİ REKABET")'));assert.equal(run('canliP(canliKur(HARITALAR[0],B))'),run('base'));
run('kaydet();kayitYukle()');assert.equal(run('Object.values(kariyer.rekabetler)[0].mac'),3);
// Yeni kariyerde rehber isteğe bağlı; Atla hızlı maçı açar.
element('takimAdi').value='Rehber';run('kariyerBaslat()');assert.equal(run('hizliMacKullanilabilir()'),false);run('rehberAtla()');assert.equal(run('hizliMacKullanilabilir()'),true);
// Hızlı ilk yarı tam 12 raundda durur, taktik/plan/kimlikler kayıt-yedekte korunur.
fresh();run('canli=canliKur(HARITALAR[0]);canliHazirlikEkrani();hazirlikPlanSec("utility");hizliMacModuSec("hizli");globalThis.adCount=0;globalThis.oldAd=reklamMacTamamlandi;reklamMacTamamlandi=()=>adCount++;canliBasla("Dengeli")');
assert.equal(run('canli.sa+canli.sb'),12);assert.equal(run('canli.macEkrani'),'devre');assert.equal(run('kariyer.sezon.oynandi'),false);assert.equal(run('adCount'),0);
run('globalThis.score=canli.sa+":"+canli.sb;globalThis.roles=kariyer.oyuncular.map(o=>o.rol).join();kaydet();kayitYukle();macKaldiginYerdenDevam()');
assert.equal(run('canli.sa+":"+canli.sb'),run('score'));assert.equal(run('canli.hazirlikPlan'),'utility');assert.equal(run('canli.macModu'),'hizli');assert.equal(run('canli.istA[0].o===canli.A.oyuncular[0]'),true);
run('hizliMacDevreMolasi();hizliMacDevreMolasi()');assert.equal(run('canli.mola'),1,'devrede mola bir kez');
run('canliYariDevam("Temkinli")');assert.equal(run('canli'),null);assert.equal(run('kariyer.sezon.oynandi'),true);assert.equal(run('kariyer.oyuncular.map(o=>o.rol).join()'),run('roles'));assert.equal(run('adCount'),1);assert.equal(run('Object.values(kariyer.rekabetler)[0].mac'),1);assert.ok(run('kariyer.oyuncular.every(o=>o.ist.m===1)'));
run('reklamMacTamamlandi=oldAd');
// Devre değişikliği kayıtta kalır; yedek de maç istatistiği alır, kalıcı ilk 5 değişmez.
fresh();run('kariyer.yedekler=[serbestOyuncuUret("Hızlı Yedek")];kimyaHazirla();globalThis.ilkBes=kariyer.oyuncular.map(o=>o.kimlik).join();canli=canliKur(HARITALAR[0]);canliHazirlikEkrani();hizliMacModuSec("hizli");canliBasla("Dengeli");degisimYap(0,0);globalThis.exported=yedekDogrula(yedekMetni());kaydet();kayitYukle();macKaldiginYerdenDevam()');
assert.equal(run('canli.degisimHak'),1);assert.equal(run('canli.aktifA[0].o.macKaynakId'),run('kariyer.yedekler[0].kimlik'));assert.equal(run('exported.macModuTercihi'),'hizli');
run('canliYariDevam("Dengeli")');assert.equal(run('kariyer.oyuncular.map(o=>o.kimlik).join()'),run('ilkBes'));assert.equal(run('kariyer.yedekler[0].ist.m'),1);

// Hızlı ve tek tek raund yürütme aynı tohumda aynı ilk yarı istatistiğini üretir.
fresh();run('globalThis.graph=macGrafikPaketle({c:canliKur(HARITALAR[0])});globalThis.rng=Math.random;globalThis.seed=12;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};canli=macGrafikAc(graph).c;canliDevreyeAtla();globalThis.fast=JSON.stringify({a:canli.sa,b:canli.sb,stats:canli.istA.map(x=>[x.kill,x.death])});seed=12;canli=macGrafikAc(graph).c;canli.hizliSimulasyon=true;while(canli.sa+canli.sb<12){macIzleRaundHazirla(canli);while(canli.raundPlan.index<canli.raundPlan.olaylar.length)macIzleOlayUygula(canli,canli.raundPlan.olaylar[canli.raundPlan.index++],false);macIzleRaundBitir(canli)}Math.random=rng');
assert.equal(run('JSON.stringify({a:canli.sa,b:canli.sb,stats:canli.istA.map(x=>[x.kill,x.death])})'),run('fast'));
// Gerçek BO3 hızlı akışı seri başına bir istatistik/rekabet/ödül işlemi yapar.
fresh();run('kariyer.hafta=2;kariyer.sezon.hf=1;kariyer.turnuva={v:2,tid:"yerel",sezon:1,hayatta:[-1,0],katilan:[-1,0],tur:5,toplamTur:5,elendi:{},sonHafta:0};kariyer.macModuTercihi="hizli";canliSeriBasla(HARITALAR.slice(0,3),"")');
let guard=0;while(run('!!canliSeri')&&guard++<4){run('canliBasla("Dengeli")');assert.equal(run('canli.sa+canli.sb'),12);run('canliYariDevam("Dengeli")');if(run('!!canliSeri'))run('canliSeriSonraki()');}
assert.equal(run('canliSeri'),null);assert.equal(run('(kariyer.galibiyet||0)+(kariyer.maglubiyet||0)'),1);assert.equal(run('Object.values(kariyer.rekabetler)[0].mac'),1);assert.ok(run('kariyer.oyuncular.every(o=>o.ist.m===1)'));
for(const fn of ['kisilikEkrani','rekabetEkrani','ligMenu','kadroEkrani'])run(fn+'()');
console.log('Maç derinliği: sabit kişilik/mentor sınırı/yedek beklentisi, koşullu planlar ve kilit, güç vermeyen/idempotent rekabet, hızlı maç devre kaydı/mola/taktik/aynı raund motoru/BO3 tek sonuç testleri geçti.');
`)(require,__dirname);
