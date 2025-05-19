document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const trackListContainer = document.getElementById('track-list');
    const albumArtDisplay = document.getElementById('album-art-display');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');

    const API_BASE_URL = 'https://music.caohoangphuc.id.vn/playmusic?name=';

    let playlist = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 0; // 0: no repeat, 1: repeat one, 2: repeat all

    async function fetchPlaylist() {
        try {
            const response = await fetch('playlist.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            playlist = await response.json();
            renderPlaylist();
            if (playlist.length > 0) {
                loadTrack(currentTrackIndex);
            }
        } catch (error) {
            console.error("Could not fetch playlist:", error);
            trackListContainer.innerHTML = '<p style="color: red; text-align: center;">Lỗi tải danh sách nhạc.</p>';
        }
    }

    function renderPlaylist() {
        trackListContainer.innerHTML = ''; // Clear existing list
        playlist.forEach((track, index) => {
            const trackItem = document.createElement('li');
            trackItem.classList.add('track-item');
            trackItem.dataset.index = index;

            const trackNumber = document.createElement('span');
            trackNumber.classList.add('track-number');
            trackNumber.textContent = `${index + 1}.`;

            const trackInfo = document.createElement('div');
            trackInfo.classList.add('track-info');
            const trackTitle = document.createElement('span');
            trackTitle.classList.add('track-title');
            trackTitle.textContent = track.title;
            const trackArtist = document.createElement('span');
            trackArtist.classList.add('track-artist');
            trackArtist.textContent = track.artist;
            trackInfo.appendChild(trackTitle);
            trackInfo.appendChild(trackArtist);

            const trackActions = document.createElement('div');
            trackActions.classList.add('track-actions');
            trackActions.innerHTML = `
                <button title="Yêu thích"><i class="far fa-heart"></i></button>
                <button title="Tải xuống"><i class="fas fa-download"></i></button>
                <button title="Thêm vào danh sách chờ"><i class="fas fa-stream"></i></button>
                <button title="Sao chép liên kết"><i class="fas fa-copy"></i></button>
            `;
            
            // Placeholder for playing indicator
            const playingIndicator = document.createElement('span');
            playingIndicator.classList.add('currently-playing-indicator');
            playingIndicator.innerHTML = '<i class="fas fa-volume-up"></i>'; // Or use a bar animation
            playingIndicator.style.display = 'none';


            trackItem.appendChild(playingIndicator); // Add indicator first for styling if needed
            trackItem.appendChild(trackNumber);
            trackItem.appendChild(trackInfo);
            trackItem.appendChild(trackActions);

            trackItem.addEventListener('click', () => {
                loadTrack(index);
                playAudio();
            });
            trackListContainer.appendChild(trackItem);
        });
    }

    function loadTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        
        currentTrackIndex = index;
        const track = playlist[currentTrackIndex];
        
        
        // The 'src' from playlist.json should be the unique identifier for each song.
        audioPlayer.src = `${API_BASE_URL}${track.src}`; 
        
        albumArtDisplay.src = track.albumArt || 'https://via.placeholder.com/100?text=No+Art'; // Fallback
        
        updateActiveTrackHighlight();
        // Reset progress bar for new track
        progressBar.value = 0;
        currentTimeDisplay.textContent = formatTime(0);
        // Duration will be updated on 'loadedmetadata'
    }

    function updateActiveTrackHighlight() {
        document.querySelectorAll('.track-item').forEach((item, idx) => {
            const indicator = item.querySelector('.currently-playing-indicator');
            if (idx === currentTrackIndex) {
                item.classList.add('active');
                if (indicator) indicator.style.display = isPlaying ? 'inline-block' : 'none';
            } else {
                item.classList.remove('active');
                if (indicator) indicator.style.display = 'none';
            }
        });
    }

    function playAudio() {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                updateActiveTrackHighlight();
            })
            .catch(error => {
                console.error("Error playing audio:", error);
                // Handle autoplay block or other errors
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                updateActiveTrackHighlight();
            });
    }

    function pauseAudio() {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        updateActiveTrackHighlight();
    }

    function togglePlayPause() {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function playNext() {
        if (isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * playlist.length);
            } while (playlist.length > 1 && newIndex === currentTrackIndex);
            currentTrackIndex = newIndex;
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack(currentTrackIndex);
        playAudio();
    }

    function playPrev() {
        if (isShuffle) { // Shuffle behavior for prev might be just another random track
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * playlist.length);
            } while (playlist.length > 1 && newIndex === currentTrackIndex);
            currentTrackIndex = newIndex;
        } else {
             currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        }
        loadTrack(currentTrackIndex);
        playAudio();
    }

    function updateProgress() {
        if (audioPlayer.duration) {
            progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        }
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Event Listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);

    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.title = isShuffle ? "Shuffle On" : "Shuffle Off";
    });

    repeatBtn.addEventListener('click', () => {
        repeatMode = (repeatMode + 1) % 3;
        if (repeatMode === 0) { // No repeat
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            repeatBtn.classList.remove('active');
            repeatBtn.title = "Repeat Off";
        } else if (repeatMode === 1) { // Repeat one
            repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>'; // Or use a "1" icon
            repeatBtn.querySelector('i').classList.add('fa-repeat-1'); // Custom class for "1" if you have one
            repeatBtn.classList.add('active');
            repeatBtn.title = "Repeat One";
        } else { // Repeat all
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            repeatBtn.classList.add('active');
            repeatBtn.title = "Repeat All";
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = 100; // Or audioPlayer.duration if you prefer direct time
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('timeupdate', updateProgress);

    audioPlayer.addEventListener('ended', () => {
        if (repeatMode === 1) { // Repeat one
            loadTrack(currentTrackIndex);
            playAudio();
        } else if (repeatMode === 2 || (repeatMode === 0 && currentTrackIndex < playlist.length -1 ) || (repeatMode === 0 && isShuffle) ) { // Repeat all OR no repeat and not last track OR no repeat and shuffle
             playNext();
        } else { // No repeat and it was the last track (and not shuffle)
            pauseAudio();
            currentTrackIndex = 0; // Reset to first track or keep on last
            loadTrack(currentTrackIndex); // Load first track but don't play
            // Optionally, reset progress bar and time displays
            progressBar.value = 0;
            currentTimeDisplay.textContent = formatTime(0);
        }
    });
    
    progressBar.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const seekTime = (progressBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = seekTime;
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });

    // Initial Load
    fetchPlaylist();
});