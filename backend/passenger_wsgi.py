import sys
import os

# 1. Define the absolute path to the backend directory
# On cPanel this is usually /home/username/backend
BASE_DIR = "/home/joidauz/backend"

# 2. Add the virtual environment's site-packages to sys.path
# This bypasses the need for os.execl which can cause issues on some cPanel setups
VENV_SITE_PACKAGES = os.path.join(BASE_DIR, "venv", "lib", "python3.9", "site-packages")
if not os.path.exists(VENV_SITE_PACKAGES):
    # Fallback for common cPanel python versions
    VENV_SITE_PACKAGES = os.path.join(BASE_DIR, "venv", "lib", "python3.11", "site-packages")

if VENV_SITE_PACKAGES not in sys.path:
    sys.path.insert(0, VENV_SITE_PACKAGES)

# 3. Add the application directory to the path
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
    sys.path.insert(0, os.path.join(BASE_DIR, "app"))

# 4. Import the application after the paths are setup
# We use a try-except to log any startup errors to a file we can read
try:
    from a2wsgi import ASGIMiddleware
    from app.main import app
    
    # Phusion Passenger looks for a variable named 'application'
    application = ASGIMiddleware(app)
    
except Exception as e:
    import traceback
    with open(os.path.join(BASE_DIR, "tmp", "startup_error.log"), "a") as f:
        f.write("\n" + "="*50 + "\n")
        f.write(f"Startup error at {os.getcwd()}\n")
        f.write(traceback.format_exc())
    raise
