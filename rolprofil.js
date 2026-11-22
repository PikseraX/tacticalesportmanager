// Rol GEN'inin tek kaynağı. Ana özellikler %85, diğerleri toplam %15.
const ROL_GEN_AGIRLIKLARI={
 Lider:{liderlik:30,iletisim:20,karar:20,bilgi:15},
 'Yıldız':{nisan:30,refleks:20,baski:20,sprey:15},
 Destek:{utility:30,takimoyunu:25,iletisim:20,istikrar:10},
 'Giriş':{refleks:25,nisan:25,pozisyon:20,baski:15},
 Sniper:{nisan:35,refleks:15,pozisyon:25,istikrar:10},
 Lurker:{bilgi:20,pozisyon:30,karar:20,istikrar:15},
 Anchor:{pozisyon:30,istikrar:25,utility:15,baski:15},
 Taktisyen:{bilgi:30,karar:25,iletisim:15,takimoyunu:15}
};
function rolOzellikAgirliklari(rol){
 const ana=ROL_GEN_AGIRLIKLARI[rol];
 if(!ana)return Object.fromEntries(OZELLIKLER.map(z=>[z,1/OZELLIKLER.length]));
 return Object.fromEntries(OZELLIKLER.map(z=>[z,ana[z]?ana[z]/100:rol==='Destek'?(z==='nisan'?.01:.02):.15/8]));
}
function rolGenelPuani(o,rol){const w=rolOzellikAgirliklari(rol);return Math.round(OZELLIKLER.reduce((s,z)=>s+o[z]*w[z],0)+1e-9);}
function rolProfiliUret(o,hedef,rng){
 const r=rng||Math.random,ana=ROL_GEN_AGIRLIKLARI[o.rol];
 const h=Math.max(1,Math.min(99,hedef+(r()*6-3)));
 const cokYonlu=r()<.20;
 OZELLIKLER.forEach(z=>{
   // Uzmanlarda da ana rol dışı güçlü özellikler olabilir; az sayıda geniş profilli oyuncu bulunur.
   const fark=ana?.[z]?3+r()*8:cokYonlu?-5+r()*11:r()<.30?-3+r()*12:-10-r()*16;
   o[z]=Math.max(1,Math.min(99,Math.round(h+fark)));
 });
 // Profil farklarını koruyarak ana rol GEN'ini hedef seviyeye yaklaştır.
 for(let n=0;n<5;n++){const fark=Math.round(h)-rolGenelPuani(o,o.rol);if(!fark)break;OZELLIKLER.forEach(z=>o[z]=Math.max(1,Math.min(99,o[z]+fark)));}
 o.genel=rolGenelPuani(o,o.rol);o.uretimRolu=o.rol;return o;
}
function rolGenSurumunuGuncelle(){
 if(kariyer.rolGenSurum===1)return;
 const oyuncular=tumKadro().concat(kariyer.serbest||[],kariyer.akademi||[],kariyer.adaylar||[],dunya.flatMap(t=>t.oyuncular));
 oyuncular.forEach(genelHesapla);kariyer.rolGenSurum=1;kaydet();
}
