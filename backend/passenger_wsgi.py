import sys
import os

# Set absolute path for the virtual environment interpreter
# This is much safer than relative execution in Passenger
INTERP = "/Users/macbook13/Documents/joyida/backend/venv/bin/python"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Import the ASGI-to-WSGI wrapper and the app
sys.path.insert(0, os.path.dirname(__file__))
from a2wsgi import ASGIMiddleware
from app.main import app

# Passenger looks for this 'application' variable
application = ASGIMiddleware(app)
