const MAC_IZLE_HIZLARI = [1, 2, 4];
const MAC_NAV_BOYUT = 120;

function macXml(deger) {
  return String(deger).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c];
  });
}

function macIzleTarafRengi(taraf) { return taraf === "CT" ? "#58a6ff" : "#ff6478"; }

function macIzleTakimTarafi(c, takim) {
  return takim === "A" ? c.tarafA : (c.tarafA === "CT" ? "T" : "CT");
}

function macIzleHaritaBilgisi(c) {
  return HARITA_MAC_GORSEL[c.harita] || HARITA_MAC_GORSEL[HARITALAR[0]];
}

// Hareket ve görüş maskeleri çizilen oda, koridor ve sandıklardan üretilir.
function macIzleNavigasyonIzgarasiOlustur(harita) {
  const boyut = MAC_NAV_BOYUT;
  const ham = new Uint8Array(boyut * boyut);
  const guvenli = new Uint8Array(ham.length);
  const pay = [[0,0],[16,0],[-16,0],[0,16],[0,-16],[12,12],[-12,12],[12,-12],[-12,-12]];
  for (let y = 0; y < boyut; y++) for (let x = 0; x < boyut; x++) {
    const px = x * 1000 / (boyut - 1), py = y * 1000 / (boyut - 1);
    ham[y * boyut + x] = haritaNoktaAcik(harita, px, py) ? 1 : 0;
    guvenli[y * boyut + x] = pay.every(function (p) { return haritaNoktaAcik(harita, px + p[0], py + p[1]); }) ? 1 : 0;
  }
  harita.navGrid = { ham: ham, guvenli: guvenli, boyut: boyut };
  harita.navSurum = (harita.navSurum || 0) + 1;
}

function macIzleNavigasyonHazirla(c, tamam) {
  const harita = macIzleHaritaBilgisi(c);
  if (!harita.navGrid) macIzleNavigasyonIzgarasiOlustur(harita);
  tamam();
}

function macIzleEnYakinYuruneBilirIzgaraNoktasi(izgara, nokta, kullanGuvenli) {
  const boyut = izgara.boyut;
  const maske = kullanGuvenli ? izgara.guvenli : izgara.ham;
  const sx = Math.max(0, Math.min(boyut - 1, Math.round(nokta[0] * (boyut - 1) / 1000)));
  const sy = Math.max(0, Math.min(boyut - 1, Math.round(nokta[1] * (boyut - 1) / 1000)));
  if (maske[sy * boyut + sx]) return sy * boyut + sx;
  for (let r = 1; r < boyut; r++) {
    let enIyi = -1, enUzaklik = Infinity;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = sx + dx, y = sy + dy;
      if (x < 0 || y < 0 || x >= boyut || y >= boyut || !maske[y * boyut + x]) continue;
      const d = dx * dx + dy * dy;
      if (d < enUzaklik) { enUzaklik = d; enIyi = y * boyut + x; }
    }
    if (enIyi >= 0) return enIyi;
  }
  return -1;
}

function macIzleHaritaRotasiBul(c, baslangic, hedef) {
  const izgara = macIzleHaritaBilgisi(c).navGrid;
  if (!izgara) return null;
  const boyut = izgara.boyut;
  function ara(maske) {
    const g = { boyut: boyut, ham: izgara.ham, guvenli: maske };
    const bas = macIzleEnYakinYuruneBilirIzgaraNoktasi(g, baslangic, true);
    const son = macIzleEnYakinYuruneBilirIzgaraNoktasi(g, hedef, true);
    if (bas < 0 || son < 0) return null;
    const ebeveyn = new Int32Array(boyut * boyut);
    ebeveyn.fill(-2);
    const kuyruk = new Int32Array(boyut * boyut);
    let ilk = 0, sonIndeks = 0;
    kuyruk[sonIndeks++] = bas;
    ebeveyn[bas] = -1;
    const adimlar = [-boyut, boyut, -1, 1];
    while (ilk < sonIndeks && ebeveyn[son] === -2) {
      const n = kuyruk[ilk++], x = n % boyut;
      for (let i = 0; i < adimlar.length; i++) {
        const sonraki = n + adimlar[i];
        if ((i === 2 && x === 0) || (i === 3 && x === boyut - 1)) continue;
        if (sonraki < 0 || sonraki >= boyut * boyut || ebeveyn[sonraki] !== -2 || !maske[sonraki]) continue;
        ebeveyn[sonraki] = n;
        kuyruk[sonIndeks++] = sonraki;
      }
    }
    if (ebeveyn[son] === -2) return null;
    const hucreler = [];
    for (let n = son; n !== -1; n = ebeveyn[n]) hucreler.push(n);
    hucreler.reverse();
    const noktalar = [];
    let oncekiYon = null;
    for (let i = 0; i < hucreler.length; i++) {
      const n = hucreler[i], x = n % boyut, y = Math.floor(n / boyut);
      const yon = i < hucreler.length - 1 ? [hucreler[i + 1] % boyut - x, Math.floor(hucreler[i + 1] / boyut) - y] : null;
      if (i === 0 || !yon || !oncekiYon || yon[0] !== oncekiYon[0] || yon[1] !== oncekiYon[1]) {
        noktalar.push([x * 1000 / (boyut - 1), y * 1000 / (boyut - 1)]);
      }
      oncekiYon = yon;
    }
    return noktalar;
  }
  return ara(izgara.guvenli);
}

