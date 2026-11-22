// Ölçüm politikaları. Olasılık, gelişim ve muhasebe oyunun gerçek işlevlerinden gelir.
function studySeed(seed) { let x=seed>>>0; Math.random=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}; }
function studyQuiet() {
  kaydet=()=>{};
  ["kariyerEkrani","sezonMacRaporu","turnuvaRaporu","haftaRaporu","sezonSonuEkrani","transferEkrani","pazarlikEkrani","personelEkrani","akademiEkrani","scoutBolgeEkrani","basinEkrani","olayEkrani","sozlesmeEkrani"].forEach(name=>{globalThis[name]=()=>{}});
}
function studyCounter(t) { return t === "Agresif" ? "Temkinli" : t === "Temkinli" ? "Dengeli" : "Agresif"; }
function studyMap(harita,rakip,seri,profile) {
  STUDY_COUNTS.liveMaps++;
  const c=canliKur(harita,rakip,seri);canli=c;c.hizliSimulasyon=true;
  c.tA=profile.smart&&personelSeviye("analist")>=1 ? studyCounter(c.tB) : "Dengeli";
  canliTaktikRolleriUygula(c,c.tA);
  let rounds=0;
  while(!(c.ot ? c.macaBitti : c.sa>=13||c.sb>=13)) {
    if(++rounds>600) throw Error("Aşırı uzayan maç");
    if(!c.yariGecti&&c.sa+c.sb>=12){
      c.yariGecti=true;c.tarafA=c.tarafA==="CT"?"T":"CT";
      c.tB=aiYariTaktik(c);
      if(profile.smart&&personelSeviye("analist")>=3)c.tA=studyCounter(c.tB);
      canliTaktikRolleriUygula(c,c.tA);
    }
    if(profile.smart&&c.serA>=3&&c.mola>0){c.mola--;c.serA=0;c.molaTur=MOLA_TUR;}
    macIzleRaundHazirla(c);
    while(c.raundPlan.index<c.raundPlan.olaylar.length)macIzleOlayUygula(c,c.raundPlan.olaylar[c.raundPlan.index++],false);
    macIzleRaundBitir(c);
  }
  c.hizliSimulasyon=false;
  return c;
}
function studyPlayLeague(profile){
  const h=profile.smart ? HARITALAR.reduce((a,b)=>haritaPuani({oyuncular:kariyer.oyuncular},a)-haritaPuani(haftaRakip(),a)>=haritaPuani({oyuncular:kariyer.oyuncular},b)-haritaPuani(haftaRakip(),b)?a:b) : HARITALAR[(kariyer.sezon.gun)%HARITALAR.length];
  const c=studyMap(h,null,null,profile);const win=c.sa>c.sb;canliBitir();return win;
}
function studyPlayTournament(profile){
  const tu=kariyer.turnuva;if(!tu)return;
  const B=turnuvaRakibi(tu);if(!B)throw Error("Turnuva rakibi eksik");
  const A={ad:kariyer.takimAdi,oyuncular:macKadroKopyala(kariyer.oyuncular),strateji:kariyer.strateji};
  const series={A,rakip:B,mine:0,theirs:0,idx:0,hr:[],notlar:[],degisimHak:2,kalan:HARITALAR.slice(0,3),banYazi:""};
  const stats=new Map();
  while(series.mine<2&&series.theirs<2){const c=studyMap(HARITALAR[series.idx],B,series,profile);c.sa>c.sb?series.mine++:series.theirs++;series.hr.push({h:c.harita,m:c.sa,t:c.sb});series.idx++;
    c.istA.forEach(x=>{const id=x.o.macKaynakId;const value=stats.get(id)||{o:x.o,kill:0,death:0};value.kill+=x.kill;value.death+=x.death;stats.set(id,value)});haritaMacGelisimi(c.harita);}
  canli=null;canliSeri=null;
  turnuvaTurOyna(series.kalan,"",{mine:series.mine,theirs:series.theirs,hr:series.hr,not:"",istA:[...stats.values()]});
}
function studySponsors(profile){
  sponsorHazirla();sponsorTemizle();
  while(kariyer.sponsorlar.length<profile.sponsors&&kariyer.sponsorTeklif.length){
    let pick=0;if(profile.smart)kariyer.sponsorTeklif.forEach((x,i)=>{if(x.haftalik>kariyer.sponsorTeklif[pick].haftalik)pick=i});sponsorImzala(pick);
  }
}
function studyReserve(){return Math.max(80000,haftalikGider()*8);}
function studyManage(profile,year,telemetry){
  studySponsors(profile);
  if(basinBekliyor())basinCevap(0);
  if(kariyer.olay){const o=kariyer.olay;const i=o.tip==="zam"&&kariyer.butce<studyReserve()?2:o.tip==="yemek"&&kariyer.butce<studyReserve()?1:0;olayCoz(i);}
  const desired=profile.staff(year);
  PERSONEL_TURLERI.forEach((tur)=>{
    const s=personelSeviye(tur),target=desired[tur]||0;
    if(s<target&&kariyer.butce>studyReserve()+PERSONEL_MALIYET[s+1]-PERSONEL_MALIYET[s])personelYukselt(tur);
  });
  if(profile.smart){
    kariyer.oyuncular.forEach(o=>{o.odak=TARZLAR[o.rol].reduce((a,b)=>o[a]<=o[b]?a:b)});
    kariyer.haritaOdak=HARITALAR.reduce((a,b)=>haritaPuani({oyuncular:kariyer.oyuncular},a)<haritaPuani({oyuncular:kariyer.oyuncular},b)?a:b);
  } else kariyer.haritaOdak=HARITALAR[0];
  if(kariyer.hafta%profile.transferEvery===1){
    serbestHazirla();const old=kariyer.oyuncular.reduce((a,b)=>a.genel<=b.genel?a:b),slot=kariyer.oyuncular.indexOf(old);
    const choices=kariyer.serbest.map((o,i)=>({o,i})).filter(x=>x.o.genel>=old.genel+3).sort((a,b)=>b.o.genel-a.o.genel);
    for(const x of choices){
      const estimated=transferUcreti(x.o)+formulMaas(x.o)*3-satisFiyati(old);
      if(kariyer.butce-estimated<studyReserve())continue;
      pazarlikAc(x.i,"ilk5",slot);document.getElementById("paz-bonservis").value=String(Math.ceil(transferUcreti(x.o)/100)*100);kulupPazarligi();
      if(kariyer.gorusme.asama==="kulup"){document.getElementById("paz-bonservis").value=String(x.o.transferTalep.bonservis);kulupPazarligi();}
      if(kariyer.gorusme.asama!=="oyuncu")break;
      document.getElementById("paz-maas").value=String(x.o.transferTalep.maas);document.getElementById("paz-imza").value=String(x.o.transferTalep.imza);document.getElementById("paz-sure").value="26";
      oyuncuPazarligi();pazarlikImzala();
      if(kariyer.oyuncular[slot]===x.o){telemetry.transfers++;stratejiUygula(kariyer);}break;
    }
  }
  sozlesmeHazirla();tumKadro().slice().forEach(o=>{const remaining=o.bitis-kariyer.hafta+1;if(remaining<=2&&moralOf(o)>=40&&kariyer.butce>=temelMaas(o)*4){sozlesmeYenile(tumKadro().indexOf(o));telemetry.renewals++;}});
  if(profile.scouting&&year>=2){
    akademiHazirla();if(!kariyer.scout&&kariyer.butce>studyReserve()+SCOUT_MALIYET[1]+100000)scoutYukselt();
    if(kariyer.scout&&!kariyer.scoutGorevi&&kariyer.hafta%12===1&&kariyer.butce>studyReserve()+30000)scoutGorevBaslat("yerel");
    for(let i=(kariyer.adaylar||[]).length-1;i>=0;i--){const o=kariyer.adaylar[i];if(o.tahmin[1]>=75&&kariyer.akademi.length<akademiKapasitesi()&&kariyer.butce>studyReserve()+AKADEMI_IMZA)adayAl(i);}
    for(let i=(kariyer.akademi||[]).length-1;i>=0;i--){const o=kariyer.akademi[i],weak=kariyer.oyuncular.reduce((a,b)=>a.genel<b.genel?a:b);if(o.genel>=weak.genel+2&&yedekListe().length<YEDEK_MAX){akademiYukselt(i);const j=yedekListe().length-1;yedekTakas(j,kariyer.oyuncular.indexOf(weak));yedekSat(j);stratejiUygula(kariyer);telemetry.academyPromotions++;}}
  }
}
function studyCareer(spec,seed,seasons){
  studySeed(seed);document.getElementById("takimAdi").value="Simülasyon";kariyerBaslat();rakipleriBagla();kimyaHazirla();tarzlariHazirla();stratejiHazirla();sezonHazirla();dunyaSiralamaHazirla();sozlesmeHazirla();haftaOzetBaslat();
  const data={seed,profile:spec.name,seasons:[],firstPromotion:null,firstTopLeague:null,negativeWeeks:0,lowestCash:kariyer.butce,longestLossStreak:0,transfers:0,renewals:0,academyPromotions:0,maps:0,stalled:false};let lossStreak=0;
  for(let year=1;year<=seasons;year++){
    const start={league:kariyer.ligNo,gen:ortGuc(kariyer.oyuncular),cash:kariyer.butce};
    let guard=0;
    while(!kariyer.sezon.bitti){
      if(++guard>30)throw Error("Hafta ilerlemedi");
      studyManage(spec,year,data);
      if(kariyer.sezon.hf%2===0){const won=studyPlayLeague(spec);data.maps++;lossStreak=won?0:lossStreak+1;data.longestLossStreak=Math.max(data.longestLossStreak,lossStreak);}
      else{
        if(spec.tournaments&&!kariyer.turnuva){const eligible=TURNUVALAR.find(T=>turnuvaDurum(T)==="hazir");if(eligible)turnuvaBaslat(eligible.id);}
        if(kariyer.turnuva){data.maps++;studyPlayTournament(spec);}
      }
      if(basinBekliyor())basinCevap(0);
      haftaGec();
      if(kariyer.butce<0)data.negativeWeeks++;
      data.lowestCash=Math.min(data.lowestCash,kariyer.butce);
      if(kariyer.butce < -1000000){data.stalled=true;break;}
    }
    const wins=kariyer.sezon.tablo[0].g, losses=kariyer.sezon.tablo[0].m,rank=siralama().indexOf(0)+1;
    if(!data.stalled)sezonuKapat();
    if(kariyer.ligNo<5&&!data.firstPromotion)data.firstPromotion=year;
    if(kariyer.ligNo===1&&!data.firstTopLeague)data.firstTopLeague=year;
    data.seasons.push({year,...start,endLeague:kariyer.ligNo,endGen:ortGuc(kariyer.oyuncular),endCash:kariyer.butce,wins,losses,rank,wages:haftalikGider(),income:sponsorGeliri(),staff:personelGideri()});
    if(data.stalled)break;
  }
  return data;
}
const STUDY_COUNTS = {liveMaps:0,backgroundMaps:0,rounds:0};
const studyOriginalMacOyna = macOyna;
macOyna = function (...args) { const r=studyOriginalMacOyna(...args); STUDY_COUNTS.backgroundMaps++; STUDY_COUNTS.rounds+=r.sa+r.sb; return r; };
const studyOriginalRound = macIzleRaundBitir;
macIzleRaundBitir = function(c) { STUDY_COUNTS.rounds++; return studyOriginalRound(c); };
studyQuiet();
const STUDY_PROFILES=[
 {name:"Rahat",smart:false,sponsors:2,transferEvery:12,scouting:false,tournaments:false,staff:y=>({koc:1,fizyo:0,analist:0})},
 {name:"Dengeli",smart:true,sponsors:3,transferEvery:8,scouting:true,tournaments:true,staff:y=>({koc:Math.min(2,Math.ceil(y/3)),fizyo:1,analist:Math.min(2,Math.ceil(y/3))})},
 {name:"Planlı",smart:true,sponsors:3,transferEvery:6,scouting:true,tournaments:true,staff:y=>({koc:Math.min(3,Math.ceil(y/2)),fizyo:Math.min(2,Math.ceil(y/3)),analist:Math.min(3,Math.ceil(y/2))})}
];
