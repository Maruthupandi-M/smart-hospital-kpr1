import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface EmergencyFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function EmergencyFormModal({ onClose, onSuccess, initialData }: EmergencyFormModalProps) {
  const { session, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;
  const isAdmin = role === 'Admin';

  const [formData, setFormData] = useState({
    resource_name: initialData?.resource_name || '',
    resource_type: initialData?.resource_type || '',
    department: initialData?.department || 'Emergency',
    quantity: initialData?.quantity || 1,
    available_quantity: initialData?.available_quantity ?? (initialData?.quantity || 1),
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
    
    // Quick frontend validation
    const qty = parseInt(formData.quantity.toString());
    const avail = parseInt(formData.available_quantity.toString());
    
    if (qty < 0 || avail < 0) {
      setError('Quantities cannot be negative.');
      setLoading(false);
      return;
    }
    
    if (avail > qty) {
      setError('Available quantity cannot exceed total quantity.');
      setLoading(false);
      return;
    }

    try {
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (isDemo) {
        const demoRes = JSON.parse(sessionStorage.getItem('demo_emergency') || '[]');
        if (isEditing) {
          const updated = demoRes.map((eq: any) => 
            (eq.id === initialData.id) 
              ? { ...eq, ...formData } 
              : eq
          );
          sessionStorage.setItem('demo_emergency', JSON.stringify(updated));
        } else {
          demoRes.push({
            id: Date.now().toString(),
            ...formData,
            available_quantity: formData.quantity,
          });
          sessionStorage.setItem('demo_emergency', JSON.stringify(demoRes));
        }
        onSuccess();
        onClose();
        return;
      }

      const url = isEditing 
        ? `${API_BASE}/api/emergency-resources/${initialData.id}`
        : `${API_BASE}/api/emergency-resources`;
        
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = { ...formData };
      if (!isEditing) {
        payload.available_quantity = payload.quantity;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save emergency resource data');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-600/10 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing ? 'Edit Emergency Resource' : 'Add New Resource'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update existing emergency details' : 'Register critical resource'}
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

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Resource Name</label>
            <input 
              type="text" 
              name="resource_name"
              required
              value={formData.resource_name}
              onChange={handleChange}
              placeholder="e.g. Defibrillator"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all bg-slate-50"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Resource Type</label>
            <input 
              type="text" 
              name="resource_type"
              required
              value={formData.resource_type}
              onChange={handleChange}
              placeholder="e.g. Equipment, Supply, Kit"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Department</label>
            <select 
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all bg-slate-50"
            >
              <option value="Emergency">Emergency</option>
              <option value="ICU">ICU</option>
              <option value="Trauma">Trauma</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Total Quantity</label>
              <input 
                type="number" 
                name="quantity"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all bg-slate-50"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                Available Quantity
              </label>
              <input 
                type="number" 
                name="available_quantity"
                min="0"
                max={formData.quantity}
                required
                disabled={!isEditing}
                value={formData.available_quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Status</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all bg-slate-50"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Limited">Limited</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {isEditing && parseInt(formData.available_quantity.toString()) === 0 && (
            <p className="text-xs text-orange-600 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              0 Available: The allocation engine will skip assigning this resource to new patients.
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
              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
