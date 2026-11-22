# Lig play-off'u: denge ve test

Şampiyon doğrudan yükselir ve sonuncu doğrudan düşer. Alt ligin ikincisi, üst ligin yedincisi ile BO3 oynar. Alt lig takımı kazanırsa takımlar lig değiştirir. 1. Lig'den yükselme, 5. Lig'den düşme yoktur.

## Simülasyon

Oyunun gerçek canlı maç/raund, lig, transfer ve ekonomi işlevleri kullanılarak 10'ar sezonluk 24 planlı ve 12 daha az planlı kariyer oynatıldı. Aynı tohumlarla önceden yapılan ve aynı oyun koduna dayanan simülasyonların ilgili 36 kariyeriyle karşılaştırıldı. Play-off eklenince rastgele sayı akışı ve sonraki kararlar değiştiğinden bu değerler kesin nedensel ölçüm değildir.

| Ölçüm | Planlı önce | Planlı sonra | Daha az planlı önce | Daha az planlı sonra |
| --- | ---: | ---: | ---: | ---: |
| Kariyer sayısı | 24 | 24 | 12 | 12 |
| İlk yükselme sezonu, ortanca | 2 | 1,5 | 3 | 2 |
| 10 sezonda 1. Lig'e ulaşan | 22/24 | 24/24 | 0/12 | 1/12 |
| 1. Lig'e ulaşanların ulaşma sezonu, ortanca | 7 | 7 | — | 9 |
| Borç görülen kariyer | 0/24 | 0/24 | 5/12 | 7/12 |

Yeni düzende planlı kariyerler 33 play-off serisinin 21'ini, daha az planlı kariyerler 20 serinin 12'sini kazandı. Bu örneklemde planlı oyuncu ilk yükseliş fırsatına daha erken ulaştı; 1. Lig'e ulaşanların ortanca süresi değişmedi. Daha az planlı kariyerlerde borç riski yüksek kalıyor; küçük örneklem ve farklı rastgele akış nedeniyle farkın tamamı play-off'a bağlanamaz. Bu çalışmada genel ekonomi yeniden ayarlanmadı.

## Kontrol edilenler

- İkinci sıradaki oyuncu kazanırsa yükselir, kaybederse kalır.
- Üst ligde yedinci oyuncu kazanırsa kalır, kaybederse düşer.
- Şampiyon ve sonuncunun doğrudan hareketi ile 1. ve 5. Lig sınırları korunur.
- Tüm 40 takım birer kez ve her ligde 8 takım bulunur.
- Eşleşmeler ve diğer lig sonuçları kayıttan dönünce değişmez; BO3 haritaları arasında kayda devam edilebilir.
- Sezon ödülü play-off bitmeden verilmez ve ikinci kez alınmaz; maç yedeği doğrulanır.
- Oyun rehberi ve yeni arayüz metinleri desteklenen 11 dile çevrilmiştir.

## Oyuncu için test

1. Bir alt ligde sezonu ikinci bitir ve ana ekranda **Play-off Maçına Geç** düğmesini aç.
2. Rakibi ve açıklamayı kontrol et, haritaları yasakla ve BO3 serisini başlat.
3. Birinci haritadan sonra uygulamayı kapatıp aç; **Maça Devam Et** ile seriye dön.
4. Seriyi bitir, sonucu kontrol et ve yeni sezonu başlat. Kazandıysan bir üst ligde, kaybettiysen eski liginde olmalısın.
5. Üst ligde yedinci sırayla farklı bir kariyerde aynı işlemi dene; bu kez kaybeden alt lige düşer.
