// Prompts list - Bilingual (English / Anambra Igbo)
// User can shuffle and answer multiple prompts per day
const PROMPTS = [
    "Describe your day / Kọwaa ụbọchị gị",
    "Talk about what you ate / Kwuo maka ihe i liri",
    "Explain something you're working on / Kọwaa ihe ị na-arụ",
    "What are you grateful for today? / Gịnị ka i nwere ekele maka ya taata?",
    "Describe how you're feeling / Kọwaa otụ ọ dị gị",
    "Talk about your health / Kwuo maka ahụ ike gị",
    "Describe a personal goal / Kọwaa ebumnuche gị",
    "What have you been thinking about? / Gịnị ka ị na-eche n'uche?",
    "Reflect on your progress / Tụgharịa uche na ọganihu gị",
    "Talk about a memory / Kwuo maka ihe ncheta",
    "Describe your ideal day / Kọwaa ụbọchị kachasị mma gị",
    "What did you learn recently? / Gịnị ka ị mụtara n'oge na-adịbeghị anya?",
    "Discuss a challenge you're facing / Kwurịta ihe ịma aka ị na-eche ihu",
    "What made you laugh today? / Gịnị mere gị ọchị taata?",
    "Describe someone who inspires you / Kọwaa onye na-akpali gị mmụọ",
    "What are you looking forward to? / Gịnị ka ị na-atụ anya ya?",
    "Talk about your family / Kwuo maka ezinụlọ gị",
    "Describe your morning routine / Kọwaa ihe ị na-eme n'ụtụtụ",
    "What's your favorite place? / Ebee ka ị kacha hụ n'anya?",
    "Talk about a recent conversation / Kwuo maka mkparịta ụka i nwere n'oge na-adịbeghị anya",
    "Describe your work / Kọwaa ọrụ gị",
    "What makes you happy? / Gịnị na-eme gị obi ụtọ?",
    "Talk about your hobbies / Kwuo maka ihe ntụlụndụ gị",
    "Describe a place you'd like to visit / Kọwaa ebe ị ga-achọ ịga",
    "What are you proud of? / Gịnị ka ị na-anya isi maka ya?",
    "Talk about your friends / Kwuo maka ndị enyi gị",
    "Describe your evening / Kọwaa mgbede gị",
    "What's something new you tried? / Gịnị bụ ihe ọhụlụ ị nwalere?",
    "Talk about your plans for tomorrow / Kwuo maka atụmatụ gị maka echi",
    "Describe your favorite food / Kọwaa nli ị kacha hụ n'anya",
    "What's on your mind right now? / Gịnị dị gị n'uche ugbua?",
    "Talk about your weekend / Kwuo maka izu ụka gị",
    "Describe a book or story you enjoyed / Kọwaa akwụkwọ ma ọ bụ akụkọ masịlị gị",
    "What did you do yesterday? / Gịnị ka i mere ụnyaahụ?",
    "Talk about your home / Kwuo maka ụlọ gị",
    "Describe your favorite season / Kọwaa oge afọ ị kacha hụ n'anya",
    "What are you worried about? / Gịnị na-echegbu gị?",
    "Talk about a skill you're learning / Kwuo maka nka ị na-amụ",
    "Describe your neighborhood / Kọwaa mpaghala ebe ị bi",
    "What motivates you? / Gịnị na-akpali gị?",
    "Talk about your childhood / Kwuo maka oge ị bụ nwata",
    "Describe a typical weekday / Kọwaa ụbọchị ọrụ gị",
    "What do you value most? / Gịnị ka ị kpọlọ ihe n'ihu kalịa?",
    "Talk about your sleep / Kwuo maka ụla gị",
    "Describe your exercise routine / Kọwaa mmega ahụ gị",
    "What do you want to improve? / Gịnị ka ị chọrọ imeziwanye?",
    "Talk about your favorite music / Kwuo maka egwu ị kacha hụ n'anya",
    "Describe your dreams and aspirations / Kọwaa nlọ gị ma ọ bụ ihe ị chọrọ ime",
    "What brings you peace? / Gịnị na-ewetala gị udo?",
    "Talk about nature around you / Kwuo maka ọdịdị ala gbulugubu gị"
];

