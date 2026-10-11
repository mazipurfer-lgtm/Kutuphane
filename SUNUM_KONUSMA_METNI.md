# OKUL KÜTÜPHANESİ YAZILIM TESTİ SUNUMU
## SLAYT SLAYT KONUŞMA VE SUNUM NOTLARI

*(Hocaya ve sınıfa sunum yaparken bu notları doğal bir dille takip edebilirsiniz. Tamamen insan anlatımı formatında hazırlanmıştır.)*

---

### SLAYT 1: KAPAK (Giriş)
**Ekranda:** *Yazılım Testi ve Test Süreçleri - Okul Kütüphanesi Kitap Kiralama Sistemi*  
**Konuşma Metni:**  
> "Merhaba Sayın Hocam, değerli arkadaşlar.  
> Bugün sizlere dönem projemiz olan Okul Kütüphanesi Kitap Kiralama Sistemi üzerinde uyguladığımız yazılım testi ve kalite güvencesi süreçlerini sunacağım.  
> Bu çalışmada temel referans kaynağımız, İstanbul Teknik Üniversitesi Bilgi İşlem Daire Başkanlığı'nın (İTÜ BİDB) yayınladığı 'Yazılım Testi ve Test Süreçleri' metodolojisi oldu. Sunumum boyunca projemizi analizden başlayarak test hazırlığına, dinamik testlerden testin sonlandırılmasına kadar nasıl aşamalardan geçirdiğimizi adım adım aktaracağım."

---

### SLAYT 2: YAZILIM KALİTESİ VE TESTİN ÖNEMİ
**Ekranda:** *Yazılım Kalitesi ve Testin Önemi*  
**Konuşma Metni:**  
> "Hocam, İTÜ BİDB makalesinde yazılım kalitesi tanımlanırken; bir yazılımın sadece çalışmasının yetmediği; kabul edilebilir düzeyde hatasız olması, planlanan bütçe ve zamanda teslim edilmesi, gereksinimleri karşılaması ve sürdürülebilir olması gerektiği vurgulanıyor.  
> Bizim bu projede testi sadece en son aşamada değil, bir kalite garantisi olarak görmemizin temel sebebi; hataları erken aşamada yakalayıp düzeltme maliyetini en aza indirmek ve kullanıcılara güvenilir bir kütüphane deneyimi sunmaktı."

---

### SLAYT 3: İDEAL YAZILIM TEST SÜRECİ DÖNGÜSÜ
**Ekranda:** *Analiz ➔ Tasarım ➔ Test Hazırlık ➔ Kodlama ➔ Dinamik Test ➔ Sonlandırma ➔ Ürün*  
**Konuşma Metni:**  
> "Makalede en çok dikkatimizi çeken ilkelerden biri şuydu: İdeal bir test süreci asla kodlamanın bitmesini beklemez.  
> Biz de projeyi geliştirirken analiz ve tasarımın hemen ardından 'Test Hazırlık Süreci'ne başladık. Burada test planımızı hazırladık, risk analizimizi yaptık ve test senaryolarımızı (test cases) belirledik. Kodlama ilerledikçe dinamik test sürecine geçtik ve kriterlerimiz tamamlandığında testi başarıyla sonlandırdık."

---

### SLAYT 4: TEST HAZIRLIK SÜRECİ VE RİSK ANALİZİ
**Ekranda:** *Risk Analizi Tablosu (Stok, Ceza, Mükerrer Kiralama, Silme Koruması)*  
**Konuşma Metni:**  
> "Test hazırlık aşamasında projemizin en kritik bölgelerini belirlemek için bir Risk Analizi yaptık.  
> Örneğin kütüphane sisteminde en büyük risklerden biri; bir kitabın stokta kalmadığı halde kiralanabilmesi veya kiradaki bir kitabın sistemden silinerek veri tutarsızlığı yaratmasıydı. İkinci kritik riskimiz ise gecikme cezasının yanlış hesaplanmasıydı. Bu risklerin her biri için önceden test stratejileri ve test senaryoları belirledik."

---

### SLAYT 5: BİRİM TESTLERİ (UNIT TESTING)
**Ekranda:** *Birim Test Tablosu (UT-01'den UT-10'a)*  
**Konuşma Metni:**  
> "Dinamik test sürecimizin ilk adımı Birim Testleri (Unit Testing) oldu. Burada kodun içindeki özel fonksiyonları mikro ölçekte sınadık.  
> Örneğin `paraFormatla` ve `tarihFormatla` fonksiyonlarımızın beklenen kuruş ve tarih formatlarını ürettiğini doğruladık. En kritik birim testimiz ise `kiralamaDurumunuHesapla` fonksiyonundaydı: İş kuralımız gereği gecikilen her gün için günlük ücretin 2 katı ceza uygulanması gerekiyordu. 3 gün geciken 2.50 liralık bir kitapta sistemin tam olarak 15 lira ceza hesapladığını birim test ile doğruladık. Ayrıca olası XSS saldırılarına karşı `htmlKacir` fonksiyonumuzun zararlı script etiketlerini başarıyla etkisiz hale getirdiğini gördük."

