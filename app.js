/**
 * TiTik PADEL - SPA LAYER ROUTER, THEME PERSISTENCE & MUSIC MANAGER
 */

// 1. PLAYLIST TRACKS DATA
const PLAYLIST_DATA = [
    {
        id: 0,
        title: "Hiper Funtime",
        file: "Music/Hiper Funtime.mp3",
        genre: "High Energy Upbeat",
        theme: "hiper",
        colorName: "Cyber Matcha Neon",
        layer: "sanctuary" // default layer association
    },
    {
        id: 1,
        title: "Jazzy Padelist",
        file: "Music/Jazzy Padelist.mp3",
        genre: "Warm Matchside Jazz",
        theme: "jazzy",
        colorName: "Amber Bronze Gold",
        layer: "booking"
    },
    {
        id: 2,
        title: "Lo-fi Padeltime",
        file: "Music/Lo-fi Padeltime.mp3",
        genre: "Chilled Sunset Beats",
        theme: "lofi",
        colorName: "Sunset Rose Pink",
        layer: "founder"
    },
    {
        id: 3,
        title: "Vaporwavy Apdel",
        file: "Music/Vaporwavy Apdel.mp3",
        genre: "Synthwave Cyber Aura",
        theme: "vapor",
        colorName: "Neon Violet Dream",
        layer: "sanctuary"
    }
];

let currentTrackIndex = parseInt(localStorage.getItem('titik_track_idx')) || 0;
let isAudioPlaying = localStorage.getItem('titik_music_playing') === 'true';
const globalAudio = document.getElementById('globalAudio');

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initPlaylistUI();
    initAudioEvents();
    initMobileMenu();
    initQRGenerator();

    // Auto-setup first track without auto-playing abruptly
    setupTrack(currentTrackIndex, isAudioPlaying);

    // Click trigger for browser Autoplay Policy unlock
    document.addEventListener('click', function unlockAudio() {
        if (!globalAudio.src) setupTrack(currentTrackIndex, true);
        document.removeEventListener('click', unlockAudio);
    }, { once: true });
});

