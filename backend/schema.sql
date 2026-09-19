-- SCHEMA FOR HOSPITAL RESOURCE MANAGEMENT DASHBOARD (PHASE 2)

-- 1. Staff Profiles
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Nurse', 'Receptionist')),
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Beds
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Doctors
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'Busy', 'On Leave')),
    current_patient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Nurses
CREATE TABLE IF NOT EXISTS public.nurses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'Busy', 'On Leave')),
    current_patient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Equipment
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'In Use', 'Maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Emergency Resources
CREATE TABLE IF NOT EXISTS public.emergency_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    available_quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'Depleted')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Patients (Queue)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code VARCHAR(50) UNIQUE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Critical', 'Emergency', 'High', 'Normal')),
    emergency_status VARCHAR(10) NOT NULL CHECK (emergency_status IN ('Yes', 'No')) DEFAULT 'No',
    required_resource VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Waiting', 'In Consultation', 'Admitted', 'Completed', 'Cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling RLS on all tables to ensure secure access.
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Note: The Flask backend will use the Supabase Service Role Key or bypass RLS via direct connection.
-- If the frontend needs direct read access, you would create policies here, e.g.:
-- CREATE POLICY "Allow authenticated read" ON public.beds FOR SELECT USING (auth.role() = 'authenticated');

-- 12. Simulation Sessions
CREATE TABLE IF NOT EXISTS public.simulation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Simulation Events
CREATE TABLE IF NOT EXISTS public.simulation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.simulation_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
