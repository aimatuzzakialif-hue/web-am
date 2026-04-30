/* SCRIPT AMBULANMU SEYEGAN - SHERLOCK AUTO */
let nomorWA = "6285713322154";

// BULAN MAX HARI
const BULAN_MAX_HARI = {
    'Januari': 31, 'Februari': 28, 'Maret': 31, 'April': 30,
    'Mei': 31, 'Juni': 30, 'Juli': 31, 'Agustus': 31,
    'September': 30, 'October': 31, 'November': 30, 'Desember': 31
};

const BULAN_LIST = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/* =========================
   INISIALISASI
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
        tanggalInput.value = '';
    };
    
    tanggalInput.oninput = function() {
        let val = parseInt(this.value);
        let maxHari = bulanSelect.value ? BULAN_MAX_HARI[bulanSelect.value] : 31;
        if(val > maxHari) {
            this.value = maxHari;
        }
    };
}

/* =========================
   SHERLOCK AUTO - GOOGLE MAPS GEOCODING
========================= */
async function isiSherlockOtomatis() {
    try {
        // 1. AMBIL LOKASI GPS USER
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
        
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        
        // 2. GEOCODE REVERSE - GOOGLE MAPS API (GRATIS)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=id`,
            { headers: { 'User-Agent': 'AmbulanMu-Seyegan/3.0' } }
        );
        
        const data = await response.json();
        
        if(data.display_name) {
            // ALAMAT LENGKAP & RAPI
            let addr = data.address;
            let alamat = [
                addr.road || addr.residential || addr.house_number || '',
                addr.neighbourhood || addr.suburb || '',
                addr.village || addr.hamlet || addr.city_district || '',
                addr.postcode ? `Kodepos: ${addr.postcode}` : '',
                addr.city || addr.town || addr.municipality || '',
                addr.state || 'DIY'
            ].filter(Boolean).join(', ');
            
            let sherlockValue = `${alamat} | https://maps.google.com/?q=${lat.toFixed(6)},${lon.toFixed(6)}`;
            
            // ISI OTOMATIS
            document.getElementById('sherlock').value = sherlockValue;
            document.getElementById('sherlock').style.backgroundColor = '#d4edda';
            
            setTimeout(() => {
                document.getElementById('sherlock').style.backgroundColor = '';
            }, 2000);
            
            simpanData();
            alert(`✅ Sherlock Rumah otomatis terisi!\n${alamat.substring(0, 50)}...`);
            
        } else {
            throw new Error('Alamat tidak ditemukan');
        }
        
    } catch(error) {
        console.log('Sherlock auto gagal:', error);
        // FALLBACK - BUKA GOOGLE MAPS
        bukaMap('sherlock');
        alert('📱 Lokasi GPS tidak akurat. Silakan pilih manual di Google Maps.');
    }
}

/* =========================
   GOOGLE MAPS MANUAL (FALLBACK)
========================= */
function bukaMap(inputId){
    let url = 'https://www.google.com/maps';
    
    navigator.geolocation.getCurrentPosition(
        pos => {
            url = `https://www.google.com/maps/search/?api=1&query=${pos.coords.latitude},${pos.coords.longitude}`;
            window.open(url, '_blank');
        },
        () => window.open(url, '_blank')
    );
}

/* =========================
   PILIH FORM & VALIDASI
========================= */
function pilihForm(jenis){
    document.getElementById("pasien").classList.remove("aktif");
    document.getElementById("jenazah").classList.remove("aktif");
    document.getElementById(jenis).classList.add("aktif");
}

function validasiForm(jenis) {
    if(!document.querySelector('input[name="layanan"]:checked')) {
        alert("❌ Pilih jenis layanan!");
        return false;
    }
    
    if(jenis === "pasien") {
        if(!sherlock.value?.trim()) {
            alert("❌ Sherlock Rumah kosong!\nKlik tombol Google Maps atau izinkan GPS");
            return false;
        }
        if(!nama1.value.trim()) { nama1.focus(); alert("❌ Nama Pasien wajib!"); return false; }
        if(!kontak1.value.trim()) { kontak1.focus(); alert("❌ Kontak wajib!"); return false; }
    } else {
        if(!maps.value?.trim()) {
            alert("❌ Lokasi Map kosong!\n📱 Buka Google Maps → Copy → Paste");
            maps.focus();
            return false;
        }
        if(!nama2.value.trim()) { nama2.focus(); alert("❌ Nama wajib!"); return false; }
        if(!kontak2.value.trim()) { kontak2.focus(); alert("❌ Kontak wajib!"); return false; }
    }
    return true;
}

/* =========================
   KIRIM WA
========================= */
function kirim(jenis){
    if(!validasiForm(jenis)) return;
    
    let isPasien = jenis === 'pasien';
    let tanggalLengkap = [
        document.getElementById(isPasien ? 'hari1' : 'hari2').value,
        document.getElementById(isPasien ? 'tanggal1' : 'tanggal2').value,
        document.getElementById(isPasien ? 'bulan1' : 'bulan2').value,
        document.getElementById(isPasien ? 'tahun1' : 'tahun2').value
    ].filter(Boolean).join(' ');
    
    let pesan = isPasien ?
        `🚑 *PASIEN - AMBULANMU SEYEGAN*

📅 ${tanggalLengkap}
👤 ${nama1.value}
${usia1.value ? `🎂 ${usia1.value} thn` : ''}
${kondisi.value ? `🩺 ${kondisi.value}` : ''}
${penyakit.value ? `💊 ${penyakit.value}` : ''}
${tbc.value ? `🦠 ${tbc.value}` : ''}

📍 *SHERLOCK RUMAH*:
${sherlock.value}

🏠 Tujuan: ${alamatAntar1.value || '---'}
⏰ ${jam1.value || '---'}
👥 ${pendamping.value || 0} pendamping
📱 ${kontak1.value}` :
        `⚰️ *JENAZAH - AMBULANMU SEYEGAN*

📅 ${tanggalLengkap}
👤 ${nama2.value}
${usia2.value ? `🎂 ${usia2.value} thn` : ''}

📍 *LOKASI*:
${maps.value}

🏠 Tujuan: ${alamatAntar2.value || '---'}
⏰ ${jam2.value || '---'}
📱 ${kontak2.value}
${sakit.value ? `💊 ${sakit.value}` : ''}
${peti.value ? `☠️ ${peti.value}` : ''}`;

    pesan += `\n\n*AmbulanMu Seyegan - Cepat & Terpercaya* 🚀🙏`;
    
    window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`);
}

/* =========================
   SAVE/LOAD
========================= */
function simpanData(){
    let data = {};
    document.querySelectorAll("input, textarea, select").forEach(el => {
        if(el.id) data[el.id] = el.value;
    });
    localStorage.setItem("ambulansData", JSON.stringify(data));
}

function loadData(){
    try {
        let data = JSON.parse(localStorage.getItem("ambulansData") || '{}');
        for(let id in data){
            let el = document.getElementById(id);
            if(el) el.value = data[id];
        }
    } catch(e){}
}

/* INIT */
document.addEventListener("input", simpanData);
document.addEventListener("change", simpanData);

window.onload = function() {
    initBulan();
    updateTanggalMax('bulan1', 'tanggal1');
    updateTanggalMax('bulan2', 'tanggal2');
    loadData();
    
    // AUTO SHERLOCK SAAT LOAD (JIKA BELUM ADA)
    if(!document.getElementById('sherlock').value) {
        setTimeout(isiSherlockOtomatis, 1000);
    }
};