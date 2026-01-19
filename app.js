// IndexedDB Setup - Provides 50-500MB storage instead of 5-10MB
const DB_NAME = 'IgboPracticeDB';
const DB_VERSION = 1;
let db = null;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains('recordings')) {
                db.createObjectStore('recordings', { keyPath: 'timestamp' });
            }
            if (!db.objectStoreNames.contains('writings')) {
                db.createObjectStore('writings', { keyPath: 'timestamp' });
            }
            if (!db.objectStoreNames.contains('vocabulary')) {
                db.createObjectStore('vocabulary', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('media')) {
                db.createObjectStore('media', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
    });
}

// Generic IndexedDB operations
async function dbGet(storeName, key) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = key ? store.get(key) : store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbGetAll(storeName) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function dbPut(storeName, data) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function dbPutAll(storeName, dataArray) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        // Clear existing data
        store.clear();

        // Add all items
        dataArray.forEach(item => store.put(item));

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function dbDelete(storeName, key) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Settings helpers
async function getSetting(key, defaultValue = null) {
    const setting = await dbGet('settings', key);
    return setting ? setting.value : defaultValue;
}

async function setSetting(key, value) {
    await dbPut('settings', { key, value });
}

// LocalStorage-compatible wrappers for easy migration
async function getStorageItem(key) {
    // Check if it's a setting or data
    if (key.includes('-prompt') || key.includes('Version') || key.includes('dismissed')) {
        return await getSetting(key);
    }

    // Map localStorage keys to IndexedDB stores
    const storeMap = {
        'recordings': 'recordings',
        'writings': 'writings',
        'vocabulary-words': 'vocabulary',
        'media': 'media'
    };

    const storeName = storeMap[key];
    if (storeName) {
        const data = await dbGetAll(storeName);
        return JSON.stringify(data);
    }

    // For other keys, treat as settings
    return await getSetting(key);
}

async function setStorageItem(key, value) {
    // Check if it's a setting or data
    if (key.includes('-prompt') || key.includes('Version') || key.includes('dismissed')) {
        await setSetting(key, value);
        return;
    }

    // Map localStorage keys to IndexedDB stores
    const storeMap = {
        'recordings': 'recordings',
        'writings': 'writings',
        'vocabulary-words': 'vocabulary',
        'media': 'media'
    };

    const storeName = storeMap[key];
    if (storeName) {
        const data = JSON.parse(value);
        await dbPutAll(storeName, data);
        return;
    }

    // For other keys, treat as settings
    await setSetting(key, value);
}

// Migrate data from localStorage to IndexedDB
async function migrateFromLocalStorage() {
    try {
        const migrated = await getSetting('migrated-from-localstorage');
        if (migrated) return; // Already migrated

        console.log('Migrating data from localStorage to IndexedDB...');

        // Migrate recordings
        const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
        if (recordings.length > 0) {
            await dbPutAll('recordings', recordings);
            console.log(`Migrated ${recordings.length} recordings`);
        }

        // Migrate writings
        const writings = JSON.parse(localStorage.getItem('writings') || '[]');
        if (writings.length > 0) {
            await dbPutAll('writings', writings);
            console.log(`Migrated ${writings.length} writings`);
        }

        // Migrate vocabulary
        const vocabulary = JSON.parse(localStorage.getItem('vocabulary-words') || '[]');
        if (vocabulary.length > 0) {
            await dbPutAll('vocabulary', vocabulary);
            console.log(`Migrated ${vocabulary.length} vocabulary words`);
        }

        // Migrate media
        const media = JSON.parse(localStorage.getItem('media') || '[]');
        if (media.length > 0) {
            await dbPutAll('media', media);
            console.log(`Migrated ${media.length} media items`);
        }

        // Migrate settings
        const settings = [
            { key: 'starterMediaVersion', value: localStorage.getItem('starterMediaVersion') || '0' },
            { key: 'recent-prompts', value: JSON.parse(localStorage.getItem('recent-prompts') || '[]') },
            { key: 'recent-writing-prompts', value: JSON.parse(localStorage.getItem('recent-writing-prompts') || '[]') },
            { key: 'mic-banner-dismissed', value: localStorage.getItem('mic-banner-dismissed') === 'true' }
        ];
        for (const setting of settings) {
            await setSetting(setting.key, setting.value);
        }

        // Mark as migrated
        await setSetting('migrated-from-localstorage', true);
        console.log('Migration complete!');

        // Optionally clear localStorage to free up space
        // localStorage.clear();
    } catch (error) {
        console.error('Error migrating from localStorage:', error);
    }
}

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

