export class CharacterCreator {
    constructor() {
        this._initializeProperties();
        this._bindEvents();
        this._updateUI();
    }

    _initializeProperties() {
        this.currentStep = 1;
        this.totalSteps = 6;

        // Навыки
        this.selectedSkills = [];
        this.maxSkills = 8;

        // Характеристики
        this.totalPoints = 290;
        this.pointsLeft = this.totalPoints;
        this.currentStats = this._initStats();
        this.currentSkills = this._initSkills();

        // Очки умений
        this.skillPointProfessional = 0;
        this.skillPointProfessionalLess = 0;
        this.skillPointChoice = "edu";
        this.skillPointFlag = true;

        // Образование
        this.eduImprovementCurrent = 0;
        this.eduImprovementMax = 0;

        // Удача
        this.luckValue = 0;
        this.luckTry = 1;
        this.luckPreviousValue = 0;
        this.luckFlag = false;

        // Скорость
        this.ageModifierSpeed = 0;
        this.baseStats = null;
        this.agePenalties = { str: 0, dex: 0, con: 0 };
        this.currentAgePenaltyTotal = 0;
    }

    _initStats() {
        return Object.fromEntries(
            [...document.getElementById("js-characteristic").querySelectorAll("div")]
                .map(input => [input.dataset.name.toLowerCase(), parseInt(input.dataset.base)])
        );
    }

    _initSkills() {
        return Object.fromEntries(
            [...document.getElementById("js-stats").querySelectorAll("div")]
                .map(input => [input.dataset.name.toLowerCase(), parseInt(input.dataset.base)])
        );
    }

    // Бинды

    _bindEvents() {
        this._bindNavigationEvents();
        this._bindSkillsEvents();
        this._bindAgeEvents();
        this._bindLuck();
        this._bindFormSubmitEvent();
    }

    _bindNavigationEvents() {
        const nextButton = document.getElementById("nextBtn");
        const prevButton = document.getElementById("prevBtn");
        
        this.nextStepHandler = () => this.nextStep();
        nextButton.addEventListener("click", this.nextStepHandler);
        prevButton.addEventListener("click", () => this.prevStep());
    }

    _bindSkillsEvents() {
        document.querySelectorAll('input[name="skills"]').forEach(checkbox =>
            checkbox.addEventListener("change", event => this._toggleSkill(event))
        );
    }

    _bindAgeEvents() {
        const ageRange = document.getElementById("ageRange");
        const rollEduButton = document.getElementById("rollEduImprovement");
        const applyAgePenaltyButton = document.getElementById("applyAgePenalty");
        
        ageRange.addEventListener("change", event => this._handleAgeChange(event));
        
        if (rollEduButton) {
            rollEduButton.addEventListener("click", () => this._rollEduImprovement());
        }
        
        document.querySelectorAll('#agePenaltyPopup .stat-btn').forEach(button => {
            button.addEventListener('click', event => this._changeAgePenalty(event));
        });
        
        applyAgePenaltyButton.addEventListener("click", () => this._applyAgePenalty());
    }

    _bindLuck() {
        document.getElementById("rollLuck").addEventListener("click", () => this._rollLuck())
    }

    _bindFormSubmitEvent() {
        document.getElementById("characterForm").addEventListener("submit", event => this._handleSubmit(event));
    }

    // ШАГ 1
    _toggleSkill(event) {
        const { checked, value, dataset } = event.target;
        
        if (checked) {
            if (this.selectedSkills.length >= this.maxSkills) {
                event.target.checked = false;
                alert(`Можно выбрать только ${this.maxSkills} навыков`);
                return;
            }
            this.selectedSkills.push(dataset.name);
        } else {
            this.selectedSkills = this.selectedSkills.filter(skill => skill !== dataset.name);
        }
        
        document.getElementById("skillsCounter").textContent = this.selectedSkills.length;
        this._renderSelectedSkills();
    }

