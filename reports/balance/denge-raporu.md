# Tactical Esports Manager — Denge İncelemesi

Üç yönetim politikasıyla gerçek oyun işlevleri kullanıldı. İlk ölçüm 72 kariyer, ara doğrulama 72 kariyer, son tarama 180 kariyerdir. Toplam 324 kariyer ve 2.587 sezon incelendi.

Son taramada 25.436 yönetilen harita, 434.466 rakip/lig haritası ve 10.620.340 raund işlendi. Önce/sonra bağımsız kontrollerde ayrıca 8.400 harita ve 2.400 sezonluk tek oyuncu antrenmanı örneği ölçüldü.

## Yöntem ve sınırlar

- Rahat: iki sponsor, koç seviye 1, sabit taktik, 12 haftada bir transfer değerlendirmesi; turnuva/scout yok.
- Dengeli: üç sponsor, analist ve sınırlı personel yatırımı, karşı taktik, turnuva ve scout; 8 haftada bir transfer değerlendirmesi.
- Planlı: daha yüksek personel yatırımı, karşı taktik ve mola, turnuva/scout; 6 haftada bir transfer değerlendirmesi.
- Maç olasılığı, raund çözümü, gelişim, pazarlık, maaş, sponsor, hafta ve sezon geçişleri gerçek kaynak işlevleridir. Sabit tohumlar kullanılır. Görsel animasyon ve disk kaydı ölçüm dışındadır.
- Politikalar ödeme ve sözleşme tarihlerini takip eden otomatik menajerlerdir. Bu sonuçlar gerçek oyuncu davranışı, oturum süresi veya oyuncu tutma oranı ölçümü değildir.

## Yapılan ayarlar

1. 24 yaş altı: odak gelişimi %60 → %55, diğer özellikler %15 → %11. Orta yaş ve yaşlı oyuncuların yaş eğrisi korunur.
2. Yeşil rol özelliği etkisi -4/-4/-1/+2/+4 → -2/-1/0/+1/+2. Küçük GEN farklarında eşik sıçraması yumuşar.
3. Mağlubiyet moral kaybı fizyoterapist seviyesine göre 5/4/3/2 → 4/3/2/2. İlk 5 haftalık olarak 70 morale 2 puan yaklaşır.
4. Yenileme maaşı en fazla %15 artar ve güncel piyasa maaşının %120’siyle sınırlıdır. Aşırı şişmiş eski sözleşmelerin yenileme ücreti de piyasa değeriyle sınırlandırılır.
5. Scout 80+ potansiyel olasılığı %5/%10/%15, kapasite 2/4/6, görevde 1–2 aday ve reklam zamanlaması korunur.

## Son tarama

| Profil | Lig maçı kazanma | İlk yükselme medyanı | 8 sezonda yükselen | 1. Lige ulaşan | Borç gören | Son bütçe medyanı |
|---|---:|---:|---:|---:|---:|---:|
| Rahat | %56,5 | 3 sezon | %93,3 | %0 | %3,3 | 823.891 $ |
| Dengeli | %66,2 | 1 sezon | %100 | %55 | %1,7 | 1.750.988 $ |
| Planlı | %69,2 | 1 sezon | %100 | %71,7 | %15 | 1.637.229 $ |

Yükselme medyanı, en az bir kez yükselen kariyerlerden hesaplanır. Borç görmek herhangi bir haftada bütçenin sıfır altına inmesidir; oyun sonu veya iflas anlamına gelmez. Simülasyonda -1.000.000 $ altında kalan örnekler risk işaretiyle durdurulur.

## Önce / sonra (aynı büyüklükte 24 kariyer / profil)

| Profil | Eski kazanma | Yeni kazanma | Eski borç oranı | Yeni borç oranı |
|---|---:|---:|---:|---:|
| Rahat | %54 | %55,9 | %54,2 | %4,2 |
| Dengeli | %67,3 | %66,5 | %4,2 | %0 |
| Planlı | %70,6 | %69,6 | %8,3 | %8,3 |

## Güç farkı kontrolü

Her satırda 600 harita. Takımların GEN dışındaki temel koşulları nötr tutuldu; oyunun gerçek taktik, mola ve raund işlevleri kullanıldı.

| GEN farkı | Önce kazanma | Sonra kazanma |
|---|---:|---:|
| -20 | %20,2 | %21,2 |
| -10 | %28,7 | %36,2 |
| -5 | %33,3 | %38,7 |
| 0 | %50,2 | %50,3 |
| +5 | %68,5 | %62,8 |
| +10 | %72,2 | %70,3 |
| +20 | %80,3 | %80,8 |

## Gelişim

| Yaş | Koç | Önce GEN/sezon | Sonra GEN/sezon |
|---|---:|---:|---:|
| 20 | 0 | 6,4 | 5,1 |
| 20 | 3 | 8,3 | 6,9 |
| 27 | 0 | 2,7 | 2,7 |
| 27 | 3 | 3,3 | 3,4 |
| 32 | 0 | -3,3 | -3,3 |
| 32 | 3 | -3,4 | -3,5 |

35 GEN ve 80 potansiyelle akademiye giren örnekte sonraki sezon ortalamaları: 44,9 → 54,7 → 64,4 → 74,2 → 80. Sezon içindeki 28 haftalık akademi gelişimi gerçek işlevden alınmıştır.

## Doğrulama

- npm run balance:test
- npm run career:test
- npm run audit:test
- node scripts/ad-policy-test.js
- npm run balance:controls
- npm run balance:study -- --runs 60 --seasons 8 --out reports/balance/balance-final.json
- Android assembleDebug

Ham örnekler ve sezon bazlı sonuçlar aynı klasördeki JSON dosyalarındadır.