function macIzleKonumlariYuruneBilirAlana(c) {
  const izgara = macIzleHaritaBilgisi(c).navGrid;
  if (!izgara) return;
  [c.aktifA, c.aktifB].forEach(function (oyuncular) {
    oyuncular.forEach(function (x) {
      if (x.izKonumHazir) return;
      const n = macIzleEnYakinYuruneBilirIzgaraNoktasi(izgara, [x.izX, x.izY], true);
      if (n >= 0) {
        x.izX = n % izgara.boyut * 1000 / (izgara.boyut - 1);
        x.izY = Math.floor(n / izgara.boyut) * 1000 / (izgara.boyut - 1);
        x.izKonumHazir = true;
      }
    });
  });
}

function macIzleKonumBaslat(c, oyuncular, taraf) {
  const harita = macIzleHaritaBilgisi(c);
  const gorevler = [0,1,2,3,4];
  for (let n=4;n>0;n--) { const j=Math.floor(Math.random()*(n+1)); [gorevler[n],gorevler[j]]=[gorevler[j],gorevler[n]]; }
  const midSayisi = 1 + Math.floor(Math.random()*3);
  const mevziTohumu = Math.floor(Math.random()*9);
  oyuncular.forEach(function (x, i) {
    const merkez = taraf === "T" ? harita.t : harita.ct;
    const dagilim = [[-35, -15], [-18, 10], [0, -8], [18, 12], [35, -12]];
    x.izX = merkez[0] + dagilim[i % dagilim.length][0];
    x.izY = merkez[1] + dagilim[i % dagilim.length][1];
    x.izRota = i % 5;
    x.izWp = 0;
    x.izDefSite = null;
    x.izDefWp = 0;
    x.izNavRota = null;
    x.izNavAnahtar = null;
    x.izNavSurum = -1;
    x.izNavWp = 0;
    x.izMidBekleme = 0;
    x.izHayatta = true;
    x.izGorev = gorevler[i];
    x.izGirisMid = gorevler[i] < midSayisi;
    x.izMevziSira = (mevziTohumu + gorevler[i]) % 9;
    x.izHedef = null;
    x.izHedefAlan = null;
    x.izYerDegistir = 0;
    x.izGirisTamam = false;
    x.izKonumHazir = false;
    x.izAci = taraf === 'T' ? -Math.PI/2 : Math.PI/2;
    x.izSavunmaAlani = taraf==='CT' ? (gorevler[i]===4?'mid':(gorevler[i]<2?'A':'B')) : null;
    x.izSonTemas = null;
  });
}

// Konum/görüşten bağımsız seçim: beceri ağırlığı sınırlı, eşit oyuncular eşit şanslı.
function raundRastgeleOyuncu(liste){return liste[Math.floor(Math.random()*liste.length)];}
function raundKatilSec(liste){
  const agirlik=x=>.75+(Math.max(1,Math.min(99,x.o.nisan))+Math.max(1,Math.min(99,x.o.refleks)))/396;
  let r=Math.random()*liste.reduce((sum,x)=>sum+agirlik(x),0);
  for(const x of liste){r-=agirlik(x);if(r<=0)return x;}
  return liste[liste.length-1];
}
function macIzleRaundHazirla(c) {
  c.aktifA.concat(c.aktifB).forEach(x=>{x.izHayatta=true;});
  const aK = Math.random() < canliP(c);
  const kazananlar = aK ? c.aktifA.slice() : c.aktifB.slice();
  const kaybedenler = aK ? c.aktifB.slice() : c.aktifA.slice();
  const kayipAdedi = Math.floor(Math.random() * 5);
  const olaylar = [];
  const tTaktik = macIzleTakimTarafi(c, "A") === "T" ? c.tA : c.tB;
  const site = tTaktik === "Agresif" ? (Math.random() < 0.72 ? "A" : "B") : (Math.random() < 0.5 ? "A" : "B");
  const hayattaKazananlar = kazananlar.slice();
  const hayattaKaybedenler = kaybedenler.slice();

  // Raundun sonunda kaybeden tarafın elindeki son çatışmaları oynat,
  // ardından kazanan tarafın kalan oyuncuları temizlemesini göster.
  for (let i = 0; i < kayipAdedi && hayattaKazananlar.length > 1; i++) {
    const katil = raundKatilSec(hayattaKaybedenler);
    const kurban = raundRastgeleOyuncu(hayattaKazananlar);
    hayattaKazananlar.splice(hayattaKazananlar.indexOf(kurban), 1);
    olaylar.push({ katil: katil, kurban: kurban, takim: aK ? "B" : "A" });
  }
  while (hayattaKaybedenler.length > 0) {
    const katil = raundKatilSec(hayattaKazananlar.length ? hayattaKazananlar : kazananlar);
    const kurban = raundRastgeleOyuncu(hayattaKaybedenler);
    hayattaKaybedenler.splice(hayattaKaybedenler.indexOf(kurban), 1);
    olaylar.push({ katil: katil, kurban: kurban, takim: aK ? "A" : "B" });
  }
  c.raundPlan = { aK: aK, olaylar: olaylar, index: 0, site: site, adim: 0, ctBilgi: { mid: false, midKayip:false, site: null, dusmusAlanlar:{A:false,B:false}, tehditler:[] } };
  c.bombaKuruldu = false;
  c.bombaYeri = null;
  c.aktifPlan = site + " bölgesine " + (tTaktik === "Temkinli" ? "kontrollü ilerleme" : "takım hücumu") + " · Mid kontrolü";
  c.killFeed = [];
  c.raundNo = c.sa + c.sb + 1;
}

