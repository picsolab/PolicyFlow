import os

def rel_path(filename):
	"""Return the path of this filename relative to the current script
	"""
	return os.path.join(os.getcwd(), os.path.dirname(__file__), filename)
