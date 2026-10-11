/**
 * Okul Kütüphanesi - Kitap Kiralama Sistemi
 * İş Mantığı ve Kural İşlemleri
 */

// Para birimi formatlama (Örn: 1.50 ₺)
function paraFormatla(tutar) {
    if (isNaN(tutar)) return "0,00 ₺";
    return Number(tutar).toFixed(2).replace(".", ",") + " ₺";
}

// Tarih formatlama (YYYY-MM-DD -> GG.AA.YYYY)
function tarihFormatla(tarihStr) {
    if (!tarihStr) return "-";
    var parcalar = tarihStr.split("-");
    if (parcalar.length !== 3) return tarihStr;
    return parcalar[2] + "." + parcalar[1] + "." + parcalar[0];
}

// Bugünün tarihini YYYY-MM-DD olarak al
function bugununTarihiStr() {
    var d = new Date();
    var yil = d.getFullYear();
    var ay = String(d.getMonth() + 1).padStart(2, "0");
    var gun = String(d.getDate()).padStart(2, "0");
    return yil + "-" + ay + "-" + gun;
}

// Belirli bir tarihe gün ekleyip YYYY-MM-DD olarak döndür
function gunEkleStr(tarihStr, eklenecekGun) {
    var parcalar = tarihStr.split("-");
    var d = new Date(Number(parcalar[0]), Number(parcalar[1]) - 1, Number(parcalar[2]));
    d.setDate(d.getDate() + Number(eklenecekGun));
    var yil = d.getFullYear();
    var ay = String(d.getMonth() + 1).padStart(2, "0");
    var gun = String(d.getDate()).padStart(2, "0");
    return yil + "-" + ay + "-" + gun;
}

// İki tarih arasındaki gün farkını hesapla (tarih2 - tarih1)
function gunFarkiHesapla(tarihStr1, tarihStr2) {
    var p1 = tarihStr1.split("-");
    var p2 = tarihStr2.split("-");
    var d1 = new Date(Number(p1[0]), Number(p1[1]) - 1, Number(p1[2]));
    var d2 = new Date(Number(p2[0]), Number(p2[1]) - 1, Number(p2[2]));
    var msFark = d2.getTime() - d1.getTime();
    return Math.round(msFark / (1000 * 60 * 60 * 24));
}

// ===================== STOK VE KİTAP İŞLEMLERİ =====================

// Müsait adet hesaplama: Toplam Adet - Teslim Edilmemiş Kiralama Sayısı
function musaitAdetHesapla(kitapId) {
    var kitaplar = kitaplariGetir();
    var kitap = kitaplar.find(function(k) { return k.id === Number(kitapId); });
    if (!kitap) return 0;

    var kiralamalar = kiralamalariGetir();
    var aktifKiraSayisi = 0;
    for (var i = 0; i < kiralamalar.length; i++) {
        if (kiralamalar[i].kitapId === Number(kitapId) && !kiralamalar[i].teslimEdildi) {
            aktifKiraSayisi++;
        }
    }

    var musait = kitap.toplamAdet - aktifKiraSayisi;
    return musait < 0 ? 0 : musait;
}

// Kitap ekleme (Yönetici)
function kitapEkle(ad, yazar, kategori, toplamAdet, gunlukUcret) {
    ad = (ad || "").trim();
    yazar = (yazar || "").trim();
    kategori = (kategori || "").trim();
    toplamAdet = parseInt(toplamAdet, 10);
    gunlukUcret = parseFloat(gunlukUcret);

    if (!ad || !yazar || !kategori) {
        return { basarili: false, mesaj: "Lütfen kitap adı, yazar ve kategori alanlarını doldurunuz." };
    }
    if (isNaN(toplamAdet) || toplamAdet <= 0) {
        return { basarili: false, mesaj: "Kitap adedi en az 1 olmalıdır." };
    }
    if (isNaN(gunlukUcret) || gunlukUcret < 0) {
        return { basarili: false, mesaj: "Geçerli bir günlük kiralama ücreti giriniz." };
    }

    var kitaplar = kitaplariGetir();
    var yeniId = 1;
    if (kitaplar.length > 0) {
        var enBuyukId = Math.max.apply(Math, kitaplar.map(function(k) { return k.id; }));
        yeniId = enBuyukId + 1;
    }

    var yeniKitap = {
        id: yeniId,
        ad: ad,
        yazar: yazar,
        kategori: kategori,
        toplamAdet: toplamAdet,
        gunlukUcret: gunlukUcret
    };

    kitaplar.push(yeniKitap);
    kitaplariKaydet(kitaplar);

    return { basarili: true, mesaj: "Kitap başarıyla eklendi: " + ad, kitap: yeniKitap };
}

