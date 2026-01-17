// Prompts list
const PROMPTS = [
    "Describe your day",
    "Talk about what you ate",
    "Explain something you're working on",
    "What are you grateful for today?",
    "Describe how you're feeling and why",
    "Talk about your health/self-care practices",
    "Describe a personal goal you're working toward",
    "What's something you've been thinking about?",
    "Reflect on progress toward a long-term goal",
    "Talk about a memory that came to mind",
    "Describe your ideal day",
    "What did you learn about yourself recently?",
    "Discuss a challenge you're facing at work",
    "What made you laugh today?",
    "Describe someone who inspires you"
];

// State
let mediaRecorder = null;
let audioChunks = [];
let currentAudioBlob = null;
let currentScreen = 'practice';
let modalMediaRecorder = null;
let modalAudioChunks = [];
let currentModalAudioBlob = null;
let currentMediaId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDailyPrompt();
    loadStats();
    renderCalendar();
    loadPastRecordings();
    initRecording();
    initMediaLibrary();
    checkTodayCompletion();
    checkMicPermissionBanner();
});

// Mic Permission Banner
function checkMicPermissionBanner() {
    const bannerDismissed = localStorage.getItem('mic-banner-dismissed');
    if (!bannerDismissed) {
        document.getElementById('mic-permission-banner').classList.remove('hidden');
    }
}

function dismissMicBanner() {
    localStorage.setItem('mic-banner-dismissed', 'true');
    document.getElementById('mic-permission-banner').classList.add('hidden');
}

// Navigation
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            switchScreen(screen);
        });
    });
}

function switchScreen(screen) {
    currentScreen = screen;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    // Update screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.toggle('active', s.id === `${screen}-screen`);
    });
}

// Daily Prompt
function loadDailyPrompt() {
    const today = new Date().toDateString();
    const savedPrompt = localStorage.getItem(`prompt-${today}`);

    let prompt;
    if (savedPrompt) {
        prompt = savedPrompt;
    } else {
        // Generate random prompt for today
        const randomIndex = Math.floor(Math.random() * PROMPTS.length);
        prompt = PROMPTS[randomIndex];
        localStorage.setItem(`prompt-${today}`, prompt);
    }

    document.getElementById('daily-prompt').textContent = prompt;
}

// Recording
function initRecording() {
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const rerecordBtn = document.getElementById('rerecord-btn');
    const saveBtn = document.getElementById('save-btn');

    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    rerecordBtn.addEventListener('click', reRecord);
    saveBtn.addEventListener('click', saveRecording);
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Hide banner once permission is granted
        localStorage.setItem('mic-banner-dismissed', 'true');
        document.getElementById('mic-permission-banner').classList.add('hidden');

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            currentAudioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = audioUrl;

            // Show playback section
            document.getElementById('recording-controls').classList.add('hidden');
            document.getElementById('playback-section').classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();

        // Update UI
        document.getElementById('record-btn').classList.add('hidden');
        document.getElementById('recording-status').classList.remove('hidden');

        // Auto-stop after 3 minutes
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                document.getElementById('recording-status').classList.add('hidden');
            }
        }, 180000);

    } catch (error) {
        console.error('Error accessing microphone:', error);

        // Show helpful error message
        const banner = document.getElementById('mic-permission-banner');
        banner.classList.remove('hidden');

        if (error.name === 'NotAllowedError') {
            alert('Microphone access was denied. Please:\n\n1. Tap the "AA" or settings icon in Safari\n2. Select "Website Settings"\n3. Set Microphone to "Allow"\n4. Reload the page and try again');
        } else {
            alert('Could not access microphone. Please check your device settings and try again.');
        }
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        document.getElementById('recording-status').classList.add('hidden');
    }
}

function reRecord() {
    // Reset UI
    document.getElementById('playback-section').classList.add('hidden');
    document.getElementById('recording-controls').classList.remove('hidden');
    document.getElementById('record-btn').classList.remove('hidden');
    currentAudioBlob = null;
}

function saveRecording() {
    if (!currentAudioBlob) return;

    const today = new Date().toDateString();
    const prompt = document.getElementById('daily-prompt').textContent;

    // Convert blob to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64Audio = reader.result;

        // Get existing recordings
        const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

        // Add new recording
        recordings.push({
            date: today,
            timestamp: new Date().toISOString(),
            prompt: prompt,
            audio: base64Audio
        });

        localStorage.setItem('recordings', JSON.stringify(recordings));

        // Update UI
        document.getElementById('playback-section').classList.add('hidden');
        document.getElementById('completion-message').classList.remove('hidden');

        // Update stats
        loadStats();
        renderCalendar();
        loadPastRecordings();
    };

    reader.readAsDataURL(currentAudioBlob);
}

