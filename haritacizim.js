// Çizim, görüş hattı ve hareket aynı oda / koridor / engel geometrisini kullanır.
function ozgunHaritaOlustur(ad, tema, ct, t, A, B, mid, yollar) {
  const h = { ad: ad, w: 800, h: 1000, tema: tema, ct: ct, t: t, A: A, B: B, mid: mid };
  // Kısa bağlantılar yan kapıdan, dış koridorlar alt kapıdan sahaya girer.
  yollar.midA = [mid, [mid[0]+110,mid[1]], [mid[0]+110,A[1]], A];
  yollar.midB = [mid, [mid[0]-110,mid[1]], [mid[0]-110,B[1]], B];
  Object.keys(yollar).forEach(function (k) { h[k] = yollar[k]; });
  h.girisA = h.tA[Math.floor(h.tA.length / 2)];
  h.girisB = h.tB[Math.floor(h.tB.length / 2)];
  h.odalar = [
    [ct[0] - 100, ct[1] - 48, 200, 96], [t[0] - 110, t[1] - 48, 220, 96],
    [A[0] - 115, A[1] - 95, 230, 190], [B[0] - 115, B[1] - 95, 230, 190],
    [mid[0] - 75, mid[1] - 65, 150, 130]
  ];
  h.yollar = Object.keys(yollar).map(function (k) { return { noktalar: yollar[k], genislik: k === 'tMid' ? 84 : 94 }; });
  h.engeller = [
    [A[0] + 38, A[1] - 66, 43, 32], [A[0] - 82, A[1] + 34, 38, 32],
    [B[0] - 81, B[1] - 66, 43, 32], [B[0] + 44, B[1] + 34, 38, 32],
    [A[0]+62,A[1]+25,20,35], [B[0]-82,B[1]+25,20,35],
    [mid[0] + 35, mid[1] - 44, 24, 28]
  ];
  h.mevziler = {};
  ['A','B'].forEach(function (site) {
    const p=h[site];
    const dis=h['t'+site], kisa=h['mid'+site], geri=h['ct'+site];
    const kapilar=[dis[dis.length-2],kisa[kisa.length-2],geri[geri.length-2]];
    h.mevziler[site]=[];
    h.engeller.filter(r=>Math.hypot(r[0]-p[0],r[1]-p[1])<120).forEach(function(r) {
      const noktalar=[[r[0]-23,r[1]+r[3]/2],[r[0]+r[2]+23,r[1]+r[3]/2],[r[0]+r[2]/2,r[1]-23],[r[0]+r[2]/2,r[1]+r[3]+23]];
      noktalar.forEach(function(k,i) { h.mevziler[site].push({konum:k,bakis:kapilar[i%kapilar.length]}); });
    });
  });
  return h;
}

