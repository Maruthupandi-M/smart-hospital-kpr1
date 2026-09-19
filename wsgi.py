import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Load backend .env if it exists (local dev only)
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))
except Exception:
    pass

# Validate required environment variables before importing app
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

print(f"[wsgi] SUPABASE_URL set: {bool(SUPABASE_URL)}", flush=True)
print(f"[wsgi] SUPABASE_KEY set: {bool(SUPABASE_KEY)}", flush=True)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[wsgi] ERROR: SUPABASE_URL and SUPABASE_KEY must be set in environment", flush=True)
    sys.exit(1)

try:
    from app import app
    print("[wsgi] App imported successfully", flush=True)
except Exception as e:
    print(f"[wsgi] ERROR importing app: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
