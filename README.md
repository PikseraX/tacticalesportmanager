# Tactical Esports Manager

## Expo EAS ile Android çıktısı

EAS, projenin mevcut Capacitor Android kaynaklarını derler. Bulut derlemesi web dosyalarını Android paketine kopyalar ve Java 21'i hazırlar.

İlk kullanımda proje kökünde Expo hesabına giriş yap ve projeyi bağla. Daha önce Expo'da bir proje oluşturduysan `eas init --id <proje-id>` ile var olan projeyi bağla.

```sh
npx eas-cli@latest login
npx eas-cli@latest init
```

- Telefona kurulabilir test APK'sı ve AdMob test reklamları için `npx eas-cli@latest build --platform android --profile preview`.
- Google Play için AAB almak üzere `npx eas-cli@latest build --platform android --profile production`. Mevcut mağaza kaydını güncelliyorsan EAS imza ayarlarında o kaydın yükleme anahtarını kullan ve `android/app/build.gradle` içindeki `versionCode` değerini son yüklenen sürümün üzerine çıkar.

## App Store ve TestFlight için iOS çıktısı

iOS 15 ve üzeri için Capacitor Xcode projesi, iPhone ve iPad hedefleri ve Swift Package Manager kullanılır. EAS, `app-store` profilinde Xcode 26.6 ile imzalı dağıtım IPA'sı üretir.

Expo projesini ilk kez bağlayacaksan `eas init` çalıştır. Apple Developer takımında `pikserax.tacticalesportsmanager` Bundle ID'sini kullan. Mevcut bir App Store Connect kaydı varsa o kaydın Bundle ID'si hem `app.json` hem Xcode hedefiyle eşleşmeli.

```sh
eas build --platform ios --profile app-store
```

İlk EAS derlemesinde Apple Developer takımını seçip dağıtım sertifikasını ve provisioning profilini yapılandır. App Store Connect kaydını hazırladıktan sonra IPA'yı Transporter ile ya da `eas submit --platform ios` komutuyla yükleyebilirsin. Sonraki yüklemelerde Xcode hedefindeki `CURRENT_PROJECT_VERSION` değerini artır.

Mac'te yerel deneme için `npm ci`, `npm run ios:sync` ve `npm run ios:open` komutlarını kullan. iOS sürümünde reklam ve Google Play satın alma seçenekleri kapalıdır. Kayıt yedeklemesi web dosya akışını kullanır ve TestFlight'ta cihaz üzerinde doğrulanmalıdır.

## Android Studio

Android Studio'da `android/` klasörünü aç. Web oyun dosyalarını Android paketine aktarıp Gradle projesini eşitlemek için proje kökünde:

```sh
npm ci
npm run android:sync
```

Mağaza dağıtımında çıktı türü **Android App Bundle (`.aab`)** olacak. Android Studio'da **Build → Generate Signed Bundle / APK → Android App Bundle** yolunu kullan.

## AdMob

Alt banner Android tarafında oyun alanından ayrıdır. Debug Google test birimlerini, release canlı birimleri kullanır.
Banner açılışta onay kontrolüyle yüklenir; ağ ve reklam doluluğuna bağlı olarak hazır olduğunda gösterilir. Her oyun açılışında ilk geçiş: ilk maç/turnuva serisi bitişi VEYA 8 dakika (hangisi önceyse). Sonraki geçişler: 3 maç VE son gösterimden 8 dakika. Zaman dolduğunda maç yoksa otomatik gösterilir; canlı maç, devre arası, haritalar arası ve harita yasaklamada ertelenir. Arka planda ve metin girişi sırasında açılmaz. Her gösterimden önce 2 saniye Teknik Mola ekranı gelir. Reklam hazır değilse oyun devam eder, saniyede bir hazır olma durumu kontrol edilir (yükleme hatasında 15 saniye ağ beklemesi). İlk reklam sayacı her açılışta yeniden başlar ve yalnızca gerçek gösterim sonrası sıfırlanır.
AdMob > Gizlilik ve mesajlaşma bölümünde gerekli mesajları oluşturup yayımlayın. UMP her açılışta çalışır; gerektiğinde reklam gizlilik tercihleri bağlantısı gösterilir.
Kontrol: node scripts/ad-policy-test.js; npm run android:sync; JDK 21 ile Android derlemesi.

