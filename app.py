from flask import Flask, render_template, request, redirect, url_for, session
from character import Character
from constant import *


app = Flask(__name__)
app.secret_key = 'your-secret-key'

@app.route("/", methods=["GET", "POST"])
def index():
    context = session.get('character_data', False)
    print(context)
    return render_template("index.html", context=context)


@app.route("/create")
def create():
    context = {
        "skills": SKILLS,
        "characteristic": CHARACTERISTICS,
        "age": AGE,
        "money": MONEY,
        "skillFormula": SKILL_FORMULA,
    }
    return render_template("create_investigator_classic.html", context=context)

@app.route("/character", methods=["GET", "POST"])
def character():
    if request.method == "POST":
        char_data = Character(request.get_json())
        session['character_data'] = char_data.get_all_stats()
    context = session.get('character_data')
    return render_template('character_sheet.html', 
                         context=context,
                         editable=True,
                         SKILLS=SKILLS,
                         CHARACTERISTICS=CHARACTERISTICS)

@app.route("/character-save", methods=["GET", "POST"])
def character_save():
    if request.method == "POST":
        data = request.get_json()
        for k, v in data.items():
            print(k, " - ", v)
        char_data = Character(data)
        print(char_data.__dict__)
        session['character_data'] = char_data.get_all_stats()
    return redirect("/")


if __name__ == "__main__":
    app.run("0.0.0.0", 5100)
