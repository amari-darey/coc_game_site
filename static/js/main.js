// main.js
document.addEventListener('DOMContentLoaded', function() {
    const tentaclesContainer = document.querySelector('.tentacles-container');
    const modalOverlay = document.getElementById('modalOverlay');
    const createButton = document.getElementById('createButton');
    const closeModal = document.getElementById('closeModal');
    const fastCreateButton = document.getElementById('fastCreate');

    if (!tentaclesContainer) return;

    createButton.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalHandler);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModalHandler();
        }
    });

    fastCreateButton.addEventListener('click', function() {
            alert('Fast Create feature will be available soon!');
            closeModalHandler();
        });

    function openModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModalHandler() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const size = Math.random() * 40 + 10;
        const left = Math.random() * 100;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = `-${size}px`;
        bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;

        tentaclesContainer.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 30000);
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(createBubble, i * 2000);
    }

    setInterval(createBubble, 2000);

    const buttons = document.querySelectorAll('.main-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);

        });

        button.addEventListener('mouseenter', function() {
            const tentacles = document.querySelectorAll('.button-tentacle');
            tentacles.forEach(tentacle => {
                tentacle.style.animationDuration = '6s';
                tentacle.style.opacity = '0.5';
            });
        });

        button.addEventListener('mouseleave', function() {
            const tentacles = document.querySelectorAll('.button-tentacle');
            tentacles.forEach(tentacle => {
                tentacle.style.animationDuration = '12s';
                tentacle.style.opacity = '0.3';
            });
        });
    });

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;

        const tentacles = document.querySelectorAll('.tentacle');
        tentacles.forEach((tentacle, index) => {
            const delay = index * 0.1;
            setTimeout(() => {
                tentacle.style.transform = `rotate(${(x - 1) * 10}deg)`;
            }, delay * 1000);
        });
    });
});
