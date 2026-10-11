/**
 * Okul Kütüphanesi - Kitap Kiralama Sistemi
 * Arayüz Çizimi, Olaylar (Event Listeners) ve Ekran Yönetimi
 */

// XSS saldırılarına karşı güvenli HTML kaçırma fonksiyonu
function htmlKacir(metin) {
    if (metin === null || metin === undefined) return "";
    var div = document.createElement("div");
    div.textContent = String(metin);
    return div.innerHTML;
}

// Zamanlayıcı referansı
var bildirimZamanlayici = null;

// Alt bildirim çubuğunda (toast) mesaj gösterme
function bildirimGoster(mesaj, tur) {
    tur = tur || "bilgi"; // bilgi, basari, hata, uyari
    var kutu = document.getElementById("bildirim-cubugu");
    if (!kutu) return;

    if (bildirimZamanlayici) {
        clearTimeout(bildirimZamanlayici);
    }

    kutu.className = "bildirim-cubugu gorunur " + tur;
    kutu.textContent = mesaj;

    bildirimZamanlayici = setTimeout(function() {
        kutu.className = "bildirim-cubugu";
    }, 3800);
}

// Sayfalar arasında geçiş fonksiyonu
function sayfaGoster(sayfaId) {
    var aktif = aktifKullaniciGetir();

    // Yetki kontrolleri
    if (sayfaId === "kiralarim") {
        if (!aktif) {
            bildirimGoster("Kiralamalarınızı görüntülemek için lütfen önce giriş yapınız.", "uyari");
            sayfaId = "giris";
        } else if (aktif.rol !== "ogrenci") {
            bildirimGoster("Kiralarım sayfası yalnızca öğrenci hesapları içindir.", "uyari");
            sayfaId = "kitaplar";
        }
    }

    if (sayfaId === "yonetim") {
        if (!aktif || aktif.rol !== "yonetici") {
            bildirimGoster("Kütüphane yönetim paneline yalnızca yetkili kütüphaneci erişebilir.", "hata");
            sayfaId = aktif ? "kitaplar" : "giris";
        }
    }

    // Tüm sayfaları gizle, isteneni aktif yap
    var sayfalar = document.querySelectorAll(".sayfa-bolumu");
    sayfalar.forEach(function(bolum) {
        bolum.classList.remove("aktif-sayfa");
    });

    var secilenSayfa = document.getElementById("sayfa-" + sayfaId);
    if (secilenSayfa) {
        secilenSayfa.classList.add("aktif-sayfa");
    }

    // Menü butonlarının aktiflik durumunu güncelle
    var menuButonlari = document.querySelectorAll(".menu-butonu");
    menuButonlari.forEach(function(btn) {
        if (btn.getAttribute("data-hedef") === sayfaId) {
            btn.classList.add("aktif");
        } else {
            btn.classList.remove("aktif");
        }
    });

    // İlgili sayfanın verilerini tazele
    if (sayfaId === "kitaplar") {
        kataloguCiz();
    } else if (sayfaId === "kiralarim") {
        kiralarimiCiz();
    } else if (sayfaId === "yonetim") {
        yonetimPaneliniCiz();
    }

    // Sayfa tepeye kaysın
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Üst navigasyon menüsünü oturum durumuna göre güncelle
function ustMenuyuGuncelle() {
    var aktif = aktifKullaniciGetir();
    var kullaniciAlani = document.getElementById("kullanici-alani");
    var menuGiris = document.getElementById("menu-btn-giris");
    var menuKiralarim = document.getElementById("menu-btn-kiralarim");
    var menuYonetim = document.getElementById("menu-btn-yonetim");
    var adGostergesi = document.getElementById("kullanici-adi-gostergesi");
    var rolGostergesi = document.getElementById("kullanici-rol-gostergesi");

    if (aktif) {
        // Oturum açık
        if (kullaniciAlani) kullaniciAlani.style.display = "flex";
        if (menuGiris) menuGiris.style.display = "none";

        if (adGostergesi) adGostergesi.textContent = aktif.adSoyad;
        if (rolGostergesi) {
            rolGostergesi.textContent = aktif.rol === "yonetici" ? "(Yönetici)" : "(" + aktif.okulNo + ")";
        }

        // Rolüne göre menü öğelerini ayarla
        if (aktif.rol === "yonetici") {
            if (menuKiralarim) menuKiralarim.style.display = "none";
            if (menuYonetim) menuYonetim.style.display = "inline-block";
        } else {
            if (menuKiralarim) menuKiralarim.style.display = "inline-block";
            if (menuYonetim) menuYonetim.style.display = "none";
        }
    } else {
        // Oturum kapalı
        if (kullaniciAlani) kullaniciAlani.style.display = "none";
        if (menuGiris) menuGiris.style.display = "inline-block";
        if (menuKiralarim) menuKiralarim.style.display = "inline-block";
        if (menuYonetim) menuYonetim.style.display = "inline-block";
    }
}

// ===================== KATALOG (KİTAPLAR) ÇİZİMİ =====================

// Kategorileri filtre açılır kutusuna doldur
function kategorileriGuncelle() {
    var select = document.getElementById("katalog-kategori-select");
    if (!select) return;

    var secili = select.value;
    var kitaplar = kitaplariGetir();
    var kategoriler = [];

    kitaplar.forEach(function(k) {
        if (k.kategori && !kategoriler.includes(k.kategori)) {
            kategoriler.push(k.kategori);
        }
    });

    kategoriler.sort();

    var html = '<option value="">Tüm Kategoriler</option>';
    kategoriler.forEach(function(kat) {
        html += '<option value="' + htmlKacir(kat) + '"' + (secili === kat ? ' selected' : '') + '>' + htmlKacir(kat) + '</option>';
    });

    select.innerHTML = html;
}

// Kitap kataloğunu filtreleyip çiz
function kataloguCiz() {
    var kapsayici = document.getElementById("kitap-listesi-kapsayici");
    var bilgiMetni = document.getElementById("katalog-filtre-bilgisi");
    var aramaInput = document.getElementById("katalog-arama-input");
    var kategoriSelect = document.getElementById("katalog-kategori-select");

    if (!kapsayici) return;

    var aramaMetni = aramaInput ? aramaInput.value.trim().toLowerCase() : "";
    var seciliKategori = kategoriSelect ? kategoriSelect.value : "";

    var tumKitaplar = kitaplariGetir();
    var aktif = aktifKullaniciGetir();

    // Filtreleme
    var filtrelenmis = tumKitaplar.filter(function(kitap) {
        var adUygun = kitap.ad.toLowerCase().indexOf(aramaMetni) !== -1;
        var yazarUygun = kitap.yazar.toLowerCase().indexOf(aramaMetni) !== -1;
        var kategoriUygun = !seciliKategori || kitap.kategori === seciliKategori;
        return (adUygun || yazarUygun) && kategoriUygun;
    });

    if (bilgiMetni) {
        bilgiMetni.textContent = "Toplam " + filtrelenmis.length + " kitap listeleniyor.";
    }

    if (filtrelenmis.length === 0) {
        kapsayici.innerHTML = '<div class="bos-sonuc-kutusu">' +
            '<p>Aradığınız kriterlere uygun kitap bulunamadı.</p>' +
            '<p style="font-size:0.85rem; margin-top:6px;">Arama kelimenizi değiştirebilir veya kategori filtresini temizleyebilirsiniz.</p>' +
            '</div>';
        return;
    }

    var html = "";
    filtrelenmis.forEach(function(kitap) {
        var musait = musaitAdetHesapla(kitap.id);
        var stoktaVar = musait > 0;
        var ogrenciKiralamisMi = (aktif && aktif.rol === "ogrenci") ? ogrenciKitabiKiralamisMi(aktif.okulNo, kitap.id) : false;

        // Varsayılan kiralama süresi 7 gün
        var varsayilanGun = 7;
        var varsayilanUcret = varsayilanGun * kitap.gunlukUcret;

        html += '<div class="kitap-karti" data-kitap-id="' + kitap.id + '">';
        html += '  <div>';
        html += '    <span class="kitap-kategori-etiketi">' + htmlKacir(kitap.kategori) + '</span>';
        html += '    <h3 class="kitap-adi">' + htmlKacir(kitap.ad) + '</h3>';
        html += '    <p class="kitap-yazari">Yazar: ' + htmlKacir(kitap.yazar) + '</p>';

        html += '    <div class="kitap-bilgi-listesi">';
        html += '      <div class="kitap-bilgi-satiri">';
        html += '        <span class="bilgi-etiket">Günlük Kiralama:</span>';
        html += '        <span class="bilgi-deger">' + paraFormatla(kitap.gunlukUcret) + '</span>';
        html += '      </div>';
        html += '      <div class="kitap-bilgi-satiri">';
        html += '        <span class="bilgi-etiket">Müsait Durum:</span>';
        if (stoktaVar) {
            html += '        <span class="bilgi-deger stok-var">' + musait + ' adet müsait (Top: ' + kitap.toplamAdet + ')</span>';
        } else {
            html += '        <span class="bilgi-deger stok-yok">Tümü Kirada (Top: ' + kitap.toplamAdet + ')</span>';
        }
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';

        html += '  <div class="kiralama-secim-alani">';
        if (stoktaVar && !ogrenciKiralamisMi) {
            html += '    <div class="sure-secimi-satiri">';
            html += '      <label for="sure-' + kitap.id + '">Süre:</label>';
            html += '      <select id="sure-' + kitap.id + '" class="sure-select sure-secici" data-kitap-id="' + kitap.id + '" data-ucret="' + kitap.gunlukUcret + '">';
            html += '        <option value="7">7 Gün</option>';
            html += '        <option value="14">14 Gün</option>';
            html += '        <option value="30">30 Gün</option>';
            html += '      </select>';
            html += '    </div>';

            html += '    <div class="hesaplanan-ucret-alani" id="hesap-ucret-' + kitap.id + '">';
            html += '      Kiralama Bedeli: <strong>' + paraFormatla(varsayilanUcret) + '</strong>';
            html += '    </div>';

            html += '    <button type="button" class="buton kitap-kirala-butonu btn-kirala" data-kitap-id="' + kitap.id + '">Kirala</button>';
        } else if (ogrenciKiralamisMi) {
            html += '    <button type="button" class="buton kitap-kirala-butonu" disabled>Şu An Sizde Kirada</button>';
            html += '    <div class="zaten-kirada-uyarisi">Bu kitabı teslim etmeden tekrar kiralayamazsınız.</div>';
        } else {
            html += '    <button type="button" class="buton kitap-kirala-butonu" disabled>Şu an kirada</button>';
            html += '    <div class="zaten-kirada-uyarisi" style="color:var(--yazi-ikincil); background:none; border:none;">Müsait kopya kalmadı.</div>';
        }
        html += '  </div>';

        html += '</div>';
    });

    kapsayici.innerHTML = html;
}

// ===================== KİRALARIM (ÖĞRENCİ) ÇİZİMİ =====================

function kiralarimiCiz() {
    var tabloGovdesi = document.getElementById("kiralarim-tablo-govdesi");
    if (!tabloGovdesi) return;

    var aktif = aktifKullaniciGetir();
    if (!aktif || aktif.rol !== "ogrenci") {
        tabloGovdesi.innerHTML = '<tr><td colspan="6" class="tablo-bos-mesaj">Kiralamalarınızı görmek için lütfen öğrenci girişi yapınız.</td></tr>';
        return;
    }

    var tumKiralamalar = kiralamalariGetir();
    var ogrenciKiralamalari = tumKiralamalar.filter(function(k) {
        return k.ogrenciNo === aktif.okulNo;
    });

    // En yeni en üstte
    ogrenciKiralamalari.reverse();

    if (ogrenciKiralamalari.length === 0) {
        tabloGovdesi.innerHTML = '<tr><td colspan="6" class="tablo-bos-mesaj">Henüz ödünç aldığınız bir kitap bulunmamaktadır. "Kitaplar" sayfasından kiralayabilirsiniz.</td></tr>';
        return;
    }

    var html = "";
    ogrenciKiralamalari.forEach(function(kiralama) {
        var durum = kiralamaDurumunuHesapla(kiralama);

        var durumSinifi = "devam";
        if (durum.kod === "gecikti") {
            durumSinifi = "gecikti";
        } else if (durum.kod === "teslim_edildi") {
            durumSinifi = "teslim";
        }

        html += '<tr>';
        html += '  <td><strong>' + htmlKacir(kiralama.kitapAdi) + '</strong></td>';
        html += '  <td>' + tarihFormatla(kiralama.alisTarihi) + '</td>';
        html += '  <td>' + tarihFormatla(kiralama.sonTeslimTarihi) + '</td>';
        html += '  <td>' + kiralama.gunSayisi + ' Gün</td>';
        html += '  <td>' + paraFormatla(kiralama.toplamUcret) + '</td>';
        html += '  <td>';
        html += '    <span class="durum-etiket ' + durumSinifi + '">' + htmlKacir(durum.etiket) + '</span>';
        if (durum.kod === "gecikti") {
            html += '    <div style="font-size:0.8rem; color:var(--hata-renk); margin-top:2px;">Ceza: +' + paraFormatla(durum.guncelCeza) + '</div>';
        } else if (kiralama.cezaUcreti > 0) {
            html += '    <div style="font-size:0.8rem; color:var(--yazi-ikincil); margin-top:2px;">Ödenen Ceza: ' + paraFormatla(kiralama.cezaUcreti) + '</div>';
        }
        html += '  </td>';
        html += '</tr>';
    });

    tabloGovdesi.innerHTML = html;
}

// ===================== YÖNETİM PANELİ (YÖNETİCİ) ÇİZİMİ =====================

function yonetimPaneliniCiz() {
    var aktif = aktifKullaniciGetir();
    if (!aktif || aktif.rol !== "yonetici") return;

    var kitaplar = kitaplariGetir();
    var kiralamalar = kiralamalariGetir();

    // İstatistikler
    var toplamCesit = kitaplar.length;
    var toplamAdet = 0;
    kitaplar.forEach(function(k) { toplamAdet += Number(k.toplamAdet); });

    var aktifKiradakiAdet = 0;
    kiralamalar.forEach(function(k) {
        if (!k.teslimEdildi) aktifKiradakiAdet++;
    });

    var musaitAdet = toplamAdet - aktifKiradakiAdet;
    if (musaitAdet < 0) musaitAdet = 0;

    var elToplamCesit = document.getElementById("ozet-toplam-cesit");
    var elToplamAdet = document.getElementById("ozet-toplam-adet");
    var elKiradaAdet = document.getElementById("ozet-kirada-adet");
    var elMusaitAdet = document.getElementById("ozet-musait-adet");

    if (elToplamCesit) elToplamCesit.textContent = toplamCesit;
    if (elToplamAdet) elToplamAdet.textContent = toplamAdet;
    if (elKiradaAdet) elKiradaAdet.textContent = aktifKiradakiAdet;
    if (elMusaitAdet) elMusaitAdet.textContent = musaitAdet;

    // 1) Stok Tablosu
    var stokTabloGovdesi = document.getElementById("yonetim-stok-tablo-govdesi");
    if (stokTabloGovdesi) {
        if (kitaplar.length === 0) {
            stokTabloGovdesi.innerHTML = '<tr><td colspan="9" class="tablo-bos-mesaj">Kütüphanede kayıtlı kitap bulunmamaktadır.</td></tr>';
        } else {
            var stokHtml = "";
            kitaplar.forEach(function(kitap) {
                var musait = musaitAdetHesapla(kitap.id);
                var kiradaOlan = kitap.toplamAdet - musait;
                if (kiradaOlan < 0) kiradaOlan = 0;

                stokHtml += '<tr>';
                stokHtml += '  <td>#' + kitap.id + '</td>';
                stokHtml += '  <td><strong>' + htmlKacir(kitap.ad) + '</strong></td>';
                stokHtml += '  <td>' + htmlKacir(kitap.yazar) + '</td>';
                stokHtml += '  <td>' + htmlKacir(kitap.kategori) + '</td>';
                stokHtml += '  <td>' + paraFormatla(kitap.gunlukUcret) + '</td>';
                stokHtml += '  <td>' + kitap.toplamAdet + '</td>';
                stokHtml += '  <td>' + kiradaOlan + '</td>';
                stokHtml += '  <td><strong style="color:' + (musait > 0 ? 'var(--basari-renk)' : 'var(--hata-renk)') + '">' + musait + '</strong></td>';
                stokHtml += '  <td>';
                stokHtml += '    <button type="button" class="buton buton-tehlike buton-kucuk btn-kitap-sil" data-kitap-id="' + kitap.id + '" data-kitap-ad="' + htmlKacir(kitap.ad) + '" ' + (kiradaOlan > 0 ? 'title="Kirada olduğu için silinemez"' : '') + '>Sil</button>';
                stokHtml += '  </td>';
                stokHtml += '</tr>';
            });
            stokTabloGovdesi.innerHTML = stokHtml;
        }
    }

    // 2) Tüm Kiralamalar Tablosu
    var kiralamalarTabloGovdesi = document.getElementById("yonetim-kiralamalar-tablo-govdesi");
    if (kiralamalarTabloGovdesi) {
        if (kiralamalar.length === 0) {
            kiralamalarTabloGovdesi.innerHTML = '<tr><td colspan="8" class="tablo-bos-mesaj">Sistemde kiralama kaydı bulunmamaktadır.</td></tr>';
        } else {
            // En yeni en başta
            var siraliKiralamalar = kiralamalar.slice().reverse();
            var kiraHtml = "";

            siraliKiralamalar.forEach(function(kira) {
                var durum = kiralamaDurumunuHesapla(kira);
                var durumSinifi = "devam";
                if (durum.kod === "gecikti") durumSinifi = "gecikti";
                if (durum.kod === "teslim_edildi") durumSinifi = "teslim";

                kiraHtml += '<tr>';
                kiraHtml += '  <td>#' + kira.id + '</td>';
                kiraHtml += '  <td>' + htmlKacir(kira.ogrenciAd) + ' <span style="font-size:0.8rem; color:var(--yazi-ikincil);">(' + htmlKacir(kira.ogrenciNo) + ')</span></td>';
                kiraHtml += '  <td><strong>' + htmlKacir(kira.kitapAdi) + '</strong></td>';
                kiraHtml += '  <td>' + tarihFormatla(kira.alisTarihi) + '</td>';
                kiraHtml += '  <td>' + tarihFormatla(kira.sonTeslimTarihi) + '</td>';
                kiraHtml += '  <td>' + paraFormatla(kira.toplamUcret) + '</td>';
                kiraHtml += '  <td>';
                kiraHtml += '    <span class="durum-etiket ' + durumSinifi + '">' + htmlKacir(durum.etiket) + '</span>';
                if (durum.kod === "gecikti") {
                    kiraHtml += '    <div style="font-size:0.8rem; color:var(--hata-renk); margin-top:2px;">Ceza: +' + paraFormatla(durum.guncelCeza) + '</div>';
                }
                kiraHtml += '  </td>';
                kiraHtml += '  <td>';
                if (!kira.teslimEdildi) {
                    kiraHtml += '    <button type="button" class="buton buton-kucuk btn-teslim-al" data-kira-id="' + kira.id + '">Teslim Al</button>';
                } else {
                    kiraHtml += '    <span style="font-size:0.82rem; color:var(--yazi-ikincil);">' + tarihFormatla(kira.teslimTarihi) + '</span>';
                }
                kiraHtml += '  </td>';
                kiraHtml += '</tr>';
            });

            kiralamalarTabloGovdesi.innerHTML = kiraHtml;
        }
    }
}

// ===================== ETKİNLİK DİNLEYİCİLERİ (EVENT LISTENERS) =====================

document.addEventListener("DOMContentLoaded", function() {

    // 1) Menü Butonları Tıklamaları
    var menuButonlari = document.querySelectorAll(".menu-butonu");
    menuButonlari.forEach(function(btn) {
        btn.addEventListener("click", function() {
            var hedef = this.getAttribute("data-hedef");
            sayfaGoster(hedef);
        });
    });

    // Logo Tıklaması
    var logoLink = document.getElementById("logo-link");
    if (logoLink) {
        logoLink.addEventListener("click", function(e) {
            e.preventDefault();
            sayfaGoster("kitaplar");
        });
    }

    // 2) Çıkış Yap Butonu
    var btnCikis = document.getElementById("btn-cikis-yap");
    if (btnCikis) {
        btnCikis.addEventListener("click", function() {
            cikisYap();
            ustMenuyuGuncelle();
            bildirimGoster("Oturum kapatıldı.", "bilgi");
            sayfaGoster("kitaplar");
        });
    }

    // 3) Giriş Yap Formu
    var formGiris = document.getElementById("form-giris");
    var girisMesajKutusu = document.getElementById("giris-mesaj-kutusu");

    if (formGiris) {
        formGiris.addEventListener("submit", function(e) {
            e.preventDefault();
            var okulNo = document.getElementById("giris-okul-no").value;
            var sifre = document.getElementById("giris-sifre").value;

            var sonuc = girisYap(okulNo, sifre);
            if (sonuc.basarili) {
                girisMesajKutusu.className = "form-mesaj basari";
                girisMesajKutusu.textContent = sonuc.mesaj;
                ustMenuyuGuncelle();
                bildirimGoster(sonuc.mesaj, "basari");

                formGiris.reset();
                setTimeout(function() {
                    girisMesajKutusu.className = "form-mesaj";
                    if (sonuc.kullanici.rol === "yonetici") {
                        sayfaGoster("yonetim");
                    } else {
                        sayfaGoster("kitaplar");
                    }
                }, 800);
            } else {
                girisMesajKutusu.className = "form-mesaj hata";
                girisMesajKutusu.textContent = sonuc.mesaj;
                bildirimGoster(sonuc.mesaj, "hata");
            }
        });
    }

    // 4) Kayıt Ol Formu
    var formKayit = document.getElementById("form-kayit");
    var kayitMesajKutusu = document.getElementById("kayit-mesaj-kutusu");

    if (formKayit) {
        formKayit.addEventListener("submit", function(e) {
            e.preventDefault();
            var adSoyad = document.getElementById("kayit-ad-soyad").value;
            var okulNo = document.getElementById("kayit-okul-no").value;
            var sifre = document.getElementById("kayit-sifre").value;

            var sonuc = kayitOl(adSoyad, okulNo, sifre);
            if (sonuc.basarili) {
                kayitMesajKutusu.className = "form-mesaj basari";
                kayitMesajKutusu.textContent = sonuc.mesaj;
                ustMenuyuGuncelle();
                bildirimGoster(sonuc.mesaj, "basari");

                formKayit.reset();
                setTimeout(function() {
                    kayitMesajKutusu.className = "form-mesaj";
                    sayfaGoster("kitaplar");
                }, 900);
            } else {
                kayitMesajKutusu.className = "form-mesaj hata";
                kayitMesajKutusu.textContent = sonuc.mesaj;
                bildirimGoster(sonuc.mesaj, "hata");
            }
        });
    }

    // 5) Arama ve Kategori Filtreleme
    var aramaInput = document.getElementById("katalog-arama-input");
    if (aramaInput) {
        aramaInput.addEventListener("input", function() {
            kataloguCiz();
        });
    }

    var kategoriSelect = document.getElementById("katalog-kategori-select");
    if (kategoriSelect) {
        kategoriSelect.addEventListener("change", function() {
            kataloguCiz();
        });
    }

    // 6) Kitap Kartı Süre Değişikliği (Dinamik ücret hesaplama)
    var katalogKapsayici = document.getElementById("kitap-listesi-kapsayici");
    if (katalogKapsayici) {
        katalogKapsayici.addEventListener("change", function(e) {
            if (e.target && e.target.classList.contains("sure-secici")) {
                var select = e.target;
                var kitapId = select.getAttribute("data-kitap-id");
                var gunlukUcret = parseFloat(select.getAttribute("data-ucret"));
                var gunSayisi = parseInt(select.value, 10);
                var toplam = gunSayisi * gunlukUcret;

                var ucretAlani = document.getElementById("hesap-ucret-" + kitapId);
                if (ucretAlani) {
                    ucretAlani.innerHTML = "Kiralama Bedeli: <strong>" + paraFormatla(toplam) + "</strong>";
                }
            }
        });

        // Kitap Kirala Butonu Tıklaması
        katalogKapsayici.addEventListener("click", function(e) {
            if (e.target && e.target.classList.contains("btn-kirala")) {
                var kitapId = e.target.getAttribute("data-kitap-id");
                var select = document.getElementById("sure-" + kitapId);
                var gunSayisi = select ? parseInt(select.value, 10) : 7;

                var sonuc = kitapKirala(kitapId, gunSayisi);
                if (sonuc.basarili) {
                    bildirimGoster(sonuc.mesaj, "basari");
                    kataloguCiz();
                } else {
                    bildirimGoster(sonuc.mesaj, "uyari");
                    if (sonuc.girisGerekli) {
                        sayfaGoster("giris");
                    }
                }
            }
        });
    }

    // 7) Yönetim Paneli: Kitap Ekleme Formu
    var formKitapEkle = document.getElementById("form-kitap-ekle");
    if (formKitapEkle) {
        formKitapEkle.addEventListener("submit", function(e) {
            e.preventDefault();
            var ad = document.getElementById("ekle-kitap-adi").value;
            var yazar = document.getElementById("ekle-yazar").value;
            var kategori = document.getElementById("ekle-kategori").value;
            var adet = document.getElementById("ekle-adet").value;
            var gunlukUcret = document.getElementById("ekle-gunluk-ucret").value;

            var sonuc = kitapEkle(ad, yazar, kategori, adet, gunlukUcret);
            if (sonuc.basarili) {
                bildirimGoster(sonuc.mesaj, "basari");
                formKitapEkle.reset();
                kategorileriGuncelle();
                yonetimPaneliniCiz();
                kataloguCiz();
            } else {
                bildirimGoster(sonuc.mesaj, "hata");
            }
        });
    }

    // 8) Yönetim Paneli: Kitap Silme ve Teslim Alma Tıklamaları (Event Delegation)
    var yonetimSayfasi = document.getElementById("sayfa-yonetim");
    if (yonetimSayfasi) {
        yonetimSayfasi.addEventListener("click", function(e) {
            // Kitap Sil
            if (e.target && e.target.classList.contains("btn-kitap-sil")) {
                var kitapId = e.target.getAttribute("data-kitap-id");
                var kitapAd = e.target.getAttribute("data-kitap-ad");

                var onay = window.confirm('"' + kitapAd + '" adlı kitabı silmek istediğinize emin misiniz?');
                if (onay) {
                    var sonuc = kitapSil(kitapId);
                    if (sonuc.basarili) {
                        bildirimGoster(sonuc.mesaj, "basari");
                        kategorileriGuncelle();
                        yonetimPaneliniCiz();
                        kataloguCiz();
                    } else {
                        bildirimGoster(sonuc.mesaj, "hata");
                    }
                }
            }

            // Teslim Al
            if (e.target && e.target.classList.contains("btn-teslim-al")) {
                var kiraId = e.target.getAttribute("data-kira-id");
                var teslimSonuc = kitapTeslimAl(kiraId);
                if (teslimSonuc.basarili) {
                    bildirimGoster(teslimSonuc.mesaj, "basari");
                    yonetimPaneliniCiz();
                    kataloguCiz();
                } else {
                    bildirimGoster(teslimSonuc.mesaj, "hata");
                }
            }
        });
    }

    // 9) Verileri Sıfırla Butonu
    var btnSifirla = document.getElementById("btn-verileri-sifirla");
    if (btnSifirla) {
        btnSifirla.addEventListener("click", function() {
            var onay = window.confirm("DİKKAT: Tüm kiralama kayıtları, eklenen yeni kitaplar ve kullanıcılar başlangıç durumuna döndürülecek. Bu işlemi onaylıyor musunuz?");
            if (onay) {
                verileriSifirla();
                kategorileriGuncelle();
                yonetimPaneliniCiz();
                kataloguCiz();
                kiralarimiCiz();
                bildirimGoster("Tüm veriler başlangıç fabrika ayarlarına sıfırlandı.", "bilgi");
            }
        });
    }

    // İlk Başlatma Rutini
    ustMenuyuGuncelle();
    kategorileriGuncelle();
    sayfaGoster("kitaplar");
});


