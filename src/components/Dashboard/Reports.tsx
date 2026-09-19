import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Users, Bed, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
export function Reports() {
  const { session } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/reports/overview`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Backend unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [session]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-3">
         <RefreshCw className="animate-spin h-6 w-6 text-[#0d64a9]" />
         <p className="font-semibold text-sm">Generating Reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e4f0fa] p-2 rounded-lg">
            <FileText className="w-6 h-6 text-[#0d64a9]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Operational Reports</h1>
        </div>
        <button onClick={fetchReports} disabled={loading} className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0d64a9]" />
            Patient Statistics
          </h3>
          <div className="space-y-3">
            <StatRow label="Total Patients" value={data.patients?.total || 0} />
            <StatRow label="Waiting" value={data.patients?.waiting || 0} highlight="text-amber-600" />
            <StatRow label="In Consultation" value={data.patients?.in_consultation || 0} highlight="text-blue-600" />
            <StatRow label="Admitted" value={data.patients?.admitted || 0} highlight="text-emerald-600" />
            <StatRow label="Completed" value={data.patients?.completed || 0} />
          </div>
        </div>

        {/* Resource Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bed className="w-5 h-5 text-[#0d64a9]" />
            Resource Utilization
          </h3>
          <div className="space-y-3">
            <StatRow label="Bed Utilization" value={`${Math.round(((data.resources?.occupied_beds || 0) / (data.resources?.total_beds || 1)) * 100)}%`} />
            <StatRow label="Doctor Workload (Busy)" value={`${data.resources?.busy_doctors || 0} / ${data.resources?.total_doctors || 0}`} />
            <StatRow label="Nurse Workload (Busy)" value={`${data.resources?.busy_nurses || 0} / ${data.resources?.total_nurses || 0}`} />
            <StatRow label="Equip in Use" value={data.resources?.equipment_in_use || 0} />
            <StatRow label="Emergency Ready" value={data.resources?.emergency_available || 0} highlight="text-emerald-600" />
          </div>
        </div>

        {/* Queue Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0d64a9]" />
            Queue Statistics
          </h3>
          <div className="space-y-3">
            <StatRow label="Currently Waiting" value={data.queue?.current_waiting || 0} />
            <StatRow label="Critical Priority" value={data.queue?.critical_count || 0} highlight="text-red-600" />
            <StatRow label="Emergency Priority" value={data.queue?.emergency_count || 0} highlight="text-orange-600" />
            <StatRow label="Normal Priority" value={data.queue?.normal_count || 0} />
            <StatRow label="Avg Wait (Mins)" value={data.queue?.avg_wait_mins || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string, value: string | number, highlight?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-600 font-medium text-sm">{label}</span>
      <span className={cn("font-bold", highlight || "text-slate-800")}>{value}</span>
    </div>
  );
}
