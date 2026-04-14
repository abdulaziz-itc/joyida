import sys
import os
import traceback

# 1. Configuration (Verified from server)
BASE_DIR = "/home/joidauz/backend"
# These paths were verified by the user via python -c "import sys; print(sys.path)"
VENV_PATHS = [
    '/home/joidauz/virtualenv/backend/3.14/lib64/python3.14/site-packages',
    '/home/joidauz/virtualenv/backend/3.14/lib/python3.14/site-packages'
]

# 2. Setup environment
for path in VENV_PATHS:
    if path not in sys.path:
        sys.path.insert(0, path)

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
    # Also add app directory for direct imports
    sys.path.insert(0, os.path.join(BASE_DIR, "app"))

# 3. Bootstrap Application
try:
    from a2wsgi import ASGIMiddleware
    from app.main import app
    
    # Phusion Passenger looks for 'application'
    application = ASGIMiddleware(app)
    
except Exception:
    import datetime
    with open(os.path.join(BASE_DIR, "tmp", "startup_error.log"), "a") as f:
        f.write(f"\n--- Startup Error {datetime.datetime.now()} ---\n")
        f.write(traceback.format_exc())
    
    # Fallback to show error in browser
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [b"Internal Server Error. Check tmp/startup_error.log for details."]
