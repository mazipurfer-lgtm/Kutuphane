/**
 * Okul Kütüphanesi - Yazılım Test Laboratuvarı ve Dinamik Test Süiti
 * Referans: İTÜ BİDB "Yazılım Testi ve Test Süreçleri" Makalesi
 * 
 * Kapsanan Testler:
 * 1. Birim Testleri (Unit Testing)
 * 2. Tümleyim Testleri (Integration Testing)
 * 3. Regresyon Testleri (Regression Testing)
 * 4. Zorlanım ve Performans Testi (Performance & Stress Testing)
 * 5. Kullanıcı Kabul Testi (User Acceptance Testing - UAT)
 * 6. Beyaz Kutu & Kara Kutu Doğrulamaları
 */

var TestLaboratuvari = (function() {
    var testSonuclari = [];
    var testSayaclari = { toplam: 0, basarili: 0, basarisiz: 0 };

    function assert(kosul, testAdi, detay) {
        testSayaclari.toplam++;
        var sonuc = {
            id: testSayaclari.toplam,
            ad: testAdi,
            basarili: !!kosul,
            detay: detay || (kosul ? "Test başarıyla tamamlandı (Beklenen = Gözlenen)." : "HATA: Beklenen sonuç elde edilemedi!")
        };
        if (kosul) {
            testSayaclari.basarili++;
        } else {
            testSayaclari.basarisiz++;
        }
        testSonuclari.push(sonuc);
        return sonuc;
    }

    // 1. BİRİM TESTLERİ (UNIT TESTING)
    function birimTestleriniKos() {
        var sonuclar = [];

        // UT-01: Para Formatlama Testi
        var para1 = paraFormatla(12.5);
        sonuclar.push(assert(para1 === "12,50 ₺", "UT-01: paraFormatla() Standart Değer", "12.5 değeri '12,50 ₺' formatına dönüştürülmeli. Gözlenen: " + para1));

        var para2 = paraFormatla("gecersiz");
        sonuclar.push(assert(para2 === "0,00 ₺", "UT-02: paraFormatla() Hatalı/NaN Değer", "Geçersiz giriş '0,00 ₺' dönmeli. Gözlenen: " + para2));

        // UT-03: Tarih Formatlama Testi
        var tarihFormati = tarihFormatla("2026-10-15");
        sonuclar.push(assert(tarihFormati === "15.10.2026", "UT-03: tarihFormatla() Standart Format", "YYYY-MM-DD formatı GG.AA.YYYY olmalı. Gözlenen: " + tarihFormati));

        // UT-04: Tarih Ekleme Testi
        var ileriTarih = gunEkleStr("2026-10-10", 7);
        sonuclar.push(assert(ileriTarih === "2026-10-17", "UT-04: gunEkleStr() 7 Gün Ekleme", "10 Ekim + 7 gün = 17 Ekim olmalı. Gözlenen: " + ileriTarih));

        // UT-05: Gün Farkı Hesaplama Testi
        var fark = gunFarkiHesapla("2026-10-10", "2026-10-24");
        sonuclar.push(assert(fark === 14, "UT-05: gunFarkiHesapla() Gün Farkı", "10-24 Ekim farkı 14 gün olmalı. Gözlenen: " + fark));

        // UT-06: Müsait Stok Fonksiyonu (ID: 1 Suç ve Ceza, toplam 3, kirada 0 -> müsait 3)
        var musait1 = musaitAdetHesapla(1);
        sonuclar.push(assert(musait1 === 3, "UT-06: musaitAdetHesapla() Kirada Olmayan Kitap", "ID 1 için müsait stok 3 olmalı. Gözlenen: " + musait1));

        // UT-07: Müsait Stok Fonksiyonu (ID: 2 Küçük Prens, toplam 4, 1 kopyası aktif kirada -> müsait 3)
        var musait2 = musaitAdetHesapla(2);
        sonuclar.push(assert(musait2 === 3, "UT-07: musaitAdetHesapla() Kirada Olan Kitap", "ID 2 için 1 kiralama sonrası müsait stok 3 olmalı. Gözlenen: " + musait2));

        // UT-08: Gecikme Cezası Hesaplama (İş Kuralı: Günlük Ücret x Geciken Gün x 2)
        // Simüle kiralama: Günlük ücret 2.50 TL, 3 gün gecikmiş -> Ceza = 3 * 2.50 * 2 = 15.00 TL
        var ornekGecikmisKira = {
            id: 999,
            gunlukUcret: 2.50,
            teslimEdildi: false,
            sonTeslimTarihi: gunEkleStr(bugununTarihiStr(), -3)
        };
        var durum = kiralamaDurumunuHesapla(ornekGecikmisKira);
        sonuclar.push(assert(durum.kod === "gecikti" && durum.guncelCeza === 15.00, "UT-08: kiralamaDurumunuHesapla() 2 Katı Ceza Kuralı", "3 gün gecikme x 2.50 TL x 2 katı = 15.00 ₺ ceza olmalı. Gözlenen: " + durum.guncelCeza + " ₺"));

        // UT-09: XSS Kaçırma Güvenliği (htmlKacir)
        var guvenli = htmlKacir("<script>alert('xss')</script>");
        sonuclar.push(assert(!guvenli.includes("<script>"), "UT-09: htmlKacir() XSS Önleme", "Zararlı script etiketleri kaçırılmalı (&lt;script&gt;). Gözlenen: " + guvenli));

        // UT-10: Kitap Ekleme Doğrulama (Geçersiz Girdi)
        var gecersizEkleme = kitapEkle("", "", "", -5, -2);
        sonuclar.push(assert(gecersizEkleme.basarili === false, "UT-10: kitapEkle() Negatif/Boş Veri Koruması", "Boş ad ve negatif stok reddedilmeli. Mesaj: " + gecersizEkleme.mesaj));

        return sonuclar;
    }

    // 2. TÜMLEYİM TESTLERİ (INTEGRATION TESTING)
    function tumleyimTestleriniKos() {
        var sonuclar = [];

        // IT-01: Öğrenci Girişi -> Kiralama Yapma -> Stok Azalması Entegrasyonu
        var ogrenci = girisYap("1001", "1234");
        var baslangicMusait = musaitAdetHesapla(3); // Sefiller (toplam 2)
        var kiraSonuc = kitapKirala(3, 14);
        var yeniMusait = musaitAdetHesapla(3);

        sonuclar.push(assert(
            kiraSonuc.basarili && yeniMusait === (baslangicMusait - 1),
            "IT-01: Kiralama -> Stok Senkronizasyon Entegrasyonu",
            "Kiralama başarıyla kaydedilmeli ve müsait stok 1 azalmalı. Yeni Stok: " + yeniMusait
        ));

        // IT-02: Kiralarım Listesi ve Kalıcı Hafıza (localStorage) Entegrasyonu
        var tumKiralar = kiralamalariGetir();
        var sonKira = tumKiralar.find(function(k) { return k.kitapId === 3 && k.ogrenciNo === "1001" && !k.teslimEdildi; });
        sonuclar.push(assert(
            sonKira !== undefined && sonKira.gunSayisi === 14,
            "IT-02: Kiralama -> Depo (localStorage) Kayıt Entegrasyonu",
            "Kiralama veritabanına/localStorage'a kalıcı olarak yazılmalı."
        ));

        // IT-03: Yönetici Girişi -> Kitap Teslim Alma -> Ceza & Stok İade Entegrasyonu
        girisYap("admin", "admin123");
        var teslimSonuc = kitapTeslimAl(sonKira.id);
        var iadeSonrasiMusait = musaitAdetHesapla(3);

        sonuclar.push(assert(
            teslimSonuc.basarili && iadeSonrasiMusait === baslangicMusait,
            "IT-03: Teslim Alma -> Stok Serbest Bırakma Entegrasyonu",
            "Teslim edilen kitap stoğu anında yeniden serbest bırakmalı. Güncel Stok: " + iadeSonrasiMusait
        ));

        return sonuclar;
    }

    // 3. REGRESYON TESTLERİ (REGRESSION TESTING)
    function regresyonTestleriniKos() {
        var sonuclar = [];

        // RT-01: Mükerrer Kiralama Engeli ve İade Sonrası Tekrar Kiralama Kabiliyeti
        girisYap("1001", "1234");
        var ilkKira = kitapKirala(6, 7); // Kısa Türkiye Tarihi
        var mukerrerKira = kitapKirala(6, 7); // İkinci kez kiralamaya çalış

        sonuclar.push(assert(
            mukerrerKira.basarili === false,
            "RT-01: Mükerrer Kiralama Güvenlik Regresyonu",
            "Öğrencinin elinde olan kitabı ikinci kez alması engellenmeli. Mesaj: " + mukerrerKira.mesaj
        ));

        // Teslim edildikten sonra tekrar kiralayabilmeli (hata oluşmadığının teyidi)
        girisYap("admin", "admin123");
        var sonKayit = kiralamalariGetir().find(function(k) { return k.kitapId === 6 && !k.teslimEdildi; });
        kitapTeslimAl(sonKayit.id);

        girisYap("1001", "1234");
        var tekrarKira = kitapKirala(6, 7);
        sonuclar.push(assert(
            tekrarKira.basarili === true,
            "RT-02: İade Sonrası Yeniden Kiralama Regresyonu",
            "Teslimat tamamlandıktan sonra öğrenci aynı kitabı sorunsuz yeniden kiralayabilmeli."
        ));

        // RT-03: Kiradaki Kitabı Silme Koruması (Yönetici)
        girisYap("admin", "admin123");
        var silmeSonuc = kitapSil(6);
        sonuclar.push(assert(
            silmeSonuc.basarili === false,
            "RT-03: Kiradaki Kitabı Silme Bütünlük Regresyonu",
            "Kirada aktif kaydı bulunan kitap silinemez kuralı korunmalı. Mesaj: " + silmeSonuc.mesaj
        ));

        return sonuclar;
    }

    // 4. ZORLANIM & PERFORMANS TESTİ (PERFORMANCE & STRESS TESTING)
    function performansTestiniKos() {
        var sonuclar = [];
        var baslangicZamani = performance.now();

        // 1.000 adet sanal kitap oluştur ve arama filtresine sok
        var simuleKitaplar = [];
        for (var i = 1; i <= 1000; i++) {
            simuleKitaplar.push({
                id: 10000 + i,
                ad: "Test Kitabı " + i,
                yazar: "Test Yazarı " + (i % 50),
                kategori: (i % 2 === 0) ? "Roman" : "Bilim",
                toplamAdet: (i % 10) + 1,
                gunlukUcret: 1.50
            });
        }

        // Filtreleme benchmarkı
        var aramaBaslangic = performance.now();
        var aramaSonucu = simuleKitaplar.filter(function(k) {
            return k.ad.toLowerCase().includes("test kitabı 77") || k.yazar.toLowerCase().includes("test yazarı 12");
        });
        var aramaBitis = performance.now();
        var aramaSuresi = (aramaBitis - aramaBaslangic).toFixed(2);

        sonuclar.push(assert(
            aramaSuresi < 50,
            "PT-01: 1.000 Kitap İçinde Arama Performansı",
            "1.000 kayıt üzerinde filtreleme 50ms altında tamamlanmalı. Ölçülen: " + aramaSuresi + " ms (" + aramaSonucu.length + " sonuç)"
        ));

        var toplamSure = (performance.now() - baslangicZamani).toFixed(2);
        sonuclar.push(assert(
            toplamSure < 150,
            "PT-02: Yük ve Bellek Dayanıklılık Testi",
            "Tüm stres ve bellek iterasyonu 150ms altında gerçekleşmeli. Ölçülen: " + toplamSure + " ms"
        ));

        return sonuclar;
    }

    // 5. KULLANICI KABUL TESTLERİ (UAT - USER ACCEPTANCE TESTING)
    function kullaniciKabulTestleriniKos() {
        var sonuclar = [];

        // UAT-01: Öğrenci Rolü Kabul Kriteri
        girisYap("1001", "1234");
        var aktifOgrenci = aktifKullaniciGetir();
        sonuclar.push(assert(
            aktifOgrenci && aktifOgrenci.rol === "ogrenci",
            "UAT-01: Öğrenci Rolü ve Oturum Kabul Kriteri",
            "Öğrenci numarası ve şifre ile başarılı giriş yapılmalı ve rol 'ogrenci' olmalı."
        ));

        // UAT-02: Yönetici Rolü Kabul Kriteri
        girisYap("admin", "admin123");
        var aktifYonetici = aktifKullaniciGetir();
        sonuclar.push(assert(
            aktifYonetici && aktifYonetici.rol === "yonetici",
            "UAT-02: Yönetici Rolü ve Yetki Kabul Kriteri",
            "Yönetici hesabı yetkilendirilmeli ve rol 'yonetici' olmalı."
        ));

        // UAT-03: Kiralama Gün Seçenekleri Kabul Kriteri (Yalnızca 7, 14, 30 gün)
        girisYap("1001", "1234");
        var gecersizGunKira = kitapKirala(1, 99); // 99 gün geçersizdir, sistem 7'ye çekmeli
        sonuclar.push(assert(
            gecersizGunKira.kiralama && [7, 14, 30].includes(gecersizGunKira.kiralama.gunSayisi),
            "UAT-03: Geçerli Kiralama Süreleri Kabul Kriteri",
            "Sistem yalnızca izin verilen kiralama periyotlarını (7, 14, 30) kabul etmeli."
        ));

        return sonuclar;
    }

    // 6. BEYAZ KUTU & KARA KUTU ANALİZİ
    function karaKutuVeBeyazKutuTestleriniKos() {
        var sonuclar = [];

        // BVA-01 (Boundary Value Analysis): Şifre Uzunluğu Sınır Değer Testi
        // Min uzunluk = 4. 3 karakter -> HATA, 4 karakter -> BAŞARILI
        var testNo1 = "9001";
        var testNo2 = "9002";
        var kisaSifre = kayitOl("Test Ali", testNo1, "123");
        var sinirSifre = kayitOl("Test Veli", testNo2, "1234");

        sonuclar.push(assert(
            kisaSifre.basarili === false && sinirSifre.basarili === true,
            "BVA-01: Kara Kutu Sınır Değer Analizi (Şifre Sınırı 4 Karakter)",
            "3 karakter şifre reddedilmeli, tam sınır olan 4 karakter şifre kabul edilmeli."
        ));

        // WBT-01 (White Box Testing): Branch Coverage - gunFarkiHesapla Negatif/Pozitif/Sıfır Dallanmaları
        var bugun = bugununTarihiStr();
        var yarin = gunEkleStr(bugun, 1);
        var dun = gunEkleStr(bugun, -1);

        var durumPozitif = gunFarkiHesapla(bugun, yarin); // 1
        var durumSifir = gunFarkiHesapla(bugun, bugun);   // 0
        var durumNegatif = gunFarkiHesapla(bugun, dun);   // -1

        sonuclar.push(assert(
            durumPozitif === 1 && durumSifir === 0 && durumNegatif === -1,
            "WBT-01: Beyaz Kutu Dal Kapsama (Branch Coverage) Testi",
            "Tüm karar dalları (kalan gün > 0, son gün = 0, gecikme < 0) doğru yürütülmeli."
        ));

        return sonuclar;
    }

    // TÜM TESTLERİ BİR ARADA ÇALIŞTIR
    function tumTestleriCalistir() {
        testSonuclari = [];
        testSayaclari = { toplam: 0, basarili: 0, basarisiz: 0 };

        var rapor = {
            baslangic: new Date().toLocaleTimeString(),
            kategoriler: [
                { baslik: "1. Birim Testleri (Unit Testing)", testler: birimTestleriniKos() },
                { baslik: "2. Tümleyim Testleri (Integration Testing)", testler: tumleyimTestleriniKos() },
                { baslik: "3. Regresyon Testleri (Regression Testing)", testler: regresyonTestleriniKos() },
                { baslik: "4. Zorlanım ve Performans Testi (Performance Testing)", testler: performansTestiniKos() },
                { baslik: "5. Kullanıcı Kabul Testi (User Acceptance Testing)", testler: kullaniciKabulTestleriniKos() },
                { baslik: "6. Beyaz Kutu & Kara Kutu Doğrulamaları", testler: karaKutuVeBeyazKutuTestleriniKos() }
            ],
            ozet: testSayaclari
        };

        // Testler bittikten sonra veritabanını temiz fabrika durumuna geri al
        verileriSifirla();
        aktifKullaniciKaydet(null);

        return rapor;
    }

    return {
        calistir: tumTestleriCalistir
    };
})();
