class CoCCharacterCreator {
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
            [...document.querySelectorAll(".stats-grid input")]
                .map(input => [input.id, parseInt(input.value)])
        );
    }

    _initSkills() {
        return Object.fromEntries(
            [...document.querySelectorAll("[id^=skill_alloc_]")]
                .map(input => [input.id.replace("skill_alloc_", ""), parseInt(input.value)])
        );
    }

    _bindEvents() {
        this._bindNavigationEvents();
        this._bindSkillsEvents();
        this._bindStatsEvents();
        this._bindAgeEvents();
        this._bindStepFourEvents();
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

    _bindStatsEvents() {
        document.getElementById("skill_choice").querySelectorAll(".stat-btn").forEach(button =>
            button.addEventListener("click", event => this._changeStat(event))
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

    _bindStepFourEvents() {
        ["popupButton1", "popupButton2"].forEach(id => {
            document.getElementById(id).addEventListener("click", event => this._stepFourModalChoiceHandler(event));
        });

        document.getElementById("skill_distribution").querySelectorAll(".stat-btn").forEach(button => {
            button.addEventListener("click", event => this._changeSkill(event));
        });
    }

    _bindLuck() {
        document.getElementById("rollLuck").addEventListener("click", () => this._rollLuck())
    }

    _bindFormSubmitEvent() {
        document.getElementById("characterForm").addEventListener("submit", event => this._handleSubmit(event));
    }

    _updateUI() {
        this._updateProgress();
        this._updateNavigationButtons();
        this._updatePointsDisplay();
        this._updateStatButtons();
        this._updateAgeStats();
    }

    // ХАРАКТЕРИСТИКИ
    _changeStat(event) {
        const { stat, action } = event.target.dataset;
        const input = document.getElementById(stat);
        const minValue = ["siz", "int"].includes(stat) ? 40 : 15;

        let value = parseInt(input.value);

        const operations = {
            increase: () => value < 90 && this.pointsLeft-- > 0 && value++,
            "increase+": () => {
                const increment = Math.min(10, 90 - value, this.pointsLeft);
                value += increment;
                this.pointsLeft -= increment;
            },
            decrease: () => value > minValue && (value--, this.pointsLeft++)
        };

        if (operations[action]) {
            operations[action]();
        }

        this.currentStats[stat] = value;
        input.value = value;

        this._updatePointsDisplay();
        this._updateStatButtons();
        this._updateAgeStats();
    }

    _updatePointsDisplay() {
        const pointsElement = document.getElementById("pointsLeft");
        pointsElement.textContent = this.pointsLeft;
        
        if (this.pointsLeft === 0) {
            pointsElement.style.color = "#4CAF50";
        } else if (this.pointsLeft < 0) {
            pointsElement.style.color = "#ff6b6b";
        } else {
            pointsElement.style.color = "#c9a86d";
        }
    }

    _updateStatButtons() {
        document.querySelectorAll(".stat-btn:not(.penalty-btn)").forEach(button => {
            const { stat, action } = button.dataset;
            const value = this.currentStats[stat];
            const minValue = ["siz", "int"].includes(stat) ? 40 : 15;

            button.disabled = (
                (action.startsWith("increase") && (value >= 90 || this.pointsLeft <= 0)) ||
                (action === "decrease" && value <= minValue)
            );
        });
    }

    // НАВЫКИ
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

    // ШАГ 4
    _handleStepFour() {
        this._calculateStartingStats();
        this._disableNonProfessionSkills();
        this._redirectNextButton();

        const formula = document.getElementById("skillPointFormula").value;
        
        if (["scientist", "actor"].includes(formula)) {
            this._calculateSkillPointFormula();
        } else {
            this._showStepFourModal(formula);
        }
    }

    _disableNonProfessionSkills() {
        document.getElementById("skill_distribution").querySelectorAll('.stat-btn').forEach(button => {
            const skillId = button.dataset.skillRus;
            const isEnabled = this.selectedSkills.includes(skillId) || skillId === 'Средства';

            button.disabled = !isEnabled;
            button.style.opacity = isEnabled ? '1' : '0.5';
            button.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
        });
    }

    _disableProfessionSkills() {
        document.getElementById("skill_distribution").querySelectorAll('.stat-btn').forEach(button => {
            const skillId = button.dataset.skillRus;
            const isEnabled = !this.selectedSkills.includes(skillId) && skillId !== 'Средства';

            button.disabled = !isEnabled;
            button.style.opacity = isEnabled ? '1' : '0.5';
            button.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
        });
    }

    _distributeNonProfessionSkills() {
        if (this.skillPointProfessional !== this.skillPointProfessionalLess) {
            alert("Потратьте все очки профессиональных навыков");
            return;
        }
        
        if (this.skillPointFlag) {
            this._disableProfessionSkills();
            const maxPointsElement = document.getElementById("skillPointsMax");
            const leftPointsElement = document.getElementById("skillPointsLeft");
            
            this.skillPointProfessional = this.currentStats.edu * 2;
            this.skillPointProfessionalLess = 0;
            
            maxPointsElement.innerHTML = `Распределите <strong>${this.skillPointProfessional} поинтов</strong> между навыками хобби`;
            leftPointsElement.textContent = this.skillPointProfessional;
            this.skillPointFlag = false;
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this._undoRedirectNextButton();
        }
    }

    _redirectNextButton() {
        this.alternativeNextHandler = () => this._distributeNonProfessionSkills();
        document.getElementById("nextBtn").removeEventListener("click", this.nextStepHandler);
        document.getElementById("nextBtn").addEventListener("click", this.alternativeNextHandler);
    }

    _undoRedirectNextButton() {
        document.getElementById("nextBtn").removeEventListener("click", this.alternativeNextHandler);
        document.getElementById("nextBtn").addEventListener("click", this.nextStepHandler);
        this.nextStep();
    }

    _calculateStartingStats() {
        this.currentSkills.dodge = Math.floor(this.currentStats.dex / 2);
        this.currentSkills.language_own = this.currentStats.edu;
        
        document.getElementById("skill_alloc_dodge").value = this.currentSkills.dodge;
        document.getElementById("skill_alloc_language_own").value = this.currentSkills.language_own;
    }

    _showStepFourModal(formula) {
        const modal = document.getElementById("choicePopup");
        modal.style.display = "flex";

        const popupQuestion = modal.querySelector("p");
        const button1 = document.getElementById("popupButton1");
        const button2 = document.getElementById("popupButton2");

        const options = {
            athlete: ["Сила", "Ловкость", "str", "dex"],
            default: ["Внешность", "Мощь", "app", "pow"]
        };
        
        const [text1, text2, value1, value2] = options[formula] || options.default;

        popupQuestion.textContent = formula === "athlete" ? "Сила или Ловкость?" : "Внешность или Мощь?";
        button1.nextElementSibling.textContent = text1;
        button1.dataset.value = value1;
        button2.nextElementSibling.textContent = text2;
        button2.dataset.value = value2;
    }

    _stepFourModalChoiceHandler(event) {
        const checkbox = event.target;
        
        if (checkbox.checked) {
            const otherCheckboxId = checkbox.id === "popupButton1" ? "popupButton2" : "popupButton1";
            document.getElementById(otherCheckboxId).checked = false;
            this.skillPointChoice = checkbox.dataset.value;
            this._calculateSkillPointFormula();
        }
    }

    _calculateSkillPointFormula() {
        const formula = document.getElementById("skillPointFormula").value;
        const modal = document.getElementById("choicePopup");
        const formulaSpace = document.getElementById("step_4_formula_wait");
        const maxPointsElement = document.querySelector("#skillPointsMax strong");
        const leftPointsElement = document.getElementById("skillPointsLeft");
        const formulaTextElement = document.getElementById("skill_formula");

        const formulas = {
            scientist: {
                calculate: () => this.currentStats.edu * 4,
                text: "Образование * 4"
            },
            actor: {
                calculate: () => this.currentStats.edu * 2 + this.currentStats.app * 2,
                text: "Образование * 2 + Внешность * 2"
            },
            athlete: {
                calculate: () => this.currentStats.edu * 2 + this.currentStats[this.skillPointChoice] * 2,
                text: `Образование * 2 + ${this.skillPointChoice === "str" ? "Сила" : "Ловкость"} * 2`
            },
            fanatic: {
                calculate: () => this.currentStats.edu * 2 + this.currentStats[this.skillPointChoice] * 2,
                text: `Образование * 2 + ${this.skillPointChoice === "app" ? "Внешность" : "Мощь"} * 2`
            }
        };

        const { calculate, text } = formulas[formula] || formulas.scientist;
        this.skillPointProfessional = calculate();
        formulaTextElement.textContent = `Распределите очки навыков (основа: ${text})`;

        maxPointsElement.textContent = `${this.skillPointProfessional} поинтов`;
        leftPointsElement.textContent = this.skillPointProfessional;

        formulaSpace.style.display = "";
        modal.style.display = "none";
    }

    _changeSkill(event) {
        const { skill, action } = event.target.dataset;
        const input = document.getElementById(`skill_alloc_${skill}`);
        const skillPointsLeftElement = document.getElementById("skillPointsLeft");
        const baseValue = input.minValue || 0;
        let value = this.currentSkills[skill];
        const pointsAvailable = this.skillPointProfessional - this.skillPointProfessionalLess;

        const operations = {
            skillIncrease: () => {
                if (value < 90 && pointsAvailable > 0) {
                    value++;
                    this.skillPointProfessionalLess++;
                }
            },
            "skillIncrease+": () => {
                const increment = Math.min(10, 90 - value, pointsAvailable);
                value += increment;
                this.skillPointProfessionalLess += increment;
            },
            skillDecrease: () => {
                if (value > baseValue) {
                    value--;
                    this.skillPointProfessionalLess--;
                }
            }
        };

        if (operations[action]) {
            operations[action]();
        }

        this.currentSkills[skill] = value;
        input.value = value;
        skillPointsLeftElement.textContent = this.skillPointProfessional - this.skillPointProfessionalLess;
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
        
        if (this.currentStep === 2 && this.pointsLeft !== 0) {
            alert("Распределите все очки характеристик");
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
        
        if (this.currentStep === 4 && this.skillPointProfessionalLess !== this.skillPointProfessional) {
            alert("Потратьте все очки хобби");
            return false;
        }
        
        if (this.currentStep === 5 && this.luckTry !== 0) {
            alert(this.luckTry);
            return false;
        }
        
        return true;
    }

    // ВОЗРАСТ
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
            document.getElementById("edu").value = this.currentStats.edu;
            
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

    // РАСЧЁТ СТАТОВ
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


    // SUBMIT
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
}

document.addEventListener("DOMContentLoaded", () => new CoCCharacterCreator());
