// ==========================================
// CONFIGURATION
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfhy7_0w3aYO2kykkoMhIbe-uzb58AAMmlOEnVabF1tFvLSqJxtzrZHVxmlhewZOaM/exec";
const TANGGAL_ACARA = new Date("2026-10-11T09:00:00").getTime();

// ==========================================
// 1. FUNGSI COUNTDOWN TIMER
// ==========================================
function jalankanCountdown() {
    const sekarang = new Date().getTime();
    const selisih = TANGGAL_ACARA - sekarang;

    const elHari = document.getElementById("cd-hari");
    const elJam = document.getElementById("cd-jam");
    const elMenit = document.getElementById("cd-menit");
    const elDetik = document.getElementById("cd-detik");

    if (selisih < 0) {
        const elContainer = document.getElementById("countdown-container");
        if (elContainer) elContainer.innerHTML = "<p style='color: white; font-weight: bold;'>Acara Telah Berlangsung</p>";
        return;
    }

    const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
    const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
    const detik = Math.floor((selisih % (1000 * 60)) / 1000);

    if (elHari) elHari.innerText = hari < 10 ? "0" + hari : hari;
    if (elJam) elJam.innerText = jam < 10 ? "0" + jam : jam;
    if (elMenit) elMenit.innerText = menit < 10 ? "0" + menit : menit;
    if (elDetik) elDetik.innerText = detik < 10 ? "0" + detik : detik;
}

// ==========================================
// 2. FUNGSI BUKA UNDANGAN
// ==========================================
function bukaUndangan() {
    const cover = document.getElementById('cover');
    const konten = document.getElementById('konten');
    const lagu = document.getElementById('lagu');
    const body = document.body;

    if (konten) konten.classList.remove('hidden');

    if (lagu) {
        lagu.play().then(() => {
            console.log("Musik berhasil diputar.");
        }).catch((error) => {
            console.log("Musik diblokir oleh browser.", error);
        });
    }

    if (cover) cover.style.transform = 'translateY(-100%)';
    body.style.overflow = 'auto';

    initScrollAnimation();

    setTimeout(() => {
        if (cover) cover.style.display = 'none';
    }, 1000);
}

// ==========================================
// 3. FUNGSI MODAL LIGHTBOX
// ==========================================
function openModal(element) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    const captionText = document.getElementById("caption");
    
    if (modal && modalImg) {
        modal.style.display = "block";
        modalImg.src = typeof element === 'string' ? element : element.src;
        if (captionText) {
            captionText.innerHTML = typeof element === 'string' ? '' : (element.alt || '');
        }
        document.body.style.overflow = "hidden";
    }
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// ==========================================
// 4. ANIMASI SCROLL
// ==========================================
function initScrollAnimation() {
    const animatedElements = document.querySelectorAll('.story-card, .metro-item');

    const observerOptions = {
        root: null, 
        threshold: 0.15,
        rootMargin: "0px 0px -30px 0px"
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('story-card')) {
                    entry.target.classList.add('appear');
                }
                if (entry.target.classList.contains('metro-item')) {
                    entry.target.classList.add('animate-pop');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// 5. SALIN NOMOR DANA
// ==========================================
function copyText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const textToCopy = el.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Nomor DANA berhasil disalin!");
    }).catch(err => {
        console.error("Gagal menyalin: ", err);
    });
}

// ==========================================
// 6. INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Jalankan Countdown Pertama Kali & Set Interval
    jalankanCountdown();
    setInterval(jalankanCountdown, 1000);

    // Tangkap nama tamu dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        const guestElement = document.querySelector('.cover-content .to');
        if (guestElement) {
            guestElement.textContent = decodeURIComponent(guestName);
        }
    }

    // Backup pemicu animasi jika cover tersembunyi
    const cover = document.getElementById('cover');
    if (!cover || cover.classList.contains('hidden') || cover.style.display === 'none') {
        initScrollAnimation();
    }

    // Muat riwayat ucapan
    muatSemuaUcapan();

    // Handling Submit Form RSVP
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const btnSubmit = this.querySelector('.btn-submit');
            btnSubmit.innerText = "Mengirim...";
            btnSubmit.disabled = true;

            const payload = {
                nama: document.getElementById('rsvp-nama').value,
                status: document.getElementById('rsvp-status').value,
                jumlah: document.getElementById('rsvp-jumlah').value || 1,
                pesan: document.getElementById('rsvp-pesan').value
            };

            // Mode 'no-cors' agar kompatibel dengan Google Apps Script
            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            })
            .then(() => {
                tampilkanUcapan(payload.nama, payload.status, payload.pesan, true);
                alert("Terima kasih! Konfirmasi dan doa Anda berhasil terkirim.");
                rsvpForm.reset();
                btnSubmit.innerText = "Kirim Ucapan";
                btnSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Gagal mengirim ucapan. Silakan coba lagi.");
                btnSubmit.innerText = "Kirim Ucapan";
                btnSubmit.disabled = false;
            });
        });
    }
});

// ==========================================
// 7. HELPER UCAPAN & GOOGLE SHEETS
// ==========================================
function muatSemuaUcapan() {
    const container = document.getElementById('comments-container');
    if (!container) return;

    container.innerHTML = "<p style='font-size:0.8rem; color:#888; text-align:center;'>Memuat ucapan...</p>";

    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = "";
            
            if (!data || data.length === 0) {
                container.innerHTML = "<p style='font-size:0.8rem; color:#888; text-align:center;'>Belum ada ucapan. Jadilah yang pertama!</p>";
                return;
            }

            data.reverse().forEach(item => {
                tampilkanUcapan(item.nama, item.status, item.pesan, false);
            });
        })
        .catch(err => {
            console.error("Gagal memuat riwayat ucapan:", err);
            container.innerHTML = "<p style='font-size:0.8rem; color:#888; text-align:center;'>Gagal memuat ucapan.</p>";
        });
}

function tampilkanUcapan(nama, status, pesan, isNew = false) {
    const container = document.getElementById('comments-container');
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'comment-card';
    card.innerHTML = `
        <div class="comment-header">
            <span>${nama}</span>
            <span class="status-badge">${status}</span>
        </div>
        <p class="comment-text">${pesan}</p>
    `;

    if (isNew) {
        container.insertBefore(card, container.firstChild);
    } else {
        container.appendChild(card);
    }
}