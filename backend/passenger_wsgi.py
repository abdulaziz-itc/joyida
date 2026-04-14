import sys
import os

def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b"Vanilla WSGI Success! Interpreter: " + sys.executable.encode()]