function macIzleSvg(c) {
  const harita = macIzleHaritaBilgisi(c);
  let h = '<svg id="mac-izle-harita" viewBox="0 0 ' + harita.w + ' ' + harita.h + '" role="img" aria-label="' + macXml(c.harita) + ' haritası üzerinde canlı raund">';
  h += '<g transform="scale(' + (harita.w / 1000) + ' ' + (harita.h / 1000) + ')">';
  h += haritaCizimSvg(harita);
  h += '<g id="mac-gorus-katmani" mask="url(#saha-' + HARITALAR.indexOf(harita.ad) + '-sol)" aria-label="Oyuncu görüş alanları">' + macIzleGorusSvg(c) + '</g>';
  if (c.bombaKuruldu && c.bombaYeri) {
    const site = harita[c.bombaYeri];
    h += '<circle cx="' + site[0] + '" cy="' + site[1] + '" r="44" fill="#ffc24744" stroke="#ffd36b" stroke-width="10"><animate attributeName="r" values="34;48;34" dur="1.2s" repeatCount="indefinite"/></circle>';
    h += '<text x="' + site[0] + '" y="' + (site[1] + 8) + '" text-anchor="middle" fill="#fff" stroke="#111" stroke-width="6" paint-order="stroke" font-size="30" font-weight="950">BOMB</text>';
  }
  c.aktifA.forEach(function (x, i) { h += macIzleOyuncuSvg(x, "A", i, macIzleTakimTarafi(c, "A")); });
  c.aktifB.forEach(function (x, i) { h += macIzleOyuncuSvg(x, "B", i, macIzleTakimTarafi(c, "B")); });
  return h + "</g></svg>";
}

function macIzleOyuncuSvg(x, takim, i, taraf) {
  const renk = macIzleTarafRengi(taraf);
  const isim = x.o.ad.length > 11 ? x.o.ad.slice(0, 10) + "…" : x.o.ad;
  const soluk = x.izHayatta === false ? ' opacity=".35"' : "";
  const isaret = x.izHayatta === false ? '<path d="M-10-10L10 10M10-10L-10 10" stroke="#fff" stroke-width="5"/>' : "";
  const etiketY = x.izGorev % 2 === 0 ? -29 : 40;
  return '<g id="mac-oyuncu-' + takim + '-' + i + '" transform="translate(' + (x.izX || 0) + ' ' + (x.izY || 0) + ')' + soluk + '"><text y="' + etiketY + '" text-anchor="middle" fill="#f4f7fa" stroke="#0a111b" stroke-width="7" paint-order="stroke" font-size="20" font-weight="900">' + macXml(isim) + '</text><path id="mac-bakis-' + takim + '-' + i + '" d="M18 -6L29 0L18 6Z" fill="' + renk + '" transform="rotate(' + ((x.izAci||0)*180/Math.PI) + ')"/><circle r="18" fill="' + renk + '" stroke="#fff" stroke-width="5"/><text y="5" text-anchor="middle" fill="#101720" font-size="13" font-weight="950">' + taraf + '</text>' + isaret + "</g>";
}

function macIzleEkrani() {
  const c = canli;
  if (!c) return;
  const tarafA = macIzleTakimTarafi(c, "A");
  const tarafB = macIzleTakimTarafi(c, "B");
  const renkA = macIzleTarafRengi(tarafA);
  const renkB = macIzleTarafRengi(tarafB);
  let h = '<section class="mac-izle-ekrani">';
  if (c.seri) h += seriKutusu(c.seri);
  h += '<div class="mac-izle-skor"><div><small style="color:' + renkA + '">' + tarafA + '</small><b>' + macXml(c.A.ad) + '</b><span id="mac-hayatta-A" class="mac-hayatta">' + macIzleHayattaMetni(c,'A') + '</span></div><strong id="mac-izle-skor-deger">' + c.sa + ' : ' + c.sb + '</strong><div><small style="color:' + renkB + '">' + tarafB + '</small><b>' + macXml(c.B.ad) + '</b><span id="mac-hayatta-B" class="mac-hayatta">' + macIzleHayattaMetni(c,'B') + '</span></div></div>';
  h += '<div class="mac-izle-raund"><b id="mac-izle-raund-no">RAUND ' + (c.raundNo || c.sa + c.sb + 1) + '</b><span>' + macXml(c.harita) + '</span><i id="mac-izle-saat">CANLI</i></div>';
  h += '<div class="mac-harita-cerceve"><div class="mac-harita-baslik"><span><b>' + macXml(c.harita) + '</b><small>KONİLER: GÖRÜŞ ALANI · DUVARLAR GÖRÜŞÜ KESER</small></span><div class="mac-taraf-anahtari"><i style="background:' + renkA + '">' + tarafA + '</i><i style="background:' + renkB + '">' + tarafB + '</i></div></div>';
  h += '<div class="mac-harita-alani">' + macIzleSvg(c) + '</div><aside id="mac-izle-killfeed" class="mac-killfeed" aria-label="Çatışma listesi" aria-live="polite"></aside><div id="mac-izle-plan" class="mac-izle-alt-bilgi">Plan: <b>' + macXml(c.aktifPlan || "Taktik planı hazırlanıyor") + '</b> · Mid kontrolü için oyuncu ayrıldı.</div><div id="mac-izle-bilgi" class="mac-izle-alt-bilgi">CT bilgisi: T tarafının konumu henüz bilinmiyor.</div><div id="mac-izle-bomba" class="mac-izle-alt-bilgi">' + (c.bombaKuruldu ? "BOMBA KURULDU · " + c.bombaYeri + " SİTESİ" : "Bomba taşıyıcısı hedef bölgeye ilerliyor") + '</div></div>';
  h += '<div class="mac-izle-kontroller"><div class="mac-hizlar"><small>HIZ</small>';
  MAC_IZLE_HIZLARI.forEach(function (x) { h += '<button class="mac-hiz' + (c.hiz === x ? ' aktif' : '') + '" onclick="canliHizAyarla(' + x + ')">' + x + '×</button>'; });
  h += '</div><button class="buton mac-mola-buton" onclick="canliMola()"' + (c.mola <= 0 ? " disabled" : "") + '>Mola Al <b>' + c.mola + '/2</b></button>';
  if (c.yariGecti) h += '<button class="buton ikincil" onclick="canliMaciHizliBitir()">Maçı Bitir</button>';
  if (!c.yariGecti) h += '<button class="buton ikincil mac-atla-buton" onclick="canliDevreyeAtla()">Devre Arasına Atla</button>';
  h += '</div><div id="mac-izle-alt-bilgi" class="mac-izle-alt-bilgi">Karşılaşma simülasyonu raund raund oynanıyor.</div></section>';
  if (c.molaAcik) {
    h += '<div class="mac-mola-katmani"><div class="mac-mola-kart"><small>TAKIM MOLASI</small><h2>Oyuncularla konuş.</h2><p>Sonraki ' + MOLA_TUR + ' raund boyunca takımına +' + MOLA_BONUSU + ' güç etkisi uygulanacak.</p><button class="buton" onclick="canliMolaDevam()">Maça Devam Et</button></div></div>';
  }
  uygulama.innerHTML = h;
  macIzleKillFeedYenile();
}

