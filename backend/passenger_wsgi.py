import sys
import os
import traceback

def application(environ, start_response):
    try:
        # 1. Setup paths
        BASE_DIR = "/home/joidauz/backend"
        VENV_PATHS = [
            '/home/joidauz/virtualenv/backend/3.14/lib64/python3.14/site-packages',
            '/home/joidauz/virtualenv/backend/3.14/lib/python3.14/site-packages'
        ]
        
        for path in VENV_PATHS:
            if path not in sys.path:
                sys.path.insert(0, path)
        
        if BASE_DIR not in sys.path:
            sys.path.insert(0, BASE_DIR)

        # 2. Try imports
        from a2wsgi import ASGIMiddleware
        from app.main import app
        
        # 3. Create real app
        real_app = ASGIMiddleware(app)
        return real_app(environ, start_response)
        
    except Exception:
        # 4. If ANY error occurs, show it directly in the browser!
        error_info = traceback.format_exc()
        status = '200 OK' # Use 200 to ensure the browser shows our content, not a generic 500
        headers = [('Content-Type', 'text/html; charset=utf-8')]
        start_response(status, headers)
        
        html = f"""
        <html>
        <head><title>Backend Diagnostic</title></head>
        <body style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #ff5555;">
            <h1 style="color: #ffffff;">Backend Startup Error (Diagnostic Mode)</h1>
            <hr/>
            <p><strong>Python Version:</strong> {sys.version}</p>
            <p><strong>Path:</strong> {sys.path}</p>
            <hr/>
            <pre style="background: #000; padding: 15px; border-radius: 5px; overflow-x: auto;">{error_info}</pre>
        </body>
        </html>
        """
        return [html.encode('utf-8')]
