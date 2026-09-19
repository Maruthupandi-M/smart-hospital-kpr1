import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Activity, Play, RefreshCw, AlertTriangle, Check, X, Bed, Stethoscope, HeartPulse, ShieldAlert } from 'lucide-react';
import { DemandSurgeModal } from './DemandSurgeModal';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
export function SimulationDashboard() {
  const { session, role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [beforeState, setBeforeState] = useState<any>(null);
  const [afterState, setAfterState] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);


  const loadInitialState = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = session?.access_token || (() => {
        try { return JSON.parse(localStorage.getItem('mock_session') || '{}').access_token; } catch { return null; }
      })();
      if (!token) { setError("Not authenticated"); return; }
      
      const response = await fetch(`${API_BASE}/api/simulation/state`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBeforeState(data.current_state);
        // Reset simulation view fully
        setAfterState(null);
        setRecommendations([]);
        setSimState('idle');
      } else {
        throw new Error("Backend returned error");
      }
    } catch (e: any) {
      setError("Backend unavailable. Please ensure the Flask server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run once on mount — do NOT put session in deps or AuthContext re-renders will reset simState
    const token = (() => {
      try { return JSON.parse(localStorage.getItem('mock_session') || '{}').access_token; } catch { return null; }
    })();
    if (token) {
      fetch(`${API_BASE}/api/simulation/state`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data?.current_state) {
          setBeforeState(data.current_state);
        }
      }).catch(() => {
        setError("Backend unavailable. Please ensure the Flask server is running on port 5000.");
      });
    }
  }, []); // empty deps - run once only

  const handleAction = async (action: 'Accept' | 'Reject' | 'Modify', rec: any) => {
    try {
      setLoading(true);

      const token = session?.access_token || (() => {
        try { return JSON.parse(localStorage.getItem('mock_session') || '{}').access_token; } catch { return null; }
      })();

      const response = await fetch(`${API_BASE}/api/simulation/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          patient_code: rec.patient_code,
          state: afterState,
          allocation: rec.allocation
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process action");
      }
      
      // Remove the acted-upon recommendation from the list without resetting simulation
      setRecommendations(prev => prev.filter(r => r.patient_code !== rec.patient_code));
      
    } catch(err: any) {
      setError(err.message || 'Error processing action');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSurge = async (config: any) => {
    setIsModalOpen(false);
    setLoading(true);
    setError(null);
    setSimState('running');

    try {
      // Get token from session or fall back to mock_session in localStorage
      const token = session?.access_token || (() => {
        try { return JSON.parse(localStorage.getItem('mock_session') || '{}').access_token; } catch { return null; }
      })();
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Backend API call
      const response = await fetch(`${API_BASE}/api/simulation/demand-surge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error("Simulation failed");
      const data = await response.json();
      setBeforeState(data.before.state);
      setAfterState(data.after.state);
      setRecommendations(data.after.recommendations);
      setSimState('completed');

    } catch (err: any) {
      setError(err.message || 'Error running simulation');
      setSimState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceChange = (type: 'beds' | 'doctors' | 'nurses', index: number) => {
    if (!afterState) return;
    
    // Create new state
    const newState = JSON.parse(JSON.stringify(afterState));
    
    // Toggle status
    const currentStatus = newState[type][index].status;
    newState[type][index].status = currentStatus === 'Available' ? 'Occupied' : 'Available';
    if(type !== 'beds' && currentStatus === 'Available') newState[type][index].status = 'Busy';
    
    setAfterState(newState);
    
       // Backend mode for resource change
       fetch(`${API_BASE}/api/simulation/resource-change`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            state: newState,
            changed_resource: {
               type: type === 'beds' ? 'Bed' : type === 'doctors' ? 'Doctor' : 'Nurse',
               action: currentStatus === 'Available' ? 'decreased' : 'increased'
            }
          })
        }).then(res => res.json()).then(data => {
           if(data.recommendations) setRecommendations(data.recommendations);
        }).catch(err => console.error(err));
  };

  const countAvailable = (arr: any[] | undefined) => (arr || []).filter(x => x.status === 'Available').length;
  const countWaiting = (arr: any[] | undefined) => (arr || []).filter(x => x.status === 'Waiting').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-600" />
              Demand Surge Simulation
            </h1>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Simulation Mode
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Test hospital resilience and dynamic reallocation under extreme stress.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {simState === 'completed' && (
            <button
              onClick={loadInitialState}
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
            >
              Reset Simulation
            </button>
          )}
          
          {(role === 'Admin' || session?.user?.user_metadata?.role === 'Admin') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Simulate Demand Surge
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading && simState === 'running' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping"></div>
            <RefreshCw className="w-12 h-12 text-orange-600 animate-spin relative z-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mt-6">Simulating Demand Surge...</h3>
          <p className="text-slate-500 mt-2 text-sm text-center max-w-md">
            Calculating impact on beds, doctors, and nurses. The Intelligent Allocation Engine is recalculating queue priorities...
          </p>
        </div>
      )}

      {simState === 'completed' && beforeState && afterState && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Before / After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Before */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-200/50 px-4 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-700 text-sm">BEFORE SURGE</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">Waiting Patients</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{countWaiting(beforeState.patients)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">Available Beds</p>
                  <p className="text-2xl font-bold text-[#0d64a9] mt-1">{countAvailable(beforeState.beds)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">Available Doctors</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{countAvailable(beforeState.doctors)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">Available Nurses</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{countAvailable(beforeState.nurses)}</p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-orange-50/50 rounded-xl border border-orange-200 overflow-hidden">
              <div className="bg-orange-100/50 px-4 py-3 border-b border-orange-200 flex items-center justify-between">
                <h3 className="font-bold text-orange-800 text-sm">AFTER SURGE (CURRENT)</h3>
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 font-bold rounded-bl-lg">
                    +{countWaiting(afterState.patients) - countWaiting(beforeState.patients)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Waiting Patients</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{countWaiting(afterState.patients)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100 text-center relative">
                  <p className="text-xs text-slate-500 font-medium">Available Beds</p>
                  <p className={cn("text-2xl font-bold mt-1", countAvailable(afterState.beds) === 0 ? "text-red-600" : "text-[#0d64a9]")}>
                    {countAvailable(afterState.beds)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">Available Doctors</p>
                  <p className={cn("text-2xl font-bold mt-1", countAvailable(afterState.doctors) === 0 ? "text-red-600" : "text-emerald-600")}>
                    {countAvailable(afterState.doctors)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">Available Nurses</p>
                  <p className={cn("text-2xl font-bold mt-1", countAvailable(afterState.nurses) === 0 ? "text-red-600" : "text-emerald-600")}>
                    {countAvailable(afterState.nurses)}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic Resource Toggles (What-If) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Dynamic Resource Modifiers
              </h3>
              <p className="text-xs text-slate-500 font-medium">Click tags to toggle availability and trigger recalculation</p>
            </div>
            <div className="p-5 flex flex-wrap gap-4">
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Beds</p>
                <div className="flex gap-2">
                  {(afterState.beds || []).slice(0, 4).map((b: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => handleResourceChange('beds', idx)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border",
                        b.status === 'Available' ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <Bed className="w-3.5 h-3.5" />
                      {b.bed_number}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Doctors</p>
                <div className="flex gap-2">
                  {(afterState.doctors || []).slice(0, 3).map((d: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => handleResourceChange('doctors', idx)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border",
                        d.status === 'Available' ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Doc {idx+1}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* AI Allocation Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-[#0d64a9] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold">Live AI Allocation Recommendations</h3>
              </div>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                {recommendations.length} Evaluated
              </span>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3 text-center">Score</th>
                    <th className="px-5 py-3">Allocation Status</th>
                    <th className="px-5 py-3">Assigned Resources</th>
                    <th className="px-5 py-3 max-w-xs">Explanation</th>
                    <th className="px-5 py-3 text-right">Human-in-Loop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recommendations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-medium">
                        No patients waiting.
                      </td>
                    </tr>
                  ) : (
                    recommendations.map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {rec.patient_code}
                          {rec.patient_code.startsWith('SIM') && (
                            <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">SIMULATED</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold",
                            rec.priority === 'Critical' ? "bg-red-100 text-red-700" :
                            rec.priority === 'Emergency' ? "bg-orange-100 text-orange-700" :
                            rec.priority === 'High' ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {rec.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-slate-700">
                          {rec.score}
                        </td>
                        <td className="px-5 py-4">
                          {rec.status === 'Ready' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
                              <Check className="w-3.5 h-3.5" />
                              Ready to Allocate
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md text-xs border border-red-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {rec.reason}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {rec.status === 'Ready' ? (
                            <div className="flex gap-1.5 flex-wrap">
                              {rec.allocation.bed && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 flex items-center gap-1"><Bed className="w-3 h-3"/> {rec.allocation.bed?.bed_number || 'Bed'}</span>}
                              {rec.allocation.doctor && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 flex items-center gap-1"><Stethoscope className="w-3 h-3"/> {rec.allocation.doctor?.name || rec.allocation.doctor?.staff_id || 'Doctor'}</span>}
                              {rec.allocation.nurse && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 flex items-center gap-1"><HeartPulse className="w-3 h-3"/> {rec.allocation.nurse?.name || rec.allocation.nurse?.staff_id || 'Nurse'}</span>}
                              {rec.allocation.equipment && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 flex items-center gap-1">{rec.allocation.equipment?.equipment_name || 'Equipment'}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium italic">Cannot allocate — waiting on bottleneck</span>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-xs whitespace-normal text-xs text-slate-500">
                           {rec.explanation}
                        </td>
                        <td className="px-5 py-4 text-right">
                           {rec.status === 'Ready' && (session?.user?.user_metadata?.role === 'Admin' || session?.user?.user_metadata?.role === 'Doctor') && (
                             <div className="flex items-center justify-end gap-1.5">
                               <button onClick={() => handleAction('Accept', rec)} className="px-2 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-bold shadow-sm transition-colors" title="Accept Recommendation">
                                 Accept
                               </button>
                               <button onClick={() => handleAction('Modify', rec)} className="px-2 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold border border-slate-200 shadow-sm transition-colors" title="Modify Recommendation">
                                 Modify
                               </button>
                               <button onClick={() => handleAction('Reject', rec)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 shadow-sm transition-colors" title="Reject Recommendation">
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                           )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {isModalOpen && (
        <DemandSurgeModal 
          onClose={() => setIsModalOpen(false)} 
          onSimulate={handleSimulateSurge}
        />
      )}
    </div>
  );
}
