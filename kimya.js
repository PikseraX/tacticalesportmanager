// Kadro kimyası: oyuncu çiftlerinin birlikte geçirdiği haftalar saklanır.
function oyunYazisi(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function oyuncuKimligi(o) {
  if (!o.kimlik) o.kimlik = "p" + (kariyer.sonOyuncuKimligi = (kariyer.sonOyuncuKimligi || 0) + 1);
  return o.kimlik;
}
function kimyaCiftleri(oyuncular) {
  const pairs = [];
  for (let i = 0; i < oyuncular.length; i++) for (let j = i + 1; j < oyuncular.length; j++)
    pairs.push([oyuncuKimligi(oyuncular[i]), oyuncuKimligi(oyuncular[j])].sort().join(":"));
  return pairs;
}
function kimyaHazirla() {
  if (!kariyer) return;
  tumKadro().forEach(oyuncuKimligi);
  if (!kariyer.kimya) {
    kariyer.kimya = { ciftler: {}, sonHafta: 0 };
    kimyaCiftleri(kariyer.oyuncular).forEach(key => { kariyer.kimya.ciftler[key] = 40; });
  }
}
function takimKimyasi(oyuncular) {
  kimyaHazirla();
  const pairs = kimyaCiftleri(oyuncular || kariyer.oyuncular);
  return pairs.length ? Math.round(pairs.reduce((s,k) => s + (kariyer.kimya.ciftler[k] || 0), 0) / pairs.length) : 0;
}
function kimyaGucEtkisi(oyuncular) {
  if (!kariyer || !oyuncular.length || !oyuncular.every(o => tumKadro().includes(macKaynakOyuncu(o)))) return 0;
  return Math.round((takimKimyasi(oyuncular) - 40) / 20 * 10) / 10;
}
function kimyaHaftalik(rapor) {
  kimyaHazirla();
  if (kariyer.kimya.sonHafta === kariyer.hafta) return;
  const once = takimKimyasi();
  kimyaCiftleri(kariyer.oyuncular).forEach(k => {
    kariyer.kimya.ciftler[k] = Math.min(100, (kariyer.kimya.ciftler[k] || 0) + 4);
  });
  kariyer.kimya.sonHafta = kariyer.hafta;
  rapor.push("Takım kimyası: " + once + " → " + takimKimyasi());
}
function kimyaKutusu() {
  return '<section class="gelisim-kart"><small>KADRO UYUMU</small><div class="gelisim-metrik"><b>' + takimKimyasi() + '<span>/100</span></b><span>Maç gücü ' + etkiYazi(kimyaGucEtkisi(kariyer.oyuncular)) + '</span></div><div class="gelisim-bar"><i style="width:' + takimKimyasi() + '%"></i></div><p>Aynı oyuncular her hafta birlikte çalıştıkça kimya gelişir. Yeni bir transferin mevcut oyuncularla uyumu zamanla artar.</p></section>';
}
function kimyaEkrani() {
  kimyaHazirla();
  let h = '<button class="geri" onclick="kadroEkrani()">← Takım</button><h2>Takım Kimyası</h2>' + kimyaKutusu();
  h += '<div class="bilgi-kutusu">Rol uyumu: <b>' + stratejiUyumu(kariyer.oyuncular, kariyer.strateji) + '/5</b><br>Strateji: ' + kariyer.strateji + '<br>Kimya güç etkisi: -2 ile +3 arasında. İlk kadro 40 kimyayla başlar.</div>';
  kariyer.oyuncular.forEach(o => {
    const pairs = kariyer.oyuncular.filter(x => x !== o).map(x => kariyer.kimya.ciftler[[o.kimlik, x.kimlik].sort().join(":")] || 0);
    h += '<div class="gelisim-satir"><span><b>' + oyunAdi(o.ad) + '</b><small>' + o.rol + '</small></span><strong>' + Math.round(pairs.reduce((s,v)=>s+v,0)/Math.max(1,pairs.length)) + '/100</strong></div>';
  });
  h += '<button class="buton ikincil" onclick="stratejiEkrani()">Rolleri ve Stratejiyi Düzenle</button>';
  uygulama.innerHTML = h;
}
