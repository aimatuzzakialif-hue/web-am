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
   MAP PICKER
========================= */
function bukaMap(inputId){
    targetInput = inputId;
    document.getElementById("mapModal").style.display = "block";

    setTimeout(()=>{
        if(!map){
            map = L.map('map').setView([-7.7,110.35], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                attribution:'© OpenStreetMap'
            }).addTo(map);

            // klik map
            map.on('click', function(e){
                if(marker) map.removeLayer(marker);
                marker = L.marker(e.latlng).addTo(map);

                ambilAlamat(e.latlng.lat, e.latlng.lng, targetInput);
            });
        }

        // FIX: resize map biar ga blank
        setTimeout(() => {
            map.invalidateSize();
        }, 200);

        // ambil lokasi user saat buka map
        ambilLokasiOtomatis();

    },200);
}

function tutupMap(){
    document.getElementById("mapModal").style.display = "none";
}

/* =========================
   AUTO LOKASI USER
========================= */
function ambilLokasiOtomatis(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            function(posisi){
                let lat = posisi.coords.latitude;
                let lon = posisi.coords.longitude;

                if(map){
                    map.setView([lat, lon], 15);

                    if(marker) map.removeLayer(marker);
                    marker = L.marker([lat, lon]).addTo(map);
                }

                // isi otomatis
                ambilAlamat(lat, lon, "sherlock");
                ambilAlamat(lat, lon, "maps");
            },
            function(){
                console.log("Lokasi tidak diizinkan");
            }
        );
    }
}

/* =========================
   AMBIL ALAMAT (FIX API)
========================= */
function ambilAlamat(lat, lon, inputId){
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: {
            'User-Agent': 'ambulans-app'
        }
    })
    .then(res => res.json())
    .then(data => {
        let alamat = data.display_name || "Alamat tidak ditemukan";
        let hasil = alamat + " | https://maps.google.com/?q=" + lat + "," + lon;

        let el = document.getElementById(inputId);
        if(el){
            el.value = hasil;
        }

        simpanData();
    })
    .catch(()=>{
        alert("Gagal mengambil alamat");
    });
}

/* =========================
   SIMPAN DATA
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

/* =========================
   LOAD DATA
========================= */
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

/* AUTO SAVE */
document.addEventListener("input", simpanData);
document.addEventListener("change", simpanData);

/* =========================
   LOAD AWAL (TANPA MAP)
========================= */
window.onload = function(){
    loadData();
};

/* =========================
   VALIDASI FORM
========================= */
function validasiForm(jenis) {
    if(jenis === "pasien") {
        // ✅ WAJIB SHERLOCK DIISI
        if(!sherlock.value || sherlock.value.trim() === "") {
            alert("❌ Sherlock Rumah WAJIB diisi! Silakan pilih lokasi di peta.");
            sherlock.focus();
            return false;
        }
        
        // Cek nama & kontak minimal
        if(!nama1.value.trim()) {
            alert("❌ Nama Pasien harus diisi!");
            nama1.focus();
            return false;
        }
        if(!kontak1.value.trim()) {
            alert("❌ Kontak HP/WA harus diisi!");
            kontak1.focus();
            return false;
        }
    } else {
        // JENAZAH - WAJIB MAP DIISI
        if(!maps.value || maps.value.trim() === "") {
            alert("❌ Lokasi Map WAJIB diisi! Silakan pilih lokasi di peta.");
            maps.focus();
            return false;
        }
        
        // Cek nama & kontak minimal
        if(!nama2.value.trim()) {
            alert("❌ Nama harus diisi!");
            nama2.focus();
            return false;
        }
        if(!kontak2.value.trim()) {
            alert("❌ Kontak HP/WA harus diisi!");
            kontak2.focus();
            return false;
        }
    }
    return true;
}

/* =========================
   KIRIM WA (DENGAN VALIDASI)
========================= */
function kirim(jenis){
    // ✅ VALIDASI DULU
    if(!validasiForm(jenis)) {
        return; // STOP jika gagal validasi
    }

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

Sherlock Rumah:
${sherlock.value}

Alamat Antar:
${alamatAntar1.value}

Jam Penjemputan: ${jam1.value}
Jumlah Pendamping: ${pendamping.value}
Kontak: ${kontak1.value}
`;

    } else {
        let tanggalLengkap = `${hari2.value || ''} ${tanggal2.value || ''} ${bulan2.value || ''} ${tahun2.value || ''}`.trim();
        
        pesan = `FORM PERMOHONAN AMBULANMU (JENAZAH)

Hari/Tanggal: ${tanggalLengkap}
Nama: ${nama2.value}
Usia: ${usia2.value}

Lokasi Map:
${maps.value}

Alamat Antar:
${alamatAntar2.value}

Jam Penjemputan: ${jam2.value}
Kontak: ${kontak2.value}
Sakit sebelum meninggal: ${sakit.value}
Peti: ${peti.value}
`;
    }

    let url = "https://wa.me/" + nomor + "?text=" + encodeURIComponent(pesan);
    window.open(url, "_blank");
}