## Kariyer sistemleri

1. Takım > Takım Kimyası: oyuncu çiftlerinin birlikte çalışması, haftalık +4 (0–100); maç gücüne -2 .. +3. Mevcut kadrolar nötr 40 kimyayla başlar.
2. Maç hazırlığı: analist seviye 1 strateji/yıldız/güçlü harita, seviye 2 harita tablosu, seviye 3 karşı taktik önerisi.
3. Transfer: kulüp bonservisi ve oyuncu maaş/imza/süre pazarlığı. Taraf başına haftada 3 teklif; yalnız son imzada ücret ve kadro değişir. Sözleşme 13/26/52 hafta olabilir.
4. Akademi > Scout’u Bölgeye Gönder: bölgesel rol havuzları, 2–4 haftalık görev. Görevsiz/işe alım/yükseltmeyle aday verilmez; tamamlanan görev 1–2 aday getirir. Scout 1/2/3 için akademi kapasitesi 2/4/6; 80+ potansiyel olasılığı %5/%10/%15. İmzalanmış eski akademi oyuncuları korunur. Potansiyel tahmini scout seviyesine bağlıdır.
5. Kulüp > Taraftar ve İtibar: maç, transfer ve basın etkileri. Taraftar sponsor katsayısı 0.95–1.05; mevcut sponsor anlaşmaları sabittir.
6. Ana ekran / Kulüp > Haftalık Özet: bütçe, gelişim, sözleşme, sonraki program; son 8 rapor saklanır.
7. Yeni kariyerde isteğe bağlı rehber teklifi. Her adımda Atla; tekrar açmak için Oyun Menüsü > Rehber > Kariyere İlk Adım. Eski kayıtlar otomatik rehbere zorlanmaz.

Doğrulama: npm run career:test, node scripts/ad-policy-test.js, npm run economy:simulate ve Android debug derlemesi.

## Maç kaydı ve hata düzeltmeleri

Canlı maçlar her raund sonunda, taktik/mola/oyuncu değişiminde ve uygulama arka plana geçerken kaydedilir. Skor, raund planı, oyuncu kimlikleri, devre/mola durumu ve BO3 harita geçmişi ortak başvuruları koruyan bir kayıtla saklanır. Kariyere devam edildiğinde Devam Eden Maç ekranı gösterilir. Tamamlanan maç/seri kaydı temizlenir; sonuç ve istatistikler bir kez işlenir. İşletim sistemi kaydetme olayı olmadan uygulamayı aniden sonlandırırsa son tamamlanan raunddan devam edilir.

Maç taktiği kalıcı kadro rollerini değiştirmez. Turnuvada galibiyet/mağlubiyet seri başına, oyuncu istatistikleri haritaların toplamından seri başına bir kez işlenir. Uzatmada hızlı simülasyon sınırına gelinirse yanlış sonuç yerine normal maç akışı sürdürülür. Sponsor bonus hakları ekran temizliğinden bağımsızdır ve iki kez ödenmez. Hazırlıktan Geri reklam engelini temizler. Bütün oyuncu havuzları isim üretiminde dikkate alınır. Denge Laboratuvarı kaldırılmıştır.

Denetim regresyonları: npm run audit:test.

## Denge ölçümleri

Gerçek oyun motoruyla uzun dönem tarama: npm run balance:study -- --runs 60 --seasons 8 --out reports/balance/balance-final.json. Rahat, Dengeli ve Planlı yönetim politikaları; gerçek maç olasılığı, raundlar, maaşlar, transfer pazarlığı, sponsorlar, haftalar ve sezon geçişleri kullanılır. Görsel animasyon, reklam bekleme süreleri ve disk kayıt maliyeti ölçüm dışındadır. Oyuncu tutma davranışı için gerçek oyuncu oturumlarıyla ek değerlendirme gerekir.

