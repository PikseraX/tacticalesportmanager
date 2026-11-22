const fs = require("node:fs");
const path = require("node:path");
const harness = fs.readFileSync(path.join(__dirname, "career-systems-test.js"), "utf8")
  .split("element('takimAdi').value=")[0];

new Function("require", "__dirname", harness + String.raw`
element("takimAdi").value = "Atlas Test";
run("kariyerBaslat(); rehberAtla(); dilAdlari=dilKorumaliAdlar()");
const baseline = run("JSON.stringify(kariyer)");
const maps = run("HARITALAR.slice()");
const player = run("kariyer.oyuncular[0].ad");
const samples = [
  "Yarı devre skoru: 7-5",
  "İlk yarı taktikleri: sen Dengeli, rakip Agresif",
  "İkinci yarı taktikleri: sen Temkinli, rakip Dengeli",
  "İkinci yarı hızlı simüle edildi: sen Agresif, rakip Temkinli.",
  "Devre arası takım molası (7-5)",
  "Rakip mola aldı (6-9)",
  "Değişiklik: " + player + " çıktı, Reserve Test girdi",
  "Harita " + maps[0] + " maç pratiğiyle gelişti: 4 → 5.",
  "A alanında bomba kuruldu; bomba patladı, T tarafı raundu aldı.",
  "B alanında bomba kuruldu; CT tarafı sahayı temizleyip bombayı etkisizleştirdi.",
  "CT savunması A yaklaşımını tuttu; bomba kurulamadı.",
  "Rakibin ortalama GEN değeri 7.3 puan daha yüksekti.",
  "Kadronun form etkisi -3.2 güçtü.",
  "Bu haritadaki hazırlık farkı -4 güçtü.",
  "Dengeli taktiğin rakibin Agresif planına karşı dezavantajlıydı.",
  "Sezon 3 Bitti", "Yükseldin! Yeni ligin: 4. Lig", "Düştün. Yeni ligin: 5. Lig",
  "Çeyrek Final turunda elendi", "Son 16 turunda elendi",
  "Atlas Test: " + player + " (GEN 52) ayrıldı, Reserve Test (GEN 61) geldi.",
  "Seri kaybeden takım -6 güç cezası alır.",
  "Mola seriyi sıfırlar ve sonraki 3 round'a +12 verir.",
  "Mola Al (kalan 2)", "Devre Arası Takım Molası (2)"
];
const numbers = text => [...text.matchAll(/[+-]?\d+(?:[.,]\d+)?/g)].map(x=>Number(x[0].replace(",",".")));
for (const [lang] of run("OYUN_DILLERI").filter(([code])=>code!=="tr")) {
  run("oyunDili="+JSON.stringify(lang));
  for (const sample of samples) {
    const translated = run("dilMetni(" + JSON.stringify(sample) + ")");
    assert.notEqual(translated,sample,lang+": "+sample);
    if(sample.includes(player))assert.ok(translated.includes(player),lang+": player name");
    for(const value of numbers(sample))assert.ok(numbers(translated).includes(value),lang+": numeric value "+value);
    assert.ok(!/[ğışİĞŞ]/.test(translated.split(player).join("")),lang+": untranslated text");
  }
  const scoreList = "("+maps[0]+" 13-8, "+maps[1]+" 10-13, "+maps[2]+" 13-7)";
  const result = run("dilMetni("+JSON.stringify(scoreList)+")");
  assert.deepEqual(numbers(result),numbers(scoreList));
  for(const map of maps.slice(0,3)){
    assert.ok(result.includes(run("dilMetni("+JSON.stringify(map)+")")),lang+": map name");
  }
  for(const role of run("Object.keys(ROL_GEN_AGIRLIKLARI)")){
    const result=run("dilMetni("+JSON.stringify(player+" ("+role+")")+")");
    assert.ok(result.includes(player));
    assert.ok(result.includes(run("dilMetni("+JSON.stringify(role)+")")),lang+": role");
  }
}
assert.equal(run("JSON.stringify(kariyer)"),baseline,"Translating reports must not change saved career data.");
run('oyunDili="en"');
assert.equal(run('dilMetni("Son hızlı atak")'),"Son hızlı atak","Round-of template must only capture numbers.");
assert.equal(run('dilMetni("Reserve Test (Bilinmeyen)")'),"Reserve Test (Bilinmeyen)","Role-card template must not consume arbitrary parentheses.");
run('dilAdlari.add("Dengeli"); dilAdlari.add("Yıldız")');
assert.equal(run('dilMetni("Değişiklik: Dengeli çıktı, Yıldız girdi")'),"Substitution: Dengeli off, Yıldız on");
assert.equal(run('dilMetni("Atlas Test: Dengeli (GEN 52) ayrıldı, Yıldız (GEN 61) geldi.")'),"Atlas Test: Dengeli (OVR 52) left; Yıldız (OVR 61) joined.");
assert.match(run('skorTahtasi("Atlas Test","Rival",13,8,true,"Galibiyet","")'),/data-ceviri-anahtari="Kazandın!"/);
assert.match(run('skorTahtasi("Atlas Test","Rival",8,13,true,"Mağlubiyet","")'),/data-ceviri-anahtari="Kaybettin\."/);
run("tabloEkrani()");
assert.equal((element("uygulama").innerHTML.match(/data-ceviri-anahtari="Tablo:/g)||[]).length,5);
// Repeat a real season close with the same random stream in every language.
let expected;
for(const [lang] of run("OYUN_DILLERI")){
  run("kariyer="+baseline+";rakipleriBagla();oyunDili="+JSON.stringify(lang)+";kariyer.sezon.bitti=true;globalThis.testSeed=13579;Math.random=()=>{testSeed=(Math.imul(testSeed,1664525)+1013904223)>>>0;return testSeed/4294967296;}");
  const budget=run("kariyer.butce");
  const reward=run("SEZON_ODULLERI[0]*LIG_ODUL_CARPANI[kariyer.ligNo-1]");
  run("sezonuKapat()");
  assert.equal(run("kariyer.butce"),budget+reward,lang+": season prize");
  assert.equal(run("kariyer.sezon.no"),2,lang+": season number");
  assert.equal(run("kariyer.ligNo"),4,lang+": promotion");
  const state=run("JSON.stringify(kariyer)");
  if(expected===undefined)expected=state;else assert.equal(state,expected,lang+": identical season transition");
}
console.log("Match reports, map scores, roles, protected names, numeric values and real season transitions passed in 12 languages.");
`)(require,__dirname);
