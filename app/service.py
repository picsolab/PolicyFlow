from app import app
from .dao import PageDao

class PageService:

    @app.route('/api/subjects', methods = ['GET'])
    def get_all_subject(self):
        """get all subject from database."""
        pass
