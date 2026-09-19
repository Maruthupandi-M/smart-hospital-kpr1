import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { ListChecks, Clock, AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
export function PatientQueue() {
  const { session } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (isDemo) {
        const demoPatients = JSON.parse(sessionStorage.getItem('demo_patients') || '[]');
        // In queue we only want Waiting or active patients, but for demo let's show all that aren't completed/cancelled
        const activeQueue = demoPatients.filter((p: any) => p.status === 'Waiting');
        setQueue(activeQueue);
        setLoading(false);
        return;
      }

      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE}/api/patients`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient queue.');
      }

      const data = await response.json();
      const activeQueue = data.filter((p: any) => p.status === 'Waiting');
      setQueue(activeQueue);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Update the "now" timestamp every minute for accurate waiting times
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [session]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (isDemo) {
        const demoPatients = JSON.parse(sessionStorage.getItem('demo_patients') || '[]');
        const updatedPatients = demoPatients.map((p: any) => {
            // Demo might not have an id, so match on patient_code if id is missing
            if ((p.id && p.id === id) || (!p.id && p.patient_code === id)) {
                return { ...p, status: newStatus };
            }
            return p;
        });
        sessionStorage.setItem('demo_patients', JSON.stringify(updatedPatients));
        setTimeout(() => {
            fetchQueue();
            setUpdatingId(null);
        }, 500);
        return;
      }

      const response = await fetch(`${API_BASE}/api/patients/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update patient status.');
      }

      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-[#0d64a9]" />
            Patient Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">Live operational view of waiting patients prioritized by triage.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchQueue}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Queue Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Queue No.</th>
                <th className="px-6 py-3.5">Patient ID</th>
                <th className="px-6 py-3.5">Arrival</th>
                <th className="px-6 py-3.5">Waiting Time</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Resource</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && queue.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                      <RefreshCw className="animate-spin h-6 w-6 text-[#0d64a9]" />
                      <p className="font-semibold text-sm">Loading active queue...</p>
                    </div>
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No patients currently in the waiting queue.
                  </td>
                </tr>
              ) : (
                queue.map((patient, i) => {
                  const arrivalDate = new Date(patient.arrival_time);
                  const waitingMinutes = Math.floor((now - arrivalDate.getTime()) / 60000);
                  // Ensure waiting time isn't negative if client clock is slightly off
                  const displayMinutes = Math.max(0, waitingMinutes);
                  
                  return (
                    <tr key={patient.id || patient.patient_code} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-400">Q{String(i + 1).padStart(2, '0')}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{patient.patient_code}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className={cn("w-3.5 h-3.5", displayMinutes > 60 ? "text-red-500" : "text-slate-400")} />
                          <span className={cn(displayMinutes > 60 && "text-red-600 font-bold")}>
                            {displayMinutes} mins
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{patient.department}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold",
                          patient.priority === 'Critical' ? "bg-red-100 text-red-700" :
                          patient.priority === 'Emergency' ? "bg-orange-100 text-orange-700" :
                          patient.priority === 'High' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {patient.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{patient.required_resource}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left group">
                          <button 
                            disabled={updatingId === (patient.id || patient.patient_code)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
                          >
                            Update
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {/* Dropdown Menu (Hover for hackathon simplicity, can be click later) */}
                          <div className="absolute right-0 w-48 mt-1 origin-top-right bg-white border border-slate-200 divide-y divide-slate-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              <button
                                onClick={async () => {
                                  try {
                                    const isDemo = sessionStorage.getItem('demo') === 'true';
                                    if (isDemo) {
                                      // Simulate recommendation demo
                                      const demoRecs = JSON.parse(sessionStorage.getItem('demo_recommendations') || '[]');
                                      demoRecs.unshift({
                                        id: Date.now().toString(),
                                        patient_code: patient.patient_code,
                                        score: patient.priority === 'Critical' ? 100 : 80,
                                        status: 'Recommended',
                                        recommendation_reason: "Recommended based on priority and simulated availability.",
                                        created_at: new Date().toISOString(),
                                        allocation_data: { doctor: { name: 'Demo Doctor' }, bed: { bed_number: 'Demo Bed' }}
                                      });
                                      sessionStorage.setItem('demo_recommendations', JSON.stringify(demoRecs));
                                      alert("Recommendation generated! Please check the Allocation Dashboard.");
                                      return;
                                    }
                                    
                                    const res = await fetch(`${API_BASE}/api/allocation/recommend`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${session?.access_token}`
                                      },
                                      body: JSON.stringify({ patient_code: patient.patient_code })
                                    });
                                    if (!res.ok) throw new Error(await res.text());
                                    alert("Recommendation generated! Please check the Allocation Dashboard.");
                                  } catch (err: any) {
                                    alert("Failed: " + err.message);
                                  }
                                }}
                                className="group flex w-full items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Generate Recommendation
                              </button>
                            </div>
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusUpdate(patient.id || patient.patient_code, 'In Consultation')}
                                className="group flex w-full items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0d64a9]"
                              >
                                In Consultation
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(patient.id || patient.patient_code, 'Admitted')}
                                className="group flex w-full items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                              >
                                Admitted
                              </button>
                            </div>
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusUpdate(patient.id || patient.patient_code, 'Cancelled')}
                                className="group flex w-full items-center px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Cancelled
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
