# İzleme listesi ve antrenman yoğunluğu

## Nereden açılır?

- Transfer > İzleme Listesi. Piyasadaki bir oyuncunun detayında İzleme Listesine Ekle düğmesi bulunur.
- Takım > Antrenman Yoğunluğu. Antrenman Odağı ekranından da ulaşılır.

## Elle deneme

1. Transfer Piyasası'ndan bir oyuncu açıp takip et. Aynı oyuncu iki kez eklenmemeli. İzleme Listesi'nden Kadronla Karşılaştır'ı aç: rol, yaş, GEN, maaş ve 12 özellik yan yana görünmeli. Karşıdaki kadro oyuncusunu açılır listeden değiştir.
2. Takip ettiğin oyuncuyu normal pazarlık akışıyla satın al. Listede aynı oyuncu Kadron durumuna geçmeli; iki ayrı kayıt oluşmamalı. İzleme listesi tek başına oyuncu satın almaz ve para harcamaz.
3. İzleme ekranındaki Kadromdan oyuncu takip et bölümünden bir oyuncunu ekle. Sözleşmesinde 4 veya daha az hafta kalınca ana ekranda takip bildirimi, listede uyarı ve haftalık özette not olmalı. Yenileyince uyarı kalkmalı. Piyasadaki oyuncular için gerçek sözleşme bitiş tarihi tutulmadığından tarih/ücretsiz transfer vaadi gösterilmez.
4. Sezon sonu piyasa yenilenince ayrılan hedefin son bilinen bilgisi korunmalı. Artık havuzda değilse transfer düğmesi olmamalı; karşılaştırma eski veri olduğunu belirtmeli. Liste en fazla 20 oyuncu tutar. Takibi Bırak düğmesi yalnız ilgili kaydı kaldırır.
5. Hafif planı seçip bir hafta tamamla. İlk 5 ve yedekler normalden 4 puan daha düşük haftalık yorgunluk değişimi alır; gelişim ihtimali %25 düşer. Yorgunluk 0 altına inmez.
6. Normal plan önceki gelişim/toparlanma hesabını korur. Eski kayıtlarda varsayılan plandır.
7. Yoğun plan dinç oyuncunun gelişim ihtimalini %20 artırır, haftalık yorgunluğa +8 ekler. 40 üstü yorgunlukta bu planın gelişim çarpanı azalır; 80 yorgunlukta çarpan 0,72 olur. Ekranda yorgunluk uyarısı görünür. Yaş gerilemesi ve potansiyel sınırı değişmez. Akademi/harita gelişimi bu seçimden etkilenmez.
8. Seçilen planı kayıt yükleyerek ve JSON yedeği dışa/içe aktararak kontrol et. İzleme listesi de korunmalı. Haftalık özette uygulanan antrenman planı yazmalı.

## Ölçüm

Gerçek antrenman ve form işlevleriyle 4.800 kadro sezonu (24.000 oyuncu sezonu, 134.400 hafta) ölçüldü. 20 yaşında, 50 başlangıç özelliklerine sahip beş rol; Nişan odağı; 28 hafta. Koç/fizyoterapist 0 veya 3. Yalnız lig maçları için dönüşümlü maç/dinlenme haftaları veya her hafta maç senaryosu. Dönüşümlü politika, yorgunluk 45'e ulaşınca Hafif, diğer haftalarda Yoğun kullanır. Bunlar tüm ekonomi/kariyer ve oyuncu tutma simülasyonu değil; antrenman–yorgunluk kararının kontrol ölçümüdür.

Yalnız lig, koç/fizyoterapist 3 için ortalama GEN artışı: Hafif 4,44; Normal 5,93; sürekli Yoğun 6,20; dönüşümlü 6,73. Sürekli Yoğun plan sezon sonunda 84 yorgunluğa ulaşırken dönüşümlü 36'da kalır. Personelsiz aynı fikstürde sürekli Yoğun 3,64 GEN, Normal 4,57 GEN sağlar: biriken yorgunluk yüzünden Yoğun her zaman üstün değildir. Dinlenme haftası olmayan senaryolarda rotasyon ve fizyoterapist ihtiyacı sürer.

Ham sonuçlar: training-study.json. Tekrar çalıştırma: npm run training:study.

## Doğrulama

- npm run planning:test: önceki Normal algoritmasıyla aynı tohumda eşdeğerlik, yorgunluk/verim, gerçek pazarlıkla oyuncu alma, izleme kimliği, karşılaştırma, sözleşme yenileme uyarısı, piyasa arşivi, JSON yedek ve gerçek hafta geçişi.
- career:test, club:test, audit:test, balance:test ve ad-policy-test.js geçti.
- Android debug derlemesi geçti.
- Android WebView üzerinde altı ekran 411 CSS piksel genişlikte kontrol edildi; taşma yok. Ekran görüntüleri ui/ klasöründe. Asıl kariyer test sonunda geri getirildi.