// Starter Media Library - Pre-loaded content for all users
const STARTER_MEDIA = [
    {
        id: 'starter-1',
        title: 'Omenuko (Full Audiobook) / Omenuko (Akwụkwọ Ọdịyo Zuru Ezu)',
        type: 'audiobook',
        link: 'https://www.youtube.com/watch?v=LgFCWSOl3iw',
        notes: 'Classic Igbo literature audiobook / Akwụkwọ ọdịnala Igbo',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-2',
        title: 'Udochukwu (Igbo Movie) / Udochukwu (Ihe Nkili Igbo)',
        type: 'movie',
        link: 'https://www.youtube.com/watch?v=Fe9E1kVTul8',
        notes: 'Popular Igbo movie / Ihe nkili Igbo a ma ama',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-3',
        title: 'ABS Akụkọ Ụwa (Igbo News) / Akụkọ Ụwa Igbo',
        type: 'page',
        link: 'https://www.youtube.com/watch?v=EI7umg0WH4Q&list=PLLnE8CV3IUR8HgVzKduK1isUk2-2R1Z86',
        notes: 'Anambra Broadcasting daily news in Igbo / Akụkọ ụwa Anambra kwa ụbọchị n\'asụsụ Igbo',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-4',
        title: 'Spoken Igbo - Pritchett Guide / Igbo A Na-Asụ - Ntuziaka Pritchett',
        type: 'pdf',
        link: 'https://franpritchett.com/00fwp/igbo/spilctalk.pdf',
        notes: 'PDF guide for learning spoken Igbo / Akwụkwọ ntuziaka maka ịmụ Igbo a na-asụ',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-5',
        title: 'Igbo Language & University Admission (UNN) / Asụsụ Igbo na Agụmakwụkwọ',
        type: 'pdf',
        link: 'https://igbostudies.unn.edu.ng/wp-content/uploads/sites/56/2025/07/1-Ime-nke-Oma-nAsusu-Igbo-di-ka-otu-nIme-Ntozu-Maka-Inwete-Ohere-Agumakwukwo-nUlo-Akwukwo-di-Elu-nAla-Igbo.pdf',
        notes: 'Research on Igbo language proficiency and education / Nnyocha gbasara ịsụ asụsụ Igbo nke ọma',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-6',
        title: 'Greetings in Igbo Youth Culture (UNN) / Ekele na Ndụ Ndị Ntorobia',
        type: 'pdf',
        link: 'https://igbostudies.unn.edu.ng/wp-content/uploads/sites/56/2025/07/1-Atutu-Asusu-nobodo-ninyocha-ekele-na-ndu-ndi-ntorobia-nIgbo.pdf',
        notes: 'Study on greetings among Igbo youth / Ọmụmụ gbasara ekele n\'etiti ndị ntorobia Igbo',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-7',
        title: 'Udala Radio 104.7 FM / Redio Udala 104.7 FM',
        type: 'page',
        link: 'https://radio.garden/listen/udala-radio-104-7-fm/5SW88V49',
        notes: 'Live Igbo radio from Onitsha / Redio Igbo dị ndụ site Ọnịcha',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-8',
        title: 'Real FM 99.1 / Redio Real FM 99.1',
        type: 'page',
        link: 'https://radio.garden/listen/real-fm-99-1/hrGgAD37',
        notes: 'Live Igbo radio station / Ọdụ redio Igbo dị ndụ',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-9',
        title: 'Bizzibodi FM 100.1 / Redio Bizzibodi FM 100.1',
        type: 'page',
        link: 'https://radio.garden/listen/bizzibodi-fm-100-1/HRDgff9L',
        notes: 'Live Igbo radio station / Ọdụ redio Igbo dị ndụ',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-10',
        title: 'DCLM Radio Igbo / Redio DCLM Igbo',
        type: 'page',
        link: 'https://radio.garden/listen/dclm-radio-igbo/gNFZ5_EM',
        notes: 'Live Igbo gospel radio / Redio ozi ọma Igbo dị ndụ',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-11',
        title: 'ABS FM 88.5 / Redio ABS FM 88.5',
        type: 'page',
        link: 'https://radio.garden/listen/abs-fm-88-5/8Mj5l3vP',
        notes: 'Anambra Broadcasting Service live radio / Redio ABS dị ndụ',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    },
    {
        id: 'starter-12',
        title: 'BBC Igbo - Akụkọ Dị Mkpa / BBC Igbo News',
        type: 'page',
        link: 'https://www.bbc.com/igbo',
        notes: 'Latest news and stories in Igbo / Akụkọ na akụkọ ọhụrụ n\'asụsụ Igbo',
        status: 'not-started',
        reflection: null,
        file: null,
        isPreloaded: true
    }
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
let vocabMediaRecorder = null;
let vocabAudioChunks = [];
let currentVocabAudioBlob = null;
let currentWordId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDailyPrompt();
    initStarterMedia();
    loadStats();
    renderCalendar();
    loadPastRecordings();
    initRecording();
    initMediaLibrary();
    initVocabulary();
    checkTodayCompletion();
    checkMicPermissionBanner();
    initShuffleButton();
});

