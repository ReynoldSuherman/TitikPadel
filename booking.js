/**
 * TiTik PADEL - BOOKING ENGINE & SPLIT BILL REAL-TIME CALCULATOR
 */

const COURTS_DATA = [
    {
        id: 'court-01',
        name: 'Court 01 — TiTik Obsidian Panoramic',
        type: 'indoor',
        turf: 'Mondo Supercourt XN Blue',
        specs: '12mm Seamless Panoramic Glass ✦ 800 Lux LED',
        pricePerPeriod: {
            morning: 300000,
            afternoon: 350000,
            night: 420000
        }
    },
    {
        id: 'court-02',
        name: 'Court 02 — TiTik Sanctuary Semi-Outdoor',
        type: 'outdoor',
        turf: 'Official WPT Anti-Glare Green',
        specs: 'High Canopy Roof ✦ Natural Cross-Breeze Ventilation',
        pricePerPeriod: {
            morning: 250000,
            afternoon: 300000,
            night: 380000
        }
    }
];

const PROMO_CODES = {
    'TITIKFIRST': { discountRate: 0.15, label: 'Diskon 15% Pemain Pertama TiTik' },
    'SENOPATIPADEL': { discountRate: 0.10, label: 'Diskon Komunitas 10%' },
    'TITIKCAFE': { discountRate: 0.10, label: 'Promo Bundling Café 10%' }
};

const TIME_SCHEDULE = [
    { id: 'm-06', time: '06:00 - 07:00', period: 'morning', bookedCourts: [] },
    { id: 'm-07', time: '07:00 - 08:00', period: 'morning', bookedCourts: ['court-02'] },
    { id: 'm-08', time: '08:00 - 09:00', period: 'morning', bookedCourts: ['court-01'] },
    { id: 'm-09', time: '09:00 - 10:00', period: 'morning', bookedCourts: [] },
    { id: 'm-10', time: '10:00 - 11:00', period: 'morning', bookedCourts: [] },
    { id: 'a-11', time: '11:00 - 12:00', period: 'afternoon', bookedCourts: ['court-02'] },
    { id: 'a-12', time: '12:00 - 13:00', period: 'afternoon', bookedCourts: [] },
    { id: 'a-13', time: '13:00 - 14:00', period: 'afternoon', bookedCourts: [] },
    { id: 'a-14', time: '14:00 - 15:00', period: 'afternoon', bookedCourts: [] },
    { id: 'a-15', time: '15:00 - 16:00', period: 'afternoon', bookedCourts: ['court-01'] },
    { id: 'a-16', time: '16:00 - 17:00', period: 'afternoon', bookedCourts: [] },
    { id: 'n-17', time: '17:00 - 18:00', period: 'night', bookedCourts: [] },
    { id: 'n-18', time: '18:00 - 19:00', period: 'night', bookedCourts: ['court-01', 'court-02'] },
    { id: 'n-19', time: '19:00 - 20:00', period: 'night', bookedCourts: ['court-01', 'court-02'] },
    { id: 'n-20', time: '20:00 - 21:00', period: 'night', bookedCourts: ['court-01'] },
    { id: 'n-21', time: '21:00 - 22:00', period: 'night', bookedCourts: [] },
    { id: 'n-22', time: '22:00 - 23:00', period: 'night', bookedCourts: [] }
];

let bookingState = {
    selectedDate: '',
    selectedCourt: COURTS_DATA[0],
    activeFilter: 'all',
    selectedSlots: [],
    addons: {
        racket: 0,
        balls: 0,
        cafepack: 0,
        coach: 0
    },
    promoApplied: null,
    splitPlayers: 4,
    finalTotal: 0
};

document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initDateRibbon();
    initCourtCards();
    initCourtFilters();
    renderTimeMatrix();
    initAddonCounters();
    initPromoCodeEngine();
    initSplitBillControls();
    initMobileFloatingBar();
    updateLiveManifest();
});

function initLiveClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;
    function update() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `SENOPATI ${hrs}:${mins}:${secs} WIB`;
    }
    update();
    setInterval(update, 1000);
}

function initDateRibbon() {
    const ribbon = document.getElementById('dateRibbon');
    const prevBtn = document.getElementById('dateScrollPrev');
    const nextBtn = document.getElementById('dateScrollNext');
    if (!ribbon) return;

    const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'];
    const weatherIcons = ['☀️ Cerah', '🌤️ Sejuk', '⛅ Berawan', '🌤️ Cerah', '🌙 Sejuk', '🌤️ Cerah', '☀️ Cerah'];

    ribbon.innerHTML = '';
    const now = new Date();

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);

        const dayName = i === 0 ? 'Hari Ini' : days[d.getDay()];
        const dateNum = `${d.getDate()} ${months[d.getMonth()]}`;
        const fullDateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `ribbon-day-btn ${i === 0 ? 'active' : ''}`;
        btn.innerHTML = `
            <span class="r-day-name">${dayName}</span>
            <span class="r-day-num">${dateNum}</span>
            <span class="r-weather">${weatherIcons[i % weatherIcons.length]}</span>
        `;

        if (i === 0) bookingState.selectedDate = fullDateStr;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.ribbon-day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            bookingState.selectedDate = fullDateStr;
            bookingState.selectedSlots = [];
            renderTimeMatrix();
            updateLiveManifest();
            showToast(`Tanggal: ${fullDateStr}`);
        });

        ribbon.appendChild(btn);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => ribbon.scrollBy({ left: -180, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => ribbon.scrollBy({ left: 180, behavior: 'smooth' }));
    }
}

