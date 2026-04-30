/* SCRIPT AMBULANMU SEYEGAN - CLEAN VERSION */
let nomorWA = "6285713322154";

// BULAN MAX HARI
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
    
    bulanSelect.onchange = function() {
        let bulan = this.value;
        let maxHari = bulan ? BULAN_MAX_HARI[bulan] : 31;
        tanggalInput.max = maxHari;
        if(parseInt(tanggalInput.value) > maxHari) tanggalInput.value = '';
    };
    
    tanggalInput.oninput = function() {
        let val = parseInt(this.value);
        let maxHari = bulanSelect.value ? BULAN_MAX_HARI[bulanSelect.value] : 31;
        if(val > maxHari) this.value = maxHari;
    };
}

/* =========================
   MAP LEAFLET UNTUK MAPS (JENAZAH)
========================= */
let mapInstance, markerInstance;
function bukaLeafletMap() {
    document.getElementById("mapModal").style.display = "block";
    
    setTimeout(() => {
        // RESET MAP
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = '';
        
        // INIT MAP
        mapInstance = L.map('map').setView([-7.7, 110.35], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapInstance);
        
        // CUSTOM MARKER
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="font-size:24px; color:#ff6b35; font-weight:bold;">📍</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        
        // CLICK EVENT
        mapInstance.on('click', function(e) {
            // REMOVE OLD MARKER
            if(markerInstance) mapInstance.removeLayer(markerInstance);
            
            // NEW MARKER
            markerInstance = L.marker(e.latlng, {icon: customIcon}).addTo(mapInstance);
            mapInstance.setView(e.latlng, 17);
            
            // SHOW COORDS
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);
            
            markerInstance.bindPopup(`
                <div style="text-align:center; min-width:200px;">
                    <b>LOKASI TERPILIH</b><br><br>
                    Lat: <strong>${lat}</strong><br>
                    Lng: <strong>${lng}</strong><br><br>
                    <button onclick="simpanLokasiJenazah(${lat}, ${lng})" 
                            style="width:100%; padding:12px; background:#ff6b35; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">
                        SIMPAN LOKASI
                    </button>
                </div>
            `).openPopup();
        });
        
        // AUTO GPS
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 16),
                () => {}
            );
        }
        
        mapInstance.invalidateSize();
        
    }, 200);
}

function simpanLokasiJenazah(lat, lng) {
    // GEOCODE REVERSE
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`, {
        headers: { 'User-Agent': 'AmbulanMu-Seyegan/4.0' }
    })
    .then(res => res.json())
    .then(data => {
        let alamat = data.display_name || `Koordinat: ${lat}, ${lng}`;
        let mapsValue = `${alamat} | https://maps.google.com/?q=${lat},${lng}`;
        
        document.getElementById('maps').value = mapsValue;
        document.getElementById('maps').style.backgroundColor = '#d4edda';
        setTimeout(() => document.getElementById('maps').style.backgroundColor = '', 1500);
        
        simpanData();
        tutupMap();
        alert('Lokasi berhasil disimpan!');
    })
    .catch(() => {
        let mapsValue = `Lat:${lat}, Lng:${lng} | https://maps.google.com/?q=${lat},${lng}`;
        document.getElementById('maps').value = mapsValue;
        simpanData();
        tutupMap();
    });
}

/* =========================
   SHERLOCK AUTO GPS
========================= */
async function isiSherlockOtomatis() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 8000
            });
        });
        
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
            { headers: { 'User-Agent': 'AmbulanMu-Seyegan/4.0' } }
        );
        
        const data = await response.json();
        let alamat = data.display_name || `Lat:${lat.toFixed(6)}, Lng:${lng.toFixed(6)}`;
        
        let sherlockValue = `${alamat} | https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        document.getElementById('sherlock').value = sherlockValue;
        document.getElementById('sherlock').style.backgroundColor = '#d4edda';
        
        setTimeout(() => document.getElementById('sherlock').style.backgroundColor = '', 1500);
        simpanData();
        
    } catch(error) {
        alert('GPS tidak tersedia. Gunakan tombol Google Maps manual.');
        bukaGoogleMapsManual();
    }
}

function bukaGoogleMapsManual() {
    window.open('https://www.google.com/maps', '_blank');
}

/* =========================
   MAIN FUNCTIONS
========================= */
function pilihForm(jenis) {
    document.getElementById("pasien").classList.remove("aktif");
    document.getElementById("jenazah").classList.remove("aktif");
    document.getElementById(jenis).classList.add("aktif");
}

function tutupMap() {
    document.getElementById("mapModal").style.display = "none";
}

function validasiForm(jenis) {
    if(!document.querySelector('input[name="layanan"]:checked')) {
        alert("Pilih jenis layanan terlebih dahulu");
        return false;
    }
    
    if(jenis === "pasien") {
        if(!sherlock.value?.trim()) {
            alert("Sherlock Rumah wajib diisi");
            return false;
        }
        if(!nama1.value.trim()) { nama1.focus(); alert("Nama Pasien wajib"); return false; }
        if(!kontak1.value.trim()) { kontak1.focus(); alert("Kontak wajib"); return false; }
    } else {
        if(!maps.value?.trim()) {
            alert("Lokasi Map wajib diisi");
            return false;
        }
        if(!nama2.value.trim()) { nama2.focus(); alert("Nama wajib"); return false; }
        if(!kontak2.value.trim()) { kontak2.focus(); alert("Kontak wajib"); return false; }
    }
    return true;
}

function kirim(jenis) {
    if(!validasiForm(jenis)) return;
    
    let isPasien = jenis === 'pasien';
    let hariEl = document.getElementById(isPasien ? 'hari1' : 'hari2');
    let tglEl = document.getElementById(isPasien ? 'tanggal1' : 'tanggal2');
    let bulanEl = document.getElementById(isPasien ? 'bulan1' : 'bulan2');
    let tahunEl = document.getElementById(isPasien ? 'tahun1' : 'tahun2');
    
    let tanggalLengkap = [
        hariEl.value, tglEl.value, bulanEl.value, tahunEl.value
    ].filter(Boolean).join(' ');
    
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
        if(el.id) data[el.id] = el.value;
    });
    localStorage.setItem("ambulansData", JSON.stringify(data));
}

function loadData() {
    try {
        let data = JSON.parse(localStorage.getItem("ambulansData") || '{}');
        for(let id in data) {
            let el = document.getElementById(id);
            if(el) el.value = data[id];
        }
    } catch(e) {}
}

document.addEventListener("input", simpanData);
document.addEventListener("change", simpanData);

window.onload = function() {
    initBulan();
    updateTanggalMax('bulan1', 'tanggal1');
    updateTanggalMax('bulan2', 'tanggal2');
    loadData();
};