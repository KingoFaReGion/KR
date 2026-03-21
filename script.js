// Biến lưu trữ data thành viên load từ thư mục
let members = [];
const colorPalette = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#6366f1", "#9ca3af", "#06b6d4"];


// --- QUÉT & TẢI DATA TỪ THƯ MỤC members/ ---
async function loadDynamicMembers() {
    const fileNames = ['leader'];
    for (let i = 1; i <= 44; i++) {
        fileNames.push(`member${i}`);
    }


    let loadedCount = 0;


    for (const fileName of fileNames) {
        try {
            const response = await fetch(`members/${fileName}.html`);
            if (response.ok) {
                const htmlContent = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent.trim();
                const card = tempDiv.firstElementChild;
                
                if (card) {
                    const data = card.dataset;
                    const imgTag = card.querySelector('.avatar-container img');
                    
                    members.push({
                        name: data.name,
                        id: data.id,
                        avatar: imgTag ? imgTag.src : '',
                        personalImg: data.pfimg,
                        zalo: data.zalo,
                        desc: data.desc,
                        slogan: data.slogan,
                        guns: data.guns,
                        drive: data.storage,
                        role: fileName === 'leader' ? "CHỦ TEAM" : (data.role || null),
                        hex: colorPalette[loadedCount % colorPalette.length]
                    });
                    loadedCount++;
                }
            }
        } catch (error) {
            // Lỗi hoặc không có file thì bỏ qua
            continue;
        }
    }


    // Sau khi quét xong data, render UI và khởi tạo hiệu ứng
    renderMembers();
    initWheel();
    initParticles();
}


// --- LOADING SCREEN LOGIC ---
let globalLoadTimeout;
let memberLoadTimeout;


function startGlobalLoad() {
    const loader = document.getElementById('global-loader');
    const bar = document.getElementById('global-bar');
    
    bar.style.transition = 'none';
    bar.style.width = '0%';
    
    setTimeout(() => {
        bar.style.transition = 'width 5s linear';
        bar.style.width = '100%';
    }, 100);


    globalLoadTimeout = setTimeout(() => {
        skipGlobalLoad();
    }, 5000);
}


function skipGlobalLoad() {
    const loader = document.getElementById('global-loader');
    const bar = document.getElementById('global-bar');
    
    clearTimeout(globalLoadTimeout);
    bar.style.transition = 'width 0.2s ease';
    bar.style.width = '100%';
    
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 300);
}


// --- MEMBER LOAD LOGIC ---
function startMemberLoad(index) {
    const member = members[index];
    const loader = document.getElementById('member-loader');
    const bar = document.getElementById('member-bar');
    const text = document.getElementById('member-loading-text');
    
    loader.classList.remove('hidden');
    text.innerText = `LOADING ${member.name.toUpperCase()}...`;
    
    bar.style.transition = 'none';
    bar.style.width = '0%';
    
    // Tải trước ảnh để profile mở lên mượt hơn
    const preloader = new Image();
    preloader.src = member.personalImg;
    
    setTimeout(() => {
        bar.style.transition = 'width 7s linear';
        bar.style.width = '100%';
    }, 100);


    memberLoadTimeout = setTimeout(() => {
        cancelMemberLoad(); 
        openProfile(index); 
    }, 7000);
}


function cancelMemberLoad() {
    const loader = document.getElementById('member-loader');
    clearTimeout(memberLoadTimeout);
    loader.classList.add('hidden');
}