// Writing Prompts - Deeper reflection prompts for journaling
const WRITING_PROMPTS = [
    "What am I learning about myself? / Gịnị ka m na-amụta gbasara onwe m?",
    "A memory from this week / Ncheta site n'izu a",
    "Something I'm grateful for today / Ihe m nwere ekele maka ya taata",
    "My hopes for tomorrow / Olileanya m maka echi",
    "How I'm feeling right now / Otụ m dị ugbu a",
    "What challenged me today? / Gịnị kpara m ihe ịma aka taata?",
    "A person who inspires me / Onye na-akpali m mmụọ",
    "What I want to remember about today / Ihe m chọrọ icheta gbasara taata",
    "My biggest fear and why / Egwu m kasị ukwuu na ihe kpatara ya",
    "What makes me happy? / Gịnị na-eme m obi ụtọ?",
    "A lesson I learned recently / Ihe mmụta m mụtara n'oge na-adịbeghị anya",
    "My dreams for the future / Nrọ m maka ọdịnihu",
    "What I'm proud of / Ihe m na-anya isi maka ya",
    "A difficult conversation I had / Mkparịta ụka siri ike m nwere",
    "How I've grown this year / Otụ m tolitere n'afọ a",
    "What I need to let go of / Ihe m kwesịrị ịhapụ",
    "My relationship with my family / Mmekọrịta m na ezinụlọ m",
    "What success means to me / Ihe ịga nke ọma pụtara n'ebe m nọ",
    "A mistake I made and what I learned / Njehie m mere na ihe m mụtara",
    "What I value most in life / Ihe m kpọrọ ihe n'ihu kalịa na ndụ",
    "My favorite childhood memory / Ncheta ọma m kasị mma mgbe m bụ nwata",
    "What I wish people knew about me / Ihe m chọrọ ka ndị mmadụ mara gbasara m",
    "How I handle stress / Otụ m si edozi nchegbu",
    "What I'm avoiding and why / Ihe m na-ezere na ihe kpatara ya",
    "A goal I'm working towards / Ebumnobi m na-arụ ọrụ maka ya",
    "What friendship means to me / Ihe ọbụbụenyi pụtara m",
    "My morning routine and how it affects my day / Usoro ụtụtụ m na otụ ọ si emetụta ụbọchị m",
    "What I would tell my younger self / Ihe m ga-agwa onwe m mgbe m dị obere",
    "A place that feels like home / Ebe nke dị ka ụlọ m",
    "What I'm reading or learning / Ihe m na-agụ ma ọ bụ na-amụ"
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize IndexedDB and migrate data
        await initDB();
        await migrateFromLocalStorage();

        // Initialize UI
        initNavigation();
        await loadDailyPrompt();
        await initStarterMedia();
        await loadStats();
        await renderCalendar();
        await loadPastRecordings();
        initRecording();
        await initMediaLibrary();
        await initVocabulary();
        await initWriting();
        await checkTodayCompletion();
        await checkMicPermissionBanner();
        initShuffleButton();
        await checkStorageUsage();

        console.log('App initialized with IndexedDB');

        // DEBUG: Cleanup function for broken media items
        window.cleanupBrokenMedia = async function() {
            try {
                const media = await dbGetAll('media');
                console.log('All media items:', media);

                // Find items with files but broken display
                const brokenItems = media.filter(item =>
                    !item.isPreloaded &&
                    item.file &&
                    !item.file.startsWith('data:application/pdf')
                );

                if (brokenItems.length === 0) {
                    console.log('No broken items found');
                    alert('No broken items found. / Ahụghị ihe mebiri emebi.');
                    return;
                }

                console.log('Broken items found:', brokenItems);

                if (confirm(`Found ${brokenItems.length} broken items:\n${brokenItems.map(i => i.title).join('\n')}\n\nDelete them all?`)) {
                    for (const item of brokenItems) {
                        await dbDelete('media', item.id);
                        console.log('Deleted:', item.title);
                    }
                    await loadMediaList();
                    alert(`Deleted ${brokenItems.length} items.`);
                }
            } catch (e) {
                console.error('Error cleaning up:', e);
                alert('Error: ' + e.message);
            }
        };

        // DEBUG: Delete by title search
        window.deleteMediaByTitle = async function(search) {
            try {
                const media = await dbGetAll('media');
                const items = media.filter(item =>
                    !item.isPreloaded &&
                    item.title.toLowerCase().includes(search.toLowerCase())
                );

                if (items.length === 0) {
                    alert(`No items found with "${search}"`);
                    return;
                }

                if (confirm(`Delete ${items.length} item(s):\n${items.map(i => i.title).join('\n')}?`)) {
                    for (const item of items) {
                        await dbDelete('media', item.id);
                    }
                    await loadMediaList();
                    alert(`Deleted ${items.length} item(s).`);
                }
            } catch (e) {
                console.error('Error:', e);
                alert('Error: ' + e.message);
            }
        };

    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading app. Please refresh the page. / Njehie na-ebugo ngwa. Biko nwegharịa ibe a.');
    }
});

// Starter Media Library
async function initStarterMedia() {
    const media = await dbGetAll('media');
    const starterVersion = await getSetting('starterMediaVersion', '0');

    // Version 4: Added Radio Garden stations and BBC Igbo
    const CURRENT_VERSION = '4';

    // Remove old starter media if version changed
    if (starterVersion !== CURRENT_VERSION) {
        // Save user progress from old starter media
        const userProgressMap = {};
        media.forEach(item => {
            if (item.isPreloaded && item.id) {
                userProgressMap[item.id] = {
                    status: item.status,
                    reflection: item.reflection
                };
            }
        });

        // Remove all old starter media
        const userMedia = media.filter(item => !item.isPreloaded);

        // Add new starter media with preserved progress
        const updatedStarterMedia = STARTER_MEDIA.map(item => {
            const savedProgress = userProgressMap[item.id];
            if (savedProgress) {
                // Preserve user's progress
                return {
                    ...item,
                    status: savedProgress.status,
                    reflection: savedProgress.reflection
                };
            }
            return item;
        });

        const updatedMedia = [...updatedStarterMedia, ...userMedia];
        await dbPutAll('media', updatedMedia);
        await setSetting('starterMediaVersion', CURRENT_VERSION);
    } else {
        // Check if starter media already exists
        const hasStarterMedia = media.some(item => item.isPreloaded);

        if (!hasStarterMedia) {
            // Add starter media to the beginning
            const updatedMedia = [...STARTER_MEDIA, ...media];
            await dbPutAll('media', updatedMedia);
            await setSetting('starterMediaVersion', CURRENT_VERSION);
        }
    }
}

// Mic Permission Banner
async function checkMicPermissionBanner() {
    const bannerDismissed = await getSetting('mic-banner-dismissed', false);
    if (!bannerDismissed) {
        document.getElementById('mic-permission-banner').classList.remove('hidden');
    }
}

