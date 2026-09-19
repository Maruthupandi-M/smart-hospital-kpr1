import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import { X, HeartPulse, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface NurseFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function NurseFormModal({ onClose, onSuccess, initialData }: NurseFormModalProps) {
  const { session, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;
  const isNurse = role === 'Nurse';

  const [formData, setFormData] = useState({
    staff_id: initialData?.staff_id || '',
    name: initialData?.name || '',
    department: initialData?.department || 'General',
    shift: initialData?.shift || 'Morning',
    status: initialData?.status || 'Available',
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

    try {
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (isDemo) {
        const demoNurses = JSON.parse(sessionStorage.getItem('demo_nurses') || '[]');
        if (isEditing) {
          const updated = demoNurses.map((n: any) => 
            (n.id === initialData.id || n.staff_id === initialData.staff_id) 
              ? { ...n, ...formData } 
              : n
          );
          sessionStorage.setItem('demo_nurses', JSON.stringify(updated));
        } else {
          demoNurses.push({
            id: Date.now().toString(),
            ...formData,
            current_patient_count: 0
          });
          sessionStorage.setItem('demo_nurses', JSON.stringify(demoNurses));
        }
        onSuccess();
        onClose();
        return;
      }

      const url = isEditing 
        ? `${API_BASE}/api/nurses/${initialData.id || initialData.staff_id}`
        : `${API_BASE}/api/nurses`;
        
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save nurse data');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d64a9]/10 flex items-center justify-center text-[#0d64a9]">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing ? 'Edit Nurse' : 'Add New Nurse'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update existing records' : 'Register a new nurse'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Staff ID</label>
              <input 
                type="text" 
                name="staff_id"
                required
                value={formData.staff_id}
                onChange={handleChange}
                disabled={isEditing || isNurse}
                placeholder="e.g. NUR-001"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                disabled={isNurse}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jane Smith"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Department</label>
            <select 
              name="department"
              disabled={isNurse}
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="General">General</option>
              <option value="Emergency">Emergency</option>
              <option value="ICU">ICU</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Maternity">Maternity</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Shift</label>
              <select 
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-slate-50"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
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
            </div>
          </div>

          {isEditing && formData.status === 'Available' && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              Changing to Available allows the engine to assign patients.
            </p>
          )}

          {isNurse && (
            <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-3">
              As a Nurse, you are only permitted to update your operational status and shift.
            </p>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-[#0d64a9] rounded-lg hover:bg-[#0b538c] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Nurse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