// Kitap silme (Yönetici)
// İş Kuralı: Kirada olan kitap silinemez
function kitapSil(kitapId) {
    var kitaplar = kitaplariGetir();
    var kitap = kitaplar.find(function(k) { return k.id === Number(kitapId); });
    if (!kitap) {
        return { basarili: false, mesaj: "Silinmek istenen kitap bulunamadı." };
    }

    var kiralamalar = kiralamalariGetir();
    var kiradaVarMi = kiralamalar.some(function(k) {
        return k.kitapId === Number(kitapId) && !k.teslimEdildi;
    });

    if (kiradaVarMi) {
        return {
            basarili: false,
            mesaj: "Bu kitap şu anda bir veya daha fazla öğrencide kirada olduğu için silinemez."
        };
    }

    var yeniListe = kitaplar.filter(function(k) { return k.id !== Number(kitapId); });
    kitaplariKaydet(yeniListe);

    return { basarili: true, mesaj: "Kitap silindi: " + kitap.ad };
}

// ===================== KULLANICI & GİRİŞ İŞLEMLERİ =====================

// Giriş yap
function girisYap(okulNo, sifre) {
    okulNo = (okulNo || "").trim();
    sifre = (sifre || "").trim();

    if (!okulNo || !sifre) {
        return { basarili: false, mesaj: "Lütfen okul numarası ve şifrenizi giriniz." };
    }

    var kullanicilar = kullanicilariGetir();
    var bulunan = kullanicilar.find(function(k) {
        return k.okulNo.toLowerCase() === okulNo.toLowerCase() && k.sifre === sifre;
    });

    if (!bulunan) {
        return { basarili: false, mesaj: "Hatalı okul numarası veya şifre girdiniz." };
    }

    aktifKullaniciKaydet(bulunan);
    return { basarili: true, mesaj: "Giriş başarılı. Hoş geldiniz, " + bulunan.adSoyad + ".", kullanici: bulunan };
}

// Çıkış yap
function cikisYap() {
    aktifKullaniciKaydet(null);
    return { basarili: true, mesaj: "Oturum başarıyla kapatıldı." };
}

// Öğrenci Kayıt Ol
function kayitOl(adSoyad, okulNo, sifre) {
    adSoyad = (adSoyad || "").trim();
    okulNo = (okulNo || "").trim();
    sifre = (sifre || "").trim();

    if (!adSoyad) {
        return { basarili: false, mesaj: "Lütfen adınızı ve soyadınızı giriniz." };
    }
    if (!okulNo) {
        return { basarili: false, mesaj: "Lütfen okul numaranızı giriniz." };
    }
    if (sifre.length < 4) {
        return { basarili: false, mesaj: "Şifreniz en az 4 karakterden oluşmalıdır." };
    }

    var kullanicilar = kullanicilariGetir();
    var zatenVar = kullanicilar.some(function(k) {
        return k.okulNo.toLowerCase() === okulNo.toLowerCase();
    });

    if (zatenVar) {
        return { basarili: false, mesaj: "Bu okul numarasıyla (" + okulNo + ") zaten kayıtlı bir hesap bulunmaktadır." };
    }

    var yeniKullanici = {
        okulNo: okulNo,
        sifre: sifre,
        adSoyad: adSoyad,
        rol: "ogrenci"
    };

    kullanicilar.push(yeniKullanici);
    kullanicilariKaydet(kullanicilar);
    // Otomatik giriş yaptır
    aktifKullaniciKaydet(yeniKullanici);

    return { basarili: true, mesaj: "Kaydınız tamamlandı ve giriş yapıldı: " + adSoyad, kullanici: yeniKullanici };
}

// ===================== KİRALAMA İŞLEMLERİ =====================

// Öğrencinin bu kitabı şu an aktif olarak kiralayıp kiralamadığını kontrol et
function ogrenciKitabiKiralamisMi(ogrenciNo, kitapId) {
    var kiralamalar = kiralamalariGetir();
    return kiralamalar.some(function(k) {
        return k.ogrenciNo === ogrenciNo && k.kitapId === Number(kitapId) && !k.teslimEdildi;
    });
}