async function dismissMicBanner() {
    await setSetting('mic-banner-dismissed', true);
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
async function loadDailyPrompt() {
    const today = new Date().toDateString();
    const savedPrompt = await getSetting(`prompt-${today}`);

    let prompt;
    if (savedPrompt) {
        prompt = savedPrompt;
    } else {
        // Generate random prompt for today
        const randomIndex = Math.floor(Math.random() * PROMPTS.length);
        prompt = PROMPTS[randomIndex];
        await setSetting(`prompt-${today}`, prompt);
    }

    document.getElementById('daily-prompt').textContent = prompt;
}

// Shuffle Button
function initShuffleButton() {
    const shuffleBtn = document.getElementById('shuffle-prompt-btn');
    shuffleBtn.addEventListener('click', shufflePrompt);
}

async function shufflePrompt() {
    // Get recently used prompts (last 15)
    const recentPrompts = await getSetting('recent-prompts', []);

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
    await setSetting(`prompt-${today}`, newPrompt);

    // Track this prompt as recently used (keep last 15)
    recentPrompts.push(newPrompt);
    if (recentPrompts.length > 15) {
        recentPrompts.shift(); // Remove oldest
    }
    await setSetting('recent-prompts', recentPrompts);
}

// Recording
function initRecording() {
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const rerecordBtn = document.getElementById('rerecord-btn');
    const saveBtn = document.getElementById('save-btn');
    const recordMoreBtn = document.getElementById('record-more-btn');

    if (recordBtn) recordBtn.addEventListener('click', startRecording);
    if (stopBtn) stopBtn.addEventListener('click', stopRecording);
    if (rerecordBtn) rerecordBtn.addEventListener('click', reRecord);
    if (saveBtn) saveBtn.addEventListener('click', saveRecording);
    if (recordMoreBtn) {
        recordMoreBtn.addEventListener('click', recordMore);
        console.log('Record More button initialized');
    } else {
        console.warn('Record More button not found!');
    }
}

function recordMore() {
    try {
        // Reset all states to allow new recording
        const completionMsg = document.getElementById('completion-message');
        const playbackSection = document.getElementById('playback-section');
        const recordingControls = document.getElementById('recording-controls');
        const recordBtn = document.getElementById('record-btn');
        const recordingStatus = document.getElementById('recording-status');

        if (completionMsg) completionMsg.classList.add('hidden');
        if (playbackSection) playbackSection.classList.add('hidden');
        if (recordingControls) recordingControls.classList.remove('hidden');
        if (recordBtn) recordBtn.classList.remove('hidden');
        if (recordingStatus) recordingStatus.classList.add('hidden');

        // Clear current audio blob and chunks
        currentAudioBlob = null;
        audioChunks = [];

        console.log('Record More: UI reset complete');
    } catch (e) {
        console.error('Error in recordMore:', e);
        alert('Error resetting recording. Please refresh the page. / Njehie. Biko nwegharịa ibe a.');
    }
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
        await setSetting('mic-banner-dismissed', true);
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
            if (audioChunks.length === 0) {
                console.error('No audio chunks recorded');
                alert('Recording failed. Please try again. / Ndekọ dara ada. Biko nwaa ọzọ.');
                // Reset UI
                document.getElementById('recording-status').classList.add('hidden');
                document.getElementById('record-btn').classList.remove('hidden');
                return;
            }

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
        // Request any pending data before stopping
        mediaRecorder.requestData();

        // Small delay to ensure last chunk is captured
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            document.getElementById('recording-status').classList.add('hidden');
        }, 100);
    }
}

function reRecord() {
    // Reset UI
    document.getElementById('playback-section').classList.add('hidden');
    document.getElementById('recording-controls').classList.remove('hidden');
    document.getElementById('record-btn').classList.remove('hidden');
    currentAudioBlob = null;
}

async function saveRecording() {
    if (!currentAudioBlob) {
        alert('No recording found. Please record again. / Enweghị ndekọ. Biko dekọọkwa.');
        return;
    }

    const today = new Date().toDateString();
    const prompt = document.getElementById('daily-prompt').textContent;

    // Convert blob to base64 for storage
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64Audio = reader.result;

        if (!base64Audio) {
            alert('Error saving recording. Please try again. / Njehie ịchekwa ndekọ. Biko nwaa ọzọ.');
            return;
        }

        // Create new recording
        const newRecording = {
            date: today,
            timestamp: new Date().toISOString(),
            prompt: prompt,
            audio: base64Audio,
            type: 'prompt' // Track that this was a prompt response
        };

        try {
            // Save to IndexedDB
            await dbPut('recordings', newRecording);

            // Update UI
            document.getElementById('playback-section').classList.add('hidden');
            document.getElementById('completion-message').classList.remove('hidden');

            // Update stats
            await loadStats();
            await renderCalendar();
            await loadPastRecordings();

            // Clear the audio blob
            currentAudioBlob = null;
        } catch (e) {
            console.error('Error saving recording:', e);
            alert('Error saving recording. Storage may be full. / Njehie ịchekwa ndekọ. Nchekwa nwere ike ijupụta.');
        }
    };

    reader.onerror = () => {
        alert('Error reading recording. Please try again. / Njehie ịgụ ndekọ. Biko nwaa ọzọ.');
    };

    reader.readAsDataURL(currentAudioBlob);
}

// Check if today is completed (no longer restricts to one recording)
function checkTodayCompletion() {
    // Removed restriction - allow multiple recordings per day
    // Users can now record as many prompts as they want each day
}

