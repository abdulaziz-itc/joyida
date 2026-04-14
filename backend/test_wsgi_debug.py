import sys
import os

# Set absolute path for the virtual environment interpreter
INTERP = "/Users/macbook13/Documents/joyida/backend/venv/bin/python3"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from a2wsgi import ASGIMiddleware
    from app.main import app
    print("Dependencies imported successfully")
    
    # Try to simulate a request or just check the app
    print(f"App title: {app.title}")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
