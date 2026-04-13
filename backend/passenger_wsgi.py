import sys
import os

# Set the path to the current directory to ensure imports work correctly
sys.path.insert(0, os.path.dirname(__file__))

# Import the ASGI-to-WSGI wrapper
from a2wsgi import ASGIMiddleware

# Import the FastAPI application instance from the 'app' package
from app.main import app

# Phusion Passenger looks for a variable named 'application' (WSGI callable)
application = ASGIMiddleware(app)
