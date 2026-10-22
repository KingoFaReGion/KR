let members = [];
let currentAudio = null;
let globalLoadTimeout, memberLoadTimeout;

const colorPalette = [
    "#ff6b00", "#a855f7", "#22c55e", "#fbbf24", "#ec4899",
    "#f97316", "#c084fc", "#ef4444", "#4ade80", "#f59e0b"
];

const isMobileDevice = window.innerWidth < 768;

const candyTemplates = [
    `<svg viewBox="0 0 48 28" class="w-8 h-5"><polygon points="2,6 12,14 2,22" fill="#a855f7"/><polygon points="46,6 36,14 46,22" fill="#a855f7"/><rect x="10" y="5" width="28" height="18" rx="9" fill="#ff6b00" stroke="#fff" stroke-width="1.2"/><path d="M18 5 L14 23 M26 5 L22 23 M34 5 L30 23" stroke="#fde047" stroke-width="2.2"/></svg>`,
    `<svg viewBox="0 0 36 48" class="w-7 h-9"><line x1="18" y1="24" x2="18" y2="46" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="16" r="13" fill="#ec4899" stroke="#fff" stroke-width="1.5"/><path d="M18 16 m0 0 a4 4 0 1 0 4 4 a8 8 0 1 1 -8 -8 a11 11 0 1 0 11 11" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 32 38" class="w-6 h-7"><path d="M16 2 L29 32 Q16 37 3 32 Z" fill="#facc15"/><path d="M16 2 L25 23 L7 23 Z" fill="#ff6b00"/><path d="M16 2 L20 12 L12 12 Z" fill="#ffffff"/></svg>`,
    `<span class="text-2xl">🍬</span>`,
    `<span class="text-2xl">🍭</span>`,
    `<span class="text-2xl">🍫</span>`,
    `<span class="text-xl">🎃</span>`
];

const sparkColors = ['#ff6b00', '#a855f7', '#22c55e', '#fbbf24', '#ec4899'];
const CANDY_POOL_SIZE = isMobileDevice ? 22 : 36;
const SPARK_POOL_SIZE = isMobileDevice ? 14 : 24;

const candyPool = [];
const sparkPool = [];
let candyCursor = 0;
let sparkCursor = 0;
let fxLoopRunning = false;
let lastPointerTime = 0;

function initCandyPool() {
    let fxLayer = document.getElementById('candy-fx-layer');
    if (!fxLayer) {
        fxLayer = document.createElement('div');
        fxLayer.id = 'candy-fx-layer';
        document.body.appendChild(fxLayer);
    }
    fxLayer.innerHTML = '';
    candyPool.length = 0;
    sparkPool.length = 0;

    for (let i = 0; i < CANDY_POOL_SIZE; i++) {
        const el = document.createElement('div');
        el.className = 'candy-drop-item';
        el.innerHTML = candyTemplates[i % candyTemplates.length];
        fxLayer.appendChild(el);
        candyPool.push({
            el,
            active: false,
            x: -999,
            y: -999,
            vx: 0,
            vy: 0,
            gravity: 0.35,
            rotation: 0,
            vr: 0,
            scale: 1,
            frame: 0,
            maxFrames: 85
        });
    }

    for (let i = 0; i < SPARK_POOL_SIZE; i++) {
        const el = document.createElement('div');
        el.className = 'halloween-spark';
        el.style.background = sparkColors[i % sparkColors.length];
        fxLayer.appendChild(el);
        sparkPool.push({
            el,
            active: false,
            x: -999,
            y: -999,
            vx: 0,
            vy: 0,
            frame: 0,
            maxFrames: 24
        });
    }
}

function handleInteraction(e) {
    const now = performance.now();
    if (now - lastPointerTime < 65) return;
    const x = e.clientX;
    const y = e.clientY;
    if (x === undefined || y === undefined) return;
    lastPointerTime = now;
    createCandyBurst(x, y);
}

document.addEventListener('pointerdown', handleInteraction, { passive: true });