function macIzleBaslat() {
  const c = canli;
  if (!c || c.molaAcik) return;
  c.macEkrani = "canli";
  if (!c.raundPlan) macIzleRaundHazirla(c);
  if (c.navBaslatiyor) return;
  macIzleDurdur();
  macIzleEkrani();
  c.navBaslatiyor = true;
  macIzleNavigasyonHazirla(c, function () {
    if (canli !== c) return;
    c.navBaslatiyor = false;
    if (c.molaAcik) return;
    macIzleKonumlariYuruneBilirAlana(c);
    macIzleSvgOyuncularYenile(c);
    c.izSonKare = null;
    const surum=c.izAnimasyonSurum;
    function kare(zaman) {
      if(canli!==c || c.molaAcik || c.izAnimasyonSurum!==surum) return;
      const ms=c.izSonKare===null?0:Math.max(0,Math.min(80,zaman-c.izSonKare));
      c.izSonKare=zaman;
      if(ms>0) macIzleAdim(ms*c.hiz/900);
      if(canli===c && !c.molaAcik && c.izAnimasyonSurum===surum) c.izleZamanlayici=requestAnimationFrame(kare);
    }
    c.izleZamanlayici=requestAnimationFrame(kare);
  });
}

function macIzleDurdur() {
  if (canli) {
    canli.izAnimasyonSurum=(canli.izAnimasyonSurum||0)+1;
    if(canli.izleZamanlayici) cancelAnimationFrame(canli.izleZamanlayici);
    canli.izleZamanlayici = null;
  }
}

function canliHizAyarla(hiz) {
  if (MAC_IZLE_HIZLARI.indexOf(hiz) < 0 || !canli || canli.molaAcik) return;
  canli.hiz = hiz;
  macIzleBaslat();
}

function macIzleGorusAcik(c, a, b) {
  const d=Math.hypot(b.izX-a.izX,b.izY-a.izY);
  if(d<0.01) return true;
  return haritaIsinMesafesi(macIzleHaritaBilgisi(c),a.izX,a.izY,Math.atan2(b.izY-a.izY,b.izX-a.izX),d)>=d-0.01;
}

function macIzleOyuncuGorur(c, a, b) {
  if (a.izHayatta===false || b.izHayatta===false) return false;
  const dx=b.izX-a.izX, dy=b.izY-a.izY;
  if (Math.hypot(dx,dy)>220) return false;
  const fark=Math.atan2(Math.sin(Math.atan2(dy,dx)-(a.izAci||0)),Math.cos(Math.atan2(dy,dx)-(a.izAci||0)));
  return Math.abs(fark)<=Math.PI*0.28 && macIzleGorusAcik(c,a,b);
}

function macIzleGorusYolu(c,x) {
  if(x.izHayatta===false) return '';
  const h=macIzleHaritaBilgisi(c),yon=x.izAci||0,yarim=Math.PI*0.28,acilar=[];
  for(let i=0;i<=32;i++)acilar.push(-yarim+i/32*yarim*2);
  h.engeller.map(r=>[r[0]-2.5,r[1]-2.5,r[2]+5,r[3]+5]).concat(h.odalar).forEach(function(r) {
    [[r[0],r[1]],[r[0]+r[2],r[1]],[r[0],r[1]+r[3]],[r[0]+r[2],r[1]+r[3]]].forEach(function(p) {
      if(Math.hypot(p[0]-x.izX,p[1]-x.izY)>230)return;
      const fark=Math.atan2(Math.sin(Math.atan2(p[1]-x.izY,p[0]-x.izX)-yon),Math.cos(Math.atan2(p[1]-x.izY,p[0]-x.izX)-yon));
      [-0.003,0,0.003].forEach(function(ek){if(Math.abs(fark+ek)<yarim)acilar.push(fark+ek);});
    });
  });
  acilar.sort((a,b)=>a-b);
  const noktalar=[[x.izX,x.izY]];
  let onceki=-Infinity;
  acilar.forEach(function(ofset) {
    if(ofset-onceki<0.0001)return;onceki=ofset;
    const aci=yon+ofset,d=haritaIsinMesafesi(h,x.izX,x.izY,aci,220);
    noktalar.push([x.izX+Math.cos(aci)*d,x.izY+Math.sin(aci)*d]);
  });
  return 'M'+noktalar.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L')+'Z';
}

