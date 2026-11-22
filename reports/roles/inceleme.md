# Rol uzmanlığı incelemesi

Önceki üretim bütün özellikleri aynı güç çevresinde dağıtıyordu. GEN, rolün dört özelliğinin %70 ortalaması ve diğer sekiz özelliğin %30 ortalamasıydı. Böylece Destek nişanı %3,75; her ana özellik %17,5 ağırlığındaydı. Aynı formül antrenman.js ve strateji.js içinde ayrı yazılmıştı. Hesap kendi içinde tutarlıydı; asıl uzmanlık sorunu birbirine yakın üretilen özelliklerdi.

Yeni tek kaynak rolprofil.js: ana özellikler toplam %85, diğerleri %15. Destek: Utility %30, Takım Oyunu %25, İletişim %20, İstikrar %10, Nişan %1, kalan yedi özellik %2. Sniper nişanı %35. GenelHesapla ve rolGenel aynı fonksiyona bağlıdır. Yarım puanlarda kayan nokta yuvarlamasına tolerans eklendi.

Yeni başlangıç, rakip, transfer, akademi ve bölgesel scout oyuncuları belirgin güçlü/zayıf özelliklerle üretilir. Profilin ana rol GEN'i üretim hedefine yaklaştırılır; farklar korunur. Bölgesel scout rolü değişince profil de yeni role göre oluşturulur. Scout potansiyel olasılıkları ve kapasite kuralları değişmedi.

Mevcut kariyerlerde özellikler rastgele yeniden dağıtılmaz. Bütün oyuncu havuzlarının GEN'i yeni ağırlıklarla bir kez hesaplanır. Bu nedenle eski oyuncular arasında dengeli/genel profiller kalabilir; yeni uzmanlık dağılımı yeni üretilen oyuncularda görülür. Tamamlanmış maç sonuçları değiştirilmez.

## Testler

- npm run roles:test: 8.000 profilde ana/diğer özellik farkı yaklaşık 27, en iyi/en kötü rol GEN farkı 21–23. Bu örneklemde üretim rolü daima en yüksek GEN'i verdi. Bütün rol ağırlıkları %100, hedef güç aralığı ve kart/atama GEN'i tutarlı.
- Sabit 50 özellikli oyuncuda nişan 50 → 90: Destek ham GEN katkısı +0,4 (yuvarlanmış GEN değişmedi), Sniper +14. Destek için nişan tek başına güçlü oyuncu yaratmaz.
- Geçiş idempotent, özellik değerleri korunuyor; bölgesel adayın üretim rolü doğru.
- career:test, depth:test, planning:test, balance:test, guides:test, audit:test, club:test, commentary:test geçti.
- 36 kariyer, 144 sezonluk gerçek motor taraması: Rahat %50,7; Dengeli %61,8; Planlı %61,3 galibiyet. Örneklemde borç yok. Önceki 8 sezonluk çalışma ile doğrudan eşdeğer değildir. Mevcut otomatik yönetim politikaları yeni rol profillerine özel transfer optimizasyonu yapmaz; sonuçlar tam uzun dönem denge garantisi değildir.
- Android derlemesi ve yüklemesi başarılı. Mobil ekranlar ayrı test kariyeriyle kontrol edilir, asıl kayıt geri getirilir.

Ham ölçümler profile-study.json ve career-study.json içinde.
