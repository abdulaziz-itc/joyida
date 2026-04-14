import sys
import os
import traceback

# cPanel specific absolute paths
BASE_DIR = "/home/joidauz/backend"
# Attempt to find the site-packages in the cPanel venv
VENV_SITE_PACKAGES = os.path.join(BASE_DIR, "venv", "lib", "python3.11", "site-packages")
if not os.path.exists(VENV_SITE_PACKAGES):
    # Try alternate python version if 3.11 is not standard on cPanel
    VENV_SITE_PACKAGES = os.path.join(BASE_DIR, "venv", "lib", "python3.9", "site-packages")

# Setup sys.path to prioritize production virtual environment
sys.path.insert(0, VENV_SITE_PACKAGES)
sys.path.insert(0, BASE_DIR)

try:
    from a2wsgi import ASGIMiddleware
    from app.main import app
    application = ASGIMiddleware(app)
except Exception as e:
    # Error logging in production
    try:
        DEBUG_LOG = os.path.join(BASE_DIR, "tmp", "error.log")
        with open(DEBUG_LOG, "a") as f:
            f.write("\n" + "="*50 + "\n")
            f.write(f"Startup error: {traceback.format_exc()}\n")
    except:
        pass
    raise
