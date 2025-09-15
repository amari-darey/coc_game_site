class Character:
    def __init__(self, char, *args, **kwargs):
        self.name = char.get("name")
        self.age = char.get("age")
        self.proffesion = char.get("proffesion")
        self.stats = char.get("stat")
        self.skills = char.get("skill")
        self.proffesional_skills = char.get("proffesionalSkill")
        self.sanity = char.get("sanity")
        self.hp = char.get("hp")
        self.mp = char.get("mp")
        self.speed = char.get("speed")
        self.luck = char.get("luck")
        self.damage_up = char.get("damageUp")
        self.damage_reduction = char.get("damageReduction")
        self.appearance = char.get("appearance")
        self.backstory = char.get("backstory")
        self.equipment = char.get("equipment")
        self.weapon = char.get("weapon")
        self.__dict_stats = char
    
    def get_all_stats(self):
        return self.__dict_stats


if __name__ == "__main__":
    char = {
        'name': 'Стандартный учитель', 
        'age': '15-19',
        'proffesion': 'Учитель', 
        'stat': {
            'str': 55, 
            'con': 45, 
            'siz': 70, 
            'dex': 45, 
            'app': 55, 
            'int': 60, 
            'pow': 60, 
            'edu': 70
            }, 
        'skill': {
            'locksmith': 1, 
            'survival': 10, 
            'sleight_of_hand': 10, 
            'mechanical_repair': 10, 
            'navigate': 10, 
            'stealth': 20, 
            'track': 10, 
            'electrical_repair': 10, 
            'spot_hidden': 60, 
            'library_use': 40, 
            'listen': 40, 
            'medicine': 30, 
            'first_aid': 37, 
            'psychoanalysis': 40, 
            'archaeology': 1, 
            'accounting': 5, 
            'natural_world': 10, 
            'art_craft': 5, 
            'history': 20, 
            'science': 40, 
            'occult': 20, 
            'appraise': 5, 
            'law': 5, 
            'cthulhu_mythos': 0, 
            'anthropology': 1, 
            'intimidate': 15, 
            'fast_talk': 60, 
            'disguise': 5, 
            'charm': 40, 
            'psychology': 50, 
            'persuade': 30, 
            'language_own': 70, 
            'language_other': 20, 
            'fighting_brawl': 25, 
            'throw': 20, 
            'dodge': 22, 
            'firearms_smg': 15, 
            'firearms_rifle_shotgun': 25, 
            'firearms_handgun': 20, 
            'ride': 20, 
            'drive_auto': 20, 
            'climb': 20, 
            'pilot': 1, 
            'swim': 20, 
            'jump': 20, 
            'operate_heavy_machinery': 1, 
            'money': 7
            }, 
        'proffesionalSkill': [
                'Работа в библиотеке', 
                'Внимание', 
                'Красноречие', 
                'Обаяние', 
                'Психология', 
                'Стрельба -пистолет-', 
                'Психоанализ', 
                'Наука'
                ], 
        'sanity': 60, 
        'hp': 11, 
        'mp': 12, 
        'speed': 8, 
        'luck': 65, 
        'damageUp': 0, 
        'damageReduction': 0, 
        'appearance': 'Выглядит как учитель', 
        'backstory': 'Был есть и будет', 
        'equipment': 'Линейка\nСигареты\nЗажигалка\nДневник двоечника',
        'weapon': [
            {
                "name": "Пистолет", 
                "skill": "Стрельба (пистолет)", 
                "damage": "1d10", 
                "distance": "15 м", 
                "fire_rate": "1 (3)", 
                "ammo": "6", 
                "misfire": "100" 
            },
            ]
        }
    
    char = Character(char)
    print(char.name)
    print(char.hp)
