/**
 * TiTik PADEL — ADVANCED BOOKING ENGINE & CONCIERGE LOGIC (6 COURTS)
 */

const COURTS_DATA = [
    { id: 'court_1', name: 'Court 01: Panoramic Center', type: 'indoor', rate: 350000, desc: 'FIP Pro Official Glass & Mondo Turf (Indoor Air-Cooled)' },
    { id: 'court_2', name: 'Court 02: Match Arena Pro', type: 'indoor', rate: 350000, desc: 'Tournament Grade Glass with Anti-Glare LED System' },
    { id: 'court_3', name: 'Court 03: Executive Glass', type: 'indoor', rate: 380000, desc: 'Premium Viewing Deck & Direct Café Access' },
    { id: 'court_4', name: 'Court 04: Semi-Outdoor Breeze', type: 'outdoor', rate: 300000, desc: 'Open-Air Canopy with Natural Airflow & Shade' },
    { id: 'court_5', name: 'Court 05: Sunset Open Court', type: 'outdoor', rate: 300000, desc: 'Scenic Sunset View with Premium Artificial Turf' },
    { id: 'court_6', name: 'Court 06: Community Master', type: 'outdoor', rate: 280000, desc: 'Ideal for Open Play, Coaching Clinics & Club Members' }
];

const TIME_SLOTS_CONFIG = {
    morning: ['06:00', '07:00', '08:00', '09:00', '10:00'],
    afternoon: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    night: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']
};

const ADDONS_CONFIG = {
    racket_std: { name: 'Standard Club Racket', price: 40000 },
    racket_vertex: { name: 'Bullpadel Vertex 04 Pro', price: 95000 },
    racket_viper: { name: 'Babolat Technical Viper', price: 110000 },
    racket_bela: { name: 'Wilson Bela Pro V2', price: 115000 },
    balls_regular: { name: 'Bola Padel Reguler (3 Pcs)', price: 25000 },
    balls_pro: { name: 'Head Padel Pro Can (Segel FIP)', price: 55000 },
    cafepack: { name: 'TiTik Café Recovery Perk', price: 75000 }
};

let bookingState = {
    selectedDate: '',
    selectedCourtId: COURTS_DATA[0].id,
    selectedSlots: [],
    addons: {
        racket_std: 0,
        racket_vertex: 0,
        racket_viper: 0,
        racket_bela: 0,
        balls_regular: 0,
        balls_pro: 0,
        cafepack: 0
    },
    promoCode: '',
    discountPct: 0,
    splitCount: 4
};

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('dateRibbon')) return;

    initDateRibbon();
    initCourtCards();
    initTimeMatrix();
    initAddonsCounter();
    initConciergeControls();
});

function initDateRibbon() {
    const scroller = document.getElementById('dateRibbon');
    if (!scroller) return;

    scroller.innerHTML = '';
    const today = new Date();

    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        const dayNum = d.getDate();
        const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
        const fullDateStr = d.toISOString().split('T')[0];

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `ribbon-day-btn ${i === 0 ? 'active' : ''}`;
        btn.dataset.date = fullDateStr;
        btn.innerHTML = `
            <span class="r-day-name">${dayName}</span>
            <span class="r-day-num">${dayNum} ${monthName}</span>
            <span class="r-weather">🌤️ 28°C</span>
        `;

        if (i === 0) bookingState.selectedDate = fullDateStr;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.ribbon-day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bookingState.selectedDate = fullDateStr;
            bookingState.selectedSlots = [];
            initTimeMatrix();
            updateConciergeSummary();
        });

        scroller.appendChild(btn);
    }

    const btnPrev = document.getElementById('dateScrollPrev');
    const btnNext = document.getElementById('dateScrollNext');
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => scroller.scrollBy({ left: -200, behavior: 'smooth' }));
        btnNext.addEventListener('click', () => scroller.scrollBy({ left: 200, behavior: 'smooth' }));
    }

    updateConciergeSummary();
}

