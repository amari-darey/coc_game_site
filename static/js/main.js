// main.js
document.addEventListener('DOMContentLoaded', function() {
    const tentaclesContainer = document.querySelector('.tentacles-container');

    if (!tentaclesContainer) return;

    // Создаем пузыри
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

        // Удаляем пузырь после завершения анимации
        setTimeout(() => {
            bubble.remove();
        }, 30000);
    }

    // Создаем несколько пузырей
    for (let i = 0; i < 10; i++) {
        setTimeout(createBubble, i * 2000);
    }

    // Продолжаем создавать пузыри каждые 2 секунды
    setInterval(createBubble, 2000);

    // Добавляем интерактивность кнопкам
    const buttons = document.querySelectorAll('.main-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);

        });

        // Эффект при наведении на кнопку - щупальца активнее двигаются
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

    // Добавляем эффект движения щупальцам при движении мыши
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
