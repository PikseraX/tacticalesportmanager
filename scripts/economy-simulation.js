// Deterministic 10-season cash-flow check for the current economy settings.
// Assumes three active sponsors, one starter-renewal cycle per season, and
// matching all five starters to a new league tier during full-roster upgrades.
// Omits tournament winnings, sponsor signing/objective bonuses, staff, academy,
// events, and reserve salaries/costs so assumptions remain clear and repeatable.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = {};
const files = ["ekonomi.js", "sponsor.js", "lig.js", "sezon.js", "maas.js"];
const source = files.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n") + `
globalThis.cfg = {
  sponsorTaban: SPONSOR_TABAN, sponsorSira: SPONSOR_SIRA_CARPANI,
  matchWin: MAC_GALIBIYET, matchLoss: MAC_MAGLUBIYET,
  matchScale: MAC_ODUL_CARPANI, leagueScale: LIG_ODUL_CARPANI,
  prizes: SEZON_ODULLERI,
  baseOffers: SPONSOR_ARALIK, salary: formulMaas
};`;
vm.runInNewContext(source, context);
const c = context.cfg;

const scenarios = [
  { name: "Temkinli yükseliş", leagues: [5, 5, 4, 4, 3, 3, 2, 2, 1, 1], ranks: [82, 78, 58, 52, 40, 34, 22, 18, 12, 10], wins: 5 },
  { name: "Düzenli yükseliş", leagues: [5, 4, 3, 2, 1, 1, 1, 1, 1, 1], ranks: [78, 52, 36, 20, 10, 8, 6, 4, 3, 2], wins: 8 },
  { name: "Hızlı yükseliş", leagues: [5, 4, 3, 2, 1, 1, 1, 1, 1, 1], ranks: [65, 40, 20, 10, 5, 3, 2, 1, 1, 1], wins: 11 }
];
const targetGen = [85, 75, 65, 55, 45];

for (const scenario of scenarios) {
  let cash = 500000;
  let gen = 48;
  let salaryFactor = 1;
  const rows = [];
  for (let year = 0; year < 10; year++) {
    const league = scenario.leagues[year];
    const rank = scenario.ranks[year];
    const target = targetGen[league - 1];
    const wins = scenario.wins;
    const place = wins >= 10 ? 1 : wins >= 7 ? 4 : 7;
    const reputation = 0.9 + 50 / 500;
    const orgWeekly = Math.round((c.sponsorTaban + (101 - rank) * c.sponsorSira) * 0.5 * reputation);
    const offerLevel = rank <= 16 ? 2 : rank <= 48 ? 1 : 0;
    const offer = c.baseOffers[offerLevel];
    const sponsorWeekly = 3 * Math.round(((offer[0] + offer[1]) / 2) / 100) * 100;
    const weeklySponsor = orgWeekly + sponsorWeekly;
    const wageWeekly = 5 * c.salary({ genel: gen });
    const matchIncome = wins * Math.round(c.matchWin * c.matchScale[league - 1]) + (14 - wins) * Math.round(c.matchLoss * c.matchScale[league - 1]);
    const prize = Math.round(c.prizes[place - 1] * c.leagueScale[league - 1]);
    // Assume all five starters are renewed once per season; salary rises 15%.
    // Renewal typically happens around week 20, so include the raised wage
    // for the final eight weeks and pay the four-week renewal fee.
    const wageCost = wageWeekly * salaryFactor * (20 + 8 * 1.15);
    const renewal = wageWeekly * salaryFactor * 4;
    const upgrade = Math.max(0, 5 * (target * target * 40 - gen * gen * 36));
    const income = weeklySponsor * 28 + matchIncome + prize;
    const expense = wageCost + renewal + upgrade;
    cash += income - expense;
    if (upgrade > 0) salaryFactor = 1; // full-lineup upgrade replaces the contracts
    else salaryFactor *= 1.15;
    gen = target;
    rows.push({ season: year + 1, league, rank, wins, income, expense, net: income - expense, cash });
  }
  console.log(`\n${scenario.name}`);
  console.log("Sezon | Lig | Sıra | Galibiyet | Gelir | Gider | Net | Bütçe");
  for (const r of rows) console.log(`${r.season} | ${r.league} | ${r.rank} | ${r.wins}/14 | ${r.income} | ${r.expense} | ${r.net} | ${r.cash}`);
  console.log(`Son bütçe: ${Math.round(cash).toLocaleString("tr-TR")} $; 10 sezonda bütçe eksiye düştü: ${rows.some((r) => r.cash < 0) ? "evet" : "hayır"}`);
}
