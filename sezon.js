const LIG_TAKIM_SAYISI = 8;
const SEZON_ODULLERI = [100000, 70000, 45000, 25000, 12000, 8000, 4000, 4000];

// 0 = senin takımın, 1-7 = sezon.takimlar listesindeki rakipler
function ligTakim(i) {
  if (i === 0) return { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular, strateji: kariyer.strateji };
  return dunya[kariyer.sezon.takimlar[i]];
}

function fiksturUret(n) {
  const t = [];
  for (let i = 0; i < n; i++) t.push(i);
  const tur = [];
  for (let r = 0; r < n - 1; r++) {
    const m = [];
    for (let i = 0; i < n / 2; i++) {
      const a = t[i], b = t[n - 1 - i];
      m.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    tur.push(m);
    t.splice(1, 0, t.pop());
  }
  const ikinci = tur.map(function (m) {
    return m.map(function (x) { return [x[1], x[0]]; });
  });
  return tur.concat(ikinci);
}

function yeniSezon(no) {
  const tablo = [];
  for (let i = 0; i < LIG_TAKIM_SAYISI; i++) tablo.push({ o: 0, g: 0, m: 0, puan: 0, rd: 0 });
  return { no: no, gun: 0, hf: 0, oynandi: false, bitti: false, fikstur: fiksturUret(LIG_TAKIM_SAYISI), tablo: tablo, takimlar: ligTakimlari() };
}

function sezonHazirla() {
  ligHazirla();
  if (!kariyer.sezon) { kariyer.sezon = yeniSezon(1); kaydet(); }
  if (kariyer.sezon.hf === undefined) { kariyer.sezon.hf = kariyer.sezon.gun * 2; kaydet(); }
}

function siralama() {
  const t = kariyer.sezon.tablo;
  return t.map(function (x, i) { return i; }).sort(function (a, b) {
    return (t[b].puan - t[a].puan) || (t[b].rd - t[a].rd) || (a - b);
  });
}

function sonucIsle(a, b, s) {
  const t = kariyer.sezon.tablo;
  const x = t[a], y = t[b];
  x.o++; y.o++;
  x.rd += s.sa - s.sb;
  y.rd += s.sb - s.sa;
  if (s.sa > s.sb) { x.g++; x.puan += 3; y.m++; }
  else { y.g++; y.puan += 3; x.m++; }
}

function sezonKutusu() {
  sezonHazirla();
  const sz = kariyer.sezon;
  const toplamHafta = sz.fikstur.length * 2;
  const ilerleme = Math.max(0, Math.min(100, Math.round(sz.hf / toplamHafta * 100)));
  let h = '<section class="sezon-kart"><div class="sezon-kart-baslik"><div><small>SEZON ' + sz.no + '</small><b>' + LIG_ADLARI[kariyer.ligNo - 1] + '</b></div>';
  if (sz.bitti) {
    const sira = siralama().indexOf(0) + 1;
    h += '<span class="sezon-rozet tamamlandi">TAMAMLANDI</span></div><div class="sezon-kapanis"><small>SEZON SIRALAMAN</small><strong>' + sira + '.</strong><span>Lig sezonu tamamlandı</span></div><div class="sezon-ilerleme"><i style="width:100%"></i></div></section>';
    const playoffGerekli = ((sira === 2 && kariyer.ligNo > 1) || (sira === 7 && kariyer.ligNo < LIG_SAYISI)) &&
      (!kariyer.ligPlayoff || kariyer.ligPlayoff.sezon !== sz.no || (playoffEslesmesi() && playoffEslesmesi().kazanan === null));
    h += '<button class="buton" onclick="sezonuKapat()">' + (playoffGerekli ? 'Play-off Maçına Geç' : 'Ödülü Al, Yeni Sezonu Başlat') + '</button>';
  } else {
    const ligHaftasi = sz.hf % 2 === 0;
    const faz = ligHaftasi ? "LİG HAFTASI" : "TURNUVA HAFTASI";
    h += '<span class="sezon-rozet' + (ligHaftasi ? ' lig' : ' turnuva') + '">' + faz + '</span></div>';
    h += '<div class="sezon-ozet"><div class="sezon-hafta"><small>TAKVİM</small><strong>' + String(sz.hf + 1).padStart(2, "0") + '<span> / ' + toplamHafta + '</span></strong></div>';
    h += '<div class="sezon-program"><small>BU HAFTAKİ PROGRAM</small><b>' + (ligHaftasi ? "Lig maçı" : "Turnuva") + '</b><span>' + (ligHaftasi ? "Maç " + (sz.gun + 1) + " / " + sz.fikstur.length : "Lig haftaları arasında") + '</span></div></div>';
    h += '<div class="sezon-ilerleme"><i style="width:' + ilerleme + '%"></i></div>';
    if (ligHaftasi) {
    const m = sz.fikstur[sz.gun].find(function (x) { return x[0] === 0 || x[1] === 0; });
    const rakip = ligTakim(m[0] === 0 ? m[1] : m[0]);
      h += '<div class="sezon-rakip"><div><small>SIRADAKİ RAKİP</small><b>' + oyunAdi(rakip.ad) + '</b></div><span>GÜÇ <strong>' + Math.round(ortGuc(rakip.oyuncular)) + '</strong></span></div>';
      if (sz.oynandi) h += '<div class="sezon-mesaj tamamlandi">Lig maçı oynandı · puan tablosu güncel</div>';
      h += '<button class="buton sezon-ana-aksiyon" onclick="' + (sz.oynandi ? 'haftaGec()' : 'hazirlikEkrani()') + '">' + (sz.oynandi ? 'Haftayı Bitir' : 'Maç Hazırlığına Geç') + '</button>';
    } else {
      h += turnuvaHaftaKutusu();
    }
    h += '</section>';
  }
  h += '<button class="buton ikincil" onclick="tabloEkrani()">Puan Tablosu</button>';
  return h;
}

// Canlı maç bitince çağrılır: diğer lig maçlarını oynatır, sonuçları işler
function sezonMaciBitir(s) {
  sezonHazirla();
  const sz = kariyer.sezon;
  if (sz.bitti || sz.oynandi) return;
  const digerleri = [];
  let rakipIdx = null;
  sz.fikstur[sz.gun].forEach(function (m) {
    const a = m[0], b = m[1];
    if (a === 0 || b === 0) { rakipIdx = a === 0 ? b : a; return; }
    const A = ligTakim(a), B = ligTakim(b);
    const r = macOyna(A, B);
    sonucIsle(a, b, r);
    digerleri.push(oyunAdi(A.ad) + " " + r.sa + " - " + r.sb + " " + oyunAdi(B.ad));
  });
  sonucIsle(0, rakipIdx, s);
  const rakip = ligTakim(rakipIdx);
  const kazandi = s.sa > s.sb;
  const odul = macOdulu(kazandi);
  kariyer.butce += odul;
  maliIsle("gelir", "mac", odul);
  if (kazandi) { kariyer.galibiyet = (kariyer.galibiyet || 0) + 1; }
  else { kariyer.maglubiyet = (kariyer.maglubiyet || 0) + 1; }
  sz.oynandi = true;
  moralMacSonucu(kazandi);
  macIstatistikIsle(s.istA);
  kulupMacKaydet(rakip,s,false);
  rekabetSonucKaydet(rakip,s,false,"lig:"+sz.no+":"+sz.gun);
  kariyer.sonMacDegerlendirme=s.analiz || null;
  basinHazirla(kazandi);
  kaydet();
  sezonMacRaporu(rakip, s, odul, digerleri);
}

function sezonMacRaporu(B, s, odul, digerleri) {
  const kazandi = s.sa > s.sb;
  let html = "<h2>Maç Raporu</h2>";
  html += "<div class=\"bilgi-kutusu\"><b data-ceviri-isim-on-eki=\"" + oyunYazisi(kariyer.takimAdi) + "\">" + oyunYazisi(kariyer.takimAdi) + " " + s.sa + " - " + s.sb + " " + oyunAdi(B.ad) + "</b><br>";
  html += kazandi ? "Kazandın!" : "Kaybettin.";
  html += s.uzatma ? " (Uzatma oynandı)" : "";
  html += "<br>Harita: <b>" + s.harita + "</b>";
  html += "<br>Kazanç: <b>+" + para(odul) + "</b></div>";
  html += macDegerlendirmeHtml(s.analiz);
  html += olayListesi(s.not);
  html += "<h2>Haftanın Diğer Maçları</h2>";
  digerleri.forEach(function (d) { html += "<p>" + d + "</p>"; });
  html += macOyuncuIstatistikleri(kariyer.takimAdi, s.istA, B.ad, s.istB);
  if (basinBekliyor()) html += '<button class="buton" onclick="basinEkrani()">Basın Toplantısı</button>';
  html += '<button class="buton" onclick="tabloEkrani()">Puan Tablosu</button>';
  html += '<button class="buton ikincil" onclick="kariyerEkrani()">Kariyere Dön</button>';
  uygulama.innerHTML = html;
  reklamMacTamamlandi();
}

function tabloEkrani() {
  sezonHazirla();
  const sz = kariyer.sezon;
  const t = sz.tablo;
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>' + LIG_ADLARI[kariyer.ligNo - 1] + " · Sezon " + sz.no + "</h2>";
  html += "<p>Şampiyon yükselir, sonuncu düşer. İkinci ile üst ligin yedincisi BO3 oynar; alt lig takımı kazanırsa takımlar yer değiştirir.</p><p>1. Lig'den yükselme, 5. Lig'den düşme yoktur.</p>";
  html += '<div class="tablo-kutusu"><table><tr><th>Takım</th><th data-ceviri-anahtari="Tablo: O">O</th><th data-ceviri-anahtari="Tablo: G">G</th><th data-ceviri-anahtari="Tablo: M">M</th><th data-ceviri-anahtari="Tablo: RF">RF</th><th data-ceviri-anahtari="Tablo: P">P</th></tr>';
  siralama().forEach(function (i, sira) {
    const stil = i === 0 ? ' style="color:' + kariyer.renk + ';font-weight:bold"' : "";
    const idx = i === 0 ? -1 : sz.takimlar[i];
    html += "<tr" + stil + ' onclick="takimKadro(' + idx + ", 'tabloEkrani()')\"><td>" + (sira + 1) + ". " + oyunAdi(ligTakim(i).ad) + "</td><td>" + t[i].o + "</td><td>" + t[i].g + "</td><td>" + t[i].m + "</td><td>" + t[i].rd + "</td><td>" + t[i].puan + "</td></tr>";
  });
  html += "</table></div>";
  uygulama.innerHTML = html;
}

function sezonuKapat() {
  const sz = kariyer.sezon;
  if (!sz.bitti) return;
  const ligSirasi = siralama();
  if (canli || canliSeri) { macDevamEkrani(); return; }
  const playoff = ligPlayoffHazirla(ligSirasi);
  if (playoff.eslesmeler.some(function (e) { return e.kazanan === null; })) {
    playoffEkrani(); return;
  }
  const sira = ligSirasi.indexOf(0);
  const odul = Math.round(SEZON_ODULLERI[sira] * LIG_ODUL_CARPANI[kariyer.ligNo - 1]);
  const kapanisOncesi = JSON.stringify(kariyer);
  let sonuc, r, tamamlandi = false;
  // Kapanış yardımcılarının ara durumu kaydetmesini engelle.
  sezonKapanisiIsleniyor = true;
  try {
    sezonHedefSonuclandir(sira+1);
    kariyer.butce += odul;
    maliIsle("gelir", "sezon", odul);
    sponsorSezonSonu(sira + 1);
    const mvp = sezonEnIyi(sz.no);
    sonuc = ligSezonSonu(ligSirasi);
    delete kariyer.ligPlayoff;
    (kariyer.gecmis = kariyer.gecmis || []).push({ sezon: sz.no, sira: sira + 1, mvp: mvp, lig: sonuc.eski, yeniLig: sonuc.yeni });
    siralamaGuncelle(sonuc.prim, sonuc.benPrim);
    kariyer.turnuva = null;
    serbestYenile();
    sponsorTeklifYenile();
    teklifUret();
    kariyer.sezon = yeniSezon(sz.no + 1);
    kulupGelisimHazirla();
    r = rakipSezonSonu();
    sezonKapanisiIsleniyor = false;
    tamamlandi = kaydet() !== false;
  } finally {
    sezonKapanisiIsleniyor = false;
    if (!tamamlandi) {
      kariyer = JSON.parse(kapanisOncesi);
      rakipleriBagla();
    }
  }
  if (!tamamlandi) return;
  sezonSonuEkrani(sz.no, sira + 1, odul, r, sonuc);
}