// Kitap kirala
function kitapKirala(kitapId, gunSayisi) {
    var aktif = aktifKullaniciGetir();
    if (!aktif) {
        return { basarili: false, mesaj: "Kitap kiralamak için lütfen önce öğrenci girişi yapınız.", girisGerekli: true };
    }
    if (aktif.rol !== "ogrenci") {
        return { basarili: false, mesaj: "Yönetici hesabı ile kitap kiralanamaz. Lütfen öğrenci hesabı kullanınız." };
    }

    gunSayisi = parseInt(gunSayisi, 10);
    if (![7, 14, 30].includes(gunSayisi)) {
        gunSayisi = 7;
    }

    var kitaplar = kitaplariGetir();
    var kitap = kitaplar.find(function(k) { return k.id === Number(kitapId); });
    if (!kitap) {
        return { basarili: false, mesaj: "Kiralama yapılmak istenen kitap bulunamadı." };
    }

    // İş Kuralı: Stokta olmayan kitap kiralanamaz
    var musait = musaitAdetHesapla(kitap.id);
    if (musait <= 0) {
        return { basarili: false, mesaj: "Bu kitap şu anda stokta tükenmiştir (tümü kirada)." };
    }

    // İş Kuralı: Bir öğrenci aynı kitabı, ilk kiralamasını teslim etmeden tekrar kiralayamaz
    if (ogrenciKitabiKiralamisMi(aktif.okulNo, kitap.id)) {
        return {
            basarili: false,
            mesaj: "Bu kitabı (" + kitap.ad + ") zaten ödünç aldınız. Teslim etmeden tekrar kiralayamazsınız."
        };
    }

    var bugun = bugununTarihiStr();
    var sonTeslim = gunEkleStr(bugun, gunSayisi);
    // Kiralama ücreti = gün sayısı × günlük ücret
    var kiralamaUcreti = gunSayisi * kitap.gunlukUcret;

    var kiralamalar = kiralamalariGetir();
    var yeniId = 101;
    if (kiralamalar.length > 0) {
        var enBuyukId = Math.max.apply(Math, kiralamalar.map(function(k) { return k.id; }));
        yeniId = enBuyukId + 1;
    }

    var yeniKiralama = {
        id: yeniId,
        ogrenciNo: aktif.okulNo,
        ogrenciAd: aktif.adSoyad,
        kitapId: kitap.id,
        kitapAdi: kitap.ad,
        alisTarihi: bugun,
        sonTeslimTarihi: sonTeslim,
        gunSayisi: gunSayisi,
        gunlukUcret: kitap.gunlukUcret,
        toplamUcret: kiralamaUcreti,
        teslimEdildi: false,
        teslimTarihi: null,
        cezaUcreti: 0
    };

    kiralamalar.push(yeniKiralama);
    kiralamalariKaydet(kiralamalar);

    return {
        basarili: true,
        mesaj: "Kiralandı: " + kitap.ad + " (" + gunSayisi + " gün - " + paraFormatla(kiralamaUcreti) + ")",
        kiralama: yeniKiralama
    };
}

// Kiralama Durumu ve Gecikme Cezası Hesaplama
// İş Kuralı: Geç teslimde, gecikilen her gün için günlük ücretin 2 katı gecikme cezası eklenir
function kiralamaDurumunuHesapla(kiralama) {
    if (kiralama.teslimEdildi) {
        var teslimMesaji = "Teslim Edildi (" + tarihFormatla(kiralama.teslimTarihi) + ")";
        if (kiralama.cezaUcreti > 0) {
            teslimMesaji += " - " + paraFormatla(kiralama.cezaUcreti) + " gecikme cezası tahsil edildi";
        }
        return {
            kod: "teslim_edildi",
            etiket: "Teslim Edildi",
            detay: teslimMesaji,
            kalanGun: 0,
            gecikenGun: 0,
            guncelCeza: kiralama.cezaUcreti || 0
        };
    }

    var bugun = bugununTarihiStr();
    // sonTeslimTarihi - bugun
    var fark = gunFarkiHesapla(bugun, kiralama.sonTeslimTarihi);

    if (fark >= 0) {
        // Vakti var
        return {
            kod: "devam_ediyor",
            etiket: fark === 0 ? "Son Gün" : fark + " gün kaldı",
            detay: fark === 0 ? "Bugün son teslim günüdür." : "Teslime " + fark + " gün kaldı.",
            kalanGun: fark,
            gecikenGun: 0,
            guncelCeza: 0
        };
    } else {
        // Gecikmiş
        var geciken = Math.abs(fark);
        // Gecikme cezası = gecikilen gün * günlük ücret * 2
        var ceza = geciken * kiralama.gunlukUcret * 2;
        return {
            kod: "gecikti",
            etiket: geciken + " gün gecikti",
            detay: geciken + " gün gecikme (Ceza: " + paraFormatla(ceza) + ")",
            kalanGun: 0,
            gecikenGun: geciken,
            guncelCeza: ceza
        };
    }
}

// Kitap Teslim Al (Yönetici)
function kitapTeslimAl(kiralamaId) {
    var aktif = aktifKullaniciGetir();
    if (!aktif || aktif.rol !== "yonetici") {
        return { basarili: false, mesaj: "Kitap teslim alma işlemi yalnızca kütüphane yöneticisi tarafından yapılabilir." };
    }

    var kiralamalar = kiralamalariGetir();
    var kiralama = kiralamalar.find(function(k) { return k.id === Number(kiralamaId); });
    if (!kiralama) {
        return { basarili: false, mesaj: "Kiralama kaydı bulunamadı." };
    }

    if (kiralama.teslimEdildi) {
        return { basarili: false, mesaj: "Bu kitap zaten teslim alınmıştır." };
    }

    var durum = kiralamaDurumunuHesapla(kiralama);
    var bugun = bugununTarihiStr();

    kiralama.teslimEdildi = true;
    kiralama.teslimTarihi = bugun;
    kiralama.cezaUcreti = durum.guncelCeza;

    kiralamalariKaydet(kiralamalar);

    var mesaj = "Teslim alındı: " + kiralama.kitapAdi + " (" + kiralama.ogrenciAd + ")";
    if (kiralama.cezaUcreti > 0) {
        mesaj += " | Gecikme Cezası: " + paraFormatla(kiralama.cezaUcreti);
    }

    return {
        basarili: true,
        mesaj: mesaj,
        kiralama: kiralama
    };
}