Bağımsız maç/gelişim kontrolü: npm run balance:controls. Hata koruma: npm run balance:test. Önceki economy:simulate ve match:simulate komutları basitleştirilmiş eski varsayım modelleridir; güncel denge kararları balance:study ve balance:controls sonuçlarına dayanır.

Güncel ayarlar: 24 yaş altı odak gelişimi %55, diğer özellikler %11; yeşil rol etkileri -2/-1/0/+1/+2. Mağlubiyet moral kaybı fizyoterapiste göre 4/3/2/2, haftalık ilk 5 morali 70’e 2 puan yaklaşır. Sözleşme yenilemesinde %15 artışın üst sınırı güncel piyasa maaşının %120’sidir; aşırı şişmiş eski ücretlerde yenileme ücreti de bu tabana göre sınırlandırılır. Scout, akademi kapasitesi ve reklam sıklığı kullanıcı kararlarıyla aynı kalır.

## Kulüp hikâyesi ve kayıt yedeği

Ana Menü veya Kulüp > Kayıt Yedeği: sürümlü TEM JSON dışa/içe aktarma. Android CareerBackup eklentisi Storage Access Framework kullanır; genel depolama izni istemez. Büyük JSON, activity Bundle içine konmaz: dışa aktarma sırasında özel geçici dosyada saklanır. Dosya doğrulama ve önizleme tamamlandıktan sonra kullanıcı geri yükler. Önceki kayıt yerelde ayrı anahtarda korunur; geri dönme düğmesi vardır. Yapı/oyuncu/lig/sezon/maç grafiği doğrulanır, tehlikeli alanlar ve desteklenmeyen HTML reddedilir. Sınır 8 MB. Harici dosya telefon dışında da saklanmalıdır.

Haftalık Özet artık GEN sabitken değişen özellikleri, kimya/taraftar/itibarın önce-sonra değerlerini gösterir. Eski özetler de açılır. İsteğe bağlı sezon hedefleri bir kez seçilir; sezon kapanışında değerlendirilir ve yalnız tarihçe rozeti verir. Para, güç veya başarısızlık cezası yoktur. Bütçe hedefi sezon sonu ödüllerinden önce değerlendirilir.

Kulüp Tarihçesi kupaları, yükselmeleri, yeni maç/seri fark rekorlarını ve ayrılan oyuncuların korunmuş istatistiklerini gösterir. Önceki sürümlerin saklamadığı ayrılmış oyuncu/maç bilgisi geriye dönük oluşturulmaz. Mağlubiyetlerde en fazla iki gözlenen koşul ve öneri gösterilir; kesin nedensellik iddiası yoktur. BO3 devam ederken menü yönlendirmeleri gösterilmez.

Otomatik doğrulama: npm run club:test. Elle test: reports/kulup-ozellikleri-test.md.

## Transfer takibi ve antrenman yoğunluğu

Transfer > İzleme Listesi: piyasadaki oyuncu detayından takip, kendi kadrosundan sözleşme takibi, 12 özellik/GEN/maaş/yaş/rol karşılaştırması. Oyuncu kimliği satın alma ve kayıt yüklemede korunur. Piyasa dışına çıkan hedefin son bilinen bilgisi saklanır, artık mevcut değilse transfer başlatılmaz. Liste sınırı 20. Gerçek sözleşme uyarıları kendi kadrosunda kalan takip oyuncuları içindir; dış oyuncular için bilinmeyen bitiş tarihi üretilmez.

Takım > Antrenman Yoğunluğu: Hafif (gelişim x0,75, haftalık yorgunluk farkı -4), Normal (eski davranış), Yoğun (dinçken gelişim x1,20, haftalık yorgunluk farkı +8). Yoğun çalışma çarpanı, yorgunluk 40 üstünde azalarak en az x0,60 olur. Yorgunluk ilk 5 ve yedeklerin mevcut toparlanma hesabına eklenir. Akademi, harita gelişimi, yaş gerilemesi ve potansiyel sınırı aynı kalır. Seçim hafta kapanışında uygulanır ve özette yazılır.

