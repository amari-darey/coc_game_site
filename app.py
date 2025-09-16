from flask import Flask, render_template, request, redirect, url_for, session, make_response
import uuid
from character import Character
from constant import *


app = Flask(__name__)
app.secret_key = 'your-secret-key'

users = {}


def generate_token():
    return str(uuid.uuid4())


@app.route("/", methods=["GET", "POST"])
def index():
    token = request.cookies.get("auth_token")

    if not token or token not in users:
        token = generate_token()
        users[token] = {}

        resp = make_response(redirect("/"))
        resp.set_cookie("auth_token", token, httponly=True, max_age=60*60*24*30)
        return resp

    context = users[token] if isinstance(users[token], Character) else False
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


@app.route("/fast-create")
def fast_create():
    context = {
        "skills": SKILLS,
        "characteristic": CHARACTERISTICS,
        "age": AGE,
        "money": MONEY,
        "skillFormula": SKILL_FORMULA,
    }
    return render_template("create_investigator_fast.html", context=context)


@app.route("/character", methods=["GET", "POST"])
def character():
    token = request.cookies.get("auth_token")
    if  not token or token not in users: return redirect("/")

    if request.method == "POST":
        data = request.get_json()
        if data:
            users[token] = Character(data)

    if isinstance(users[token], Character):
        context = users[token].get_all_stats()
    else:
        context = False
    return render_template('character_sheet.html', 
                         context=context,
                         editable=True,
                         SKILLS=SKILLS,
                         CHARACTERISTICS=CHARACTERISTICS)


@app.route("/character-save", methods=["GET", "POST"])
def character_save():
    token = request.cookies.get("auth_token")

    if not token or token not in users: return redirect("/")

    if request.method == "POST":
        data = request.get_json()
        if data:
            users[token] = Character(data)

    return redirect("/")


if __name__ == "__main__":
    app.run("0.0.0.0", 5100)
