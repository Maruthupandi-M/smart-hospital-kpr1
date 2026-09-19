import { useState } from 'react';
import { X, Play, AlertTriangle, Users } from 'lucide-react';


interface DemandSurgeModalProps {
  onClose: () => void;
  onSimulate: (config: any) => void;
}

export function DemandSurgeModal({ onClose, onSimulate }: DemandSurgeModalProps) {
  const [formData, setFormData] = useState({
    count: 10,
    department: 'Emergency',
    priority: 'Critical',
    emergency_status: 'Yes',
    required_resource: 'Bed + Doctor + Nurse',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'count' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Simulate Demand Surge</h2>
              <p className="text-xs text-slate-500 font-medium">Trigger an influx of patients to test resource constraints</p>
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
        <div className="p-6">
          <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-600" />
            <p>
              This is an isolated simulation. It will <strong>NOT</strong> corrupt real hospital data. 
              The intelligent allocation engine will evaluate how this surge impacts current resource availability.
            </p>
          </div>

          <form id="surge-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Count */}
              <div className="space-y-1.5">
                <label htmlFor="count" className="text-sm font-bold text-slate-700 block">
                  Additional Patients
                </label>
                <input
                  id="count"
                  name="count"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.count}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label htmlFor="department" className="text-sm font-bold text-slate-700 block">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label htmlFor="priority" className="text-sm font-bold text-slate-700 block">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="Emergency">Emergency</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Required Resource */}
              <div className="space-y-1.5">
                <label htmlFor="required_resource" className="text-sm font-bold text-slate-700 block">
                  Required Resources
                </label>
                <select
                  id="required_resource"
                  name="required_resource"
                  required
                  value={formData.required_resource}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="Bed + Doctor + Nurse">Bed + Doctor + Nurse</option>
                  <option value="Doctor + Equipment">Doctor + Equipment</option>
                  <option value="Bed + Emergency Resource">Bed + Emergency Resource</option>
                  <option value="Doctor">Doctor Only</option>
                </select>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="surge-form"
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Run Simulation
          </button>
        </div>

      </div>
    </div>
  );
}