Doğrulama: npm run planning:test. Gerçek antrenman/form işlevleriyle 4.800 kadro sezonu: npm run training:study. Sonuç ve elle test adımları: reports/planning/test-adimlari.md.

## Maç derinliği

Maç Öncesi ekranında harita başına Standart, Güvenli başlangıç, Utility odaklı oyun veya Yıldızı baskıla planı seçilir. Plan mevcut taktikten ayrıdır, başlangıçta kilitlenir ve canliP'ye -3..+3 koşullu güç etkisi verir. Eski maç kayıtlarında alan yoksa Standart kullanılır.

Takım > Oyuncu Kişilikleri: sabit ve kayıtlı Dengeli, Mentor, Büyük maç oyuncusu, Sabırsız. Atama oyun RNG'sini tüketmez. 27+ ilk 5 Mentor, 24 yaş altı kadroya en fazla %5 antrenman desteği verir; birikmez. Büyük maç oyuncusu turnuva yarı final/finalinde veya son dört lig maçında ilk üçteki takımların karşılaşmasında bireysel +1 güç verir. Sabırsız yedek üç hafta maça çıkmazsa ek -1 moral; ek etki 40 altına indirmez. Giren yedeklerin son oynadığı hafta kalıcı kaynak oyuncuda tutulur.

Lig ve Turnuva > Rekabetler: lig sonuçları ve BO3 serileri bir kez kaydedilir, son 6 karşılaşma saklanır. En az 3 maç ve 2 yakın sonuç Çekişmeli Rekabet etiketi oluşturur. Maç öncesi, maç sonu ve haftalık özette görünür; güç/para etkisi yoktur.

Maç Öncesi > Hızlı Maç: rehber tamamlanınca/atlanınca, ilk maç sonrasında veya rehber alanı olmayan eski kayıtta açılır. Aynı raund motoruyla ilk 12 raund simüle edilir; devrede taktik, yedek ve bir mola kararı verilir. İkinci yarı taktiği seçilince maç devam eder. BO3 haritaları ayrı yönetilir. Uzatma güvenlik sınırında canlı akışa dönülür, beraberlik sonuç yazılmaz. Kayıt grafiği planı ve modu saklar. Grafik ekran tanımları macgorsel.js içinde eski render işlevlerini geçersiz kıldığından yeni kontroller ve önceki mağlubiyet değerlendirmesi aktif grafik ekranlarına da bağlandı.

Test: npm run depth:test. Gerçek maç motorunda 12.000 harita: npm run depth:study. Elle test ve ölçüm: reports/match-depth/test-adimlari.md.

## Canlı spiker yayını

Canlı izleme artık spiker.js üzerinden yazılı anlatım kullanır. Hareketli harita, görüş konileri ve görsel navigasyon canlı yayın akışından çıkarıldı. Harita seçimi, taktik ve harita etkileri maç kurallarında korunur. Anlatım gerçek raund olaylarını sırayla işler; ek RNG tüketmez. 1×/2×/4× hız, mola, devreye atlama, oyuncu istatistikleri ve BO3 korunur. Son 40 anlatım mesajı ve ara olay indeksi maç grafiğinde kaydedilir. Mola ve devre sırasında anlatım durur. Bu sürüm yazılı spiker yayınıdır; ses sentezi içermez.

Doğrulama: npm run commentary:test, npm run depth:test, npm run audit:test ve ad-policy-test.js. Android derlemesi geçti; canlı anlatım ve mola ekranları emülatörde 411 CSS pikselde taşma olmadan doğrulandı. Asıl kariyer geri getirildi.

## Konumdan bağımsız kill dağılımı

