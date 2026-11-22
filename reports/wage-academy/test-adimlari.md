# Maaş ve akademi için test adımları

1. Oyunu yeniden çalıştırıp Transfer > Sözleşmeler ekranını aç. Mevcut maaş, Ücret GEN’i, Emsal maaş ve Yeni maaş görünmeli.
2. Maaşı emsalin %75’inin altındaki bir oyuncuda “Ücret iyileştirmesi istiyor” görünmeli. Yeni ücret en az emsalin %75’i olmalı. Aradaki fark normal %15 zamdan büyük olabilir.
3. Maaşı piyasaya yakın oyuncuda olağan yenileme %15 olmalı; piyasanın %120 üst sınırı korunmalı. Sabit mevcut ücret, yalnız ekrana bakmakla değişmemeli.
4. Yenilemeye basıp önce iptal et: bütçe, maaş ve bitiş tarihi değişmemeli. Sonra onayla: diyalogdaki ücret bir kez kesilmeli, gösterilen yeni haftalık maaş uygulanmalı ve sözleşme 26 hafta uzamalı.
5. Bir oyuncunun rolünü değiştir: özellikleri değişmemeli ve en güçlü rolüne göre hesaplanan emsal maaş düşmemeli.
6. Akademiye genç bir aday al. Haftaları normal şekilde oynayarak ilerlet. Kadro ortalamasının gerisindeki gelişimi hızlı, ortalamayı aşınca kademeli olarak daha yavaş olmalı. Tek haftadan karar verme; rastgeleliği görmek için birkaç hafta karşılaştır.
7. Düşük potansiyelli adayın sınıra gelince durduğunu, yüksek potansiyelli adayın ise kadroya yaklaştıktan sonra potansiyele doğru daha yavaş ilerlediğini kontrol et. Tahmin aralığı, gerçek potansiyelin kendisi değildir.
8. Scout oranları %5/%10/%15, kapasite 2/4/6 ve görev başına 1–2 aday olarak kalmalı. Ücretsiz/görevsiz aday gelmemeli.
9. Oyunu kapatıp aç: maaşlar, sözleşmeler ve akademi gelişimi korunmalı. Türkçe dışındaki dillerde yeni açıklamalar ve ücret talebi çevrilmiş olmalı.

Otomatik kontrol: `npm run balance:test`. Ekonomi/mentorluk karşılaştırması aynı klasördeki raporda bulunur.

10. Talep karşılanmadan haftaları ilerlet: oyuncunun morali her hafta düşmeli. Sözleşmenin son haftası bittiğinde oyuncu ayrılmalı.
11. Başka bir oyuncunun talebini sözleşme bitmeden “Maaşı iyileştir” ile karşıla: maaş en az emsalin %75’ine çıkmalı, sözleşme süresi değişmemeli ve maaş kaynaklı moral kaybı durmalı. Bu düğme düşük moralde de kullanılabilir.
