let map, marker, targetInput;

/* =========================
   PILIH FORM
========================= */
function pilihForm(jenis){
    document.getElementById("pasien").classList.remove("aktif");
    document.getElementById("jenazah").classList.remove("aktif");
    document.getElementById(jenis).classList.add("aktif");
}

/* =========================
   VALIDASI FORM
========================= */
function validasiForm(jenis) {
    if(jenis === "pasien") {
        if(!sherlock.value || sherlock.value === "Alamat tidak ditemukan") {
            alert("❌ Sherlock Rumah wajib diisi! Silakan pilih lokasi di peta.");
            sherlock.focus();
            return false;
        }
        if(!nama1.value.trim()) {
            alert("❌ Nama Pasien wajib diisi!");
            nama1.focus();
            return false;
        }
        if(!kontak1.value.trim()) {
            alert("❌ Kontak HP/WA wajib diisi!");
            kontak1.focus();
            return false;
        }
        return true;
    } else {
        if(!maps.value || maps.value === "Alamat tidak ditemukan") {
            alert("❌ Lokasi Map wajib diisi! Silakan pilih lokasi di peta.");
            maps.focus();
            return false;
        }
        if(!nama2.value.trim()) {
            alert("❌ Nama wajib diisi!");
            nama2.focus();
            return false;
        }
        if(!kontak2.value.trim()) {
            alert("❌ Kontak HP/WA wajib diisi!");
            kontak2.focus();
            return false;
        }
        return true;
    }
}

/* =========================
   MAP PICKER - GOOGLE MAPS UNTUK SHERLOCK
========================= */
function bukaMap(inputId){
    targetInput = inputId;
    
    if(inputId === "sherlock") {
        // ✅ GOOGLE MAPS UNTUK SHERLOCK (LEBIH AKURAT)
        bukaGoogleMaps();
    } else {
        // LEAFLET UNTUK JENAZAH (maps)
        bukaLeafletMap();
    }
}

/* GOOGLE MAPS UNTUK SHERLOCK */
function bukaGoogleMaps() {
    // Buka Google Maps dengan mode pilih lokasi
    let url = `https://www.google.com/maps/search/?api=1&query=&query_place_id=&q=`;
    
    // Coba ambil lokasi user dulu
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(posisi) {
                let lat = posisi.coords.latitude;
                let lon = posisi.coords.longitude;
                url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                window.open(url, '_blank');
            },
            function() {
                // Jika GPS gagal, buka maps biasa
                window.open('https://www.google.com/maps', '_blank');
            },
            { enableHighAccuracy: true }
        );
    } else {
        window.open('https://www.google.com/maps', '_blank');
    }
    
    // TUTUP MODAL (tidak perlu modal untuk Google Maps)
}

/* LEAFLET MAP UNTUK JENAZAH */
function bukaLeafletMap() {
    document.getElementById("mapModal").style.display = "block";

    setTimeout(()=>{
        if(!map){
            map = L.map('map').setView([-7.7,110.35], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                attribution:'© OpenStreetMap contributors'
            }).addTo(map);

            let customIcon = L.divIcon({
                className: 'custom-marker',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            map.on('click', function(e){
                if(marker) map.removeLayer(marker);
                marker = L.marker(e.latlng, {icon: customIcon}).addTo(map);
                map.setView(e.latlng, 17);
                ambilAlamat(e.latlng.lat, e.latlng.lng, targetInput);
            });
        }

        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        ambilLokasiOtomatis();

    },300);
}

function tutupMap(){
    document.getElementById("mapModal").style.display = "none";
}

/* =========================
   AUTO LOKASI USER (UNTUK JENAZAH SAJA)
========================= */
function ambilLokasiOtomatis(){
    if(navigator.geolocation && targetInput === "maps"){
        navigator.geolocation.getCurrentPosition(
            function(posisi){
                let lat = posisi.coords.latitude;
                let lon = posisi.coords.longitude;
                
                if(map){
                    let zoomLevel = posisi.coords.accuracy < 20 ? 18 : 16;
                    map.setView([lat, lon], zoomLevel);

                    if(marker) map.removeLayer(marker);
                    
                    let customIcon = L.divIcon({
                        className: 'custom-marker',
                        html: '📍',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    });
                    marker = L.marker([lat, lon], {icon: customIcon}).addTo(map);
                }

                ambilAlamat(lat, lon, "maps");
            },
            function(){},
            { enableHighAccuracy: true }
        );
    }
}

/* =========================
   AMBIL ALAMAT (UNTUK JENAZAH SAJA)
========================= */
function ambilAlamat(lat, lon, inputId){
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`, {
        headers: {
            'User-Agent': 'AmbulanMu-Seyegan/1.0'
        }
    })
    .then(res => res.json())
    .then(data => {
        let alamatLengkap = "";
        
        if(data && data.display_name) {
            let address = data.address;
            alamatLengkap = [
                address.road || '',
                address.neighbourhood || address.suburb || '',
                address.village || address.town || address.city || '',
                address.state || ''
            ].filter(part => part).join(', ') || data.display_name;
        } else {
            alamatLengkap = "Alamat tidak ditemukan";
        }
        
        let hasil = `${alamatLengkap} | https://maps.google.com/?q=${lat},${lon}`;
        
        let el = document.getElementById(inputId);
        if(el){
            el.value = hasil;
            el.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                el.style.backgroundColor = '';
            }, 1000);
        }

        simpanData();
    })
    .catch(()=>{
        let hasil = `Lat:${lat.toFixed(6)}, Lon:${lon.toFixed(6)} | https://maps.google.com/?q=${lat},${lon}`;
        let el = document.getElementById(inputId);
        if(el) el.value = hasil;
    });
}

