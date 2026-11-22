const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
const result=new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Antrenman Ölçümü';run('kariyerBaslat();rehberAtla()');
return JSON.parse(run('JSON.stringify((()=>{'+
'const rows=[];const rng=Math.random;let seed=913;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};'+
'for(const mode of ["hafif","normal","yogun","donusumlu"])for(const staff of [0,3])for(const schedule of ["lig","herHafta"]){'+
'let growth=0,fatigue=0,matchFatigue=0,over40=0,matches=0,form=0;const runs=300;'+
'for(let n=0;n<runs;n++){seed=913+n;kariyer.personel={koc:staff,fizyo:staff};kariyer.yedekler=[];kariyer.oyuncular=ROLLER.map(rol=>{const o={ad:rol,rol,yas:20,bitis:10000,yor:0,mor:70,odak:"nisan"};OZELLIKLER.forEach(z=>o[z]=50);genelHesapla(o);return o});'+
'for(let w=0;w<28;w++){const y=yorOf(kariyer.oyuncular[0]);kariyer.antrenmanYogunluk=mode==="donusumlu"?(y>=45?"hafif":"yogun"):mode;const played=schedule==="herHafta"||w%2===0;if(played){matches++;matchFatigue+=y;form+=formEtkisi(kariyer.oyuncular);if(y>40)over40++}antrenmanUygula();kariyer.haftaMac=played;formHaftalik([])}'+
'growth+=kariyer.oyuncular.reduce((s,o)=>s+o.genel-50,0)/5;fatigue+=yorOf(kariyer.oyuncular[0]);}'+
'rows.push({mode,coach:staff,physio:staff,schedule,rosterSeasons:runs,genGain:+(growth/runs).toFixed(2),finalFatigue:+(fatigue/runs).toFixed(1),matchFatigue:+(matchFatigue/matches).toFixed(1),fatiguedMatchesPercent:+(100*over40/matches).toFixed(1),matchFormEffect:+(form/matches).toFixed(2)})}Math.random=rng;return {rosterSeasons:4800,playerSeasons:24000,weeks:134400,rows}})())'));
`)(require,__dirname);
fs.mkdirSync('reports/planning',{recursive:true});fs.writeFileSync('reports/planning/training-study.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
