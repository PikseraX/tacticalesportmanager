const STRATEJILER = {
  "Dengeli": ["Lider", "Yıldız", "Destek", "Giriş", "Sniper"],
  "Agresif": ["Giriş", "Giriş", "Yıldız", "Sniper", "Lider"],
  "Taktiksel": ["Taktisyen", "Lider", "Destek", "Lurker", "Anchor"],
  "Savunma": ["Anchor", "Anchor", "Destek", "Sniper", "Lider"],
  "Sniper Ağırlıklı": ["Sniper", "Sniper", "Destek", "Lurker", "Lider"]
};
const STRATEJI_LISTESI = Object.keys(STRATEJILER);

const STRATEJI_ACIKLAMA = {
  "Dengeli": "Her duruma uyum sağlayan güvenli kadro.",
  "Agresif": "Hızlı girişler ve erken çatışma. İki Giriş oyuncusu ister.",
  "Taktiksel": "Planlı ve sabırlı oyun. Taktisyen, Lurker ve Anchor ister.",
  "Savunma": "Sağlam savunma ve bölge tutma. İki Anchor ister.",
  "Sniper Ağırlıklı": "Uzun mesafe hakimiyeti. İki Sniper ister."
};

// Eşleşen rol sayısına göre takım gücü etkisi (0..5)
const STRATEJI_UYUM_ETKISI = [-3, -2.5, -1.5, 0, 1.5, 3];

function etkiYazi(x) { return (x > 0 ? "+" : "") + x; }

function stratejiUyumu(oyuncular, strateji) {
  const gerek = STRATEJILER[strateji];
  if (!gerek) return null;
  const kalan = gerek.slice();
  let eslesen = 0;
  oyuncular.forEach(function (o) {
    const i = kalan.indexOf(o.rol);
    if (i >= 0) { kalan.splice(i, 1); eslesen++; }
  });
  return eslesen;
}

function stratejiEtkisi(oyuncular, strateji) {
  const u = stratejiUyumu(oyuncular, strateji);
  if (u === null) return 0;
  let e = STRATEJI_UYUM_ETKISI[u];
  if (e < 0 && benimTakimMi(oyuncular)) e *= 1 - 0.2 * personelSeviye("koc");
  return e;
}

function rolGenel(o,rol) { return rolGenelPuani(o,rol); }

// Beş oyuncu ve beş rol için tüm eşleşmeleri tarar, takımın toplam GEN'ini en üstte tutar.
function rolleriEnIyiDagit(oyuncular, roller) {
  let enIyi = null;
  let enYuksek = -Infinity;
  function ara(kalanOyuncular, atama, toplam) {
    const sira = atama.length;
    if (sira === roller.length) {
      if (toplam > enYuksek) { enYuksek = toplam; enIyi = atama.slice(); }
      return;
    }
    for (let i = 0; i < kalanOyuncular.length; i++) {
      const oyuncu = kalanOyuncular[i];
      atama.push({ oyuncu: oyuncu, rol: roller[sira] });
      ara(kalanOyuncular.slice(0, i).concat(kalanOyuncular.slice(i + 1)), atama, toplam + rolGenel(oyuncu, roller[sira]));
      atama.pop();
    }
  }
  ara(oyuncular.slice(0, roller.length), [], 0);
  return enIyi || [];
}

function rolDagilimiOrtGEN(oyuncular, roller) {
  const atama = rolleriEnIyiDagit(oyuncular, roller);
  return atama.length ? atama.reduce(function (s, x) { return s + rolGenel(x.oyuncu, x.rol); }, 0) / atama.length : 0;
}

function rolDagiliminiUygula(oyuncular, roller) {
  rolleriEnIyiDagit(oyuncular, roller).forEach(function (x) {
    x.oyuncu.rol = x.rol;
    genelHesapla(x.oyuncu);
  });
}

function stratejiUygula(t) {
  rolDagiliminiUygula(t.oyuncular, STRATEJILER[t.strateji]);
}

// Stratejisi olmayan takımlara strateji verir (eski kayıtlar dahil)
function stratejiHazirla() {
  let degisti = false;
  if (!kariyer.strateji || !STRATEJILER[kariyer.strateji]) {
    kariyer.strateji = "Dengeli";
    degisti = true;
  }
  if (kariyer.rolAtamaSurum !== 1) {
    stratejiUygula(kariyer);
    kariyer.rolAtamaSurum = 1;
    degisti = true;
  }
  dunya.forEach(function (t) {
    if (!t.strateji || !STRATEJILER[t.strateji]) {
      t.strateji = STRATEJI_LISTESI[Math.floor(Math.random() * STRATEJI_LISTESI.length)];
      stratejiUygula(t);
      degisti = true;
    }
  });
  if (degisti) kaydet();
}

// Oyuncuları birer kez kullanarak beş rolün toplam GEN'ini en yükseğe çıkarır.
// Eşit GEN'de mevcut ilk 5'ten daha çok oyuncuyu korur.
function stratejiEnIyiBes(kadro,roller,mevcut){
  const adaylar=[...new Set(kadro)],baslangic=new Set(mevcut||[]),son=(1<<roller.length)-1;
  let dp=Array(son+1).fill(null);dp[0]={puan:0,korunan:0,atama:[]};
  adaylar.forEach(o=>{
    const puanlar=roller.map(r=>rolGenel(o,r)),yeni=dp.slice();
    dp.forEach((d,maske)=>{if(!d)return;roller.forEach((rol,i)=>{
      if(maske&(1<<i))return;
      const m=maske|(1<<i),p=d.puan+puanlar[i],k=d.korunan+(baslangic.has(o)?1:0),eski=yeni[m];
      if(!eski||p>eski.puan||(p===eski.puan&&k>eski.korunan))yeni[m]={puan:p,korunan:k,atama:d.atama.concat({oyuncu:o,rol,sira:i})};
    });});dp=yeni;
  });
  return dp[son]?dp[son].atama.slice().sort((a,b)=>a.sira-b.sira):[];
}
function stratejiBesOrt(s){
  const atama=stratejiEnIyiBes(tumKadro(),STRATEJILER[s],kariyer.oyuncular);
  return atama.length?atama.reduce((sum,x)=>sum+rolGenel(x.oyuncu,x.rol),0)/atama.length:0;
}