Spiker ve hızlı maç raund planlayıcısında hedef bölgeye en yakın oyuncuyu seçme kuralı kaldırıldı. Aktif akış oyuncu konumu veya görüş kontrolü kullanmaz. Kill alan, hayatta kalanlardan sınırlı nişan/refleks ağırlığıyla seçilir (ağırlık 0,755–1,25); kurban hayatta kalan karşı taraftan eşit olasılıkla seçilir. Eşit beceride oyuncular eşit şanslıdır, tek bir raundda çoklu kill yine mümkündür. Maçın raund kazanma olasılığı formülü aynı kaldı. Eski tamamlanmış istatistikler ve devam eden raundun önceden kaydedilmiş olayları yeniden dağıtılmaz; yeni raundlar yeni seçimi kullanır.

node scripts/kill-distribution-test.js: 12.000 raund, eşit oyuncularda kill payı %19,96 / %20,27 / %19,87 / %20,04 / %19,86. Hayatta kalma, tekrar ölüm engeli ve koordinatlar değiştiğinde aynı tohumda aynı olay dağılımı kontrol edildi. Commentary, depth ve audit regresyonları geçti.

## Birleşik rehber merkezi

Kariyer ekranındaki Ana Menü düğmesinin hemen altında Rehber bulunur. Takım ve Kulüp menülerindeki dağınık rehber bağlantıları taşındı. Merkezde Kariyere İlk Adım (isteğe bağlı, Atla korunur), Rol Rehberi, Strateji Rehberi ve yedi konu vardır: Maç Yönetimi; Antrenman ve Kişilikler; Akademi ve Scout; Transfer ve İzleme Listesi; Kulüp ve Ekonomi; Sezon/Hedefler/Tarihçe; Kayıt/Yedek/Geri Bildirim. Rol ve strateji rehberlerinin dönüşü merkezedir. Maç içindeki ilgili konu önerileri merkezdeki aynı rehberleri açar.

Metinler güncel yazılı spiker, konumdan bağımsız kill dağılımı, hızlı maç, hazırlık planı, yoğunluk, kişilik, scout 2/4/6 kapasite ve %5/%10/%15 potansiyel kurallarıyla güncellendi. Hazırlık planı ve kişilik açıklamaları ilgili oyun tanımlarından alınır. Rehber okumak kariyer verisini değiştirmez.

Doğrulama: npm run guides:test; career:test ve depth:test; Android debug derlemesi. Android'de rehber merkezi, maç, scout ve rol sayfaları 411 CSS piksel genişlikte taşma olmadan doğrulandı. Test kariyeri kapatılıp asıl kariyer geri getirildi. Ekran görüntüleri reports/guides/ui içinde.

## Rol GEN ve uzmanlaşmış üretim

GEN hesabının tek kaynağı rolprofil.js. Ana rol özellikleri %85, diğerleri %15; Destek nişanı %1. Kart, antrenman ve otomatik rol ataması aynı hesabı kullanır. Yeni oyuncular güçlü/zayıf özellik profilleriyle üretilir; hedef ana rol GEN'i korunur. Mevcut kayıtların özellikleri değiştirilmez, GEN tek seferlik yeniden hesaplanır. Detay: reports/roles/inceleme.md. Test: npm run roles:test.

## Stratejiye göre ilk 5 seçimi

Stratejiye tıklamak mevcut beş oyuncuyu korur, o beşlinin rollerini seçilen düzene uyarlar. İlk 5’i Stratejiye Göre Değiştir düğmesi ise ilk 5 + yedeklerin tümünden, seçili stratejinin beş rolünde toplam GEN'i en yüksek yapan oyuncu/rol eşleşmesini seçer. Dinamik programlama her oyuncuyu en fazla bir kez kullanır; aynı rolden iki tane isteyen düzenleri de destekler. Eşit toplam GEN'de mevcut ilk 5'ten daha çok oyuncuyu korur. Onayda isim/rol/GEN ve ortalama gösterilir; dışarıda kalanlar yedeğe geçer, kimse satılmaz. Maaşta ilk 5/yedek farkı haftalık gideri etkileyebilir. Seçim GEN'i optimize eder; moral/yorgunluk/kimya ayrı etkilerdir. Devam eden maçta uygulanmaz.

