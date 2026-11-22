const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
const result=new Function('require','__dirname',harness+String.raw`
vm.runInContext(fs.readFileSync(path.join(__dirname,'balance-policy.js'),'utf8'),ctx);
return JSON.parse(run('JSON.stringify((()=>{'+
'studyQuiet();studySeed(80231);document.getElementById("takimAdi").value="Plan Kontrolü";kariyerBaslat();rakipleriBagla();stratejiHazirla();sezonHazirla();kimyaHazirla();kariyer.personel={};kariyer.harita=Object.fromEntries(HARITALAR.map(h=>[h,0]));'+
'const B={ad:"Kontrol rakibi",strateji:"Dengeli",harita:Object.fromEntries(HARITALAR.map(h=>[h,0])),oyuncular:JSON.parse(JSON.stringify(kariyer.oyuncular))};'+
'const oldKur=canliKur,oldP=canliP;let plan="standart",maxRoundProbabilityDelta=0;canliKur=(...args)=>{const c=oldKur(...args);c.hazirlikPlan=plan;return c};canliP=c=>{const p=oldP(c),secim=c.hazirlikPlan;c.hazirlikPlan="standart";const base=oldP(c);c.hazirlikPlan=secim;maxRoundProbabilityDelta=Math.max(maxRoundProbabilityDelta,Math.abs(p-base));return p};'+
'const rows=[];try{for(const scenario of ["esit","utilityUstun","tekYildiz"]){'+
'kariyer.oyuncular.forEach(o=>{OZELLIKLER.forEach(z=>o[z]=60);o.kisilik="dengeli";o.mor=70;o.yor=0;genelHesapla(o)});B.oyuncular.forEach(o=>{OZELLIKLER.forEach(z=>o[z]=60);o.kisilik="dengeli";o.mor=70;o.yor=0;genelHesapla(o)});'+
'if(scenario==="utilityUstun"){kariyer.oyuncular.forEach(o=>{o.utility=68;o.takimoyunu=68;genelHesapla(o)});B.oyuncular.forEach(o=>{o.utility=52;o.takimoyunu=52;genelHesapla(o)})}'+
'if(scenario==="tekYildiz")B.oyuncular.forEach((o,i)=>{OZELLIKLER.forEach(z=>o[z]=i===0?80:55);genelHesapla(o)});'+
'for(plan of Object.keys(MAC_HAZIRLIK_PLANLARI)){let wins=0;const maps=1000;for(let n=0;n<maps;n++){studySeed(50001+n);const c=studyMap(HARITALAR[0],B,null,{smart:true});if(c.sa>c.sb)wins++;}rows.push({scenario,plan,maps,wins,winRate:+(wins/maps*100).toFixed(1)});}}'+
'}finally{canliKur=oldKur;canliP=oldP;canli=null;}return {maps:12000,rows,maxRoundProbabilityDelta,counts:STUDY_COUNTS};})())'));
`)(require,__dirname);
if(result.maxRoundProbabilityDelta>=.01)throw Error('Plan etkisi güç sınırını aştı');
const neutral=result.rows.find(x=>x.scenario==='esit'&&x.plan==='standart');if(neutral.winRate<44||neutral.winRate>56)throw Error('Nötr güç kontrolü başarısız');
fs.mkdirSync('reports/match-depth',{recursive:true});fs.writeFileSync('reports/match-depth/study.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