function macIzleGorusSvg(c) {
  let svg='';
  ['A','B'].forEach(function(takim) {
    const renk=macIzleTarafRengi(macIzleTakimTarafi(c,takim));
    c[takim==='A'?'aktifA':'aktifB'].forEach(function(x,i) {
      svg+='<path id="mac-gorus-'+takim+'-'+i+'" d="'+macIzleGorusYolu(c,x)+'" fill="'+renk+'" fill-opacity=".10" stroke="'+renk+'" stroke-opacity=".32" stroke-width="1.5"/>';
    });
  });return svg;
}

function macIzleTemasOlayi(c) {
  const plan = c.raundPlan;
  let temas = null, enYakin = 220;
  c.aktifA.forEach(function (a) {
    if (a.izHayatta === false) return;
    c.aktifB.forEach(function (b) {
      if (b.izHayatta === false) return;
      const d = Math.hypot(a.izX - b.izX, a.izY - b.izY);
      if (d <= enYakin && (macIzleOyuncuGorur(c,a,b) || macIzleOyuncuGorur(c,b,a))) {
        temas = { A: a, B: b };
        enYakin = d;
      }
    });
  });
  if (!temas) return null;
  temas.A.izAci=Math.atan2(temas.B.izY-temas.A.izY,temas.B.izX-temas.A.izX);
  temas.B.izAci=temas.A.izAci+Math.PI;
  const olay = plan.olaylar[plan.index];
  // Raundun sonuç planını korurken çatışmayı gerçekten karşılaşan oyuncular oynar.
  // Kalan plandaki kimlikleri birlikte değiştirerek ölü oyuncunun tekrar oynamasını önle.
  function kimlikDegistir(eski, yeni) {
    if (eski === yeni) return;
    for (let i = plan.index; i < plan.olaylar.length; i++) {
      const o = plan.olaylar[i];
      ["katil", "kurban"].forEach(function (alan) {
        if (o[alan] === eski) o[alan] = yeni;
        else if (o[alan] === yeni) o[alan] = eski;
      });
    }
  }
  kimlikDegistir(olay.katil, temas[olay.takim]);
  kimlikDegistir(olay.kurban, temas[olay.takim === "A" ? "B" : "A"]);
  return olay;
}

function macIzleAdim(delta) {
  const c = canli;
  if (!c || !c.raundPlan || c.molaAcik) return;
  if (c.raundPlan.index >= c.raundPlan.olaylar.length) {
    macIzleRaundBitir(c);
    canliDevam();
    return;
  }
  macIzleOyuncularHareketEt(c, delta === undefined ? 1 : delta);
  if(c.raundPlan.adim>=(c.raundPlan.sonBilgi||0)+0.12) {
    macIzleBilgiKontrol(c);
    c.raundPlan.sonBilgi=c.raundPlan.adim;
  }
  macIzleBombaKontrol(c);
  const olay = c.raundPlan.adim>=(c.raundPlan.sonAtes||0) ? macIzleTemasOlayi(c) : null;
  if (!olay) {
    macIzleSvgOyuncularYenile(c);
    return;
  }
  c.raundPlan.index++;
  c.raundPlan.sonAtes=c.raundPlan.adim+0.7;
  macIzleOlayUygula(c, olay, true);
  macIzleSvgOyuncularYenile(c,true);
  macIzleKillFeedYenile();
}

function macIzleMevziSec(c, x, alan, oyuncular) {
  const h = macIzleHaritaBilgisi(c), grid = h.navGrid;
  const adaylar = alan === 'mid'
    ? [{konum:[h.mid[0]+10,h.mid[1]-25],bakis:[h.mid[0],h.mid[1]+170]}]
    : h.mevziler[alan];
  let secim = null, enBos = -1;
  for (let k=0;k<adaylar.length;k++) {
    const aday = adaylar[(x.izMevziSira+k)%adaylar.length];
    const n = macIzleEnYakinYuruneBilirIzgaraNoktasi(grid,aday.konum,true);
    if (n<0) continue;
    const p=[n%grid.boyut*1000/(grid.boyut-1),Math.floor(n/grid.boyut)*1000/(grid.boyut-1)];
    if(Math.hypot(p[0]-aday.konum[0],p[1]-aday.konum[1])>20) continue;
    let bosluk=Infinity;
    oyuncular.forEach(function (d) {
      if (d!==x && d.izHayatta!==false && d.izHedef && d.izHedefAlan===alan) bosluk=Math.min(bosluk,Math.hypot(p[0]-d.izHedef[0],p[1]-d.izHedef[1]));
    });
    if (bosluk>enBos) {enBos=bosluk;secim={konum:p,bakis:aday.bakis};}
    if (bosluk>=44) break;
  }
  return secim || {konum:[x.izX,x.izY],bakis:h.mid};
}

function macIzleAciYumusat(x,hedef,delta) {
  const eski=x.izAci||0;
  const fark=Math.atan2(Math.sin(hedef-eski),Math.cos(hedef-eski));
  x.izAci=eski+Math.max(-3*delta,Math.min(3*delta,fark));
}