// --- RENDER MEMBERS (Giao diện mới) ---
function renderMembers() {
    const container = document.getElementById('members-container');
    let html = '';


    members.forEach((member, index) => {
        const isEven = index % 2 === 0;
        const flexClasses = isEven ? 'md:flex-row' : 'md:flex-row-reverse';
        const marginContent = isEven ? 'md:pl-16' : 'md:pr-16';
        const textDetail = isEven ? 'text-left' : 'md:text-right text-left';
        const shadowColor = hexToRgb(member.hex);
        const crown = member.role ? `<div class="absolute -top-4 -left-4 bg-gradient-to-r from-yellow-400 to-red-500 text-white border border-yellow-300 font-bold px-3 py-1 rounded shadow-lg z-20 animate-bounce"><i class="fa-solid fa-crown"></i> ${member.role}</div>` : '';


        html += `
        <div class="member-card reveal-on-scroll flex flex-col ${flexClasses} items-center group relative p-4" onclick="startMemberLoad(${index})" style="--shadow-color: ${shadowColor}; cursor: pointer;">
            
            <div class="w-full max-w-[280px] md:max-w-[320px] shrink-0 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                <div class="tech-border-wrapper relative bg-transparent" style="--shadow-color: ${member.hex}">
                    <div class="tech-border-frame bg-red-950">
                        <div class="tech-border-inner" style="background: ${member.hex}">
                             <div class="absolute inset-[2px] bg-black" style="clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);">
                                <img src="${member.avatar}" alt="${member.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100">
                                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-900/60"></div>
                                ${crown}
                             </div>
                        </div>
                    </div>
                    <div class="absolute bottom-6 left-0 w-full text-center md:hidden z-30">
                        <h3 class="text-2xl font-gaming font-bold text-white drop-shadow-md text-shadow-glow">${member.name}</h3>
                    </div>
                </div>
            </div>


            <div class="w-full md:w-auto flex-1 mt-6 md:mt-0 ${marginContent} relative z-10">
                <div class="glass-panel p-8 md:p-10 relative overflow-hidden rounded-2xl group-hover:bg-red-900/20 transition-colors">
                    <div class="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[${member.hex}] to-transparent ${isEven ? 'left-0' : 'right-0'}"></div>
                    
                    <div class="${textDetail} space-y-2">
                        <h2 class="text-3xl md:text-5xl font-gaming font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(${shadowColor},0.5)] group-hover:text-yellow-400 transition-colors">
                            ${member.name}
                        </h2>
                        <p class="text-yellow-500 font-mono text-lg tracking-widest border-b border-red-800 inline-block pb-1">
                            UID: ${member.id}
                        </p>
                        <p class="text-gray-300 mt-4 line-clamp-2 md:line-clamp-none italic">
                            "${member.desc}"
                        </p>
                        <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-yellow-500 font-bold">
                            <i class="fa-solid fa-crosshairs animate-spin-slow"></i> XEM HỒ SƠ
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
    initScrollObserver();
}


// --- PARTICLE SYSTEM (HOA RƠI) ---
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    const blossomColors = ['#FF69B4', '#FFC0CB', '#FFD700', '#FFA500'];


    class Blossom {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height; 
            this.size = Math.random() * 3 + 2; 
            this.speedY = Math.random() * 1 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.color = blossomColors[Math.floor(Math.random() * blossomColors.length)];
            this.opacity = Math.random() * 0.5 + 0.3;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.02;
        }
        update() {
            this.y += this.speedY;
            this.x += Math.sin(this.wobble) * 0.5; 
            this.wobble += this.wobbleSpeed;


            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size, this.size * 0.8, this.wobble, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }


    function init() {
        particles = [];
        for (let i = 0; i < 150; i++) { 
            particles.push(new Blossom());
        }
    }


    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }


    init();
    animate();


    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });
}


// --- SCROLL ANIMATION OBSERVER ---
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 }); 


    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        observer.observe(el);
    });
}


function formatScrollingText(text) {
    if (!text) return "";
    return text.split(/,|，/).map(seg => `<span class="mx-6 inline-block">${seg.trim()}</span>`).join(' • ');
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
}


// --- WHEEL LOGIC ---
let wheelCanvas, ctx;
let startAngle = 0;
let arc;
let spinTimeout = null;
let spinArcStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;
let isSpinning = false;


function initWheel() {
    if(members.length === 0) return;
    arc = Math.PI / (members.length / 2);
    wheelCanvas = document.getElementById("wheel-canvas");
    ctx = wheelCanvas.getContext("2d");
    drawRouletteWheel();
}


function drawRouletteWheel() {
    if (!wheelCanvas) return;
    const outsideRadius = 165; 
    const textRadius = 130;
    const insideRadius = 40;


    ctx.clearRect(0,0,350,350);
    ctx.font = 'bold 14px Rajdhani, sans-serif';
    ctx.shadowBlur = 0;


    for(let i = 0; i < members.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = members[i].hex;
        
        ctx.beginPath();
        ctx.arc(175, 175, outsideRadius, angle, angle + arc, false);
        ctx.arc(175, 175, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();


        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "white";
        ctx.translate(175 + Math.cos(angle + arc / 2) * textRadius, 175 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = members[i].name;
        const dispText = text.length > 12 ? text.substring(0, 10) + ".." : text;
        ctx.fillText(dispText, -ctx.measureText(dispText).width / 2, 0);
        ctx.restore();
    }
}


function spinWheel() {
    if(isSpinning || members.length === 0) return;
    isSpinning = true;
    document.getElementById('spin-btn').classList.add('opacity-50', 'cursor-not-allowed');
    document.getElementById('winner-text').innerText = "ĐANG TÌM NGƯỜI MAY MẮN...";
    
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
}


function rotateWheel() {
    spinTime += 30;
    if(spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = requestAnimationFrame(rotateWheel);
}


function stopRotateWheel() {
    isSpinning = false;
    document.getElementById('spin-btn').classList.remove('opacity-50', 'cursor-not-allowed');
    
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const winner = members[index % members.length];
    
    const winText = document.getElementById('winner-text');
    winText.innerHTML = `LÌ XÌ CHO: <span style="color:${winner.hex}">${winner.name}</span>`;
    
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#FFD700', '#FFFFFF']
    });


    setTimeout(() => {
        toggleWheelModal();
        openProfile(index % members.length);
        winText.innerText = "";
    }, 2500);
}


function easeOut(t, b, c, d) {
    const ts = (t/=d)*t;
    const tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
}


// --- MODAL CONTROLS ---
function toggleWheelModal() {
    const modal = document.getElementById('wheel-modal');
    modal.classList.toggle('active');
    if(modal.classList.contains('active')) initWheel();
}


function openProfile(index) {
    const member = members[index];
    const modal = document.getElementById('profile-modal');
    
    const modalImg = document.getElementById('modal-img');
    modalImg.src = member.personalImg;
    document.getElementById('modal-img-link').href = member.zalo;
    document.getElementById('modal-name').innerText = member.name;
    
    const badge = document.getElementById('modal-role-badge');
    badge.innerHTML = member.role ? 
        `<span class="bg-yellow-500 text-red-900 font-bold px-3 py-1 rounded shadow-lg uppercase tracking-wider"><i class="fa-solid fa-crown"></i> ${member.role}</span>` 
        : `<span class="bg-red-800 text-white px-3 py-1 rounded uppercase text-sm">Thành viên cốt cán</span>`;


    document.getElementById('modal-slogan').innerHTML = formatScrollingText(member.slogan);
    document.getElementById('modal-guns').innerHTML = formatScrollingText(member.guns);
    document.getElementById('modal-desc').innerText = member.desc;
    document.getElementById('modal-drive').href = member.drive;


    modal.classList.add('active');
}


function closeProfile() {
    document.getElementById('profile-modal').classList.remove('active');
}


function toggleCultureModal() {
    document.getElementById('culture-modal').classList.toggle('active');
}


function openLightbox(src) {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    if(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }
}


function closeLightbox() {
    document.getElementById('lightbox-modal').classList.remove('active');
}


// INIT & LISTENERS
window.onload = function() {
    startGlobalLoad(); 
    loadDynamicMembers(); // Bắt đầu quét file HTML động
};


window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        if(event.target.id === 'lightbox-modal') {
            closeLightbox();
        } else {
            event.target.classList.remove('active');
        }
    }
}
