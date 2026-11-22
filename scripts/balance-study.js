const fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2);const arg=(k,d)=>{const i=args.indexOf(k);return i>=0?args[i+1]:d};
const runs=Number(arg('--runs','24')),seasons=Number(arg('--seasons','6')),output=arg('--out','balance-study.json');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
const results=new Function('require','__dirname','studyRuns','studySeasons',harness+String.raw`
vm.runInContext(fs.readFileSync(path.join(__dirname,'balance-policy.js'),'utf8'),ctx,{filename:'balance-policy.js'});
const studyResults=[];
for(let profileIndex=0;profileIndex<3;profileIndex++){
 for(let trial=0;trial<studyRuns;trial++){
  ctx.studySeedValue=900001+trial*7919;
  ctx.studyProfileIndex=profileIndex;ctx.studySeasonCount=studySeasons;
  studyResults.push(vm.runInContext('studyCareer(STUDY_PROFILES[studyProfileIndex],studySeedValue,studySeasonCount)',ctx));
  if((trial+1)%10===0)console.log('Tamamlandı:',profileIndex+1,'profil,',trial+1,'/',studyRuns,'kariyer');
 }
}
globalThis.studyCounters = JSON.parse(vm.runInContext("JSON.stringify(STUDY_COUNTS)",ctx));
return JSON.parse(JSON.stringify(studyResults));
`)(require,__dirname,runs,seasons);
const median=a=>{a=a.slice().sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:null};
const round=x=>Math.round(x*10)/10;
const summary=['Rahat','Dengeli','Planlı'].map(name=>{
 const r=results.filter(x=>x.profile===name),s=r.flatMap(x=>x.seasons);
 return {profile:name,careers:r.length,seasons:s.length,winRate:round(100*s.reduce((a,x)=>a+x.wins,0)/s.reduce((a,x)=>a+x.wins+x.losses,0)),firstSeasonWins:round(r.reduce((a,x)=>a+x.seasons[0].wins,0)/r.length),promoted:round(100*r.filter(x=>x.firstPromotion).length/r.length),firstPromotionMedian:median(r.map(x=>x.firstPromotion).filter(Boolean)),topLeague:round(100*r.filter(x=>x.firstTopLeague).length/r.length),topLeagueMedian:median(r.map(x=>x.firstTopLeague).filter(Boolean)),anyDebt:round(100*r.filter(x=>x.negativeWeeks>0).length/r.length),finalGen:round(r.reduce((a,x)=>a+x.seasons.at(-1).endGen,0)/r.length),finalCashMedian:median(r.map(x=>Math.round(x.seasons.at(-1).endCash))),lossStreakMedian:median(r.map(x=>x.longestLossStreak)),transfersMedian:median(r.map(x=>x.transfers)),academyPromotions:r.reduce((a,x)=>a+x.academyPromotions,0),finalLeagueMedian:median(r.map(x=>x.seasons.at(-1).endLeague))};
});
const config={generatedAt:new Date().toISOString(),runs,seasons,counters:globalThis.studyCounters,method:'Oyunun gerçek maç/hafta/transfer/sponsor/lig işlevleri; sabit tohumlu yönetim politikaları. Görsel animasyon, reklam bekleme süreleri ve kayıt IO ölçüm dışında.',summary,results};
fs.writeFileSync(output,JSON.stringify(config,null,2));console.log(JSON.stringify(summary,null,2));
