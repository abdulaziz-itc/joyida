import sys
import os

# Set up the path to the app directory
sys.path.insert(0, os.path.dirname(__file__))

# Import the FastAPI application
from app.main import app
from a2wsgi import ASGIMiddleware

# Wrap the ASGI app with ASGIMiddleware to make it WSGI compatible
application = ASGIMiddleware(app)
