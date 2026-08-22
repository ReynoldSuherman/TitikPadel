/**
 * TiTik MATCH CAFÉ — ORDER & VIRTUAL PAGER ENGINE
 */

const CAFE_MENU_DATA = [
    { id: 'm1', name: 'Double Espresso Single-Origin', cat: 'coffee', price: 32000, desc: 'Biji arabika pilihan roasted fresh aroma buah.' },
    { id: 'm2', name: 'Cold Brew Tonic Signature', cat: 'coffee', price: 42000, desc: 'Espresso cold brew dengan sentuhan sparkling tonic segar.' },
    { id: 'm3', name: 'Iced Vanilla Oat Latte', cat: 'coffee', price: 48000, desc: 'Espresso blend, susu oat creamer nabati & vanilla murni.' },
    { id: 'm4', name: 'The Smash Protein Shake', cat: 'recovery', price: 55000, desc: 'Whey isolate, pisang ambon, almond butter & madu murni.' },
    { id: 'm5', name: 'Electrolyte Recovery Booster', cat: 'recovery', price: 40000, desc: 'Coconut water, chia seeds, lemon extract & Himalayan salt.' },
    { id: 'm6', name: 'Truffle Egg Avocado Sourdough', cat: 'brunch', price: 68000, desc: 'Roti sourdough 36 jam, alpukat segar & scrambled egg truffle.' },
    { id: 'm7', name: 'High-Protein Chicken Pesto Wrap', cat: 'brunch', price: 65000, desc: 'Dada ayam grill, saus basil pesto, selada & whole wheat wrap.' }
];

let cafeState = {
    mode: 'dinein', // 'dinein', 'courtside', 'pickup'
    targetLocation: 'Meja 01 (Indoor Lounge)',
    cart: {}, // id: qty
    queueCode: 'A-01'
};

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('cafeMenuGrid')) return;
    renderCafeMenu('all');
    updateCafeCartSummary();
});

