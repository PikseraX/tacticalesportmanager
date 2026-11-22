function moralOf(o) { return o.mor === undefined ? 70 : o.mor; }
function yorOf(o) { return o.yor === undefined ? 0 : o.yor; }
function sinir100(x) { return Math.max(0, Math.min(100, Math.round(x))); }

function maasTalebiMoralUygula(o,m) {
  maasTalebiniTakipEt(o);
  if (!maasIyilestirmeGerekli(o)) return m;
  const once=kariyer.haftaBaslangic?.oyuncular?.find(x=>x.id===o.kimlik)?.mor;
  return Math.min(m-3,moralOf(o)-1,Number.isFinite(once)?once-1:Infinity);
}

function oyuncuFormEtkisi(o) {
  return (moralOf(o) - 70) / 10 - Math.max(0, yorOf(o) - 40) / 6;
}

function formEtkisi(oyuncular) {
  if (!oyuncular.length) return 0;
  const t = oyuncular.reduce(function (s, o) { return s + oyuncuFormEtkisi(o); }, 0) / oyuncular.length;
  return Math.max(-12, t);
}

// Maç bitince çağrılır (lig ve turnuva)
function moralMacSonucu(kazandi) {
  kariyer.haftaMac = true;
  taraftarMacSonucu(kazandi);
  const d = kazandi ? 5 : -Math.max(2, 4 - personelSeviye("fizyo"));
  kariyer.oyuncular.forEach(function (o) { o.mor = sinir100(moralOf(o) + d); });
}

// Hafta sonunda çağrılır
function formHaftalik(rapor) {
  const oynadi = !!kariyer.haftaMac;
  kariyer.haftaMac = false;
  const dinlen = FIZYO_DINLENME[personelSeviye("fizyo")];
  kariyer.oyuncular.forEach(function (o) {
    o.yor = sinir100(yorOf(o) + (oynadi ? 6 : -8) - dinlen + antrenmanYogunlugu().yorgunluk);
    let m = moralOf(o);
    m += m < 70 ? Math.min(2,70-m) : (m > 70 ? -Math.min(2,m-70) : 0);
    if (sozlesmeBitti(o)) m -= 2;
    m = maasTalebiMoralUygula(o,m);
    o.mor = sinir100(m);
    if (o.yor >= 70) rapor.push("Yorgun: " + o.ad + " (yorgunluk " + o.yor + ")");
    if (o.mor < 40) rapor.push("Moralsiz: " + o.ad + " (moral " + o.mor + ")");
  });
  yedekListe().forEach(function (o) {
    o.yor = sinir100(yorOf(o) - 10 + antrenmanYogunlugu().yorgunluk);
    let m = moralOf(o);
    m += m < 55 ? 1 : (m > 55 ? -1 : 0);
    if (sozlesmeBitti(o)) m -= 2;
    m = maasTalebiMoralUygula(o,m);
    o.mor = sinir100(m);
  });
  kisilikHaftalik(rapor);
}

function formTablosu(liste, baslik) {
  let h = "<h2>" + baslik + '</h2><div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Moral</th><th>Yorgunluk</th><th>Etki</th></tr>';
  liste.forEach(function (o) {
    const m = moralOf(o), y = yorOf(o), e = oyuncuFormEtkisi(o);
    const mr = m >= 70 ? "var(--green)" : (m < 45 ? "var(--red)" : "var(--accent)");
    const yr = y <= 40 ? "var(--green)" : (y >= 70 ? "var(--red)" : "var(--accent)");
    h += "<tr><td>" + oyunAdi(o.ad) + '</td><td style="color:' + mr + '">' + m + '</td><td style="color:' + yr + '">' + y + "</td><td>" + (e > 0 ? "+" : "") + e.toFixed(1) + "</td></tr>";
  });
  return h + "</table></div>";
}
