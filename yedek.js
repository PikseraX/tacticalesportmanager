const YEDEK_MAX = 8;
const YEDEK_MAAS_ORANI = 0.5;

function yedekListe() {
  if (!kariyer.yedekler) kariyer.yedekler = [];
  return kariyer.yedekler;
}

function tumKadro() {
  return kariyer.oyuncular.concat(yedekListe());
}

function yedekEkrani() {
  const y = yedekListe();
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Yedek Kadro</h2>';
  html += '<div class="bilgi-kutusu">Yedek: <b>' + y.length + "/" + YEDEK_MAX + "</b><br>Yedek maaşı %50. Maça yalnızca ilk 5 çıkar. Yedekler antrenmanla gelişir.</div>";
  if (y.length === 0) html += "<p>Yedek oyuncun yok. Transfer Piyasası'ndan yedek alabilirsin.</p>";
  y.forEach(function (o, i) {
    html += '<button class="takim-butonu" onclick="yedekSec(' + i + ")\"><span style=\"text-align:left\" data-ceviri-isim-on-eki=\"" + oyunYazisi(o.ad) + "\">" + oyunYazisi(o.ad) + " (" + o.rol + ", " + o.yas + ")</span><span>GEN " + o.genel + "</span></button>";
  });
  if (y.length > 0) html += tabloHtml(y);
  uygulama.innerHTML = html;
}

function yedekSec(i) {
  const o = yedekListe()[i];
  if (!o) { yedekEkrani(); return; }
  let html = '<button class="geri" onclick="yedekEkrani()">← Geri</button><h2>' + oyunAdi(o.ad) + "</h2>";
  html += tabloHtml([o]);
  html += "<p>İlk 5'e almak için kimin yerine oynayacağını seç. O oyuncu yedeğe iner.</p>";
  kariyer.oyuncular.forEach(function (e, k) {
    html += '<button class="takim-butonu" onclick="yedekTakas(' + i + ", " + k + ")\"><span data-ceviri-isim-on-eki=\"" + oyunYazisi(e.ad) + "\">" + oyunYazisi(e.ad) + " (" + e.rol + ", GEN " + e.genel + ")</span><span>Yedeğe in</span></button>";
  });
  html += '<button class="buton tehlike" onclick="yedekSat(' + i + ')">Sat: +' + para(satisFiyati(o)) + "</button>";
  uygulama.innerHTML = html;
}

function yedekTakas(i, k) {
  if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri)) { macDevamEkrani(); return; }
  const y = yedekListe();
  const giren = y[i];
  const cikan = kariyer.oyuncular[k];
  if (!giren || !cikan) return;
  if (!confirm(giren.ad + " ilk 5'e girecek, " + cikan.ad + " yedeğe inecek. Onaylıyor musun?")) return;
  kariyer.oyuncular[k] = giren;
  y[i] = cikan;
  kaydet();
  yedekEkrani();
}

function yedekSat(i) {
  if ((typeof canli !== "undefined" && canli) || (typeof canliSeri !== "undefined" && canliSeri)) { macDevamEkrani(); return; }
  const y = yedekListe();
  const o = y[i];
  if (!o) return;
  if (!confirm(o.ad + " satılacak: +" + para(satisFiyati(o)) + ". Onaylıyor musun?")) return;
  taraftarTransfer(null, o);
  kariyer.butce += satisFiyati(o);
  maliIsle("gelir", "transfer", satisFiyati(o));
  y.splice(i, 1);
  piyasayaEkle(o);
  kaydet();
  yedekEkrani();
}
