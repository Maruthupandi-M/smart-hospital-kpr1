# Vercel serverless entry point for Flask backend
# Vercel looks for a variable named `app` or `handler` in this file

import sys
import os

# Add backend directory to path so we can import app.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app

# Vercel uses this as the WSGI handler
handler = app
