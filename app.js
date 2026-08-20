/**
 * TiTik PADEL - HYBRID ROUTER, SEQUENTIAL AUTOPLAY MUSIC & INDEPENDENT DYNAMIC THEME CONTROLLER
 */

const PLAYLIST_DATA = [
    {
        id: 0,
        title: "Aftermath court",
        file: "Music/Aftermath court.mp3",
        genre: "Tournament Match",
        theme: "emerald",
        colorName: "Matrix Green Mint"
    },
    {
        id: 1,
        title: "Cherish EDM for u",
        file: "Music/Cherish EDM for u.mp3",
        genre: "High Energy Club",
        theme: "cyan",
        colorName: "Electric Cyan Glow"
    },
    {
        id: 2,
        title: "Crazy (about you) - kamome sano",
        file: "Music/crazy (about you) - kamome sano.mp3",
        genre: "Melodic Synthwave",
        theme: "vapor",
        colorName: "Neon Violet Dream"
    },
    {
        id: 3,
        title: "Hiper Funtime",
        file: "Music/Hiper Funtime.mp3",
        genre: "High Energy Upbeat",
        theme: "hiper",
        colorName: "Cyber Matcha Neon"
    },
    {
        id: 4,
        title: "Jazzy Padelist",
        file: "Music/Jazzy Padelist.mp3",
        genre: "Warm Matchside Jazz",
        theme: "jazzy",
        colorName: "Amber Bronze Gold"
    },
    {
        id: 5,
        title: "Lo-fi Padeltime",
        file: "Music/Lo-fi Padeltime.mp3",
        genre: "Chilled Sunset Beats",
        theme: "lofi",
        colorName: "Sunset Rose Pink"
    },
    {
        id: 6,
        title: "Midnight Padel Break",
        file: "Music/Midnight Padel Break.mp3",
        genre: "Late Night Lounge",
        theme: "solar",
        colorName: "Sunset Orange Flare"
    },
    {
        id: 7,
        title: "Take U Rest",
        file: "Music/Take U Rest.mp3",
        genre: "Recovery Ambient",
        theme: "ruby",
        colorName: "Crimson Ruby Riot"
    },
    {
        id: 8,
        title: "Vaporwavy Apdel",
        file: "Music/Vaporwavy Apdel.mp3",
        genre: "Synthwave Cyber Aura",
        theme: "vapor",
        colorName: "Neon Violet Dream"
    }
];

const THEME_KEYS = ["hiper", "jazzy", "lofi", "vapor", "cyan", "ruby", "emerald", "solar"];

let currentTrackIndex = parseInt(localStorage.getItem('titik_track_idx')) || 0;
let isAudioPlaying = localStorage.getItem('titik_music_playing') !== 'false';
let isLooping = false;
let globalAudio = document.getElementById('globalAudio');
let deferredPrompt = null;

if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.id = 'globalAudio';
    globalAudio.loop = false;
    document.body.appendChild(globalAudio);
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initPlaylistUI();
    initAudioEvents();
    initMobileMenu();
    initQRGenerator();
    initPWAInstallPrompt();

    setupTrack(currentTrackIndex, isAudioPlaying);

    const unlockAutoplay = () => {
        if (globalAudio && globalAudio.paused && isAudioPlaying) {
            globalAudio.play().then(() => {
                updateAudioUIState(true);
            }).catch(() => {});
        }
        document.removeEventListener('click', unlockAutoplay);
        document.removeEventListener('touchstart', unlockAutoplay);
    };

    document.addEventListener('click', unlockAutoplay, { once: true });
    document.addEventListener('touchstart', unlockAutoplay, { once: true });
});

function randomizeTheme() {
    const currentTheme = document.body.getAttribute('data-music-theme');
    let randomTheme;
    do {
        randomTheme = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
    } while (randomTheme === currentTheme && THEME_KEYS.length > 1);

    document.body.setAttribute('data-music-theme', randomTheme);
}

