function taraftarHazirla() {
  if (!kariyer.taraftar) kariyer.taraftar = { memnuniyet:50, sayi:1000, haberler:[] };
}
function taraftarDegis(delta, haber) {
  taraftarHazirla();
  const t = kariyer.taraftar;
  t.memnuniyet = sinir100(t.memnuniyet + delta);
  if (haber) { t.haberler.unshift({ hafta:kariyer.hafta, yazi:haber, etki:delta }); t.haberler = t.haberler.slice(0,12); }
}
function taraftarMacSonucu(kazandi) {
  taraftarHazirla();
  const t = kariyer.taraftar;
  t.sayi = Math.max(100,Math.round(t.sayi*(kazandi ? 1.04 : 0.99)));
  taraftarDegis(kazandi ? 3 : -3,kazandi ? "Galibiyet taraftarları sevindirdi." : "Mağlubiyet tribünlerde hayal kırıklığı yarattı.");
}
function taraftarTransfer(gelen, giden) {
  const ort = ortGuc(kariyer.oyuncular);
  const delta = gelen ? (gelen.genel >= ort ? 3 : 1) : (giden && giden.genel >= ort ? -3 : -1);
  taraftarDegis(delta,gelen ? gelen.ad + " transferi taraftarda yeni bir beklenti yarattı." : giden.ad + " kulüpten ayrıldı.");
}
function taraftarSponsorCarpani() {
  taraftarHazirla();
  return 0.95 + kariyer.taraftar.memnuniyet/1000; // 0.95 .. 1.05
}
function taraftarEkrani() {
  taraftarHazirla();
  const t = kariyer.taraftar;
  let h = '<button class="geri" onclick="kulupMenu()">← Kulüp</button><h2>Taraftar ve İtibar</h2><section class="gelisim-kart"><small>KULÜBÜN SESİ</small><div class="analiz-izgara"><div><small>TARAFTAR</small><b>' + t.sayi.toLocaleString("tr-TR") + '</b></div><div><small>MEMNUNİYET</small><b>' + t.memnuniyet + '/100</b></div><div><small>KULÜP İTİBARI</small><b>' + itibarOf() + '/100</b></div><div><small>YENİ SPONSOR TEKLİFLERİ</small><b>×' + taraftarSponsorCarpani().toFixed(2) + '</b></div></div><p>Maç sonuçları, transferler ve basın açıklamaları taraftarı etkiler. Memnuniyet yeni sponsor tekliflerini ve haftalık organizasyon gelirini en fazla %5 değiştirir. İmzalı sponsorların ücretleri sabittir.</p></section><h2>Taraftar Gündemi</h2>';
  if (!t.haberler.length) h += '<p>Kulübünün hikâyesi ilk maçla başlıyor.</p>';
  t.haberler.forEach(x => { h += '<div class="gelisim-satir"><span><b>' + oyunYazisi(x.yazi) + '</b><small>Hafta ' + x.hafta + '</small></span><strong>' + etkiYazi(x.etki) + '</strong></div>'; });
  uygulama.innerHTML = h;
}
