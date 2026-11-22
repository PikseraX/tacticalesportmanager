const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const ctx=vm.createContext({
  localStorage:{getItem:()=>null,setItem(){}},
  document:{readyState:"loading",addEventListener(){}}
});
for(const file of ["dil-verileri.js","dil-sayilar.js","dil.js"]) {
  vm.runInContext(fs.readFileSync(require("node:path").join(__dirname,"..",file),"utf8"),ctx);
}
const run=source=>vm.runInContext(source,ctx);
assert.equal(run("OYUN_DILLERI.length"),12);
for(const [key,values] of Object.entries(run("DIL_CEVIRILERI"))) {
  assert.equal(values.length,11,key);
  const placeholders=text=>[...text.matchAll(/\{\d+\}/g)].map(x=>x[0]).sort();
  for(const text of values) {
    assert.ok(text.trim(),key);
    assert.deepEqual(placeholders(text),placeholders(key),key);
  }
}
for(const [lang] of run("OYUN_DILLERI")) {
  run("oyunDili="+JSON.stringify(lang));
  assert.ok(run('dilMetni("Ana Menü")'));
  const result=run('dilMetni("7. raund başlıyor! Atlas CT tarafında. Skor 3–4.")');
  assert.ok(result.includes("Atlas"));
  assert.ok(result.includes("CT"));
  assert.ok(result.includes("3"));
  assert.ok(result.includes("4"));
  if(lang!=="tr") assert.ok(!result.includes("raund başlıyor"),lang);
}
run('oyunDili="en"');
assert.equal(run('dilMetni("← Geri")'),"← Back");
assert.equal(run('dilMetni("Kendi Tasarımını Oluştur · Kilitli")'),"Create Your Own Design · Locked");
assert.equal(run('dilMetni("GEN 48")'),"OVR 48");
assert.equal(run('dilMetni("Sponsor <script>")'),"Sponsor <script>");
assert.equal(run('dilMetni("Galor, Fenwen oyuncusunu düşürüyor. Atlas adına önemli bir hamle!")'),"Galor takes down Fenwen. A crucial play for Atlas!");
assert.equal(run('dilMetni("Galor (Lider, 27)")'), "Galor (In-game Leader, 27)");
assert.equal(
  run('dilMetni("Liderlik (%30), İletişim (%20), Karar Verme (%20), Oyun Bilgisi (%15)")'),
  "Leadership (30%), Communication (20%), Decision-making (20%), Game Sense (15%)"
);
assert.equal(run('dilMetni("Bilinmeyen oyuncu")'), "Bilinmeyen oyuncu");
assert.equal(run('dilMetni("Sezonda en az 7 galibiyet al")'), "Win at least 7 matches this season");
assert.equal(run('dilMetni("Hedef")'), "Objective");
assert.equal(run('dilMetni("Poyraz (21 hafta kaldı)")'), "Poyraz (21 weeks left)");
assert.equal(run('dilMetni(" · Seviye ")'), " · Level ");
assert.equal(run('dilMetni(" (dünya sırası ")'), " (World Rank ");
assert.equal(run('dilMetni("/hafta")'), "/week");
assert.equal(run('dilMetni("1 oyuncu")'), "1 player");
assert.equal(run('dilMetni("1 maç")'), "1 match");
assert.equal(run('dilMetni("Poyraz (1 hafta kaldı)")'), "Poyraz (1 week left)");
run('oyunDili="ru"');
for (const [n, expected] of [[1,"игрок"],[2,"игрока"],[5,"игроков"],[11,"игроков"],[14,"игроков"],[21,"игрок"],[22,"игрока"],[25,"игроков"]]) {
  assert.equal(run('dilMetni("' + n + ' oyuncu")'), n + " " + expected);
}
assert.equal(run('dilMetni("Poyraz (21 hafta kaldı)")'), "Poyraz (Осталась 21 неделя)");
assert.equal(run('dilMetni("2 hafta kaldı")'), "Осталось 2 недели");
run('oyunDili="en"');
console.log("12 languages, catalog consistency, placeholders, names, commentary and fallback passed.");

const harness = fs.readFileSync(require("node:path").join(__dirname, "career-systems-test.js"), "utf8")
  .split("element('takimAdi').value=")[0];
new Function("require", "__dirname", harness + String.raw`
const topics = run("oyunRehberKonulari()");
const labels = topics.flatMap(topic => [topic.ad, topic.acik, ...topic.bolumler.map(([title]) => title)]);
const paragraphs = topics.flatMap(topic => topic.bolumler.map(([,text]) => text));
const dictionaries = run("DIL_CEVIRILERI");
for (const text of labels) {
  assert.ok(run("dilHarfEslemeleri.has(" + JSON.stringify(text.toLocaleUpperCase("tr")) + ")"), text);
}
for (const text of paragraphs) {
  assert.ok(Object.hasOwn(dictionaries, text), "Missing guide paragraph: " + text);
}
assert.ok(Object.hasOwn(dictionaries, run("KARIYER_REHBER_ADIMLARI[3].metin")));
for (const [lang] of run("OYUN_DILLERI").filter(([code]) => code !== "tr")) {
  run("oyunDili=" + JSON.stringify(lang));
  for (const text of paragraphs) {
    const translated = run("dilMetni(" + JSON.stringify(text) + ")");
    assert.notEqual(translated, text, lang);
    const numbers = value => [...value.matchAll(/\d+(?:[.,]\d+)?/g)].map(match => Number(match[0].replace(",", ".")));
    const expected = numbers(text.replace(/İlk 5|ilk 5/g, ""));
    const actual = numbers(translated);
    for (const number of expected) assert.ok(actual.includes(number), lang + ": missing rule value " + number + " in " + text);
  }
}
console.log("All guide headings, topic descriptions, 40 paragraphs and 11 translation languages passed.");
`)(require, __dirname);
