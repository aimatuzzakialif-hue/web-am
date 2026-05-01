/* SCRIPT AMBULANMU SEYEGAN - WITH EMERGENCY FORM */
let nomorWA = "6285713322154";

const BULAN_MAX_HARI = {
    'Januari': 31, 'Februari': 28, 'Maret': 31, 'April': 30,
    'Mei': 31, 'Juni': 30, 'Juli': 31, 'Agustus': 31,
    'September': 30, 'Oktober': 31, 'November': 30, 'Desember': 31
};

const BULAN_LIST = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/* =========================
   INISIALISASI BULAN
========================= */
function initBulan() {
    ['bulan1', 'bulan2', 'bulan3'].forEach(id => {
        let select = document.getElementById(id);
        if (!select) return;
        BULAN_LIST.forEach(bulan => {
            let option = document.createElement('option');
            option.value = bulan;
            option.textContent = bulan;
            select.appendChild(option);
        });
    });
}

function updateTanggalMax(bulanId, tanggalId) {
    let bulanSelect = document.getElementById(bulanId);
    let tanggalInput = document.getElementById(tanggalId);
    if (!bulanSelect || !tanggalInput) return;

    bulanSelect.onchange = function () {
        let bulan = this.value;
        let maxHari = bulan ? BULAN_MAX_HARI[bulan] : 31;
        tanggalInput.max = maxHari;
        if (parseInt(tanggalInput.value) > maxHari) tanggalInput.value = '';
    };

    tanggalInput.oninput = function () {
        let val = parseInt(this.value);
        let maxHari = bulanSelect.value ? BULAN_MAX_HARI[bulanSelect.value] : 31;
        if (val > maxHari) this.value = maxHari;
    };
}

/* =========================
   MAP LEAFLET - REUSABLE
========================= */
let mapInstance, markerInstance, currentTargetField;

function bukaMap(targetField) {
    currentTargetField = targetField;
    document.getElementById("mapModal").style.display = "block";

    setTimeout(() => {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = '';

        mapInstance = L.map('map').setView([-7.714, 110.341], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapInstance);

        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="font-size:28px;">📍</div>',
            iconSize: [32, 40],
            iconAnchor: [16, 40]
        });

        mapInstance.on('click', function (e) {
            if (markerInstance) mapInstance.removeLayer(markerInstance);
            markerInstance = L.marker(e.latlng, { icon: customIcon }).addTo(mapInstance);
            mapInstance.setView(e.latlng, 17);

            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);

            markerInstance.bindPopup(`
                <div style="text-align:center; min-width:200px;">
                    <b>LOKASI TERPILIH</b><br><br>
                    Lat: <strong>${lat}</strong><br>
                    Lng: <strong>${lng}</strong><br><br>
                    <button onclick="simpanLokasi(${lat}, ${lng})"
                            style="width:100%; padding:12px; background:#ff6b35; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">
                        SIMPAN LOKASI
                    </button>
                </div>
            `).openPopup();
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 16),
                () => {}
            );
        }

        mapInstance.invalidateSize();
    }, 200);
}

/* =========================
   SIMPAN LOKASI DARI MAP
========================= */
function simpanLokasi(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`, {
        headers: { 'User-Agent': 'AmbulanMu-Seyegan/4.0' }
    })
    .then(res => res.json())
    .then(data => {
        let alamat = data.display_name || `Koordinat: ${lat}, ${lng}`;
        let value = `${alamat} | https://maps.google.com/?q=${lat},${lng}`;

        let el = document.getElementById(currentTargetField);
        el.value = value;
        el.style.backgroundColor = '#d4edda';
        setTimeout(() => el.style.backgroundColor = '', 1500);

        simpanData();
        tutupMap();
        alert('✅ Lokasi berhasil disimpan!');
    })
    .catch(() => {
        let value = `Lat:${lat}, Lng:${lng} | https://maps.google.com/?q=${lat},${lng}`;
        document.getElementById(currentTargetField).value = value;
        simpanData();
        tutupMap();
    });
}

