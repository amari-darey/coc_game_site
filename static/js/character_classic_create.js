import { CharacterCreator } from './character.js';


class CharacterCreatorClassic extends CharacterCreator {
    constructor() {
        super();
    }

    _bindEvents() {
        super._bindEvents();
        this._bindStatsEvents();
        this._bindStepFourEvents();
    }

    _bindStatsEvents() {
        document.getElementById("skill_choice").querySelectorAll(".stat-btn").forEach(button =>
            button.addEventListener("click", event => this._changeStat(event))
        );
    }

    _bindStepFourEvents() {
        ["popupButton1", "popupButton2"].forEach(id => {
            document.getElementById(id).addEventListener("click", event => this._stepFourModalChoiceHandler(event));
        });

        document.getElementById("skill_distribution").querySelectorAll(".stat-btn").forEach(button => {
            button.addEventListener("click", event => this._changeSkill(event));
        });
    }

    // ШАГ 2
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
}

document.addEventListener("DOMContentLoaded", () => new CharacterCreatorClassic());