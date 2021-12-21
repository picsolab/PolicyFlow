from . import app
from flask import Flask, render_template, jsonify
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})


@app.route("/")
@cache.cached(timeout=50)
def index():
    print('render...')
    return render_template("index.html")


@app.route("/<any_path>/")
@cache.cached(timeout=50)
def redirect(any_path):
    return index()
