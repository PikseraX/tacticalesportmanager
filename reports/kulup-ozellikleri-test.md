# Yeni kulüp özellikleri — elle test adımları

Mevcut kariyerlerle uyumludur. Yeni özellikler, scout olasılıklarını ve reklam zamanlamasını değiştirmez.

1. **Kayıt yedeği:** Ana Menü veya Kulüp > Kayıt Yedeği. Dosyaya Kaydet ile bir JSON yedeği oluştur. Android dosya ekranında konumu seçip Kaydet'e bas. Dosyayı tekrar seç: kulüp, sezon, hafta ve bütçe önizlemesini gör. Vazgeç dersen kariyer değişmemeli. Geri Yükle dersen yedeğe dönmeli. Yükleme Öncesi Kayda Dön ile önceki kariyeri tekrar önizleyip yükleyebilirsin. Bozuk/başka oyuna ait dosya mevcut kayda dokunmadan reddedilmeli. Telefon sıfırlanırsa cihazdaki geri dönüş kaydı da silinir; dışa aktardığın dosyayı ayrıca sakla.
2. **Devam eden maç:** Bir maçı birkaç raund oynayıp uygulamayı arka plana al ve yeniden aç. Maça devam ettikten sonra kariyer yedeğini aldığında maç grafiği de dosyaya girer. Yedek yüklenince aynı skor ve oyuncu istatistikleriyle Devam Eden Maç ekranı gelmeli. Aktif maç sırasında menüye dönmek için maç akışını bozma; uygulamanın mevcut devam ekranını kullan.
3. **Gelişim özeti:** Bir hafta oyna ve Haftayı Bitir. Ana Ekran > Haftalık Özet'te bütçe, kimya, taraftar ve itibarın önce/sonra değerlerini incele. Oyuncunun GEN'i aynı kalmış olsa bile değişen Nişan vb. özellikler görünmeli. Eski haftalık kayıtlar okunmaya devam eder; eski kayıtlarda tutulmamış özellik ayrıntısı geriye dönük üretilmez.
4. **Sezon hedefi:** Ana Ekran > Sezon Hedefi. Hedef seçmeden devam etmek mümkün olmalı. Bir hedef seçince o sezon değiştirilememeli. Akademi hedefi scout gerektirir; hedefi seçtikten sonra bir akademi oyuncusunu yükselt. Genç gelişimi hedefinde seçim anında 24 yaş altı olan bir oyuncuya +2 GEN kazandır ve sezon sonuna kadar kadroda tut. Bütçe hedefi sezon ödüllerinden önce değerlendirilir. Sezonu kapatınca sonuç tarihçeye bir kez eklenmeli; yeni sezonda seçim boş başlamalı. Ödül yalnız tarihçe rozeti, para/güç artışı veya başarısızlık cezası yok.
5. **Mağlubiyet raporu:** Kaybedilen lig maçı veya BO3 haritasının sonunda en fazla iki gözlem ve uygulanabilir öneri görünmeli. Harita, skor ve rakip belirtilmeli. Rapor kesin mağlubiyet nedeni iddia etmez; taktik gözlemi maçın son bölümüne aittir. BO3 sürerken öneriler başka menüye yönlendirmemeli; Sonraki Harita düğmesi çalışmalı.
6. **Tarihçe:** Kulüp > Kulüp Tarihçesi. Mevcut sezon/turnuva geçmişinden kupalar ve yükselmeler gelmeli. Yeni galibiyetlerden en farklı lig maçı ve BO3 serisi ayrı tutulmalı. Maç oynamış bir oyuncuyu sattıktan sonra oyuncunun tarihçe kaydı korunmalı. Eski sürümde satılmış ve kaydı tutulmamış oyuncular geri getirilemez.

## Yapılan doğrulama

- `npm run club:test`: hedef kilidi, cezasız sonuç, gerçek sezon kapanışı, akademi yükseltme, oyuncu ayrılması, GEN sabitken özellik değişimi, analiz, kayıpsız dosya, bozuk dosya, maç grafiği, iptal, geri dönüş ve depolama hatası.
- `npm run career:test`, `npm run audit:test`, `npm run balance:test`, `node scripts/ad-policy-test.js` geçti.
- Android debug derlemesi geçti.
- Emülatör: dört ekran 411 CSS piksel genişlikte taşmadan render edildi. Android dosya seçicisinden yaklaşık 117 KB yedek kaydedildi, okundu, önizlendi ve geri yüklendi. Test sonrasında asıl kariyer geri getirildi.
- Android etkinlik durumuna büyük yedek metni konmaz; geçici dosya başvurusu kullanılır. Böylece dosya seçicisine geçerken görülen TransactionTooLargeException giderildi.