function initCourtCards() {
    const container = document.getElementById('courtContainer');
    if (!container) return;

    container.innerHTML = '';
    COURTS_DATA.forEach(court => {
        if (bookingState.activeFilter !== 'all' && court.type !== bookingState.activeFilter) return;

        const isSelected = bookingState.selectedCourt.id === court.id;
        const card = document.createElement('div');
        card.className = `luxe-court-card ${isSelected ? 'active' : ''}`;
        card.innerHTML = `
            <div>
                <span class="court-badge-cat">${court.type === 'indoor' ? '✦ INDOOR PANORAMIC' : '✦ SEMI-OUTDOOR SHADED'}</span>
                <h3>${court.name}</h3>
                <p class="court-specs">${court.specs} &bull; ${court.turf}</p>
            </div>
            <div class="court-bottom-bar">
                <span class="hourly-rate">Mulai Rp ${(court.pricePerPeriod.morning/1000)}k <small style="font-weight: normal; color: #8E9BAE;">/ jam</small></span>
                <span class="select-pill">${isSelected ? '✓ Terpilih' : 'Pilih'}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            bookingState.selectedCourt = court;
            bookingState.selectedSlots = [];
            initCourtCards();
            renderTimeMatrix();
            updateLiveManifest();
            showToast(`Lapangan: ${court.name}`);
        });

        container.appendChild(card);
    });
}

function initCourtFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bookingState.activeFilter = btn.getAttribute('data-filter');
            initCourtCards();
        });
    });
}

function renderTimeMatrix() {
    const morningEl = document.getElementById('morningMatrix');
    const afternoonEl = document.getElementById('afternoonMatrix');
    const nightEl = document.getElementById('nightMatrix');
    const availBadge = document.getElementById('availCountBadge');

    if (!morningEl || !afternoonEl || !nightEl) return;

    morningEl.innerHTML = '';
    afternoonEl.innerHTML = '';
    nightEl.innerHTML = '';

    let availableCount = 0;

    TIME_SCHEDULE.forEach(slot => {
        const isBooked = slot.bookedCourts.includes(bookingState.selectedCourt.id);
        const isSelected = bookingState.selectedSlots.some(s => s.id === slot.id);
        const price = bookingState.selectedCourt.pricePerPeriod[slot.period];

        if (!isBooked) availableCount++;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `luxe-slot-btn ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`;
        btn.innerHTML = `
            <span class="slot-time-text">${slot.time}</span>
            <span class="slot-rate-text">${isBooked ? 'Terisi' : 'Rp ' + (price / 1000) + 'k'}</span>
        `;

        if (!isBooked) {
            btn.addEventListener('click', () => toggleTimeSlot(slot, price));
        }

        if (slot.period === 'morning') morningEl.appendChild(btn);
        else if (slot.period === 'afternoon') afternoonEl.appendChild(btn);
        else if (slot.period === 'night') nightEl.appendChild(btn);
    });

    if (availBadge) availBadge.textContent = `${availableCount} Slot Tersedia Hari Ini`;
}

function toggleTimeSlot(slot, price) {
    const existingIndex = bookingState.selectedSlots.findIndex(s => s.id === slot.id);
    if (existingIndex > -1) {
        bookingState.selectedSlots.splice(existingIndex, 1);
        showToast(`Slot ${slot.time} dilepas`);
    } else {
        bookingState.selectedSlots.push({ id: slot.id, time: slot.time, period: slot.period, price: price });
        showToast(`Slot ${slot.time} dipilih`);
    }
    renderTimeMatrix();
    updateLiveManifest();
}

function initAddonCounters() {
    const plusBtns = document.querySelectorAll('.btn-qty.plus');
    const minusBtns = document.querySelectorAll('.btn-qty.minus');

    plusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = btn.getAttribute('data-target');
            bookingState.addons[target] = (bookingState.addons[target] || 0) + 1;
            updateAddonUI(target);
            updateLiveManifest();
        });
    });

    minusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = btn.getAttribute('data-target');
            if (bookingState.addons[target] > 0) {
                bookingState.addons[target] -= 1;
                updateAddonUI(target);
                updateLiveManifest();
            }
        });
    });
}

function updateAddonUI(target) {
    const qtyEl = document.getElementById(`qty-${target}`);
    const cardEl = document.querySelector(`.luxe-addon-card[data-addon-id="${target}"]`);
    if (qtyEl) qtyEl.textContent = bookingState.addons[target];
    if (cardEl) {
        if (bookingState.addons[target] > 0) cardEl.classList.add('active');
        else cardEl.classList.remove('active');
    }
}

function initPromoCodeEngine() {
    const btn = document.getElementById('btnApplyPromo');
    const input = document.getElementById('inputPromo');
    const feedback = document.getElementById('promoFeedback');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const code = input.value.trim().toUpperCase();
        if (PROMO_CODES[code]) {
            bookingState.promoApplied = { code: code, ...PROMO_CODES[code] };
            feedback.textContent = `✓ Promo "${code}" aktif: ${PROMO_CODES[code].label}`;
            feedback.className = 'promo-feedback success';
            showToast(`Promo ${code} berhasil!`);
        } else {
            bookingState.promoApplied = null;
            feedback.textContent = '✗ Kode promo tidak valid.';
            feedback.className = 'promo-feedback error';
        }
        updateLiveManifest();
    });
}

function initSplitBillControls() {
    const plusBtn = document.getElementById('splitPlus');
    const minusBtn = document.getElementById('splitMinus');
    const countEl = document.getElementById('splitPlayerCount');
    if (!plusBtn || !minusBtn) return;

    plusBtn.addEventListener('click', () => {
        if (bookingState.splitPlayers < 8) {
            bookingState.splitPlayers++;
            countEl.textContent = bookingState.splitPlayers;
            updateLiveManifest();
        }
    });

    minusBtn.addEventListener('click', () => {
        if (bookingState.splitPlayers > 1) {
            bookingState.splitPlayers--;
            countEl.textContent = bookingState.splitPlayers;
            updateLiveManifest();
        }
    });
}

function initMobileFloatingBar() {
    const triggerBtn = document.getElementById('btnOpenMobileSheet');
    const sidebar = document.getElementById('conciergeSidebar');
    if (triggerBtn && sidebar) {
        triggerBtn.addEventListener('click', () => {
            sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const nameInput = document.getElementById('clientName');
            if (nameInput) setTimeout(() => nameInput.focus(), 600);
        });
    }
}

function updateLiveManifest() {
    const sumDate = document.getElementById('summaryDate');
    const sumCourt = document.getElementById('summaryCourt');
    const sumSlots = document.getElementById('summarySlots');
    const sumAddons = document.getElementById('summaryAddons');

    const calcCourt = document.getElementById('calcSubtotalCourt');
    const calcAddons = document.getElementById('calcSubtotalAddons');
    const calcDiscount = document.getElementById('calcDiscount');
    const discountLine = document.getElementById('discountLine');
    const calcFee = document.getElementById('calcFee');
    const calcGrand = document.getElementById('calcGrandTotal');
    const splitPerPerson = document.getElementById('splitPerPerson');
    const btnSubmit = document.getElementById('btnSubmitBooking');

    const mobileSlotCount = document.getElementById('mobileSlotCount');
    const mobileTotalPrice = document.getElementById('mobileTotalPrice');
    const btnMobileSheet = document.getElementById('btnOpenMobileSheet');

    updateBreadcrumbs();

    if (!sumDate) return;

    sumDate.textContent = bookingState.selectedDate || '-';
    sumCourt.textContent = bookingState.selectedCourt.name;

    const totalHours = bookingState.selectedSlots.length;

    if (totalHours === 0) {
        sumSlots.innerHTML = '<span class="placeholder-text">Belum ada slot dipilih</span>';
    } else {
        sumSlots.innerHTML = bookingState.selectedSlots.map(s => `<span class="slot-tag-badge">${s.time}</span>`).join('');
    }

    const courtSubtotal = bookingState.selectedSlots.reduce((acc, slot) => acc + slot.price, 0);

    const racketCost = (bookingState.addons.racket || 0) * 40000;
    const ballsCost = (bookingState.addons.balls || 0) * 55000;
    const cafeCost = (bookingState.addons.cafepack || 0) * 75000;
    const coachCost = (bookingState.addons.coach || 0) * 250000;
    const addonsSubtotal = racketCost + ballsCost + cafeCost + coachCost;

    if (addonsSubtotal > 0) {
        let addonDesc = [];
        if (bookingState.addons.racket > 0) addonDesc.push(`${bookingState.addons.racket}x Raket`);
        if (bookingState.addons.balls > 0) addonDesc.push(`${bookingState.addons.balls}x Bola`);
        if (bookingState.addons.cafepack > 0) addonDesc.push(`${bookingState.addons.cafepack}x TiTik Café`);
        if (bookingState.addons.coach > 0) addonDesc.push(`${bookingState.addons.coach}x Coach`);
        sumAddons.textContent = `${addonDesc.join(', ')} (Rp ${addonsSubtotal.toLocaleString('id-ID')})`;
    } else {
        sumAddons.textContent = 'Rp 0';
    }

    const facilityFee = totalHours > 0 ? 10000 : 0;

    let discountAmount = 0;
    if (bookingState.promoApplied && courtSubtotal > 0) {
        discountAmount = Math.round(courtSubtotal * bookingState.promoApplied.discountRate);
        discountLine.style.display = 'flex';
        calcDiscount.textContent = `- Rp ${discountAmount.toLocaleString('id-ID')}`;
    } else {
        discountLine.style.display = 'none';
    }

    const grandTotal = Math.max(0, courtSubtotal + addonsSubtotal + facilityFee - discountAmount);
    bookingState.finalTotal = grandTotal;

    calcCourt.textContent = `Rp ${courtSubtotal.toLocaleString('id-ID')}`;
    calcAddons.textContent = `Rp ${addonsSubtotal.toLocaleString('id-ID')}`;
    calcFee.textContent = `Rp ${facilityFee.toLocaleString('id-ID')}`;
    calcGrand.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    if (mobileSlotCount) mobileSlotCount.textContent = `${totalHours} Jam`;
    if (mobileTotalPrice) mobileTotalPrice.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    if (btnMobileSheet) btnMobileSheet.disabled = totalHours === 0;

    const perPerson = Math.ceil(grandTotal / (bookingState.splitPlayers || 1));
    if (splitPerPerson) splitPerPerson.textContent = `Rp ${perPerson.toLocaleString('id-ID')}`;

    if (btnSubmit) btnSubmit.disabled = totalHours === 0;
}

function updateBreadcrumbs() {
    const b1 = document.getElementById('badgeStep1');
    const b2 = document.getElementById('badgeStep2');
    const b3 = document.getElementById('badgeStep3');
    const b4 = document.getElementById('badgeStep4');

    if (!b1) return;

    b1.className = 'step-badge active';
    b2.className = `step-badge ${bookingState.selectedSlots.length > 0 ? 'active' : ''}`;
    b3.className = `step-badge ${(bookingState.addons.racket > 0 || bookingState.addons.balls > 0 || bookingState.addons.cafepack > 0 || bookingState.addons.coach > 0) ? 'active' : ''}`;
    b4.className = `step-badge ${bookingState.selectedSlots.length > 0 ? 'active' : ''}`;
}

function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function proceedBookingSubmission() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientWhatsapp').value;
    const email = document.getElementById('clientEmail').value;
    const notes = document.getElementById('clientNotes').value;

    const modal = document.getElementById('bookingModal');
    const receipt = document.getElementById('modalReceiptContent');
    if (!modal || !receipt) return;

    const slotsList = bookingState.selectedSlots.map(s => s.time).join(', ');

    receipt.innerHTML = `
        <div class="rec-line"><span>Booking Ref:</span><strong>#TITIK-${Math.floor(100000 + Math.random() * 900000)}</strong></div>
        <div class="rec-line"><span>Pemesan:</span><strong>${name}</strong></div>
        <div class="rec-line"><span>WhatsApp:</span><strong>${phone}</strong></div>
        <div class="rec-line"><span>Tanggal:</span><strong>${bookingState.selectedDate}</strong></div>
        <div class="rec-line"><span>Lapangan:</span><strong>${bookingState.selectedCourt.name}</strong></div>
        <div class="rec-line"><span>Slot Jam:</span><strong>${slotsList}</strong></div>
        <div class="rec-line"><span>Split (${bookingState.splitPlayers} Pemain):</span><strong>Rp ${(Math.ceil(bookingState.finalTotal / bookingState.splitPlayers)).toLocaleString('id-ID')} / org</strong></div>
        <div class="rec-line" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px; color: var(--c-court-green);">
            <span>Total Tagihan:</span><strong>Rp ${bookingState.finalTotal.toLocaleString('id-ID')}</strong>
        </div>
    `;

    const btnWA = document.getElementById('btnSendWhatsApp');
    if (btnWA) {
        btnWA.onclick = () => {
            const waMessage = encodeURIComponent(
                `Halo Concierge TiTik Padel Senopati,\n\nSaya ingin konfirmasi pembayaran reservasi:\n` +
                `• Nama: ${name}\n` +
                `• No WA: ${phone}\n` +
                `• Lapangan: ${bookingState.selectedCourt.name}\n` +
                `• Tanggal: ${bookingState.selectedDate}\n` +
                `• Slot Jam: ${slotsList}\n` +
                `• Total Tagihan: Rp ${bookingState.finalTotal.toLocaleString('id-ID')}\n` +
                (notes ? `• Catatan: ${notes}\n` : '') +
                `\nMohon invoice QRIS resmi. Terima kasih.`
            );
            window.open(`https://wa.me/6281234567890?text=${waMessage}`, '_blank');
        };
    }

    modal.classList.add('open');
}

function closeModalAndReset() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('open');
}