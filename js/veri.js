/**
 * Okul Kütüphanesi - Kitap Kiralama Sistemi
 * Veri Katmanı ve Kalıcı Hafıza (localStorage) Yönetimi
 */

// Güvenli yerel depolama yardımcısı
// localStorage kapalı veya kısıtlı olduğunda bellekte (memory) çalışmaya devam eder
var bellekDeposu = {};

var yerelDepo = {
    mevcutMu: function() {
        try {
            var testAnahtari = "__test__";
            window.localStorage.setItem(testAnahtari, testAnahtari);
            window.localStorage.removeItem(testAnahtari);
            return true;
        } catch (hata) {
            return false;
        }
    },
    oku: function(anahtar) {
        if (this.mevcutMu()) {
            return window.localStorage.getItem(anahtar);
        }
        return bellekDeposu[anahtar] || null;
    },
    yaz: function(anahtar, deger) {
        if (this.mevcutMu()) {
            try {
                window.localStorage.setItem(anahtar, deger);
                return;
            } catch (hata) {
                // Kota aşımı veya depolama hatası durumunda belleğe yaz
            }
        }
        bellekDeposu[anahtar] = deger;
    },
    sil: function(anahtar) {
        if (this.mevcutMu()) {
            try {
                window.localStorage.removeItem(anahtar);
            } catch (hata) {}
        }
        delete bellekDeposu[anahtar];
    }
};

// Depolama anahtarları
var DEPO_ANAHTARLARI = {
    KITAPLAR: "kutuphane_kitaplar",
    KULLANICILAR: "kutuphane_kullanicilar",
    KIRALAMALAR: "kutuphane_kiralamalar",
    AKTIF_KULLANICI: "kutuphane_aktif_kullanici"
};

// Başlangıç örnek kitap listesi
var VARSAYILAN_KITAPLAR = [
    { id: 1, ad: "Suç ve Ceza", yazar: "Dostoyevski", kategori: "Roman", toplamAdet: 3, gunlukUcret: 1.50 },
    { id: 2, ad: "Küçük Prens", yazar: "Saint-Exupéry", kategori: "Roman", toplamAdet: 4, gunlukUcret: 1.00 },
    { id: 3, ad: "Sefiller", yazar: "Victor Hugo", kategori: "Roman", toplamAdet: 2, gunlukUcret: 2.00 },
    { id: 4, ad: "Algoritmalara Giriş", yazar: "T. Cormen", kategori: "Bilgisayar", toplamAdet: 2, gunlukUcret: 3.00 },
    { id: 5, ad: "Temiz Kod", yazar: "Robert C. Martin", kategori: "Bilgisayar", toplamAdet: 1, gunlukUcret: 2.50 },
    { id: 6, ad: "Kısa Türkiye Tarihi", yazar: "Halil İnalcık", kategori: "Tarih", toplamAdet: 3, gunlukUcret: 1.50 },
    { id: 7, ad: "Fizik 11. Sınıf", yazar: "MEB", kategori: "Ders", toplamAdet: 5, gunlukUcret: 0.50 },
    { id: 8, ad: "Matematik Soru Bankası", yazar: "Karekök Yayınları", kategori: "Ders", toplamAdet: 4, gunlukUcret: 0.50 }
];

// Başlangıç kullanıcıları (Öğrenci: 1001 / 1234, Yönetici: admin / admin123)
var VARSAYILAN_KULLANICILAR = [
    {
        okulNo: "1001",
        sifre: "1234",
        adSoyad: "Ahmet Yılmaz",
        rol: "ogrenci"
    },
    {
        okulNo: "admin",
        sifre: "admin123",
        adSoyad: "Kütüphane Yetkilisi",
        rol: "yonetici"
    }
];

// Başlangıç kiralamaları (Test sunumunda gecikme ve aktif kiralama senaryolarını göstermek için)
// Tarih formatı: YYYY-MM-DD
function tarihOlustur(gunFarki) {
    var d = new Date();
    d.setDate(d.getDate() + gunFarki);
    var yil = d.getFullYear();
    var ay = String(d.getMonth() + 1).padStart(2, "0");
    var gun = String(d.getDate()).padStart(2, "0");
    return yil + "-" + ay + "-" + gun;
}