function initCourtCards() {
    const container = document.getElementById('courtContainer');
    if (!container) return;

    container.innerHTML = '';
    COURTS_DATA.forEach((court, idx) => {
        const card = document.createElement('div');
        card.className = `luxe-court-card ${idx === 0 ? 'active' : ''}`;
        card.dataset.courtId = court.id;
        card.innerHTML = `
            <div>
                <span class="court-badge-cat">ARENA // ${court.type.toUpperCase()}</span>
                <h3>${court.name}</h3>
                <p class="court-specs">${court.desc}</p>
            </div>
            <div class="court-bottom-bar">
                <span class="hourly-rate">Rp ${court.rate.toLocaleString('id-ID')} / jam</span>
                <span class="select-pill">${idx === 0 ? 'Dipilih' : 'Pilih'}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.luxe-court-card').forEach(c => {
                c.classList.remove('active');
                c.querySelector('.select-pill').textContent = 'Pilih';
            });
            card.classList.add('active');
            card.querySelector('.select-pill').textContent = 'Dipilih';
            bookingState.selectedCourtId = court.id;
            bookingState.selectedSlots = [];
            initTimeMatrix();
            updateConciergeSummary();
        });

        container.appendChild(card);
    });
}

function initTimeMatrix() {
    const morningGrid = document.getElementById('morningMatrix');
    const afternoonGrid = document.getElementById('afternoonMatrix');
    const nightGrid = document.getElementById('nightMatrix');

    if (!morningGrid || !afternoonGrid || !nightGrid) return;

    morningGrid.innerHTML = '';
    afternoonGrid.innerHTML = '';
    nightGrid.innerHTML = '';

    const currentCourt = COURTS_DATA.find(c => c.id === bookingState.selectedCourtId) || COURTS_DATA[0];

    const renderSlotsToGrid = (slotsArray, gridEl, periodName) => {
        slotsArray.forEach((timeStr, idx) => {
            // Simulasi slot terisi acak berdasarkan tanggal & court agar dinamis
            const isBooked = (parseInt(bookingState.selectedDate.replace(/-/g, '')) + idx + currentCourt.name.length) % 7 === 0;
            const isSelected = bookingState.selectedSlots.includes(timeStr);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `luxe-slot-btn ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`;
            btn.disabled = isBooked;

            const rateCalc = periodName === 'morning' ? currentCourt.rate * 0.85 : (periodName === 'night' ? currentCourt.rate * 1.15 : currentCourt.rate);

            btn.innerHTML = `
                <span class="slot-time-text">${timeStr} WIB</span>
                <span class="slot-rate-text">${isBooked ? 'Terisi' : 'Rp ' + Math.round(rateCalc / 1000) + 'rb'}</span>
            `;

            if (!isBooked) {
                btn.addEventListener('click', () => {
                    if (bookingState.selectedSlots.includes(timeStr)) {
                        bookingState.selectedSlots = bookingState.selectedSlots.filter(s => s !== timeStr);
                    } else {
                        bookingState.selectedSlots.push(timeStr);
                        bookingState.selectedSlots.sort();
                    }
                    initTimeMatrix();
                    updateConciergeSummary();
                });
            }

            gridEl.appendChild(btn);
        });
    };

    renderSlotsToGrid(TIME_SLOTS_CONFIG.morning, morningGrid, 'morning');
    renderSlotsToGrid(TIME_SLOTS_CONFIG.afternoon, afternoonGrid, 'afternoon');
    renderSlotsToGrid(TIME_SLOTS_CONFIG.night, nightGrid, 'night');

    const countBadge = document.getElementById('availCountBadge');
    if (countBadge) countBadge.textContent = '12 Slot Tersedia';
}

function initAddonsCounter() {
    document.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const isPlus = btn.classList.contains('plus');

            if (isPlus) {
                bookingState.addons[targetId]++;
            } else {
                if (bookingState.addons[targetId] > 0) bookingState.addons[targetId]--;
            }

            const valEl = document.getElementById(`qty-${targetId}`);
            if (valEl) valEl.textContent = bookingState.addons[targetId];

            const card = btn.closest('.luxe-addon-card');
            if (card) {
                if (bookingState.addons[targetId] > 0) card.classList.add('active');
                else card.classList.remove('active');
            }

            updateConciergeSummary();
        });
    });
}

function initConciergeControls() {
    const btnApplyPromo = document.getElementById('btnApplyPromo');
    const inputPromo = document.getElementById('inputPromo');
    const promoFeedback = document.getElementById('promoFeedback');

    if (btnApplyPromo && inputPromo) {
        btnApplyPromo.addEventListener('click', () => {
            const code = inputPromo.value.trim().toUpperCase();
            if (code === 'TITIKFIRST') {
                bookingState.promoCode = code;
                bookingState.discountPct = 15;
                promoFeedback.textContent = '✓ Promo 15% Berhasil Digunakan!';
                promoFeedback.className = 'promo-feedback success';
            } else if (code === 'PADELVIP') {
                bookingState.promoCode = code;
                bookingState.discountPct = 25;
                promoFeedback.textContent = '✓ VIP Promo 25% Berhasil Digunakan!';
                promoFeedback.className = 'promo-feedback success';
            } else {
                bookingState.promoCode = '';
                bookingState.discountPct = 0;
                promoFeedback.textContent = '✕ Kode promo tidak valid.';
                promoFeedback.className = 'promo-feedback error';
            }
            updateConciergeSummary();
        });
    }

    const btnSplitMinus = document.getElementById('splitMinus');
    const btnSplitPlus = document.getElementById('splitPlus');
    const splitCountEl = document.getElementById('splitPlayerCount');

    if (btnSplitMinus && btnSplitPlus && splitCountEl) {
        btnSplitMinus.addEventListener('click', () => {
            if (bookingState.splitCount > 1) {
                bookingState.splitCount--;
                splitCountEl.textContent = bookingState.splitCount;
                updateConciergeSummary();
            }
        });
        btnSplitPlus.addEventListener('click', () => {
            if (bookingState.splitCount < 12) {
                bookingState.splitCount++;
                splitCountEl.textContent = bookingState.splitCount;
                updateConciergeSummary();
            }
        });
    }
}

function updateConciergeSummary() {
    const summaryDate = document.getElementById('summaryDate');
    const summaryCourt = document.getElementById('summaryCourt');
    const summarySlots = document.getElementById('summarySlots');
    const summaryAddons = document.getElementById('summaryAddons');

    const calcSubtotalCourt = document.getElementById('calcSubtotalCourt');
    const calcSubtotalAddons = document.getElementById('calcSubtotalAddons');
    const discountLine = document.getElementById('discountLine');
    const calcDiscount = document.getElementById('calcDiscount');
    const calcFee = document.getElementById('calcFee');
    const calcGrandTotal = document.getElementById('calcGrandTotal');
    const splitPerPerson = document.getElementById('splitPerPerson');

    const btnSubmitBooking = document.getElementById('btnSubmitBooking');
    const mobileFloatingBar = document.getElementById('mobileFloatingBar');
    const mobileTotalPrice = document.getElementById('mobileTotalPrice');
    const mobileSlotCount = document.getElementById('mobileSlotCount');
    const btnOpenMobileSheet = document.getElementById('btnOpenMobileSheet');

    if (!summaryDate) return;

    summaryDate.textContent = bookingState.selectedDate || '-';

    const currentCourt = COURTS_DATA.find(c => c.id === bookingState.selectedCourtId) || COURTS_DATA[0];
    summaryCourt.textContent = currentCourt.name.split(':')[0];

    let slotsHtml = '';
    let courtSubtotal = 0;

    if (bookingState.selectedSlots.length > 0) {
        bookingState.selectedSlots.forEach(s => {
            slotsHtml += `<span class="slot-tag-badge">${s}</span>`;
            courtSubtotal += currentCourt.rate;
        });
        summarySlots.innerHTML = slotsHtml;
    } else {
        summarySlots.innerHTML = `<span class="placeholder-text">Belum ada slot dipilih</span>`;
    }

    let addonsSubtotal = 0;
    Object.keys(bookingState.addons).forEach(key => {
        const qty = bookingState.addons[key];
        if (qty > 0) {
            addonsSubtotal += qty * ADDONS_CONFIG[key].price;
        }
    });

    summaryAddons.textContent = `Rp ${addonsSubtotal.toLocaleString('id-ID')}`;

    calcSubtotalCourt.textContent = `Rp ${courtSubtotal.toLocaleString('id-ID')}`;
    calcSubtotalAddons.textContent = `Rp ${addonsSubtotal.toLocaleString('id-ID')}`;

    let discountNominal = 0;
    if (bookingState.discountPct > 0) {
        discountNominal = (courtSubtotal * bookingState.discountPct) / 100;
        discountLine.style.display = 'flex';
        calcDiscount.textContent = `- Rp ${discountNominal.toLocaleString('id-ID')} (${bookingState.discountPct}%)`;
    } else {
        discountLine.style.display = 'none';
    }

    const facilityFee = bookingState.selectedSlots.length > 0 ? 25000 : 0;
    calcFee.textContent = `Rp ${facilityFee.toLocaleString('id-ID')}`;

    const grandTotal = Math.max(0, courtSubtotal + addonsSubtotal - discountNominal + facilityFee);
    calcGrandTotal.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    const perPerson = Math.round(grandTotal / bookingState.splitCount);
    splitPerPerson.textContent = `Rp ${perPerson.toLocaleString('id-ID')}`;

    if (mobileTotalPrice) mobileTotalPrice.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    if (mobileSlotCount) mobileSlotCount.textContent = `${bookingState.selectedSlots.length} Jam`;

    const isValid = bookingState.selectedSlots.length > 0;
    if (btnSubmitBooking) btnSubmitBooking.disabled = !isValid;
    if (btnOpenMobileSheet) btnOpenMobileSheet.disabled = !isValid;
}

function proceedBookingSubmission() {
    const name = document.getElementById('clientName').value.trim();
    const whatsapp = document.getElementById('clientWhatsapp').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const notes = document.getElementById('clientNotes').value.trim();

    if (!name || !whatsapp || !email) {
        showToast('⚠️ Harap lengkapi data pemesan terlebih dahulu.');
        return;
    }

    const currentCourt = COURTS_DATA.find(c => c.id === bookingState.selectedCourtId) || COURTS_DATA[0];
    const grandTotalText = document.getElementById('calcGrandTotal').textContent;

    let orderSummaryText = `*RESERVASI TIITK PADEL TANGERANG*%0A`;
    orderSummaryText += `───────────────────%0A`;
    orderSummaryText += `👤 Nama: ${name}%0A`;
    orderSummaryText += `📱 WhatsApp: ${whatsapp}%0A`;
    orderSummaryText += `📧 Email: ${email}%0A`;
    orderSummaryText += `📅 Tanggal: ${bookingState.selectedDate}%0A`;
    orderSummaryText += `🏟️ Lapangan: ${currentCourt.name}%0A`;
    orderSummaryText += `⏰ Jam: ${bookingState.selectedSlots.join(', ')} WIB%0A`;
    orderSummaryText += `💰 Total Tagihan: ${grandTotalText}%0A`;
    if (notes) orderSummaryText += `📝 Catatan: ${notes}%0A`;
    orderSummaryText += `───────────────────%0A`;
    orderSummaryText += `Mohon konfirmasi pembayaran & ketersediaan slot. Terima kasih!`;

    const whatsappUrl = `https://wa.me/6281234567890?text=${orderSummaryText}`;
    
    showToast('✦ Mengalihkan ke WhatsApp Concierge...');
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
}