function setCafeMode(mode) {
    cafeState.mode = mode;
    document.querySelectorAll('.cafe-mode-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    const selectTarget = document.getElementById('selectLocationTarget');
    const wrapper = document.getElementById('tableSelectorWrapper');

    if (mode === 'dinein') {
        wrapper.style.display = 'block';
        selectTarget.innerHTML = `
            <option value="Meja 01 (Indoor Lounge)">Meja 01 (Indoor Lounge)</option>
            <option value="Meja 02 (Indoor Window)">Meja 02 (Indoor Window)</option>
            <option value="Meja 03 (Outdoor Terrace)">Meja 03 (Outdoor Terrace)</option>
            <option value="Meja 04 (Bar High Stool)">Meja 04 (Bar High Stool)</option>
        `;
        cafeState.queueCode = 'A-' + Math.floor(10 + Math.random() * 89);
    } else if (mode === 'courtside') {
        wrapper.style.display = 'block';
        selectTarget.innerHTML = `
            <option value="Court 01 Bench (Panoramic)">Court 01 Bench (Panoramic)</option>
            <option value="Court 02 Bench (Match Arena)">Court 02 Bench (Match Arena)</option>
            <option value="Court 03 Bench (Executive)">Court 03 Bench (Executive)</option>
            <option value="Court 04 Bench (Semi-Outdoor)">Court 04 Bench (Semi-Outdoor)</option>
            <option value="Court 05 Bench (Sunset)">Court 05 Bench (Sunset)</option>
            <option value="Court 06 Bench (Community)">Court 06 Bench (Community)</option>
        `;
        cafeState.queueCode = 'B-' + Math.floor(10 + Math.random() * 89);
    } else {
        wrapper.style.display = 'none';
        cafeState.queueCode = 'P-' + Math.floor(10 + Math.random() * 89);
    }

    document.getElementById('ticketQueueType').textContent = `KODE ${cafeState.queueCode}`;
    updateCafeCartSummary();
}

function filterCafeMenu(cat) {
    document.querySelectorAll('.court-filter-toggle button').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-cafecat="${cat}"]`).classList.add('active');
    renderCafeMenu(cat);
}

function renderCafeMenu(category) {
    const grid = document.getElementById('cafeMenuGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const filtered = category === 'all' ? CAFE_MENU_DATA : CAFE_MENU_DATA.filter(m => m.cat === category);

    filtered.forEach(item => {
        const qty = cafeState.cart[item.id] || 0;
        const card = document.createElement('div');
        card.className = `luxe-addon-card ${qty > 0 ? 'active' : ''}`;
        card.innerHTML = `
            <div class="addon-left-meta">
                <div class="addon-icon-sym">${item.cat === 'coffee' ? '☕' : (item.cat === 'recovery' ? '⚡' : '🥑')}</div>
                <div class="addon-detail">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                    <span class="addon-fee">Rp ${item.price.toLocaleString('id-ID')}</span>
                </div>
            </div>
            <div class="qty-counter">
                <button type="button" class="btn-qty minus" onclick="updateCafeQty('${item.id}', -1)">-</button>
                <span class="qty-val" id="cafe-qty-${item.id}">${qty}</span>
                <button type="button" class="btn-qty plus" onclick="updateCafeQty('${item.id}', 1)">+</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateCafeQty(id, delta) {
    const current = cafeState.cart[id] || 0;
    const updated = Math.max(0, current + delta);
    if (updated === 0) delete cafeState.cart[id];
    else cafeState.cart[id] = updated;

    const valEl = document.getElementById(`cafe-qty-${id}`);
    if (valEl) valEl.textContent = updated;

    renderCafeMenu(document.querySelector('[data-cafecat].active').dataset.cafecat);
    updateCafeCartSummary();
}

function updateCafeCartSummary() {
    const listEl = document.getElementById('cafeCartItemsList');
    const subtotalEl = document.getElementById('cafeSubtotal');
    const taxEl = document.getElementById('cafeTax');
    const grandTotalEl = document.getElementById('cafeGrandTotal');
    const btnSubmit = document.getElementById('btnSubmitCafeOrder');

    if (!listEl) return;

    let html = '';
    let subtotal = 0;
    let totalItems = 0;

    Object.keys(cafeState.cart).forEach(id => {
        const qty = cafeState.cart[id];
        const item = CAFE_MENU_DATA.find(m => m.id === id);
        if (item && qty > 0) {
            totalItems += qty;
            const linePrice = qty * item.price;
            subtotal += linePrice;
            html += `
                <div class="manifest-item">
                    <span class="m-lbl">${qty}x ${item.name}</span>
                    <span class="m-val">Rp ${linePrice.toLocaleString('id-ID')}</span>
                </div>
            `;
        }
    });

    if (totalItems === 0) {
        listEl.innerHTML = `<span class="placeholder-text">Keranjang pesanan masih kosong</span>`;
        subtotalEl.textContent = 'Rp 0';
        taxEl.textContent = 'Rp 0';
        grandTotalEl.textContent = 'Rp 0';
        btnSubmit.disabled = true;
        return;
    }

    listEl.innerHTML = html;
    const tax = subtotal * 0.10;
    const grandTotal = subtotal + tax;

    subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    taxEl.textContent = `Rp ${tax.toLocaleString('id-ID')}`;
    grandTotalEl.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    btnSubmit.disabled = false;
}

function submitCafeOrder() {
    const name = document.getElementById('cafeGuestName').value.trim();
    const phone = document.getElementById('cafeGuestPhone').value.trim();
    const selectTarget = document.getElementById('selectLocationTarget');
    const destination = cafeState.mode === 'pickup' ? 'Quick Pickup Counter' : selectTarget.value;

    if (!name || !phone) {
        showToast('⚠️ Harap lengkapi nama dan nomor WhatsApp Anda.');
        return;
    }

    document.getElementById('modalPagerCode').textContent = cafeState.queueCode;
    document.getElementById('modalPagerDest').textContent = destination;
    
    const modal = document.getElementById('pagerSuccessModal');
    if (modal) modal.classList.add('open');

    // Tampilkan Pager Banner di Atas
    const banner = document.getElementById('cafePagerBanner');
    const badge = document.getElementById('pagerQueueBadge');
    if (banner && badge) {
        badge.textContent = `PAGER: ${cafeState.queueCode}`;
        banner.classList.add('show');
    }

    // Simulasi Virtual Pager Berdering Otomatis setelah 15 detik
    setTimeout(() => {
        showToast(`🔔 PAGER BERDERING! Pesanan ${cafeState.queueCode} untuk ${name} sudah siap!`);
        document.getElementById('pagerTitle').textContent = '🔔 PAGER READY: SIAP DIAMBIL!';
        document.getElementById('pagerSub').textContent = `Pesanan ${cafeState.queueCode} siap di ${destination}.`;
    }, 15000);
}

function closePagerModalAndReset() {
    const modal = document.getElementById('pagerSuccessModal');
    if (modal) modal.classList.remove('open');
    cafeState.cart = {};
    renderCafeMenu('all');
    updateCafeCartSummary();
}