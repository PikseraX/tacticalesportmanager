const YEDEK_MAX_BOYUT=8*1024*1024;
let yedekIslemSuruyor=false;
let yedekAday=null;
function kayitYedekEkrani() {
  const varMi=kariyer || kayitVarMi();
  uygulama.innerHTML='<button class="geri" onclick="'+(kariyer?'kariyerEkrani()':'anaMenu()')+'">← Geri</button><h2>Kayıt Yedeği</h2><section class="gelisim-kart"><small>KARİYERİNİ KORU</small><h3>Bir dosya, tüm kariyerin</h3><p>Kadron, sezonun, kulüp tarihçen ve devam eden maçın yedeğe eklenir. Dosyayı saklayıp başka bir cihazda da geri yükleyebilirsin.</p>'+(varMi?'<button class="buton" onclick="kayitDisariAktar()">Yedeği Dosyaya Kaydet</button>':'<p>Yedeklemek için önce bir kariyer başlat.</p>')+(localStorage.getItem(KAYIT_ANAHTARI+'_geri_donus')?'<button class="buton ikincil" onclick="yedekOncekiKaydaDon()">Yükleme Öncesi Kayda Dön</button>':'')+'<button class="buton ikincil" onclick="kayitDosyasiSec()">Yedek Dosyası Seç</button><input id="yedek-dosya" type="file" accept=".json,application/json" hidden><p id="yedek-durum" role="status" aria-live="polite"></p></section>';
  document.getElementById('yedek-dosya').onchange=async function(){
    const file=this.files?.[0]; if(!file)return;
    if(file.size>YEDEK_MAX_BOYUT){yedekDurum('Dosya çok büyük. En fazla 8 MB seçebilirsin.');return;}
    try{yedekOnizle(await file.text());}catch(e){yedekDurum(e.message || 'Dosya okunamadı.');}
    this.value='';
  };
}
function yedekDurum(yazi){const el=document.getElementById('yedek-durum');if(el)el.textContent=yazi;}
function yedekMetni() {
  if(kariyer){macKaydiGuncelle();}
  const veri=kariyer || JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
  if(!veri)throw Error('Yedeklenecek kariyer yok.');
  return JSON.stringify({uygulama:'tactical-esports-manager',surum:1,tarih:new Date().toISOString(),kariyer:veri});
}
async function kayitDisariAktar() {
  if(yedekIslemSuruyor)return; yedekIslemSuruyor=true;
  try{
    const metin=yedekMetni(),ad='TEM-kariyer-'+new Date().toISOString().slice(0,10)+'.json';
    if(new Blob([metin]).size>YEDEK_MAX_BOYUT)throw Error('Kayıt 8 MB sınırını aşıyor.');
    const cap=window.Capacitor;
    if(cap?.isPluginAvailable('CareerBackup')){
      const r=await cap.nativePromise('CareerBackup','exportSave',{text:metin,name:ad});
      yedekDurum(r.cancelled?'Dosya kaydetme iptal edildi.':'Yedek dosyan kaydedildi.');
    }else{
      const url=URL.createObjectURL(new Blob([metin],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download=ad;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      yedekDurum('Yedek indirmeye hazırlandı. İndirilenler klasörünü kontrol et.');
    }
  }catch(e){yedekDurum(e.message || 'Yedek kaydedilemedi.');}finally{yedekIslemSuruyor=false;}
}
async function kayitDosyasiSec(){
  if(yedekIslemSuruyor)return;
  const cap=window.Capacitor;
  if(!cap?.isPluginAvailable('CareerBackup')){document.getElementById('yedek-dosya').click();return;}
  yedekIslemSuruyor=true;
  try{const r=await cap.nativePromise('CareerBackup','importSave',{});if(!r.cancelled)yedekOnizle(r.text);}
  catch(e){yedekDurum(e.message || 'Dosya okunamadı.');}finally{yedekIslemSuruyor=false;}
}
function yedekDogrula(metin) {
  if(typeof metin!=='string' || metin.length>YEDEK_MAX_BOYUT)throw Error('Geçersiz dosya boyutu.');
  let paket;try{paket=JSON.parse(metin);}catch(_){throw Error('Bu dosya geçerli bir JSON yedeği değil.');}
  if(paket?.uygulama!=='tactical-esports-manager' || paket.surum!==1)throw Error('Bu oyun sürümüyle uyumlu bir TEM yedeği seç.');
  const k=paket.kariyer;
  const obj=x=>x && typeof x==='object' && !Array.isArray(x);
  const sayi=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
  if(!obj(k)||typeof k.takimAdi!=='string'||!k.takimAdi.trim()||k.takimAdi.length>80||!/^#[0-9a-f]{6}$/i.test(k.renk)||!sayi(k.butce,-1e12,1e12)||!Number.isInteger(k.hafta)||k.hafta<1)throw Error('Kariyerin temel bilgileri eksik veya bozuk.');
  function oyuncu(o){return obj(o)&&typeof o.ad==='string'&&Object.hasOwn(TARZLAR,o.rol)&&sayi(o.yas,1,150)&&sayi(o.genel,1,99)&&OZELLIKLER.every(z=>sayi(o[z],1,99));}
  if(!Array.isArray(k.oyuncular)||k.oyuncular.length!==5||!k.oyuncular.every(oyuncu))throw Error('Kadro bilgileri geçersiz.');
  for(const key of ['yedekler','akademi','adaylar','serbest'])if(k[key]!==undefined&&(!Array.isArray(k[key])||!k[key].every(oyuncu)))throw Error('Oyuncu havuzu bozuk: '+key);
  if(k.rakipler!==undefined&&(!Array.isArray(k.rakipler)||k.rakipler.length!==TOPLAM_TAKIM-1||!k.rakipler.every(t=>obj(t)&&typeof t.ad==='string'&&Array.isArray(t.oyuncular)&&t.oyuncular.length===5&&t.oyuncular.every(oyuncu))))throw Error('Dünya takım bilgileri geçersiz.');
  if(k.ligNo!==undefined&&(!Number.isInteger(k.ligNo)||k.ligNo<1||k.ligNo>5))throw Error('Lig bilgisi geçersiz.');
  if(k.ligler!==undefined&&(!Array.isArray(k.ligler)||k.ligler.length!==5||!k.ligler.every(l=>Array.isArray(l)&&l.every(i=>Number.isInteger(i)&&i>=-1&&i<TOPLAM_TAKIM-1))))throw Error('Lig yapısı bozuk.');
  if(k.sezon){const s=k.sezon;
    if(!obj(s)||!Number.isInteger(s.no)||s.no<1||!Array.isArray(s.tablo)||s.tablo.length!==8||!s.tablo.every(t=>obj(t)&&['o','g','m','puan','rd'].every(z=>Number.isFinite(t[z])))||!Array.isArray(s.fikstur)||s.fikstur.length!==14||!s.fikstur.every(t=>Array.isArray(t)&&t.length===4&&t.every(m=>Array.isArray(m)&&m.length===2&&m.every(i=>Number.isInteger(i)&&i>=0&&i<8)))||!Array.isArray(s.takimlar)||s.takimlar.length!==8||!sayi(s.gun,0,14)||!sayi(s.hf,0,28))throw Error('Sezon bilgisi bozuk.');
  }
  if(k.antrenmanYogunluk!==undefined && !Object.hasOwn(ANTRENMAN_YOGUNLUKLARI,k.antrenmanYogunluk))throw Error('Antrenman planı geçersiz.');
  if(k.izlemeListesi!==undefined && (!Array.isArray(k.izlemeListesi)||k.izlemeListesi.length>20||!k.izlemeListesi.every(izlemeKaydiGecerli)))throw Error('İzleme listesi geçersiz.');
  if(k.macModuTercihi!==undefined && !['canli','hizli'].includes(k.macModuTercihi))throw Error('Maç izleme tercihi geçersiz.');
  // Eski ekranlar da adları HTML içinde kullanır: dosyadaki metinler işaretleme taşıyamaz.
  let nodes=0;
  function kontrol(x,depth){
    if(++nodes>400000||depth>80)throw Error('Yedek yapısı sınırı aşıyor.');
    if(typeof x==='number'&&!Number.isFinite(x))throw Error('Geçersiz sayı.');
    if(x&&typeof x==='object')for(const key of Object.keys(x)){
      if(['__proto__','constructor','prototype'].includes(key))throw Error('Geçersiz yedek alanı.');
      if(typeof x[key]==='string'){
        if(/<(?!\/?b>|br\s*\/?>)/i.test(x[key]))throw Error('Yedekte desteklenmeyen işaretleme var.');
      }else kontrol(x[key],depth+1);
    }
  }
  kontrol(k,0);
  if(k.macKaydi){
    const g=k.macKaydi.grafik;
    if(k.macKaydi.surum!==1 || !g || !Array.isArray(g.nodes) || g.nodes.length>50000 || !g.root || !Number.isInteger(g.root.ref) || !g.nodes[g.root.ref])throw Error('Devam eden maç kaydı geçersiz.');
    for(const n of g.nodes){
      if(!obj(n.data) || typeof n.dizi!=='boolean')throw Error('Maç düğümü bozuk.');
      for(const v of Object.values(n.data))if(v && typeof v==='object' && (!Number.isInteger(v.ref) || v.ref<0 || v.ref>=g.nodes.length))throw Error('Maç başvurusu bozuk.');
    }
    const v=macGrafikAc(g);
    if(!v || (!v.canli && !v.seri) || (v.canli && (!obj(v.canli.A)||!obj(v.canli.B)||!sayi(v.canli.sa,0,10000)||!sayi(v.canli.sb,0,10000))))throw Error('Devam eden maç eksik.');
    if(v.canli && ((v.canli.hazirlikPlan!==undefined && !Object.hasOwn(MAC_HAZIRLIK_PLANLARI,v.canli.hazirlikPlan)) || (v.canli.macModu!==undefined && !['canli','hizli'].includes(v.canli.macModu))))throw Error('Maç planı geçersiz.');
  }
  return k;
}
function yedekOnizle(metin){
  yedekAday=yedekDogrula(metin);
  uygulama.innerHTML='<h2>Yedeği Geri Yükle</h2><section class="gelisim-kart"><small>DOSYA KONTROL EDİLDİ</small><h3>'+oyunYazisi(yedekAday.takimAdi)+'</h3><p>Sezon '+(yedekAday.sezon?.no||1)+' · Hafta '+yedekAday.hafta+'</p><p>Bütçe: '+para(yedekAday.butce)+'</p><p>Bu yedek mevcut kariyerin yerine geçecek. Mevcut kayıt, geri dönmek için cihazda ayrıca korunur.</p><button class="buton" onclick="yedegiUygula()">Bu Yedeği Geri Yükle</button><button class="buton ikincil" onclick="yedekIptal()">Vazgeç</button><p id="yedek-durum" role="status"></p></section>';
}
function yedekIptal(){yedekAday=null;kayitYedekEkrani();}
function yedegiUygula(){
  if(!yedekAday)return;
  if(kariyer)macKaydiGuncelle();
  const canliOnce=kariyer?JSON.stringify(kariyer):null, once=canliOnce || localStorage.getItem(KAYIT_ANAHTARI);
  try{
    if(once)localStorage.setItem(KAYIT_ANAHTARI+'_geri_donus',once);
    localStorage.setItem(KAYIT_ANAHTARI,JSON.stringify(yedekAday));
    kayitYukle();yedekAday=null;
  }catch(e){
    try{if(once)localStorage.setItem(KAYIT_ANAHTARI,once);else localStorage.removeItem(KAYIT_ANAHTARI);}catch(_){}
    macAkisiniTemizle();kariyer=canliOnce?JSON.parse(canliOnce):null;
    if(kariyer){rakipleriBagla();kariyerEkrani();macKaydiniYukle();}else anaMenu();
    alert('Yedek yüklenemedi. Önceki kariyerin korundu.');
  }
}
function yedekOncekiKaydaDon(){
  const metin=localStorage.getItem(KAYIT_ANAHTARI+'_geri_donus');
  if(!metin)return;
  try{yedekOnizle(JSON.stringify({uygulama:'tactical-esports-manager',surum:1,kariyer:JSON.parse(metin)}));}
  catch(e){yedekDurum('Önceki kayıt açılamadı.');}
}
