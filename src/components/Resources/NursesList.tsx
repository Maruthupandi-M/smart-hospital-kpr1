import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, AlertTriangle, Edit2, Trash2, HeartPulse } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { NurseFormModal } from './NurseFormModal';
export function NursesList() {
  const { session, role, staffId } = useAuth();
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<any | null>(null);

  const fetchNurses = async () => {
    try {
      setLoading(true);
      setError(null);
      


      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE}/api/nurses`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nurses data.');
      }

      const data = await response.json();
      setNurses(data);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this nurse?")) return;
    
    try {

      
      const response = await fetch(`${API_BASE}/api/nurses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete nurse');
      }
      
      fetchNurses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingNurse(null);
  };

  const handleSuccess = () => {
    fetchNurses();
  };

  const filteredNurses = nurses.filter(n => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = n.staff_id?.toLowerCase().includes(searchLower) || n.name?.toLowerCase().includes(searchLower);
    const matchesDept = departmentFilter === 'All' || n.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || n.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const availableNurses = nurses.filter(n => n.status === 'Available').length;
  const busyNurses = nurses.filter(n => n.status === 'Busy').length;
  const onLeaveNurses = nurses.filter(n => n.status === 'On Leave').length;

  const isAdmin = role === 'Admin';
  const isNurse = role === 'Nurse';

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-[#0d64a9]" />
            Nurse Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital nurses, track availability, and view workload.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchNurses}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingNurse(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-[#0d64a9] text-white text-sm font-bold shadow-sm hover:bg-[#0b538c] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Nurse
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total Nurses</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{nurses.length}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium">Available</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{availableNurses}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Busy</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{busyNurses}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">On Leave</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{onLeaveNurses}</p>
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Staff ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20 focus:border-[#0d64a9] transition-all bg-white"
            />
          </div>
          
          <select 
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="General">General</option>
            <option value="ICU">ICU</option>
            <option value="Emergency">Emergency</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Maternity">Maternity</option>
          </select>
          
          <select 
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Staff ID</th>
                <th className="px-6 py-4">Nurse Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Patients</th>
                {(isAdmin || isNurse) && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={(isAdmin || isNurse) ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0d64a9]" />
                      <p>Loading nurses...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredNurses.length === 0 ? (
                <tr>
                  <td colSpan={(isAdmin || isNurse) ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    No nurses found matching your search.
                  </td>
                </tr>
              ) : (
                filteredNurses.map((n) => (
                  <tr key={n.id || n.staff_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{n.staff_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{n.name}</td>
                    <td className="px-6 py-4 text-slate-600">{n.department}</td>
                    <td className="px-6 py-4 text-slate-600">{n.shift || 'Morning'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold border",
                        n.status === 'Available' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        n.status === 'Busy' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{n.current_patient_count || 0}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              (n.current_patient_count || 0) > 3 ? "bg-orange-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(((n.current_patient_count || 0) / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {(isAdmin || isNurse) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(isAdmin || (isNurse && staffId === n.staff_id)) && (
                            <button 
                              onClick={() => {
                                setEditingNurse(n);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#0d64a9] hover:bg-blue-50 rounded transition-colors"
                              title="Edit Nurse"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(n.id || n.staff_id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Nurse"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <NurseFormModal 
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          initialData={editingNurse}
        />
      )}
    </div>
  );
}
