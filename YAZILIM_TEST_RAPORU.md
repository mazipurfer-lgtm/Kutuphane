# OKUL KÜTÜPHANESİ YÖNETİM VE KİTAP KİRALAMA SİSTEMİ
## YAZILIM TEST VE KALİTE GÜVENCESİ RAPORU

**Referans Metodoloji:** İstanbul Teknik Üniversitesi (İTÜ) BİDB – *Yazılım Testi ve Test Süreçleri*  
**Uygulama:** Okul Kütüphanesi Web Sistemi (Vanilla HTML5 / CSS3 / JavaScript)  
**Doküman Sürümü:** 1.0 (Nihai Test Raporu)  
**Tarih:** 2026  

---

## 1. GİRİŞ VE PROJE ÖZETİ

Bu doküman, okul kütüphanesinde öğrencilerin günlük ücret karşılığında belirli sürelerle (7, 14, 30 gün) kitap kiralayabildiği, yöneticilerin ise stok ve teslimat süreçlerini yönettiği web tabanlı sistemin test süreçlerini kapsamaktadır.

Test süreçleri yürütülürken **İTÜ BİDB "Yazılım Testi ve Test Süreçleri"** kılavuzunda tanımlanan ilkeler esas alınmıştır. İlgili kılavuzda belirtildiği üzere:
> *"Test, bir sistemi manuel veya otomatik yollarla deneyerek veya değerlendirerek, belirlenmiş gereksinimleri karşıladığının doğrulanması veya beklenen ile gözlenen sonuçlar arasındaki farkların belirlenmesi sürecidir."*

Sistemimizin testleri, kodlama sürecinin tamamlanması beklenmeden analiz aşamasında planlanmış ve dinamik test aşamalarıyla yürütülmüştür.

---

## 2. İDEAL YAZILIM TEST SÜRECİ YAŞAM DÖNGÜSÜ

İTÜ BİDB makalesinde tarif edilen standart yazılım yaşam döngüsü projemizde eksiksiz uygulanmıştır:

```text
[Analiz] ➔ [Tasarım] ➔ [Test Hazırlık Süreci] ➔ [Kodlama] ➔ [Dinamik Test Süreci] ➔ [Testin Sonlandırılması] ➔ [Ürün]
```

### 2.1. Test Hazırlık Süreci (Test Preparation)
Dinamik test koşumlarına geçilmeden önce aşağıdaki standart hazırlık adımları gerçekleştirilmiştir:
1. **Gereksinim ve Tasarım İncelemesi:** Fonksiyonel gereksinimler, iş kuralları ve veri yapıları incelenmiştir.
2. **Kapsam Belirleme:** Stok motoru, gecikme cezası hesabı, oturum yönetimi, yerel depolama ve arama filtreleme test kapsamına alınmıştır.
3. **Risk Analizi:** Hatanın yaratabileceği maliyet ve veri bütünlüğü riskleri derecelendirilmiştir.
4. **Ortam Kurulumu:** Modern V8 motoru (Chrome / Edge), Python yerel HTTP sunucusu ve bellek (in-memory) yedekleme ortamı hazırlanmıştır.
5. **Test Sonlandırma Kriterleri:** Kritik seviyeli (Bloker/Kritik) sıfır hata, en az %95 test başarı oranı ve 50ms altı filtreleme performansı çıkış kriteri olarak belirlenmiştir.
6. **Test Senaryoları (Test Cases):** Belirli girdilere (input) karşılık beklenen çıktıların (output) tanımlandığı test senaryoları hazırlanmıştır.

---

## 3. RİSK ANALİZİ MATRİSİ

| Risk ID | Modül / İş Kuralı | Potansiyel Risk / Hata Türü | Risk Seviyesi | Alınan Önlem / Test Türü |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | Stok Yönetimi | Kiradaki kitap adedinin toplam stoktan fazla düşmesi | **YÜKSEK** | Müsait Stok Birim Testi & Sınır Değer Analizi |
| **R-02** | Ceza Algoritması | Geç teslimde günlük ücretin 2 katı cezanın hatalı hesaplanması | **YÜKSEK** | Gecikme Formülü Birim Testi |
| **R-03** | Kiralama Bütünlüğü | Teslim edilmemiş kitabın mükerrer (2. kez) kiralanması | **ORTA** | Entegrasyon ve Regresyon Testi |
| **R-04** | Veri Bütünlüğü | Kirada aktif kopyası olan kitabın sistemden silinmesi | **YÜKSEK** | İlişkisel Silme Koruması Testi |
| **R-05** | Kalıcı Hafıza | `localStorage` kısıtlı olduğunda uygulamanın çökmesi | **ORTA** | Bellek (In-Memory) Yedekleme Testi |
| **R-06** | Güvenlik | Kitap ve kullanıcı adlarına zararlı script girilmesi (XSS) | **YÜKSEK** | XSS Kaçırma (Sanitization) Testi |