    _renderSelectedSkills() {
        const list = document.getElementById("selectedSkillsList");
        list.innerHTML = this.selectedSkills.map(skill => 
            `<div class="selected-skill">
                ${skill} <button type="button" class="remove-skill" data-skill="${skill}">×</button>
             </div>`
        ).join("");

        list.querySelectorAll(".remove-skill").forEach(button => {
            button.addEventListener("click", event => {
                const skill = event.target.dataset.skill;
                const checkbox = document.querySelector(`input[name="skills"][value="${skill}"]`);
                
                if (checkbox) {
                    checkbox.checked = false;
                }
                
                this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
                document.getElementById("skillsCounter").textContent = this.selectedSkills.length;
                this._renderSelectedSkills();
            });
        });
    }
    
    // ШАГ 3
    _handleAgeChange(event) {
        const age = event.target.value;
        const modifiersInfo = document.getElementById("ageModifiersInfo");
        const eduSection = document.getElementById("eduImprovementSection");
        const modifiersList = document.getElementById("modifiersList");

        const MIN_STAT = 1;
        const MAX_STAT = 90;
        const clamp = (value) => Math.min(MAX_STAT, Math.max(MIN_STAT, value));

        const AGE_MODIFIERS = {
            "15_19":  { penalties: 5,  siz: -5, edu: -5, text: "СИЛ/ЛВК/ТЕЛ -5 всего, РАЗ -5, ОБР -5", improvement: 0, speed: 0 },
            "20_39":  { penalties: 0,  text: "", improvement: 0, speed: 0 },
            "40_49":  { penalties: 5,  edu: +5, pow: +5, text: "СИЛ/ЛВК/ТЕЛ -5 всего; ОБР +5, МОЩ +5", improvement: 2, speed: 2 },
            "50_59":  { penalties: 10, edu: +10, pow: +5, text: "СИЛ/ЛВК/ТЕЛ -10 всего; ОБР +10, МОЩ +5", improvement: 3, speed: 2 },
            "60_69":  { penalties: 20, edu: +15, pow: +5, text: "СИЛ/ЛВК/ТЕЛ -20 всего; ОБР +15, МОЩ +5", improvement: 4, speed: 3 },
            "70_79":  { penalties: 40, edu: +20, pow: +5, text: "СИЛ/ЛВК/ТЕЛ -40 всего; ОБР +20, МОЩ +5", improvement: 4, speed: 4 },
            "80_plus":{ penalties: 80, edu: +25, pow: +5, text: "СИЛ/ЛВК/ТЕЛ -80 всего; ОБР +25, МОЩ +5", improvement: 4, speed: 5 }
        };

        const modifiers = AGE_MODIFIERS[age];
        this.ageModifierSpeed = modifiers?.speed || 0;

        modifiersInfo.style.display = "block";
        modifiersList.innerHTML = modifiers?.text ? `<p>${modifiers.text}</p>` : "";

        if (!this.baseStats) {
            this.baseStats = JSON.parse(JSON.stringify(this.currentStats));
        }

        this.currentStats = JSON.parse(JSON.stringify(this.baseStats));
        this.agePenalties = { str: 0, dex: 0, con: 0 };

        eduSection.style.display = ["15_19", "20_39"].includes(age) ? "none" : "block";
        
        if (eduSection.style.display === "block") {
            document.getElementById("currentEDU").textContent = this.currentStats.edu;
        }

        if (modifiers) {
            for (const key in modifiers) {
                if (["text", "improvement", "speed", "penalties"].includes(key)) continue;
                const delta = modifiers[key];
                
                if (typeof delta === "number" && this.currentStats.hasOwnProperty(key)) {
                    this.currentStats[key] = clamp(this.currentStats[key] + delta);
                }
            }
            
            this.eduImprovementMax = modifiers.improvement || 0;
            this.eduImprovementCurrent = 0;
        } else {
            this.eduImprovementMax = 0;
        }

        this.currentAgePenaltyTotal = modifiers?.penalties || 0;
        
        if (this.currentAgePenaltyTotal > 0) {
            document.getElementById("agePenaltyTotal").textContent = this.currentAgePenaltyTotal;
            document.getElementById("agePenaltyRemaining").textContent = this.currentAgePenaltyTotal;

            document.getElementById("penalty_str").value = 0;
            document.getElementById("penalty_dex").value = 0;
            document.getElementById("penalty_con").value = 0;

            document.getElementById("agePenaltyPopup").style.display = "flex";
        }

        this._updateAgeStats();
    }

