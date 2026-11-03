const KARIYER_REHBER_ADIMLARI = [
  {ad:"Kadronu tanı", metin:"Takım menüsünde ilk 5, roller ve kimyayı incele. İyi rol uyumu ve birlikte geçirilen haftalar maç gücünü artırır.", ekran:"kadro"},
  {ad:"Gelişimi planla", metin:"Her oyuncunun antrenman odağını seçebilirsin. Hafif, Normal veya Yoğun çalışma planını seç; yoğun çalışmanın ek yorgunluk bedelini ve kişilikleri incele.", ekran:"antrenman"},
  {ad:"İlk maçına hazırlan", metin:"Ana ekrandan Maç Hazırlığına Geç. Analist raporunu incele, harita yasakla ve hazırlık planını seç. Spiker Anlatımı ya da Hızlı Maç modunda taktiğinle başla. Hızlı mod rehberi atlayınca da açılır.", ekran:"ana"},
  {ad:"Kulübünü sürdürülebilir yönet", metin:"Haftayı bitirince özette bütçeni, oyuncu gelişimini ve sözleşmeleri gör. İzleme listesi, sponsorlar, scout görevleri ve isteğe bağlı sezon hedefleri menülerde. Kayıt yedeğini dosyaya aktar; bütün rehberlere Ana Menü düğmesinin altındaki Rehber’den ulaş.", ekran:"ozet"}
];
function rehberBaslat() {
  if (!kariyer) return;
  kariyer.rehber = {durum:"aktif",adim:0}; kaydet(); rehberAdimEkrani();
}
function rehberAtla() {
  if (!kariyer) return;
  kariyer.rehber = {durum:"atlandi",adim:0}; kaydet(); rehberPanelGuncelle();
}
function rehberSonraki() {
  const r = kariyer && kariyer.rehber;
  if (!r || r.durum !== "aktif") return;
  if (r.adim >= KARIYER_REHBER_ADIMLARI.length-1) {
    r.durum = "tamamlandi"; kaydet(); rehberPanelGuncelle(); kariyerEkrani(); return;
  }
  r.adim++; kaydet(); rehberAdimEkrani();
}
function rehberAdimEkrani() {
  const r = kariyer.rehber, adim=KARIYER_REHBER_ADIMLARI[r.adim];
  if (!adim) { rehberAtla(); return; }
  if (adim.ekran === "kadro") kadroEkrani();
  else if (adim.ekran === "antrenman") odakEkrani();
  else if (adim.ekran === "ozet") haftalikOzetEkrani();
  else kariyerEkrani();
  rehberPanelGuncelle();
}
function rehberPanelGuncelle() {
  let panel = document.getElementById("rehber-panel");
  const r = kariyer && kariyer.rehber;
  if (!r || !["teklif","aktif"].includes(r.durum) || !document.querySelector("#uygulama .geri, #uygulama .hero")) {
    if(panel) panel.remove(); return;
  }
  if (!panel) { panel=document.createElement("section"); panel.id="rehber-panel"; panel.className="rehber-panel"; document.body.insertBefore(panel,uygulama); }
  if (r.durum === "teklif") {
    panel.innerHTML = '<small>KARİYER REHBERİ · İSTEĞE BAĞLI</small><h3>Menajer koltuğuna hoş geldin.</h3><p>Dört kısa adımda kadro, antrenman ve maç hazırlığını tanı. İstediğin an atlayabilirsin.</p><div><button class="buton" onclick="rehberBaslat()">Rehbere Başla</button><button class="buton ikincil" onclick="rehberAtla()">Atla</button></div>';
  } else {
    const a = KARIYER_REHBER_ADIMLARI[r.adim];
    if (!a) { panel.remove(); return; }
    panel.innerHTML='<small>KARİYER REHBERİ · '+(r.adim+1)+'/4</small><h3>'+a.ad+'</h3><p>'+a.metin+'</p><div><button class="buton" onclick="rehberSonraki()">'+(r.adim===3?'Rehberi Bitir':'Sonraki')+'</button><button class="buton ikincil" onclick="rehberAtla()">Atla</button></div>';
  }
}
new MutationObserver(rehberPanelGuncelle).observe(uygulama,{childList:true});

