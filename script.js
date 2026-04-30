/* SCRIPT AMBULANMU SEYEGAN - WITH SEARCH & GPS MAP */
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
    ['bulan1', 'bulan2'].forEach(id => {
        let select = document.getElementById(id);
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
   targetField: 'sherlock' atau 'maps'
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

        /* CLICK EVENT - PILIH LOKASI */
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

        /* AUTO GPS SAAT MAP DIBUKA */
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
        alert('Lokasi berhasil disimpan!');
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

        /* TAMPILKAN DROPDOWN HASIL */
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

function validasiForm(jenis) {
    if (!document.querySelector('input[name="layanan"]:checked')) {
        alert("Pilih jenis layanan terlebih dahulu");
        return false;
    }

    if (jenis === "pasien") {
        if (!sherlock.value?.trim()) { alert("Sherlock Rumah wajib diisi"); return false; }
        if (!nama1.value.trim()) { nama1.focus(); alert("Nama Pasien wajib"); return false; }
        if (!kontak1.value.trim()) { kontak1.focus(); alert("Kontak wajib"); return false; }
    } else {
        if (!maps.value?.trim()) { alert("Lokasi Map wajib diisi"); return false; }
        if (!nama2.value.trim()) { nama2.focus(); alert("Nama wajib"); return false; }
        if (!kontak2.value.trim()) { kontak2.focus(); alert("Kontak wajib"); return false; }
    }
    return true;
}

function kirim(jenis) {
    if (!validasiForm(jenis)) return;

    let isPasien = jenis === 'pasien';
    let hariEl = document.getElementById(isPasien ? 'hari1' : 'hari2');
    let tglEl = document.getElementById(isPasien ? 'tanggal1' : 'tanggal2');
    let bulanEl = document.getElementById(isPasien ? 'bulan1' : 'bulan2');
    let tahunEl = document.getElementById(isPasien ? 'tahun1' : 'tahun2');

    let tanggalLengkap = [hariEl.value, tglEl.value, bulanEl.value, tahunEl.value].filter(Boolean).join(' ');

    let pesan = isPasien ?
        `*PERMOHONAN AMBULANS - PASIEN*

Tanggal: ${tanggalLengkap}
Nama: ${nama1.value}
Usia: ${usia1.value || '-'} tahun
Kondisi: ${kondisi.value || '-'}
Penyakit: ${penyakit.value || '-'}
TBC: ${tbc.value || '-'}

Sherlock Rumah:
${sherlock.value}

Alamat Tujuan: ${alamatAntar1.value || '-'}
Jam: ${jam1.value || '-'}
Pendamping: ${pendamping.value || 0}
Kontak: ${kontak1.value}` :
        `*PERMOHONAN AMBULANS - JENAZAH*

Tanggal: ${tanggalLengkap}
Nama: ${nama2.value}
Usia: ${usia2.value || '-'} tahun

Lokasi Map:
${maps.value}

Alamat Tujuan: ${alamatAntar2.value || '-'}
Jam: ${jam2.value || '-'}
Kontak: ${kontak2.value}
Sakit: ${sakit.value || '-'}
Peti: ${peti.value || '-'}`;

    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`);
}

/* SAVE/LOAD */
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
    loadData();
};