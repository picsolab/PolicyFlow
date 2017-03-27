from app import app
from flask import Flask, render_template, jsonify
from flask_caching import Cache

cache = Cache(app,config={'CACHE_TYPE': 'simple'})


@app.route("/")
@cache.cached(timeout=50)
def home():
    return render_template("home.html")

@app.route("/vis/")
@cache.cached(timeout=50)
def vis():
    return render_template("vis.html")

@app.route("/about/")
@cache.cached(timeout=50)
def about():
    return render_template("about.html")