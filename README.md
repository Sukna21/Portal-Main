# Portal Utama SUKNA XXI Selangor 2026

Portal statik, mobile-first dan sedia untuk GitHub Pages. Kandungan portal telah diselaraskan dengan maklumat rasmi SUKNA XXI Selangor 2026 dan aturcara penuh kejohanan.

## Kandungan portal
- Hero + countdown acara 17-20 September 2026
- Statistik 648 peserta / 6 kontinjen / 20 pejabat
- Aturcara penuh 16-20 September 2026 (pendaftaran awal, makan, rehearsal, pertandingan, final dan majlis rasmi)
- 14 permainan / acara (ringkasan format pertandingan)
- Senarai venue dan pautan arah Google Maps
- Maklumat penginapan & peraturan UPM
- Peraturan am, mata pingat dan bantahan
- Majlis pembukaan & penutup
- Galeri pelan operasi/protokol
- Nombor kecemasan satu sentuhan
- Jadual perlawanan, pelan lokasi, aturcara visual dan cabutan bertuah
- PWA asas (boleh Add to Home Screen; cache halaman utama)

## Cara guna di GitHub Pages
1. Upload semua fail dalam folder ini ke repository baru, contohnya `Sukna21/portal`.
2. GitHub > Settings > Pages.
3. Source: Deploy from a branch > `main` > `/root`.
4. Portal biasanya akan tersedia di `https://sukna21.github.io/portal/`.

## Pautan aplikasi
Pautan `Cabutan Bertuah` dalam portal ditetapkan ke `https://sukna21.github.io/lucky-draw/`.
Pautan `Jadual Perlawanan` menggunakan helaian Google yang pernah digunakan untuk SUKNA21.
Jika URL sebenar berbeza, tukar terus dalam `index.html`.

## Nota kandungan rasmi
- Susunan VVIP/VIP dan maklumat protokol dalam slaid adalah tertakluk kepada pengesahan kehadiran.
- Jadual harian portal telah diselaraskan dengan Aturcara Penuh SUKNA21. Nota rasmi menyatakan sebarang perubahan masa akan dimaklumkan oleh urus setia dari masa ke semasa.


- Tambah halaman kedua `results.html` untuk paparan khas Jadual & Keputusan (tanpa rupa spreadsheet), diakses melalui tab navigasi atas.

- Match Centre page 2 dikemas kini ala antaramuka temasya/SUKMA dan dipautkan kepada 14 gid sukan yang diberi pengguna.

- Halaman Jadual & Keputusan eksperimen telah dikeluarkan semula daripada portal utama. Modul tersebut akan dibangunkan sebagai aplikasi/portal berasingan selepas struktur data Google Sheet disahkan.

- KPZ map fix: Kolej Pendeta Za'aba UPM updated to coordinates `2.9916080474252276,101.70679692588335` in both accommodation card and venue list.

- Koordinat Padang A & Padang B UPM dikemas kini kepada `2.9974363473082057, 101.70580353748177`.

- Kutipan Pingat Keseluruhan kini disambung live ke Google Sheet `15FW6RAQQLHWqPFdHlhjtQrhpB5GoyiAiETumjpOWvoY` dan auto-refresh setiap 60 saat.

- Kutipan pingat live dipulihkan kepada loader Google Sheet versi yang telah berfungsi; label sumber dan status sambungan disorok daripada paparan awam.

- Parser kutipan pingat diperkukuh: padanan nama Zon Sabah, Zon Selatan dan Zon Timur kini toleran kepada nombor/prefix/suffix dan baris pendua tidak lagi menimpa data sah dengan baris kosong.

- Kutipan pingat: parser kini membaca baris header sebenar dalam Google Sheet (bukan bergantung kepada label GViz), jadi Emas/Perak/Gangsa dipetakan ikut kolum sebenar. Setiap 6 zon diaudit satu-per-satu dalam console untuk debugging tanpa memaparkan mesej teknikal kepada pengguna.

