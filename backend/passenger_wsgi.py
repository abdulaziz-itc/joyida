import sys
import os
import traceback

# Nuclear logging to catch ANY error before FastAPI starts
LOG_FILE = os.path.join(os.path.dirname(__file__), 'tmp', 'passenger_debug.log')

def log_error(msg):
    with open(LOG_FILE, 'a') as f:
        f.write(msg + '\n')

try:
    # Force the use of the project's virtual environment
    INTERP = "/Users/macbook13/Documents/joyida/backend/venv/bin/python"
    log_error(f"Starting with INTERP: {INTERP}")
    
    if sys.executable != INTERP:
        log_error(f"Re-executing with {INTERP}")
        os.execl(INTERP, INTERP, *sys.argv)

    # Set the path to the current directory
    sys.path.insert(0, os.path.dirname(__file__))
    log_error(f"Sys Path: {sys.path}")

    # Import the ASGI-to-WSGI wrapper
    from a2wsgi import ASGIMiddleware
    log_error("a2wsgi imported successfully")

    # Import the FastAPI application instance
    from app.main import app
    log_error("FastAPI app imported successfully")

    # Phusion Passenger looks for 'application'
    application = ASGIMiddleware(app)
    log_error("application initialized successfully")

except Exception as e:
    log_error(f"CRITICAL STARTUP ERROR: {str(e)}")
    log_error(traceback.format_exc())
    
    # Fallback minimal app to show the error in the browser if possible
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [f"Startup Error: {str(e)}\n{traceback.format_exc()}".encode()]
