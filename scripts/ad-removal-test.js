const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

async function test() {
  const cache = new Map();
  const calls = [];
  let purchases = [];
  let fail = false;
  const ctx = vm.createContext({
    document: { addEventListener() {}, querySelectorAll: () => [] },
    localStorage: { getItem: k => cache.get(k), setItem: (k, v) => cache.set(k, v) },
    window: { Capacitor: {
      isPluginAvailable: () => true,
      nativePromise: async (plugin, method, args) => {
        calls.push({ plugin, method, args });
        if (method === "getPurchases") {
          if (fail) throw new Error("Offline");
          return { purchases };
        }
      }
    } }
  });
  vm.runInContext(fs.readFileSync("satinalma.js", "utf8"), ctx);
  const refresh = () => vm.runInContext("reklamsizDurumuYenile()", ctx);
  const productIdentifier = "reklamlari_kaldir";
  purchases = [{ productIdentifier, purchaseState: "2" }, { productIdentifier: "other", purchaseState: "1" }];
  assert.equal(await refresh(), false);
  purchases = [{ productIdentifier, purchaseState: "1", isAcknowledged: false, purchaseToken: "test" }];
  assert.equal(await refresh(), true);
  assert.equal(calls.at(-2).method, "setAdsDisabled");
  assert.equal(calls.at(-2).args.disabled, true);
  assert.equal(calls.at(-1).method, "acknowledgePurchase");
  fail = true;
  await assert.rejects(refresh, /Offline/);
  assert.equal(cache.get("tem.reklamsiz.v1"), "1");
  fail = false;
  purchases = [];
  assert.equal(await refresh(), false);
  assert.equal(calls.at(-1).args.disabled, false);
  const tasarim = "ozel_kulup_tasarimi";
  purchases = [{ productIdentifier: tasarim, purchaseState: "2" }];
  assert.equal(await refresh(), false);
  assert.equal(cache.get("tem.ozel-tasarim.v1"), "0");
  purchases = [{ productIdentifier: tasarim, purchaseState: "1", isAcknowledged: false, purchaseToken: "tasarim" }];
  assert.equal(await refresh(), false);
  assert.equal(cache.get("tem.ozel-tasarim.v1"), "1");
  assert.equal(calls.at(-1).args.purchaseToken, "tasarim");
  purchases = [];
  await refresh();
  assert.equal(cache.get("tem.ozel-tasarim.v1"), "0");
  console.log("Bekleyen ödeme, tamamlanan satın alım, onay, çevrimdışı durum ve sahiplik kaybı geçti.");
}
test().catch(error => { console.error(error); process.exitCode = 1; });