function navigateTo(targetLayer) {
    const hasLayers = document.querySelectorAll('.page-layer').length > 0;

    randomizeTheme();

    if (hasLayers) {
        document.querySelectorAll('.page-layer').forEach(layer => {
            layer.classList.remove('active');
        });
        const activeLayer = document.getElementById(`layer-${targetLayer}`);
        if (activeLayer) activeLayer.classList.add('active');

        document.querySelectorAll('.nav-link').forEach(btn => {
            if (btn.getAttribute('data-nav') === targetLayer) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        document.querySelectorAll('[data-nav-mobile]').forEach(btn => {
            if (btn.getAttribute('data-nav-mobile') === targetLayer) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        if (targetLayer === 'sanctuary') window.location.href = 'index.html';
        else if (targetLayer === 'booking') window.location.href = 'booking.html';
        else if (targetLayer === 'founder') window.location.href = 'about-owner.html';
    }
}

function playNextTrack(autoPlay = true) {
    currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST_DATA.length;
    setupTrack(currentTrackIndex, autoPlay);
}

function setupTrack(index, autoPlay = true) {
    const track = PLAYLIST_DATA[index];
    if (!track || !globalAudio) return;

    currentTrackIndex = index;
    globalAudio.src = track.file;
    globalAudio.loop = false;
    localStorage.setItem('titik_track_idx', index);
    document.body.setAttribute('data-music-theme', track.theme);

    const navTitle = document.getElementById('navTrackTitle');
    if (navTitle) navTitle.textContent = `🎵 ${track.title}`;

    const labelEl = document.getElementById('currentThemeLabel');
    if (labelEl) labelEl.textContent = track.colorName;

    renderPlaylist();

    if (autoPlay) {
        globalAudio.play().then(() => {
            isAudioPlaying = true;
            localStorage.setItem('titik_music_playing', 'true');
            updateAudioUIState(true);
        }).catch(() => {
            updateAudioUIState(false);
        });
    } else {
        updateAudioUIState(false);
    }
}

function renderPlaylist() {
    const container = document.getElementById('tracksContainer');
    if (!container) return;

    container.innerHTML = '';
    PLAYLIST_DATA.forEach((track, index) => {
        const row = document.createElement('div');
        row.className = `music-track-item ${index === currentTrackIndex ? 'active' : ''}`;
        row.innerHTML = `
            <div class="track-info" style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                <span class="track-index" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--c-bronze-gold); font-weight: 700;">0${index + 1}</span>
                <div style="min-width: 0; flex: 1;">
                    <span class="track-title" style="font-size: 0.85rem; font-weight: 600; color: var(--c-ecru); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</span>
                    <span class="track-genre" style="font-size: 0.7rem; color: var(--c-muted); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.genre} &bull; <small style="color:var(--c-court-green);">${track.colorName}</small></span>
                </div>
            </div>
            <span class="track-playing-icon" style="font-size: 0.95rem; color: var(--c-court-green); flex-shrink: 0; margin-left: 8px;">${index === currentTrackIndex && isAudioPlaying ? '🔊' : '♫'}</span>
        `;

        row.addEventListener('click', () => {
            currentTrackIndex = index;
            setupTrack(index, true);
        });

        container.appendChild(row);
    });
}

function updateAudioUIState(playing) {
    const btn = document.getElementById('btnPlayPauseTrack');
    const pulseDot = document.getElementById('musicPulseDot');
    if (btn) btn.textContent = playing ? '⏸' : '▶';
    if (pulseDot) {
        pulseDot.style.boxShadow = playing ? '0 0 10px var(--c-court-green)' : 'none';
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
            if (!globalAudio) return;
            if (globalAudio.paused) {
                globalAudio.play().then(() => {
                    isAudioPlaying = true;
                    localStorage.setItem('titik_music_playing', 'true');
                    updateAudioUIState(true);
                });
            } else {
                globalAudio.pause();
                isAudioPlaying = false;
                localStorage.setItem('titik_music_playing', 'false');
                updateAudioUIState(false);
            }
            renderPlaylist();
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
            playNextTrack(true);
        });
    }

    globalAudio.addEventListener('ended', () => {
        if (isLooping) {
            globalAudio.play();
        } else {
            playNextTrack(true);
        }
    });

    globalAudio.addEventListener('timeupdate', () => {
        if (globalAudio.duration && progressBar) {
            const pct = (globalAudio.currentTime / globalAudio.duration) * 100;
            progressBar.style.width = `${pct}%`;
        }

        const currDisp = document.getElementById('currentTimeDisplay');
        const totDisp = document.getElementById('totalDurationDisplay');
        if (currDisp && globalAudio.currentTime) currDisp.textContent = formatTime(globalAudio.currentTime);
        if (totDisp && globalAudio.duration) totDisp.textContent = formatTime(globalAudio.duration);
    });

    if (progressWrap && globalAudio) {
        progressWrap.addEventListener('click', (e) => {
            const width = progressWrap.clientWidth;
            const clickX = e.offsetX;
            if (globalAudio.duration) {
                globalAudio.currentTime = (clickX / width) * globalAudio.duration;
            }
        });
    }
}

function formatTime(secs) {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
}

function toggleLoopMode() {
    isLooping = !isLooping;
    showToast(isLooping ? '🔁 Loop Mode: Active' : '▶ Loop Mode: Off');
}

function initPlaylistUI() {
    const container = document.getElementById('tracksContainer');
    if (!container) return;
    renderPlaylist();

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

function initPWAInstallPrompt() {
    const installBtn = document.getElementById('btnInstallApp');
    const isTouchDevice = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) || 
                          /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isTouchDevice && installBtn) {
        installBtn.style.display = 'none';
        return;
    } else if (installBtn) {
        installBtn.style.display = 'inline-flex';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            } else {
                // Alih-alih QR Code, berikan tips panduan instan via Toast khusus untuk perangkat mobile
                showToast('💡 Tips: Ketuk menu browser (titik tiga) lalu pilih "Tambahkan ke Layar Utama".');
            }
        });
    }
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

function openMapModal(title, embedUrl, externalUrl) {
    const modal = document.getElementById('interactiveMapModal');
    const titleEl = document.getElementById('mapModalTitle');
    const iframe = document.getElementById('mapModalIframe');
    const extLink = document.getElementById('mapExternalLink');

    if (modal && iframe) {
        titleEl.textContent = title;
        iframe.src = embedUrl;
        extLink.href = externalUrl;
        modal.classList.add('open');
    }
}

function closeMapModal() {
    const modal = document.getElementById('interactiveMapModal');
    const iframe = document.getElementById('mapModalIframe');
    if (modal) {
        modal.classList.remove('open');
        if (iframe) iframe.src = '';
    }
}

function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}