    _applyAgePenalty() {
        const total = this.currentAgePenaltyTotal;
        const strengthPenalty = parseInt(document.getElementById("penalty_str").value);
        const dexterityPenalty = parseInt(document.getElementById("penalty_dex").value);
        const constitutionPenalty = parseInt(document.getElementById("penalty_con").value);

        if (strengthPenalty + dexterityPenalty + constitutionPenalty !== total) {
            alert("Нужно распределить все штрафные очки!");
            return;
        }

        const clamp = value => Math.max(1, value);

        this.currentStats.str = clamp(this.currentStats.str - strengthPenalty);
        this.currentStats.dex = clamp(this.currentStats.dex - dexterityPenalty);
        this.currentStats.con = clamp(this.currentStats.con - constitutionPenalty);

        this.agePenalties = { str: strengthPenalty, dex: dexterityPenalty, con: constitutionPenalty };
        document.getElementById("agePenaltyPopup").style.display = "none";
        this._updateAgeStats();
    }

    _changeAgePenalty(event) {
        const { stat, action } = event.target.dataset;
        const input = document.getElementById(stat);
        let value = parseInt(input.value);

        const strengthPenalty = parseInt(document.getElementById("penalty_str").value);
        const dexterityPenalty = parseInt(document.getElementById("penalty_dex").value);
        const constitutionPenalty = parseInt(document.getElementById("penalty_con").value);

        const used = strengthPenalty + dexterityPenalty + constitutionPenalty;
        const remaining = this.currentAgePenaltyTotal - used;

        const operations = {
            increase: () => {
                if (remaining > 0) {
                    value += 1;
                }
            },
            "increase+": () => {
                if (remaining > 0) {
                    const increment = Math.min(10, remaining);
                    value += increment;
                }
            },
            decrease: () => {
                if (value > 0) {
                    value -= 1;
                }
            }
        };

        if (operations[action]) {
            operations[action]();
        }

        input.value = value;

        const newUsed = 
            parseInt(document.getElementById("penalty_str").value) +
            parseInt(document.getElementById("penalty_dex").value) +
            parseInt(document.getElementById("penalty_con").value);

        document.getElementById("agePenaltyRemaining").textContent = this.currentAgePenaltyTotal - newUsed;
    }

    _rollEduImprovement() {
        if (this.eduImprovementCurrent >= this.eduImprovementMax) return;

        const roll = Math.floor(Math.random() * 100) + 1;
        const currentEducation = this.currentStats.edu;
        const resultElement = document.getElementById("eduImprovementResult");

        resultElement.innerHTML = `<p>Бросок: ${roll} (нужно > ${currentEducation})</p>`;

        if (roll > currentEducation) {
            const increment = Math.floor(Math.random() * 10) + 1;
            this.currentStats.edu = Math.min(currentEducation + increment, 99);
            document.getElementById("ageStepedu").value = this.currentStats.edu;
            
            resultElement.innerHTML += `<p class="success">Успех! ОБР +${increment}, теперь ${this.currentStats.edu}</p>`;
        } else {
            resultElement.innerHTML += `<p class="failure">Провал! ОБР остаётся ${currentEducation}</p>`;
        }

        this._updateAgeStats();
        document.getElementById("currentEDU").textContent = this.currentStats.edu;
        this.eduImprovementCurrent++;
        document.getElementById("eduImprovement").textContent = this.eduImprovementMax - this.eduImprovementCurrent;
    }

