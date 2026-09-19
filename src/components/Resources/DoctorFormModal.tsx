import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import { X, AlertTriangle, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface DoctorFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function DoctorFormModal({ onClose, onSuccess, initialData }: DoctorFormModalProps) {
  const { session, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    staff_id: initialData?.staff_id || '',
    name: initialData?.name || '',
    department: initialData?.department || 'Cardiology',
    specialization: initialData?.specialization || 'Cardiologist',
    status: initialData?.status || 'Available',
  });

  const isEditing = !!initialData;

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

    if (!formData.staff_id.trim() || !formData.name.trim()) {
      setError('Staff ID and Name are required.');
      setLoading(false);
      return;
    }

    try {
      const isDemo = sessionStorage.getItem('demo') === 'true';

      if (isDemo) {
        const existingDemoDocs = JSON.parse(sessionStorage.getItem('demo_doctors') || '[]');
        let newDocs;
        
        if (isEditing) {
          newDocs = existingDemoDocs.map((d: any) => 
            (d.id === initialData.id || d.staff_id === initialData.staff_id) ? { ...d, ...formData } : d
          );
        } else {
          if (existingDemoDocs.some((d: any) => d.staff_id === formData.staff_id)) {
              throw new Error('Staff ID already exists in demo data.');
          }
          newDocs = [...existingDemoDocs, { id: Date.now().toString(), current_patient_count: 0, ...formData }];
        }
        
        sessionStorage.setItem('demo_doctors', JSON.stringify(newDocs));
        setTimeout(() => {
            onSuccess();
            onClose();
        }, 500);
        return;
      }

      if (!session?.access_token) {
        throw new Error('You must be logged in.');
      }

      const url = isEditing 
        ? `${API_BASE}/api/doctors/${initialData.id}` 
        : `${API_BASE}/api/doctors`;
        
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save doctor.');
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <Stethoscope className="w-5 h-5 text-[#0d64a9]" />
            <h2 className="font-bold text-lg">{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700">Staff ID <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="staff_id"
                required
                disabled={isEditing}
                value={formData.staff_id}
                onChange={handleChange}
                placeholder="e.g. D-101"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name"
                required
                disabled={role === 'Doctor'}
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Department</label>
              <select 
                name="department"
                disabled={role === 'Doctor'}
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="General">General</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="ICU">ICU</option>
                <option value="Emergency">Emergency</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Specialization</label>
              <input 
                type="text"
                name="specialization"
                disabled={role === 'Doctor'}
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiologist"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Status</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
            {isEditing && formData.status === 'Available' && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" />
                Changing to Available will allow the engine to assign patients to this doctor.
              </p>
            )}
            {role === 'Doctor' && (
              <p className="text-xs text-slate-500 mt-2">
                As a Doctor, you are only permitted to update your operational status.
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0d64a9] text-white rounded-lg font-bold hover:bg-[#0b538c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isEditing ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