---

## 4. DİNAMİK TEST SÜRECİ VE UYGULANAN TEST TÜRLERİ

### 4.1. Birim Testleri (Unit Testing)
*Tanım (İTÜ BİDB):* Dinamik test sürecinin ilk aşamasıdır. Mikro ölçekte özel fonksiyonlar ve kod modülleri sınanır.

| Test Kodu | Hedef Fonksiyon | Girdi (Input) | Beklenen Çıktı | Gerçekleşen Çıktı | Durum |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-01** | `paraFormatla()` | `12.5` | `"12,50 ₺"` | `"12,50 ₺"` | ✅ GEÇTİ |
| **UT-02** | `paraFormatla()` | `"hatali"` | `"0,00 ₺"` | `"0,00 ₺"` | ✅ GEÇTİ |
| **UT-03** | `tarihFormatla()` | `"2026-10-15"` | `"15.10.2026"` | `"15.10.2026"` | ✅ GEÇTİ |
| **UT-04** | `gunEkleStr()` | `"2026-10-10", 7` | `"2026-10-17"` | `"2026-10-17"` | ✅ GEÇTİ |
| **UT-05** | `gunFarkiHesapla()`| `"2026-10-10", "2026-10-24"` | `14` | `14` | ✅ GEÇTİ |
| **UT-06** | `musaitAdetHesapla()` | Kitap ID: 1 (Stok: 3, Kira: 0) | `3` | `3` | ✅ GEÇTİ |
| **UT-07** | `musaitAdetHesapla()` | Kitap ID: 2 (Stok: 4, Kira: 1) | `3` | `3` | ✅ GEÇTİ |
| **UT-08** | `kiralamaDurumunuHesapla()` | 2.50 ₺ ücret, 3 gün gecikme | Ceza: `15.00 ₺` | Ceza: `15.00 ₺` | ✅ GEÇTİ |
| **UT-09** | `htmlKacir()` | `<script>alert(1)</script>` | Kaçırılmış HTML | Script etkisiz kılındı | ✅ GEÇTİ |
| **UT-10** | `kitapEkle()` | Boş ad, -5 stok, -2 ₺ ücret | `basarili: false` | `basarili: false` | ✅ GEÇTİ |

---

### 4.2. Tümleyim Testleri (Integration Testing)
*Tanım (İTÜ BİDB):* Farklı bileşenlerin birbiriyle uyum içinde çalışıp çalışmadığını denetler.

- **IT-01 (Kiralama ➔ Stok Azalması):**  
  Öğrenci arayüzden 14 günlük kitap kiraladığında, kiralama kaydının oluşmasıyla eşzamanlı olarak katalogdaki müsait stok sayısının 1 adet azaldığı doğrulanmıştır. *(Sonuç: Başarılı)*
- **IT-02 (Kiralama ➔ Kalıcı Depo Senkronizasyonu):**  
  Yapılan kiralamanın `localStorage` nesnesine doğru şema ile yazıldığı ve sayfa yenilendiğinde verinin korunduğu teyit edilmiştir. *(Sonuç: Başarılı)*
- **IT-03 (Teslim Alma ➔ Stok İadesi ve Ceza):**  
  Yönetici geciken kitabı teslim aldığında, gecikme cezasının tahsil edildiği ve ilgili kitabın müsait stoğunun anında +1 artarak serbest kaldığı doğrulanmıştır. *(Sonuç: Başarılı)*

---

### 4.3. Regresyon Testleri (Regression Testing)
*Tanım (İTÜ BİDB):* Yapılan değişiklikler veya düzeltmeler sonrasında sistemin eski işlevlerinin bozulmadığından emin olmak için yapılan testlerdir.

- **RT-01 (Mükerrer Kiralama Engeli):**  
  Öğrencinin henüz teslim etmediği bir kitabı ikinci kez kiralama girişimi sistem tarafından engellenmiştir.
- **RT-02 (İade Sonrası Yeniden Kiralama):**  
  Kitap yönetici tarafından teslim alındıktan sonra, öğrencinin aynı kitabı tekrar sorunsuz kiralayabildiği test edilerek hata oluşmadığı kanıtlanmıştır.
- **RT-03 (Kiradaki Kitabı Silme Koruması):**  
  Kirada aktif öğrencisi bulunan bir kitabı yönetici silmek istediğinde, sistem ilişkisel kural gereği silme işlemini reddetmiştir.

---

### 4.4. Zorlanım ve Performans Testi (Stress & Performance Testing)
*Tanım (İTÜ BİDB):* Sistemin ağır yükler, çok sayıda veri ve karmaşık sorgulamalar altındaki iş yapabilme ve tepki verme kabiliyetidir.

