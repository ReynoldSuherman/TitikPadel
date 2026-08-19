/**
 * TiTik PADEL - SPA LAYER ROUTER, RANDOMIZED MUSIC ENGINE & THEME MANAGER
 */

const PLAYLIST_DATA = [
    {
        id: 0,
        title: "Hiper Funtime",
        file: "Music/Hiper Funtime.mp3",
        genre: "High Energy Upbeat",
        theme: "hiper",
        colorName: "Cyber Matcha Neon"
    },
    {
        id: 1,
        title: "Jazzy Padelist",
        file: "Music/Jazzy Padelist.mp3",
        genre: "Warm Matchside Jazz",
        theme: "jazzy",
        colorName: "Amber Bronze Gold"
    },
    {
        id: 2,
        title: "Lo-fi Padeltime",
        file: "Music/Lo-fi Padeltime.mp3",
        genre: "Chilled Sunset Beats",
        theme: "lofi",
        colorName: "Sunset Rose Pink"
    },
    {
        id: 3,
        title: "Vaporwavy Apdel",
        file: "Music/Vaporwavy Apdel.mp3",
        genre: "Synthwave Cyber Aura",
        theme: "vapor",
        colorName: "Neon Violet Dream"
    }
];

let currentTrackIndex = 0;
let isAudioPlaying = false;
const globalAudio = document.getElementById('globalAudio');

document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initPlaylistUI();
    initAudioEvents();
    initMobileMenu();
    initQRGenerator();

    // Auto-pick a randomized track upon loading
    playRandomTrack(false);

    // Browser policy unlock on user click
    document.addEventListener('click', function unlockAudio() {
        if (!isAudioPlaying && globalAudio) {
            playRandomTrack(true);
        }
        document.removeEventListener('click', unlockAudio);
    }, { once: true });
});

// SPA Layer Navigation with Randomize Music
function navigateTo(targetLayer) {
    // 1. Switch visible Page Layer
    document.querySelectorAll('.page-layer').forEach(layer => {
        layer.classList.remove('active');
    });
    const activeLayer = document.getElementById(`layer-${targetLayer}`);
    if (activeLayer) activeLayer.classList.add('active');

    // 2. Update Navbars
    document.querySelectorAll('.nav-link').forEach(btn => {
        if (btn.getAttribute('data-nav') === targetLayer) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('[data-nav-mobile]').forEach(btn => {
        if (btn.getAttribute('data-nav-mobile') === targetLayer) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // 3. Randomize Music on every page/layer switch
    playRandomTrack(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Randomizer Function
function playRandomTrack(autoPlay = true) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * PLAYLIST_DATA.length);
    } while (PLAYLIST_DATA.length > 1 && newIndex === currentTrackIndex);

    currentTrackIndex = newIndex;
    setupTrack(currentTrackIndex, autoPlay);
}

function setupTrack(index, autoPlay = true) {
    const track = PLAYLIST_DATA[index];
    if (!track || !globalAudio) return;

    globalAudio.src = track.file;
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
            if (playPauseBtn) playPauseBtn.textContent = '⏸';
            if (pulseDot) pulseDot.style.boxShadow = '0 0 10px var(--c-court-green)';
        }).catch(() => {
            console.warn("Standby for user interaction.");
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
            } else {
                globalAudio.pause();
                playPauseBtn.textContent = '▶';
                isAudioPlaying = false;
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
            playRandomTrack(true);
        });
    }

    // Auto Play randomized track upon finish
    globalAudio.addEventListener('ended', () => {
        playRandomTrack(true);
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

function openMusicModal() {
    const modal = document.getElementById('musicPlaylistModal');
    if (modal) modal.classList.add('open');
}

function closeMusicModal() {
    const modal = document.getElementById('musicPlaylistModal');
    if (modal) modal.classList.remove('open');
}

// Theme Persistence
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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Registration:', err));
    });
}