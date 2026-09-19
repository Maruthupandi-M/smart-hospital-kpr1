import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
export function Alerts() {
  const { session } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/alerts`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Backend unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [session]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e4f0fa] p-2 rounded-lg">
            <Bell className="w-6 h-6 text-[#0d64a9]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Alerts</h1>
        </div>
        <button onClick={fetchAlerts} disabled={loading} className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      {loading && !alerts.length ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-3">
           <RefreshCw className="animate-spin h-6 w-6 text-[#0d64a9]" />
           <p className="font-semibold text-sm">Loading alerts...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 text-center text-slate-500">
           <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="font-semibold">No active alerts at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert, i) => (
            <div key={i} className={cn(
              "rounded-xl border p-5 flex gap-4",
              alert.severity === 'CRITICAL' ? "bg-red-50 border-red-200" :
              alert.severity === 'WARNING' ? "bg-orange-50 border-orange-200" :
              "bg-blue-50 border-blue-200"
            )}>
              <div className="pt-0.5">
                {alert.severity === 'CRITICAL' ? <AlertCircle className="w-6 h-6 text-red-600" /> :
                 alert.severity === 'WARNING' ? <AlertTriangle className="w-6 h-6 text-orange-500" /> :
                 <Info className="w-6 h-6 text-blue-600" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={cn("font-bold text-lg", 
                    alert.severity === 'CRITICAL' ? "text-red-800" :
                    alert.severity === 'WARNING' ? "text-orange-800" :
                    "text-blue-800"
                  )}>{alert.title}</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-white/60 px-2 py-1 rounded">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 font-medium text-slate-700">{alert.message}</p>
                {alert.related_resource && (
                  <div className="mt-3 inline-block bg-white/60 text-slate-600 px-3 py-1 rounded-md text-xs font-bold border border-slate-200/50">
                    Resource: {alert.related_resource}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
