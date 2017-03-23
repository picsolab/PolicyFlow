import os
from flask import Flask, render_template, jsonify
from flask.ext.cache import Cache
from flask_compress import Compress
#from werkzeug.serving import WSGIRequestHandler

#WSGIRequestHandler.protocol_version = "HTTP/1.1"

app = Flask(__name__)
Compress(app)

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

# http://bl.ocks.org/WillTurman/4631136
# http://bl.ocks.org/lgrammel/1963983

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port, debug=True)

