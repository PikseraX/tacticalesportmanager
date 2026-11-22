const fs=require('fs');const path=require('path');
(async()=>{
const pages=await (await fetch('http://127.0.0.1:9223/json')).json();const page=pages.find(p=>p.url==='https://localhost/');if(!page)throw Error('Oyun WebView bulunamadı');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let id=0;const pending=new Map();ws.onmessage=e=>{const v=JSON.parse(e.data);if(v.id&&pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}};
function send(method,params={}){return new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}

const backupPath='reports/commentary/mobile-original-save.json';
fs.mkdirSync('reports/commentary/ui',{recursive:true});
if(fs.existsSync(backupPath))throw Error('Önce yarım kalan testin asıl kaydını geri getir.');
const original=await evaluate('({save:localStorage.getItem(KAYIT_ANAHTARI),previous:localStorage.getItem(KAYIT_ANAHTARI+"_geri_donus")})');fs.writeFileSync(backupPath,JSON.stringify(original));
const layout=[];
try{
 await evaluate("globalThis.__originalAlert=window.alert;window.alert=()=>{};globalThis.__originalAd=reklamMacTamamlandi;reklamMacTamamlandi=()=>{};macAkisiniTemizle();kariyer=null;yeniKariyerFormu();document.getElementById('takimAdi').value='Plan Testi';kariyerBaslat();rehberAtla();");
 const screens=[
 ['canli-anlatim','canli=canliKur(HARITALAR[0]);canli.macEkrani="canli";canliIzleBaslat();for(let i=0;i<4;i++)spikerAdim(4)'],
 ['kaydirma',"(async()=>{document.querySelector('details').open=true;window.scrollTo(0,300);await new Promise(r=>setTimeout(r,40));const y=scrollY,root=document.querySelector('.spiker-ekrani');spikerAdim(4);await new Promise(r=>setTimeout(r,40));if(scrollY!==y||document.querySelector('.spiker-ekrani')!==root||!document.querySelector('details').open)throw Error('Kaydırma/panel korunmadı: '+y+' -> '+scrollY);})()"],
 ['mola','canliMola()']
 ];
 for(const [name,expression] of screens){
  await evaluate(expression+';window.scrollTo(0,0)');
  const l=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll("button,select")].filter(b=>b.getBoundingClientRect().width>innerWidth).length})');
  if(l.scroll>l.width||l.overflow)throw Error('Mobil taşma: '+name);
  layout.push({screen:name,...l});
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('reports/commentary/ui/'+name+'.png',Buffer.from(shot.data,'base64'));
 }
 console.log(JSON.stringify(layout));fs.writeFileSync('reports/commentary/ui/layout.json',JSON.stringify(layout,null,2));
}finally{
 await evaluate('macAkisiniTemizle();kariyer=null;'+(original.save===null?'localStorage.removeItem(KAYIT_ANAHTARI);':'localStorage.setItem(KAYIT_ANAHTARI,'+JSON.stringify(original.save)+');')+(original.previous===null?'localStorage.removeItem(KAYIT_ANAHTARI+"_geri_donus");':'localStorage.setItem(KAYIT_ANAHTARI+"_geri_donus",'+JSON.stringify(original.previous)+');')+'window.alert=__originalAlert;reklamMacTamamlandi=__originalAd;if(kayitVarMi())kayitYukle();else anaMenu();');
 fs.unlinkSync(backupPath);console.log('Asıl kariyer geri getirildi.');ws.close();
}
})().catch(e=>{console.error(e);process.exitCode=1;});
