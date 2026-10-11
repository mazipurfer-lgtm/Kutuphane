@echo off
title Okul Kutuphanesi - Yerel Web Sunucusu
chcp 65001 > nul
echo ========================================================
echo   Okul Kutuphanesi - Kitap Kiralama Sistemi
echo ========================================================
echo.
echo [1] Tarayıcı açılıyor: http://localhost:8000
echo [2] Sunucuyu durdurmak için bu pencereyi kapatabilir veya Ctrl+C yapabilirsiniz.
echo.

start "" http://localhost:8000
python -m http.server 8000
