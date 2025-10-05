document.addEventListener('DOMContentLoaded', () => {
    const tentaclesContainer = document.querySelector('.tentacles-container');
    if (!tentaclesContainer) return;

    const tentacles = Array.from(document.querySelectorAll('.tentacle'));
    const buttons = Array.from(document.querySelectorAll('.main-button'));
    const createButton = document.getElementById('createButton');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModal');

    const dropzone = document.getElementById("mainDropZone");
    dropzone.addEventListener("drop", dropEvent)

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    if (createButton) createButton.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalHandler);
    if (modalOverlay) modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModalHandler();
    });

    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    function closeModalHandler() {
        if (modalOverlay) modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    const MAX_ANGLE = 16;
    const LERP = 0.12;
    const SINE_AMPLITUDE = 6;
    const SINE_SPEED = 1.6;
    const WAVE_SPACING = 0.5;
    const MAX_BUBBLES = 30;
    const BUBBLE_INTERVAL = 900;

    const state = tentacles.map((el, i) => ({
        el,
        index: i,
        curr: 0,
        target: 0,
        basePhase: i * WAVE_SPACING
    }));

    let focus = { x: 0.5, y: 0.5, weight: 0 };

    function setFocusToRect(rect, intensity = 1) {
        focus.x = (rect.left + rect.width / 2) / window.innerWidth;
        focus.y = (rect.top + rect.height / 2) / window.innerHeight;
        focus.weight = intensity;
    }
    function clearFocus() {
        focus.weight = 0;
    }

    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const r = btn.getBoundingClientRect();
            setFocusToRect(r, 1);
            btn.style.transform = 'scale(0.98)';
            btn.style.transition = 'transform 180ms ease';
        });
        btn.addEventListener('mouseleave', () => {
            clearFocus();
            btn.style.transform = '';
        });
    });

    const cth = document.querySelector('.cthulhu-svg');
    if (cth) {
        cth.addEventListener('mouseenter', () => {
            const r = cth.getBoundingClientRect();
            setFocusToRect(r, 0.9);
        });
        cth.addEventListener('mouseleave', clearFocus);
    }

    let startTime = performance.now();
    function loop(now) {
        const t = (now - startTime) / 1000;
        const mixX = focus.weight > 0 ? focus.x : 0.5;
        const mixY = focus.weight > 0 ? focus.y : 0.5;
        const baseAngle = (mixX - 0.5) * MAX_ANGLE * 2;
        state.forEach(s => {
            const verticalInfluence = (0.5 - mixY) * 6;
            const indexOffset = (s.index - state.length / 2) * 2.2;
            const desired = baseAngle + indexOffset + verticalInfluence;
            s.target = desired;
            s.curr += (s.target - s.curr) * LERP;
            const wave = Math.sin(t * SINE_SPEED + s.basePhase) * SINE_AMPLITUDE;
            s.el.style.transform = `rotate(${s.curr.toFixed(2)}deg) translateY(${wave.toFixed(2)}px)`;
            const op = 0.25 + (focus.weight * 0.6) + (Math.abs(s.curr) / MAX_ANGLE) * 0.15;
            s.el.style.opacity = Math.min(op, 1).toString();
        });

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    const bubblePool = [];
    const freeBubbles = [];
    const bubbleParent = tentaclesContainer;
    for (let i = 0; i < MAX_BUBBLES; i++) {
        const b = document.createElement('div');
        b.className = 'bubble';
        b.dataset.busy = '0';
        b.addEventListener('animationend', () => {
            b.classList.remove('rising');
            b.dataset.busy = '0';
            freeBubbles.push(b);
        });
        bubblePool.push(b);
        freeBubbles.push(b);
    }
    bubblePool.forEach(b => bubbleParent.appendChild(b));

    function spawnBubble() {
        if (freeBubbles.length === 0) return;
        const b = freeBubbles.pop();
        b.dataset.busy = '1';
        const size = Math.round(Math.random() * 40 + 12);
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 8;
        const delay = Math.random() * 1.5;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${left}%`;
        b.style.bottom = `-${size}px`;
        b.style.animationDuration = `${duration}s`;
        b.style.animationDelay = `${delay}s`;
        b.classList.remove('rising');
        void b.offsetWidth;
        b.classList.add('rising');
    }

    let bubbleTimer = setInterval(spawnBubble, BUBBLE_INTERVAL);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(bubbleTimer);
        } else {
            bubbleTimer = setInterval(spawnBubble, BUBBLE_INTERVAL);
        }
    });

    for (let i = 0; i < 6; i++) setTimeout(spawnBubble, i * 300);

    window.addEventListener('beforeunload', () => {
        clearInterval(bubbleTimer);
    });

    async function dropEvent(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    try {
                        const response = await fetch('http://127.0.0.1:5100/character-save', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData)
                        });
                    
                        if (response.ok) {
                            window.location.href = '/';
                        } else {
                            console.error('Ошибка сервера:', response.status);
                        }
                    } catch (error) {
                        console.error('Ошибка отправки:', error);
                    }
                } catch (err) {
                    console.error("Ошибка при разборе JSON:", err);
                }
            };
            reader.readAsText(file);
        } else {
            dropzone.classList.remove("dragover");
            alert("Пожалуйста, загрузите .json файл");
        }
    }
});