const OZGUN_HARITALAR = {
  'Çöl Kalesi': ozgunHaritaOlustur('Çöl Kalesi', ['#171b21', '#a68c64', '#c4ab7c', '#6c5436'], [500,95], [500,910], [780,270], [220,270], [500,510], {
    ctA:[[500,95],[650,95],[650,210],[780,210],[780,270]], ctB:[[500,95],[350,95],[350,210],[220,210],[220,270]],
    ctMid:[[500,95],[500,300],[570,300],[570,430],[500,430],[500,510]],
    tA:[[500,910],[800,910],[880,800],[880,540],[780,540],[780,270]], tB:[[500,910],[200,910],[120,800],[120,540],[220,540],[220,270]],
    tMid:[[500,910],[500,720],[430,720],[430,590],[500,590],[500,510]],
    midA:[[500,510],[650,510],[650,350],[780,350],[780,270]], midB:[[500,510],[350,510],[350,350],[220,350],[220,270]]
  }),
  'Eski Liman': ozgunHaritaOlustur('Eski Liman', ['#101f2a', '#647c86', '#9db0b3', '#354b55'], [470,90], [520,910], [790,330], [200,230], [460,520], {
    ctA:[[470,90],[750,90],[750,210],[870,210],[870,330],[790,330]], ctB:[[470,90],[200,90],[200,230]],
    ctMid:[[470,90],[470,270],[560,270],[560,420],[460,420],[460,520]],
    tA:[[520,910],[850,910],[850,670],[790,670],[790,330]], tB:[[520,910],[170,910],[100,750],[100,450],[200,450],[200,230]],
    tMid:[[520,910],[520,740],[390,740],[390,600],[460,600],[460,520]],
    midA:[[460,520],[650,520],[650,330],[790,330]], midB:[[460,520],[320,520],[320,320],[200,320],[200,230]]
  }),
  'Bakır Vadi': ozgunHaritaOlustur('Bakır Vadi', ['#241b1b', '#946d55', '#c3936b', '#594231'], [530,90], [470,910], [780,240], [230,340], [520,530], {
    ctA:[[530,90],[780,90],[780,240]], ctB:[[530,90],[300,90],[300,200],[140,200],[140,340],[230,340]],
    ctMid:[[530,90],[530,290],[450,290],[450,430],[520,430],[520,530]],
    tA:[[470,910],[810,910],[900,730],[900,470],[780,470],[780,240]], tB:[[470,910],[180,910],[180,700],[230,700],[230,340]],
    tMid:[[470,910],[470,760],[600,760],[600,620],[520,620],[520,530]],
    midA:[[520,530],[650,530],[650,320],[780,320],[780,240]], midB:[[520,530],[370,530],[370,340],[230,340]]
  }),
  'Buz Fabrika': ozgunHaritaOlustur('Buz Fabrika', ['#14212d', '#6d8c9e', '#a1c3d2', '#3a5265'], [500,90], [500,910], [800,290], [200,290], [500,490], {
    ctA:[[500,90],[800,90],[800,290]], ctB:[[500,90],[200,90],[200,290]],
    ctMid:[[500,90],[500,230],[590,230],[590,380],[500,380],[500,490]],
    tA:[[500,910],[850,910],[850,740],[740,740],[740,560],[800,560],[800,290]],
    tB:[[500,910],[150,910],[150,740],[260,740],[260,560],[200,560],[200,290]],
    tMid:[[500,910],[500,700],[410,700],[410,580],[500,580],[500,490]],
    midA:[[500,490],[650,490],[650,290],[800,290]], midB:[[500,490],[350,490],[350,290],[200,290]]
  }),
  'Gece Çarşısı': ozgunHaritaOlustur('Gece Çarşısı', ['#211b2e', '#77708d', '#b5a1be', '#494055'], [450,90], [550,910], [760,230], [220,320], [500,540], {
    ctA:[[450,90],[610,90],[610,230],[760,230]], ctB:[[450,90],[220,90],[220,320]],
    ctMid:[[450,90],[450,280],[540,280],[540,410],[500,410],[500,540]],
    tA:[[550,910],[870,910],[870,680],[760,680],[760,230]], tB:[[550,910],[150,910],[150,590],[220,590],[220,320]],
    tMid:[[550,910],[550,760],[420,760],[420,640],[500,640],[500,540]],
    midA:[[500,540],[630,540],[630,340],[760,340],[760,230]], midB:[[500,540],[350,540],[350,400],[220,400],[220,320]]
  }),
  'Kızıl Tapınak': ozgunHaritaOlustur('Kızıl Tapınak', ['#271b22', '#936463', '#cc9390', '#603c45'], [500,90], [500,910], [770,300], [230,300], [500,500], {
    ctA:[[500,90],[660,90],[660,200],[770,200],[770,300]], ctB:[[500,90],[340,90],[340,200],[230,200],[230,300]],
    ctMid:[[500,90],[500,260],[420,260],[420,400],[500,400],[500,500]],
    tA:[[500,910],[800,910],[900,780],[900,490],[770,490],[770,300]], tB:[[500,910],[200,910],[100,780],[100,490],[230,490],[230,300]],
    tMid:[[500,910],[500,740],[580,740],[580,600],[500,600],[500,500]],
    midA:[[500,500],[630,500],[630,300],[770,300]], midB:[[500,500],[370,500],[370,300],[230,300]]
  }),
  'Çelik Kule': ozgunHaritaOlustur('Çelik Kule', ['#161f25', '#71838a', '#b4c2bd', '#3e535a'], [550,90], [450,910], [800,320], [210,230], [470,500], {
    ctA:[[550,90],[800,90],[800,320]], ctB:[[550,90],[310,90],[310,230],[210,230]],
    ctMid:[[550,90],[550,260],[620,260],[620,390],[470,390],[470,500]],
    tA:[[450,910],[850,910],[850,680],[800,680],[800,320]], tB:[[450,910],[130,910],[130,520],[210,520],[210,230]],
    tMid:[[450,910],[450,730],[550,730],[550,600],[470,600],[470,500]],
    midA:[[470,500],[660,500],[660,400],[800,400],[800,320]], midB:[[470,500],[330,500],[330,320],[210,320],[210,230]]
  })
};