Doğrulama: npm run lineup:test. Güçlü iki yedek Sniper, strateji seçiminde oyuncuların korunması, iptal, kadro kaybı/tekrarı olmaması, kayıt yükleme, 20 farklı kadroda bağımsız kombinasyon-permütasyon taramasıyla optimum eşitliği ve eşitlikte ilk 5'in korunması geçti. Career/depth testleri ve Android derlemesi başarılı; sürüm emülatöre yüklendi.

## 30 kişilik piyasa ve rol bazlı değerlendirme

Piyasa 30 oyuncuda tutulur; eski 10 kişilik kayıtlar açıldığında mevcut adaylar korunup eksikler tamamlanır. Alım, satış ve sözleşme ayrılmaları da aynı sınırı kullanır. Kapasite temizliğinde aktif pazarlık oyuncusu korunur. İsimler mevcut havuzları dikkate alan üreticiden gelir.

Transfer ekranındaki GEN sıralaması, bütün 30 oyuncuyu seçili rolde rolGenel ile hesaplayıp yüksekten düşüğe sıralar; başka roldeki adayları gizlemez. Görsel sıralama asıl piyasa dizisini, oyuncu rolünü, özelliklerini veya kayıtlı GEN'ini değiştirmez. Detay düğmeleri gerçek kaynak indislerini kullanır. Ücretler mevcut oyuncu kaydına dayanır; rol önizlemesi fiyatı veya maaşı değiştirmez.

Profil üretimi çeşitlendirildi: yaklaşık %20 geniş profil, diğerlerinde de her yan özellik için güçlü çıkma şansı bulunur. Ana rol dışındaki bütün özelliklerin düşük olması zorunlu değildir. GEN ağırlıkları aynı kalır: ana özellikler %85, diğerleri %15; Destek nişanı %1. Yeni 8.000 profil ölçümünde ana/diğer farkı yaklaşık 16 puan, en iyi/en kötü rol GEN farkı 14–16 puan. Önceki daha katı üretimin 27 puanlık farkı artık geçerli değildir. Mevcut oyuncuların özellikleri yeniden dağıtılmaz.

Test: npm run market:test, roles:test, lineup:test, career:test, planning:test, audit:test, club:test. Rol ve ilk 5 değişimlerinde 12 ham özellik oyuncu kimliğine göre karşılaştırılarak korundu. 2.000 örneğin 1.291'inde ana rol dışı özellik en az bir ana özellik kadar güçlü; 405'i geniş profilli bulundu. 8 rolde doğru GEN/sıralama, 30 kişi, eski kayıt tamamlama, pazarlık koruması ve kayıt yükleme geçti. Transfer rehberi güncellendi. Android derlemesi ve mobil rol sıralama kontrolü yapıldı.


## Dil desteği

Ana Menü > Dil ile Türkçe, İngilizce, Almanca, Fransızca, İtalyanca, İspanyolca, Portekizce, Rusça, Japonca, Yunanca, Basitleştirilmiş Çince ve Geleneksel Çince seçilir. Seçim cihazda saklanır. Çeviri sözlüğü dil-verileri.js, görünüm dönüşümü dil.js içindedir. Rol kimlikleri, form değerleri ve kariyer verileri oyun mantığında korunur; çeviri ekranda uygulanır. Takım, oyuncu ve sponsor adları ile kullanıcı tarafından yazılan alanlar korunur.

`npm run localization:test`: sözlük ve değişken alanları, rehberler, olay/basın metinleri, sayı çekimleri, maç raporları ve aynı rastgele akışla 12 dilde gerçek sezon kapanışı. Kayıt verilerinin ve ödüllerin dil seçimiyle değişmediği doğrulanır.

Web ve Android içeriklerini güncellemek için `npm run android:sync` çalıştırılır. Bu işlem imzalı AAB üretmez; yayın paketi Android Studio üzerinden ayrıca hazırlanır.
