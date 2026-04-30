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
    document.querySelectorAll("input, textarea").forEach(el=>{
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

/* =========================
   LOAD AWAL (TANPA MAP)
========================= */
window.onload = function(){
    loadData();
};

/* =========================
   KIRIM WA
========================= */
function kirim(jenis){
    let nomor = "6285713322154";
    let pesan = "";

    if(jenis==="pasien"){
        pesan = `FORM PERMOHONAN AMBULANMU (PASIEN)

Hari/Tanggal: ${tanggal1.value}
Nama Pasien: ${nama1.value}
Usia: ${usia1.value}
Kondisi: ${kondisi.value}
Penyakit: ${penyakit.value}
TBC: ${tbc.value}

Alamat Penjemputan:
${alamatJemput1.value}

Sherlock Rumah:
${sherlock.value}

Alamat Antar:
${alamatAntar1.value}

Jam Penjemputan: ${jam1.value}
Jumlah Pendamping: ${pendamping.value}
Kontak: ${kontak1.value}
`;

    } else {
        pesan = `FORM PERMOHONAN AMBULANMU (JENAZAH)

Hari/Tanggal: ${tanggal2.value}
Nama: ${nama2.value}
Usia: ${usia2.value}

Alamat Penjemputan:
${alamatJemput2.value}

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