- Fix kutipan pingat live: refresh tidak lagi kosongkan jadual kepada 0 sebelum respons Google Sheet tiba. Data terakhir yang sah dikekalkan, request dicuba semula sehingga 3 kali selepas edit Sheet, dan respons lama diabaikan jika refresh baharu telah bermula.

- Kutipan pingat v30: pembacaan Google Sheet kini dikunci tepat kepada B2:E8 (PASUKAN, EMAS, PERAK, GANGSA). Query GViz dijadikan unik pada setiap refresh untuk mengelakkan data lama daripada cache Google. Auto-refresh ditetapkan 15 saat.

- Tambah logo Gatorade sebagai salah satu penaja Silver dalam portal utama.

- Restore Slide 8: Pelan Lokasi Program – Stadium UPM under Galeri & Protokol → Pelan operasi & protokol, while retaining Gatorade as Silver Sponsor.

- Jadual harian kini membuka tab tarikh semasa secara automatik (waktu Malaysia) jika tarikh berada dalam 16–20 September 2026. Di luar tempoh itu, tab pertama digunakan sebagai default.

- Atur cara portal diselaraskan semula dengan dokumen Aturcara Penuh terkini: 16–21 September 2026, termasuk sesi-sesi penyampaian medal pada 18, 19 dan 20 September serta daftar keluar pada 21 September. Default tab tarikh semasa turut menyokong 21 September.

- Atur cara kini menggabungkan semua acara yang mempunyai masa sama ke dalam satu kad, supaya paparan lebih kemas dan logik.

- Kutipan pingat v35: portal kini membaca format B2:J8 (Pasukan, Emas, Perak, Gangsa, Jumlah, Penyertaan, Jumlah Medal, Jumlah Mata, Ked.). Kedudukan ikut kolum KED., dan paparan menambah Jumlah Medal serta Jumlah Mata.


## Post-Event v36
- Portal dipecahkan kepada 4 tab: Utama, Keputusan Akhir, Sorotan & Galeri, Arkib SUKNA XXI.
- Portal asal dikekalkan pada `archive.html`.
- Keputusan akhir dibekukan berdasarkan workbook rasmi.
- Anugerah khas: Juara Keseluruhan Zon Ibu Pejabat; Perbarisan Terbaik Zon Timur; Olahragawan Muhammad Tajjudin bin Roslani (Zon Tengah); Olahragawati Airma Ayusneda binti Ibrahim (Zon Ibu Pejabat).
- Galeri Drive tersedia untuk Perasmian, Penutup, Story dan Montaj. Struktur galeri sukan telah disediakan untuk kemas kini seterusnya.


## v37 — Galeri mengikut acara sukan
- Folder Game disusun semula di portal berdasarkan acara sukan, bukan hari.
- Bola Sepak menggabungkan album Khamis + Final Ahad.
- Bola Tampar Wanita menggabungkan album Sabtu + Ahad + Final.
- Tarik Tali menggabungkan 680kg dan Freeweight di bawah satu kategori galeri.
- Penyampaian medal dipisahkan sebagai bahagian khas.
- Semua pautan menuju terus ke folder Google Drive rasmi.


## v38 — Story & Montaj preview cards
- Kad Story dan Montaj direka semula menjadi lebih visual dan premium.
- Gaya kad menggunakan backdrop preview, overlay sinematik, label jelas dan CTA yang lebih ketara.
- Untuk masa ini, preview menggunakan visual representatif daripada aset portal sedia ada supaya paparan lebih menarik dan konsisten.


## v39 — Poster Johan Perbarisan
- Poster rasmi Johan Perbarisan Zon Timur dimasukkan ke dalam portal.
- Dipaparkan pada bahagian Anugerah & Pencapaian Khas di laman utama.
- Ditambah juga sebagai kad poster dalam halaman Sorotan & Galeri.


## v40 — Hero font refinement
- Tajuk utama `SUKNA XXI / Selangor 2026` ditukar kepada gaya font yang lebih sporty dan lebih dekat dengan feel visual SUKNA.
- Guna gabungan Teko + Barlow Condensed untuk rupa yang lebih kuat, padat dan serasi dengan identiti sukan.
