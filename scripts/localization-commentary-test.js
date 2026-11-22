const fs=require("node:fs"),path=require("node:path");
const harness=fs.readFileSync(path.join(__dirname,"career-systems-test.js"),"utf8").split("element('takimAdi').value=")[0];
new Function("require","__dirname",harness + String.raw`
element("takimAdi").value="Atlas";
run("kariyerBaslat();rehberAtla()");
const baseline=run("JSON.stringify(kariyer)");
const catalog=run("DIL_CEVIRILERI");
const starts=["İlk temas!","Çatışma kızışıyor!","Bir oyuncu daha oyun dışında!"];
const ends=["","{0} takımında son oyuncu kaldı.","{0} takımında ayakta kalan yok."];
const finishes=["","Skora yeniden denge geldi!","Fark yalnızca bir raund!"];
const kill="{0}, {1} oyuncusunu düşürüyor. {2} adına önemli bir hamle!";
const win="{0} raundu alıyor! Tabela {1}–{2}.";
const start="{0}. raund başlıyor! {1} {2} tarafında. Skor {3}–{4}.";
const names=[
 ["Galor","Fenwen","Atlas","Rival"],
 ["Dengeli","Yıldız","Hedef","Şimşek"],
 ["Ace! One","Second. Player","First! Team","Other. Squad"]
];
const fill=(source,values)=>source.replace(/\{(\d+)\}/g,(_,n)=>values[n]);
const expectedPart=(source,values,index)=>fill(index<0?source:catalog[source][index],values);
const render=text=>run("spikerMetniParcalari("+JSON.stringify(text)+").map(parca=>dilMetni(parca)).join(' ')");
let combinations=0;
for(const [index,[lang]] of run("OYUN_DILLERI").entries()){
 run("oyunDili="+JSON.stringify(lang));
 for(const [a,b,team,other] of names){
  for(const prefix of starts)for(const tail of ends){
   const source=[prefix,fill(kill,[a,b,team]),tail?fill(tail,[other]):""].filter(Boolean).join(" ");
   const expected=[expectedPart(prefix,[],index-1),expectedPart(kill,[a,b,team],index-1),tail?expectedPart(tail,[other],index-1):""].filter(Boolean).join(" ");
   assert.equal(render(source),expected,lang+": "+source);
   for(const name of [a,b,team,...(tail?[other]:[])])assert.ok(render(source).includes(name),lang+": preserve "+name);
   combinations++;
  }
  for(const tail of finishes){
   const score=tail==="Skora yeniden denge geldi!"?["7","7"]:["8","7"];
   const source=[fill(win,[team,...score]),tail].filter(Boolean).join(" ");
   const expected=[expectedPart(win,[team,...score],index-1),tail?expectedPart(tail,[],index-1):""].filter(Boolean).join(" ");
   assert.equal(render(source),expected,lang+": "+source);combinations++;
  }
  for(const side of ["CT","T"]){
   const values=["13",team,side,"7","5"],source=fill(start,values);
   assert.equal(render(source),expectedPart(start,values,index-1),lang+": round opening");combinations++;
  }
 }
 assert.equal(render("Takımlar hazırlanıyor…"),index===0?"Takımlar hazırlanıyor…":catalog["Takımlar hazırlanıyor…"][index-1]);
 assert.equal(run("JSON.stringify(kariyer)"),baseline,"Rendering must not mutate saved state");
}
run('oyunDili="en"');
assert.equal(render("İlk temas! Ekip raundu alıyor! Tabela 9–7."),"İlk temas! Ekip wins the round! Score: 9–7.","Team name must not become an announcement");
assert.equal(run('spikerMetniHtml("<script> & Player")'),"<span>&lt;script&gt; &amp; Player</span>","Escape every text fragment");
run("globalThis.narrationSources=[];globalThis.originalNarrator=spikerSoyle;spikerSoyle=function(c,text,type){narrationSources.push(text);return originalNarrator(c,text,type);}");
let expectedState,announcements=0;
for(const [lang] of run("OYUN_DILLERI")){
 run("kariyer="+baseline+";rakipleriBagla();oyunDili="+JSON.stringify(lang)+";globalThis.seed=712;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};narrationSources=[];canli=canliKur(HARITALAR[0],dunya[0]);canli.macEkrani='canli';canliIzleBaslat()");
 let guard=0;
 while(run("canli&&canli.macEkrani!=='devre'")&&guard++<1000)run("spikerAdim(4)");
 assert.ok(guard<1000,lang+": first half completed");
 run('canliYariDevam("Dengeli")');guard=0;
 while(run("!!canli")&&guard++<2000)run("spikerAdim(4)");
 assert.ok(guard<2000,lang+": match completed");
 const messages=run("narrationSources");
 assert.ok(messages.length>40,lang+": real event stream");
 for(const message of messages){
  const translated=render(message);
  if(lang!=="tr")assert.ok(!/raund başlıyor|oyuncusunu düşürüyor|adına önemli bir hamle|son oyuncu kaldı|ayakta kalan yok|raundu alıyor|Skora yeniden denge|Fark yalnızca|İlk temas!|Çatışma kızışıyor|Bir oyuncu daha oyun dışında/.test(translated),lang+": "+translated);
 }
 const state=run("JSON.stringify({budget:kariyer.butce,w:kariyer.galibiyet,l:kariyer.maglubiyet,played:kariyer.sezon.oynandi,stats:kariyer.oyuncular.map(o=>o.ist)})");
 if(expectedState===undefined)expectedState=state;else assert.equal(state,expectedState,lang+": match outcome and statistics unchanged");
 announcements+=messages.length;
}
console.log(combinations+" complete commentary combinations, "+announcements+" real announcements and identical match outcomes passed in 12 languages.");
`)(require,__dirname);