// 3. SPA LAYER NAVIGATION WITH AUDIO AUTO-SWITCH
function navigateTo(targetLayer) {
    // A. Switch visible Layer
    document.querySelectorAll('.page-layer').forEach(layer => {
        layer.classList.remove('active');
    });
    const activeLayer = document.getElementById(`layer-${targetLayer}`);
    if (activeLayer) activeLayer.classList.add('active');

    // B. Update Navbar Desktop State
    document.querySelectorAll('.nav-link').forEach(btn => {
        if (btn.getAttribute('data-nav') === targetLayer) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // C. Update Navbar Mobile State
    document.querySelectorAll('[data-nav-mobile]').forEach(btn => {
        if (btn.getAttribute('data-nav-mobile') === targetLayer) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // D. Seamless Audio Switch per Layer
    const matchedTrackIdx = PLAYLIST_DATA.findIndex(t => t.layer === targetLayer);
    if (matchedTrackIdx !== -1 && matchedTrackIdx !== currentTrackIndex) {
        currentTrackIndex = matchedTrackIdx;
        setupTrack(currentTrackIndex, true);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. THEME PERSISTENCE ENGINE
function initThemeManager() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('titik_theme_mode') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.add('transitioning');
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('titik_theme_mode', isLight ? 'light' : 'dark');
            setTimeout(() => document.body.classList.remove('transitioning'), 400);
        });
    }
}

// 5. PLAYLIST & ADAPTIVE COLOR ENGINE
function initPlaylistUI() {
    const container = document.getElementById('tracksContainer');
    if (!container) return;

    container.innerHTML = '';
    PLAYLIST_DATA.forEach((track, idx) => {
        const item = document.createElement('div');
        item.className = `music-track-item ${idx === currentTrackIndex ? 'active' : ''}`;
        item.innerHTML = `
            <div class="track-info">
                <span class="track-index">0${idx + 1}</span>
                <div>
                    <span class="track-title">${track.title}</span>
                    <span class="track-genre">${track.genre} &bull; <small style="color:var(--c-bronze-gold);">${track.colorName}</small></span>
                </div>
            </div>
            <span class="track-playing-icon">♫</span>
        `;
        item.addEventListener('click', () => {
            currentTrackIndex = idx;
            setupTrack(idx, true);
        });
        container.appendChild(item);
    });

    const openBtn = document.getElementById('openMusicModalBtn');
    if (openBtn) openBtn.addEventListener('click', openMusicModal);
}

function setupTrack(index, autoPlay = true) {
    const track = PLAYLIST_DATA[index];
    if (!track || !globalAudio) return;

    globalAudio.src = track.file;
    localStorage.setItem('titik_track_idx', index);

    // Dynamically update theme color accent
    document.body.setAttribute('data-music-theme', track.theme);

    const navTitle = document.getElementById('navTrackTitle');
    if (navTitle) navTitle.textContent = `🎵 ${track.title}`;

    const playPauseBtn = document.getElementById('btnPlayPauseTrack');
    const pulseDot = document.getElementById('musicPulseDot');

    document.querySelectorAll('.music-track-item').forEach((el, idx) => {
        if (idx === index) el.classList.add('active');
        else el.classList.remove('active');
    });

    if (autoPlay) {
        globalAudio.play().then(() => {
            isAudioPlaying = true;
            localStorage.setItem('titik_music_playing', 'true');
            if (playPauseBtn) playPauseBtn.textContent = '⏸';
            if (pulseDot) pulseDot.style.boxShadow = '0 0 10px var(--c-court-green)';
        }).catch(err => {
            console.warn("Audio autoplay standby for user click gesture.");
        });
    } else {
        if (playPauseBtn) playPauseBtn.textContent = '▶';
    }
}

function initAudioEvents() {
    const playPauseBtn = document.getElementById('btnPlayPauseTrack');
    const prevBtn = document.getElementById('btnPrevTrack');
    const nextBtn = document.getElementById('btnNextTrack');
    const progressWrap = document.getElementById('progressWrap');
    const progressBar = document.getElementById('musicProgressBar');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (globalAudio.paused) {
                globalAudio.play();
                playPauseBtn.textContent = '⏸';
                isAudioPlaying = true;
                localStorage.setItem('titik_music_playing', 'true');
            } else {
                globalAudio.pause();
                playPauseBtn.textContent = '▶';
                isAudioPlaying = false;
                localStorage.setItem('titik_music_playing', 'false');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex - 1 + PLAYLIST_DATA.length) % PLAYLIST_DATA.length;
            setupTrack(currentTrackIndex, true);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST_DATA.length;
            setupTrack(currentTrackIndex, true);
        });
    }

    globalAudio.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST_DATA.length;
        setupTrack(currentTrackIndex, true);
    });

    globalAudio.addEventListener('timeupdate', () => {
        if (globalAudio.duration && progressBar) {
            const pct = (globalAudio.currentTime / globalAudio.duration) * 100;
            progressBar.style.width = `${pct}%`;
        }
    });

    if (progressWrap) {
        progressWrap.addEventListener('click', (e) => {
            const width = progressWrap.clientWidth;
            const clickX = e.offsetX;
            if (globalAudio.duration) {
                globalAudio.currentTime = (clickX / width) * globalAudio.duration;
            }
        });
    }
}

function openMusicModal() {
    const modal = document.getElementById('musicPlaylistModal');
    if (modal) modal.classList.add('open');
}

function closeMusicModal() {
    const modal = document.getElementById('musicPlaylistModal');
    if (modal) modal.classList.remove('open');
}

// 6. QR CODE MODAL & GENERATOR
function initQRGenerator() {
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer && typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: window.location.href,
            width: 160,
            height: 160,
            colorDark : "#090C0F",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }
}

function openQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.add('open');
}

function closeQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.remove('open');
}

// 7. MOBILE MENU
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (menuBtn && drawer) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            drawer.classList.toggle('open');
        });
    }
}

function closeMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (menuBtn && drawer) {
        menuBtn.classList.remove('active');
        drawer.classList.remove('open');
    }
}

// 8. SERVICE WORKER PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration skipped:', err));
    });
}