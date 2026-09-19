import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import { X, Plus, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface PatientRegistrationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PatientRegistrationForm({ onClose, onSuccess }: PatientRegistrationFormProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patient_code: '',
    department: 'Emergency',
    priority: 'Normal',
    emergency_status: 'No',
    required_resource: 'Doctor',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic frontend validation
    if (!formData.patient_code.trim()) {
      setError('Patient ID is required.');
      setLoading(false);
      return;
    }

    try {
      // Get token: prefer real session, fall back to mock_session in localStorage
      const token = session?.access_token || (() => {
        try { return JSON.parse(localStorage.getItem('mock_session') || '{}').access_token; } catch { return null; }
      })();

      if (!token) {
        throw new Error('You must be logged in to register a patient.');
      }

      const response = await fetch(`${API_BASE}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to register patient.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-[#e4f0fa] p-2 rounded-lg">
              <User className="w-5 h-5 text-[#0d64a9]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Register New Patient</h2>
              <p className="text-xs text-slate-500 font-medium">Add a patient to the operational queue</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient ID */}
              <div className="space-y-1.5">
                <label htmlFor="patient_code" className="text-sm font-bold text-slate-700 block">
                  Patient ID / Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="patient_code"
                  name="patient_code"
                  type="text"
                  required
                  placeholder="e.g. P-1045"
                  value={formData.patient_code}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all"
                />
                <p className="text-[11px] text-slate-500 font-medium">Must be unique across the hospital.</p>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label htmlFor="department" className="text-sm font-bold text-slate-700 block">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all appearance-none"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General">General</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label htmlFor="priority" className="text-sm font-bold text-slate-700 block">
                  Triage Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all appearance-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="Emergency">Emergency</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              {/* Emergency Status */}
              <div className="space-y-1.5">
                <label htmlFor="emergency_status" className="text-sm font-bold text-slate-700 block">
                  Emergency Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="emergency_status"
                  name="emergency_status"
                  required
                  value={formData.emergency_status}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all appearance-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Required Resource */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="required_resource" className="text-sm font-bold text-slate-700 block">
                  Required Resource <span className="text-red-500">*</span>
                </label>
                <select
                  id="required_resource"
                  name="required_resource"
                  required
                  value={formData.required_resource}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all appearance-none"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Bed">Bed</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Bed + Doctor + Nurse">Bed + Doctor + Nurse</option>
                  <option value="Emergency Resource">Emergency Resource</option>
                </select>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 font-medium">
              <span className="font-bold">Note:</span> Arrival time and queue status will be automatically generated by the system.
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="patient-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0d64a9] hover:bg-[#0b538c] transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                Register Patient
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
