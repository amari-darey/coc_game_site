from flask import Flask, render_template, request
from constant import *


app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        for k, v in request.get_json().items():
            print(k, v)
    return render_template("index.html")


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


if __name__ == "__main__":
    app.run("0.0.0.0", 5100)
