let map, marker, targetInput;

function pilihForm(jenis){
    document.getElementById("pasien").classList.remove("aktif");
    document.getElementById("jenazah").classList.remove("aktif");
    document.getElementById(jenis).classList.add("aktif");
}

/* MAP PICKER */
function bukaMap(inputId){
    targetInput = inputId;
    document.getElementById("mapModal").style.display = "block";

    setTimeout(()=>{
        if(!map){
            map = L.map('map').setView([-7.7,110.35], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                attribution:'© OpenStreetMap'
            }).addTo(map);

            map.on('click', function(e){
                if(marker) map.removeLayer(marker);
                marker = L.marker(e.latlng).addTo(map);
                let lat = e.latlng.lat;
                let lon = e.latlng.lng;

                // Ambil alamat dari koordinat
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {
                    let alamat = data.display_name;

                    let hasil = alamat + " | https://maps.google.com/?q=" + lat + "," + lon;

                    document.getElementById(targetInput).value = hasil;

                    simpanData();
})
.catch(() => {
    alert("Gagal mengambil alamat");
});


                simpanData();
            });
        }
    },200);
}

function tutupMap(){
    document.getElementById("mapModal").style.display = "none";
}

/* SIMPAN DATA */
function simpanData(){
    let data = {};
    document.querySelectorAll("input, textarea").forEach(el=>{
        data[el.id] = el.value;
    });
    localStorage.setItem("ambulansData", JSON.stringify(data));
}

/* LOAD DATA */
function loadData(){
    let data = JSON.parse(localStorage.getItem("ambulansData"));
    if(data){
        for(let id in data){
            if(document.getElementById(id)){
                document.getElementById(id).value = data[id];
            }
        }
    }
}

/* AUTO SAVE */
document.addEventListener("input", simpanData);
window.onload = loadData;

/* KIRIM WA */
function kirim(jenis){
    let nomor = "6285713322154";
    let pesan="";

    if(jenis==="pasien"){
        pesan = `FORM PASIEN
Nama: ${nama1.value}
Sherlock: ${sherlock.value}`;
    }else{
        pesan = `FORM JENAZAH
Nama: ${nama2.value}
Lokasi: ${maps.value}`;
    }

    window.open("https://wa.me/"+nomor+"?text="+encodeURIComponent(pesan));
}