// Check if today is completed
function checkTodayCompletion() {
    const today = new Date().toDateString();
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    const todayRecording = recordings.find(r => r.date === today);

    if (todayRecording) {
        document.getElementById('recording-controls').classList.add('hidden');
        document.getElementById('completion-message').classList.remove('hidden');
    }
}

// Stats
function loadStats() {
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

    // Total recordings
    document.getElementById('total-recordings').textContent = recordings.length;

    // Calculate streak
    const streak = calculateStreak(recordings);
    document.getElementById('current-streak').textContent = streak;
}

function calculateStreak(recordings) {
    if (recordings.length === 0) return 0;

    // Sort recordings by date
    const uniqueDates = [...new Set(recordings.map(r => r.date))].sort((a, b) =>
        new Date(b) - new Date(a)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
        const recordingDate = new Date(uniqueDates[i]);
        recordingDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((currentDate - recordingDate) / (1000 * 60 * 60 * 24));

        if (diffDays === i) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    const recordingDates = new Set(recordings.map(r => r.date));

    // Get current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day header';
        dayEl.textContent = day;
        calendar.appendChild(dayEl);
    });

    // Add empty cells for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'calendar-day';
        calendar.appendChild(emptyEl);
    }

    // Add days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateString = date.toDateString();

        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        if (recordingDates.has(dateString)) {
            dayEl.classList.add('completed');
        }

        if (dateString === now.toDateString()) {
            dayEl.classList.add('today');
        }

        calendar.appendChild(dayEl);
    }
}

// Past Recordings
function loadPastRecordings() {
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    const list = document.getElementById('past-recordings-list');

    if (recordings.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center;">No recordings yet</p>';
        return;
    }

    // Sort by most recent first
    recordings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    list.innerHTML = recordings.map((recording, index) => `
        <div class="recording-item">
            <span class="recording-date">${new Date(recording.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
            <div class="recording-prompt">${recording.prompt}</div>
            <audio controls src="${recording.audio}"></audio>
        </div>
    `).join('');
}

// Media Library
function initMediaLibrary() {
    const addMediaBtn = document.getElementById('add-media-btn');
    const cancelMediaBtn = document.getElementById('cancel-media-btn');
    const mediaForm = document.getElementById('media-form');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalRecordBtn = document.getElementById('modal-record-btn');
    const modalStopBtn = document.getElementById('modal-stop-btn');
    const modalRerecordBtn = document.getElementById('modal-rerecord-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');

    addMediaBtn.addEventListener('click', () => {
        document.getElementById('add-media-form').classList.remove('hidden');
    });

    cancelMediaBtn.addEventListener('click', () => {
        document.getElementById('add-media-form').classList.add('hidden');
        mediaForm.reset();
    });

    mediaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addMedia();
    });

    modalCloseBtn.addEventListener('click', closeReflectionModal);
    modalRecordBtn.addEventListener('click', startModalRecording);
    modalStopBtn.addEventListener('click', stopModalRecording);
    modalRerecordBtn.addEventListener('click', reRecordModal);
    modalSaveBtn.addEventListener('click', saveModalReflection);

    loadMediaList();
}

async function addMedia() {
    const title = document.getElementById('media-title').value;
    const type = document.getElementById('media-type').value;
    const link = document.getElementById('media-link').value;
    const notes = document.getElementById('media-notes').value;
    const fileInput = document.getElementById('media-file');

    const media = JSON.parse(localStorage.getItem('media') || '[]');

    const newMedia = {
        id: Date.now(),
        title,
        type,
        link,
        notes,
        status: 'not-started',
        reflection: null,
        file: null
    };

    // Handle PDF file upload
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            newMedia.file = reader.result;
            media.push(newMedia);
            localStorage.setItem('media', JSON.stringify(media));

            document.getElementById('add-media-form').classList.add('hidden');
            document.getElementById('media-form').reset();
            loadMediaList();
        };

        reader.readAsDataURL(file);
    } else {
        media.push(newMedia);
        localStorage.setItem('media', JSON.stringify(media));

        document.getElementById('add-media-form').classList.add('hidden');
        document.getElementById('media-form').reset();
        loadMediaList();
    }
}

