import { API_BASE } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bed, Stethoscope, HeartPulse, AlertTriangle, Users, Clock, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AllocationDashboard } from './AllocationDashboard';
interface DashboardData {
  summary: {
    total_beds: number;
    available_beds: number;
    occupied_beds: number;
    doctors_available: number;
    nurses_available: number;
    patients_waiting: number;
  };
  resources: {
    beds: { status: string; count: number }[];
    doctors: { status: string; count: number }[];
    nurses: { status: string; count: number }[];
    equipment: { status: string; count: number }[];
    emergency: { status: string; count: number }[];
  };
  queue: {
    patient_code: string;
    arrival_time: string;
    priority: string;
    department: string;
    status: string;
  }[];
  alerts: string[];
}

export function Dashboard() {
  const { session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Update the "now" timestamp every minute for accurate waiting times
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      const isDemo = sessionStorage.getItem('demo') === 'true';
      if (!session?.access_token && !isDemo) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (isDemo) {
          throw new Error("Demo mode: Backend bypass");
        }
        
        // Connect to Flask API
        const response = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Unable to load hospital resource data. Please try again.');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.warn('Backend unavailable, using mock data for visualization');
            const existingDemoPatients = JSON.parse(sessionStorage.getItem('demo_patients') || '[]');
            const activeWaiting = existingDemoPatients.filter((p:any) => p.status === 'Waiting');
            
            setData({
              summary: {
                total_beds: 120,
                available_beds: 18,
                occupied_beds: 102,
                doctors_available: 8,
                nurses_available: 24,
                patients_waiting: activeWaiting.length > 0 ? activeWaiting.length : 15
              },
              resources: {
                beds: [{ status: 'Available', count: 18 }, { status: 'Occupied', count: 102 }],
                doctors: [{ status: 'Available', count: 8 }, { status: 'Busy', count: 14 }, { status: 'On Leave', count: 3 }],
                nurses: [{ status: 'Available', count: 24 }, { status: 'Busy', count: 42 }, { status: 'On Leave', count: 5 }],
                equipment: [{ status: 'Available', count: 45 }, { status: 'In Use', count: 89 }, { status: 'Maintenance', count: 12 }],
                emergency: [{ status: 'Available', count: 100 }, { status: 'Depleted', count: 0 }]
              },
              queue: activeWaiting.length > 0 ? activeWaiting : [
                { patient_code: 'P-1042', arrival_time: new Date(Date.now() - 45 * 60000).toISOString(), priority: 'Critical', department: 'ER', required_resource: 'Doctor + Nurse', status: 'Waiting' },
                { patient_code: 'P-1043', arrival_time: new Date(Date.now() - 32 * 60000).toISOString(), priority: 'High', department: 'Cardiology', required_resource: 'Doctor', status: 'Waiting' },
                { patient_code: 'P-1044', arrival_time: new Date(Date.now() - 15 * 60000).toISOString(), priority: 'Normal', department: 'General', required_resource: 'Bed', status: 'Waiting' },
              ],
              alerts: [
                "Low bed availability: Critical capacity reached.",
                "Critical priority patients are currently waiting."
              ]
            });
          } finally {
            setLoading(false);
          }
        }
    
        fetchDashboardData();
        
        // Set up polling or realtime here in the future
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
      }, [session]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <svg className="animate-spin h-8 w-8 text-[#0d64a9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-semibold text-sm">Loading hospital resources...</p>
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
      
      {/* ALERTS */}
      {data.alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-orange-800">Operational Alerts</h3>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-orange-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard title="Total Beds" value={data.summary.total_beds} icon={Bed} />
        <SummaryCard title="Available Beds" value={data.summary.available_beds} icon={Bed} highlight="text-emerald-600" />
        <SummaryCard title="Occupied Beds" value={data.summary.occupied_beds} icon={Bed} highlight="text-amber-600" />
        <SummaryCard title="Doctors Available" value={data.summary.doctors_available} icon={Stethoscope} />
        <SummaryCard title="Nurses Available" value={data.summary.nurses_available} icon={HeartPulse} />
        <SummaryCard title="Patients Waiting" value={data.summary.patients_waiting} icon={Users} highlight="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RESOURCE STATUS */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#0d64a9]" />
            Resource Status
          </h3>
          
          <div className="space-y-6">
            <ResourceGroup title="Beds" data={data.resources.beds} />
            <ResourceGroup title="Doctors" data={data.resources.doctors} />
            <ResourceGroup title="Nurses" data={data.resources.nurses} />
            <ResourceGroup title="Equipment" data={data.resources.equipment} />
            <ResourceGroup title="Emergency" data={data.resources.emergency} />
          </div>
        </div>

        {/* PATIENT QUEUE OVERVIEW */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0d64a9]" />
            Patient Queue Overview
          </h3>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Patient ID</th>
                  <th className="px-4 py-3">Waiting Time</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.queue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No patients currently in queue.
                    </td>
                  </tr>
                ) : (
                  data.queue.slice(0, 5).map((patient: any, i: number) => {
                    const arrivalDate = new Date(patient.arrival_time);
                    const waitingMinutes = Math.max(0, Math.floor((now - arrivalDate.getTime()) / 60000));
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-700">{patient.patient_code}</td>
                        <td className="px-4 py-3 font-medium text-slate-600 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {waitingMinutes} mins
                        </td>
                        <td className="px-4 py-3 text-slate-600">{patient.department}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold",
                            patient.priority === 'Critical' ? "bg-red-100 text-red-700" :
                            patient.priority === 'Emergency' ? "bg-orange-100 text-orange-700" :
                            patient.priority === 'High' ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {patient.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">{patient.required_resource || 'Bed'}</td>
                        <td className="px-4 py-3">
                          <span className="text-blue-700 font-bold text-xs bg-blue-100 px-2 py-1 rounded-md">
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
      </div>

      <div className="pt-6 border-t border-slate-200">
        <AllocationDashboard />
      </div>

    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, highlight }: { title: string, value: number, icon: any, highlight?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-2/3">{title}</h4>
        <div className="p-1.5 bg-slate-50 rounded-md">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      <div className={cn("text-2xl font-black", highlight || "text-slate-800")}>
        {value}
      </div>
    </div>
  );
}

function ResourceGroup({ title, data }: { title: string, data: { status: string, count: number }[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                item.status === 'Available' ? "bg-emerald-500" :
                item.status === 'Occupied' || item.status === 'Busy' || item.status === 'In Use' ? "bg-amber-500" :
                item.status === 'Maintenance' ? "bg-slate-400" :
                "bg-blue-500"
              )}></span>
              <span className="text-slate-600 font-medium">{item.status}</span>
            </div>
            <span className="font-bold text-slate-800">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
