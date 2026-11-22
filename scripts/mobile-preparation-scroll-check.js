const fs=require('fs');const path=require('path');
(async()=>{
const pages=await (await fetch('http://127.0.0.1:9223/json')).json();const page=pages.find(p=>p.url==='https://localhost/');if(!page)throw Error('Oyun WebView bulunamadı');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let id=0;const pending=new Map();ws.onmessage=e=>{const v=JSON.parse(e.data);if(v.id&&pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}};
function send(method,params={}){return new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}

const backupPath='reports/preparation-scroll/mobile-original-save.json';
fs.mkdirSync('reports/preparation-scroll/ui',{recursive:true});
if(fs.existsSync(backupPath))throw Error('Önce yarım kalan testin asıl kaydını geri getir.');
const original=await evaluate('({save:localStorage.getItem(KAYIT_ANAHTARI),previous:localStorage.getItem(KAYIT_ANAHTARI+"_geri_donus")})');fs.writeFileSync(backupPath,JSON.stringify(original));
const layout=[];
try{
 await evaluate("globalThis.__originalAlert=window.alert;window.alert=()=>{};globalThis.__originalAd=reklamMacTamamlandi;reklamMacTamamlandi=()=>{};macAkisiniTemizle();kariyer=null;yeniKariyerFormu();document.getElementById('takimAdi').value='Plan Testi';kariyerBaslat();rehberAtla();");
 const screens=[
 ['harita-ban',"(async()=>{hazirlikEkrani();window.scrollTo(0,300);await new Promise(r=>setTimeout(r,40));const y=scrollY;banYap(banKalan()[0]);await new Promise(r=>setTimeout(r,40));if(scrollY!==y)throw Error('Ban kaydırdı: '+y+' -> '+scrollY);})()"],
 ['plan-secimi',"(async()=>{canli=canliKur(HARITALAR[0]);canliHazirlikEkrani();await new Promise(r=>setTimeout(r,40));window.scrollTo(0,600);const y=scrollY;hazirlikPlanSec('utility');await new Promise(r=>setTimeout(r,40));if(scrollY!==y)throw Error('Plan kaydırdı: '+y+' -> '+scrollY);})()"],
 ['mod-secimi',"(async()=>{window.scrollTo(0,700);const y=scrollY;hizliMacModuSec('hizli');await new Promise(r=>setTimeout(r,40));if(scrollY!==y)throw Error('Mod kaydırdı: '+y+' -> '+scrollY);})()"],
 ['yeni-ekran',"(async()=>{canliIptal();await new Promise(r=>setTimeout(r,40));if(scrollY!==0)throw Error('Yeni ekran üstten açılmalı');})()"]
 ];
 for(const [name,expression] of screens){
  await evaluate(expression+';window.scrollTo(0,0)');
  const l=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll("button,select")].filter(b=>b.getBoundingClientRect().width>innerWidth).length})');
  if(l.scroll>l.width||l.overflow)throw Error('Mobil taşma: '+name);
  layout.push({screen:name,...l});
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('reports/preparation-scroll/ui/'+name+'.png',Buffer.from(shot.data,'base64'));
 }
 console.log(JSON.stringify(layout));fs.writeFileSync('reports/preparation-scroll/ui/layout.json',JSON.stringify(layout,null,2));
}finally{
 await evaluate('macAkisiniTemizle();kariyer=null;'+(original.save===null?'localStorage.removeItem(KAYIT_ANAHTARI);':'localStorage.setItem(KAYIT_ANAHTARI,'+JSON.stringify(original.save)+');')+(original.previous===null?'localStorage.removeItem(KAYIT_ANAHTARI+"_geri_donus");':'localStorage.setItem(KAYIT_ANAHTARI+"_geri_donus",'+JSON.stringify(original.previous)+');')+'window.alert=__originalAlert;reklamMacTamamlandi=__originalAd;if(kayitVarMi())kayitYukle();else anaMenu();');
 fs.unlinkSync(backupPath);console.log('Asıl kariyer geri getirildi.');ws.close();
}
})().catch(e=>{console.error(e);process.exitCode=1;});
