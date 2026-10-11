# Okul Kütüphanesi - Kitap Kiralama Sistemi

Bu proje, bir okul kütüphanesinde öğrencilerin kitapları belirli sürelerle (7, 14, 30 gün) günlük ücret karşılığı ödünç kiralayabildiği, yöneticilerin ise stok ve teslimat takibini gerçekleştirebildiği web tabanlı bir kütüphane yönetim ve kiralama sistemidir.

Proje, yazılım test ve kalite değerlendirme aşaması sunumlarında kullanılmak üzere tasarlanmıştır.

---

## 🎯 Proje Özellikleri ve İş Kuralları

1. **Kitap Satışı Yoktur:** Sistem yalnızca günlük kiralama modeline dayanır.
2. **Kiralama Ücreti:** `Kiralama Ücreti = Gün Sayısı × Günlük Ücret`
3. **Müsait Stok Takibi:** `Müsait Adet = Toplam Stok - Teslim Edilmemiş Aktif Kiralama Sayısı`
4. **Stok Kontrolü:** Stokta olmayan veya tüm kopyaları kirada olan kitap kiralanamaz ("Şu an kirada" uyarısı verilir).
5. **Mükerrer Kiralama Engeli:** Bir öğrenci, henüz teslim etmediği bir kitabı ikinci kez kiralayamaz.
6. **Gecikme Cezası Kuralı:** Kitap son teslim tarihinden geç getirilirse, gecikilen her gün için kitabın günlük kiralama ücretinin **2 katı** gecikme cezası uygulanır.
7. **Silme Güvencesi:** Öğrencilerde aktif olarak kirada olan kitaplar sistemden silinemez.
8. **Anlık Bildirimler:** Her kiralama, teslim alma ve işlem sonrası ekranın altında kullanıcı dostu bildirim mesajı (toast) görüntülenir.
9. **Kalıcı Hafıza & Bellek Güvencesi:** Veriler tarayıcının `localStorage` alanında saklanır; `localStorage` kısıtlı veya kapalı olsa dahi uygulama bellek (in-memory) üzerinde kesintisiz çalışır.

---

## 👥 Kullanıcı Rolleri ve Hazır Deneme Hesapları

Yazılım testi ve sunum esnasında test edilebilmesi için sistemde 2 varsayılan hesap hazır bulunmaktadır:

| Rol | Kullanıcı / Okul No | Şifre | Yetkiler |
| :--- | :--- | :--- | :--- |
| **Öğrenci** | `1001` | `1234` | Kitapları inceleme, arama, filtreleme, kiralama, "Kiralarım" listesini görme |
| **Yönetici (Kütüphaneci)** | `admin` | `admin123` | Yeni kitap ekleme, kitap silme, stok listesi, tüm kiralamaları görme, teslim alma, verileri sıfırlama |

> Yeni öğrenciler "Giriş Yap / Kayıt Ol" ekranından kendi okul numaralarıyla anında hesap açabilir. Aynı okul numarasıyla mükerrer kayıt engellenir.

---

## 📁 Dosya Yapısı

```text
kutuphane/
├── index.html          # Ana sayfa, anlamsal HTML5 yapısı ve erişilebilir arayüz
├── css/
│   └── stil.css        # Sade, kurumsal, koyu mod destekli, responsive stil kodları
├── js/
│   ├── veri.js         # Başlangıç verileri, model yapıları ve localStorage / bellek yönetimi
│   ├── islemler.js     # Kiralama, teslim alma, stok, ceza hesaplama ve giriş/kayıt iş kuralları
│   └── arayuz.js       # Dinamik ekran çizimleri, arama/filtreleme, XSS kaçırma ve olay dinleyicileri
└── README.md           # Proje tanıtım ve çalıştırma kılavuzu
```

---

## 🚀 Nasıl Çalıştırılır?

Proje tamamen **HTML, CSS ve saf (vanilla) JavaScript** ile geliştirilmiştir. Herhangi bir derleme (build) aracı, sunucu veya veritabanı kurulumu gerektirmez.

1. Proje klasöründeki `index.html` dosyasına çift tıklayarak herhangi bir modern tarayıcıda (Chrome, Edge, Safari, Firefox) doğrudan açabilirsiniz.
2. Veya bir yerel sunucu ile çalıştırmak isterseniz:
   ```bash
   # Python ile
   python3 -m http.server 8000
   # Tarayıcıda http://localhost:8000 adresini açın
   ```

---

## 🧪 Yazılım Test Aşaması Örnek Senaryoları

- **Senaryo 1 (Katalog & Arama):** Arama kutusuna "Dostoyevski" veya "Roman" yazarak anlık filtrelemeyi test edin.
- **Senaryo 2 (Öğrenci Kiralama):** `1001` / `1234` ile giriş yapın, bir kitap seçip (örneğin 14 gün) kiralayın. Müsait stok sayısının azaldığını ve "Kiralarım" sekmesine eklendiğini gözlemleyin.
- **Senaryo 3 (Mükerrer Kiralama Engeli):** Aynı kitabı tekrar kiralamayı deneyin; sistem teslim edilmeden kiralanamayacağı uyarısını verecektir.
- **Senaryo 4 (Gecikme Cezası & Teslim Alma):** `admin` / `admin123` ile giriş yapın. Yönetim panelindeki kiralama tablosunda önceden tanımlanmış gecikmiş kitap örneği üzerindeki gecikme gününü ve 2 katı ceza hesabını test edin. "Teslim Al" butonuna basarak teslim işlemini tamamlayın.
- **Senaryo 5 (Kiradaki Kitabı Silme Koruması):** Kirada olan bir kitabı silmeye çalışın; iş kuralı devreye girerek silinmesini engelleyecektir.
