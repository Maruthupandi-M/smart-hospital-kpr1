import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Plus, Users, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { PatientRegistrationForm } from './PatientRegistrationForm';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
export function PatientsList() {
  const { session } = useAuth();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (isDemo) {
        // Fetch from sessionStorage for demo
        const demoPatients = JSON.parse(sessionStorage.getItem('demo_patients') || '[]');
        setPatients(demoPatients);
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
        throw new Error('Failed to fetch patients data.');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [session]);

  const handleRegistrationSuccess = () => {
    fetchPatients();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0d64a9]" />
            Patient Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and register incoming patients into the hospital system.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchPatients}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          
          <button
            onClick={() => setIsRegistrationOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#0d64a9] text-white text-sm font-bold shadow-sm hover:bg-[#0b538c] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Register Patient
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Patient List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Patient ID..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0d64a9] focus:ring-1 focus:ring-[#0d64a9] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Patient ID</th>
                <th className="px-6 py-3.5">Arrival</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Required Resource</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                      <RefreshCw className="animate-spin h-6 w-6 text-[#0d64a9]" />
                      <p className="font-semibold text-sm">Loading patients...</p>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No patients currently registered.
                  </td>
                </tr>
              ) : (
                patients.map((patient, i) => {
                  const arrivalDate = new Date(patient.arrival_time);
                  
                  return (
                    <tr key={patient.id || i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{patient.patient_code}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {arrivalDate.toLocaleDateString()} <span className="text-xs">{arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                        {patient.emergency_status === 'Yes' && (
                          <span className="ml-2 px-2 py-1 rounded text-[10px] font-bold bg-red-500 text-white uppercase">
                            Emergency
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{patient.required_resource}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-bold",
                          patient.status === 'Waiting' ? "bg-blue-100 text-blue-700" :
                          patient.status === 'In Consultation' ? "bg-purple-100 text-purple-700" :
                          patient.status === 'Admitted' ? "bg-emerald-100 text-emerald-700" :
                          patient.status === 'Completed' ? "bg-slate-100 text-slate-600" :
                          "bg-red-100 text-red-700" // Cancelled
                        )}>
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isRegistrationOpen && (
        <PatientRegistrationForm 
          onClose={() => setIsRegistrationOpen(false)} 
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
