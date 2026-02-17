// --- CONFIGURATION ---
// ⚠️ อย่าลืมเอา Link CSV ของจริงมาใส่นะครับ!
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQoSVkChFzMNXmhOCFH123g0NN9w8GVXRuS2tz0Vd2uUbiN6X76Ux5_G4y7juCwqh2WmLlHc8loAVNH/pub?output=csv'; 

// --- MAIN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    loadMemories();
});

function loadMemories() {
    Papa.parse(SHEET_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            // กรองเอาเฉพาะแถวที่มีวันที่ (ป้องกันแถวว่างใน Sheet)
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
    container.innerHTML = ''; // Clear loading text

    data.forEach((item, index) => {
        // สลับซ้าย-ขวา
        const isLeft = index % 2 === 0;
        
        // Template Card
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

    // เริ่ม Animation หลังจาก Render เสร็จ
    animateTimeline();
}

function animateTimeline() {
    // 1. Animate Cards
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach((card) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%", // เริ่มเล่นเมื่อ Card โผล่มา
                toggleActions: "play none none reverse", // เลื่อนกลับแล้วเล่นใหม่
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)" // เด้งดึ๋งนิดนึง ให้น่ารัก
        });
    });

    // 2. Animate Hero Section
    gsap.from("#hero-content", {
        duration: 1.5, 
        y: -50, 
        opacity: 0, 
        ease: "elastic.out(1, 0.3)"
    });
    
    // --- LOVE BUTTON LOGIC ---
const loveBtn = document.getElementById('love-btn');
const loveCounter = document.getElementById('love-counter');
let clickCount = 0;

// โหลดจำนวนกดจากเครื่องตัวเอง (เก็บไว้ดูเล่นๆ)
if(localStorage.getItem('loveClicks')) {
    clickCount = parseInt(localStorage.getItem('loveClicks'));
    updateCounterDisplay();
}

loveBtn.addEventListener('click', (e) => {
    // 1. เพิ่มตัวเลข
    clickCount++;
    localStorage.setItem('loveClicks', clickCount);
    updateCounterDisplay();
    
    // โชว์ตัวเลขแป๊บนึงแล้วซ่อน
    loveCounter.classList.remove('opacity-0');
    setTimeout(() => loveCounter.classList.add('opacity-0'), 2000);

    // 2. เสกหัวใจ (Create Particle)
    createHeartParticle(e.clientX, e.clientY);
    
    // สั่นปุ่มนิดหน่อยเพิ่มฟีลลิ่ง
    gsap.fromTo(loveBtn, {scale: 0.8}, {scale: 1, duration: 0.1, ease: "back.out(4)"});
});

function updateCounterDisplay() {
    loveCounter.innerText = `${clickCount.toLocaleString()} Loves`;
}

function createHeartParticle(x, y) {
    const heart = document.createElement('div');
    const hearts = ['❤️', '💖', '💕', '🥰', '😍']; // สุ่มอีโมจิ
    heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    heart.classList.add('floating-heart');
    
    // สุ่มตำแหน่งนิดหน่อย ไม่ให้มันซ้อนกันเป๊ะ
    const randomX = (Math.random() - 0.5) * 50; 
    
    heart.style.left = `${x + randomX}px`;
    heart.style.top = `${y}px`;
    
    document.body.appendChild(heart);

    // ลบ Element ทิ้งเมื่อเล่นเสร็จ (ป้องกันเมมเต็ม)
    setTimeout(() => {
        heart.remove();
    }, 2000);
}

// --- VINYL PLAYER LOGIC ---
const vinylDisc = document.getElementById('vinyl-disc');
const bgMusic = document.getElementById('bg-music');
const tonearm = document.getElementById('tonearm');
let isPlaying = false;

vinylDisc.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        vinylDisc.classList.remove('playing-vinyl');
        tonearm.style.transform = 'rotate(-45deg)'; // ยกเข็มออก
    } else {
        bgMusic.play().catch(e => alert("กรุณากดที่หน้าจอก่อน 1 ครั้งเพื่อให้เพลงเล่นได้ครับ (Browser Policy)"));
        vinylDisc.classList.add('playing-vinyl');
        tonearm.style.transform = 'rotate(0deg)'; // วางเข็มลง
        
        // ปล่อยตัวโน้ตออกมาเรื่อยๆ
        startMusicNotes();
    }
    isPlaying = !isPlaying;
});

function startMusicNotes() {
    if(!isPlaying) return;
    
    // สร้างตัวโน้ตทุกๆ 0.5 วินาที
    setInterval(() => {
        if(isPlaying) createNote();
    }, 800);
}

function createNote() {
    const note = document.createElement('div');
    note.innerHTML = '🎵';
    note.classList.add('music-note');
    
    // ตำแหน่งเริ่มต้นที่แผ่นเสียง
    const rect = vinylDisc.getBoundingClientRect();
    note.style.left = `${rect.left + 20}px`;
    note.style.top = `${rect.top}px`;
    
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2000);
}
// --- SECRET CODE LOGIC ---
const title = document.querySelector('h1'); // เลือก H1 ที่เป็นชื่อหัวเว็บ
const secretModal = document.getElementById('secret-modal');
let tapCount = 0;
let tapTimer;

title.addEventListener('click', (e) => {
    // เอฟเฟกต์กดแล้วเด้งดึ๋ง
    gsap.fromTo(title, {scale: 0.9}, {scale: 1, duration: 0.2, ease: "elastic.out"});
    
    tapCount++;
    
    // รีเซ็ตถ้าไม่ได้กดต่อภายใน 0.5 วิ
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 500);

    // ถ้ากดครบ 5 ครั้ง
    if (tapCount === 5) {
        tapCount = 0;
        openSecretMode();
    }
});

function openSecretMode() {
    secretModal.classList.remove('hidden');
    
    // คำนวณวันคบกันเล่นๆ (สมมติเริ่ม 2025-10-19)
    const startDate = new Date('2025-10-19');
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    document.getElementById('uptime-counter').innerText = `${diffDays} Days running without crashing`;
    
    // Animation เปิด Terminal
    gsap.fromTo("#secret-modal > div", 
        {y: -100, opacity: 0}, 
        {y: 0, opacity: 1, duration: 0.5, ease: "power2.out"}
    );
}
}