var VARSAYILAN_KIRALAMALAR = [
    // 1) Aktif normal kiralama (Küçük Prens, 14 günlüğüne kiralanmış, henüz süresi var)
    {
        id: 101,
        ogrenciNo: "1001",
        ogrenciAd: "Ahmet Yılmaz",
        kitapId: 2,
        kitapAdi: "Küçük Prens",
        alisTarihi: tarihOlustur(-4),
        sonTeslimTarihi: tarihOlustur(10),
        gunSayisi: 14,
        gunlukUcret: 1.00,
        toplamUcret: 14.00,
        teslimEdildi: false,
        teslimTarihi: null,
        cezaUcreti: 0
    },
    // 2) Gecikmiş kiralama örneği (Temiz Kod, 10 gün önce kiralanmış, son teslim 3 gün önce geçmiş - Test için)
    {
        id: 102,
        ogrenciNo: "1001",
        ogrenciAd: "Ahmet Yılmaz",
        kitapId: 5,
        kitapAdi: "Temiz Kod",
        alisTarihi: tarihOlustur(-10),
        sonTeslimTarihi: tarihOlustur(-3),
        gunSayisi: 7,
        gunlukUcret: 2.50,
        toplamUcret: 17.50,
        teslimEdildi: false,
        teslimTarihi: null,
        cezaUcreti: 0
    }
];

// Verileri getirme ve kaydetme fonksiyonları
function kitaplariGetir() {
    var ham = yerelDepo.oku(DEPO_ANAHTARLARI.KITAPLAR);
    if (!ham) {
        kitaplariKaydet(VARSAYILAN_KITAPLAR);
        return JSON.parse(JSON.stringify(VARSAYILAN_KITAPLAR));
    }
    try {
        return JSON.parse(ham);
    } catch (e) {
        return VARSAYILAN_KITAPLAR;
    }
}

function kitaplariKaydet(kitaplar) {
    yerelDepo.yaz(DEPO_ANAHTARLARI.KITAPLAR, JSON.stringify(kitaplar));
}

function kullanicilariGetir() {
    var ham = yerelDepo.oku(DEPO_ANAHTARLARI.KULLANICILAR);
    if (!ham) {
        kullanicilariKaydet(VARSAYILAN_KULLANICILAR);
        return JSON.parse(JSON.stringify(VARSAYILAN_KULLANICILAR));
    }
    try {
        return JSON.parse(ham);
    } catch (e) {
        return VARSAYILAN_KULLANICILAR;
    }
}

function kullanicilariKaydet(kullanicilar) {
    yerelDepo.yaz(DEPO_ANAHTARLARI.KULLANICILAR, JSON.stringify(kullanicilar));
}

function kiralamalariGetir() {
    var ham = yerelDepo.oku(DEPO_ANAHTARLARI.KIRALAMALAR);
    if (!ham) {
        kiralamalariKaydet(VARSAYILAN_KIRALAMALAR);
        return JSON.parse(JSON.stringify(VARSAYILAN_KIRALAMALAR));
    }
    try {
        return JSON.parse(ham);
    } catch (e) {
        return VARSAYILAN_KIRALAMALAR;
    }
}

function kiralamalariKaydet(kiralamalar) {
    yerelDepo.yaz(DEPO_ANAHTARLARI.KIRALAMALAR, JSON.stringify(kiralamalar));
}

function aktifKullaniciGetir() {
    var ham = yerelDepo.oku(DEPO_ANAHTARLARI.AKTIF_KULLANICI);
    if (!ham) return null;
    try {
        return JSON.parse(ham);
    } catch (e) {
        return null;
    }
}

function aktifKullaniciKaydet(kullanici) {
    if (!kullanici) {
        yerelDepo.sil(DEPO_ANAHTARLARI.AKTIF_KULLANICI);
    } else {
        yerelDepo.yaz(DEPO_ANAHTARLARI.AKTIF_KULLANICI, JSON.stringify(kullanici));
    }
}

// Verileri fabrika ayarlarına sıfırlama
function verileriSifirla() {
    kitaplariKaydet(VARSAYILAN_KITAPLAR);
    kullanicilariKaydet(VARSAYILAN_KULLANICILAR);
    kiralamalariKaydet(VARSAYILAN_KIRALAMALAR);
    // Aktif oturum korunabilir veya admin olarak devam edebilir
}

// Sayfa ilk yüklendiğinde gerekli veri yapılarını hazırla
function verileriIlkle() {
    if (!yerelDepo.oku(DEPO_ANAHTARLARI.KITAPLAR)) {
        kitaplariKaydet(VARSAYILAN_KITAPLAR);
    }
    if (!yerelDepo.oku(DEPO_ANAHTARLARI.KULLANICILAR)) {
        kullanicilariKaydet(VARSAYILAN_KULLANICILAR);
    }
    if (!yerelDepo.oku(DEPO_ANAHTARLARI.KIRALAMALAR)) {
        kiralamalariKaydet(VARSAYILAN_KIRALAMALAR);
    }
}

// Otomatik başlat
verileriIlkle();
