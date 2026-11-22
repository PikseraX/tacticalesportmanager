# Maç planları, kişilikler, rekabet ve hızlı maç

## Nereden açılır?

- **Maç Öncesi:** harita yasaklama sonrası Hazırlık Planı ve Canlı İzle / Hızlı Maç seçimi.
- **Takım > Oyuncu Kişilikleri:** ilk 5 ve yedeklerin kişilikleri ve tam etkileri. Kadro kartlarında ve transfer detayında da kişilik adı görünür.
- **Lig ve Turnuva > Rekabetler:** rakip geçmişi; aynı rakiple maç öncesinde de özet gösterilir.

## Elle test

1. **Plan seçimi:** Lig maçını harita yasaklamadan sonra Maç Öncesi ekranına getir. Standart, Güvenli başlangıç, Utility odaklı oyun veya Yıldızı baskıla seç. Taktik ayrı seçilir. Maç başlayınca hazırlık planı değişmez; sonraki BO3 haritasında yeni plan seçilebilir. Sonuç raporunda kullanılan plan gösterilir.
2. **Plan bedelleri:** Güvenli başlangıç ilk 6 raund +3, sonrasında -1 güç. Utility ilk 3 raund -2; sonra Utility/Takım Oyunu farkı en az +3 ise +2, 0–3 arasıysa +0,5, negatifse -2. Yıldızı baskıla, rakibin en iyi oyuncusu ortalamadan en az 5 GEN yüksekse +2; değilse -2. Kendi Karar Verme ortalaman 55 altındaysa ayrıca -1. Standart ek etki vermez. Bunlar raund kazanma ihtimaline küçük güç katkılarıdır; galibiyet veya belirli bir oyuncunun elenmesini garanti etmez.
3. **Kişilik kalıcılığı:** Takım > Oyuncu Kişilikleri'ni aç. Tekrar açınca ve kayıt yükleyince kişilikler aynı kalmalı. Transfer detayında da görünmeli. Bilgiler bu sürümden itibaren kayda eklenir.
4. **Mentor:** 27+ yaşında Mentor ilk 5'teyken 24 yaş altı kadro oyuncularının gelişim ihtimaline %5 destek gelir. İki mentor %10 yapmaz. Mentor yedekteyse destek yok. Destek aktif olduğunda haftalık özette belirtilir. Potansiyel sınırı veya yaş gerilemesi kaldırılmaz.
5. **Büyük maç oyuncusu:** Turnuva yarı final/finalinde veya son dört lig maçında ilk üçteki iki takımın karşılaşmasında oyuncu başına +1 güç; takım katkısı ortalamaya girer. Rakipte de aynı kural uygulanır. Diğer maçlarda ek etki yok.
6. **Sabırsız:** Üç hafta üst üste yedekte olup maça çıkmayan Sabırsız oyuncu haftada ek -1 moral alır. Ek kayıp 40 altına indirmez. Devrede oyuna sokmak bekleme serisini sıfırlar. İlk 5'e döndüğünde yedek haftaları sıfırlanır.
7. **Rekabet:** Lig maçı tamamla, Lig ve Turnuva > Rekabetler'i aç. Galibiyet/mağlubiyet ve son maç görünmeli. Aynı rakiple en az 3 karşılaşma ve en az 2 yakın sonuçta Çekişmeli Rekabet etiketi çıkar. Lig maçında fark en fazla 3 raund, BO3'te 2–1 yakın sonuç sayılır. BO3 haritaları ayrı karşılaşmalar sayılmaz. Hikâye haftalık özete eklenir; güç/para bonusu yoktur. Eski sürümde tutulmamış geçmiş sonuçlar uydurulmaz.
8. **Hızlı maç:** Yeni kariyerde rehberi tamamla veya Atla. İlk maçtan sonra da açılır; eski kayıtta rehber alanı yoksa açıktır. Maç Öncesi > Hızlı Maç seç, ilk yarı taktiğine bas. Tam 12 raundda Yarı Devre ekranı gelmeli. Lig sonucu henüz işlenmemiş olmalı.
9. **Devre müdahalesi:** Devrede taktik değiştir, varsa yedek oyuncu sok. Devre Arası Takım Molası'nı kullan; aynı devrede ikinci kez kullanılamaz, mevcut mola hakkından düşer. İkinci yarı taktiğini seçince sonuç simüle edilir. Kalıcı ilk 5 ve roller değişmez; giren/çıkan oyuncuların istatistikleri işlenir.
10. **Kayıt ve BO3:** Hızlı maçın devresinde uygulamayı arka plana alıp geri dön veya kaydı yükle. Skor, hızlı mod, hazırlık planı, taktik ve değişiklikler korunmalı. BO3 her haritanın devresinde ve harita sonunda durmalı; seri sonunda galibiyet/mağlubiyet ve istatistikler bir kez işlenmeli. Reklam harita/devre sırasında tetiklenmemeli. Uzatma güvenlik sınırı dolarsa eşit skorda sonuç yazılmaz; canlı raund akışına dönülür.

## Ölçüm ve doğrulama

- `npm run depth:test`: sabit kişilik, mentor sınırı, yedek beklentisi, plan koşulları/kilidi, rekabetin güç vermemesi ve olay tekilleştirme, devre kaydı, oyuncu değişikliği, mola, aynı tohumda ilk yarı skor/istatistik eşdeğerliği, gerçek BO3'te tek sonuç/istatistik.
- `npm run depth:study`: 3 kontrollü kadro senaryosu × 4 plan × 1.000 harita = **12.000 harita, 283.191 raund**. Gerçek canliP, raund olayları, taktik/devre/mola motoru; grafik animasyonu ve tüm kariyer ekonomisi bu ölçümün dışında.
- Eşit takımlarda Standart %49,7; Güvenli %48,9; Utility %49,9; Yıldızı baskıla %46,9. Utility üstünlüğü senaryosunda Standart %53,6, Utility %56,4. Tek yıldızlı rakipte Standart %48,2, Yıldızı baskıla %50,9. Bunlar bu örneklemin oranlarıdır; küçük farklar kesin kazanma olasılığı değildir. Ölçülen en büyük tek-raund plan etkisi yaklaşık **0,94 yüzde puan**; bütün maç koşullarında bu oranı aşmayacağı iddia edilmez, güç katkısı -3 ile +3 arasında sınırlıdır.
- Mentor desteği en fazla %5, büyük maç kişiliği birey başına +1 güç, sabırsızlık ek moral kaybı haftada en fazla 1 olarak sınırlandı. Rekabetin etkisi hikâyedir.
- `career:test`, `planning:test`, `club:test`, `audit:test`, `balance:test`, `node scripts/ad-policy-test.js` geçti.
- Android debug derlemesi geçti. Yedi ekran 411 CSS piksel genişlikte yatay taşma olmadan incelendi. Hızlı maç devre ve sonuç ekranına kadar emülatörde çalıştırıldı; asıl kariyer geri getirildi.

Ham ölçüm: study.json. Android ekran görüntüleri: ui/.