function createCandyBurst(x, y) {
    if (candyPool.length === 0) initCandyPool();

    const sparkCount = isMobileDevice ? 4 : 5;
    for (let i = 0; i < sparkCount; i++) {
        const sp = sparkPool[sparkCursor];
        sparkCursor = (sparkCursor + 1) % SPARK_POOL_SIZE;
        const angle = (i / sparkCount) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 2.2 + Math.random() * 2.4;
        sp.active = true;
        sp.x = x - 3;
        sp.y = y - 3;
        sp.vx = Math.cos(angle) * speed;
        sp.vy = Math.sin(angle) * speed;
        sp.frame = 0;
        sp.maxFrames = 20 + Math.floor(Math.random() * 6);
    }

    const numCandies = isMobileDevice ? 5 : 7;
    for (let i = 0; i < numCandies; i++) {
        const c = candyPool[candyCursor];
        candyCursor = (candyCursor + 1) % CANDY_POOL_SIZE;
        c.active = true;
        c.x = x - 12;
        c.y = y - 12;
        c.vx = (Math.random() - 0.5) * 8.5;
        c.vy = -(Math.random() * 6.5 + 3.2);
        c.gravity = 0.34 + Math.random() * 0.1;
        c.rotation = Math.random() * 360;
        c.vr = (Math.random() - 0.5) * 13;
        c.scale = 0.8 + Math.random() * 0.38;
        c.frame = 0;
        c.maxFrames = 78 + Math.floor(Math.random() * 20);
    }

    if (!fxLoopRunning) {
        fxLoopRunning = true;
        requestAnimationFrame(updateCandiesLoop);
    }
}

