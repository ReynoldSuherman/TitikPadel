/**
 * TITIK PADEL - DYNAMIC MUSIC PLAYLIST & ADAPTIVE THEME ENGINE
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

let currentTrackIndex = parseInt(localStorage.getItem('titik_track_idx')) || 0;
let isAudioPlaying = localStorage.getItem('titik_music_playing') === 'true';

// Singleton Global Audio
let globalAudio = document.getElementById('globalAudio');
if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.id = 'globalAudio';
    globalAudio.loop = false;
    document.body.appendChild(globalAudio);
}

document.addEventListener('DOMContentLoaded', () => {
    initPlaylistUI();
    loadTrack(currentTrackIndex, false);
    initAudioEvents();

    const openBtn = document.getElementById('openMusicModalBtn');
    if (openBtn) {
        openBtn.addEventListener('click', openMusicModal);
    }
});

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
            loadTrack(idx, true);
        });
        container.appendChild(item);
    });
}

function loadTrack(index, autoPlay = true) {
    const track = PLAYLIST_DATA[index];
    if (!track) return;

    globalAudio.src = track.file;
    localStorage.setItem('titik_track_idx', index);

    // Adaptive Theme Accent Switching
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
            console.warn("Autoplay waiting for user gesture:", err);
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
            loadTrack(currentTrackIndex, true);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST_DATA.length;
            loadTrack(currentTrackIndex, true);
        });
    }

    globalAudio.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST_DATA.length;
        loadTrack(currentTrackIndex, true);
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