// Starter Media Library
function initStarterMedia() {
    const media = JSON.parse(localStorage.getItem('media') || '[]');
    const starterVersion = localStorage.getItem('starterMediaVersion') || '0';

    // Version 4: Added Radio Garden stations and BBC Igbo
    const CURRENT_VERSION = '4';

    // Remove old starter media if version changed
    if (starterVersion !== CURRENT_VERSION) {
        // Remove all old starter media
        const userMedia = media.filter(item => !item.isPreloaded);

        // Add new starter media at the beginning
        const updatedMedia = [...STARTER_MEDIA, ...userMedia];
        localStorage.setItem('media', JSON.stringify(updatedMedia));
        localStorage.setItem('starterMediaVersion', CURRENT_VERSION);
    } else {
        // Check if starter media already exists
        const hasStarterMedia = media.some(item => item.isPreloaded);

        if (!hasStarterMedia) {
            // Add starter media to the beginning
            const updatedMedia = [...STARTER_MEDIA, ...media];
            localStorage.setItem('media', JSON.stringify(updatedMedia));
            localStorage.setItem('starterMediaVersion', CURRENT_VERSION);
        }
    }
}

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

// Shuffle Button
function initShuffleButton() {
    const shuffleBtn = document.getElementById('shuffle-prompt-btn');
    shuffleBtn.addEventListener('click', shufflePrompt);
}

