const LIG_SAYISI = 5;
const LIG_ADLARI = ["1. Lig", "2. Lig", "3. Lig", "4. Lig", "5. Lig"];
const LIG_HEDEF_GUCU = [85, 75, 65, 55, 45];
const LIG_ILK_SEZON_GUC_ARALIKLARI = [[80, 90], [70, 80], [60, 70], [50, 60], [40, 50]];
const LIG_ODUL_CARPANI = [3, 2.5, 2, 1.5, 1];
const LIG_BONUS = [60, 45, 30, 15, 0];
const YUKSELEN = 1;

function ligOyuncuGENAyarla(oyuncu, hedef) {
  for (let deneme = 0; deneme < 3 && oyuncu.genel !== hedef; deneme++) {
    const fark = hedef - oyuncu.genel;
    OZELLIKLER.forEach(function (z) { oyuncu[z] = sinirla(oyuncu[z] + fark); });
    genelHesapla(oyuncu);
  }
}

// -1 = senin takımın, diğerleri dunya[] sırası
function ligTakimlari() {
  return [-1].concat(kariyer.ligler[kariyer.ligNo - 1].filter(function (x) { return x !== -1; }));
}

function ligIlkSezonDengele(ligler) {
  ligler.forEach(function (liste, kademe) {
    const siraliRakipler = liste.filter(function (id) { return id >= 0; });
    siraliRakipler.forEach(function (id, sira) {
      const t = dunya[id];
      const aralik = LIG_ILK_SEZON_GUC_ARALIKLARI[kademe];
      const oran = siraliRakipler.length > 1 ? sira / (siraliRakipler.length - 1) : 0.5;
      // Her takımın ortalaması farklı olsun; her oyuncunun GEN'i de kendi
      // lig kademesinin aralığında kalsın.
      const hedefGuc = Math.round((aralik[0] + 1) + oran * (aralik[1] - aralik[0] - 2));
      const kenarPayi = Math.min(hedefGuc - aralik[0], aralik[1] - hedefGuc);
      const icPay = Math.floor(kenarPayi / 2);
      const oyuncuFarklari = [-kenarPayi, -icPay, 0, icPay, kenarPayi];
      t.oyuncular.forEach(function (o, oyuncuSira) {
        const oyuncuHedefi = hedefGuc + oyuncuFarklari[(oyuncuSira + id) % oyuncuFarklari.length];
        ligOyuncuGENAyarla(o, oyuncuHedefi);
      });
      t.guc = ortGuc(t.oyuncular);
    });
  });
}

function ligHazirla() {
  if (kariyer.ligler) {
    if (kariyer.ligler.length < LIG_SAYISI) {
      const kullanilan = new Set(kariyer.ligler.flat());
      const kalan = dunya.map(function (t, i) { return i; }).filter(function (i) { return !kullanilan.has(i); });
      kalan.sort(function (a, b) { return ortGuc(dunya[b].oyuncular) - ortGuc(dunya[a].oyuncular); });
      while (kariyer.ligler.length < LIG_SAYISI) {
        const eksikKademe = LIG_SAYISI - kariyer.ligler.length;
        kariyer.ligler.push(kalan.splice(-eksikKademe * 8, 8));
      }
      kaydet();
    }
    // İlk sezonu daha önce başlatmış kayıtları da yeni lig aralıklarına geçir.
    if (kariyer.sezon && kariyer.sezon.no === 1 && !kariyer.ligIlkSezonDengesi) {
      ligIlkSezonDengele(kariyer.ligler);
      kariyer.ligIlkSezonDengesi = true;
      kaydet();
    }
    return;
  }
  const sirali = dunya.map(function (t, i) { return i; }).sort(function (a, b) {
    return ortGuc(dunya[b].oyuncular) - ortGuc(dunya[a].oyuncular);
  });
  const eskiNo = kariyer.sezon ? kariyer.sezon.no : 1;
  kariyer.ligler = [sirali.slice(0, 8), sirali.slice(8, 16), sirali.slice(16, 24), sirali.slice(24, 32), sirali.slice(32, 39)];
  ligIlkSezonDengele(kariyer.ligler);
  kariyer.ligIlkSezonDengesi = true;
  kariyer.ligler[4].push(-1);
  kariyer.ligNo = 5;
  kariyer.sezon = yeniSezon(eskiNo);
  kaydet();
}