function macIzleSavunmaBilgisiGuncelle(c) {
  const plan=c.raundPlan;
  if(!plan) return;
  const bilgi=plan.ctBilgi;
  const ct=macIzleTakimTarafi(c,'A')==='CT'?c.aktifA:c.aktifB;
  if(!bilgi.dusmusAlanlar)bilgi.dusmusAlanlar={A:false,B:false};
  const mid=ct.filter(p=>p.izSavunmaAlani==='mid');
  bilgi.midKayip=mid.length>0 && mid.every(p=>p.izHayatta===false);
  ['A','B'].forEach(function(alan) {
    const savunma=ct.filter(p=>(p.izHedefAlan||p.izSavunmaAlani)===alan);
    if(savunma.length && savunma.every(p=>p.izHayatta===false) && !bilgi.dusmusAlanlar[alan]) {
      bilgi.dusmusAlanlar[alan]=true;
      bilgi.dusmusSite=alan;
      bilgi.site=c.bombaKuruldu?c.bombaYeri:alan;
      bilgi.rotasyonNedeni=alan+' savunması düştü';
    }
  });
}

function macIzleTehditYonu(c,x,alan,taraf,hareketYon) {
  const h=macIzleHaritaBilgisi(c),plan=c.raundPlan,bilgi=plan.ctBilgi;
  const temas=x.izSonTemas;
  if(temas && temas.rakip.izHayatta!==false && plan.adim-temas.zaman<0.35) {
    return Math.atan2(temas.konum[1]-x.izY,temas.konum[0]-x.izX);
  }
  const yakin=alan==='mid' || Math.hypot(x.izX-h[alan][0],x.izY-h[alan][1])<210;
  if(yakin && taraf==='CT' && alan!=='mid' && bilgi.midKayip) {
    const kisa=h['mid'+alan],kapi=kisa[kisa.length-2];
    return Math.atan2(kapi[1]-x.izY,kapi[0]-x.izX);
  }
  if(temas && temas.rakip.izHayatta!==false && plan.adim-temas.zaman<7) {
    return Math.atan2(temas.konum[1]-x.izY,temas.konum[0]-x.izX);
  }
  if(yakin && taraf==='CT') {
    const haber=(bilgi.tehditler||[]).filter(t=>t.alan===alan && plan.adim-t.zaman<7).sort((a,b)=>b.zaman-a.zaman)[0];
    if(haber) return Math.atan2(haber.konum[1]-x.izY,haber.konum[0]-x.izX);
  }
  if(hareketYon!==null) return hareketYon;
  let kapi;
  if(alan==='mid') kapi=[h.mid[0],h.mid[1]+180];
  else {
    const yol=taraf==='CT' ? (x.izGorev%2===0?h['t'+alan]:h['mid'+alan]) : (x.izGorev%2===0?h['ct'+alan]:h['mid'+alan]);
    kapi=yol[yol.length-2];
  }
  return Math.atan2(kapi[1]-x.izY,kapi[0]-x.izX);
}

function macIzleOyuncularHareketEt(c,delta) {
  delta=delta===undefined?1:delta;
  const h=macIzleHaritaBilgisi(c), plan=c.raundPlan;
  plan.adim=(plan.adim||0)+delta;
  macIzleSavunmaBilgisiGuncelle(c);
  ['A','B'].forEach(function (takim) {
    const oyuncular=c[takim==='A'?'aktifA':'aktifB'], taraf=macIzleTakimTarafi(c,takim);
    const tasiyici=oyuncular.find(p=>p.izHayatta!==false && p.izGorev===0) || oyuncular.find(p=>p.izHayatta!==false);
    oyuncular.forEach(function (x,i) {
      if (x.izHayatta===false) return;
      if (taraf==='T' && Math.hypot(x.izX-h[plan.site][0],x.izY-h[plan.site][1])<130) x.izGirisTamam=true;
      const alan=taraf==='T' ? plan.site : (plan.ctBilgi.site || (x.izGorev===4?'mid':(x.izGorev<2?'A':'B')));
      const kurucu=taraf==='T' && !c.bombaKuruldu && x===tasiyici;
      const anahtar=taraf+'_'+alan+(kurucu?'_KUR':'_TUT')+'_'+x.izMevziSira;
      if (x.izNavAnahtar!==anahtar || !x.izNavRota) {
        const mevzi=kurucu?{konum:h[alan],bakis:h['giris'+alan]}:macIzleMevziSec(c,x,alan,oyuncular);
        x.izHedef=mevzi.konum; x.izHedefAlan=alan; x.izBakisHedef=mevzi.bakis;
        let rota=null;
        if (taraf==='T' && !x.izGirisTamam) {
          const giris=x.izGirisMid?h.mid:h['giris'+alan];
          const a=macIzleHaritaRotasiBul(c,[x.izX,x.izY],giris), b=macIzleHaritaRotasiBul(c,giris,mevzi.konum);
          if (a && b) rota=a.concat(b.slice(1));
        } else rota=macIzleHaritaRotasiBul(c,[x.izX,x.izY],mevzi.konum);
        x.izNavRota=rota && rota.length?rota:[[x.izX,x.izY]];
        x.izNavWp=0; x.izNavAnahtar=anahtar;
        x.izYerDegistir=plan.adim+15+Math.random()*13;
      }
      const rota=x.izNavRota;
      let kalan=(taraf==='T'?18:30)*delta, hareketYon=null;
      // Bir karede köşeye varınca kalan hareketi sonraki parçaya aktar; bekleme yaratma.
      for(let n=0;n<rota.length && kalan>0.0001;n++) {
        const p=rota[x.izNavWp],dx=p[0]-x.izX,dy=p[1]-x.izY,d=Math.hypot(dx,dy);
        if(d<0.0001) {if(x.izNavWp<rota.length-1){x.izNavWp++;continue;}break;}
        const adim=Math.min(kalan,d);
        x.izX+=dx/d*adim;x.izY+=dy/d*adim;kalan-=adim;
        hareketYon=Math.atan2(dy,dx);
      }
      const son=rota[rota.length-1];
      if(Math.hypot(son[0]-x.izX,son[1]-x.izY)<0.1) {
        x.izGirisTamam=true;
        if (taraf==='T' && !kurucu && plan.adim>=x.izYerDegistir) {
          const rakipler=c[takim==='A'?'aktifB':'aktifA'];
          if(!rakipler.some(r=>macIzleOyuncuGorur(c,x,r))) {
            x.izMevziSira=(x.izMevziSira+1+Math.floor(Math.random()*3))%(h.mevziler[alan]||[0]).length;
            x.izNavAnahtar=null;
          }
        }
      }
      macIzleAciYumusat(x,macIzleTehditYonu(c,x,alan,taraf,hareketYon),delta);
    });
  });
}