/* =========================
   CARI ALAMAT DI MAP
========================= */
function cariAlamat() {
    let query = document.getElementById('mapSearchInput').value.trim();
    if (!query) return;

    let btn = document.getElementById('mapSearchBtn');
    btn.textContent = '⏳';
    btn.disabled = true;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=id&countrycodes=id`, {
        headers: { 'User-Agent': 'AmbulanMu-Seyegan/4.0' }
    })
    .then(res => res.json())
    .then(results => {
        btn.textContent = 'Cari';
        btn.disabled = false;

        if (!results || results.length === 0) {
            alert('Alamat tidak ditemukan. Coba kata kunci lain.');
            return;
        }

        let dropdown = document.getElementById('mapSearchResults');
        dropdown.innerHTML = '';
        dropdown.style.display = 'block';

        results.forEach(item => {
            let div = document.createElement('div');
            div.textContent = item.display_name;
            div.style.cssText = 'padding:10px 14px; cursor:pointer; border-bottom:1px solid #eee; font-size:13px; line-height:1.4;';
            div.onmouseover = () => div.style.background = '#fff3eb';
            div.onmouseout = () => div.style.background = '';
            div.onclick = () => {
                let lat = parseFloat(item.lat);
                let lng = parseFloat(item.lon);
                mapInstance.setView([lat, lng], 17);

                let customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="font-size:28px;">📍</div>',
                    iconSize: [32, 40],
                    iconAnchor: [16, 40]
                });

                if (markerInstance) mapInstance.removeLayer(markerInstance);
                markerInstance = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);

                let latF = lat.toFixed(6);
                let lngF = lng.toFixed(6);

                markerInstance.bindPopup(`
                    <div style="text-align:center; min-width:200px;">
                        <b>LOKASI DITEMUKAN</b><br><br>
                        <small>${item.display_name.substring(0, 80)}...</small><br><br>
                        Lat: <strong>${latF}</strong><br>
                        Lng: <strong>${lngF}</strong><br><br>
                        <button onclick="simpanLokasi(${latF}, ${lngF})"
                                style="width:100%; padding:12px; background:#ff6b35; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">
                            SIMPAN LOKASI INI
                        </button>
                    </div>
                `).openPopup();

                dropdown.style.display = 'none';
            };
            dropdown.appendChild(div);
        });
    })
    .catch(() => {
        btn.textContent = 'Cari';
        btn.disabled = false;
        alert('Gagal mencari. Cek koneksi internet.');
    });
}

/* =========================
   GPS TOMBOL DI MAP
========================= */
function ambilGPSdiMap() {
    if (!navigator.geolocation) {
        alert('GPS tidak didukung di browser ini.');
        return;
    }

    let btn = document.getElementById('mapGPSBtn');
    btn.textContent = '⏳ GPS...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        pos => {
            btn.textContent = '📡 Lokasi Saya';
            btn.disabled = false;

            let lat = pos.coords.latitude;
            let lng = pos.coords.longitude;
            mapInstance.setView([lat, lng], 18);

            let customIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="font-size:28px;">📍</div>',
                iconSize: [32, 40],
                iconAnchor: [16, 40]
            });

            if (markerInstance) mapInstance.removeLayer(markerInstance);
            markerInstance = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);

            let latF = lat.toFixed(6);
            let lngF = lng.toFixed(6);

            markerInstance.bindPopup(`
                <div style="text-align:center; min-width:200px;">
                    <b>LOKASI ANDA SEKARANG</b><br><br>
                    Lat: <strong>${latF}</strong><br>
                    Lng: <strong>${lngF}</strong><br><br>
                    <button onclick="simpanLokasi(${latF}, ${lngF})"
                            style="width:100%; padding:12px; background:#ff6b35; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">
                        SIMPAN LOKASI INI
                    </button>
                </div>
            `).openPopup();
        },
        err => {
            btn.textContent = '📡 Lokasi Saya';
            btn.disabled = false;
            alert('GPS gagal: ' + (err.message || 'Izin ditolak'));
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/* =========================
   FORM & MODAL FUNCTIONS
========================= */
function pilihForm(jenis) {
    document.getElementById("pasien").classList.remove("aktif");
    document.getElementById("jenazah").classList.remove("aktif");
    document.getElementById("emergency").classList.remove("aktif");
    document.getElementById(jenis).classList.add("aktif");
}

function tutupMap() {
    document.getElementById("mapModal").style.display = "none";
    let dropdown = document.getElementById('mapSearchResults');
    if (dropdown) dropdown.style.display = 'none';
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        markerInstance = null;
    }
}

/* =========================
   VALIDASI FORM
========================= */
function validasiForm(jenis) {
    if (!document.querySelector('input[name="layanan"]:checked')) {
        alert("Pilih jenis layanan terlebih dahulu");
        return false;
    }

    if (jenis === "pasien") {
        let nama = document.getElementById('nama1');
        let kontak = document.getElementById('kontak1');
        let sherlock = document.getElementById('sherlock');
        if (!sherlock.value?.trim()) { alert("❗ Lokasi rumah (Sherlock) wajib dipilih di peta"); return false; }
        if (!nama.value.trim()) { nama.focus(); alert("❗ Nama Pasien wajib diisi"); return false; }
        if (!kontak.value.trim()) { kontak.focus(); alert("❗ Kontak HP/WA wajib diisi"); return false; }

    } else if (jenis === "jenazah") {
        let nama = document.getElementById('nama2');
        let kontak = document.getElementById('kontak2');
        let maps = document.getElementById('maps');
        if (!maps.value?.trim()) { alert("❗ Lokasi Map wajib dipilih di peta"); return false; }
        if (!nama.value.trim()) { nama.focus(); alert("❗ Nama Almarhum/Almarhumah wajib diisi"); return false; }
        if (!kontak.value.trim()) { kontak.focus(); alert("❗ Kontak HP/WA wajib diisi"); return false; }

    } else if (jenis === "emergency") {
        let nama = document.getElementById('nama3');
        let kontak = document.getElementById('kontak3');
        let lokasi = document.getElementById('sherlockEmg');
        let keluhan = document.getElementById('penyakit3');
        if (!nama.value.trim()) { nama.focus(); alert("❗ Nama Pasien wajib diisi"); return false; }
        if (!keluhan.value.trim()) { keluhan.focus(); alert("❗ Keluhan/Gejala wajib diisi"); return false; }
        if (!lokasi.value?.trim()) { alert("❗ Lokasi darurat wajib dipilih di peta"); return false; }
        if (!kontak.value.trim()) { kontak.focus(); alert("❗ Kontak HP/WA wajib diisi"); return false; }
    }

    return true;
}

/* =========================
   KIRIM KE WHATSAPP
========================= */
function kirim(jenis) {
    if (!validasiForm(jenis)) return;

    let pesan = '';

    if (jenis === 'pasien') {
        let hari    = document.getElementById('hari1').value;
        let tgl     = document.getElementById('tanggal1').value;
        let bulan   = document.getElementById('bulan1').value;
        let tahun   = document.getElementById('tahun1').value;
        let tglLengkap = [hari, tgl, bulan, tahun].filter(Boolean).join(' ');

        pesan = `*🏥 PERMOHONAN AMBULANS - PASIEN*

📅 Tanggal   : ${tglLengkap || '-'}
👤 Nama      : ${document.getElementById('nama1').value}
🎂 Usia      : ${document.getElementById('usia1').value || '-'} tahun
🛏️ Kondisi  : ${document.getElementById('kondisi1').value || '-'}
🩺 Penyakit : ${document.getElementById('penyakit1').value || '-'}
🦠 TBC       : ${document.getElementById('tbc1').value || '-'}

📍 Lokasi Penjemputan:
${document.getElementById('sherlock').value}

🏁 Alamat Tujuan : ${document.getElementById('alamatAntar1').value || '-'}
⏰ Jam           : ${document.getElementById('jam1').value || '-'}
👥 Pendamping    : ${document.getElementById('pendamping1').value || 0} orang
📱 Kontak        : ${document.getElementById('kontak1').value}

📝 Keterangan Tambahan:
${document.getElementById('keterangan1').value || '-'}`;

    } else if (jenis === 'jenazah') {
        let hari    = document.getElementById('hari2').value;
        let tgl     = document.getElementById('tanggal2').value;
        let bulan   = document.getElementById('bulan2').value;
        let tahun   = document.getElementById('tahun2').value;
        let tglLengkap = [hari, tgl, bulan, tahun].filter(Boolean).join(' ');

        pesan = `*🏳️ PERMOHONAN AMBULANS - JENAZAH*

📅 Tanggal   : ${tglLengkap || '-'}
👤 Nama      : ${document.getElementById('nama2').value}
🎂 Usia      : ${document.getElementById('usia2').value || '-'} tahun

📍 Lokasi Jenazah:
${document.getElementById('maps').value}

🏁 Alamat Tujuan : ${document.getElementById('alamatAntar2').value || '-'}
⏰ Jam           : ${document.getElementById('jam2').value || '-'}
📱 Kontak        : ${document.getElementById('kontak2').value}
🏥 Sakit         : ${document.getElementById('sakit2').value || '-'}
⚰️ Peti Mati     : ${document.getElementById('peti2').value || '-'}

📝 Keterangan Tambahan:
${document.getElementById('keterangan2').value || '-'}`;

    } else if (jenis === 'emergency') {
        let hari    = document.getElementById('hari3').value;
        let tgl     = document.getElementById('tanggal3').value;
        let bulan   = document.getElementById('bulan3').value;
        let tahun   = document.getElementById('tahun3').value;
        let tglLengkap = [hari, tgl, bulan, tahun].filter(Boolean).join(' ');

        pesan = `*🚨 EMERGENCY - PERMOHONAN AMBULANS DARURAT 🚨*

📅 Tanggal    : ${tglLengkap || '-'}
👤 Nama       : ${document.getElementById('nama3').value}
🎂 Usia       : ${document.getElementById('usia3').value || '-'} tahun
⚠️ Kondisi   : ${document.getElementById('kondisi3').value || '-'}
🩺 Keluhan    : ${document.getElementById('penyakit3').value}
🦠 TBC        : ${document.getElementById('tbc3').value || '-'}

📍 LOKASI DARURAT:
${document.getElementById('sherlockEmg').value}

📌 Alamat Detail  : ${document.getElementById('alamatEmg').value || '-'}
🏁 Tujuan/RS      : ${document.getElementById('tujuanEmg').value || '-'}
⏰ Jam Kejadian   : ${document.getElementById('jam3').value || '-'}
👥 Pendamping     : ${document.getElementById('pendamping3').value || 0} orang
📱 Kontak Darurat : ${document.getElementById('kontak3').value}

📝 Keterangan Tambahan:
${document.getElementById('keterangan3').value || '-'}

_Mohon segera direspon. Terima kasih._`;
    }

    if (pesan) {
        window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`);
    }
}

/* =========================
   SAVE / LOAD DATA LOKAL
========================= */
function simpanData() {
    let data = {};
    document.querySelectorAll("input, textarea, select").forEach(el => {
        if (el.id) data[el.id] = el.value;
    });
    localStorage.setItem("ambulansData", JSON.stringify(data));
}

function loadData() {
    try {
        let data = JSON.parse(localStorage.getItem("ambulansData") || '{}');
        for (let id in data) {
            let el = document.getElementById(id);
            if (el) el.value = data[id];
        }
    } catch (e) {}
}

document.addEventListener("input", simpanData);
document.addEventListener("change", simpanData);

window.onload = function () {
    initBulan();
    updateTanggalMax('bulan1', 'tanggal1');
    updateTanggalMax('bulan2', 'tanggal2');
    updateTanggalMax('bulan3', 'tanggal3');
    loadData();
};