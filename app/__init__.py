#!env/bin/python
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_compress import Compress
from flask import render_template, jsonify
from flask_caching import Cache

# from werkzeug.serving import WSGIRequestHandler

# WSGIRequestHandler.protocol_version = "HTTP/1.1"

app = Flask(__name__)
app.config.from_pyfile('_config.py')
db = SQLAlchemy(app)

import views
import service

Compress(app)
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

# http://bl.ocks.org/WillTurman/4631136
# http://bl.ocks.org/lgrammel/1963983