    _updateAgeStats() {
        Object.entries(this.currentStats).forEach(([stat, value]) => {
            const element = document.getElementById(`ageStep${stat}`);
            if (element) element.textContent = value;
        });
        
        document.getElementById("eduImprovement").textContent = this.eduImprovementMax - this.eduImprovementCurrent;
    }

    // ШАГ 5
    _handleStepFive() {
        const age = document.getElementById("ageRange");
        const luckTryElement = document.querySelector("#luckTryNum strong");
        
        if (age.value === "15_19") {
            this.luckTry = 2;
            this.luckFlag = true;
        }
        luckTryElement.textContent = this.luckTry
    }

    _rollLuck() {
        if (this.luckTry <= 0) return;
        
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = (dice1 + dice2 + dice3) * 5;
        
        const resultElement = document.getElementById("luckRollResult");
        const luckTryElement = document.querySelector("#luckTryNum strong");
        
        resultElement.innerHTML = `
            <div class="luck-dice">
                <div class="dice-value">${dice1}</div>
                <div class="dice-value">${dice2}</div>
                <div class="dice-value">${dice3}</div>
            </div>
            <div class="luck-total">Удача: ${total}</div>
        `;
        
        this.luckValue = total;
        document.getElementById("luckValue").value = total;
        this.luckTry--;
        luckTryElement.textContent = this.luckTry;

        if (this.luckFlag) {
            if (this.luckPreviousValue > total) {
                this.luckValue = this.luckPreviousValue;
                document.getElementById("luckValue").value = this.luckPreviousValue;
                
                resultElement.innerHTML = `
                    <div class="luck-dice">
                        <div class="dice-value">${dice1}</div>
                        <div class="dice-value">${dice2}</div>
                        <div class="dice-value">${dice3}</div>
                    </div>
                    <div class="luck-total">Удача: ${total}</div>
                    <p class="success">Прошлое значение ${this.luckPreviousValue} было больше, останется оно.</p>
                `;
            }
            
            this.luckPreviousValue = total;
        }
    }

    // НАВИГАЦИЯ
    nextStep() {
        if (!this._validateCurrentStep()) return;
        
        this._toggleCurrentStep(false);
        this.currentStep++;
        
        if (this.currentStep === 3) this._updateAgeStats();
        if (this.currentStep === 4) this._calculateStartingStats();
        if (this.currentStep === 4) this._setDodgeAndLangOwn();
        if (this.currentStep === 4) this._handleStepFour();
        if (this.currentStep === 5) this._handleStepFive();
        
        this._updateProgress();
        this._toggleCurrentStep(true);
        this._updateNavigationButtons();
    }

    prevStep() {
        this._toggleCurrentStep(false);
        this.currentStep--;
        this._updateProgress();
        this._toggleCurrentStep(true);
        this._updateNavigationButtons();
    }

    _toggleCurrentStep(show) {
        document.querySelector(`.form-step[data-step="${this.currentStep}"]`)
            .classList.toggle("active", show);
    }

    _updateProgress() {
        const progressPercentage = (this.currentStep - 1) / (this.totalSteps - 1) * 100;
        document.getElementById("progressFill").style.width = `${progressPercentage}%`;
        
        document.querySelectorAll(".step").forEach((step, index) => {
            step.classList.toggle("active", index + 1 <= this.currentStep);
        });
    }

    _updateNavigationButtons() {
        const prevButton = document.getElementById("prevBtn");
        const nextButton = document.getElementById("nextBtn");
        const submitButton = document.getElementById("submitBtn");
        
        prevButton.disabled = this.currentStep === 1;
        nextButton.style.display = this.currentStep === this.totalSteps ? "none" : "block";
        submitButton.style.display = this.currentStep === this.totalSteps ? "block" : "none";
    }

    // ВАЛИДАЦИЯ
    _validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredInputs = currentStepElement.querySelectorAll("input[required], select[required]");
        
        for (let input of requiredInputs) {
            if (!input.value.trim()) {
                alert("Заполните все обязательные поля");
                input.focus();
                return false;
            }
        }
        
