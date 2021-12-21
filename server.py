#!app/env/bin/python
import os
from app import app
from app.services.web_service import NetworkService

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 9001))
    print('here: ', app)
    app.run(host='0.0.0.0', port=port)
    