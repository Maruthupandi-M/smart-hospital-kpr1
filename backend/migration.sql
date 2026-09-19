-- MIGRATION: Add missing columns to existing tables
-- Run this in Supabase SQL Editor

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialization VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS shift VARCHAR(50) DEFAULT 'Morning';
ALTER TABLE public.beds ADD COLUMN IF NOT EXISTS bed_type VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 0;
ALTER TABLE public.emergency_resources ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.emergency_resources ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.emergency_resources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix emergency_resources status constraint to allow more statuses
ALTER TABLE public.emergency_resources DROP CONSTRAINT IF EXISTS emergency_resources_status_check;
ALTER TABLE public.emergency_resources ADD CONSTRAINT emergency_resources_status_check 
  CHECK (status IN ('Available', 'Depleted', 'In Use', 'Limited', 'Maintenance'));