function loadMediaList() {
    const media = JSON.parse(localStorage.getItem('media') || '[]');
    const list = document.getElementById('media-list');

    if (media.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No media added yet</p>';
        return;
    }

    list.innerHTML = media.map(item => {
        const embedContent = getMediaEmbed(item);

        return `
        <div class="media-item">
            <div class="media-header">
                <div>
                    <div class="media-title">${item.title}</div>
                    <span class="media-type">${item.type}</span>
                </div>
            </div>
            ${embedContent}
            ${item.notes ? `<div class="media-link" style="font-style: italic; color: #6c757d;">${item.notes}</div>` : ''}
            <div class="media-status">
                <select class="status-select" onchange="updateMediaStatus(${item.id}, this.value)">
                    <option value="not-started" ${item.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                    <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="openReflectionModal(${item.id}, '${item.title.replace(/'/g, "\\'")}')">
                ${item.reflection ? '🎤 Update Reflection' : '🎤 Record What I Learned'}
            </button>
            ${item.reflection ? `
                <div class="media-reflection">
                    <p><strong>My Reflection:</strong></p>
                    <audio controls src="${item.reflection}"></audio>
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
}

function getMediaEmbed(item) {
    // If there's an uploaded PDF file
    if (item.file && item.file.startsWith('data:application/pdf')) {
        return `
            <div class="media-embed pdf-embed">
                <iframe src="${item.file}#toolbar=0" title="${item.title}"></iframe>
            </div>
        `;
    }

    // If there's a link
    if (item.link) {
        // Check if it's a YouTube link
        const youtubeId = extractYouTubeId(item.link);
        if (youtubeId) {
            return `
                <div class="media-embed">
                    <iframe src="https://www.youtube.com/embed/${youtubeId}"
                            title="${item.title}"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                    </iframe>
                </div>
            `;
        }

        // For other links, show as clickable link
        return `
            <div class="media-link">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.link}</a>
                <button class="open-link-btn" onclick="window.open('${item.link}', '_blank')">
                    Open Link →
                </button>
            </div>
        `;
    }

    return '';
}

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

function updateMediaStatus(id, newStatus) {
    const media = JSON.parse(localStorage.getItem('media') || '[]');
    const item = media.find(m => m.id === id);

    if (item) {
        const oldStatus = item.status;
        item.status = newStatus;
        localStorage.setItem('media', JSON.stringify(media));

        // If changed to completed and no reflection, open modal
        if (newStatus === 'completed' && !item.reflection && oldStatus !== 'completed') {
            openReflectionModal(id, item.title);
        } else {
            loadMediaList();
        }
    }
}

function openReflectionModal(mediaId, mediaTitle) {
    currentMediaId = mediaId;
    document.getElementById('reflection-media-title').textContent = mediaTitle;
    document.getElementById('reflection-modal').classList.remove('hidden');

    // Reset modal recording state
    document.getElementById('modal-record-btn').classList.remove('hidden');
    document.getElementById('modal-recording-status').classList.add('hidden');
    document.getElementById('modal-playback').classList.add('hidden');
    currentModalAudioBlob = null;
}

function closeReflectionModal() {
    document.getElementById('reflection-modal').classList.add('hidden');
    currentMediaId = null;
    currentModalAudioBlob = null;
}

async function startModalRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        modalMediaRecorder = new MediaRecorder(stream);
        modalAudioChunks = [];

        modalMediaRecorder.ondataavailable = (event) => {
            modalAudioChunks.push(event.data);
        };

        modalMediaRecorder.onstop = () => {
            const audioBlob = new Blob(modalAudioChunks, { type: 'audio/webm' });
            currentModalAudioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('modal-audio-player');
            audioPlayer.src = audioUrl;

            // Show playback section
            document.getElementById('modal-record-btn').classList.add('hidden');
            document.getElementById('modal-playback').classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        modalMediaRecorder.start();

        // Update UI
        document.getElementById('modal-record-btn').classList.add('hidden');
        document.getElementById('modal-recording-status').classList.remove('hidden');

        // Auto-stop after 3 minutes
        setTimeout(() => {
            if (modalMediaRecorder && modalMediaRecorder.state === 'recording') {
                modalMediaRecorder.stop();
                document.getElementById('modal-recording-status').classList.add('hidden');
            }
        }, 180000);

    } catch (error) {
        console.error('Error accessing microphone:', error);

        if (error.name === 'NotAllowedError') {
            alert('Microphone access was denied. Please:\n\n1. Tap the "AA" or settings icon in Safari\n2. Select "Website Settings"\n3. Set Microphone to "Allow"\n4. Reload the page and try again');
        } else {
            alert('Could not access microphone. Please check your device settings and try again.');
        }
    }
}

function stopModalRecording() {
    if (modalMediaRecorder && modalMediaRecorder.state === 'recording') {
        modalMediaRecorder.stop();
        document.getElementById('modal-recording-status').classList.add('hidden');
    }
}

function reRecordModal() {
    document.getElementById('modal-playback').classList.add('hidden');
    document.getElementById('modal-record-btn').classList.remove('hidden');
    currentModalAudioBlob = null;
}

function saveModalReflection() {
    if (!currentModalAudioBlob || !currentMediaId) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64Audio = reader.result;

        const media = JSON.parse(localStorage.getItem('media') || '[]');
        const item = media.find(m => m.id === currentMediaId);

        if (item) {
            item.reflection = base64Audio;
            localStorage.setItem('media', JSON.stringify(media));

            closeReflectionModal();
            loadMediaList();
        }
    };

    reader.readAsDataURL(currentModalAudioBlob);
}
