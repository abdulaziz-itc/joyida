import sys
import os
import glob
import traceback

# 1. Configuration
BASE_DIR = "/home/joidauz/backend"
INTERPRETER = sys.executable

def log_error(msg):
    with open(os.path.join(BASE_DIR, "tmp", "startup_error.log"), "a") as f:
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"\n[{timestamp}] {msg}\n")

log_error("--- PASSENGER STARTUP INITIATED ---")
log_error(f"Using Python: {sys.version}")
log_error(f"Executable: {INTERPRETER}")

# 2. Dynamic VENV Discovery
# We check common cPanel venv locations
possible_venv_paths = [
    os.path.join(BASE_DIR, "venv"),
    os.path.join("/home/joidauz/virtualenv", "backend"), # Based on shell prompt ((backend:3.14))
]

found_packages = False
for venv_base in possible_venv_paths:
    # Handle both BASE/lib/pythonX.X/site-packages and BASE/lib/pythonX.X/site-packages
    # We use glob to find the python version directory automatically
    pattern = os.path.join(venv_base, "lib", "python*", "site-packages")
    matches = glob.glob(pattern)
    
    for site_pkgs in matches:
        if os.path.exists(site_pkgs):
            if site_pkgs not in sys.path:
                sys.path.insert(0, site_pkgs)
                log_error(f"Added site-packages: {site_pkgs}")
            found_packages = True

if not found_packages:
    log_error("CRITICAL: No site-packages found in common venv locations!")

# 3. Add application paths
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
log_error(f"Current sys.path: {sys.path}")

# 4. Bootstrap Application
try:
    log_error("Attempting to import ASGIMiddleware...")
    from a2wsgi import ASGIMiddleware
    
    log_error("Attempting to import app.main...")
    from app.main import app
    
    log_error("Successfully initialized application.")
    application = ASGIMiddleware(app)
    
except Exception:
    error_msg = traceback.format_exc()
    log_error("FATAL ERROR DURING STARTUP:")
    log_error(error_msg)
    # Return a basic error message if possible
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [b"Internal Server Error during startup. Check tmp/startup_error.log"]
