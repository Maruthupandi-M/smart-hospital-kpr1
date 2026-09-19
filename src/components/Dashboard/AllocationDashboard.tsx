import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Edit2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { ModifyRecommendationModal } from './ModifyRecommendationModal';
export function AllocationDashboard() {
  const { session, role } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingRec, setEditingRec] = useState<any | null>(null);

  const canManage = role === 'Admin' || role === 'Doctor';

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE}/api/allocation/recommendations`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations.');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this recommendation?`)) return;
    
    try {

      const rec = recommendations.find(r => r.id === id);
      
      const response = await fetch(`${API_BASE}/api/allocation/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ patient_code: rec?.patient_code, allocation: rec?.allocation_data })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} recommendation`);
      }
      
      fetchRecommendations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const pendingRecs = recommendations.filter(r => r.status === 'Recommended' || r.status === 'Modified');
  const pastRecs = recommendations.filter(r => r.status === 'Accepted' || r.status === 'Rejected');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Pending Recommendations
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve engine-generated allocations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRecommendations}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
         <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3 bg-white rounded-xl border border-slate-200">
           <RefreshCw className="animate-spin h-6 w-6 text-[#0d64a9]" />
           <p className="font-semibold text-sm">Loading recommendations...</p>
         </div>
      ) : pendingRecs.length === 0 ? (
        <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center text-slate-500">
           <p className="font-medium">No pending recommendations.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingRecs.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row gap-6 justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md text-sm">
                      {rec.patient_code}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                      <Clock className="w-4 h-4" />
                      Score: {rec.score}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                      rec.status === 'Recommended' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-purple-50 text-purple-700 border-purple-200"
                    )}>
                      {rec.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-700"><strong>Reason:</strong> {rec.recommendation_reason || "No explanation provided."}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Doctor</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{rec.allocation_data?.doctor?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Nurse</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{rec.allocation_data?.nurse?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Bed</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{rec.allocation_data?.bed?.bed_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Equip / Emer</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">
                        {rec.allocation_data?.equipment?.equipment_name || 'N/A'} / {rec.allocation_data?.emergency_resource?.resource_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {canManage && (
                  <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                    <button 
                      onClick={() => handleAction(rec.id, 'accept')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => setEditingRec(rec)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Modify
                    </button>
                    <button 
                      onClick={() => handleAction(rec.id, 'reject')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-bold rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pastRecs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Past Decisions</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastRecs.slice(0, 5).map(rec => (
                  <tr key={rec.id}>
                    <td className="px-6 py-3 font-semibold text-slate-700">{rec.patient_code}</td>
                    <td className="px-6 py-3">{rec.score}</td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        rec.status === 'Accepted' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{new Date(rec.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingRec && canManage && (
        <ModifyRecommendationModal 
          recommendation={editingRec}
          onClose={() => setEditingRec(null)}
          onSuccess={() => {
            setEditingRec(null);
            fetchRecommendations();
          }}
        />
      )}
    </div>
  );
}
