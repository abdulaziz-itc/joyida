import sys
import os
import traceback

# 1. Configuration (Verified from server)
BASE_DIR = "/home/joidauz/backend"
VENV_PATHS = [
    '/home/joidauz/virtualenv/backend/3.14/lib64/python3.14/site-packages',
    '/home/joidauz/virtualenv/backend/3.14/lib/python3.14/site-packages'
]

# 2. Setup environment
# Order matters: Add VENV first, then BASE_DIR
for path in VENV_PATHS:
    if path not in sys.path:
        sys.path.insert(0, path)

# Add BASE_DIR so that 'import app.main' works
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# 3. Bootstrap Application
try:
    from a2wsgi import ASGIMiddleware
    # We must be able to import 'app.main' from BASE_DIR
    from app.main import app
    
    # Phusion Passenger looks for 'application'
    application = ASGIMiddleware(app)
    
except Exception:
    import datetime
    with open(os.path.join(BASE_DIR, "tmp", "startup_error.log"), "a") as f:
        f.write(f"\n--- Final Import Check Error {datetime.datetime.now()} ---\n")
        f.write(f"Current sys.path: {sys.path}\n")
        f.write(traceback.format_exc())
    
    # Fallback to show error in browser
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [b"Internal Server Error. Please check tmp/startup_error.log"]
