// League-promotion stress check. The per-round model matches canliP's
// logistic curve; the power-gap scenarios include a small manager/map edge.
function rng(seed) {
  return function () {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function roundChance(powerGap) {
  return Math.max(0.3, Math.min(0.7, 1 / (1 + Math.exp(-powerGap / 80))));
}

function mapWin(p, random) {
  let a = 0, b = 0;
  while (a < 13 && b < 13) {
    if (random() < p) a++; else b++;
    if (a === 12 && b === 12) break;
  }
  if (a === 13 || b === 13) return a > b;
  while (true) {
    let aa = 0, bb = 0;
    for (let i = 0; i < 6; i++) { if (random() < p) aa++; else bb++; }
    if (aa >= 4 || bb >= 4) return aa > bb;
  }
}

function season(powerGap, promoted, random) {
  const points = Array(8).fill(0);
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      for (let leg = 0; leg < 2; leg++) {
        const p = a === 0 ? roundChance(powerGap) : (b === 0 ? 1 - roundChance(powerGap) : 0.5);
        if (mapWin(p, random)) points[a] += 3; else points[b] += 3;
      }
    }
  }
  const tieBreak = points.map(() => random());
  const order = points.map((p, i) => i).sort((a, b) => points[b] - points[a] || tieBreak[b] - tieBreak[a]);
  return order.slice(0, promoted).includes(0);
}

const scenarios = [
  { name: "Başlangıç kadrosu (+3 GEN) ve sınırlı yönetim avantajı", gap: 10 },
  { name: "5. Lig piyasa üst sınırına kadro yükseltmesi ve yönetim avantajı", gap: 12 },
  { name: "Üstün taktik/harita kullanan güçlü kadro", gap: 17 }
];
const tests = 3000;
for (const scenario of scenarios) {
  const random = rng(87123 + scenario.gap);
  for (const promoted of [2, 1]) {
    let count = 0;
    for (let i = 0; i < tests; i++) if (season(scenario.gap, promoted, random)) count++;
    console.log(`${scenario.name} · ${promoted} yükselme hakkı: ${(100 * count / tests).toFixed(1)}% sezon başına`);
  }
}
