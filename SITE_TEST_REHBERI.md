# OKUL KÜTÜPHANESİ - MANUEL TEST REHBERİ
## SİTEYİ ADIM ADIM NASIL TEST ETTİK?

Bu rehber, kütüphane web sitesinde uygulanan test senaryolarını ve bu testleri tarayıcıda bizzat nasıl gerçekleştirebileceğinizi en sade ve anlaşılır şekilde açıklar. Hocanıza anlatırken veya canlı gösterim yaparken bu sırayı takip edebilirsiniz.

---

### 1. Senaryo: Arama ve Kategori Filtreleme Testi (Kara Kutu Testi)
- **Ne Yaptık?:** Ana sayfadaki (Kitap Kataloğu) arama kutusuna `Dostoyevski` yazdık.
- **Beklenen Sonuç:** Sadece "Suç ve Ceza" kitabının filtrelenmesi.
- **Gözlenen Sonuç:** Arama kutusuna yazıldığı anda milisaniyeler içinde tek kitap kaldı. Ardından kategori kutusundan `Roman` seçildi ve tüm romanlar anında listelendi.
- **Karar:** ✅ BAŞARILI.

---

### 2. Senaryo: Öğrenci Girişi ve Kitap Kiralama Testi (Fonksiyonel Test)
- **Ne Yaptık?:** 
  1. Üst menüden **Giriş Yap / Kayıt Ol** sekmesine gidildi.
  2. Hazır öğrenci bilgileri girildi (Okul No: `1001`, Şifre: `1234`).
  3. "Giriş Yap" butonuna basıldı. Sağ üstte "Ahmet Yılmaz (1001)" belirdi ve menüye "Kiralarım" sekmesi açıldı.
  4. Kitaplar sayfasına dönülüp "Sefiller" kitabı için süre `14 Gün` seçildi ve **"Kirala"** butonuna basıldı.
- **Beklenen Sonuç:** Müsait stoğun 1 azalması ve yeşil bildirim mesajı çıkması.
- **Gözlenen Sonuç:** Müsait stok 2'den 1'e düştü, ekranın altında *"Kiralandı: Sefiller (14 gün - 28,00 ₺)"* bildirimi çıktı ve "Kiralarım" sayfasına kayıt eklendi.
- **Karar:** ✅ BAŞARILI.

---

### 3. Senaryo: Mükerrer Kiralama Engeli Testi (İş Kuralı ve Regresyon Testi)
- **Ne Yaptık?:** Ahmet Yılmaz öğrencisi elinde henüz teslim etmediği "Sefiller" kitabı varken, aynı kitaba tekrar gidip **"Kirala"** butonuna bastı.
- **Beklenen Sonuç:** Sistemin kiralama yapmaması ve uyarı vermesi.
- **Gözlenen Sonuç:** Sistem *"Bu kitabı zaten ödünç aldınız. Teslim etmeden tekrar kiralayamazsınız."* uyarısı verdi. Müsait stok eksilmedi.
- **Karar:** ✅ BAŞARILI.

---

### 4. Senaryo: Stok Tükenmesi Sınır Değer Testi (Boundary Value Analysis)
- **Ne Yaptık?:** Kütüphanede stoğu 1 olan "Temiz Kod" kitabı örneği incelendi.
- **Beklenen Sonuç:** Stoğu tükenen kitapta butonun kilitlenmesi veya kiralanamaz uyarısı çıkması.
- **Gözlenen Sonuç:** Müsait stok 0 olduğu için buton pasife geçti ve *"Şu an Kirada"* etiketi görüntülendi. Kiralama engellendi.
- **Karar:** ✅ BAŞARILI.

---

### 5. Senaryo: Gecikme Cezası ve Teslim Alma Testi (Yönetici Paneli & Birim Kuralı)
- **Ne Yaptık?:**
  1. Sağ üstten **Çıkış** yapıldı.
  2. Yönetici bilgileriyle giriş yapıldı (Kullanıcı Adı: `admin`, Şifre: `admin123`).
  3. Menüden **Yönetim** paneline girildi.
  4. Tabloda 3 gün gecikmiş olan "Temiz Kod" kitabı incelendi (Günlük ücret: 2.50 ₺).
- **Beklenen Sonuç:** İş kuralı: `Gecikilen Gün × Günlük Ücret × 2`. Yani `3 × 2.50 × 2 = 15.00 ₺` ceza hesaplanması.
- **Gözlenen Sonuç:** Durum sütununda *"3 gün gecikme (Ceza: 15,00 ₺)"* yazdı.
  - **"Teslim Al"** butonuna basıldığında kitap teslim alındı olarak işaretlendi ve müsait stoğu otomatik olarak yeniden 1'e yükseldi.
- **Karar:** ✅ BAŞARILI.

---

### 6. Senaryo: Kiradaki Kitabı Silme Koruması Testi (Veri Bütünlüğü Testi)
- **Ne Yaptık?:** Yönetim panelindeki "Mevcut Kitap Stoğu" tablosunda, bir öğrencide kirada olan "Küçük Prens" kitabının yanındaki **"Sil"** butonuna tıklandı ve onay verildi.
- **Beklenen Sonuç:** Silme işleminin engellenmesi.
- **Gözlenen Sonuç:** Sistem *"Bu kitap şu anda bir veya daha fazla öğrencide kirada olduğu için silinemez."* hata uyarısı verdi ve kitabı silmedi.
- **Karar:** ✅ BAŞARILI.

---

### 7. Senaryo: Şifre Uzunluğu Sınır Değer Analizi (Kara Kutu Testi - BVA)
- **Ne Yaptık?:** 
  1. Kayıt Ol formuna gidildi.
  2. Okul no: `2001`, İsim: `Mehmet Demir`, Şifre: `123` (3 karakter) girilip "Kayıt Ol"a basıldı. ➔ Sistem *"Şifreniz en az 4 karakter olmalıdır"* diyerek kaydı reddetti.
  3. Şifre `1234` (4 karakter) yapılıp basıldı. ➔ Kayıt başarıyla tamamlandı ve anında giriş yapıldı.
- **Beklenen Sonuç:** 3 karakter hata vermeli, tam sınır olan 4 karakter kabul edilmeli.
- **Gözlenen Sonuç:** Tam olarak beklendiği gibi çalıştı.
- **Karar:** ✅ BAŞARILI.

---

### 8. Senaryo: Kalıcı Hafıza Testi (LocalStorage & Entegrasyon)
- **Ne Yaptık?:** Kiralama yapıldıktan sonra tarayıcı sekmesi tamamen kapatıldı ve tekrar açıldı (`F5` ile yenilendi).
- **Beklenen Sonuç:** Kiralanan kitapların ve güncel stokların silinmemesi.
- **Gözlenen Sonuç:** Tüm veriler tarayıcının `localStorage` alanından eksiksiz geri yüklendi.
- **Karar:** ✅ BAŞARILI.