        if (this.currentStep === 1 && this.selectedSkills.length !== this.maxSkills) {
            alert(`Выберите ровно ${this.maxSkills} навыков`);
            return false;
        }
        
        if (this.currentStep === 3 && document.getElementById('ageRange').selectedIndex === 0) {
            alert("Выберите возраст");
            return false;
        }
        
        if (this.currentStep === 3 && this.eduImprovementCurrent !== this.eduImprovementMax) {
            alert("Пройдите проверки образования");
            return false;
        }
        
        if (this.currentStep === 5 && this.luckTry !== 0) {
            alert("Пройдите все проверки удачи");
            return false;
        }
        
        return true;
    }

    // Вспомогательные
    _calculateStartingStats() {
        this.currentSkills.dodge = Math.floor(this.currentStats.dex / 2);
        this.currentSkills.language_own = this.currentStats.edu;
    }

    _setDodgeAndLangOwn() {
        const dodge =  document.querySelector('label[data-name="Уклонение"]')
        const languageOwn =  document.querySelector('label[data-name="Языки -Родной-"]')

        if (dodge && languageOwn) {
            dodge.textContent = `Уклонение (${Math.floor(this.currentStats.dex / 2)})`
            languageOwn.textContent = `Языки -Родной- (${this.currentStats.edu})`
        }
    }

    // ГЕТЕРЫ
    _getSanity() {
        return this.currentStats.pow;
    }

    _getHitPoints() {
        return Math.floor((this.currentStats.siz + this.currentStats.con) / 10);
    }

    _getMagicPoints() {
        return Math.floor(this.currentStats.pow / 5);
    }

    _getSpeed() {
        if (this.currentStats.dex > this.currentStats.con && this.currentStats.str > this.currentStats.con) {
            return 9 - this.ageModifierSpeed;
        } else if (this.currentStats.dex >= this.currentStats.con || this.currentStats.str >= this.currentStats.con) {
            return 8 - this.ageModifierSpeed;
        } else {
            return 7 - this.ageModifierSpeed;
        }
    }

    _getDamageBonus() {
        const value = this.currentStats.str + this.currentStats.con;
        
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

    _getCharacterName() {
        return document.getElementById("charName").value;
    }

    _getAge() {
        return document.getElementById("ageRange").value;
    }

    _getAppearance() {
        return document.getElementById("appearanceDesc").value;
    }

    _getBackstory() {
        return document.getElementById("backstory").value;
    }

    _getEquipment() {
        return document.getElementById("equipment").value;
    }

    // САБМИТ
    async _handleSubmit(event) {
        event.preventDefault();
        
        const result = {
            "name": this._getCharacterName(),
            "age": this._getAge(),
            "proffesion": document.getElementById("profession").value,
            "stat": this.currentStats,
            "skill": this.currentSkills,
            "proffesionalSkill": this.selectedSkills,
            "sanity": this._getSanity(),
            "hp": this._getHitPoints(),
            "mp": this._getMagicPoints(),
            "speed": this._getSpeed(),
            "luck": this.luckValue,
            "damageUp": this._getDamageBonus().damageBonus,
            "damageReduction": this._getDamageBonus().damageReduction,
            "appearance": this._getAppearance(),
            "backstory": this._getBackstory(),
            "equipment": this._getEquipment(),
            "weapons": [
                {
                    "id": crypto.randomUUID(),
                    "name": "Драка",
                    "skill": "Ближ. бой -драка-", 
                    "damage": "1d3 + damage bonus", 
                    "distance": "Прикосновения", 
                    "fire_rate": "1", 
                    "ammo": "-", 
                    "misfire": "-" 
                }, 
            ]
        };

        try {
            const response = await fetch('http://127.0.0.1:5100/character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result)
            });

            if (response.ok) {
                window.location.href = '/character';
            } else {
                console.error('Ошибка сервера:', response.status);
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    }

    _updateUI() {
        this._updateProgress();
        this._updateNavigationButtons();
        this._updateAgeStats();
    }
}