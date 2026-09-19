import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or 'dummy' in SUPABASE_KEY:
    print("Error: Valid SUPABASE_URL and SUPABASE_KEY required in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define our predefined accounts
accounts = [
    {
        "email": "admin@hospital.org",
        "password": "password123",
        "name": "System Administrator",
        "role": "Admin",
        "staff_id": "ADM-001"
    },
    {
        "email": "doctor@hospital.org",
        "password": "password123",
        "name": "Dr. Sarah Smith",
        "role": "Doctor",
        "staff_id": "DOC-102"
    },
    {
        "email": "nurse@hospital.org",
        "password": "password123",
        "name": "Nurse John Doe",
        "role": "Nurse",
        "staff_id": "NUR-205"
    },
    {
        "email": "receptionist@hospital.org",
        "password": "password123",
        "name": "Alice Frontdesk",
        "role": "Receptionist",
        "staff_id": "REC-301"
    }
]

print("Starting to seed database with predefined accounts...")

for acc in accounts:
    try:
        print(f"Creating Auth user for {acc['email']}...")
        # Create user in Supabase Auth
        res = supabase.auth.admin.create_user({
            "email": acc["email"],
            "password": acc["password"],
            "email_confirm": True
        })
        user_id = res.user.id
        
        print(f"Inserting staff_profile for {acc['role']}...")
        # Insert profile
        supabase.table("staff_profiles").insert({
            "user_id": user_id,
            "staff_id": acc["staff_id"],
            "name": acc["name"],
            "role": acc["role"]
        }).execute()
        
        print(f"-> Successfully created {acc['email']}")
    except Exception as e:
        print(f"Error creating {acc['email']}: {e}")

print("Seeding complete!")
