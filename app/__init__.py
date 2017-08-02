#!env/bin/python
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_compress import Compress

# from werkzeug.serving import WSGIRequestHandler

# WSGIRequestHandler.protocol_version = "HTTP/1.1"

app = Flask(__name__)
app.config.from_pyfile('_config.py')
db = SQLAlchemy(app)

import views
from services import web_service, computing_service

Compress(app)

# http://bl.ocks.org/WillTurman/4631136
# http://bl.ocks.org/lgrammel/1963983