function oyunRehberKonulari(){return [
 {id:'mac',ad:'Maç Yönetimi',acik:'Ban, taktik, hazırlık planları ve spiker',bolumler:[
 ['Harita yasaklama','Analist seviyesine göre rakip bilgisi açılır. Lig maçında tek harita, turnuvada BO3 oynanır. Harita bonusları maç hesabında etkilidir; canlı yayında hareketli harita yerine yazılı spiker anlatımı vardır.'],
 ['Strateji, taktik ve plan farklıdır','Kulüp stratejisi kalıcı rol dağılımını belirler. Maç taktiği yalnız maç kadrosuna uygulanır. Hazırlık planı harita başına seçilir ve maç başlayınca kilitlenir.'],
 ...Object.values(MAC_HAZIRLIK_PLANLARI).map(x=>[x.ad,x.acik]),
 ['Taktik üstünlüğü','Agresif, Dengeli’ye; Dengeli, Temkinli’ye; Temkinli, Agresif’e karşı üstündür. Rol uyumu, form, harita ve analist de etkilidir; hiçbir seçim kazanmayı garanti etmez.'],
 ['Spiker Anlatımı','Anlatım gerçek raund olaylarını gösterir. 1×, 2× ve 4× hızları görecelidir. Kill alan oyuncu görüş/konum şartı olmadan hayatta kalanlardan seçilir; nişan ve refleks sınırlı avantaj sağlar. İstatistik panelini açabilir veya mola alabilirsin.'],
 ['Hızlı Maç','Rehberi tamamlayınca, Atla dediğinde veya ilk maçtan sonra açılır. Eski rehbersiz kayıtta da kullanılabilir. İlk 12 raund sonunda durur: taktik, oyuncu değişikliği ve bir devre molası kararı ver. İkinci yarı taktiğine basınca devam eder. BO3’te her harita ayrı yönetilir. Uzatma sürerse güvenlik sınırında canlı anlatıma döner.'],
 ['Mola ve kayıt','Mola kalan hakkından düşer, kayıp serisini sıfırlar ve sonraki '+MOLA_TUR+' raunda +'+MOLA_BONUSU+' güç verir. Maçın ve devre kararların kaydedilir. Uygulamayı aniden kapatmak yerine arka plana alarak kayıt fırsatı ver.']
 ]},
 {id:'gelisim',ad:'Antrenman ve Kişilikler',acik:'Yoğunluk, yaş, mentor ve yedek beklentisi',bolumler:[
 ['Gelişim odağı','Takım > Antrenman Odağı’nda oyuncu başına bir özellik seç. İlk 5 ve yedekler antrenman yapar. Gençler daha hızlı gelişir; 30 yaşından itibaren gerileme ihtimali vardır.'],
 ...Object.values(ANTRENMAN_YOGUNLUKLARI).map(x=>[x.ad+' çalışma',x.acik]),
 ['Hafta kapanışı','Yoğunluk gelişim ve yorgunluğa birlikte, Haftayı Bitir dediğinde uygulanır. Yaşa bağlı gerileme ve potansiyel sınırı korunur; akademi ve harita antrenmanı bu yoğunluktan ayrı çalışır. Haftalık Özet, GEN sabit kalsa bile özellik değişimlerini gösterir.'],
 ...Object.values(KISILIKLER).map(x=>[x.ad,x.acik])
 ]},
 {id:'scout',ad:'Akademi ve Scout',acik:'Görevler, kapasite ve potansiyel',bolumler:[
 ['Önce görev','Scout işe alındığında veya seviyesi yükseldiğinde otomatik aday gelmez. Bir bölgeye gönder; görev bitince 1–2 aday döner. Bölge ekranındaki süreyi ve ücreti kontrol et.'],
 ['Seviye ve kapasite','Scout 1/2/3 seviyede akademi kapasiten 2/4/6 oyuncudur. Adayın 80 ve üzeri potansiyelle gelme şansı sırasıyla %5/%10/%15’tir. Potansiyel gelecekte ulaşabileceği sınırdır; mevcut GEN değildir.'],
 ['Aday seçimi','Potansiyel tahmini kesin değer değildir. Rol, yaş, mevcut GEN ve masrafı birlikte değerlendir. Dolu akademiye yeni imza atamazsın; önce birini yükselt veya serbest bırak.'],
 ['A takıma geçiş','Akademi oyuncusunu önce boş yedek yerine yükselt, sonra kadro rotasyonunu düzenle. Güçlü aday bulmak hemen güçlü ilk 5 elde etmek anlamına gelmez.']
 ]},
 {id:'transfer',ad:'Transfer ve İzleme Listesi',acik:'Pazarlık, karşılaştırma ve sözleşmeler',bolumler:[
 ['Pazarlık akışı','Transfer Piyasası’nda 30 oyuncu bulunur. GEN sıralamasında bir rol seçersen tüm adaylar o roldeki GEN’leriyle yüksekten düşüğe gösterilir; özellikleri ve mevcut rolleri değişmez. Önce kulüple bonservis, sonra oyuncuyla maaş, imza parası ve süreyi görüş. Para ve kadro yalnız son imzada değişir. Taraf başına haftada 3 teklif hakkı vardır.'],
 ['Toplam maliyet','Bonservisin yanında imza parasını ve haftalık maaşı hesapla. İlk 5’ten birinin yerine alırsan çıkacak oyuncunun satış geliri net bedeli etkiler. Satıştan sonra beş kişilik kadronu korumalısın.'],
 ['İzleme listesi','Oyuncu detayından en fazla 20 hedef takip et. Kadronla yaş, rol, GEN, maaş ve 12 özelliği karşılaştır. Piyasadan çıkan oyuncunun son bilinen verisi korunur, fakat buradan transfer başlatılamaz.'],
 ['Sözleşme uyarıları','Kendi kadro oyuncularını da takip edebilirsin. Sözleşmesi yaklaşınca bildirim alırsın; dış oyuncuların bilinmeyen bitiş tarihleri gösterilmez. Süresi dolan sözleşme ek maliyet ve ayrılma riski taşır. Yenileme ücretini ve haftalık maaşı onay ekranında incele.']
 ]},
 {id:'kulup',ad:'Kulüp ve Ekonomi',acik:'Sponsor, personel, moral ve kimya',bolumler:[
 ['Bütçeyi takip et','Finans ekranında maaş, personel, akademi ve diğer giderleri sponsor gelirleriyle karşılaştır. Transfer için para ayırırken gelecek haftaların giderlerini de bırak. Eksi bütçeye haftalık faiz işler.'],
 ['Sponsorlar','Anlaşmanın haftalık gelirini, süresini ve bonus hedefini incele. Bonus her koşulda garanti değildir; anlaşmadaki hedefi tamamlamalısın.'],
 ['Personel','Koç gelişime, fizyoterapist toparlanma ve moral kaybına, analist rakip istihbaratı ve maç hazırlığına yardım eder. Seviye artırmanın ilk maliyeti ve haftalık gideri vardır.'],
 ['Kimya, moral ve yorgunluk','Birlikte çalışan kadro kimya kazanır; yeni transfer uyum için zaman ister. Yorgunluk ve düşük moral maç performansını düşürür. Yoğun fikstürde rotasyon ve hafif çalışma düşün.'],
 ['Taraftar ve itibar','Sonuçlar, transferler ve basın seçimleri taraftarları etkiler. Taraftar/sponsor etkisini ilgili ekrandan takip et; yalnız GEN’e yatırım yapmak bütün kulüp sorunlarını çözmez.']
 ]},
 {id:'kariyer',ad:'Sezon, Hedefler ve Tarihçe',acik:'Yükselme, rozetler ve rekabetler',bolumler:[
 ['Sezon takvimi','Lig ve turnuva haftalarını ana ekrandan takip et. Gerekli maç tamamlanmadan hafta ilerlemez. Sezon sonunda sıralama, ödüller ve yükselme/düşme değerlendirilir.'],
 ['İsteğe bağlı hedefler','Sezon başına bir hedef seçebilirsin; seçim o sezon değişmez. Başarı yalnız tarihçe rozeti verir; başarısızlık cezası veya para/güç ödülü yoktur. Bütçe hedefi sezon ödüllerinden önce değerlendirilir. Akademi hedefi seçimden sonraki yükseltmeyi sayar; genç gelişimi hedefi oyuncuyu sezon sonuna kadar kadroda tutmayı gerektirir.'],
 ['Kulüp tarihçesi','Kupalar, yükselmeler, maç/seri rekorları ve kaydı tutulmuş kulüp efsaneleri burada bulunur. Önceki sürümde saklanmamış maçlar veya ayrılan oyuncular geriye dönük üretilmez.'],
 ['Rekabetler','Lig ve Turnuva > Rekabetler’de geçmişi incele. En az 3 karşılaşma ve 2 yakın sonuç çekişmeli rekabet oluşturur. Lig maçında en fazla 3 raund fark, BO3’te 2–1 yakın sonuçtur. Rekabet hikâye katar; güç veya para bonusu vermez.']
 ]},
 {id:'kayit',ad:'Kayıt, Yedek ve Geri Bildirim',acik:'Kariyerini koru ve sorun bildir',bolumler:[
 ['Kayıt yedeği','Ana Menü veya Kulüp > Kayıt Yedeği’nden kariyeri JSON dosyasına aktar. Dosyayı telefon dışında da sakla. Cihazdaki otomatik kayıt, uygulama verileri silinirse kaybolabilir.'],
 ['Geri yükleme','Dosyayı seç, kulüp/sezon/bütçe önizlemesini kontrol et ve Geri Yükle’ye bas. Vazgeçersen kariyer değişmez. Yükleme öncesi kayıt cihazda ayrıca tutulur; ilgili düğmeyle geri dönebilirsin. Yedek, devam eden maç ve izleme listesini de içerir.'],
 ['Geri bildirim','Ana ekrandaki Geri Bildirim bölümünde konu seçip mesajını oyun içinde yaz. Gönder, e-posta uygulamasını hazır mesajla açar; son gönderimi oradan sen yaparsın. Sorunu bildirirken sezonu, ekranı ve nasıl tekrarladığını belirt.']
 ]}
];}
function rehberMenu(){
  sonHub=null;
  let h='<button class="geri" onclick="kariyerEkrani()">← Oyun Menüsü</button><h2>Rehber</h2><p>Oyunun bütün rehberleri burada. Bir konuyu açabilir veya isteğe bağlı kariyer turunu yeniden başlatabilirsin.</p>';
  h+=menuSatiri('Kariyere İlk Adım','Dört adımlık tur · istediğin an Atla','rehberBaslat()');
  h+=menuSatiri('Rol Rehberi','Rol özellikleri, yeşil eşik ve GEN hesabı','rolRehberi()');
  h+=menuSatiri('Strateji Rehberi','Kalıcı rol dağılımı ve takım uyumu','stratejiRehberi()');
  oyunRehberKonulari().forEach(x=>{h+=menuSatiri(x.ad,x.acik,"rehberKonuAc('"+x.id+"')");});
  uygulama.innerHTML=h;
}
function rehberKonuAc(id){
  const konu=oyunRehberKonulari().find(x=>x.id===id);if(!konu){rehberMenu();return;}
  sonHub=null;
  uygulama.innerHTML='<button class="geri" onclick="rehberMenu()">← Rehber</button><h2>'+oyunYazisi(konu.ad)+'</h2>'+konu.bolumler.map(([ad,metin])=>'<section class="gelisim-kart"><h3>'+oyunYazisi(ad)+'</h3><p>'+oyunYazisi(metin)+'</p></section>').join('');
}