// Stats
async function loadStats() {
    const recordings = await dbGetAll('recordings');

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
async function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const recordings = await dbGetAll('recordings');
    const writings = await dbGetAll('writings');
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
        const dayWritings = writings.filter(w => w.date === dateString);
        const hasPrompt = dayRecordings.some(r => r.type === 'prompt');
        const hasMedia = dayRecordings.some(r => r.type === 'media');
        const hasVocab = dayRecordings.some(r => r.type === 'vocabulary');
        const hasWriting = dayWritings.length > 0;

        // Count how many activity types
        const activityCount = [hasPrompt, hasMedia, hasVocab, hasWriting].filter(Boolean).length;

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
        } else if (hasWriting) {
            // Only writing - show writing hand
            dayEl.innerHTML = `
                <div class="cal-icon">✍️</div>
                <div class="cal-date">${day}</div>
                <div class="cal-igbo">${igboDay}</div>
            `;
            dayEl.classList.add('completed', 'writing-activity');
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
async function loadPastRecordings() {
    const recordings = await dbGetAll('recordings');
    const list = document.getElementById('past-recordings-list');

    if (recordings.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center;">No recordings yet / Enweghị ndekọ ọ bụla</p>';
        return;
    }

    // Sort by most recent first
    recordings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Add "Download All" button at the top
    const downloadAllBtn = `
        <div style="margin-bottom: 16px; text-align: center;">
            <button class="btn btn-primary" onclick="downloadAllRecordings()" style="padding: 8px 16px;">
                📥 Download All Recordings / Budata Ndekọ Niile
            </button>
        </div>
    `;

    const recordingsList = recordings.map((recording, index) => `
        <div class="recording-item">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <span class="recording-date">${new Date(recording.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</span>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;" onclick="downloadRecording('${recording.timestamp}')">
                        📥 Download / Budata
                    </button>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteRecording('${recording.timestamp}')">
                        Delete / Hichapụ
                    </button>
                </div>
            </div>
            <div class="recording-prompt">${recording.prompt}</div>
            <audio controls src="${recording.audio}"></audio>
        </div>
    `).join('');

    list.innerHTML = downloadAllBtn + recordingsList;
}

async function deleteRecording(timestamp) {
    if (!confirm('Are you sure you want to delete this recording? / Ị ji n\'aka na ị chọrọ ihichapụ ndekọ a?')) {
        return;
    }

    try {
        await dbDelete('recordings', timestamp);

        // Refresh displays
        await loadPastRecordings();
        await loadStats();
        await renderCalendar();
        await checkTodayCompletion();
    } catch (e) {
        console.error('Error deleting recording:', e);
        alert('Error deleting recording. / Njehie ihichapụ ndekọ.');
    }
}

// Make function globally accessible
window.deleteRecording = deleteRecording;

// Download individual recording
async function downloadRecording(timestamp) {
    try {
        const recording = await dbGet('recordings', timestamp);

        if (!recording) {
            alert('Recording not found. / Ahụghị ndekọ.');
            return;
        }

        // Create filename from date and prompt
        const date = new Date(recording.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const promptShort = recording.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
        const filename = `igbo_recording_${dateStr}_${promptShort}.wav`;

        // Create download link
        const link = document.createElement('a');
        link.href = recording.audio;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error('Error downloading recording:', e);
        alert('Error downloading recording. / Njehie ibudata ndekọ.');
    }
}

// Make function globally accessible
window.downloadRecording = downloadRecording;

// Download all recordings as a zip file
async function downloadAllRecordings() {
    try {
        const recordings = await dbGetAll('recordings');

        if (recordings.length === 0) {
            alert('No recordings to download. / Enweghị ndekọ ibudata.');
            return;
        }

        // Create a JSON export with all recordings
        const exportData = {
            exportDate: new Date().toISOString(),
            appName: 'Igbo Practice App',
            recordingsCount: recordings.length,
            recordings: recordings.map(r => ({
                date: r.date,
                timestamp: r.timestamp,
                prompt: r.prompt,
                type: r.type,
                audio: r.audio
            }))
        };

        // Convert to JSON and create blob
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create filename with date
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `igbo_recordings_export_${dateStr}.json`;

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(`Downloaded ${recordings.length} recordings as JSON.\n\nYou can re-import this file later to restore your recordings.\n\nBudata ndekọ ${recordings.length} dị ka JSON.`);
    } catch (e) {
        console.error('Error downloading all recordings:', e);
        alert('Error downloading recordings. / Njehie ibudata ndekọ.');
    }
}

// Make function globally accessible
window.downloadAllRecordings = downloadAllRecordings;

// Media Library
async function initMediaLibrary() {
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

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeReflectionModal);
    if (modalRecordBtn) modalRecordBtn.addEventListener('click', startModalRecording);
    if (modalStopBtn) modalStopBtn.addEventListener('click', stopModalRecording);
    if (modalRerecordBtn) modalRerecordBtn.addEventListener('click', reRecordModal);
    if (modalSaveBtn) modalSaveBtn.addEventListener('click', saveModalReflection);

    // Event delegation for media reflection buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('media-reflection-btn')) {
            const mediaId = e.target.getAttribute('data-media-id');
            const mediaTitle = e.target.getAttribute('data-media-title');
            if (mediaId && mediaTitle) {
                console.log('Reflection button clicked via delegation:', mediaId, mediaTitle);
                openReflectionModal(mediaId, mediaTitle);
            }
        }
    });

    // Event delegation for status dropdowns
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList.contains('media-status-select')) {
            const mediaId = e.target.getAttribute('data-media-id');
            const newStatus = e.target.value;
            if (mediaId) {
                console.log('Status changed via delegation:', mediaId, newStatus);
                updateMediaStatus(mediaId, newStatus);
            }
        }
    });

    await loadMediaList();
}

async function addMedia() {
    const title = document.getElementById('media-title').value;
    const type = document.getElementById('media-type').value;
    const link = document.getElementById('media-link').value;
    const notes = document.getElementById('media-notes').value;
    const fileInput = document.getElementById('media-file');

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

    // Handle file upload
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];

        // Check file size (limit to 10MB for performance)
        if (file.size > 10 * 1024 * 1024) {
            alert('File is too large. Please upload files under 10MB. / Faịlụ buru ibu. Biko bulite faịlụ n\'okpuru 10MB.');
            return;
        }

        const reader = new FileReader();

        reader.onloadend = async () => {
            newMedia.file = reader.result;
            newMedia.fileType = file.type; // Store the actual file type
            newMedia.fileName = file.name; // Store the file name

            try {
                await dbPut('media', newMedia);

                document.getElementById('add-media-form').classList.add('hidden');
                document.getElementById('media-form').reset();
                await loadMediaList();
            } catch (e) {
                console.error('Error saving media:', e);
                alert('Error uploading file. File may be too large. / Njehie ibugo faịlụ. Faịlụ nwere ike buru ibu.');
            }
        };

        reader.onerror = () => {
            alert('Error reading file. / Njehie ịgụ faịlụ.');
        };

        reader.readAsDataURL(file);
    } else {
        await dbPut('media', newMedia);

        document.getElementById('add-media-form').classList.add('hidden');
        document.getElementById('media-form').reset();
        await loadMediaList();
    }
}