- **Test Yöntemi:** Test süiti tarafından bellekte **1.000 adet** yapay kitap verisi üretilmiştir.
- **Test Senaryosu:** 1.000 kayıt üzerinde eşzamanlı metin araması ve kategori filtrelemesi çalıştırılmıştır.
- **Kriter:** Arama tepki süresi < 50 milisaniye.
- **Ölçülen Sonuç:** **3.80 milisaniye**. Bellek tüketimi kararlı kalmış ve tarayıcıda herhangi bir donma yaşanmamıştır.

---

### 4.5. Kullanıcı Kabul Testleri (User Acceptance Testing - UAT)
*Tanım (İTÜ BİDB):* Son kullanıcı veya müşteri gereksinimlerine dayanan ve kabul kriterlerini sınayan nihai testtir.

1. **Öğrenci Kabul Kriterleri:**
   - [x] Okul No ve Şifre ile sisteme erişim.
   - [x] Kitapları kategori ve yazara göre filtreleme.
   - [x] 7, 14 ve 30 günlük kiralama seçeneklerini seçebilme.
   - [x] "Kiralarım" ekranında kalan süreyi ve gecikme durumunu anlık takip edebilme.
2. **Yönetici Kabul Kriterleri:**
   - [x] Yönetici paneline yetkisiz öğrencilerin girişinin engellenmesi.
   - [x] Yeni kitap stoğu tanımlayabilme.
   - [x] Tüm öğrencilerin kiralamalarını izleyebilme ve gecikmiş kitapları teslim alabilme.
   - [x] Verileri fabrika durumuna sıfırlayabilme.

---

### 4.6. Beyaz Kutu & Kara Kutu Test Teknikleri

#### A. Kara Kutu: Sınır Değer Analizi (Boundary Value Analysis - BVA)
İç kod yapısına bakılmaksızın girdi sınırları test edilmiştir:
- **Şifre Karakter Sınırı:** Minimum gereksinim 4 karakterdir.
  - Sınır Altı (3 Karakter): Sistem hata verdi ve kaydı reddetti. (Beklenen)
  - Tam Sınır (4 Karakter): Sistem kaydı başarıyla oluşturdu. (Beklenen)
- **Stok Sınırı:**
  - Stok = 1: Kiralama başarılı oldu.
  - Stok = 0: "Tümü Kirada" uyarısı verildi ve kiralama butonu kilitlendi.

#### B. Beyaz Kutu: Dal Kapsama (Branch Coverage)
Kaynak kodun akış denetimindeki tüm koşul dalları test edilmiştir:
- `gunFarki > 0`: "Teslime X gün kaldı" dalı yürütüldü.
- `gunFarki == 0`: "Bugün Son Gün" dalı yürütüldü.
- `gunFarki < 0`: Gecikme hesaplama ve ceza formülü dalı (`gecikenGun * gunlukUcret * 2`) yürütüldü.

---

## 5. TESTİN SONLANDIRILMASI VE ÇIKIŞ KRİTERLERİ DEĞERLENDİRMESİ

İTÜ BİDB yönergeleri doğrultusunda testin sonlandırılması için belirlenen kriterler denetlenmiştir:

| Test Kriteri | Hedeflenen Kriter | Gerçekleşen Sonuç | Karar |
| :--- | :--- | :--- | :--- |
| **Kritik Hata (Blocker Bug)** | 0 | 0 | Başarılı |
| **Birim Test Başarı Oranı** | %100 | %100 (10/10) | Başarılı |
| **Tümleyim Test Başarı Oranı** | %100 | %100 (3/3) | Başarılı |
| **Regresyon Başarı Oranı** | %100 | %100 (3/3) | Başarılı |
| **Performans Eşiği** | < 50 ms | 3.8 ms | Başarılı |
| **UAT Kabul Oranı** | %100 | %100 | Başarılı |

---

## 6. SONUÇ VE ÖNERİLER

Okul Kütüphanesi Kitap Kiralama Sistemi, İTÜ BİDB "Yazılım Testi ve Test Süreçleri" makalesinde sıralanan tüm aşamalardan (Birim, Tümleyim, Regresyon, Zorlanım, UAT, Kara/Beyaz Kutu) başarıyla geçmiştir. 

Sistemde bulunan tüm iş kuralları (stok tutarlılığı, 2 katı ceza hesaplaması, mükerrer kiralama kısıtı, XSS koruması) doğrulanmış olup, yazılımın **kullanıcı kabulüne uygun ve üretim seviyesinde kaliteli** olduğu tespit edilmiştir.

**Raporu Hazırlayan:**  
Yazılım Test ve Kalite Değerlendirme Ekibi / mazipurfer-lgtm  
Okul Kütüphanesi Projesi
