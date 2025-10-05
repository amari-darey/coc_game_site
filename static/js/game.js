document.addEventListener('DOMContentLoaded', function() {
    const diceMainButton = document.getElementById('diceMainButton');
    const diceOptions = document.getElementById('diceOptions');
    
    diceMainButton.addEventListener('click', function() {
        diceOptions.classList.toggle('active');
    });
    
    const diceOptionElements = document.querySelectorAll('.dice-option');
    diceOptionElements.forEach(option => {
        option.addEventListener('click', function() {
            const diceType = this.getAttribute('data-dice');
            diceOptions.classList.remove('active');
            const log = document.getElementById("log-content")
            var div = document.createElement("div")
            div.className = "log-message own"
            div.innerHTML = `
            <div class="log-title">Бросок кубика ${this.textContent}</div>
            <div class="log-content">Результат: ${Math.floor((Math.random() * diceType) + 1)}</div>
            <div class="log-player">Игрок 1</div>
            `
            log.appendChild(div)
            log.scrollTop = log.scrollHeight;
        });
    });
    
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dice-selector')) {
            diceOptions.classList.remove('active');
        }
    });

    const overlay = document.getElementById('sheetModal');
    const closeBtn = document.getElementById('closeSheetModal');
    const participantItems = document.querySelectorAll('.participant-item');

    function openModal(playerName) {
        document.getElementById('modal-player-name').textContent = playerName;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    participantItems.forEach(item => {
        item.addEventListener('click', function() {
            const playerName = this.textContent;
            openModal(playerName);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });
});