function updateCandiesLoop() {
    let anyActive = false;
    const floorY = window.innerHeight - 34;

    for (let i = 0; i < SPARK_POOL_SIZE; i++) {
        const sp = sparkPool[i];
        if (!sp.active) continue;
        sp.frame++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        const op = 1 - sp.frame / sp.maxFrames;
        if (sp.frame >= sp.maxFrames || op <= 0) {
            sp.active = false;
            sp.el.style.opacity = '0';
            sp.el.style.transform = 'translate3d(-999px, -999px, 0)';
        } else {
            anyActive = true;
            sp.el.style.opacity = op.toFixed(2);
            sp.el.style.transform = `translate3d(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px, 0)`;
        }
    }

    for (let i = 0; i < CANDY_POOL_SIZE; i++) {
        const c = candyPool[i];
        if (!c.active) continue;
        c.frame++;
        c.x += c.vx;
        c.vy += c.gravity;
        c.y += c.vy;
        c.rotation += c.vr;

        if (c.y > floorY && c.vy > 0) {
            c.y = floorY;
            c.vy = -c.vy * 0.42;
            c.vx *= 0.72;
        }

        let opacity = 1;
        if (c.frame > c.maxFrames - 20) {
            opacity = Math.max(0, (c.maxFrames - c.frame) / 20);
        }

        if (c.frame >= c.maxFrames || opacity <= 0) {
            c.active = false;
            c.el.style.opacity = '0';
            c.el.style.transform = 'translate3d(-999px, -999px, 0)';
        } else {
            anyActive = true;
            c.el.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0) rotate(${c.rotation.toFixed(1)}deg) scale(${c.scale.toFixed(2)})`;
            c.el.style.opacity = opacity.toFixed(2);
        }
    }

    if (anyActive) {
        requestAnimationFrame(updateCandiesLoop);
    } else {
        fxLoopRunning = false;
    }
}

const halloweenPropSVGs = {
    bat: `<svg viewBox="0 0 64 32" class="w-10 h-6 bat-wing-anim"><path d="M32 18 C26 8, 14 4, 2 10 C8 16, 12 22, 18 20 C22 25, 27 24, 32 22 C37 24, 42 25, 46 20 C52 22, 56 16, 62 10 C50 4, 38 8, 32 18 Z" fill="#1e0936" stroke="#a855f7" stroke-width="1.3"/><circle cx="29" cy="15" r="1.4" fill="#ff6b00"/><circle cx="35" cy="15" r="1.4" fill="#ff6b00"/></svg>`,
    broom: `<svg viewBox="0 0 90 32" class="w-14 h-6 animate-broom"><line x1="25" y1="16" x2="86" y2="16" stroke="#b45309" stroke-width="3.5" stroke-linecap="round"/><path d="M4 8 Q16 12 26 16 Q16 20 4 24 Q9 16 4 8 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1"/><rect x="23" y="12" width="4" height="8" rx="1" fill="#a855f7"/></svg>`,
    pumpkin: `<span class="text-2xl md:text-3xl animate-pumpkin inline-block">🎃</span>`,
    cauldron: `<svg viewBox="0 0 48 48" class="w-9 h-9"><ellipse cx="24" cy="18" rx="14" ry="4" fill="#22c55e"/><path d="M10 18 C6 30, 12 42, 24 42 C36 42, 42 30, 38 18 Z" fill="#1f2937" stroke="#4ade80" stroke-width="1.2"/><circle cx="20" cy="12" r="2.5" fill="#4ade80" class="cauldron-bubble"/><circle cx="28" cy="10" r="2" fill="#a855f7" class="cauldron-bubble" style="animation-delay:0.5s"/></svg>`,
    scythe: `<svg viewBox="0 0 48 48" class="w-9 h-9"><line x1="10" y1="42" x2="36" y2="8" stroke="#9ca3af" stroke-width="2.8" stroke-linecap="round"/><path d="M35 9 C22 4, 10 8, 6 20 C16 14, 26 14, 33 16 Z" fill="#e2e8f0" stroke="#ef4444" stroke-width="1"/></svg>`,
    witchHat: `<svg viewBox="0 0 48 42" class="w-9 h-8"><polygon points="24,2 11,32 37,32" fill="#2e1065" stroke="#a855f7" stroke-width="1.2"/><rect x="14" y="28" width="20" height="4" fill="#ff6b00"/><ellipse cx="24" cy="34" rx="20" ry="5" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/></svg>`
};

const skyEntities = [];
const swarmPool = [];
const SWARM_POOL_SIZE = isMobileDevice ? 6 : 10;

function initHalloweenSkyEntities() {
    const skyLayer = document.getElementById('halloween-sky-layer');
    if (!skyLayer) return;
    skyLayer.innerHTML = '';
    skyEntities.length = 0;

    const propKeys = ['bat', 'bat', 'broom', 'pumpkin', 'cauldron', 'scythe', 'witchHat', 'bat'];
    const totalEntities = isMobileDevice ? 8 : 14;

    for (let i = 0; i < totalEntities; i++) {
        const el = document.createElement('div');
        const key = propKeys[i % propKeys.length];
        el.className = 'sky-entity';
        el.innerHTML = halloweenPropSVGs[key];
        skyLayer.appendChild(el);

        const speedX = (Math.random() * 1.1 + 0.45) * (Math.random() > 0.5 ? 1 : -1);
        skyEntities.push({
            el,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            speedX,
            flip: speedX < 0 ? -1 : 1,
            waveAmp: Math.random() * 0.9 + 0.35,
            waveFreq: Math.random() * 0.018 + 0.01,
            angle: Math.random() * Math.PI * 2,
            scale: (0.68 + Math.random() * 0.45).toFixed(2)
        });
    }

    const modalFxLayer = document.getElementById('halloween-modal-fx-layer');
    if (modalFxLayer) {
        modalFxLayer.innerHTML = '';
        swarmPool.length = 0;
        const swarmIcons = ['🦇', '🎃', '🧹', '🍬', '🍭', '🦇', '🧪', '🕯️'];
        for (let i = 0; i < SWARM_POOL_SIZE; i++) {
            const item = document.createElement('div');
            item.className = 'sky-entity text-2xl md:text-3xl';
            item.style.opacity = '0';
            item.style.transform = 'translate3d(-999px, -999px, 0)';
            item.innerText = swarmIcons[i % swarmIcons.length];
            modalFxLayer.appendChild(item);
            swarmPool.push({
                el: item,
                active: false,
                x: -999,
                y: -999,
                vx: 0,
                vy: 0,
                step: 0,
                maxSteps: 95
            });
        }
    }
}

function triggerHalloweenProfileSwarm() {
    for (let i = 0; i < swarmPool.length; i++) {
        const sw = swarmPool[i];
        const fromLeft = i % 2 === 0;
        sw.active = true;
        sw.x = fromLeft ? -50 : window.innerWidth + 50;
        sw.y = Math.random() * (window.innerHeight * 0.8) + 40;
        sw.vx = (fromLeft ? 1 : -1) * (Math.random() * 5.5 + 4.5);
        sw.vy = (Math.random() - 0.5) * 2.2;
        sw.step = 0;
        sw.maxSteps = 95;
    }
}

function init3DTilt() {
    if (isMobileDevice || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const tiltCards = document.querySelectorAll('.tilt-effect');
    tiltCards.forEach(card => {
        let rafPending = false;
        card.addEventListener('mousemove', e => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -4.5;
                const rotateY = ((x - centerX) / centerX) * 4.5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
                rafPending = false;
            });
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

async function loadDynamicMembers() {
    const fileNames = ['leader'];
    for (let i = 1; i <= 44; i++) {
        fileNames.push(`member${i}`);
    }

    const parser = new DOMParser();
    const fetchPromises = fileNames.map(async (fileName, index) => {
        try {
            const response = await fetch(`members/${fileName}.html`);
            if (response.ok) {
                const htmlContent = await response.text();
                const doc = parser.parseFromString(htmlContent.trim(), 'text/html');
                const card = doc.body.firstElementChild;
                if (card) {
                    const data = card.dataset;
                    const imgTag = card.querySelector('.avatar-container img');
                    const rawAvatar = imgTag ? imgTag.getAttribute('src') : '';

                    return {
                        name: data.name || '',
                        id: data.id || '',
                        avatar: rawAvatar || '',
                        personalImg: data.pfimg || rawAvatar || '',
                        zalo: data.zalo || '#',
                        desc: data.desc || '',
                        slogan: data.slogan || '',
                        guns: data.guns || '',
                        drive: data.storage || '#',
                        role: fileName === 'leader' ? "CHỦ TEAM" : (data.role || null),
                        hex: colorPalette[index % colorPalette.length]
                    };
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải", fileName, error);
        }
        return null;
    });

    const results = await Promise.all(fetchPromises);
    members = results.filter(member => member !== null);

    if (members.length === 0) {
        const svgAvatar1 = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f0836"/><stop offset="50%" stop-color="#3b0a45"/><stop offset="100%" stop-color="#090212"/></linearGradient></defs><rect width="360" height="640" fill="url(#g1)"/><circle cx="180" cy="210" r="95" fill="#ff6b00" opacity="0.25"/><text x="180" y="235" font-size="110" text-anchor="middle">🎃</text><text x="180" y="370" font-size="28" font-family="sans-serif" font-weight="bold" fill="#ff9e00" text-anchor="middle">THE BÁO</text><text x="180" y="415" font-size="18" font-family="monospace" fill="#e9d5ff" text-anchor="middle">KingoFaReGion</text></svg>`);
        const svgAvatar2 = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#14052b"/><stop offset="50%" stop-color="#2d0c52"/><stop offset="100%" stop-color="#05010a"/></linearGradient></defs><rect width="360" height="640" fill="url(#g2)"/><circle cx="180" cy="210" r="95" fill="#a855f7" opacity="0.25"/><text x="180" y="235" font-size="110" text-anchor="middle">🧙‍♀️</text><text x="180" y="370" font-size="28" font-family="sans-serif" font-weight="bold" fill="#c084fc" text-anchor="middle">WARRIOR</text><text x="180" y="415" font-size="18" font-family="monospace" fill="#bbf7d0" text-anchor="middle">KingoFaReGion</text></svg>`);
        members = [
            {
                name: "THE BÁO",
                id: "5123456789",
                avatar: svgAvatar1,
                personalImg: svgAvatar1,
                zalo: "https://zalo.me/g/eipdae678",
                desc: "Chủ quân đoàn Gia Đình Nhìu Chiện - KingoFaReGion.",
                slogan: "Chạy bo mỗi tối, Vui vẻ không quạu, Chiến hết mình cùng anh em",
                guns: "M416, AWM, Kar98k, Beryl M762",
                drive: "https://photos.app.goo.gl/xz763ZtwfMHn6JGt7",
                role: "CHỦ TEAM",
                hex: colorPalette[0]
            },
            {
                name: "THÀNH VIÊN CLAN",
                id: "5987654321",
                avatar: svgAvatar2,
                personalImg: svgAvatar2,
                zalo: "https://zalo.me/g/eipdae678",
                desc: "Chiến thần săn thính đêm trăng máu, chuyên gia gánh team vòng bo cuối.",
                slogan: "Có phúc cùng hưởng, có địch cùng công, Uy tín số 1",
                guns: "AKM, AUG A3, Mini14, UMP45",
                drive: "https://photos.app.goo.gl/xz763ZtwfMHn6JGt7",
                role: null,
                hex: colorPalette[1]
            }
        ];
    }

    initCandyPool();
    renderMembers();
    initHalloweenSkyEntities();
    initMasterAmbientLoop();
}

