from app import app
from flask import Flask, render_template, jsonify
from flask_caching import Cache

cache = Cache(app,config={'CACHE_TYPE': 'simple'})


@app.route("/")
@cache.cached(timeout=50)
def index():
    return render_template("index.html")

@app.route("/<any>/")
@cache.cached(timeout=50)
def redirect(any):
    return index()
