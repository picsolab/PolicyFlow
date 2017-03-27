#!env/bin/python
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_compress import Compress
#from werkzeug.serving import WSGIRequestHandler

#WSGIRequestHandler.protocol_version = "HTTP/1.1"

app = Flask(__name__)
app.config.from_pyfile('_config.py')
db = SQLAlchemy(app)

from app import service
from app import views, models

Compress(app)

# http://bl.ocks.org/WillTurman/4631136
# http://bl.ocks.org/lgrammel/1963983

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port, debug=True)

