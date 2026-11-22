globalThis.studyControlResult = (()=>{
 studySeed(88271);document.getElementById("takimAdi").value="Kontrol";kariyerBaslat();rakipleriBagla();tarzlariHazirla();stratejiHazirla();sezonHazirla();kimyaHazirla();kariyer.personel={};kariyer.harita=Object.fromEntries(HARITALAR.map(h=>[h,0]));
 const opponent={ad:"Kontrol rakibi",strateji:"Dengeli",harita:Object.fromEntries(HARITALAR.map(h=>[h,0])),oyuncular:JSON.parse(JSON.stringify(kariyer.oyuncular))};
 const matchups=[];
 for(const gap of [-20,-10,-5,0,5,10,20]){
  kariyer.oyuncular.forEach(o=>{OZELLIKLER.forEach(z=>o[z]=60+gap/2);o.mor=70;o.yor=0;genelHesapla(o)});
  opponent.oyuncular.forEach(o=>{OZELLIKLER.forEach(z=>o[z]=60-gap/2);o.mor=70;o.yor=0;genelHesapla(o)});
  let wins=0;for(let n=0;n<600;n++){const c=studyMap(HARITALAR[0],opponent,null,{smart:true});if(c.sa>c.sb)wins++}
  matchups.push({gap,maps:600,wins,rate:Math.round(wins/6*10)/10});
 }
 canli=null;
 const training=[];
 for(const age of [20,27,32])for(const coach of [0,3]){
  let total=0;
  for(let n=0;n<200;n++){
   const o={ad:"Gelişim",rol:"Lider",yas:age};OZELLIKLER.forEach(z=>o[z]=50);genelHesapla(o);kariyer.oyuncular=[o];kariyer.yedekler=[];kariyer.personel={koc:coach};o.odak="liderlik";
   const before=o.genel;for(let w=0;w<28;w++)antrenmanUygula();total+=o.genel-before;
  }
  training.push({age,coach,genPerSeason:Math.round(total/200*10)/10});
 }
 const academy=[];
 for(let n=0;n<200;n++){
  const o={ad:"Akademi",rol:"Lider",yas:16,pot:80};OZELLIKLER.forEach(z=>o[z]=35);genelHesapla(o);kariyer.akademi=[o];kariyer.scoutGorevi=null;
  const row=[];for(let y=0;y<5;y++){for(let w=0;w<28;w++)akademiHaftalik([]);row.push(o.genel)}academy.push(row);
 }
 return {matchups,training,academyGenBySeason:[0,1,2,3,4].map(i=>Math.round(academy.reduce((s,x)=>s+x[i],0)/academy.length*10)/10)};
})();
