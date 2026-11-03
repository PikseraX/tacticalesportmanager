// Maç oyuncuları kalıcı kadrodan ayrıdır. İstatistikler kaynak kimliğine geri işlenir.
function macKaynakOyuncu(o) {
  if (!o || !o.macKaynakId) return o;
  return tumKadro().find(x => x.kimlik === o.macKaynakId) || o;
}
function macOyuncuKopyala(o) {
  kisilikAta(o);
  const id = oyuncuKimligi(macKaynakOyuncu(o));
  const kopya = JSON.parse(JSON.stringify(o));
  kopya.macKaynakId = id;
  return kopya;
}
function macKadroKopyala(liste) { return liste.map(macOyuncuKopyala); }

// Ortak oyuncu/istatistik başvurularını ve döngüleri koruyan JSON grafiği.
// Görsel zamanlayıcı kimlikleri uygulama tekrar açıldığında geçerli değildir.
function macGrafikPaketle(root) {
  const refs = new Map(), nodes = [];
  const atla = new Set(['izleZamanlayici','izSonKare','navBaslatiyor','hizliSimulasyon']);
  function encode(value) {
    if (value === null || typeof value !== 'object') return value;
    if (refs.has(value)) return {ref:refs.get(value)};
    const id = nodes.length;
    refs.set(value,id);
    const node = {dizi:Array.isArray(value),data:{}};
    nodes.push(node);
    for (const key of Object.keys(value)) {
      if (atla.has(key) || value[key] === undefined || typeof value[key] === 'function') continue;
      node.data[key] = encode(value[key]);
    }
    return {ref:id};
  }
  return {root:encode(root),nodes};
}
function macGrafikAc(paket) {
  if (!paket || !Array.isArray(paket.nodes) || paket.nodes.length > 50000) throw Error('Geçersiz maç kaydı');
  const values = paket.nodes.map(n => n.dizi ? [] : {});
  const decode = v => v && typeof v === 'object' && Number.isInteger(v.ref) ? values[v.ref] : v;
  paket.nodes.forEach((node,id) => {
    for (const key of Object.keys(node.data)) {
      if (['__proto__','constructor','prototype'].includes(key)) continue;
      values[id][key] = decode(node.data[key]);
    }
  });
  return decode(paket.root);
}
function macKaydiGuncelle() {
  if (!kariyer) return;
  if (!canli && !canliSeri) { delete kariyer.macKaydi; return; }
  if (canli && canli.hizliSimulasyon) return;
  kariyer.macKaydi = {surum:1,hafta:kariyer.hafta,sezon:kariyer.sezon.no,
    grafik:macGrafikPaketle({canli:canli,seri:canliSeri})};
}
let macDevamBekliyor = false;
function macKaydiniYukle() {
  const k = kariyer.macKaydi;
  if (!k) return false;
  if (k.surum !== 1 || k.hafta !== kariyer.hafta || k.sezon !== kariyer.sezon.no) {
    delete kariyer.macKaydi; return false;
  }
  try {
    const veri = macGrafikAc(k.grafik);
    if (!veri || (!veri.canli && !veri.seri)) throw Error('Maç verisi eksik');
    canli = veri.canli; canliSeri = veri.seri;
    if (canli) {
      canli.izleZamanlayici = null; canli.izSonKare = null;
      canli.navBaslatiyor = false; canli.hizliSimulasyon = false;
    }
    macDevamBekliyor = true;
    macDevamEkrani(); return true;
  } catch (_) {
    canli = null; canliSeri = null; delete kariyer.macKaydi;
    alert('Devam eden maç kaydı açılamadı. Kariyer kaydın korunuyor.');
    return false;
  }
}
function macDevamEkrani() {
  const c = canli, s = canliSeri;
  let h = '<h2>Devam Eden Maç</h2><section class="gelisim-kart"><small>KALDIĞIN YERDEN DEVAM ET</small>';
  if (s) h += '<h3>' + oyunYazisi(s.A.ad) + ' · ' + oyunYazisi(s.rakip.ad) + '</h3><p>BO3 seri: <b>' + s.mine + ' – ' + s.theirs + '</b></p>';
  if (c) h += '<h3>' + oyunYazisi(c.harita) + '</h3><div class="gelisim-metrik"><b>' + c.sa + ' – ' + c.sb + '</b><span>' + (c.molaAcik ? 'Takım molası' : c.macEkrani === 'devre' ? 'Devre arası' : 'Maç kaydı hazır') + '</span></div>';
  else h += '<p>Tamamlanan haritalar kaydedildi. Sıradaki haritayla devam edebilirsin.</p>';
  uygulama.innerHTML = h + '</section><button class="buton" onclick="macKaldiginYerdenDevam()">Maça Devam Et</button>';
}
function macKaldiginYerdenDevam() {
  macDevamBekliyor = false;
  if (!canli && canliSeri) { canliSeriSonraki(); return; }
  if (!canli) { kariyerEkrani(); return; }
  if (canli.macEkrani === 'hazirlik') canliHazirlikEkrani();
  else if (canli.molaAcik) canliIzleEkrani();
  else if (canli.macEkrani === 'devre') yariEkrani();
  else canliDevam();
}
function macAkisiniTemizle() {
  if (canli) canliIzleDurdur();
  canli = null; canliSeri = null; banDurum = null; macDevamBekliyor = false;
}
document.addEventListener('visibilitychange', function () {
  if (!kariyer || (!canli && !canliSeri)) return;
  if (document.hidden) { if (canli) canliIzleDurdur(); kaydet(); }
  else if (canli && !macDevamBekliyor && canli.macEkrani === 'canli' && !canli.molaAcik) canliDevam();
});