async function loadMediaList() {
    const media = await dbGetAll('media');
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
                <select class="media-status-select" data-media-id="${item.id}">
                    <option value="not-started" ${item.status === 'not-started' ? 'selected' : ''}>Not Started / Amalitebeghị</option>
                    <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In Progress / Na-aga N'ihu</option>
                    <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed / Emezuola</option>
                </select>
            </div>
            <button class="btn btn-primary media-reflection-btn" style="width: 100%; margin-top: 12px;" data-media-id="${item.id}" data-media-title="${item.title.replace(/"/g, '&quot;')}">
                ${item.reflection ? '🎤 Update Reflection / Melite Ntụgharị Uche' : '🎤 Record What I Learned / Dekọọ Ihe M Mụtara'}
            </button>
            ${item.reflection ? `
                <div class="media-reflection">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <p style="margin: 0;"><strong>My Reflection / Ntụgharị Uche M:</strong></p>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;" onclick="downloadMediaReflection('${item.id}')">
                                📥 Download / Budata
                            </button>
                            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteMediaReflection('${item.id}')">
                                Delete / Hichapụ
                            </button>
                        </div>
                    </div>
                    <audio controls src="${item.reflection}"></audio>
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
}

function getMediaEmbed(item) {
    // If there's an uploaded file
    if (item.file) {
        // Check if it's a PDF (by MIME type or data URL prefix)
        if (item.file.startsWith('data:application/pdf') ||
            (item.fileType && item.fileType === 'application/pdf') ||
            (item.fileName && item.fileName.toLowerCase().endsWith('.pdf'))) {
            return `
                <div class="media-embed pdf-embed">
                    <iframe src="${item.file}#toolbar=0" title="${item.title}"></iframe>
                </div>
            `;
        }

        // If it's some other file type, show a download link
        return `
            <div class="media-link" style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 8px;">
                <p style="margin-bottom: 12px;">📄 File uploaded: ${item.fileName || 'Unknown file'}</p>
                <a href="${item.file}" download="${item.fileName || 'download'}" class="btn btn-primary">
                    Download File / Budata Faịlụ
                </a>
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

async function updateMediaStatus(id, newStatus) {
    console.log('updateMediaStatus called:', id, newStatus);

    try {
        const item = await dbGet('media', id);

        if (!item) {
            console.error('Media item not found:', id);
            return;
        }

        const oldStatus = item.status;
        item.status = newStatus;

        await dbPut('media', item);
        console.log('Status updated successfully');

        // If changed to completed and no reflection, open modal
        if (newStatus === 'completed' && !item.reflection && oldStatus !== 'completed') {
            console.log('Opening reflection modal for completed item');
            openReflectionModal(id, item.title);
        } else {
            await loadMediaList();
        }
    } catch (e) {
        console.error('Error saving status:', e);
        alert('Error saving status. / Njehie ịchekwa ọnọdụ.');
    }
}

// Make function globally accessible
window.updateMediaStatus = updateMediaStatus;

async function deleteMedia(id) {
    try {
        // Convert id to match the type in storage (string for starter media, number for user media)
        const media = await dbGetAll('media');
        const item = media.find(m => String(m.id) === String(id));

        if (!item) {
            alert('Media item not found. / Ahụghị ihe mgbasa ozi.');
            return;
        }

        if (item.isPreloaded) {
            alert('Starter library items cannot be deleted. / Enweghị ike ihichapụ ihe ndị dị na ọba akwụkwọ mmalite.');
            return;
        }

        if (!confirm('Are you sure you want to delete this media item? / Ị ji n\'aka na ị chọrọ ihichapụ ihe mgbasa ozi a?')) {
            return;
        }

        // Use the actual item.id to ensure type matches
        await dbDelete('media', item.id);
        await loadMediaList();
    } catch (e) {
        console.error('Error deleting media:', e);
        alert('Error deleting media. / Njehie ihichapụ mgbasa ozi.');
    }
}

// Make function globally accessible
window.deleteMedia = deleteMedia;

// Delete only the reflection audio (keep the media item)
async function deleteMediaReflection(id) {
    try {
        if (!confirm('Delete this reflection? The media item will remain. / Hichapụ ntụgharị uche a? Ihe mgbasa ozi ga-anọgide.')) {
            return;
        }

        const media = await dbGetAll('media');
        const item = media.find(m => String(m.id) === String(id));

        if (!item) {
            alert('Media item not found. / Ahụghị ihe mgbasa ozi.');
            return;
        }

        // Remove only the reflection audio
        item.reflection = null;
        await dbPut('media', item);

        // Also remove from recordings if it was tracked
        const recordings = await dbGetAll('recordings');
        const updatedRecordings = recordings.filter(r =>
            !(r.type === 'media' && String(r.mediaId) === String(id))
        );

        if (updatedRecordings.length !== recordings.length) {
            await dbPutAll('recordings', updatedRecordings);
        }

        // Refresh displays
        await loadMediaList();
        await loadStats();
        await renderCalendar();
    } catch (e) {
        console.error('Error deleting reflection:', e);
        alert('Error deleting reflection. / Njehie ihichapụ ntụgharị uche.');
    }
}

// Make function globally accessible
window.deleteMediaReflection = deleteMediaReflection;

// Download media reflection
async function downloadMediaReflection(id) {
    try {
        const media = await dbGetAll('media');
        const item = media.find(m => String(m.id) === String(id));

        if (!item || !item.reflection) {
            alert('Reflection not found. / Ahụghị ntụgharị uche.');
            return;
        }

        // Create filename from title
        const titleShort = item.title.substring(0, 40).replace(/[^a-z0-9]/gi, '_');
        const filename = `igbo_media_reflection_${titleShort}.wav`;

        // Create download link
        const link = document.createElement('a');
        link.href = item.reflection;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error('Error downloading reflection:', e);
        alert('Error downloading reflection. / Njehie ibudata ntụgharị uche.');
    }
}

// Make function globally accessible
window.downloadMediaReflection = downloadMediaReflection;

function openReflectionModal(mediaId, mediaTitle) {
    console.log('openReflectionModal called:', mediaId, mediaTitle);

    currentMediaId = mediaId;
    const titleElement = document.getElementById('reflection-media-title');
    const titleIgboElement = document.getElementById('reflection-media-title-igbo');
    const modalElement = document.getElementById('reflection-modal');

    if (!titleElement || !titleIgboElement || !modalElement) {
        console.error('Modal elements not found');
        alert('Error opening modal. Please refresh the page. / Njehie imeghe modal. Biko nwegharịa ibe a.');
        return;
    }

    titleElement.textContent = mediaTitle;
    titleIgboElement.textContent = mediaTitle;
    modalElement.classList.remove('hidden');

    // Reset modal recording state
    const recordBtn = document.getElementById('modal-record-btn');
    const recordingStatus = document.getElementById('modal-recording-status');
    const playback = document.getElementById('modal-playback');

    if (recordBtn) recordBtn.classList.remove('hidden');
    if (recordingStatus) recordingStatus.classList.add('hidden');
    if (playback) playback.classList.add('hidden');
    currentModalAudioBlob = null;

    console.log('Modal opened successfully');
}

// Make function globally accessible
window.openReflectionModal = openReflectionModal;

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

async function saveModalReflection() {
    if (!currentModalAudioBlob || !currentMediaId) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            const base64Audio = reader.result;
            const item = await dbGet('media', currentMediaId);

            if (item) {
                item.reflection = base64Audio;

                // If item is marked as completed and has reflection, track as media activity
                if (item.status === 'completed') {
                    const today = new Date().toDateString();
                    const recordings = await dbGetAll('recordings');

                    // Check if we already tracked this media completion today
                    const alreadyTracked = recordings.some(r =>
                        r.date === today && r.type === 'media' && String(r.mediaId) === String(item.id)
                    );

                    if (!alreadyTracked) {
                        const newRecording = {
                            date: today,
                            timestamp: new Date().toISOString(),
                            type: 'media',
                            mediaId: item.id,
                            mediaTitle: item.title,
                            audio: base64Audio
                        };
                        await dbPut('recordings', newRecording);

                        // Update stats and calendar
                        await loadStats();
                        await renderCalendar();
                    }
                }

                await dbPut('media', item);
                closeReflectionModal();
                await loadMediaList();
            }
        } catch (e) {
            console.error('Error saving reflection:', e);
            if (e.name === 'QuotaExceededError') {
                handleStorageError();
            } else {
                alert('Error saving reflection. / Njehie ịchekwa ntụgharị uche.');
            }
            closeReflectionModal();
        }
    };

    reader.readAsDataURL(currentModalAudioBlob);
}