function haritaNoktaAcik(h, x, y) {
  if (h.engeller.some(function (r) { return x >= r[0] && x <= r[0]+r[2] && y >= r[1] && y <= r[1]+r[3]; })) return false;
  if (h.odalar.some(function (r) { return x >= r[0] && x <= r[0]+r[2] && y >= r[1] && y <= r[1]+r[3]; })) return true;
  return h.yollar.some(function (yol) {
    for (let i = 1; i < yol.noktalar.length; i++) {
      const a = yol.noktalar[i-1], b = yol.noktalar[i];
      const dx = b[0]-a[0], dy = b[1]-a[1];
      const t = Math.max(0, Math.min(1, ((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy || 1)));
      if (Math.hypot(x-a[0]-t*dx, y-a[1]-t*dy) <= yol.genislik/2) return true;
    }
    return false;
  });
}

// Görüş ışını hem çizimde hem çatışmada aynı duvar/sandık sınırında durur.
function haritaIsinSekilleri(h) {
  if(h.isinSekilleri) return h.isinSekilleri;
  const rect=h.odalar.map(r=>[r[0],r[1],1,0,r[2],0,r[3]]), daire=[], kayit=new Set();
  h.yollar.forEach(function(yol) {
    const yaricap=yol.genislik/2;
    yol.noktalar.forEach(function(p) {
      const key=p.join(',')+','+yaricap;
      if(!kayit.has(key)){kayit.add(key);daire.push([p[0],p[1],yaricap]);}
    });
    for(let i=1;i<yol.noktalar.length;i++) {
      const a=yol.noktalar[i-1],b=yol.noktalar[i],dx=b[0]-a[0],dy=b[1]-a[1],uzun=Math.hypot(dx,dy);
      if(uzun>0)rect.push([a[0],a[1],dx/uzun,dy/uzun,uzun,-yaricap,yaricap]);
    }
  });
  h.isinSekilleri={rect:rect,daire:daire};return h.isinSekilleri;
}

function haritaIsinDikdortgen(r,x,y,dx,dy,menzil) {
  const px=(x-r[0])*r[2]+(y-r[1])*r[3],py=-(x-r[0])*r[3]+(y-r[1])*r[2];
  const ux=dx*r[2]+dy*r[3],uy=-dx*r[3]+dy*r[2];
  let giris=0,cikis=menzil;
  if(Math.abs(ux)<1e-9){if(px<0||px>r[4])return null;}
  else {const a=-px/ux,b=(r[4]-px)/ux;giris=Math.max(giris,Math.min(a,b));cikis=Math.min(cikis,Math.max(a,b));}
  if(Math.abs(uy)<1e-9){if(py<r[5]||py>r[6])return null;}
  else {const a=(r[5]-py)/uy,b=(r[6]-py)/uy;giris=Math.max(giris,Math.min(a,b));cikis=Math.min(cikis,Math.max(a,b));}
  return cikis>=giris?[giris,cikis]:null;
}

function haritaIsinMesafesi(h,x,y,aci,menzil) {
  const dx=Math.cos(aci),dy=Math.sin(aci), sekil=haritaIsinSekilleri(h), aralik=[];
  for(const r of sekil.rect){const a=haritaIsinDikdortgen(r,x,y,dx,dy,menzil);if(a)aralik.push(a);}
  for(const c of sekil.daire) {
    const px=x-c[0],py=y-c[1],b=px*dx+py*dy,ayrim=b*b-px*px-py*py+c[2]*c[2];
    if(ayrim<0)continue;
    const kok=Math.sqrt(ayrim),giris=Math.max(0,-b-kok),cikis=Math.min(menzil,-b+kok);
    if(cikis>=giris)aralik.push([giris,cikis]);
  }
  aralik.sort((a,b)=>a[0]-b[0]);
  let bitis=0;
  for(const a of aralik){if(a[0]>bitis+1e-6)break;bitis=Math.max(bitis,a[1]);}
  for(const r of h.engeller) {
    const a=haritaIsinDikdortgen([r[0]-2.5,r[1]-2.5,1,0,r[2]+5,0,r[3]+5],x,y,dx,dy,menzil);
    if(a)bitis=Math.min(bitis,a[0]);
  }
  return bitis<menzil-1e-6?Math.max(0,bitis-0.15):menzil;
}

function haritaCizimSvg(h) {
  const renk = h.tema, id = 'saha-' + HARITALAR.indexOf(h.ad);
  function sekiller(renk, kenar) {
    return h.yollar.map(function (y) { return '<polyline points="'+y.noktalar.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="'+renk+'" stroke-width="'+(y.genislik+kenar)+'" stroke-linejoin="round" stroke-linecap="round"/>'; }).join('') +
      h.odalar.map(function (r) { return '<rect x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" fill="'+renk+'" stroke="'+renk+'" stroke-width="'+kenar+'"/>'; }).join('');
  }
  let s = '<defs><pattern id="'+id+'" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#fff" stroke-opacity=".055" stroke-width="1"/></pattern><mask id="'+id+'-sol" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="black"/>'+sekiller('white',0)+h.engeller.map(r=>'<rect x="'+(r[0]-2.5)+'" y="'+(r[1]-2.5)+'" width="'+(r[2]+5)+'" height="'+(r[3]+5)+'" fill="black"/>').join('')+'</mask></defs>';
  s += '<rect width="1000" height="1000" fill="'+renk[0]+'"/>';
  s += sekiller('#070d14',14) + sekiller(renk[2],5) + sekiller(renk[1],0);
  s += '<rect width="1000" height="1000" fill="url(#'+id+')" mask="url(#'+id+'-sol)"/>';
  h.engeller.forEach(function (r) {
    s += '<rect x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" fill="'+renk[3]+'" stroke="#18212a" stroke-width="5"/><path d="M'+r[0]+' '+r[1]+'l'+r[2]+' '+r[3]+'m0 -'+r[3]+'l-'+r[2]+' '+r[3]+'" stroke="'+renk[2]+'" stroke-opacity=".4" stroke-width="2"/>';
  });
  ['A','B'].forEach(function (ad) {
    const p = h[ad];
    s += '<path d="M'+(p[0]-100)+' '+(p[1]-80)+'h200v160h-200z" fill="none" stroke="'+renk[2]+'" stroke-width="2" stroke-opacity=".4"/><text x="'+p[0]+'" y="'+(p[1]-78)+'" fill="'+renk[2]+'" text-anchor="middle" font-size="12" letter-spacing="2">BOMBA ALANI '+ad+'</text>';
    s += '<rect x="'+(p[0]-42)+'" y="'+(p[1]-35)+'" width="84" height="70" rx="8" fill="#e9b74824" stroke="#ffd278" stroke-dasharray="9 5" stroke-width="3"/><text x="'+p[0]+'" y="'+(p[1]+15)+'" text-anchor="middle" fill="#ffe1a5" font-size="44" font-weight="900">'+ad+'</text>';
  });
  [[h.ct,'CT ÜSSÜ','#82d8ff'],[h.t,'T ÜSSÜ','#ff9c8f'],[h.mid,'MID','#e3e5e8']].forEach(function (etiket) {
    const p = etiket[0];
    s += '<text x="'+p[0]+'" y="'+(p[1]+7)+'" text-anchor="middle" fill="'+etiket[2]+'" stroke="#111923" stroke-width="3" paint-order="stroke" font-size="21" font-weight="850" letter-spacing="2">'+etiket[1]+'</text>';
  });
  return s;
}