function macIzleBilgiMetni(c) {
  const b=c.raundPlan.ctBilgi;
  let mesaj=b.site ? ('CT bilgisi: '+b.site+' alanına destek · '+(c.bombaKuruldu?'bomba kuruldu':b.rotasyonNedeni||'rakip görüldü')) : 'CT bilgisi: Savunma yerleşimi korunuyor.';
  if(b.midKayip)mesaj+=' · Mid oyuncusu kaybedildi, kısa kapılar tutuluyor';
  else if(b.mid)mesaj+=' · Mid teması';
  return mesaj;
}

function macIzleBilgiKontrol(c) {
  const plan=c.raundPlan;if(!plan)return;
  const h=macIzleHaritaBilgisi(c),bilgi=plan.ctBilgi;
  if(!bilgi.tehditler)bilgi.tehditler=[];
  bilgi.tehditler=bilgi.tehditler.filter(t=>plan.adim-t.zaman<7);
  ['A','B'].forEach(function(takim) {
    const takimimiz=c[takim==='A'?'aktifA':'aktifB'],rakipler=c[takim==='A'?'aktifB':'aktifA'],taraf=macIzleTakimTarafi(c,takim);
    takimimiz.forEach(function(x) {
      if(x.izHayatta===false)return;
      let gorulen=null,mesafe=Infinity;
      rakipler.forEach(function(r) {
        const d=Math.hypot(r.izX-x.izX,r.izY-x.izY);
        if(d<mesafe && macIzleOyuncuGorur(c,x,r)){gorulen=r;mesafe=d;}
      });
      if(!gorulen)return;
      x.izSonTemas={rakip:gorulen,konum:[gorulen.izX,gorulen.izY],zaman:plan.adim};
      if(taraf!=='CT')return;
      const a=Math.hypot(gorulen.izX-h.A[0],gorulen.izY-h.A[1]),b=Math.hypot(gorulen.izX-h.B[0],gorulen.izY-h.B[1]);
      const alan=a<190?'A':b<190?'B':'mid';
      const haber={alan:alan,konum:[gorulen.izX,gorulen.izY],zaman:plan.adim};
      const n=bilgi.tehditler.findIndex(t=>t.alan===alan);
      if(n<0)bilgi.tehditler.push(haber);else bilgi.tehditler[n]=haber;
      if(alan==='mid')bilgi.mid=true;
      else if(!bilgi.site){bilgi.site=alan;bilgi.rotasyonNedeni='rakip görüldü';}
    });
  });
  if(bilgi.dusmusSite && !c.bombaKuruldu)bilgi.site=bilgi.dusmusSite;
  const el=document.getElementById('mac-izle-bilgi');if(el)el.textContent=macIzleBilgiMetni(c);
}

function macIzleBombaKontrol(c) {
  const plan = c.raundPlan;
  if (!plan || c.bombaKuruldu) return;
  const merkez = macIzleHaritaBilgisi(c)[plan.site];
  let ulasan = false;
  ["A", "B"].forEach(function (takim) {
    if (macIzleTakimTarafi(c, takim) !== "T") return;
    const oyuncular=c[takim==='A'?'aktifA':'aktifB'];
    const tasiyici=oyuncular.find(x=>x.izHayatta!==false && x.izGorev===0) || oyuncular.find(x=>x.izHayatta!==false);
    if(tasiyici && Math.hypot(tasiyici.izX-merkez[0],tasiyici.izY-merkez[1])<42) ulasan=true;
  });
  if (!ulasan) return;
  c.bombaKuruldu = true;
  c.bombaYeri = plan.site;
  plan.ctBilgi.site = plan.site;
  c.aktifPlan += " · Bomba kuruldu";
  const planEtiketi = document.getElementById("mac-izle-plan");
  if (planEtiketi) planEtiketi.innerHTML = "Plan: <b>" + macXml(c.aktifPlan) + "</b> · Mid kontrolü için oyuncu ayrıldı.";
  const etiket = document.getElementById("mac-izle-bomba");
  if (etiket) etiket.innerHTML = "BOMBA KURULDU · " + plan.site + " SİTESİ";
}

function macIzleOlayUygula(c, olay, feedEkle) {
  olay.katil.kill++;
  olay.kurban.death++;
  olay.kurban.izHayatta = false;
  if (feedEkle) {
    c.killFeed.unshift(olay);
    c.killFeed = c.killFeed.slice(0, 4);
  }
}

