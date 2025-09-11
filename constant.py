SKILLS = {
    "Решение проблем": [
        {"id": "locksmith", "rus": "Взлом", "base": 1},
        {"id": "survival", "rus": "Выживание", "base": 10},
        {"id": "sleight_of_hand", "rus": "Ловкость рук", "base": 10},
        {"id": "mechanical_repair", "rus": "Механика", "base": 10},
        {"id": "navigate", "rus": "Ориентирование", "base": 10},
        {"id": "stealth", "rus": "Скрытность", "base": 20},
        {"id": "track", "rus": "Чтение следов", "base": 10},
        {"id": "electrical_repair", "rus": "Электрика", "base": 10},
    ],
    "Сбор информации": [
        {"id": "spot_hidden", "rus": "Внимание", "base": 25},
        {"id": "library_use", "rus": "Работа в библиотеке", "base": 20},
        {"id": "listen", "rus": "Слух", "base": 20},
    ],
    "Лечение": [
        {"id": "medicine", "rus": "Медицина", "base": 1},
        {"id": "first_aid", "rus": "Первая помощь", "base": 30},
        {"id": "psychoanalysis", "rus": "Психоанализ", "base": 1},
    ],
    "Знания": [
        {"id": "archaeology", "rus": "Археология", "base": 1},
        {"id": "accounting", "rus": "Бухгалтерское дело", "base": 5},
        {"id": "natural_world", "rus": "Естествознание", "base": 10},
        {"id": "art_craft", "rus": "Ис-во/Ремесло", "base": 5},
        {"id": "history", "rus": "История", "base": 5},
        {"id": "science", "rus": "Наука", "base": 1},
        {"id": "occult", "rus": "Оккультизм", "base": 5},
        {"id": "appraise", "rus": "Оценка", "base": 5},
        {"id": "law", "rus": "Юриспруденция", "base": 5},
    ],
    "Мифы Ктулху" : [
        {"id": "cthulhu_mythos", "rus": "Мифы Ктулху", "base": 0},
    ],
    "Социальные": [
        {"id": "anthropology", "rus": "Антропология", "base": 1},
        {"id": "intimidate", "rus": "Запугивание", "base": 15},
        {"id": "fast_talk", "rus": "Красноречие", "base": 5},
        {"id": "disguise", "rus": "Маскировка", "base": 5},
        {"id": "charm", "rus": "Обаяние", "base": 15},
        {"id": "psychology", "rus": "Психология", "base": 10},
        {"id": "persuade", "rus": "Убеждение", "base": 10},
        {"id": "language_own", "rus": "Языки -Родной-", "base": "EDU"},
        {"id": "language_other", "rus": "Языки -Иностр-", "base": 1},
    ],
    "Ближний бой": [
        {"id": "fighting_brawl", "rus": "Ближ. бой -драка-", "base": 25},
        {"id": "throw", "rus": "Метание", "base": 20},
        {"id": "dodge", "rus": "Уклонение", "base": "DEX/2"},
    ],
    "Дальний бой": [
        {"id": "firearms_smg", "rus": "Автомат", "base": 15},
        {"id": "firearms_rifle_shotgun", "rus": "Стрельба -винт./дроб.-", "base": 25},
        {"id": "firearms_handgun", "rus": "Стрельба -пистолет-", "base": 20},
    ],
    "Действия": [
        {"id": "ride", "rus": "Верховая езда", "base": 5},
        {"id": "drive_auto", "rus": "Вождение", "base": 20},
        {"id": "climb", "rus": "Лазание", "base": 20},
        {"id": "pilot", "rus": "Пилотирование", "base": 1},
        {"id": "swim", "rus": "Плавание", "base": 20},
        {"id": "jump", "rus": "Прыжки", "base": 20},
        {"id": "operate_heavy_machinery", "rus": "Упр. тяж. машинами", "base": 1},
    ],
    "Финансы": [
        {"id": "money", "rus": "Средства", "base": 0},
    ],
}


CHARACTERISTICS = [
    {"id": "str", "rus": "Сила", "eng": "STR", "base": 15},
    {"id": "con", "rus": "Телосложение", "eng": "CON", "base": 15},
    {"id": "siz", "rus": "Размер", "eng": "SIZ", "base": 40},
    {"id": "dex", "rus": "Ловкость", "eng": "DEX", "base": 15},
    {"id": "app", "rus": "Внешность", "eng": "APP", "base": 15},
    {"id": "int", "rus": "Интеллект", "eng": "INT", "base": 40},
    {"id": "pow", "rus": "Сила воли", "eng": "POW", "base": 15},
    {"id": "edu", "rus": "Образование", "eng": "EDU", "base": 15},
]

AGE = [
    {"id": "15_19", "rus": "15-19 лет"},
    {"id": "20_39", "rus": "20-39 лет"},
    {"id": "40_49", "rus": "40-49 лет"},
    {"id": "50_59", "rus": "50-59 лет"},
    {"id": "60_69", "rus": "60-69 лет"},
    {"id": "70_79", "rus": "70-79 лет"},
    {"id": "80_plus", "rus": "80+ лет"},
]

MONEY = [
    {"id": "0", "rus": "0 (без гроша)"},
    {"id": "1_9", "rus": "1-9 (бедный)"},
    {"id": "10_49", "rus": "10-49 (среднего достатка)"},
    {"id": "50_89", "rus": "50-89 (состоятельный)"},
    {"id": "90_98", "rus": "90-98 (богатый)"},
    {"id": "99", "rus": "99 (сверхбогатый)"},
]

SKILL_FORMULA = [
    {"id": "scientist", "rus": "Учёный: ОБР х4"}, 
    {"id": "actor", "rus": "Актёр: ОБР х2 + APP х2"}, 
    {"id": "athlete", "rus": "Атлет: ОБР х2 + (STR х2 или DEX х2)"}, 
    {"id": "fanatic", "rus": "Фанатик: ОБР х2 + (APP х2 или POW х2)"}, 
]
