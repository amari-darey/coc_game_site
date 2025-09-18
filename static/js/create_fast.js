class CoCCharacterCreator {
    constructor() {
        this._cacheElements();
        this._initializeProperties();
        this._bindEvents();
    }

    // ---------- CACHED SELECTORS ----------
    _cacheElements() {
        const doc = document;
        this.el = {
            nextBtn: doc.getElementById("nextBtn"),
            prevBtn: doc.getElementById("prevBtn"),
            submitBtn: doc.getElementById("submitBtn"),
            statPool: doc.getElementById("statPool"),
            statPoolSkill: doc.getElementById("statPoolSkill"),
            statTargets: doc.getElementById("statTargets"),
            skillDistribution: doc.getElementById("skill_distribution"),
            skillsCounter: doc.getElementById("skillsCounter"),
            selectedSkillsList: doc.getElementById("selectedSkillsList"),
            rollLuckBtn: doc.getElementById("rollLuck"),
            rollEduButton: doc.getElementById("rollEduImprovement"),
            applyAgePenaltyButton: doc.getElementById("applyAgePenalty"),
            ageRange: doc.getElementById("ageRange"),
            eduSection: doc.getElementById("eduImprovementSection"),
            modifiersInfo: doc.getElementById("ageModifiersInfo"),
            modifiersList: doc.getElementById("modifiersList"),
            agePenaltyPopup: doc.getElementById("agePenaltyPopup"),
            characterForm: doc.getElementById("characterForm"),
            luckRollResult: doc.getElementById("luckRollResult"),
            luckValueInput: doc.getElementById("luckValue"),
            luckTryNum: doc.querySelector("#luckTryNum strong"),
            eduImprovementResult: doc.getElementById("eduImprovementResult"),
            currentEDU: doc.getElementById("currentEDU"),
            agePenaltyTotal: doc.getElementById("agePenaltyTotal"),
            agePenaltyRemaining: doc.getElementById("agePenaltyRemaining"),
            progressFill: doc.getElementById("progressFill"),
            steps: doc.querySelectorAll(".step")
        };
    }

    // ---------- STATE ----------
    _initializeProperties() {
        this.state = {
            currentStep: 1,
            totalSteps: 6,
            selectedSkills: [],
            maxSkills: 8,
            currentStats: this._initStats(),
            currentSkills: this._initSkills(),
            skillPointFlag: true,
            eduImprovementCurrent: 0,
            eduImprovementMax: 0,
            luckValue: 0,
            luckTry: 1,
            luckPreviousValue: 0,
            luckFlag: false,
            ageModifierSpeed: 0,
            baseStats: null,
            agePenalties: { str: 0, dex: 0, con: 0 },
            currentAgePenaltyTotal: 0
        };

        this._draggingElement = null;

        this.nextStepHandler = () => this.nextStep();
    }

    // ---------- INITS FROM DOM ----------
    _initStats() {
        const inputs = [...document.querySelectorAll(".stats-grid input")];
        return Object.fromEntries(inputs.map(input => [input.id, parseInt(input.value, 10) || 0]));
    }

    _initSkills() {
        const inputs = [...document.querySelectorAll("[id^=skill_alloc_]")];
        return Object.fromEntries(inputs.map(input => [input.id.replace("skill_alloc_", ""), parseInt(input.value, 10) || 0]));
    }

    // ---------- BIND EVENTS ----------
    _bindEvents() {
        this._bindNavigationEvents();
        this._bindSkillsEvents();
        this._bindDragDelegation();
        this._bindDropzones();
        this._bindAgeEvents();
        this._bindLuck();
        this._bindFormSubmitEvent();
    }

    _bindNavigationEvents() {
        const { nextBtn, prevBtn } = this.el;
        if (nextBtn) nextBtn.addEventListener("click", this.nextStepHandler);
        if (prevBtn) prevBtn.addEventListener("click", () => this.prevStep());
    }

    _bindSkillsEvents() {
        document.querySelectorAll('input[name="skills"]').forEach(checkbox =>
            checkbox.addEventListener("change", event => this._toggleSkill(event))
        );
        if (this.el.skillsCounter) this.el.skillsCounter.textContent = this.state.selectedSkills.length;
    }

    _bindDragDelegation() {
        document.addEventListener("dragstart", e => {
            const target = e.target;
            if (!target || !target.classList || !target.classList.contains("stat-number")) return;
            this._draggingElement = target;
            try {
                e.dataTransfer.setData("text/plain", target.textContent);
                e.dataTransfer.effectAllowed = "move";
            } catch (err) {
            }
            target.classList.add("dragging");
        });

        document.addEventListener("dragend", e => {
            const target = e.target;
            if (target && target.classList) target.classList.remove("dragging");
            this._draggingElement = null;
        });
    }

    _bindDropzones() {
        const charDropzones = document.querySelectorAll("#statTargets .stat-dropzone");
        charDropzones.forEach(zone => this._attachDropzone(zone, false));

        const skillDropzones = document.querySelectorAll("#skill_distribution .stat-dropzone");
        skillDropzones.forEach(zone => this._attachDropzone(zone, true));
    }

    _attachDropzone(zone, isSkill) {
        zone.addEventListener("dragover", e => {
            e.preventDefault();
            zone.classList.add("dragover");
        });
        zone.addEventListener("dragleave", () => {
            zone.classList.remove("dragover");
        });
        zone.addEventListener("drop", e => {
            e.preventDefault();
            zone.classList.remove("dragover");
            const value = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || (this._draggingElement && this._draggingElement.textContent);
            const dragged = this._draggingElement || document.querySelector(".stat-number.dragging");

            if (zone.dataset.filled === "true") {
                const oldValue = zone.textContent.trim();
                if (isSkill) this._returnSkillNumberToPool(oldValue);
                else this._returnNumberToPool(oldValue);
            }

            if (isSkill) this._placeSkillValue(zone, value);
            else this._placeStatValue(zone, value);

            if (dragged && dragged.closest("#statPool")) {
                dragged.remove();
            } else if (dragged && dragged.closest("#statPoolSkill")) {
                dragged.remove();
            } else if (dragged && dragged.closest(".stat-dropzone")) {
                const oldZone = dragged.closest(".stat-dropzone");
                if (oldZone) {
                    oldZone.textContent = "Перетащите сюда";
                    oldZone.dataset.filled = "false";
                    const hiddenInput = oldZone.closest(".stat-group")?.querySelector("input[type=hidden]");
                    if (hiddenInput) hiddenInput.value = "";
                }
            }
            if (this._draggingElement) {
                this._draggingElement.classList.remove("dragging");
                this._draggingElement = null;
            }
        });
    }

    _ensureDraggable(numDiv) {
        if (!numDiv) return;
        numDiv.draggable = true;
    }

    // ---------- NAV/STEP HANDLERS ----------
    _handleStepFour() {
        this._hideSkill(true);
        this._populateSkillStatPool([70, 60, 60, 50, 50, 50, 40, 40, 40]);
        this._redirectNextButton();
    }

    _handlerStepFourAlt() {
        const poolNumbers = document.querySelectorAll("#statPoolSkill .stat-number");
        const filledDropzones = document.querySelectorAll("#skill_distribution .stat-dropzone[data-filled='true']");
        if (poolNumbers.length > 0 || filledDropzones.length < 9) {
            alert("Распределите все числа по профессиональным навыкам");
            return false;
        }
        this._hideSkill(false);
        this._populateSkillStatPool([20, 20, 20, 20]);
        this._undoRedirectNextButton();
    }

    _redirectNextButton() {
        const nextBtn = this.el.nextBtn;
        if (!nextBtn) return;
        this.alternativeNextHandler = () => this._handlerStepFourAlt();
        nextBtn.removeEventListener("click", this.nextStepHandler);
        nextBtn.addEventListener("click", this.alternativeNextHandler);
    }

    _undoRedirectNextButton() {
        const nextBtn = this.el.nextBtn;
        if (!nextBtn || !this.alternativeNextHandler) return;
        nextBtn.removeEventListener("click", this.alternativeNextHandler);
        nextBtn.addEventListener("click", this.nextStepHandler);
    }

    _hideSkill(isProffesion) {
        const labels = document.querySelectorAll('#skill_distribution .stat-group label');
        labels.forEach(label => {
            const item = label.closest('.stat-group');
            if (!item) return;

            const text = label.dataset.name;
            let isSelected;
            if (isProffesion) {
                isSelected = this.state.selectedSkills.includes(text);
                if (text == "Средства") isSelected = true;
            } else {
                isSelected = !this.state.selectedSkills.includes(text);
                if (text == "Средства") isSelected = false;
            }

            if (isSelected) {
                item.style.display = '';
                item.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = false);
            } else {
                item.style.display = 'none';
                item.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = true);
            }
        });
    }

    // ---------- POOL / PLACEMENT ----------
    _populateSkillStatPool(numbers) {
        const pool = this.el.statPoolSkill;
        if (!pool) return;

        if (!Array.isArray(numbers)) {
            console.warn('_populateSkillStatPool: ожидается массив чисел');
            return;
        }

        pool.innerHTML = '';
        const frag = document.createDocumentFragment();

        numbers.forEach(num => {
            const text = String(num).trim();
            if (text === '') return;

            const numDiv = document.createElement('div');
            numDiv.className = 'stat-number';
            numDiv.textContent = text;
            this._ensureDraggable(numDiv);
            frag.appendChild(numDiv);
        });

        pool.appendChild(frag);
    }

    _placeStatValue(zone, value) {
        if (!zone) return;
        zone.dataset.filled = "true";

        const hiddenInput = zone.closest(".stat-group")?.querySelector("input[type=hidden]");
        if (hiddenInput) {
            hiddenInput.value = value;
            const statKey = hiddenInput.name.match(/\[(.*?)\]/)?.[1];
            if (statKey) this.state.currentStats[statKey] = parseInt(value, 10);
        }

        zone.innerHTML = "";
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        zone.appendChild(numDiv);
    }

    _placeSkillValue(zone, value) {
        if (!zone) return;
        zone.dataset.filled = "true";

        const hiddenInput = zone.closest(".stat-group")?.querySelector("input[type=hidden]");
        if (hiddenInput) {
            hiddenInput.value = value;
            const skillKey = hiddenInput.name.match(/\[(.*?)\]/)?.[1];
            if (skillKey) this.state.currentSkills[skillKey] = parseInt(value, 10);
        }

        zone.innerHTML = "";
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        zone.appendChild(numDiv);
    }

    _returnNumberToPool(value) {
        const pool = this.el.statPool;
        if (!pool) return;
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        pool.appendChild(numDiv);
    }

    _returnSkillNumberToPool(value) {
        const pool = this.el.statPoolSkill;
        if (!pool) return;
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        pool.appendChild(numDiv);
    }

    // ---------- SKILL SELECTION UI ----------
    _toggleSkill(event) {
        const { checked, value, dataset } = event.target;
        const name = dataset.name;
        if (checked) {
            if (this.state.selectedSkills.length >= this.state.maxSkills) {
                event.target.checked = false;
                alert(`Можно выбрать только ${this.state.maxSkills} навыков`);
                return;
            }
            this.state.selectedSkills.push(name);
        } else {
            this.state.selectedSkills = this.state.selectedSkills.filter(skill => skill !== name);
        }
        if (this.el.skillsCounter) this.el.skillsCounter.textContent = String(this.state.selectedSkills.length);
        this._renderSelectedSkills();
    }

    _renderSelectedSkills() {
        const list = this.el.selectedSkillsList;
        if (!list) return;
        list.innerHTML = "";

        this.state.selectedSkills.forEach(skill => {
            const wrapper = document.createElement("div");
            wrapper.className = "selected-skill";

            const textNode = document.createElement("span");
            textNode.textContent = skill;

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "remove-skill";
            btn.dataset.skill = skill;
            btn.textContent = "×";
            btn.addEventListener("click", (event) => {
                const skillName = event.target.dataset.skill;
                const checkbox = document.querySelector(`input[name="skills"][value="${skillName}"]`);
                if (checkbox) checkbox.checked = false;
                this.state.selectedSkills = this.state.selectedSkills.filter(s => s !== skillName);
                if (this.el.skillsCounter) this.el.skillsCounter.textContent = String(this.state.selectedSkills.length);
                this._renderSelectedSkills();
            });

            wrapper.appendChild(textNode);
            wrapper.appendChild(btn);
            list.appendChild(wrapper);
        });
    }

    // ---------- STEP 5: LUCK ----------
    _handleStepFive() {
        const age = document.getElementById("ageRange");
        const luckTryElement = this.el.luckTryNum;
        if (age && age.value === "15_19") {
            this.state.luckTry = 2;
            this.state.luckFlag = true;
        }
        if (luckTryElement) luckTryElement.textContent = this.state.luckTry;
    }

    _bindLuck() {
        if (this.el.rollLuckBtn) this.el.rollLuckBtn.addEventListener("click", () => this._rollLuck());
    }

    _rollLuck() {
        if (this.state.luckTry <= 0) return;
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = (dice1 + dice2 + dice3) * 5;

        const resultElement = this.el.luckRollResult;
        const luckTryElement = this.el.luckTryNum;

        if (resultElement) {
            resultElement.innerHTML = `
                <div class="luck-dice">
                    <div class="dice-value">${dice1}</div>
                    <div class="dice-value">${dice2}</div>
                    <div class="dice-value">${dice3}</div>
                </div>
                <div class="luck-total">Удача: ${total}</div>
            `;
        }

        this.state.luckValue = total;
        if (this.el.luckValueInput) this.el.luckValueInput.value = String(total);

        this.state.luckTry--;
        if (luckTryElement) luckTryElement.textContent = this.state.luckTry;

        if (this.state.luckFlag) {
            if (this.state.luckPreviousValue > total) {
                this.state.luckValue = this.state.luckPreviousValue;
                if (this.el.luckValueInput) this.el.luckValueInput.value = String(this.state.luckPreviousValue);
                if (resultElement) {
                    resultElement.innerHTML = `
                        <div class="luck-dice">
                            <div class="dice-value">${dice1}</div>
                            <div class="dice-value">${dice2}</div>
                            <div class="dice-value">${dice3}</div>
                        </div>
                        <div class="luck-total">Удача: ${total}</div>
                        <p class="success">Прошлое значение ${this.state.luckPreviousValue} было больше, останется оно.</p>
                    `;
                }
            }
            this.state.luckPreviousValue = total;
        }
    }

    // ---------- NAVIGATION: next/prev ----------
    nextStep() {
        if (!this._validateCurrentStep()) return;
        this._toggleCurrentStep(false);
        this.state.currentStep++;
        if (this.state.currentStep === 3) this._updateAgeStats();
        if (this.state.currentStep === 4) this._handleStepFour();
        if (this.state.currentStep === 5) this._handleStepFive();
        this._updateProgress();
        this._toggleCurrentStep(true);
        this._updateNavigationButtons();
    }

    prevStep() {
        this._toggleCurrentStep(false);
        this.state.currentStep--;
        this._updateProgress();
        this._toggleCurrentStep(true);
        this._updateNavigationButtons();
    }

    _toggleCurrentStep(show) {
        const el = document.querySelector(`.form-step[data-step="${this.state.currentStep}"]`);
        if (el) el.classList.toggle("active", show);
    }

    _updateProgress() {
        const progressPercentage = (this.state.currentStep - 1) / (this.state.totalSteps - 1) * 100;
        if (this.el.progressFill) this.el.progressFill.style.width = `${progressPercentage}%`;
        if (this.el.steps && this.el.steps.length) {
            this.el.steps.forEach((step, index) => {
                step.classList.toggle("active", index + 1 <= this.state.currentStep);
            });
        }
    }

    _updateNavigationButtons() {
        const prevButton = this.el.prevBtn;
        const nextButton = this.el.nextBtn;
        const submitButton = this.el.submitBtn;
        if (prevButton) prevButton.disabled = this.state.currentStep === 1;
        if (nextButton) nextButton.style.display = this.state.currentStep === this.state.totalSteps ? "none" : "block";
        if (submitButton) submitButton.style.display = this.state.currentStep === this.state.totalSteps ? "block" : "none";
    }

    // ---------- VALIDATION ----------
    _validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.state.currentStep}"]`);
        if (!currentStepElement) return true;
        const requiredInputs = currentStepElement.querySelectorAll("input[required], select[required]");
        for (let input of requiredInputs) {
            if (!input.value.trim()) {
                alert("Заполните все обязательные поля");
                input.focus();
                return false;
            }
        }
        if (this.state.currentStep === 1 && this.state.selectedSkills.length !== this.state.maxSkills) {
            alert(`Выберите ровно ${this.state.maxSkills} навыков`);
            return false;
        }
        if (this.state.currentStep === 2) {
            const poolNumbers = document.querySelectorAll("#statPool .stat-number");
            const filledDropzones = document.querySelectorAll(".stat-dropzone[data-filled='true']");
            if (poolNumbers.length > 0 || filledDropzones.length < 8) {
                alert("Распределите все числа по характеристикам");
                return false;
            }
        }
        if (this.state.currentStep === 3 && document.getElementById('ageRange')?.selectedIndex === 0) {
            alert("Выберите возраст");
            return false;
        }
        if (this.state.currentStep === 3 && this.state.eduImprovementCurrent !== this.state.eduImprovementMax) {
            alert("Пройдите проверки образования");
            return false;
        }
        if (this.state.currentStep === 4) {
            const poolNumbers = document.querySelectorAll("#statPoolSkill .stat-number");
            const filledDropzones = document.querySelectorAll(".stat-dropzone[data-filled='true']");
            if (poolNumbers.length > 0 || filledDropzones.length < 4) {
                alert("Распределите все числа по навыкам хобби");
                return false;
            }
        }
        if (this.state.currentStep === 5 && this.state.luckTry !== 0) {
            alert(this.state.luckTry);
            return false;
        }
        return true;
    }

    // ---------- AGE / EDU ----------
    _bindAgeEvents() {
        const { ageRange, rollEduButton, applyAgePenaltyButton } = this.el;
        if (ageRange) ageRange.addEventListener("change", event => this._handleAgeChange(event));
        if (rollEduButton) rollEduButton.addEventListener("click", () => this._rollEduImprovement());
        document.querySelectorAll('#agePenaltyPopup .stat-btn').forEach(button => {
            button.addEventListener('click', event => this._changeAgePenalty(event));
        });
        if (applyAgePenaltyButton) applyAgePenaltyButton.addEventListener("click", () => this._applyAgePenalty());
    }

    _handleAgeChange(event) {
        const age = event.target.value;
        const modifiersInfo = this.el.modifiersInfo;
        const eduSection = this.el.eduSection;
        const modifiersList = this.el.modifiersList;
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
        this.state.ageModifierSpeed = modifiers?.speed || 0;
        if (modifiersInfo) modifiersInfo.style.display = "block";
        if (modifiersList) modifiersList.innerHTML = modifiers?.text ? `<p>${modifiers.text}</p>` : "";

        if (!this.state.baseStats) {
            this.state.baseStats = JSON.parse(JSON.stringify(this.state.currentStats));
        }
        // restore from base and then apply modifiers
        this.state.currentStats = JSON.parse(JSON.stringify(this.state.baseStats));
        this.state.agePenalties = { str: 0, dex: 0, con: 0 };

        if (eduSection) eduSection.style.display = ["15_19", "20_39"].includes(age) ? "none" : "block";
        if (eduSection && eduSection.style.display === "block" && this.el.currentEDU) {
            this.el.currentEDU.textContent = this.state.currentStats.edu;
        }

        if (modifiers) {
            for (const key in modifiers) {
                if (["text", "improvement", "speed", "penalties"].includes(key)) continue;
                const delta = modifiers[key];
                if (typeof delta === "number" && this.state.currentStats.hasOwnProperty(key)) {
                    this.state.currentStats[key] = clamp(this.state.currentStats[key] + delta);
                }
            }
            this.state.eduImprovementMax = modifiers.improvement || 0;
            this.state.eduImprovementCurrent = 0;
        } else {
            this.state.eduImprovementMax = 0;
        }

        this.state.currentAgePenaltyTotal = modifiers?.penalties || 0;
        if (this.state.currentAgePenaltyTotal > 0) {
            if (this.el.agePenaltyTotal) this.el.agePenaltyTotal.textContent = String(this.state.currentAgePenaltyTotal);
            if (this.el.agePenaltyRemaining) this.el.agePenaltyRemaining.textContent = String(this.state.currentAgePenaltyTotal);
            const penaltyStr = document.getElementById("penalty_str");
            const penaltyDex = document.getElementById("penalty_dex");
            const penaltyCon = document.getElementById("penalty_con");
            if (penaltyStr) penaltyStr.value = 0;
            if (penaltyDex) penaltyDex.value = 0;
            if (penaltyCon) penaltyCon.value = 0;
            if (this.el.agePenaltyPopup) this.el.agePenaltyPopup.style.display = "flex";
        }

        this._updateAgeStats();
    }

    _applyAgePenalty() {
        const total = this.state.currentAgePenaltyTotal;
        const strengthPenalty = parseInt(document.getElementById("penalty_str").value, 10) || 0;
        const dexterityPenalty = parseInt(document.getElementById("penalty_dex").value, 10) || 0;
        const constitutionPenalty = parseInt(document.getElementById("penalty_con").value, 10) || 0;
        if (strengthPenalty + dexterityPenalty + constitutionPenalty !== total) {
            alert("Нужно распределить все штрафные очки!");
            return;
        }
        const clamp = value => Math.max(1, value);
        this.state.currentStats.str = clamp(this.state.currentStats.str - strengthPenalty);
        this.state.currentStats.dex = clamp(this.state.currentStats.dex - dexterityPenalty);
        this.state.currentStats.con = clamp(this.state.currentStats.con - constitutionPenalty);
        this.state.agePenalties = { str: strengthPenalty, dex: dexterityPenalty, con: constitutionPenalty };
        if (this.el.agePenaltyPopup) this.el.agePenaltyPopup.style.display = "none";
        this._updateAgeStats();
    }

    _changeAgePenalty(event) {
        const { stat, action } = event.target.dataset;
        const input = document.getElementById(stat);
        if (!input) return;
        let value = parseInt(input.value, 10) || 0;
        const strengthPenalty = parseInt(document.getElementById("penalty_str").value, 10) || 0;
        const dexterityPenalty = parseInt(document.getElementById("penalty_dex").value, 10) || 0;
        const constitutionPenalty = parseInt(document.getElementById("penalty_con").value, 10) || 0;
        const used = strengthPenalty + dexterityPenalty + constitutionPenalty;
        const remaining = this.state.currentAgePenaltyTotal - used;
        const operations = {
            increase: () => {
                if (remaining > 0) value += 1;
            },
            "increase+": () => {
                if (remaining > 0) {
                    const increment = Math.min(10, remaining);
                    value += increment;
                }
            },
            decrease: () => {
                if (value > 0) value -= 1;
            }
        };
        if (operations[action]) operations[action]();
        input.value = value;
        const newUsed =
            parseInt(document.getElementById("penalty_str").value, 10) +
            parseInt(document.getElementById("penalty_dex").value, 10) +
            parseInt(document.getElementById("penalty_con").value, 10);
        if (this.el.agePenaltyRemaining) this.el.agePenaltyRemaining.textContent = String(this.state.currentAgePenaltyTotal - newUsed);
    }

    _rollEduImprovement() {
        if (this.state.eduImprovementCurrent >= this.state.eduImprovementMax) return;
        const roll = Math.floor(Math.random() * 100) + 1;
        const currentEducation = this.state.currentStats.edu;
        const resultElement = this.el.eduImprovementResult;
        if (resultElement) resultElement.innerHTML = `<p>Бросок: ${roll} (нужно > ${currentEducation})</p>`;
        if (roll > currentEducation) {
            const increment = Math.floor(Math.random() * 10) + 1;
            this.state.currentStats.edu = Math.min(currentEducation + increment, 99);
            if (resultElement) resultElement.innerHTML += `<p class="success">Успех! ОБР +${increment}, теперь ${this.state.currentStats.edu}</p>`;
        } else {
            if (resultElement) resultElement.innerHTML += `<p class="failure">Провал! ОБР остаётся ${currentEducation}</p>`;
        }
        this._updateAgeStats();
        if (this.el.currentEDU) this.el.currentEDU.textContent = String(this.state.currentStats.edu);
        this.state.eduImprovementCurrent++;
        const eduRemainingEl = document.getElementById("eduImprovement");
        if (eduRemainingEl) eduRemainingEl.textContent = String(this.state.eduImprovementMax - this.state.eduImprovementCurrent);
    }

    _updateAgeStats() {
        Object.entries(this.state.currentStats).forEach(([stat, value]) => {
            const element = document.getElementById(`ageStep${stat}`);
            if (element) element.textContent = String(value);
        });
        const eduRemainingEl = document.getElementById("eduImprovement");
        if (eduRemainingEl) eduRemainingEl.textContent = String(this.state.eduImprovementMax - this.state.eduImprovementCurrent);
    }

    // ---------- SIMPLE GETTERS ----------
    _getSanity() {
        return this.state.currentStats.pow;
    }

    _getHitPoints() {
        return Math.floor((this.state.currentStats.siz + this.state.currentStats.con) / 10);
    }

    _getMagicPoints() {
        return Math.floor(this.state.currentStats.pow / 5);
    }

    _getSpeed() {
        if (this.state.currentStats.dex > this.state.currentStats.con && this.state.currentStats.str > this.state.currentStats.con) {
            return 9 - this.state.ageModifierSpeed;
        } else if (this.state.currentStats.dex >= this.state.currentStats.con || this.state.currentStats.str >= this.state.currentStats.con) {
            return 8 - this.state.ageModifierSpeed;
        } else {
            return 7 - this.state.ageModifierSpeed;
        }
    }

    _getDamageBonus() {
        const value = this.state.currentStats.str + this.state.currentStats.con;
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
        return document.getElementById("charName")?.value || "";
    }

    _getAge() {
        return document.getElementById("ageRange")?.value || "";
    }

    _getAppearance() {
        return document.getElementById("appearanceDesc")?.value || "";
    }

    _getBackstory() {
        return document.getElementById("backstory")?.value || "";
    }

    _getEquipment() {
        return document.getElementById("equipment")?.value || "";
    }

    _calculateStartingStats() {
        this.state.currentSkills.dodge = Math.floor(this.state.currentStats.dex / 2);
        this.state.currentSkills.language_own = this.state.currentStats.edu;
    }

    // ---------- SUBMIT ----------
    async _handleSubmit(event) {
        event.preventDefault();
        this._calculateStartingStats()
        const result = {
            "name": this._getCharacterName(),
            "age": this._getAge(),
            "proffesion": document.getElementById("profession")?.value || "",
            "stat": this.state.currentStats,
            "skill": this.state.currentSkills,
            "proffesionalSkill": this.state.selectedSkills,
            "sanity": this._getSanity(),
            "hp": this._getHitPoints(),
            "mp": this._getMagicPoints(),
            "speed": this._getSpeed(),
            "luck": this.state.luckValue,
            "damageUp": this._getDamageBonus().damageBonus,
            "damageReduction": this._getDamageBonus().damageReduction,
            "appearance": this._getAppearance(),
            "backstory": this._getBackstory(),
            "equipment": this._getEquipment(),
            "weapons": [
                {
                    "id": (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

    _bindFormSubmitEvent() {
        if (this.el.characterForm) {
            this.el.characterForm.addEventListener("submit", event => this._handleSubmit(event));
        }
    }
}

document.addEventListener("DOMContentLoaded", () => new CoCCharacterCreator());