function macIzleSvgOyuncularYenile(c,zorlaGorus) {
  // Koni hesaplarını karelere dağıt; bütün SVG'yi her karede yeniden oluşturma.
  const toplam=c.aktifA.length+c.aktifB.length;
  for(let n=0;n<Math.min(3,toplam);n++) {
    const sira=(c.izGorusSira||0)%toplam;
    const takim=sira<c.aktifA.length?'A':'B',i=takim==='A'?sira:sira-c.aktifA.length;
    const x=c[takim==='A'?'aktifA':'aktifB'][i],el=document.getElementById('mac-gorus-'+takim+'-'+i);
    if(el)el.setAttribute('d',macIzleGorusYolu(c,x));
    c.izGorusSira=(sira+1)%toplam;
  }
  ["A", "B"].forEach(function (takim) {
    const sayac=document.getElementById('mac-hayatta-'+takim);
    if(sayac) sayac.textContent=macIzleHayattaMetni(c,takim);
    c[takim === "A" ? "aktifA" : "aktifB"].forEach(function (x, i) {
      const koni=document.getElementById('mac-gorus-'+takim+'-'+i);
      if(koni && x.izHayatta===false)koni.setAttribute('d','');
      const el = document.getElementById("mac-oyuncu-" + takim + "-" + i);
      if (!el) return;
      el.setAttribute("transform", "translate(" + x.izX.toFixed(1) + " " + x.izY.toFixed(1) + ")" + (x.izHayatta === false ? " scale(.82)" : ""));
      el.setAttribute("opacity", x.izHayatta === false ? ".32" : "1");
      const bakis=document.getElementById('mac-bakis-'+takim+'-'+i);
      if(bakis) bakis.setAttribute('transform','rotate('+((x.izAci||0)*180/Math.PI).toFixed(1)+')');
    });
  });
}

function macIzleHayattaMetni(c,takim) {
  const oyuncular=c[takim==='A'?'aktifA':'aktifB'];
  return oyuncular.filter(p=>p.izHayatta!==false).length+' / '+oyuncular.length+' hayatta';
}

function macIzleKillFeedYenile() {
  const alan = document.getElementById("mac-izle-killfeed");
  if (!alan || !canli) return;
  const c = canli;
  alan.innerHTML = (canli.killFeed || []).map(function (x) {
    const taraf = macIzleTaraf(c, x.takim);
    return '<div class="mac-killfeed-satir"><b style="color:' + macIzleTarafRengi(taraf) + '">' + macXml(x.katil.o.ad) + '</b><span>✕</span><b>' + macXml(x.kurban.o.ad) + '</b></div>';
  }).join("");
}

function macIzleTaraf(c, takim) { return macIzleTakimTarafi(c, takim); }

function macIzleRaundBitir(c) {
  const plan = c.raundPlan;
  const kazananTakim = plan.aK ? "A" : "B";
  const tarafKazanan = macIzleTakimTarafi(c, kazananTakim);
  if (c.hizliSimulasyon && !c.bombaKuruldu && tarafKazanan === "T") {
    c.bombaKuruldu = true;
    c.bombaYeri = plan.site;
  }
  if (c.bombaKuruldu) c.olaylar.push(c.bombaYeri + " alanında bomba kuruldu; " + (tarafKazanan === "T" ? "bomba patladı, T tarafı raundu aldı." : "CT tarafı sahayı temizleyip bombayı etkisizleştirdi."));
  else if (tarafKazanan === "CT") c.olaylar.push("CT savunması " + plan.site + " yaklaşımını tuttu; bomba kurulamadı.");
  if (plan.aK) { c.sa++; c.serA = 0; c.serB++; }
  else { c.sb++; c.serB = 0; c.serA++; }
  if (c.molaTur > 0) c.molaTur--;
  if (c.molaTurB > 0) c.molaTurB--;
  if (c.serB >= 3 && c.molaB > 0) {
    c.molaB--;
    c.serB = 0;
    c.molaTurB = MOLA_TUR;
    c.olaylar.push("Rakip mola aldı (" + c.sa + "-" + c.sb + ")");
  }
  if (!c.ot && c.sa === 12 && c.sb === 12) {
    c.ot = true;
    c.otA = 0; c.otB = 0; c.otN = 0;
  } else if (c.ot) {
    c.otN++;
    if (plan.aK) c.otA++; else c.otB++;
    if (c.otN === 6) {
      if (c.otA >= 4 || c.otB >= 4) c.macaBitti = true;
      else { c.otA = 0; c.otB = 0; c.otN = 0; }
    }
  }
  c.raundPlan = null;
  c.raundNo = c.sa + c.sb + 1;
  if (!c.hizliSimulasyon) kaydet();
}

function canliDevreyeAtla() {
  const c = canli;
  if (!c || c.yariGecti || c.molaAcik) return;
  macIzleDurdur();
  c.hizliSimulasyon = true;
  while (!c.macaBitti && c.sa + c.sb < 12) {
    if (!c.raundPlan) macIzleRaundHazirla(c);
    while (c.raundPlan && c.raundPlan.index < c.raundPlan.olaylar.length) {
      macIzleOlayUygula(c, c.raundPlan.olaylar[c.raundPlan.index++], false);
    }
    macIzleRaundBitir(c);
  }
  c.hizliSimulasyon = false;
  canliDevam();
}

// Capacitor WebView'de klasik betikler arası çağrıları açıkça dışa aktar.
window.canliIzleBaslat = macIzleBaslat;
window.canliIzleDurdur = macIzleDurdur;
window.canliIzleEkrani = macIzleEkrani;
window.canliHizAyarla = canliHizAyarla;
window.canliDevreyeAtla = canliDevreyeAtla;