function stratejiEkrani() {
  const u = stratejiUyumu(kariyer.oyuncular, kariyer.strateji);
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Takım Stratejisi</h2>';
  html += '<div class="bilgi-kutusu">Seçili: <b>' + kariyer.strateji + "</b><br>Uyum: <b>" + u + "/5</b> (takım gücüne " + etkiYazi(STRATEJI_UYUM_ETKISI[u]) + ")</div>";
  html += '<div class="bilgi-kutusu">Bu stratejiye göre en iyi rol dağılımıyla beklenen ortalama GEN: <b>' + rolDagilimiOrtGEN(kariyer.oyuncular, STRATEJILER[kariyer.strateji]).toFixed(1) + "</b>. Strateji seçimi bu beş oyuncuyu korur; yalnız rollerini uyarlar. Yedeklerden oyuncu almak için aşağıdaki İlk 5 düğmesini kullan.</div>";
  STRATEJI_LISTESI.forEach(function (s) {
    const k = stratejiUyumu(kariyer.oyuncular, s);
    const renk = s === kariyer.strateji ? ' style="border-color:var(--accent)"' : "";
    const ort = rolDagilimiOrtGEN(kariyer.oyuncular, STRATEJILER[s]);
    html += '<button class="takim-butonu"' + renk + ' onclick="stratejiSec(\'' + s + '\')"><span>' + s + "<br><small>Mevcut beşliyle GEN " + ort.toFixed(1) + "</small></span><span>Uyum " + k + "/5 · " + etkiYazi(STRATEJI_UYUM_ETKISI[k]) + "</span></button>";
  });
  html += '<div class="bilgi-kutusu">İlk 5 ve yedeklerin tamamından bu strateji için ulaşılabilecek en yüksek ortalama GEN: <b>'+stratejiBesOrt(kariyer.strateji).toFixed(1)+'</b>. Seçim GEN toplamına göredir; moral, yorgunluk ve kimya ayrıca maç performansını etkiler.</div>';
  html += '<button class="buton" onclick="stratejiDiz()">İlk 5’i Stratejiye Göre Değiştir</button>';
  uygulama.innerHTML = html;
}

function stratejiSec(s) {
  if (!STRATEJILER[s]) return;
  kariyer.strateji = s;
  stratejiUygula(kariyer);
  kaydet();
  ekraniKonumdaGuncelle(stratejiEkrani);
}

function stratejiDiz() {
  if(canli||canliSeri){alert("Devam eden maç bitmeden ilk 5 değiştirilemez.");return;}
  const kadro=tumKadro(),atama=stratejiEnIyiBes(kadro,STRATEJILER[kariyer.strateji],kariyer.oyuncular);
  if(atama.length!==5)return;
  const ort=atama.reduce((sum,x)=>sum+rolGenel(x.oyuncu,x.rol),0)/5;
  const mesaj=atama.map(x=>x.rol+": "+x.oyuncu.ad+" (GEN "+rolGenel(x.oyuncu,x.rol)+")").join("\n");
  if(!confirm("Önerilen ilk 5 · Ortalama GEN "+ort.toFixed(1)+"\n\n"+mesaj+"\n\nİlk 5 dışındakiler yedekte kalır. İlk 5/yedek maaş farkı haftalık gideri değiştirebilir. Uygulansın mı?"))return;
  const secilen=new Set(atama.map(x=>x.oyuncu));
  kariyer.oyuncular=atama.map(x=>{x.oyuncu.rol=x.rol;genelHesapla(x.oyuncu);return x.oyuncu;});
  kariyer.yedekler=kadro.filter(o=>!secilen.has(o));
  kaydet();ekraniKonumdaGuncelle(stratejiEkrani);
}

function stratejiRehberi() {
  let html = '<button class="geri" onclick="rehberMenu()">← Rehber</button><h2>Strateji Rehberi</h2>';
  html += "<p>Stratejinin istediği roller kadronda ne kadar varsa takım gücüne etki eder:<br>" + STRATEJI_UYUM_ETKISI.map(function (e, i) { return i + "/5: " + etkiYazi(e); }).join(" · ") + "</p>";
  html += "<p>Strateji seçmek mevcut ilk 5 oyuncusunu korur, rollerini seçilen düzene uyarlar. İlk 5’i Stratejiye Göre Değiştir düğmesi ise ilk 5 ve yedeklerin tamamından en yüksek toplam rol GEN’ini sağlayan beşliyi seçer. Eşit GEN’de mevcut beşliyi mümkün olduğunca korur. Maç Öncesi ekranındaki taktik ve hazırlık planı ayrıdır; bunlar kalıcı kadro rollerini değiştirmez. Spiker ve Hızlı Maç aynı maç kurallarını kullanır.</p>";
  STRATEJI_LISTESI.forEach(function (s) {
    html += '<div class="bilgi-kutusu"><b>' + s + "</b><br>" + STRATEJI_ACIKLAMA[s] + "<br>İstediği roller: " + STRATEJILER[s].join(", ") + "</div>";
  });
  uygulama.innerHTML = html;
}
