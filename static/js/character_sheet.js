document.addEventListener('DOMContentLoaded', function() {
    const addWeaponBtn = document.getElementById('add-weapon-btn');
    document.getElementById('return-to-main').addEventListener("click", () => window.location.href = "/")

    if (addWeaponBtn) {
        addWeaponBtn.addEventListener('click', addWeapon);
    }

    function addListenerToCell() {
        document.querySelectorAll('.track-cell').forEach(cell => {cell.addEventListener('click', () => changeCell(cell))});
    }

    function changeCell(cell) {
        console.log(cell.dataset.item)
        console.log(cell.textContent)
    }

    function updateModifier() {
        const newDamageBonus = getDamageBonus()
        const newSpeed = getSpeed()
        const currentDamageBonus = document.getElementById("damageUp")
        const currentDamageRedaction = document.getElementById("damageReduction")
        const currentSpeed = document.getElementById("speed")

        currentDamageBonus.textContent = newDamageBonus.damageBonus
        currentDamageRedaction.textContent = newDamageBonus.damageReduction
        currentSpeed.textContent = newSpeed
    }

    function getDamageBonus() {
        const con = parseInt(document.getElementById("CON_stat").textContent)
        const str = parseInt(document.getElementById("STR_stat").textContent)
        const value = str + con;
        console.log(value)
        
        if (value <= 1) {
            return { damageBonus: 0, damageReduction: 0 };
        } else if (value <= 64) {
            return { damageBonus: -2, damageReduction: -2 };
        } else if (value <= 84) {
            return { damageBonus: -1, damageReduction: -1 };
        } else if (value <= 124) {
            return { damageBonus: 0, damageReduction: 0 };
        } else if (value <= 164) {
            return { damageBonus: "1d4", damageReduction: 1 };
        } else if (value <= 204) {
            return { damageBonus: "1d6", damageReduction: 2 };
        } else if (value <= 284) {
            return { damageBonus: "2d6", damageReduction: 3 };
        } else {
            return { damageBonus: "2d6", damageReduction: 3 };
        }
    }

    function getSpeed() {
        const con = parseInt(document.getElementById("CON_stat").textContent)
        const str = parseInt(document.getElementById("STR_stat").textContent)
        const dex = parseInt(document.getElementById("DEX_stat").textContent)
        const age = document.getElementById("character-age").textContent
        const AGE_MODIFIERS = {
            "15_19": 0,
            "20_39": 0,
            "40_49": 2,
            "50_59": 2,
            "60_69": 3,
            "70_79": 4,
            "80_plus": 5
        };
        if (dex > con && str > con) {
            return 9 - AGE_MODIFIERS[age];
        } else if (dex >= con || str >= con) {
            return 8 - AGE_MODIFIERS[age];
        } else {
            return 7 - AGE_MODIFIERS[age];
        }
    }

    function addAdjustButtons() {
        document.querySelectorAll('.characteristic-item .main-square, .skill-item .main-square').forEach(square => {
            const wrapper = square.parentElement;
            if (wrapper.querySelector('.adjust-buttons')) return;

            const adjust = document.createElement('div');
            adjust.className = 'adjust-buttons';
            adjust.innerHTML = `
                <button class="adjust-btn plus">+</button>
                <button class="adjust-btn minus">−</button>
            `;
            wrapper.appendChild(adjust);

            adjust.querySelector('.plus').addEventListener('click', () => changeValue(square, +1));
            adjust.querySelector('.minus').addEventListener('click', () => changeValue(square, -1));
        });
    }

    function changeValue(square, delta) {
        let val = parseInt(square.textContent) || 0;
        val = Math.max(0, val + delta);
        square.textContent = val;

        const parent = square.closest('.characteristic-main-value, .skill-main-value');
        if (parent) {
            const topSquare = parent.querySelector('.sub-square.top');
            const bottomSquare = parent.querySelector('.sub-square.bottom');
            if (topSquare) topSquare.textContent = Math.floor(val / 2);
            if (bottomSquare) bottomSquare.textContent = Math.floor(val / 5);
        }
        
        if (["CON_stat", "STR_stat", "DEX_stat"].includes(square.id)) updateModifier();
    }

    addAdjustButtons();

    document.querySelectorAll('.track-grid').forEach(grid => {
        grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('track-cell')) {
                grid.querySelectorAll('.track-cell').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('weapon-delete-btn')) {
            deleteWeapon(e.target.dataset.weaponId);
        }
    });

    function addWeapon() {
        const weaponsContainer = document.getElementById('weapons-container');
        const noWeapons = weaponsContainer.querySelector('.no-weapons');
        if (noWeapons) noWeapons.remove();

        const weaponId = Date.now();
        const weaponCard = document.createElement('div');
        weaponCard.className = 'weapon-card';
        weaponCard.dataset.weaponId = weaponId;

        weaponCard.innerHTML = `
            <div class="weapon-fields-row">
                <div class="weapon-field">
                    <label>Оружие</label>
                    <div class="weapon-value" data-field="name"><input type="text" placeholder="Название оружия"></div>
                </div>
                <div class="weapon-field">
                    <label>Навык</label>
                    <div class="weapon-value" data-field="skill"><input type="text" placeholder="Навык"></div>
                </div>
                <div class="weapon-field">
                    <label>Урон</label>
                    <div class="weapon-value" data-field="damage"><input type="text" placeholder="Урон"></div>
                </div>
                <div class="weapon-field">
                    <label>Дистанция</label>
                    <div class="weapon-value" data-field="distance"><input type="text" placeholder="Дистанция"></div>
                </div>
                <div class="weapon-field">
                    <label>Атак/раунд</label>
                    <div class="weapon-value" data-field="fire_rate"><input type="text" placeholder="Атак/раунд"></div>
                </div>
                <div class="weapon-field">
                    <label>Боезапас</label>
                    <div class="weapon-value" data-field="ammo"><input type="text" placeholder="Боезапас"></div>
                </div>
                <div class="weapon-field">
                    <label>Осечка</label>
                    <div class="weapon-value" data-field="misfire"><input type="text" placeholder="Осечка"></div>
                </div>
            </div>
            <button class="weapon-delete-btn" data-weapon-id="${weaponId}">×</button>
        `;

        weaponsContainer.appendChild(weaponCard);
    }

    function deleteWeapon(weaponId) {
        const weaponCard = document.querySelector(`.weapon-card[data-weapon-id="${weaponId}"]`);
        if (weaponCard) weaponCard.remove();

        const weaponsContainer = document.getElementById('weapons-container');
        if (weaponsContainer.children.length === 0) {
            weaponsContainer.innerHTML = '<div class="no-weapons">Оружие не добавлено</div>';
        }
    }

    function makeEditable(selector, multiline = false) {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('click', function() {
                if (el.querySelector('input, textarea')) return;

                const oldText = el.textContent.trim();
                const input = multiline ? document.createElement('textarea') : document.createElement('input');

                input.value = oldText;
                input.className = 'styled-input';
                el.innerHTML = '';
                el.appendChild(input);
                input.focus();

                if (!multiline) {
                    input.addEventListener('keydown', e => {
                        if (e.key === 'Enter') input.blur();
                    });
                }

                input.addEventListener('blur', () => {
                    const newText = input.value.trim();
                    el.textContent = newText || oldText;
                });
            });
        });
    }

    makeEditable('.info-value#character-name');
    makeEditable('.info-value#character-profession');
    makeEditable('.text-content#character-appearance', true);
    makeEditable('.text-content#character-backstory', true);
    makeEditable('.text-content#character-equipment', true);

    addListenerToCell();
});