// Senin oynamadığın bir ligi sezon sonunda simüle eder, takımları iyiden kötüye sıralar
function ligSimule(idler) {
  const tablo = idler.map(function () { return { puan: 0, rd: 0 }; });
  fiksturUret(idler.length).forEach(function (hafta) {
    hafta.forEach(function (m) {
      const s = macOyna(dunya[idler[m[0]]], dunya[idler[m[1]]]);
      tablo[m[0]].rd += s.sa - s.sb;
      tablo[m[1]].rd += s.sb - s.sa;
      if (s.sa > s.sb) tablo[m[0]].puan += 3; else tablo[m[1]].puan += 3;
    });
  });
  return idler.map(function (id, i) { return i; }).sort(function (a, b) {
    return (tablo[b].puan - tablo[a].puan) || (tablo[b].rd - tablo[a].rd) || (a - b);
  }).map(function (i) { return idler[i]; });
}

// Sıralamalar ve yapay zekâ maçları bir kez oluşturulur; kayıt açılınca değişmez.
function ligPlayoffHazirla(ligSirasi) {
  if (kariyer.ligPlayoff && kariyer.ligPlayoff.sezon === kariyer.sezon.no) return kariyer.ligPlayoff;
  const sirali = kariyer.ligler.map(function (liste, t) {
    return t + 1 === kariyer.ligNo ? ligSirasi.map(function (p) { return kariyer.sezon.takimlar[p]; }) : ligSimule(liste);
  });
  const eslesmeler = [];
  for (let t = 0; t < LIG_SAYISI - 1; t++) {
    const ust = sirali[t][6], alt = sirali[t + 1][1];
    const e = { ust: ust, alt: alt, ustLig: t + 1, kazanan: null, skor: null };
    if (ust !== -1 && alt !== -1) {
      const s = seriOyna(dunya[alt], dunya[ust], karistir(HARITALAR).slice(0, 3));
      e.kazanan = s.a > s.b ? alt : ust;
      e.skor = [s.a, s.b];
    }
    eslesmeler.push(e);
  }
  kariyer.ligPlayoff = { sezon: kariyer.sezon.no, sirali: sirali, eslesmeler: eslesmeler };
  kaydet();
  return kariyer.ligPlayoff;
}

function playoffEslesmesi() {
  const p = kariyer.ligPlayoff;
  return p && p.sezon === kariyer.sezon.no ? p.eslesmeler.find(function (e) { return e.ust === -1 || e.alt === -1; }) : null;
}

function playoffEkrani() {
  const e = playoffEslesmesi();
  if (!e) { kariyerEkrani(); return; }
  const rakip = dunya[e.ust === -1 ? e.alt : e.ust];
  let h = '<h2>Lig Play-off’u</h2><div class="bilgi-kutusu">';
  h += '<p>Şampiyon yükselir, sonuncu düşer. İkinci ile üst ligin yedincisi BO3 oynar; alt lig takımı kazanırsa takımlar yer değiştirir.</p>';
  h += '<p>' + oyunAdi(kariyer.takimAdi) + ' – ' + oyunAdi(rakip.ad) + '</p>';
  if (e.kazanan === null) {
    h += e.alt === -1 ? '<p>Seriyi kazanırsan üst lige yükselirsin.</p>' : '<p>Seriyi kazanırsan ligde kalırsın.</p>';
    h += '</div><button class="buton" onclick="playoffBanBaslat()">Maç Hazırlığına Geç</button>';
  } else {
    h += '<p>' + (e.ust === -1 ? e.skor[1] : e.skor[0]) + ' – ' + (e.ust === -1 ? e.skor[0] : e.skor[1]) + '</p>';
    h += e.kazanan === -1 ? '<p>Seriyi kazandın.</p>' : '<p>Seriyi kaybettin.</p>';
    h += '</div><button class="buton" onclick="sezonuKapat()">Ödülü Al, Yeni Sezonu Başlat</button>';
  }
  uygulama.innerHTML = h + '<button class="buton ikincil" onclick="kariyerEkrani()">Kariyere Dön</button>';
}

function playoffBanBaslat() {
  const e = playoffEslesmesi();
  if (!e || e.kazanan !== null || canli || canliSeri) return;
  banDurum = { mod: "playoff", rakip: dunya[e.ust === -1 ? e.alt : e.ust], hedef: 3, geri: "hazirlikIptalEt()", banlar: [] };
  banEkrani();
}

function playoffSeriBasla(kalan, banYazi) {
  const e = playoffEslesmesi();
  if (!e || e.kazanan !== null || canli || canliSeri) return;
  const rakip = dunya[e.ust === -1 ? e.alt : e.ust];
  canliSeri = {
    playoff: true,
    A: { ad: kariyer.takimAdi, oyuncular: macKadroKopyala(kariyer.oyuncular), strateji: kariyer.strateji },
    rakip: rakip, liste: karistir(kalan), idx: 0, mine: 0, theirs: 0,
    hr: [], notlar: [], degisimHak: DEGISIM_HAKKI, kalan: kalan, banYazi: banYazi
  };
  canli = canliKur(canliSeri.liste[0], rakip, canliSeri);
  canliHazirlikEkrani();
}