function shufflePrompt() {
    // Get recently used prompts (last 15)
    const recentPrompts = JSON.parse(localStorage.getItem('recent-prompts') || '[]');

    // Filter out recent prompts to avoid repetition
    let availablePrompts = PROMPTS.filter(p => !recentPrompts.includes(p));

    // If we've used most prompts (less than 5 available), allow older ones back
    // by removing the oldest half from the recent list
    if (availablePrompts.length < 5) {
        const halfRecent = recentPrompts.slice(Math.floor(recentPrompts.length / 2));
        availablePrompts = PROMPTS.filter(p => !halfRecent.includes(p));
    }

    // Get a random prompt from available ones
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    const newPrompt = availablePrompts[randomIndex];

    // Update the display
    document.getElementById('daily-prompt').textContent = newPrompt;

    // Save it so it persists for this session
    const today = new Date().toDateString();
    localStorage.setItem(`prompt-${today}`, newPrompt);

    // Track this prompt as recently used (keep last 15)
    recentPrompts.push(newPrompt);
    if (recentPrompts.length > 15) {
        recentPrompts.shift(); // Remove oldest
    }
    localStorage.setItem('recent-prompts', JSON.stringify(recentPrompts));
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
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // Hide banner once permission is granted
        localStorage.setItem('mic-banner-dismissed', 'true');
        document.getElementById('mic-permission-banner').classList.add('hidden');

        // Let Safari choose the best format - don't force mimeType
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
            currentAudioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = audioUrl;
            audioPlayer.load(); // Force reload

            // Show playback section
            document.getElementById('recording-controls').classList.add('hidden');
            document.getElementById('playback-section').classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(1000); // Collect data every second

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

        // Add new recording with activity type
        recordings.push({
            date: today,
            timestamp: new Date().toISOString(),
            prompt: prompt,
            audio: base64Audio,
            type: 'prompt' // Track that this was a prompt response
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

    // Igbo market days (4-day cycle)
    const igboMarketDays = ['Eke', 'Orie', 'Afọ', 'Nkwọ'];

    // Calculate which Igbo day the 1st of the month falls on
    // Using a base date to align the cycle (Jan 1, 2024 = Eke)
    const baseDate = new Date(2024, 0, 1);
    const daysSinceBase = Math.floor((firstDay - baseDate) / (1000 * 60 * 60 * 24));
    const startingIgboDay = daysSinceBase % 4;

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

        // Calculate Igbo market day for this date
        const igboDayIndex = (startingIgboDay + day - 1) % 4;
        const igboDay = igboMarketDays[igboDayIndex];

        // Check what activities happened on this day
        const dayRecordings = recordings.filter(r => r.date === dateString);
        const hasPrompt = dayRecordings.some(r => r.type === 'prompt');
        const hasMedia = dayRecordings.some(r => r.type === 'media');
        const hasVocab = dayRecordings.some(r => r.type === 'vocabulary');

        // Count how many activity types
        const activityCount = [hasPrompt, hasMedia, hasVocab].filter(Boolean).length;

        if (activityCount >= 2) {
            // Multiple activities - show star
            dayEl.innerHTML = `
                <div class="cal-icon">⭐</div>
                <div class="cal-date">${day}</div>
                <div class="cal-igbo">${igboDay}</div>
            `;
            dayEl.classList.add('completed', 'both-activities');
        } else if (hasPrompt) {
            // Only prompt - show thought bubble
            dayEl.innerHTML = `
                <div class="cal-icon">💭</div>
                <div class="cal-date">${day}</div>
                <div class="cal-igbo">${igboDay}</div>
            `;
            dayEl.classList.add('completed', 'prompt-activity');
        } else if (hasMedia) {
            // Only media - show film
            dayEl.innerHTML = `
                <div class="cal-icon">🎬</div>
                <div class="cal-date">${day}</div>
                <div class="cal-igbo">${igboDay}</div>
            `;
            dayEl.classList.add('completed', 'media-activity');
        } else if (hasVocab) {
            // Only vocabulary - show book/pencil
            dayEl.innerHTML = `
                <div class="cal-icon">📝</div>
                <div class="cal-date">${day}</div>
                <div class="cal-igbo">${igboDay}</div>
            `;
            dayEl.classList.add('completed', 'vocab-activity');
        } else {
            // No activity - show day and market day
            dayEl.innerHTML = `
                <div class="cal-date">${day}</div>
                <div class="cal-igbo">${igboDay}</div>
            `;
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
        list.innerHTML = '<p style="color: #6c757d; text-align: center;">No recordings yet / Enweghị ndekọ ọ bụla</p>';
        return;
    }

    // Sort by most recent first
    recordings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    list.innerHTML = recordings.map((recording, index) => `
        <div class="recording-item">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <span class="recording-date">${new Date(recording.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</span>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteRecording('${recording.timestamp}')">
                    Delete / Hichapụ
                </button>
            </div>
            <div class="recording-prompt">${recording.prompt}</div>
            <audio controls src="${recording.audio}"></audio>
        </div>
    `).join('');
}

function deleteRecording(timestamp) {
    if (!confirm('Are you sure you want to delete this recording? / Ị ji n\'aka na ị chọrọ ihichapụ ndekọ a?')) {
        return;
    }

    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    const updatedRecordings = recordings.filter(r => r.timestamp !== timestamp);
    localStorage.setItem('recordings', JSON.stringify(updatedRecordings));

    // Refresh displays
    loadPastRecordings();
    loadStats();
    renderCalendar();
    checkTodayCompletion();
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
        list.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No media added yet / Enwebeghị mgbasa ozi agbakwunyere</p>';
        return;
    }

    list.innerHTML = media.map(item => {
        const embedContent = getMediaEmbed(item);

        return `
        <div class="media-item${item.isPreloaded ? ' preloaded-media' : ''}">
            <div class="media-header">
                <div>
                    <div class="media-title">
                        ${item.title}
                        ${item.isPreloaded ? '<span class="starter-badge">⭐ Starter Library / Ọba Akwụkwọ Mmalite</span>' : ''}
                    </div>
                    <span class="media-type">${item.type}</span>
                </div>
                ${!item.isPreloaded ? `<button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="deleteMedia('${item.id}')">Delete / Hichapụ</button>` : ''}
            </div>
            ${embedContent}
            ${item.notes ? `<div class="media-link" style="font-style: italic; color: #6c757d;">${item.notes}</div>` : ''}
            <div class="media-status">
                <select class="status-select" onchange="updateMediaStatus(${item.id}, this.value)">
                    <option value="not-started" ${item.status === 'not-started' ? 'selected' : ''}>Not Started / Amalitebeghị</option>
                    <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In Progress / Na-aga N'ihu</option>
                    <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed / Emezuola</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="openReflectionModal(${item.id}, '${item.title.replace(/'/g, "\\'")}')">
                ${item.reflection ? '🎤 Update Reflection / Melite Ntụgharị Uche' : '🎤 Record What I Learned / Dekọọ Ihe M Mụtara'}
            </button>
            ${item.reflection ? `
                <div class="media-reflection">
                    <p><strong>My Reflection / Ntụgharị Uche M:</strong></p>
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
        // Check if it's a PDF link
        if (item.link.toLowerCase().endsWith('.pdf')) {
            return `
                <div class="media-embed pdf-embed">
                    <iframe src="${item.link}#toolbar=0" title="${item.title}"></iframe>
                </div>
            `;
        }

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

        // Check if it's a Radio Garden link
        if (item.link.includes('radio.garden')) {
            return `
                <div class="radio-card">
                    <div class="radio-live-indicator">
                        <span class="live-dot"></span>
                        <span class="live-text">LIVE / DỊ NDỤ</span>
                    </div>
                    <button class="radio-listen-btn" onclick="window.open('${item.link}', '_blank')">
                        <span class="radio-icon">📻</span>
                        <span class="radio-text">Listen Now / Gee Ntị Ugbua</span>
                    </button>
                </div>
            `;
        }

        // Check if it's BBC Igbo News
        if (item.link.includes('bbc.com/igbo')) {
            return `
                <div class="news-card">
                    <div class="news-badge">📰 LATEST NEWS / AKỤKỌ ỌHỤRỤ</div>
                    <button class="news-read-btn" onclick="window.open('${item.link}', '_blank')">
                        Read Latest Stories / Gụọ Akụkọ Ọhụrụ →
                    </button>
                </div>
            `;
        }

        // For other links, show as clickable link
        return `
            <div class="media-link">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.link}</a>
                <button class="open-link-btn" onclick="window.open('${item.link}', '_blank')">
                    Open Link / Mepee Njikọ →
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
    const item = media.find(m => String(m.id) === String(id));

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

function deleteMedia(id) {
    // Convert id to match the type in storage (string for starter media, number for user media)
    const media = JSON.parse(localStorage.getItem('media') || '[]');
    const item = media.find(m => String(m.id) === String(id));

    if (item && item.isPreloaded) {
        alert('Starter library items cannot be deleted. / Enweghị ike ihichapụ ihe ndị dị na ọba akwụkwọ mmalite.');
        return;
    }

    if (!confirm('Are you sure you want to delete this media item? / Ị ji n\'aka na ị chọrọ ihichapụ ihe mgbasa ozi a?')) {
        return;
    }

    const updatedMedia = media.filter(m => String(m.id) !== String(id));
    localStorage.setItem('media', JSON.stringify(updatedMedia));
    loadMediaList();
}

function openReflectionModal(mediaId, mediaTitle) {
    currentMediaId = mediaId;
    document.getElementById('reflection-media-title').textContent = mediaTitle;
    document.getElementById('reflection-media-title-igbo').textContent = mediaTitle;
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
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // Let Safari choose the best format - don't force mimeType
        modalMediaRecorder = new MediaRecorder(stream);
        modalAudioChunks = [];

        modalMediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                modalAudioChunks.push(event.data);
            }
        };

        modalMediaRecorder.onstop = () => {
            const audioBlob = new Blob(modalAudioChunks, { type: modalMediaRecorder.mimeType });
            currentModalAudioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('modal-audio-player');
            audioPlayer.src = audioUrl;
            audioPlayer.load(); // Force reload

            // Show playback section
            document.getElementById('modal-record-btn').classList.add('hidden');
            document.getElementById('modal-playback').classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        modalMediaRecorder.start(1000); // Collect data every second

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
        const item = media.find(m => String(m.id) === String(currentMediaId));

        if (item) {
            item.reflection = base64Audio;

            // If item is marked as completed and has reflection, track as media activity
            if (item.status === 'completed') {
                const today = new Date().toDateString();
                const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

                // Check if we already tracked this media completion today
                const alreadyTracked = recordings.some(r =>
                    r.date === today && r.type === 'media' && String(r.mediaId) === String(item.id)
                );

                if (!alreadyTracked) {
                    recordings.push({
                        date: today,
                        timestamp: new Date().toISOString(),
                        type: 'media',
                        mediaId: item.id,
                        mediaTitle: item.title,
                        audio: base64Audio
                    });
                    localStorage.setItem('recordings', JSON.stringify(recordings));

                    // Update stats and calendar
                    loadStats();
                    renderCalendar();
                }
            }

            localStorage.setItem('media', JSON.stringify(media));

            closeReflectionModal();
            loadMediaList();
        }
    };

    reader.readAsDataURL(currentModalAudioBlob);
}

// Vocabulary Management
function initVocabulary() {
    const addWordBtn = document.getElementById('add-word-btn');
    const cancelWordBtn = document.getElementById('cancel-word-btn');
    const wordForm = document.getElementById('word-form');
    const vocabCloseBtn = document.getElementById('vocab-close-btn');
    const vocabRecordBtn = document.getElementById('vocab-record-btn');
    const vocabStopBtn = document.getElementById('vocab-stop-btn');
    const vocabRerecordBtn = document.getElementById('vocab-rerecord-btn');
    const vocabSaveBtn = document.getElementById('vocab-save-btn');

    addWordBtn.addEventListener('click', () => {
        document.getElementById('add-word-form').classList.remove('hidden');
    });

    cancelWordBtn.addEventListener('click', () => {
        document.getElementById('add-word-form').classList.add('hidden');
        wordForm.reset();
    });

    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addWord();
    });

    vocabCloseBtn.addEventListener('click', closeVocabModal);
    vocabRecordBtn.addEventListener('click', startVocabRecording);
    vocabStopBtn.addEventListener('click', stopVocabRecording);
    vocabRerecordBtn.addEventListener('click', reRecordVocab);
    vocabSaveBtn.addEventListener('click', saveVocabPractice);

    loadWordsList();
}

function addWord() {
    const igboWord = document.getElementById('word-igbo').value;
    const englishMeaning = document.getElementById('word-english').value;
    const examples = document.getElementById('word-examples').value;
    const notes = document.getElementById('word-notes').value;

    const words = JSON.parse(localStorage.getItem('vocabulary-words') || '[]');

    const newWord = {
        id: Date.now(),
        igboWord,
        englishMeaning,
        examples,
        notes,
        practices: [] // Array of practice recordings with dates
    };

    words.push(newWord);
    localStorage.setItem('vocabulary-words', JSON.stringify(words));

    document.getElementById('add-word-form').classList.add('hidden');
    document.getElementById('word-form').reset();
    loadWordsList();
}

function loadWordsList() {
    const words = JSON.parse(localStorage.getItem('vocabulary-words') || '[]');
    const list = document.getElementById('words-list');

    if (words.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No words added yet / Enwebeghị okwu agbakwunyere</p>';
        return;
    }

    // Sort by most recent first
    words.sort((a, b) => b.id - a.id);

    list.innerHTML = words.map(word => `
        <div class="media-item">
            <div class="media-header">
                <div>
                    <div class="media-title">
                        <strong>${word.igboWord}</strong> = ${word.englishMeaning}
                    </div>
                </div>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="deleteWord(${word.id})">Delete / Hichapụ</button>
            </div>
            ${word.examples ? `<div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 8px; white-space: pre-wrap; font-size: 14px; color: #333;"><strong>Example Sentences / Ahịrịokwu Nlereanya:</strong><br>${word.examples}</div>` : ''}
            ${word.notes ? `<div class="media-link" style="font-style: italic; color: #6c757d; margin-top: 8px;">${word.notes}</div>` : ''}
            <div style="margin-top: 12px;">
                <strong style="font-size: 14px;">Practice Count / Ọnụ Ọgụgụ Omume: ${word.practices.length}</strong>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="openVocabModal(${word.id}, '${word.igboWord.replace(/'/g, "\\'")}', '${word.englishMeaning.replace(/'/g, "\\'")}')">
                🎤 Practice in 5 Sentences / Mee Omume na Ahịrịokwu 5
            </button>
            ${word.practices.length > 0 ? `
                <div class="media-reflection" style="margin-top: 12px;">
                    <p><strong>Recent Practices / Omume Ndị Gara Aga:</strong></p>
                    ${word.practices.slice(0, 3).map(practice => `
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">
                                ${new Date(practice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <audio controls src="${practice.audio}" style="width: 100%;"></audio>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function deleteWord(id) {
    if (!confirm('Are you sure you want to delete this word? / Ị ji n\'aka na ị chọrọ ihichapụ okwu a?')) {
        return;
    }

    const words = JSON.parse(localStorage.getItem('vocabulary-words') || '[]');
    const updatedWords = words.filter(w => w.id !== id);
    localStorage.setItem('vocabulary-words', JSON.stringify(updatedWords));
    loadWordsList();

    // Refresh calendar in case this affected streaks
    loadStats();
    renderCalendar();
}

function openVocabModal(wordId, igboWord, englishMeaning) {
    currentWordId = wordId;
    document.getElementById('vocab-word-display').textContent = igboWord;
    document.getElementById('vocab-meaning-display').textContent = englishMeaning;
    document.getElementById('vocab-modal').classList.remove('hidden');

    // Reset modal recording state
    document.getElementById('vocab-record-btn').classList.remove('hidden');
    document.getElementById('vocab-recording-status').classList.add('hidden');
    document.getElementById('vocab-playback').classList.add('hidden');
    currentVocabAudioBlob = null;
}

function closeVocabModal() {
    document.getElementById('vocab-modal').classList.add('hidden');
    currentWordId = null;
    currentVocabAudioBlob = null;
}

async function startVocabRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        vocabMediaRecorder = new MediaRecorder(stream);
        vocabAudioChunks = [];

        vocabMediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                vocabAudioChunks.push(event.data);
            }
        };

        vocabMediaRecorder.onstop = () => {
            const audioBlob = new Blob(vocabAudioChunks, { type: vocabMediaRecorder.mimeType });
            currentVocabAudioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('vocab-audio-player');
            audioPlayer.src = audioUrl;
            audioPlayer.load();

            // Show playback section
            document.getElementById('vocab-record-btn').classList.add('hidden');
            document.getElementById('vocab-playback').classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        vocabMediaRecorder.start(1000);

        // Update UI
        document.getElementById('vocab-record-btn').classList.add('hidden');
        document.getElementById('vocab-recording-status').classList.remove('hidden');

        // Auto-stop after 3 minutes
        setTimeout(() => {
            if (vocabMediaRecorder && vocabMediaRecorder.state === 'recording') {
                vocabMediaRecorder.stop();
                document.getElementById('vocab-recording-status').classList.add('hidden');
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

function stopVocabRecording() {
    if (vocabMediaRecorder && vocabMediaRecorder.state === 'recording') {
        vocabMediaRecorder.stop();
        document.getElementById('vocab-recording-status').classList.add('hidden');
    }
}

function reRecordVocab() {
    document.getElementById('vocab-playback').classList.add('hidden');
    document.getElementById('vocab-record-btn').classList.remove('hidden');
    currentVocabAudioBlob = null;
}

function saveVocabPractice() {
    if (!currentVocabAudioBlob || !currentWordId) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64Audio = reader.result;
        const today = new Date().toDateString();

        const words = JSON.parse(localStorage.getItem('vocabulary-words') || '[]');
        const word = words.find(w => w.id === currentWordId);

        if (word) {
            // Add practice to word
            word.practices.unshift({
                date: today,
                timestamp: new Date().toISOString(),
                audio: base64Audio
            });

            localStorage.setItem('vocabulary-words', JSON.stringify(words));

            // Track as vocabulary activity for streak
            const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

            // Check if we already tracked vocabulary practice today
            const alreadyTrackedToday = recordings.some(r =>
                r.date === today && r.type === 'vocabulary'
            );

            if (!alreadyTrackedToday) {
                recordings.push({
                    date: today,
                    timestamp: new Date().toISOString(),
                    type: 'vocabulary',
                    wordId: word.id,
                    word: word.igboWord,
                    audio: base64Audio
                });
                localStorage.setItem('recordings', JSON.stringify(recordings));

                // Update stats and calendar
                loadStats();
                renderCalendar();
            }

            closeVocabModal();
            loadWordsList();
        }
    };

    reader.readAsDataURL(currentVocabAudioBlob);
}