---

### SLAYT 6: TÜMLEYİM TESTLERİ (INTEGRATION TESTING)
**Ekranda:** *Kiralama ➔ Stok ➔ LocalStorage Senkronizasyonu*  
**Konuşma Metni:**  
> "İkinci aşamamız Tümleyim (Integration) testleriydi. Burada modüllerin bir arada uyumlu çalışmasını test ettik.  
> Bir öğrenci kitap kiraladığında; arayüz, işlem motoru ve yerel depolama aynı anda tetikleniyor. Öğrenci kiralamayı onayladığında müsait stok sayısının anında 1 adet düştüğünü, kaydın `localStorage` alanına hatasız yazıldığını ve yönetici kitabı teslim aldığında stoğun tekrar serbest kaldığını entegrasyon testlerimizle kanıtladık."

---

### SLAYT 7: REGRESYON TESTLERİ (REGRESSION TESTING)
**Ekranda:** *Regresyon Güvencesi ve İade Sonrası Durum*  
**Konuşma Metni:**  
> "Yazılım geliştirmede en sık karşılaşılan sorunlardan biri, bir özelliği düzeltirken başka bir yeri bozmaktır. İTÜ BİDB makalesinde de belirtildiği gibi regresyon testleri bunu önlemek için yapılır.  
> Bizim sistemimizde öğrencinin elinde olan bir kitabı teslim etmeden ikinci kez alması engellenmişti. Kitap teslim edildikten sonra aynı öğrencinin kitabı tekrar sorunsuz kiralayabildiğini test ederek sistemin kilitlenmediğini ve eski işlevlerin sağlam kaldığını doğruladık."

---

### SLAYT 8: ZORLANIM VE PERFORMANS TESTİ (STRESS TESTING)
**Ekranda:** *1.000 Veri Yükü, < 5 ms Tepki Süresi*  
**Konuşma Metni:**  
> "Dinamik testlerimizin dördüncü ayağı Performans ve Zorlanım Testiydi.  
> Sistemin yoğun yük altındaki tepkisini ölçmek için test süitimiz üzerinden belleğe 1.000 adet yapay kitap verisi yükledik. 1.000 kayıt üzerinde filtreleme ve arama yaptığımızda arama süresinin 50 milisaniyelik sınırımızın çok altında, ortalama 3.8 milisaniyede tamamlandığını ölçtük. Sistem hiçbir bellek sızıntısı veya çökme yaşamadan kararlı şekilde yanıt verdi."

---

### SLAYT 9: KULLANICI KABUL TESTLERİ (UAT)
**Ekranda:** *Öğrenci ve Yönetici Senaryoları*  
**Konuşma Metni:**  
> "Yazılımı son kullanıcı gözüyle değerlendirmek için Kullanıcı Kabul Testleri (UAT) gerçekleştirdik.  
> Öğrenci rolünde; giriş yapma, arama, 7-14-30 günlük süre seçimi ve 'Kiralarım' sayfasında durum takibini test ettik. Yönetici rolünde ise yetkisiz girişlerin engellenmesi, stok yönetimi ve teslim alma paneli eksiksiz doğrulandı."

---

### SLAYT 10: BEYAZ KUTU & KARA KUTU ANALİZİ
**Ekranda:** *Sınır Değer Analizi (BVA) ve Dal Kapsama (Branch Coverage)*  
**Konuşma Metni:**  
> "Son olarak test tekniklerini ikiye ayırarak inceledik:  
> Kara Kutu testinde kodun içine bakmadan Sınır Değer Analizi (Boundary Value Analysis) yaptık. Şifre sınırımız 4 karakterdi; 3 karakter girdiğimizde sistem reddetti, tam sınır olan 4 karakterde başarıyla kaydetti.  
> Beyaz Kutu testinde ise kodun mantıksal dallarını (Branch Coverage) inceledik. Tarih farkı pozitifken 'kalan gün', sıfırken 'son gün', negatifken ise 'gecikme cezası' dallarının eksiksiz çalıştığını teyit ettik."

---

### SLAYT 11: TESTİN SONLANDIRILMASI VE SONUÇ
**Ekranda:** *20+ Test, 0 Kritik Hata, %100 Başarı Oranı*  
**Konuşma Metni:**  
> "Sonuç olarak hocam; test hazırlık sürecinde koyduğumuz tüm çıkış kriterlerini karşıladık. 20'nin üzerinde otomatikleştirilmiş test senaryomuzun tamamı başarıyla geçti, sıfır kritik hatayla test sürecimizi sonlandırdık.  
> Ayrıca web uygulamamızın içine canlı bir 'Test Laboratuvarı' sekmesi entegre ettik. Dilerseniz şimdi canlı sistem üzerinde tüm bu testlerin koşumunu hep birlikte görebiliriz.  
> Dinlediğiniz için çok teşekkür ederim, sorularınız varsa memnuniyetle yanıtlamak isterim."
