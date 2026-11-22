const fs = require("node:fs");
const path = require("node:path");
const harness = fs.readFileSync(path.join(__dirname, "career-systems-test.js"), "utf8")
  .split("element('takimAdi').value=")[0];
new Function("require", "__dirname", harness + String.raw`
element("takimAdi").value = "Yıldız";
run("kariyerBaslat();rehberAtla();kariyer.oyuncular[0].ad='Hedef';");
const baseline = run("JSON.stringify(kariyer)");
const langs = run("OYUN_DILLERI");
const translate = text => run("dilMetni(" + JSON.stringify(text) + ")");
const slots = text => [...text.matchAll(/\{\d+\}/g)].map(x => x[0]).sort();
const catalog = run("DIL_CEVIRILERI");
for (const [source, indices] of Object.entries(run("dilIsimAlanlari"))) {
  assert.ok(catalog[source], "Name pattern must exist: " + source);
  for (const index of indices) assert.ok(slots(source).includes("{" + index + "}"), source);
}
for (const [source, pattern] of Object.entries(run("DIL_SAYI_KALIPLARI"))) {
  assert.ok(catalog[source], source);
  assert.ok(slots(source).includes("{" + pattern.alan + "}"), source);
  for (const target of [...Object.values(pattern.one), ...Object.values(pattern.ru || {})]) {
    assert.deepEqual(slots(target), slots(source), source);
    assert.ok(!target.includes("\uFFFD"), source);
  }
}
const samples = [
  ["en", "Returns in 1 week.", "Contract expires in 1 week.", "(2 teams, 1 round)"],
  ["de", "Rückkehr in 1 Woche.", "Vertrag endet in 1 Woche.", "(2 Teams, 1 Runde)"],
  ["fr", "Retour dans 1 semaine.", "Le contrat expire dans 1 semaine.", "(2 équipes, 1 tour)"],
  ["it", "Ritorno tra 1 settimana.", "Il contratto scade tra 1 settimana.", "(2 squadre, 1 turno)"],
  ["es", "Regresa en 1 semana.", "El contrato vence en 1 semana.", "(2 equipos, 1 ronda)"],
  ["pt", "Retorna em 1 semana.", "O contrato vence em 1 semana.", "(2 equipes, 1 rodada)"],
  ["el", "Επιστροφή σε 1 εβδομάδα.", "Το συμβόλαιο λήγει σε 1 εβδομάδα.", "(2 ομάδες, 1 γύρος)"]
];
for (const [lang, week, contract, rounds] of samples) {
  run("oyunDili=" + JSON.stringify(lang));
  assert.equal(translate("Dönüşe 1 hafta kaldı."), week);
  assert.equal(translate("Sözleşmesi 1 hafta sonra bitiyor."), contract);
  assert.equal(translate("(2 takım, 1 tur)"), rounds);
}
run('oyunDili="ru"');
for (const [n, week, team, round] of [
  [1, "неделю", "команда", "раунд"], [2, "недели", "команды", "раунда"],
  [5, "недель", "команд", "раундов"], [11, "недель", "команд", "раундов"],
  [14, "недель", "команд", "раундов"], [21, "неделю", "команда", "раунд"],
  [22, "недели", "команды", "раунда"], [25, "недель", "команд", "раундов"]
]) {
  assert.equal(translate("Dönüşe " + n + " hafta kaldı."), "Вернётся через " + n + " " + week + ".");
  assert.equal(translate("(" + n + " takım, " + n + " tur)"), "(" + n + " " + team + ", " + n + " " + round + ")");
}
const nameTemplates = [
  "Hedef (Lider, 24)", "Hedef (GEN 72)", "Hedef (1 hafta kaldı)",
  "Hedef: sözleşmesi bitti, 1 hafta içinde ayrılır.",
  "Hedef ile kendi oyuncunu karşılaştır.",
  "Hedef, Yıldız oyuncusunu düşürüyor. Dengeli adına önemli bir hamle!"
];
for (const [lang] of langs) {
  run("oyunDili=" + JSON.stringify(lang));
  for (const text of nameTemplates) {
    assert.ok(translate(text).includes("Hedef"), lang + ": " + text);
  }
  assert.ok(translate(nameTemplates.at(-1)).includes("Yıldız"), lang);
  assert.ok(translate(nameTemplates.at(-1)).includes("Dengeli"), lang);
  const field = element("feedback-message");
  field.value = "   ";
  field.setCustomValidity = text => { field.validation = text; };
  field.reportValidity = () => false;
  run("geriBildirimGonder({preventDefault(){}})");
  assert.equal(field.validation, translate("Lütfen mesajını yaz."), lang);
  assert.equal(field.value, "   ", "Validation preserves draft");
}
run('oyunDili="en";dilAdlari=new Set(["Dengeli","Hedef","Yıldız","Şimşek"])');
assert.equal(translate("Hedef"), "Objective");
assert.equal(translate("Yıldız"), "Star Player");
assert.equal(translate("Şimşek"), "Lightning Bolt");
assert.ok(translate("Dengeli taktiğin rakibin Dengeli planına karşı dezavantajlıydı.").includes("Balanced"));
assert.equal(translate("Hedef (Lider)"), "Hedef (In-game Leader)");
assert.equal(run('oyunAdi("A&B <Club>")'), '<span data-ceviri-yok>A&amp;B &lt;Club&gt;</span>');
for (const [lang, index, bad] of [["fr", 2, /\bGÉN\b/], ["it", 3, /\bVAL\b/]]) {
  run("oyunDili=" + JSON.stringify(lang));
  assert.equal(translate("GEN"), "GEN");
  for (const [key, targets] of Object.entries(catalog)) {
    if (key.includes("GEN")) assert.ok(!bad.test(targets[index]), key);
  }
}
assert.equal(run("JSON.stringify(kariyer)"), baseline, "Translations never mutate career/save data");
console.log("Localization regressions: names, roles, counters, Russian forms, glossary and validation passed in 12 languages.");
`)(require, __dirname);

