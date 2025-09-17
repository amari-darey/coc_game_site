План:
    1. Сделать сохранение персонажа в char sheet  
        1.2 Сделать нормальное добавление оружие
    2. Сделать быстрое создание персонажа  
    3. Сделать более точную проверку которая не будет задевать навыки 
    if (this.currentStep === 2) {
            const poolNumbers = document.querySelectorAll("#statPool .stat-number");
            const filledDropzones = document.querySelectorAll(".stat-dropzone[data-filled='true']");
            if (poolNumbers.length > 0 || filledDropzones.length < 8) {
                alert("Распределите все числа по характеристикам");
                return false;
            }
        } 