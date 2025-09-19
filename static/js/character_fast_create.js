import { CharacterCreator } from './character.js';


class CharacterCreatorFast extends CharacterCreator {
    constructor() {
        super();
        this._draggingElement = null;
        this.skillFlag = false
    }

    _bindEvents() {
        super._bindEvents();
        this._bindDragDelegation();
        this._bindDropzones();
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

    // ШАГ 4
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
        const nextBtn = document.getElementById("nextBtn");
        if (!nextBtn) return;
        this.alternativeNextHandler = () => this._handlerStepFourAlt();
        nextBtn.removeEventListener("click", this.nextStepHandler);
        nextBtn.addEventListener("click", this.alternativeNextHandler);
    }

    _undoRedirectNextButton() {
        this.skillFlag = true
        const nextBtn = document.getElementById("nextBtn");
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
                isSelected = this.selectedSkills.includes(text);
                if (text == "Средства") isSelected = true;
            } else {
                isSelected = !this.selectedSkills.includes(text);
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

    // ПУЛ
    _populateSkillStatPool(numbers) {
        const pool = document.getElementById("statPoolSkill");
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
            if (statKey) this.currentStats[statKey] = parseInt(value, 10);
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
            if (this.skillFlag) {
                if (skillKey) this.currentSkills[skillKey] += Math.min(100, parseInt(value, 10));
            }
            else {
                if (skillKey) this.currentSkills[skillKey] = parseInt(value, 10);
            }
        }

        zone.innerHTML = "";
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        zone.appendChild(numDiv);
    }

    _returnNumberToPool(value) {
        const pool = document.getElementById("statPool");
        if (!pool) return;
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        pool.appendChild(numDiv);
    }

    _returnSkillNumberToPool(value) {
        const pool = document.getElementById("statPoolSkill");
        if (!pool) return;
        const numDiv = document.createElement("div");
        numDiv.className = "stat-number";
        numDiv.textContent = value;
        this._ensureDraggable(numDiv);
        pool.appendChild(numDiv);
    }

    // Валидация
    _validateCurrentStep() {
        const result = super._validateCurrentStep()
        if (!result) return result;
        if (this.currentStep === 2) {
            const poolNumbers = document.querySelectorAll("#statPool .stat-number");
            const filledDropzones = document.querySelectorAll(".stat-dropzone[data-filled='true']");
            if (poolNumbers.length > 0 || filledDropzones.length < 8) {
                alert("Распределите все числа по характеристикам");
                return false;
            }
        }
        if (this.currentStep === 4) {
            const poolNumbers = document.querySelectorAll("#statPoolSkill .stat-number");
            const filledDropzones = document.querySelectorAll(".stat-dropzone[data-filled='true']");
            if (poolNumbers.length > 0 || filledDropzones.length < 4) {
                alert("Распределите все числа по навыкам хобби");
                return false;
            }
        }
        return result
    }
}

document.addEventListener("DOMContentLoaded", () => new CharacterCreatorFast());