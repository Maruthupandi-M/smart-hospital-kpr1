import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ModifyRecommendationModalProps {
  recommendation: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModifyRecommendationModal({ recommendation, onClose, onSuccess }: ModifyRecommendationModalProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocation, setAllocation] = useState(recommendation.allocation_data || {});

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (isDemo) {
        const demoRecs = JSON.parse(sessionStorage.getItem('demo_recommendations') || '[]');
        const updated = demoRecs.map((r: any) => 
          r.id === recommendation.id ? { ...r, status: 'Modified', allocation_data: allocation } : r
        );
        sessionStorage.setItem('demo_recommendations', JSON.stringify(updated));
        onSuccess();
        return;
      }

      const res = await fetch(`${API_BASE}/api/allocation/${recommendation.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ allocation })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to modify recommendation');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Modify Recommendation</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <p className="text-sm text-slate-500 font-medium">
              You are modifying the recommended allocation for patient <span className="text-slate-800 font-bold">{recommendation.patient_code}</span>.
              (Note: For the hackathon demo, you can manually type replacement IDs or names).
            </p>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Doctor Name/ID</label>
              <input 
                type="text" 
                value={allocation.doctor?.name || ''}
                onChange={(e) => setAllocation({ ...allocation, doctor: { ...allocation.doctor, name: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nurse Name/ID</label>
              <input 
                type="text" 
                value={allocation.nurse?.name || ''}
                onChange={(e) => setAllocation({ ...allocation, nurse: { ...allocation.nurse, name: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9]" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Bed Number/ID</label>
              <input 
                type="text" 
                value={allocation.bed?.bed_number || ''}
                onChange={(e) => setAllocation({ ...allocation, bed: { ...allocation.bed, bed_number: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9]" 
              />
            </div>

          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-[#0d64a9] rounded-lg hover:bg-[#0b538c] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-blue-900/10"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Save Modification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
