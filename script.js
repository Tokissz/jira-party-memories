// --- CONFIGURATION ---
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQoSVkChFzMNXmhOCFH123g0NN9w8GVXRuS2tz0Vd2uUbiN6X76Ux5_G4y7juCwqh2WmLlHc8loAVNH/pub?output=csv'; 
const YOUTUBE_VIDEO_ID = 'GhQxrCrVSyw'; // Until I Found You

// --- GLOBAL VARIABLES ---
var player;
var isPlayerReady = false;
var isPlaying = false;

// --- YOUTUBE API SETUP (ต้องอยู่ Global ห้ามย้ายเข้าข้างใน function) ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': YOUTUBE_VIDEO_ID
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    console.log("Music Player Ready! 🎵");
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo(); 
    }
}

// --- MAIN LOGIC (ทำงานเมื่อเว็บโหลดเสร็จ) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Init Libraries
    gsap.registerPlugin(ScrollTrigger);
    
    // 2. Load Data
    loadMemories();

    // 3. Setup Love Button
    setupLoveButton();

    // 4. Setup Vinyl Player
    setupVinylPlayer();

    // 5. Setup Secret Mode
    setupSecretMode();
});

// --- FUNCTION: LOAD MEMORIES ---
function loadMemories() {
    Papa.parse(SHEET_CSV_URL + '&t=' + Date.now(), {
        download: true,
        header: true,
        complete: function(results) {
            const validData = results.data.filter(item => item.Date);
            renderTimeline(validData);
        },
        error: function(err) {
            console.error("Error loading sheet:", err);
            document.getElementById('timeline-container').innerHTML = "โหลดข้อมูลไม่สำเร็จ 😭";
        }
    });
}

function renderTimeline(data) {
    const container = document.getElementById('timeline-container');
    container.innerHTML = ''; 

    data.forEach((item, index) => {
        const isLeft = index % 2 === 0;
        const html = `
            <div class="memory-card relative flex items-center w-full ${isLeft ? 'flex-row-reverse' : ''}">
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full border-4 border-white shadow-lg z-20"></div>
                <div class="w-1/2 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}">
                    <span class="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-bold mb-2 shadow-sm">
                        ${item.Date}
                    </span>
                    <div class="bg-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-pink-50 group">
                        <img src="${item.Image}" alt="${item.Title}" class="w-full h-auto object-cover rounded-lg mb-3 cursor-pointer group-hover:scale-[1.02] transition-transform duration-500">
                        <h3 class="text-xl font-bold text-gray-800">${item.Title}</h3>
                        <p class="text-gray-600 text-sm mt-2">${item.Caption}</p>
                    </div>
                </div>
                <div class="w-1/2"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
    animateTimeline();
}

function animateTimeline() {
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach((card) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    });

    gsap.from("#hero-content", {
        duration: 1.5, 
        y: -50, 
        opacity: 0, 
        ease: "elastic.out(1, 0.3)"
    });
}

// --- FUNCTION: LOVE BUTTON ---
function setupLoveButton() {
    const loveBtn = document.getElementById('love-btn');
    const loveCounter = document.getElementById('love-counter');
    let clickCount = 0;

    if(localStorage.getItem('loveClicks')) {
        clickCount = parseInt(localStorage.getItem('loveClicks'));
        loveCounter.innerText = `${clickCount.toLocaleString()} Loves`;
    }

    loveBtn.addEventListener('click', (e) => {
        clickCount++;
        localStorage.setItem('loveClicks', clickCount);
        loveCounter.innerText = `${clickCount.toLocaleString()} Loves`;
        
        loveCounter.classList.remove('opacity-0');
        setTimeout(() => loveCounter.classList.add('opacity-0'), 2000);

        createHeartParticle(e.clientX, e.clientY);
        gsap.fromTo(loveBtn, {scale: 0.8}, {scale: 1, duration: 0.1, ease: "back.out(4)"});
    });
}

function createHeartParticle(x, y) {
    const heart = document.createElement('div');
    const hearts = ['❤️', '💖', '💕', '🥰', '😍'];
    heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    heart.classList.add('floating-heart');
    
    const randomX = (Math.random() - 0.5) * 50; 
    heart.style.left = `${x + randomX}px`;
    heart.style.top = `${y}px`;
    
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
}

// --- FUNCTION: VINYL PLAYER ---
function setupVinylPlayer() {
    const vinylDisc = document.getElementById('vinyl-disc');
    const tonearm = document.getElementById('tonearm');

    vinylDisc.addEventListener('click', () => {
        if (!isPlayerReady) {
            alert("รอแป๊บนึงนะ กำลังโหลดแผ่นเสียง... ⏳");
            return;
        }

        if (isPlaying) {
            player.pauseVideo();
            vinylDisc.classList.remove('playing-vinyl');
            tonearm.style.transform = 'rotate(-45deg)'; 
        } else {
            player.playVideo();
            vinylDisc.classList.add('playing-vinyl');
            tonearm.style.transform = 'rotate(0deg)'; 
            startMusicNotes(vinylDisc);
        }
        isPlaying = !isPlaying;
    });
}

function startMusicNotes(vinylDisc) {
    // เช็คว่ามี Loop เก่าทำงานอยู่ไหมเพื่อไม่ให้ซ้อนกัน
    if (window.noteInterval) clearInterval(window.noteInterval);
    
    window.noteInterval = setInterval(() => {
        if(isPlaying) {
            const note = document.createElement('div');
            note.innerHTML = '🎵';
            note.classList.add('music-note');
            
            const rect = vinylDisc.getBoundingClientRect();
            note.style.left = `${rect.left + 20}px`;
            note.style.top = `${rect.top}px`;
            
            document.body.appendChild(note);
            setTimeout(() => note.remove(), 2000);
        }
    }, 800);
}

// --- FUNCTION: SECRET MODE ---
function setupSecretMode() {
    const title = document.querySelector('h1');
    const secretModal = document.getElementById('secret-modal');
    if (!title || !secretModal) return;

    let tapCount = 0;
    let tapTimer;

    title.addEventListener('click', () => {
        gsap.fromTo(title, {scale: 0.9}, {scale: 1, duration: 0.2, ease: "elastic.out"});
        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { tapCount = 0; }, 500);

        if (tapCount === 5) {
            tapCount = 0;
            openSecretMode(secretModal);
        }
    });
    
    // ปุ่มปิด Modal
    const closeBtn = secretModal.querySelector('button');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            secretModal.classList.add('hidden');
        });
    }
}

function openSecretMode(modal) {
    modal.classList.remove('hidden');
    
    const startDate = new Date('2025-10-19');
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const counter = document.getElementById('uptime-counter');
    if(counter) counter.innerText = `${diffDays} Days running without crashing`;
    
    gsap.fromTo(modal.firstElementChild, 
        {y: -100, opacity: 0}, 
        {y: 0, opacity: 1, duration: 0.5, ease: "power2.out"}
    );

}

