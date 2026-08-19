/**
 * TiTik PADEL — MASTER APPLICATION CONTROLLER (app.js)
 */

const MUSIC_TRACKS = [
    { title: "Hiper Funtime", themeKey: "hiper", themeLabel: "Cyber Matcha Neon", url: "Music/Hiper Funtime.mp3" },
    { title: "Jazzy Padelist", themeKey: "jazzy", themeLabel: "Amber Bronze Gold", url: "Music/Jazzy Padelist.mp3" },
    { title: "Lo-fi Padeltime", themeKey: "lofi", themeLabel: "Sunset Rose Pink", url: "Music/Lo-fi Padeltime.mp3" },
    { title: "Vaporwavy Apdel", themeKey: "vapor", themeLabel: "Neon Violet Dream", url: "Music/Vaporwavy Apdel.mp3" }
];

let currentTrackIndex = parseInt(localStorage.getItem('titik_track_idx')) || 0;
let isAudioPlaying = localStorage.getItem('titik_music_playing') !== 'false';
let isLooping = false;
let globalAudio = null;

document.addEventListener('DOMContentLoaded', () => {
    globalAudio = document.getElementById('globalAudio');
    
    initNavigationRouting();
    initThemeEngine();
    initMusicEngine();
    initMobileDrawer();
    initQRCodeGenerator();

    if (globalAudio && MUSIC_TRACKS.length > 0) {
        setupTrack(currentTrackIndex, isAudioPlaying);
    }

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

// ==========================================
// 1. NAVIGATION & ROUTING ENGINE
// ==========================================
function navigateTo(targetLayer) {
    const hasLayers = document.querySelectorAll('.page-layer').length > 0;

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

function initNavigationRouting() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`layer-${hash}`)) {
        navigateTo(hash);
    }
}

function initMobileDrawer() {
    const btn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        drawer.classList.toggle('open');
    });
}

function closeMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (btn) btn.classList.remove('active');
    if (drawer) drawer.classList.remove('open');
}

// ==========================================
// 2. THEME & COLOR ENGINE
// ==========================================
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

// ==========================================
// 3. MUSIC & PLAYLIST ENGINE
// ==========================================
function initMusicEngine() {
    const openBtn = document.getElementById('openMusicModalBtn');
    const modal = document.getElementById('musicPlaylistModal');
    const playPauseBtn = document.getElementById('btnPlayPauseTrack');
    const prevBtn = document.getElementById('btnPrevTrack');
    const nextBtn = document.getElementById('btnNextTrack');
    const progressBarWrap = document.getElementById('progressWrap');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.add('open'));
    }

    renderPlaylist();

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
            currentTrackIndex = (currentTrackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
            setupTrack(currentTrackIndex, true);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            playNextTrack(true);
        });
    }

    if (globalAudio) {
        globalAudio.addEventListener('timeupdate', updateAudioProgress);
        globalAudio.addEventListener('ended', () => {
            if (isLooping) {
                globalAudio.play();
            } else {
                playNextTrack(true);
            }
        });
    }

    if (progressBarWrap && globalAudio) {
        progressBarWrap.addEventListener('click', (e) => {
            const rect = progressBarWrap.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            if (globalAudio.duration) {
                globalAudio.currentTime = (clickX / width) * globalAudio.duration;
            }
        });
    }
}

function playNextTrack(autoPlay = true) {
    currentTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
    setupTrack(currentTrackIndex, autoPlay);
}

function setupTrack(index, autoPlay = true) {
    const track = MUSIC_TRACKS[index];
    if (!track || !globalAudio) return;

    currentTrackIndex = index;
    globalAudio.src = track.file;
    globalAudio.loop = false;
    localStorage.setItem('titik_track_idx', index);
    document.body.setAttribute('data-music-theme', track.themeKey);

    const navTitle = document.getElementById('navTrackTitle');
    if (navTitle) navTitle.textContent = `🎵 ${track.title}`;

    const labelEl = document.getElementById('currentThemeLabel');
    if (labelEl) labelEl.textContent = track.themeLabel;

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
    MUSIC_TRACKS.forEach((track, index) => {
        const row = document.createElement('div');
        row.className = `music-track-row ${index === currentTrackIndex ? 'active' : ''}`;
        row.innerHTML = `
            <div class="music-track-info">
                <h5>0${index + 1}. ${track.title}</h5>
                <p>${track.themeLabel}</p>
            </div>
            <span class="music-track-glyph">${index === currentTrackIndex && isAudioPlaying ? '🔊' : '🎵'}</span>
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

function updateAudioProgress() {
    if (!globalAudio) return;
    const current = globalAudio.currentTime;
    const duration = globalAudio.duration || 0;

    const progressPercent = duration > 0 ? (current / duration) * 100 : 0;
    const progressBar = document.getElementById('musicProgressBar');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    const currDisp = document.getElementById('currentTimeDisplay');
    const totDisp = document.getElementById('totalDurationDisplay');
    if (currDisp) currDisp.textContent = formatTime(current);
    if (totDisp) totDisp.textContent = formatTime(duration);
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

function closeMusicModal() {
    const modal = document.getElementById('musicPlaylistModal');
    if (modal) modal.classList.remove('open');
}

// ==========================================
// 4. MAPS & QR MODALS
// ==========================================
function openMapModal(title, embedUrl, externalUrl) {
    const modal = document.getElementById('interactiveMapModal');
    const titleEl = document.getElementById('mapModalTitle');
    const iframeEl = document.getElementById('mapModalIframe');
    const extLink = document.getElementById('mapExternalLink');

    if (titleEl) titleEl.textContent = title;
    if (iframeEl) iframeEl.src = embedUrl;
    if (extLink) extLink.href = externalUrl;
    if (modal) modal.classList.add('open');
}

function closeMapModal() {
    const modal = document.getElementById('interactiveMapModal');
    const iframeEl = document.getElementById('mapModalIframe');
    if (modal) modal.classList.remove('open');
    if (iframeEl) iframeEl.src = '';
}

function openQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.add('open');
}

function closeQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.remove('open');
}

function initQRCodeGenerator() {
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer && typeof QRCode !== 'undefined' && qrContainer.innerHTML.trim() === '') {
        new QRCode(qrContainer, {
            text: window.location.href,
            width: 140,
            height: 140,
            colorDark: "#090C0F",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
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

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}