// Vocabulary Management
async function initVocabulary() {
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

    if (vocabCloseBtn) vocabCloseBtn.addEventListener('click', closeVocabModal);
    if (vocabRecordBtn) vocabRecordBtn.addEventListener('click', startVocabRecording);
    if (vocabStopBtn) vocabStopBtn.addEventListener('click', stopVocabRecording);
    if (vocabRerecordBtn) vocabRerecordBtn.addEventListener('click', reRecordVocab);
    if (vocabSaveBtn) vocabSaveBtn.addEventListener('click', saveVocabPractice);

    await loadWordsList();
}

async function addWord() {
    const igboWord = document.getElementById('word-igbo').value;
    const englishMeaning = document.getElementById('word-english').value;
    const examples = document.getElementById('word-examples').value;
    const notes = document.getElementById('word-notes').value;

    const newWord = {
        id: Date.now(),
        igboWord,
        englishMeaning,
        examples,
        notes,
        practices: [] // Array of practice recordings with dates
    };

    await dbPut('vocabulary', newWord);

    document.getElementById('add-word-form').classList.add('hidden');
    document.getElementById('word-form').reset();
    await loadWordsList();
}

async function loadWordsList() {
    const words = await dbGetAll('vocabulary');
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
                        <div style="margin-bottom: 12px; padding: 8px; background: #f8f9fa; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <div style="font-size: 12px; color: #6c757d;">
                                    ${new Date(practice.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button class="btn btn-primary" style="padding: 2px 8px; font-size: 11px;" onclick="downloadVocabPractice(${word.id}, '${practice.timestamp}')">
                                        📥 Download
                                    </button>
                                    <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px;" onclick="deleteVocabPractice(${word.id}, '${practice.timestamp}')">
                                        Delete / Hichapụ
                                    </button>
                                </div>
                            </div>
                            <audio controls src="${practice.audio}" style="width: 100%;"></audio>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function deleteWord(id) {
    if (!confirm('Are you sure you want to delete this word? / Ị ji n\'aka na ị chọrọ ihichapụ okwu a?')) {
        return;
    }

    try {
        await dbDelete('vocabulary', id);
        await loadWordsList();

        // Refresh calendar in case this affected streaks
        await loadStats();
        await renderCalendar();
    } catch (e) {
        console.error('Error deleting word:', e);
        alert('Error deleting word. / Njehie ihichapụ okwu.');
    }
}

// Make function globally accessible
window.deleteWord = deleteWord;

async function deleteVocabPractice(wordId, timestamp) {
    if (!confirm('Delete this practice recording? / Hichapụ ndekọ omume a?')) {
        return;
    }

    try {
        const word = await dbGet('vocabulary', wordId);

        if (word) {
            // Remove the specific practice
            word.practices = word.practices.filter(p => p.timestamp !== timestamp);
            await dbPut('vocabulary', word);

            // Refresh the display
            await loadWordsList();

            // Update calendar in case this was the only practice for today
            await loadStats();
            await renderCalendar();
        }
    } catch (e) {
        console.error('Error deleting vocabulary practice:', e);
        alert('Error deleting practice. / Njehie ihichapụ omume.');
    }
}

// Make function globally accessible
window.deleteVocabPractice = deleteVocabPractice;

// Download vocabulary practice recording
async function downloadVocabPractice(wordId, timestamp) {
    try {
        const word = await dbGet('vocabulary', wordId);

        if (!word) {
            alert('Word not found. / Ahụghị okwu.');
            return;
        }

        const practice = word.practices.find(p => p.timestamp === timestamp);

        if (!practice) {
            alert('Practice recording not found. / Ahụghị ndekọ omume.');
            return;
        }

        // Create filename from word and date
        const date = new Date(practice.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const wordShort = word.igboWord.substring(0, 20).replace(/[^a-z0-9]/gi, '_');
        const filename = `igbo_vocab_practice_${wordShort}_${dateStr}.wav`;

        // Create download link
        const link = document.createElement('a');
        link.href = practice.audio;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error('Error downloading practice:', e);
        alert('Error downloading practice. / Njehie ibudata omume.');
    }
}

// Make function globally accessible
window.downloadVocabPractice = downloadVocabPractice;

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

// Make function globally accessible
window.openVocabModal = openVocabModal;

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

async function saveVocabPractice() {
    if (!currentVocabAudioBlob || !currentWordId) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            const base64Audio = reader.result;
            const today = new Date().toDateString();

            const word = await dbGet('vocabulary', currentWordId);

            if (word) {
                // Add practice to word
                word.practices.unshift({
                    date: today,
                    timestamp: new Date().toISOString(),
                    audio: base64Audio
                });

                await dbPut('vocabulary', word);

                // Track as vocabulary activity for streak
                const recordings = await dbGetAll('recordings');

                // Check if we already tracked vocabulary practice today
                const alreadyTrackedToday = recordings.some(r =>
                    r.date === today && r.type === 'vocabulary'
                );

                if (!alreadyTrackedToday) {
                    const newRecording = {
                        date: today,
                        timestamp: new Date().toISOString(),
                        type: 'vocabulary',
                        wordId: word.id,
                        word: word.igboWord,
                        audio: base64Audio
                    };
                    await dbPut('recordings', newRecording);

                    // Update stats and calendar
                    await loadStats();
                    await renderCalendar();
                }

                closeVocabModal();
                await loadWordsList();
            }
        } catch (e) {
            console.error('Error saving vocabulary practice:', e);
            if (e.name === 'QuotaExceededError') {
                handleStorageError();
            } else {
                alert('Error saving practice. / Njehie ịchekwa omume.');
            }
            closeVocabModal();
        }
    };

    reader.readAsDataURL(currentVocabAudioBlob);
}

// Writing Management
async function initWriting() {
    const shuffleWritingBtn = document.getElementById('shuffle-writing-btn');
    const saveWritingBtn = document.getElementById('save-writing-btn');
    const newWritingBtn = document.getElementById('new-writing-btn');
    const writingTextarea = document.getElementById('writing-textarea');

    await loadWritingPrompt();
    await loadWritingStats();
    await loadPastWritings();
    await checkTodayWriting();

    shuffleWritingBtn.addEventListener('click', shuffleWritingPrompt);
    saveWritingBtn.addEventListener('click', saveWriting);
    newWritingBtn.addEventListener('click', startNewWriting);

    // Update word count as user types
    writingTextarea.addEventListener('input', updateWordCount);
}

async function loadWritingPrompt() {
    const today = new Date().toDateString();
    const savedPrompt = await getSetting(`writing-prompt-${today}`);

    let prompt;
    if (savedPrompt) {
        prompt = savedPrompt;
    } else {
        // Generate random writing prompt for today
        const randomIndex = Math.floor(Math.random() * WRITING_PROMPTS.length);
        prompt = WRITING_PROMPTS[randomIndex];
        await setSetting(`writing-prompt-${today}`, prompt);
    }

    document.getElementById('writing-prompt').textContent = prompt;
}

async function shuffleWritingPrompt() {
    // Get recently used writing prompts (last 15)
    const recentPrompts = await getSetting('recent-writing-prompts', []);

    // Filter out recent prompts to avoid repetition
    let availablePrompts = WRITING_PROMPTS.filter(p => !recentPrompts.includes(p));

    // If we've used most prompts (less than 5 available), allow older ones back
    if (availablePrompts.length < 5) {
        const halfRecent = recentPrompts.slice(Math.floor(recentPrompts.length / 2));
        availablePrompts = WRITING_PROMPTS.filter(p => !halfRecent.includes(p));
    }

    // Get a random prompt from available ones
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    const newPrompt = availablePrompts[randomIndex];

    // Update the display
    document.getElementById('writing-prompt').textContent = newPrompt;

    // Save it so it persists for this session
    const today = new Date().toDateString();
    await setSetting(`writing-prompt-${today}`, newPrompt);

    // Track this prompt as recently used (keep last 15)
    recentPrompts.push(newPrompt);
    if (recentPrompts.length > 15) {
        recentPrompts.shift(); // Remove oldest
    }
    await setSetting('recent-writing-prompts', recentPrompts);
}

function updateWordCount() {
    const textarea = document.getElementById('writing-textarea');
    const text = textarea.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    document.getElementById('word-count').textContent = words.length;
}

async function saveWriting() {
    const textarea = document.getElementById('writing-textarea');
    const text = textarea.value.trim();

    if (!text) {
        alert('Please write something before saving. / Biko dee ihe tupu ịchekwa.');
        return;
    }

    const today = new Date().toDateString();
    const prompt = document.getElementById('writing-prompt').textContent;

    // Add new writing with activity type
    const newWriting = {
        date: today,
        timestamp: new Date().toISOString(),
        prompt: prompt,
        text: text,
        type: 'writing',
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length
    };

    try {
        await dbPut('writings', newWriting);

        // Update UI
        document.getElementById('writing-controls').classList.add('hidden');
        document.getElementById('writing-completion-message').classList.remove('hidden');
        textarea.value = '';
        updateWordCount();

        // Update stats
        await loadWritingStats();
        await loadStats(); // Update main stats
        await renderCalendar();
        await loadPastWritings();
    } catch (e) {
        console.error('Error saving writing:', e);
        if (e.name === 'QuotaExceededError') {
            handleStorageError();
        } else {
            alert('Error saving writing. / Njehie ịchekwa ide.');
        }
    }
}

function startNewWriting() {
    document.getElementById('writing-controls').classList.remove('hidden');
    document.getElementById('writing-completion-message').classList.add('hidden');
}

async function checkTodayWriting() {
    const today = new Date().toDateString();
    const writings = await dbGetAll('writings');
    const todayWriting = writings.find(w => w.date === today);

    if (todayWriting) {
        document.getElementById('writing-controls').classList.add('hidden');
        document.getElementById('writing-completion-message').classList.remove('hidden');
    }
}

async function loadWritingStats() {
    const writings = await dbGetAll('writings');

    // Total writings
    document.getElementById('total-writings').textContent = writings.length;

    // Calculate writing streak
    const streak = calculateStreak(writings);
    document.getElementById('writing-streak').textContent = streak;
}

async function loadPastWritings() {
    const writings = await dbGetAll('writings');
    const list = document.getElementById('past-writings-list');

    if (writings.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center;">No writings yet / Enweghị ide ọ bụla</p>';
        return;
    }

    // Sort by most recent first
    writings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Add "Download All" button at the top
    const downloadAllBtn = `
        <div style="margin-bottom: 16px; text-align: center;">
            <button class="btn btn-primary" onclick="downloadAllWritings()" style="padding: 8px 16px;">
                📥 Download All Writings / Budata Ide Niile
            </button>
        </div>
    `;

    const writingsList = writings.map((writing) => `
        <div class="recording-item">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <span class="recording-date">${new Date(writing.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                        ${writing.wordCount} words / okwu
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;" onclick="downloadWriting('${writing.timestamp}')">
                        📥 Download / Budata
                    </button>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteWriting('${writing.timestamp}')">
                        Delete / Hichapụ
                    </button>
                </div>
            </div>
            <div class="recording-prompt" style="margin-bottom: 8px;">${writing.prompt}</div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; color: #333; max-height: 300px; overflow-y: auto;">
                ${writing.text}
            </div>
        </div>
    `).join('');

    list.innerHTML = downloadAllBtn + writingsList;
}

async function deleteWriting(timestamp) {
    if (!confirm('Are you sure you want to delete this writing? / Ị ji n\'aka na ị chọrọ ihichapụ ide a?')) {
        return;
    }

    try {
        await dbDelete('writings', timestamp);

        // Refresh displays
        await loadPastWritings();
        await loadWritingStats();
        await loadStats();
        await renderCalendar();
        await checkTodayWriting();
    } catch (e) {
        console.error('Error deleting writing:', e);
        alert('Error deleting writing. / Njehie ihichapụ ide.');
    }
}

// Make function globally accessible
window.deleteWriting = deleteWriting;

// Download individual writing
async function downloadWriting(timestamp) {
    try {
        const writing = await dbGet('writings', timestamp);

        if (!writing) {
            alert('Writing not found. / Ahụghị ide.');
            return;
        }

        // Create filename from date and prompt
        const date = new Date(writing.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const promptShort = writing.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
        const filename = `igbo_writing_${dateStr}_${promptShort}.txt`;

        // Create text content with metadata
        const content = `Igbo Practice App - Writing Entry
Date: ${new Date(writing.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Prompt: ${writing.prompt}
Word Count: ${writing.wordCount}

---

${writing.text}
`;

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Error downloading writing:', e);
        alert('Error downloading writing. / Njehie ibudata ide.');
    }
}

// Make function globally accessible
window.downloadWriting = downloadWriting;

// Download all writings as JSON
async function downloadAllWritings() {
    try {
        const writings = await dbGetAll('writings');

        if (writings.length === 0) {
            alert('No writings to download. / Enweghị ide ibudata.');
            return;
        }

        // Create a JSON export with all writings
        const exportData = {
            exportDate: new Date().toISOString(),
            appName: 'Igbo Practice App',
            writingsCount: writings.length,
            totalWords: writings.reduce((sum, w) => sum + (w.wordCount || 0), 0),
            writings: writings.map(w => ({
                date: w.date,
                timestamp: w.timestamp,
                prompt: w.prompt,
                text: w.text,
                wordCount: w.wordCount,
                type: w.type
            }))
        };

        // Convert to JSON and create blob
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create filename with date
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `igbo_writings_export_${dateStr}.json`;

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(`Downloaded ${writings.length} writings as JSON.\n\nYou can re-import this file later to restore your writings.\n\nBudata ide ${writings.length} dị ka JSON.`);
    } catch (e) {
        console.error('Error downloading all writings:', e);
        alert('Error downloading writings. / Njehie ibudata ide.');
    }
}

// Make function globally accessible
window.downloadAllWritings = downloadAllWritings;

// Storage Management
function getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    // Convert to MB
    return (total / 1024 / 1024).toFixed(2);
}

function getStorageBreakdown() {
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    const writings = JSON.parse(localStorage.getItem('writings') || '[]');
    const words = JSON.parse(localStorage.getItem('vocabulary-words') || '[]');
    const media = JSON.parse(localStorage.getItem('media') || '[]');

    const recordingsSize = (JSON.stringify(recordings).length / 1024 / 1024).toFixed(2);
    const writingsSize = (JSON.stringify(writings).length / 1024 / 1024).toFixed(2);
    const wordsSize = (JSON.stringify(words).length / 1024 / 1024).toFixed(2);
    const mediaSize = (JSON.stringify(media).length / 1024 / 1024).toFixed(2);

    return {
        recordings: { count: recordings.length, size: recordingsSize },
        writings: { count: writings.length, size: writingsSize },
        words: { count: words.length, size: wordsSize },
        media: { count: media.filter(m => m.reflection).length, size: mediaSize }
    };
}

function checkStorageUsage() {
    try {
        const totalSize = parseFloat(getStorageSize());
        const maxSize = 5; // Most browsers allow 5-10MB, using 5 as conservative estimate

        // Warn at 80% capacity (4MB)
        if (totalSize >= maxSize * 0.8) {
            const breakdown = getStorageBreakdown();
            const message = `Storage Warning / Ịdọ Aka Na Ntị Nchekwa\n\n` +
                `You're using ${totalSize}MB of ~${maxSize}MB available.\n` +
                `Ị na-eji ${totalSize}MB nke ~${maxSize}MB dị.\n\n` +
                `Breakdown / Nkewa:\n` +
                `• Practice recordings: ${breakdown.recordings.count} (${breakdown.recordings.size}MB)\n` +
                `• Writings: ${breakdown.writings.count} (${breakdown.writings.size}MB)\n` +
                `• Vocabulary: ${breakdown.words.count} words (${breakdown.words.size}MB)\n` +
                `• Media reflections: ${breakdown.media.count} (${breakdown.media.size}MB)\n\n` +
                `Consider deleting old items to free up space.\n` +
                `Tụlee ihichapụ ihe ochie iji mepee ohere.`;

            // Only show warning once per session
            if (!sessionStorage.getItem('storage-warning-shown')) {
                alert(message);
                sessionStorage.setItem('storage-warning-shown', 'true');
            }
        }
    } catch (e) {
        console.error('Error checking storage:', e);
    }
}

function handleStorageError() {
    const breakdown = getStorageBreakdown();
    const totalSize = getStorageSize();

    const message = `Storage Full! / Nchekwa Jupụtara!\n\n` +
        `You've used ${totalSize}MB and reached the limit.\n` +
        `I jirila ${totalSize}MB wee ruo oke.\n\n` +
        `Please delete some old recordings to continue:\n` +
        `Biko hichapụ ụfọdụ ndekọ ochie iji gaa n'ihu:\n\n` +
        `• Practice recordings: ${breakdown.recordings.count} items\n` +
        `• Writings: ${breakdown.writings.count} items\n` +
        `• Vocabulary: ${breakdown.words.count} words\n` +
        `• Media reflections: ${breakdown.media.count} items\n\n` +
        `Scroll down to see your past items and delete what you no longer need.\n` +
        `Gbanwee ala ka ịhụ ihe gara aga gị wee hichapụ ihe ị na-achọghị.`;

    alert(message);
}
