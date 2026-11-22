const fs = require("node:fs");
const path = require("node:path");
const harness = fs.readFileSync(path.join(__dirname, "career-systems-test.js"), "utf8")
  .split("element('takimAdi').value=")[0];

new Function("require", "__dirname", harness + String.raw`
element("takimAdi").value = "Localization Test";
run("kariyerBaslat(); rehberAtla(); serbestHazirla()");
const baseline = run("JSON.stringify(kariyer)");
const names = run("kariyer.oyuncular.map(o => o.ad)");
const messages = [];
const reset = () => run("kariyer = " + baseline);
function captureHtml() {
  messages.push(...element("uygulama").innerHTML.replace(/<[^>]*>/g, "\n").split("\n").map(x => x.trim()).filter(Boolean));
}
for (const pool of ["BASIN_GALIBIYET", "BASIN_MAGLUBIYET"]) {
  for (const question of run(pool)) {
    messages.push(question.soru, ...question.sec.map(x => x.ad));
  }
}
for (const tip of ["anlasmazlik", "zam", "motivasyon", "sosyal", "yemek"]) {
  reset();
  const event = { tip, a: names[0], b: names[1], hafta: 1 };
  run("kariyer.olay = " + JSON.stringify(event));
  const info = run("olayBilgi(kariyer.olay)");
  messages.push(info.baslik, info.metin, ...info.sec.flatMap(x => [x.ad, x.acik]));
  for (let choice = 0; choice < info.sec.length; choice++) {
    for (const random of tip === "anlasmazlik" && choice === 0 ? [0, .99] : [.99]) {
      reset();
      run("kariyer.olay = " + JSON.stringify(event));
      run("globalThis.testOriginalRandom = Math.random; Math.random = () => " + random);
      try { run("olayCoz(" + choice + ")"); } finally { run("Math.random = testOriginalRandom"); }
      assert.equal(run("kariyer.olay"), null);
      captureHtml();
    }
  }
  reset();
  run("kariyer.olay = " + JSON.stringify(event));
  run("globalThis.testReports = []; globalThis.testOriginalRandom = Math.random; Math.random = () => .99");
  try { run("olayHaftalik(testReports)"); } finally { run("Math.random = testOriginalRandom"); }
  messages.push(...run("testReports"));
}
reset();
const before = run("JSON.stringify(kariyer)");
const plainMessages = [...new Set(messages)];
for (const [lang] of run("OYUN_DILLERI").filter(([code]) => code !== "tr")) {
  run("oyunDili = " + JSON.stringify(lang));
  for (const source of plainMessages) {
    const translated = run("dilMetni(" + JSON.stringify(source) + ")");
    let content = source;
    for (const name of names) content = content.split(name).join("");
    if (/[çğıöşüÇĞİÖŞÜ]/.test(content) || lang === "en" && /[a-zA-Z]/.test(content)) {
      assert.notEqual(translated, source, lang + ": " + source);
    }
    for (const name of names.filter(name => source.includes(name))) {
      assert.ok(translated.includes(name), lang + ": player name changed");
    }
  }
}
assert.equal(run("JSON.stringify(kariyer)"), before, "Translation must not change career data.");
run('oyunDili="en"');
assert.equal(
  run('dilMetni("İtibar -1, Poyraz morali +1.")'),
  "Reputation -1, Poyraz: morale +1."
);
assert.equal(
  run('dilMetni("Arabuluculuk işe yaradı. Poyraz ve Tarkan barıştı (moral +4).")'),
  "Mediation worked. Poyraz and Tarkan made peace (morale +4)."
);
assert.equal(
  run('dilMetni("Teklif reddedildi. Kulübün karşı teklifi: 90,000 $")'),
  "Offer rejected. The club’s counteroffer is 90,000 $."
);
const achievements = run("BASARIMLAR.map(x => ({ id: x.id, ad: x.ad, acik: x.acik }))");
const achievementSource = JSON.stringify(achievements);
for (const achievement of achievements) {
  assert.ok(run("Object.hasOwn(DIL_CEVIRILERI, " + JSON.stringify(achievement.ad) + ")"), achievement.ad);
}
for (const [lang] of run("OYUN_DILLERI").filter(([code]) => code !== "tr")) {
  run("oyunDili = " + JSON.stringify(lang));
  for (const achievement of achievements) {
    assert.notEqual(run("dilMetni(" + JSON.stringify(achievement.acik) + ")"), achievement.acik, lang);
  }
}
assert.equal(run("JSON.stringify(BASARIMLAR.map(x => ({ id: x.id, ad: x.ad, acik: x.acik })))"), achievementSource);
run('oyunDili="en"');
assert.equal(run('dilMetni("✓ İlk Galibiyet")'), "✓ First Victory");
console.log(plainMessages.length + " press/event texts, all event branches, saved reports, player names and 11 languages passed.");
`)(require, __dirname);