/* =========================
   FUNGSI GOOGLE MAPS CALLBACK (UNTUK SHERLOCK)
========================= */
function isiSherlockDariGoogle(alamat, lat, lon) {
    // User bisa copy-paste hasil dari Google Maps
    let hasil = `${alamat} | https://maps.google.com/?q=${lat},${lon}`;
    document.getElementById('sherlock').value = hasil;
    simpanData();
}

/* =========================
   SIMPAN & LOAD DATA
========================= */
function simpanData(){
    let data = {};
    document.querySelectorAll("input, textarea, select").forEach(el=>{
        if(el.id){
            data[el.id] = el.value;
        }
    });
    localStorage.setItem("ambulansData", JSON.stringify(data));
}

function loadData(){
    let data = JSON.parse(localStorage.getItem("ambulansData"));
    if(data){
        for(let id in data){
            let el = document.getElementById(id);
            if(el){
                el.value = data[id];
            }
        }
    }
}

document.addEventListener("input", simpanData);
document.addEventListener("change", simpanData);

window.onload = function(){
    loadData();
};

/* =========================
   KIRIM WA
========================= */
function kirim(jenis){
    if(!validasiForm(jenis)) return;
    
    let nomor = "6285713322154";
    let pesan = "";

    if(jenis==="pasien"){
        let tanggalLengkap = `${hari1.value || ''} ${tanggal1.value || ''} ${bulan1.value || ''} ${tahun1.value || ''}`.trim();
        pesan = `FORM PERMOHONAN AMBULANMU (PASIEN)

Hari/Tanggal: ${tanggalLengkap}
Nama Pasien: ${nama1.value}
Usia: ${usia1.value}
Kondisi: ${kondisi.value}
Penyakit: ${penyakit.value}
TBC: ${tbc.value}

Sherlock Rumah: ${sherlock.value}

Alamat Antar: ${alamatAntar1.value}

Jam: ${jam1.value}
Pendamping: ${pendamping.value}
Kontak: ${kontak1.value}`;
    } else {
        let tanggalLengkap = `${hari2.value || ''} ${tanggal2.value || ''} ${bulan2.value || ''} ${tahun2.value || ''}`.trim();
        pesan = `FORM PERMOHONAN AMBULANMU (JENAZAH)

Hari/Tanggal: ${tanggalLengkap}
Nama: ${nama2.value}
Usia: ${usia2.value}

Lokasi Map: ${maps.value}

Alamat Antar: ${alamatAntar2.value}

Jam: ${jam2.value}
Kontak: ${kontak2.value}
Sakit: ${sakit.value}
Peti: ${peti.value}`;
    }

    let url = "https://wa.me/" + nomor + "?text=" + encodeURIComponent(pesan);
    window.open(url, "_blank");
}