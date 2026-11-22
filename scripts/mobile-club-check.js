const fs=require('fs');const path=require('path');
(async()=>{
const pages=await (await fetch('http://127.0.0.1:9223/json')).json();const page=pages.find(p=>p.url==='https://localhost/');if(!page)throw Error('Oyun WebView bulunamadı');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let id=0;const pending=new Map();ws.onmessage=e=>{const v=JSON.parse(e.data);if(v.id&&pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}};
function send(method,params={}){return new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
if(process.argv[2]==='restore'){
 const original=JSON.parse(fs.readFileSync('reports/club-test-original-save.json','utf8'));
 await evaluate(`macAkisiniTemizle();kariyer=null; ${original.save===null?'localStorage.removeItem(KAYIT_ANAHTARI)':`localStorage.setItem(KAYIT_ANAHTARI,${JSON.stringify(original.save)})`}; ${original.previous===null?`localStorage.removeItem(KAYIT_ANAHTARI+'_geri_donus')`:`localStorage.setItem(KAYIT_ANAHTARI+'_geri_donus',${JSON.stringify(original.previous)})`}; if(globalThis.__originalAlert)window.alert=__originalAlert; if(kayitVarMi())kayitYukle();else anaMenu();`);
 fs.unlinkSync('reports/club-test-original-save.json');
 console.log('Emülatördeki asıl kariyer ve önceki yedek geri getirildi.');
}else if(process.argv[2]==='eval'){
 console.log(JSON.stringify(await evaluate(fs.readFileSync(process.argv[3],'utf8'))));
}else{
 fs.mkdirSync('reports/club-ui',{recursive:true});
 const original=await evaluate(`({save:localStorage.getItem(KAYIT_ANAHTARI),previous:localStorage.getItem(KAYIT_ANAHTARI+'_geri_donus')})`);
 if(fs.existsSync('reports/club-test-original-save.json'))throw Error('Önce restore ile asıl kariyeri geri getir.');
 fs.writeFileSync('reports/club-test-original-save.json',JSON.stringify(original));
 await evaluate(`globalThis.__originalAlert=window.alert;window.alert=()=>{};macAkisiniTemizle();kariyer=null;yeniKariyerFormu();document.getElementById('takimAdi').value='Test Akademi';kariyerBaslat();rehberAtla();`);
 for(const [name,expression] of [
 ['hedef','sezonHedefEkrani()'],
 ['tarihce',`kariyer.oyuncular[0].ist={m:14,ol:250,od:180};kulupMacKaydet({ad:'Deneme Rakibi'},{sa:13,sb:3,harita:HARITALAR[0]},false);kulupTarihceEkrani()`],
 ['gelisim',`kariyer.haftaBaslangic=haftaFotografi();kariyer.oyuncular[0].nisan++;haftaOzetKaydet([],0,0,0);haftalikOzetEkrani()`],
 ['yedek','kayitYedekEkrani()']]){
   await evaluate(expression+';window.scrollTo(0,0)');
   const layout=await evaluate(`({name:${JSON.stringify(name)},width:innerWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>innerWidth).length,plugin:Capacitor.isPluginAvailable('CareerBackup')})`);console.log(JSON.stringify(layout));
   const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join('reports/club-ui',name+'.png'),Buffer.from(shot.data,'base64'));
 }
 await evaluate(`globalThis.__nativeResult=null;Capacitor.nativePromise('CareerBackup','exportSave',{text:yedekMetni(),name:'TEM-test-yedek.json'}).then(r=>__nativeResult=r).catch(e=>__nativeResult={error:e.message});void 0;`);
 console.log('Android yedek dosyası kaydetme ekranı açıldı.');
}
ws.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