function playoffSonucIsle(sonuc) {
  const e = playoffEslesmesi();
  if (!e || e.kazanan !== null) return;
  const kazandi = sonuc.mine > sonuc.theirs;
  const rakip = dunya[e.ust === -1 ? e.alt : e.ust];
  e.kazanan = kazandi ? -1 : (e.ust === -1 ? e.alt : e.ust);
  e.skor = e.alt === -1 ? [sonuc.mine, sonuc.theirs] : [sonuc.theirs, sonuc.mine];
  if (kazandi) kariyer.galibiyet = (kariyer.galibiyet || 0) + 1;
  else kariyer.maglubiyet = (kariyer.maglubiyet || 0) + 1;
  if (typeof moralMacSonucu === "function") moralMacSonucu(kazandi);
  macIstatistikIsle(sonuc.istA);
  if (rakip && typeof kulupMacKaydet === "function") kulupMacKaydet(rakip, { sa: sonuc.mine, sb: sonuc.theirs }, true);
  if (rakip && typeof rekabetSonucKaydet === "function") rekabetSonucKaydet(rakip, { sa: sonuc.mine, sb: sonuc.theirs }, true, "playoff:" + (kariyer.sezon?.no || 1) + ":" + e.ustLig);
  kaydet();
  playoffEkrani();
  reklamMacTamamlandi();
}

// Sezon sonu: sıralamalar, yükselme/düşme, yeni ligler
function ligSezonSonu(ligSirasi) {
  const sz = kariyer.sezon;
  const eski = kariyer.ligNo;
  const playoff = ligPlayoffHazirla(ligSirasi);
  if (playoff.eslesmeler.some(function (e) { return e.kazanan === null; })) throw new Error("Play-off tamamlanmadı");
  const sirali = playoff.sirali;
  const prim = {};
  let benPrim = 0;
  sirali.forEach(function (liste, t) {
    liste.forEach(function (id, p) {
      const v = (LIG_PRIMI[p] || 0) + LIG_BONUS[t];
      if (id === -1) benPrim = v; else prim[id] = v;
    });
  });
  const yeni = [];
  for (let t = 0; t < LIG_SAYISI; t++) {
    let l = sirali[t].slice(t > 0 ? YUKSELEN : 0, t < LIG_SAYISI - 1 ? 8 - YUKSELEN : 8);
    if (t < LIG_SAYISI - 1) l = l.concat(sirali[t + 1].slice(0, YUKSELEN));
    if (t > 0) l = l.concat(sirali[t - 1].slice(8 - YUKSELEN));
    yeni.push(l);
  }
  playoff.eslesmeler.forEach(function (e) {
    if (e.kazanan !== e.alt) return;
    const ust = yeni[e.ustLig - 1], alt = yeni[e.ustLig];
    const ui = ust.indexOf(e.ust), ai = alt.indexOf(e.alt);
    if (ui < 0 || ai < 0) throw new Error("Play-off lig yerleşimi geçersiz");
    ust[ui] = e.alt; alt[ai] = e.ust;
  });
  yeni.forEach(function (l, t) { if (l.indexOf(-1) >= 0) kariyer.ligNo = t + 1; });
  kariyer.ligler = yeni;
  let mesaj = "Ligde kaldın: " + LIG_ADLARI[kariyer.ligNo - 1];
  if (kariyer.ligNo < eski) mesaj = "Yükseldin! Yeni ligin: " + LIG_ADLARI[kariyer.ligNo - 1];
  if (kariyer.ligNo > eski) mesaj = "Düştün. Yeni ligin: " + LIG_ADLARI[kariyer.ligNo - 1];
  return { mesaj: mesaj, eski: eski, yeni: kariyer.ligNo, prim: prim, benPrim: benPrim };
}

function ligEkrani() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Ligler</h2>';
  html += "<p>Şampiyon yükselir, sonuncu düşer. İkinci ile üst ligin yedincisi BO3 oynar; alt lig takımı kazanırsa takımlar yer değiştirir.</p>";
  html += "<p>1. Lig'den yükselme, 5. Lig'den düşme yoktur.</p>";
  kariyer.ligler.forEach(function (l, t) {
    html += "<h2>" + LIG_ADLARI[t] + (kariyer.ligNo === t + 1 ? " (senin ligin)" : "") + "</h2>";
    l.forEach(function (id) {
      const takim = id === -1 ? { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular } : dunya[id];
      const renk = id === -1 ? ' style="border-color:' + kariyer.renk + '"' : "";
      html += '<button class="takim-butonu"' + renk + ' onclick="takimKadro(' + id + ", 'ligEkrani()')\"><span>" + oyunAdi(takim.ad) + "</span><span>Güç: " + Math.round(ortGuc(takim.oyuncular)) + "</span></button>";
    });
  });
  uygulama.innerHTML = html;
}
