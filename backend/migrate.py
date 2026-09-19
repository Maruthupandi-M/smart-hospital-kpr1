from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Add missing columns using direct REST calls
migrations = [
    "ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialization VARCHAR(100) DEFAULT 'General'",
    "ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS shift VARCHAR(50) DEFAULT 'Morning'",
    "ALTER TABLE public.beds ADD COLUMN IF NOT EXISTS bed_type VARCHAR(100) DEFAULT 'General'",
    "ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0",
    "ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 0",
    "ALTER TABLE public.emergency_resources ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100) DEFAULT 'General'",
    "ALTER TABLE public.emergency_resources ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'General'",
    "ALTER TABLE public.emergency_resources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
    "ALTER TABLE public.emergency_resources DROP CONSTRAINT IF EXISTS emergency_resources_status_check",
    "ALTER TABLE public.emergency_resources ADD CONSTRAINT emergency_resources_status_check CHECK (status IN ('Available', 'Depleted', 'In Use', 'Limited', 'Maintenance'))",
]

import httpx

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

for sql in migrations:
    try:
        resp = httpx.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            json={"query": sql},
            headers=headers,
            timeout=10
        )
        print(f"OK ({resp.status_code}): {sql[:70]}")
    except Exception as e:
        print(f"Error: {e}")

print("\nNow seeding data...")

# Seed doctors
try:
    doctors = [
        {"staff_id": "DOC-001", "name": "Dr. Ravi Kumar", "department": "General", "specialization": "General Medicine", "status": "Available"},
        {"staff_id": "DOC-002", "name": "Dr. Priya Sharma", "department": "Cardiology", "specialization": "Cardiology", "status": "Busy"},
        {"staff_id": "DOC-003", "name": "Dr. James Wilson", "department": "Emergency", "specialization": "Emergency Medicine", "status": "Available"},
    ]
    r = client.table("doctors").insert(doctors).execute()
    print(f"Doctors: {len(r.data)} inserted")
except Exception as e:
    print(f"Doctors error: {e}")

# Seed nurses
try:
    nurses = [
        {"staff_id": "NUR-001", "name": "Nurse Kavitha", "department": "General", "shift": "Morning", "status": "Available"},
        {"staff_id": "NUR-002", "name": "Nurse Meena", "department": "ICU", "shift": "Evening", "status": "Busy"},
        {"staff_id": "NUR-003", "name": "Nurse Arjun", "department": "Emergency", "shift": "Night", "status": "Available"},
    ]
    r = client.table("nurses").insert(nurses).execute()
    print(f"Nurses: {len(r.data)} inserted")
except Exception as e:
    print(f"Nurses error: {e}")

# Seed equipment
try:
    equipment = [
        {"equipment_name": "Ventilator", "department": "ICU", "quantity": 10, "available_quantity": 4, "status": "Available"},
        {"equipment_name": "ECG Machine", "department": "Cardiology", "quantity": 5, "available_quantity": 2, "status": "In Use"},
        {"equipment_name": "Defibrillator", "department": "Emergency", "quantity": 4, "available_quantity": 4, "status": "Available"},
    ]
    r = client.table("equipment").insert(equipment).execute()
    print(f"Equipment: {len(r.data)} inserted")
except Exception as e:
    print(f"Equipment error: {e}")

# Seed emergency resources
try:
    emergency = [
        {"resource_name": "Blood O+", "resource_type": "Blood Bank", "department": "Emergency", "quantity": 50, "available_quantity": 30, "status": "Available"},
        {"resource_name": "Oxygen Cylinders", "resource_type": "Gas", "department": "ICU", "quantity": 20, "available_quantity": 12, "status": "Available"},
    ]
    r = client.table("emergency_resources").insert(emergency).execute()
    print(f"Emergency resources: {len(r.data)} inserted")
except Exception as e:
    print(f"Emergency error: {e}")

# Seed patients
try:
    from datetime import datetime, timedelta
    patients = [
        {"patient_code": "P-1001", "department": "Emergency", "priority": "Critical", "emergency_status": "Yes", "required_resource": "Bed + Doctor + Nurse", "status": "Waiting"},
        {"patient_code": "P-1002", "department": "Cardiology", "priority": "High", "emergency_status": "No", "required_resource": "Doctor", "status": "Waiting"},
        {"patient_code": "P-1003", "department": "General", "priority": "Normal", "emergency_status": "No", "required_resource": "Bed", "status": "Waiting"},
    ]
    r = client.table("patients").insert(patients).execute()
    print(f"Patients: {len(r.data)} inserted")
except Exception as e:
    print(f"Patients error: {e}")

print("\n--- Seeding complete ---")