function startGlobalLoad() {
    const bar = document.getElementById('global-bar');
    if (!bar) return;
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
    if (bar) {
        bar.style.transition = 'width 0.2s ease';
        bar.style.width = '100%';
    }
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 300);
    }
}

function prepareModalImage(member) {
    const modalImg = document.getElementById('modal-img');
    if (!modalImg || !member) return;

    const primarySrc = (member.personalImg && member.personalImg.trim() !== '') ? member.personalImg : member.avatar;
    const fallbackSrc = member.avatar || '';

    modalImg.onerror = null;
    modalImg.onload = null;

    modalImg.onerror = function () {
        this.onerror = null;
        if (fallbackSrc && this.getAttribute('src') !== fallbackSrc) {
            this.src = fallbackSrc;
        }
    };

    if (modalImg.getAttribute('src') !== primarySrc) {
        modalImg.src = primarySrc;
    }
}

function startMemberLoad(index) {
    clearTimeout(memberLoadTimeout);
    const member = members[index];
    if (!member) return;

    const loader = document.getElementById('member-loader');
    const bar = document.getElementById('member-bar');
    document.getElementById('member-loading-text').innerText = `CONNECTING TO ${member.name.toUpperCase()}...`;

    prepareModalImage(member);
    triggerHalloweenProfileSwarm();

    loader.classList.remove('hidden');
    bar.style.transition = 'none';
    bar.style.width = '0%';

    setTimeout(() => {
        bar.style.transition = 'width 3s linear';
        bar.style.width = '100%';
    }, 100);

    memberLoadTimeout = setTimeout(() => {
        cancelMemberLoad();
        openProfile(index);
    }, 3000);
}

