class CoCCharacterCreator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;

        // Навыки
        this.selectedSkills = [];
        this.maxSkills = 8;

        // Характеристики
        this.totalPoints = 290;
        this.pointsLeft = this.totalPoints;
        this.currentStats = this.initStats();
        this.currentSkills = this.initSkills();

        // Очки умений
        this.skillPointProfessional = 0;
        this.skillPointProfessionalLess = 0;
        this.skillPointChoice = "edu";
        this.skillPointFlag = true;

        // Образование
        this.EduImprovementCurrent = 0;
        this.EduImprovementMax = 0;

        // Удача
        this.luckValue = 0;
        this.luckTry = 1;
        this.luckPreVal = 0;
        this.luckFlag = false;

        // Скорость
        this.ageModifierSpeed = 0

        this.bindEvents();
        this.updateUI();
    }

    // ================= ИНИЦИАЛИЗАЦИЯ =================
    initStats() {
        return Object.fromEntries(
            [...document.querySelectorAll(".stats-grid input")]
                .map(input => [input.id, parseInt(input.value)])
        );
    }

    initSkills() {
        return Object.fromEntries(
            [...document.querySelectorAll("[id^=skill_alloc_]")]
                .map(input => [input.id.replace("skill_alloc_", ""), parseInt(input.value)])
        );
    }

    bindEvents() {
        const $ = id => document.getElementById(id);

        // Навигация
        this.funcForNextBtn = () => this.nextStep()
        $("nextBtn").addEventListener("click", this.funcForNextBtn);
        $("prevBtn").addEventListener("click", () => this.prevStep());
        $("rollLuck")?.addEventListener("click", () => this.rollLuck());

        // Навыки (шаг 1)
        document.querySelectorAll('input[name="skills"]').forEach(cb =>
            cb.addEventListener("change", e => this.toggleSkill(e))
        );

        // Характеристики (шаг 2)
        document.getElementById("skill_choice").querySelectorAll(".stat-btn").forEach(btn =>
            btn.addEventListener("click", e => this.changeStat(e))
        );

        // Возраст (шаг 3)
        $("ageRange").addEventListener("change", e => this.handleAgeChange(e));
        $("rollEduImprovement")?.addEventListener("click", () => this.rollEduImprovement());

        // Шаг 4 (модальное окно)
        ["popupButton1", "popupButton2"].forEach(id =>
            $(id).addEventListener("click", e => this.stepFourModalChoiceHandler(e))
        );

        document.getElementById("skill_distribution").querySelectorAll(".stat-btn").forEach(btn =>
            btn.addEventListener("click", e => this.changeSkill(e))
        );

        // Сабмит
        $("characterForm").addEventListener("submit", e => this.handleSubmit(e));
    }

    updateUI() {
        this.updateProgress();
        this.updateNavButtons();
        this.updatePointsDisplay();
        this.updateStatButtons();
        this.updateAgeStats();
    }

    // ================= ХАРАКТЕРИСТИКИ =================
    changeStat(e) {
        const { stat, action } = e.target.dataset;
        const input = document.getElementById(stat);
        const minValue = ["size", "intelligence"].includes(stat) ? 40 : 15;

        let value = parseInt(input.value);

        const ops = {
            increase: () => value < 90 && this.pointsLeft-- > 0 && value++,
            "increase+": () => {
                const inc = Math.min(10, 90 - value, this.pointsLeft);
                value += inc; this.pointsLeft -= inc;
            },
            decrease: () => value > minValue && (value--, this.pointsLeft++)
        };

        ops[action]?.();

        this.currentStats[stat] = value;
        input.value = value;

        this.updatePointsDisplay();
        this.updateStatButtons();
        this.updateAgeStats();
    }

    updatePointsDisplay() {
        const el = document.getElementById("pointsLeft");
        el.textContent = this.pointsLeft;
        el.style.color = this.pointsLeft === 0 ? "#4CAF50"
            : this.pointsLeft < 0 ? "#ff6b6b"
            : "#c9a86d";
    }

    updateStatButtons() {
        document.querySelectorAll(".stat-btn").forEach(btn => {
            const { stat, action } = btn.dataset;
            const value = this.currentStats[stat];
            const minValue = ["size", "intelligence"].includes(stat) ? 40 : 15;

            btn.disabled =
                (action.startsWith("increase") && (value >= 90 || this.pointsLeft <= 0)) ||
                (action === "decrease" && value <= minValue);
        });
    }

    // ================= НАВЫКИ =================
    toggleSkill(e) {
        const { checked, value, dataset } = e.target;
        console.log(checked, value, dataset)
        if (checked) {
            if (this.selectedSkills.length >= this.maxSkills) {
                e.target.checked = false;
                return alert(`Можно выбрать только ${this.maxSkills} навыков`);
            }
            this.selectedSkills.push(dataset.name);
        } else {
            this.selectedSkills = this.selectedSkills.filter(s => s !== dataset.name);
        }
        document.getElementById("skillsCounter").textContent = this.selectedSkills.length;
        this.renderSelectedSkills();
    }

    renderSelectedSkills() {
        const list = document.getElementById("selectedSkillsList");
        list.innerHTML = this.selectedSkills.map(skill =>
            `<div class="selected-skill">
                ${skill} <button type="button" class="remove-skill" data-skill="${skill}">×</button>
             </div>`
        ).join("");

        list.querySelectorAll(".remove-skill").forEach(btn =>
            btn.addEventListener("click", e => {
                const skill = e.target.dataset.skill;
                const cb = document.querySelector(`input[name="skills"][value="${skill}"]`);
                if (cb) cb.checked = false;
                this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
                document.getElementById("skillsCounter").textContent = this.selectedSkills.length;
                this.renderSelectedSkills();
            })
        );
    }

    // ================= ШАГ 4 =================
    stepFour() {
        this.calcStartStat()
        this.disableNoProffesionSkill()
        this.redirectNextBtn()

        const formula = document.getElementById("skillPointFormula").value;
        ["scientist", "actor"].includes(formula)
            ? this.skillPointFormula()
            : this.stepFourModal(formula);
    }

    disableNoProffesionSkill() {
        document.getElementById("skill_distribution").querySelectorAll('.stat-btn').forEach(btn => {
            const skillId = btn.dataset.skillRus;
            var isEnabled = this.selectedSkills.includes(skillId);
            if (skillId == 'Средства') isEnabled = true;

            btn.disabled = !isEnabled;
            btn.style.opacity = isEnabled ? '1' : '0.5';
            btn.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
        });
    }

    disableProffesionSkill() {
        document.getElementById("skill_distribution").querySelectorAll('.stat-btn').forEach(btn => {
            const skillId = btn.dataset.skillRus;
            var isEnabled = this.selectedSkills.includes(skillId);
            if (skillId != 'Средства') isEnabled = true;

            btn.disabled = isEnabled;
            btn.style.opacity = isEnabled ? '0.5' : '1';
            btn.style.cursor = isEnabled ? 'not-allowed' : 'pointer';
        });
    }

    distributionNoProffesionSkill() {
        if (this.skillPointProfessional != this.skillPointProfessionalLess) {
                return alert("Потрате все очки профессиональных навыков")
            }
        if (this.skillPointFlag) {
            this.disableProffesionSkill()
            const maxPoint = document.getElementById("skillPointsMax");
            const leftPoint = document.getElementById("skillPointsLeft");
            this.skillPointProfessional = this.currentStats["edu"] * 2
            this.skillPointProfessionalLess = 0
            maxPoint.innerHTML = `Распределите <strong>${this.skillPointProfessional} поинтов</strong> между навыками хобби`;
            leftPoint.textContent = this.skillPointProfessional;
            this.skillPointFlag = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else {
            this.undoRedirectNextBtn()
        }
    }

    redirectNextBtn() {
        this.alterFuncForNextBtn = () => this.distributionNoProffesionSkill();
        document.getElementById("nextBtn").removeEventListener("click", this.funcForNextBtn);
        document.getElementById("nextBtn").addEventListener("click", this.alterFuncForNextBtn);
    }

    undoRedirectNextBtn() {
        document.getElementById("nextBtn").removeEventListener("click", this.alterFuncForNextBtn);
        document.getElementById("nextBtn").addEventListener("click", this.funcForNextBtn);
        this.funcForNextBtn()
    }

    calcStartStat() {
        this.currentSkills["dodge"] = this.currentStats["dex"] / 2
        this.currentSkills["language_own"] = this.currentStats["edu"]
        const dodge = document.getElementById("skill_alloc_dodge");
        const language_own = document.getElementById("skill_alloc_language_own");
        dodge.value = this.currentSkills["dodge"]
        language_own.value = this.currentSkills["language_own"]
    }

    stepFourModal(formula) {
        const modal = document.getElementById("choicePopup");
        modal.style.display = "flex";

        const popupQuestion = modal.querySelector("p");
        const [btn1, btn2] = ["popupButton1", "popupButton2"].map(id => document.getElementById(id));

        const options = {
            athlete: ["Сила", "Ловкость", "str", "dex"],
            default: ["Внешность", "Мощь", "app", "pow"]
        };
        const [text1, text2, val1, val2] = options[formula] || options.default;

        popupQuestion.textContent = formula === "athlete" ? "Сила или Ловкость?" : "Внешность или Мощь?";
        btn1.nextElementSibling.textContent = text1; btn1.dataset.value = val1;
        btn2.nextElementSibling.textContent = text2; btn2.dataset.value = val2;
    }

    stepFourModalChoiceHandler(e) {
        const cb = e.target;
        if (cb.checked) {
            const other = cb.id === "popupButton1" ? "popupButton2" : "popupButton1";
            document.getElementById(other).checked = false;
            this.skillPointChoice = cb.dataset.value;
            this.skillPointFormula();
        }
    }

    skillPointFormula() {
        const formula = document.getElementById("skillPointFormula").value;
        const modal = document.getElementById("choicePopup");
        const space = document.getElementById("step_4_formula_wait");
        const maxPoint = document.querySelector("#skillPointsMax strong");
        const leftPoint = document.getElementById("skillPointsLeft");
        const textFormula = document.getElementById("skill_formula");

        const formulas = {
            scientist: {
                calc: () => this.currentStats.edu * 4,
                text: "Образование * 4"
            },
            actor: {
                calc: () => this.currentStats.edu * 2 + this.currentStats.app * 2,
                text: "Образование * 2 + Внешность * 2"
            },
            athlete: {
                calc: () => this.currentStats.edu * 2 + this.currentStats[this.skillPointChoice] * 2,
                text: `Образование * 2 + ${this.skillPointChoice === "str" ? "Сила" : "Ловкость"} * 2`
            },
            fanatic: {
                calc: () => this.currentStats.edu * 2 + this.currentStats[this.skillPointChoice] * 2,
                text: `Образование * 2 + ${this.skillPointChoice === "app" ? "Внешность" : "Мощь"} * 2`
            }
        };

        const { calc, text } = formulas[formula] || formulas.scientist;
        this.skillPointProfessional = calc();
        textFormula.textContent = `Распределите очки навыков (основа: ${text})`;

        maxPoint.textContent = `${this.skillPointProfessional} поинтов`;
        leftPoint.textContent = this.skillPointProfessional;

        space.style.display = "";
        modal.style.display = "none";
    }

    changeSkill(e) {
        const { skill, action } = e.target.dataset;
        const input = document.getElementById(`skill_alloc_${skill}`);
        const skillPointsLeftEl = document.getElementById("skillPointsLeft");
        const baseValue = input.minValue || 0;
        let value = this.currentSkills[skill];
        const pointsAvailable = this.skillPointProfessional - this.skillPointProfessionalLess;

        const ops = {
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

        ops[action]?.();

        this.currentSkills[skill] = value;
        input.value = value;
        skillPointsLeftEl.textContent = this.skillPointProfessional - this.skillPointProfessionalLess;
    }

    // ================= ШАГ 5 =================

    stepFive(){
        const age = document.getElementById("ageRange")
        if (age.value == "15_19") {
            this.luckTry = 2
            this.luckFlag = true
        }
    }

    rollLuck() {
        if (this.luckTry > 0) {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const dice3 = Math.floor(Math.random() * 6) + 1;
            const total = (dice1 + dice2 + dice3) * 5;
            
            const resultElement = document.getElementById("luckRollResult");
            const luckTryNum = document.querySelector("#luckTryNum strong");
            
            
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
            this.luckTry--
            luckTryNum.textContent = this.luckTry

            if (this.luckFlag)
            {
                if (this.luckPreVal > total) {
                    this.luckValue = this.luckPreVal;
                    document.getElementById("luckValue").value = this.luckPreVal;
                    resultElement.innerHTML = `
                        <div class="luck-dice">
                            <div class="dice-value">${dice1}</div>
                            <div class="dice-value">${dice2}</div>
                            <div class="dice-value">${dice3}</div>
                        </div>
                        <div class="luck-total">Удача: ${total}</div>
                        <p class="success">Прошлое значение ${this.luckPreVal} было больше, останется оно.</p>
                    `;
                }
                this.luckPreVal = total
            }
        }
    }

    // ================= ДРУГОЕ =================
    nextStep() {
        if (!this.validateStep()) return;  // TODO: включить в продакшене
        this.toggleStep(false);
        this.currentStep++;
        if (this.currentStep === this.totalSteps) this.renderSummary();
        if (this.currentStep === 3) this.updateAgeStats();
        if (this.currentStep === 4) this.stepFour();
        if (this.currentStep === 5) this.stepFive();
        this.updateProgress();
        this.toggleStep(true);
        this.updateNavButtons();
    }

    prevStep() {
        this.toggleStep(false);
        this.currentStep--;
        this.updateProgress();
        this.toggleStep(true);
        this.updateNavButtons();
    }

    toggleStep(show) {
        document.querySelector(`.form-step[data-step="${this.currentStep}"]`)
            .classList.toggle("active", show);
    }

    updateProgress() {
        const pct = (this.currentStep - 1) / (this.totalSteps - 1) * 100;
        document.getElementById("progressFill").style.width = `${pct}%`;
        document.querySelectorAll(".step").forEach((s, i) =>
            s.classList.toggle("active", i + 1 <= this.currentStep)
        );
    }

    updateNavButtons() {
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const submitBtn = document.getElementById("submitBtn");
        prevBtn.disabled = this.currentStep === 1;
        nextBtn.style.display = this.currentStep === this.totalSteps ? "none" : "block";
        submitBtn.style.display = this.currentStep === this.totalSteps ? "block" : "none";
    }

    validateStep() {
        const inputs = document.querySelector(`.form-step[data-step="${this.currentStep}"]`)
            .querySelectorAll("input[required], select[required]");
        for (let input of inputs) {
            if (!input.value.trim()) {
                alert("Заполните все обязательные поля");
                input.focus();
                return false;
            }
        }
        if (this.currentStep === 1 && this.selectedSkills.length !== this.maxSkills) {
            return alert(`Выберите ровно ${this.maxSkills} навыков`), false;
        }
        if (this.currentStep === 2 && this.pointsLeft !== 0) {
            return alert("Распределите все очки характеристик"), false;
        }
        if (this.currentStep === 3 && document.getElementById('ageRange').selectedIndex === 0) {
            return alert("Выберите возраст"), false;
        }
        if (this.currentStep === 3 && this.EduImprovementCurrent != this.EduImprovementMax) {
            return alert("Пройдите проврки образования"), false;
        }
        if (this.currentStep === 4 && this.skillPointProfessionalLess != this.skillPointProfessional) {
            return alert("Потратьте все очки хобби"), false;
        }
        if (this.currentStep === 5 && this.luckTry != 0) {
            return alert(this.luckTry), false;
        }
        return true;
    }

    // ================= ВОЗРАСТ =================
    handleAgeChange(e) {
        const age = e.target.value;
        const modifiersInfo = document.getElementById("ageModifiersInfo");
        const eduSection = document.getElementById("eduImprovementSection");
        const modsList = document.getElementById("modifiersList");

        const MIN_STAT = 1;
        const MAX_STAT = 90;
        const clamp = (v) => Math.min(MAX_STAT, Math.max(MIN_STAT, v));

        const MODIFIERS = {
            "15_19": { str: -5, siz: -5, edu: -5, text: "СИЛ -5, РАЗ -5, ОБР -5", improvement: 0, speed: 0 },
            "20_39": { improvement: 1, text: "", improvement: 0, speed: 0 },
            "40_49": { str: -5, dex: -5, app: -5, edu: +5, pow: +5, text: "СИЛ -5, ЛВК -5, НАР -5; ОБР +5, МОЩ +5", improvement: 2, speed: -2 },
            "50_59": { str: -10, dex: -10, app: -10, edu: +10, pow: +5, text: "СИЛ -10, ЛВК -10, НАР -10; ОБР +10, МОЩ +5", improvement: 3, speed: -2 },
            "60_69": { str: -15, dex: -15, app: -15, edu: +15, pow: +5, text: "СИЛ -15, ЛВК -15, НАР -15; ОБР +15, МОЩ +5", improvement: 4, speed: -3 },
            "70_79": { str: -20, dex: -20, app: -20, edu: +20, pow: +5, text: "СИЛ -20, ЛВК -20, НАР -20; ОБР +20, МОЩ +5", improvement: 4, speed: -4 },
            "80_plus": { str: -25, dex: -25, app: -25, edu: +25, pow: +5, text: "СИЛ -25, ЛВК -25, НАР -25; ОБР +25, МОЩ +5", improvement: 4, speed: -5 }
        };

        this.ageModifierSpeed = MODIFIERS[age].speed

        modifiersInfo.style.display = "block";
        modsList.innerHTML = MODIFIERS[age]?.text ? `<p>${MODIFIERS[age].text}</p>` : "";

        if (!this.baseStats) {
            this.baseStats = JSON.parse(JSON.stringify(this.currentStats));
        }

        this.currentStats = JSON.parse(JSON.stringify(this.baseStats));

        eduSection.style.display = ["15_19", "20_39"].includes(age) ? "none" : "block";
        if (eduSection.style.display === "block") {
            document.getElementById("currentEDU").textContent = this.currentStats.edu;
        }

        const mods = MODIFIERS[age];
        if (mods) {
            for (const key in mods) {
                if (key === "text" || key === "improvement") continue;
                const delta = mods[key];
                if (typeof delta === "number" && this.currentStats.hasOwnProperty(key)) {
                    this.currentStats[key] = clamp(this.currentStats[key] + delta);
                }
            }
            this.EduImprovementMax = MODIFIERS[age].improvement
            this.EduImprovementCurrent = 0
        } else {
            this.EduImprovementMax = 0;
        }

        this.updateAgeStats();
    }

    rollEduImprovement() {
        if (this.EduImprovementCurrent >= this.EduImprovementMax) return;

        const roll = Math.floor(Math.random() * 100) + 1;
        const edu = this.currentStats.edu;
        const result = document.getElementById("eduImprovementResult");

        result.innerHTML = `<p>Бросок: ${roll} (нужно > ${edu})</p>`;

        if (roll > edu) {
            const inc = Math.floor(Math.random() * 10) + 1;
            this.currentStats.edu = Math.min(edu + inc, 99);
            document.getElementById("edu").value = this.currentStats.edu;
            result.innerHTML += `<p class="success">Успех! ОБР +${inc}, теперь ${this.currentStats.edu}</p>`;
        } else {
            result.innerHTML += `<p class="failure">Провал! ОБР остаётся ${edu}</p>`;
        }

        this.updateAgeStats();
        document.getElementById("currentEDU").textContent = this.currentStats.edu;
        this.EduImprovementCurrent++;
        document.getElementById("eduImprovement").textContent = this.EduImprovementMax - this.EduImprovementCurrent
    }

    updateAgeStats() {
        Object.entries(this.currentStats).forEach(([stat, value]) => {
            const el = document.getElementById(`ageStep${stat}`);
            if (el) el.textContent = value;
        });
        document.getElementById("eduImprovement").textContent = this.EduImprovementMax - this.EduImprovementCurrent
    }

    // ================= РАСЧЁТ СТАТОВ =================

    getSanity(){
        return this.currentStats["pow"]
    }

    getHp(){
        return Math.floor((this.currentStats["siz"] + this.currentStats["con"]) / 10)
    }

    getMp(){
        return Math.floor(this.currentStats["pow"] / 5)
    }

    getSpeed(){
        if (this.currentStats["dex"] > this.currentStats["con"] && this.currentStats["str"] > this.currentStats["con"])
            {
                return 9 - this.ageModifierSpeed
            }
        else if (this.currentStats["dex"] >= this.currentStats["con"] || this.currentStats["str"] >= this.currentStats["con"])
        {
            return 8 - this.ageModifierSpeed
        }
        else if (this.currentStats["dex"] < this.currentStats["con"] || this.currentStats["str"] < this.currentStats["con"])
        {
            return 7 - this.ageModifierSpeed
        }
    }

    getDamageUp() {
        const value = this.currentStats["str"] + this.currentStats["con"];
        
        if (value >= 2 && value <= 64) {
            return { damageBonus: -2, damageReduction: -2 };
        }
        else if (value >= 65 && value <= 84) {
            return { damageBonus: -1, damageReduction: -1 };
        }
        else if (value >= 85 && value <= 124) {
            return { damageBonus: 0, damageReduction: 0 };
        }
        else if (value >= 125 && value <= 164) {
            return { damageBonus: "1d4", damageReduction: 1 };
        }
        else if (value >= 165 && value <= 204) {
            return { damageBonus: "1d6", damageReduction: 2 };
        }
        else if (value >= 205 && value <= 284) {
            return { damageBonus: "2d6", damageReduction: 3 };
        }
        else {
            return { damageBonus: 0, damageReduction: 0 };
        }
    }

    getName() {
        return document.getElementById("charName").value
    }

    getAppearance() {
        return document.getElementById("appearanceDesc").value
    }

    getBackstory() {
        return document.getElementById("backstory").value
    }

    getEquipment() {
        return document.getElementById("equipment").value
    }


    // ================= СВОДКА =================
    renderSummary() {
        const form = new FormData(document.getElementById("characterForm"));
        const summary = document.getElementById("summary");
        const stats = this.currentStats;

        summary.innerHTML = `
            <div><strong>Имя:</strong> ${this.getName()}</div>
            <div><strong>Профессия:</strong> ${form.get("profession")}</div>
            <div><strong>Credit Rating:</strong> ${form.get("creditRating")}</div>
            <div><strong>Sanity:</strong> ${this.getSanity()}</div>
            <div><strong>Hp:</strong> ${this.getHp()}</div>
            <div><strong>Mp:</strong> ${this.getMp()}</div>
            <div><strong>Speed:</strong> ${this.getSpeed()}</div>
            <div><strong>Luck:</strong> ${this.luckValue}</div>
            <div><strong>Damage Bonus:</strong> ${this.getDamageUp().damageBonus}</div>
            <div><strong>Damage Reduction:</strong> ${this.getDamageUp().damageReduction}</div>
            <div><strong>Формула навыков:</strong> ${form.get("skillPointFormula")}</div>
            <div><strong>Характеристики:</strong><br>
                STR: ${stats.str}, CON: ${stats.con}, SIZ: ${stats.siz}<br>
                DEX: ${stats.dex}, APP: ${stats.app}, INT: ${stats.int}<br>
                POW: ${stats.pow}, EDU: ${stats.edu}
            </div>
            <div><strong>Выбранные навыки:</strong><br>
                ${this.selectedSkills.join(", ")}
            </div>
            <div><strong>Внешность:</strong><br>
                ${this.getAppearance()}
            </div>
            <div><strong>Инвентарь:</strong><br>
                ${this.getEquipment()}
            </div>
            <div><strong>История:</strong><br>
                ${this.getBackstory()}
            </div>
        `;
    }

    // ================= САБМИТ =================
    handleSubmit = async (e) => {
        e.preventDefault(); // Всегда предотвращаем стандартную отправку
        
        const result = {
            "name": this.getName(),
            "proffesion": document.getElementById("profession").value,
            "stat": this.currentStats,
            "skill": this.currentSkills,
            "proffesionalSkill": this.selectedSkills,
            "sanity": this.getSanity(),
            "hp": this.getHp(),
            "mp": this.getMp(),
            "speed": this.getSpeed(),
            "luck": this.luckValue,
            "damageUp": this.getDamageUp().damageBonus,
            "damageReduction": this.getDamageUp().damageReduction,
            "appearance": this.getAppearance(),
            "backstory": this.getBackstory(),
            "equipment": this.getEquipment(),
        };

        try {
            const response = await fetch('http://127.0.0.1:5100/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result)
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                console.error('Ошибка сервера:', response.status);
            }

        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    };
}

document.addEventListener("DOMContentLoaded", () => new CoCCharacterCreator());


