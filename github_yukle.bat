@echo off
title GitHub'a Yukle (mazipurfer-lgtm)
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo   Okul Kütüphanesi - GitHub Yükleme Sihirbazı
echo ========================================================
echo.
echo Hedef Depo: https://github.com/mazipurfer-lgtm/Kutuphane.git
echo.
echo Şimdi GitHub bağlantısı başlatılıyor...
echo (Ekrana giriş penceresi gelirse 'Sign in with your browser' seçeneğine tıklayın)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   TEBRIKLER! Proje GitHub'a basariyla yuklendi!
    echo ========================================================
) else (
    echo.
    echo Bir sorun olustu. Eger giris yapamadiysaniz Token yontemini deneyebilirsiniz.
)
echo.
pause