function cancelMemberLoad() {
    clearTimeout(memberLoadTimeout);
    document.getElementById('member-loader').classList.add('hidden');
}

function renderMembers() {
    const container = document.getElementById('members-container');
    if (!container) return;
    let html = '';
    const cardProps = ['🎃', '🧹', '🦇', '🧪', '🕯️', '💀'];

    members.forEach((member, index) => {
        const isEven = index % 2 === 0;
        const flexClasses = isEven ? 'md:flex-row' : 'md:flex-row-reverse';
        const marginContent = isEven ? 'md:pl-16' : 'md:pr-16';
        const textDetail = isEven ? 'text-left' : 'md:text-right text-left';
        const shadowColor = hexToRgb(member.hex);
        const propIcon = cardProps[index % cardProps.length];
        const crown = member.role
            ? `<div class="absolute -top-4 -left-4 bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600 text-white border border-orange-200 font-bold px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(255,107,0,0.8)] z-20 animate-bounce">🎃 <i class="fa-solid fa-crown"></i> ${member.role}</div>`
            : '';

        html += `
        <div class="member-card reveal-on-scroll flex flex-col ${flexClasses} items-center group relative p-4" onclick="startMemberLoad(${index})" style="--shadow-color: ${shadowColor}; cursor: crosshair;">
            <div class="w-full max-w-[280px] md:max-w-[320px] shrink-0 z-20 transition-transform duration-500 group-hover:-translate-y-2 relative tilt-effect">
                <div class="absolute -top-5 -right-4 z-30 text-3xl animate-pumpkin pointer-events-none">🎃</div>
                <div class="absolute -bottom-4 ${isEven ? '-left-4' : '-right-4'} z-30 text-3xl animate-broom pointer-events-none">🧹</div>
                <div class="absolute top-1/2 -translate-y-1/2 ${isEven ? '-left-6' : '-right-6'} z-30 text-2xl bat-wing-anim pointer-events-none opacity-80 group-hover:opacity-100">🦇</div>

                <div class="tech-border-wrapper relative bg-transparent" style="--shadow-color: ${member.hex}">
                    <div class="tech-border-frame">
                        <div class="tech-border-inner avatar-flashing-border bg-black">
                             <div class="absolute inset-[3px] bg-black" style="clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);">
                                 <img src="${member.avatar}" alt="${member.name}" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100">
                                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-950/70 pointer-events-none"></div>
                                ${crown}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full md:w-auto flex-1 mt-6 md:mt-0 ${marginContent} relative z-10 tilt-effect">
                <div class="glass-panel p-8 md:p-10 relative overflow-hidden rounded-2xl transition-colors">
                    <svg viewBox="0 0 100 100" class="absolute top-0 ${isEven ? 'right-0 scale-x-[-1]' : 'left-0'} w-24 h-24 stroke-orange-300/25 fill-none pointer-events-none" stroke-width="1.2">
                        <line x1="0" y1="0" x2="100" y2="15"/><line x1="0" y1="0" x2="85" y2="55"/><line x1="0" y1="0" x2="55" y2="85"/><line x1="0" y1="0" x2="15" y2="100"/>
                        <path d="M35 5 Q28 28 5 35"/><path d="M70 10 Q55 55 10 70"/>
                    </svg>

                    <div class="absolute top-3 ${isEven ? 'right-4' : 'left-4'} flex items-center gap-2 text-lg opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span class="bat-wing-anim">🦇</span>
                        <span class="animate-broom">🧹</span>
                        <span>${propIcon}</span>
                    </div>

                    <div class="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-[${member.hex}] to-transparent ${isEven ? 'left-0' : 'right-0'}"></div>
                    
                    <div class="${textDetail} space-y-2 relative z-20">
                        <h2 class="text-3xl md:text-5xl font-gaming font-bold uppercase tracking-wider transition-all duration-300 transform group-hover:scale-105" 
                            style="color: ${member.hex}; text-shadow: 2px 2px 4px rgba(0,0,0,0.95), -1px -1px 2px rgba(0,0,0,0.95), 0 0 18px ${member.hex};">
                            ${member.name}
                        </h2>
                        <p class="text-orange-300 font-mono text-lg tracking-widest border-b border-orange-400/30 inline-block pb-1 drop-shadow-md">
                            🎃 UID: ${member.id}
                        </p>
                        <p class="text-gray-100 mt-4 line-clamp-2 italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">"${member.desc}"</p>
                        <div class="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-orange-300 font-bold drop-shadow-md flex items-center ${isEven ? 'justify-start' : 'md:justify-end justify-start'} gap-2">
                            <span>🧹</span>
                            <i class="fa-solid fa-crosshairs animate-pulse"></i>
                            <span>XEM HỒ SƠ</span>
                            <span class="bat-wing-anim">🦇</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
    initScrollObserver();
    init3DTilt();
}

function initMasterAmbientLoop() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const halloweenColors = ['#ff6b00', '#a855f7', '#fbbf24', '#22c55e', '#ef4444'];
    const orbCount = isMobileDevice ? 22 : 42;

    class SpookyOrb {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 2.2 + 1;
            this.speedY = -(Math.random() * 0.65 + 0.25);
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.color = halloweenColors[Math.floor(Math.random() * halloweenColors.length)];
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < -10) {
                this.y = canvas.height + 10;
                this.x = Math.random() * canvas.width;
            }
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.x < -10) this.x = canvas.width + 10;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity * 0.22;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initOrbs() {
        particles = [];
        for (let i = 0; i < orbCount; i++) {
            particles.push(new SpookyOrb());
        }
    }

    function masterTick() {
        if (!document.hidden) {
            const w = canvas.width;
            const h = canvas.height;
            const modalOpen = document.body.classList.contains('modal-open');

            if (!modalOpen) {
                ctx.clearRect(0, 0, w, h);
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();
                }
                ctx.globalAlpha = 1.0;

                for (let i = 0; i < skyEntities.length; i++) {
                    const s = skyEntities[i];
                    s.x += s.speedX;
                    s.angle += s.waveFreq;
                    s.y += Math.sin(s.angle) * s.waveAmp;

                    if (s.x > w + 70) s.x = -60;
                    if (s.x < -70) s.x = w + 60;
                    if (s.y > h + 50) s.y = -40;
                    if (s.y < -50) s.y = h + 40;

                    s.el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) scale(${s.scale}) scaleX(${s.flip})`;
                }
            }

            for (let i = 0; i < swarmPool.length; i++) {
                const sw = swarmPool[i];
                if (!sw.active) continue;
                sw.step++;
                sw.x += sw.vx;
                sw.y += sw.vy + Math.sin(sw.step * 0.16) * 2.2;
                const rot = Math.sin(sw.step * 0.2) * 16;
                const op = sw.step > sw.maxSteps - 25 ? Math.max(0, (sw.maxSteps - sw.step) / 25) : 1;

                if (sw.step >= sw.maxSteps || op <= 0) {
                    sw.active = false;
                    sw.el.style.opacity = '0';
                    sw.el.style.transform = 'translate3d(-999px, -999px, 0)';
                } else {
                    sw.el.style.transform = `translate3d(${sw.x.toFixed(1)}px, ${sw.y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
                    sw.el.style.opacity = op.toFixed(2);
                }
            }
        }
        requestAnimationFrame(masterTick);
    }

    initOrbs();
    requestAnimationFrame(masterTick);

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initOrbs();
        }, 200);
    });
}

function initScrollObserver() {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const viewAnimObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view');
            }
        });
    }, { rootMargin: '250px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        revealObserver.observe(el);
        viewAnimObserver.observe(el);
    });
}

function formatScrollingText(text) {
    if (!text) return "";
    return text.split(/,|，/).map(seg => `<span class="mx-6 inline-block">🎃 ${seg.trim()}</span>`).join(' • ');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,107,0';
}

function syncModalOpenState() {
    const anyActive = document.querySelector('.modal.active') !== null;
    if (anyActive) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
}

function toggleCultureModal() {
    document.getElementById('culture-modal').classList.toggle('active');
    syncModalOpenState();
}

function openProfile(index) {
    const member = members[index];
    if (!member) return;

    const modal = document.getElementById('profile-modal');
    prepareModalImage(member);

    document.getElementById('modal-img-link').href = member.zalo;
    document.getElementById('modal-name').innerText = member.name;

    const badge = document.getElementById('modal-role-badge');
    badge.innerHTML = member.role
        ? `<span class="bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.6)] uppercase tracking-wider inline-flex items-center gap-2">🎃 <i class="fa-solid fa-crown"></i> ${member.role} 🧹</span>`
        : `<span class="liquid-subglass text-orange-200 px-4 py-1.5 rounded-full uppercase text-sm border border-orange-400/40 inline-flex items-center gap-2">🦇 Thành viên cốt cán • 🎃</span>`;

    document.getElementById('modal-slogan').innerHTML = formatScrollingText(member.slogan);
    document.getElementById('modal-guns').innerHTML = formatScrollingText(member.guns);
    document.getElementById('modal-desc').innerText = member.desc;
    document.getElementById('modal-drive').href = member.drive;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    let audioFile = (index === 0) ? "msboss.mp3" : `mstv${index}.mp3`;
    currentAudio = new Audio(audioFile);
    currentAudio.loop = true;
    currentAudio.play().catch(e => console.log("Trình duyệt tạm thời chặn âm thanh autoplay tự động, vui lòng tương tác trước:", e));

    document.getElementById('music-player-record').classList.remove('hidden');
    modal.classList.add('active');
    syncModalOpenState();

    triggerHalloweenProfileSwarm();
    createCandyBurst(window.innerWidth / 2, window.innerHeight / 3);
}

function closeProfile() {
    document.getElementById('profile-modal').classList.remove('active');
    syncModalOpenState();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    document.getElementById('music-player-record').classList.add('hidden');
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    if (src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        syncModalOpenState();
    }
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.remove('active');
    syncModalOpenState();
}

window.onload = function () {
    startGlobalLoad();
    loadDynamicMembers();
};

window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        if (event.target.id === 'lightbox-modal') {
            closeLightbox();
        } else {
            event.target.classList.remove('active');
            syncModalOpenState();
            if (event.target.id === 'profile-modal') {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }
                document.getElementById('music-player-record').classList.add('hidden');
            }
        }
    }
};