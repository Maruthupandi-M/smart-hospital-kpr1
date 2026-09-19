import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, AlertTriangle, Edit2, Trash2, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { DoctorFormModal } from './DoctorFormModal';
export function DoctorsList() {
  const { session, role, staffId } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      


      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE}/api/doctors`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors data.');
      }

      const data = await response.json();
      setDoctors(data);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    
    try {

      
      const response = await fetch(`${API_BASE}/api/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete doctor');
      }
      
      fetchDoctors();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleSuccess = () => {
    fetchDoctors();
  };

  const filteredDoctors = doctors.filter(doc => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = doc.staff_id?.toLowerCase().includes(searchLower) || doc.name?.toLowerCase().includes(searchLower);
    const matchesDept = departmentFilter === 'All' || doc.department === departmentFilter;
    const matchesSpec = specializationFilter === 'All' || doc.specialization === specializationFilter;
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    return matchesSearch && matchesDept && matchesSpec && matchesStatus;
  });

  const availableDocs = doctors.filter(d => d.status === 'Available').length;
  const busyDocs = doctors.filter(d => d.status === 'Busy').length;
  const onLeaveDocs = doctors.filter(d => d.status === 'On Leave').length;

  const isAdmin = role === 'Admin';

  // Get unique specializations for filter dropdown
  const uniqueSpecializations = Array.from(new Set(doctors.map(d => d.specialization || 'General'))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#0d64a9]" />
            Doctor Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital doctors, track availability, and view workload.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDoctors}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingDoctor(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-[#0d64a9] text-white text-sm font-bold shadow-sm hover:bg-[#0b538c] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Doctor
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
          <p className="text-sm text-slate-500 font-medium">Total Doctors</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{doctors.length}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium">Available</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{availableDocs}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Busy</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{busyDocs}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">On Leave</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{onLeaveDocs}</p>
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
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="ICU">ICU</option>
            <option value="Emergency">Emergency</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <select 
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20"
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            <option value="All">All Specializations</option>
            {uniqueSpecializations.map((spec: any) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
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
                <th className="px-6 py-4">Doctor Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Patients</th>
                {(isAdmin || role === 'Doctor') && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={(isAdmin || role === 'Doctor') ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0d64a9]" />
                      <p>Loading doctors...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={(isAdmin || role === 'Doctor') ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    No doctors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id || doc.staff_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{doc.staff_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{doc.name}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.department}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.specialization || 'General'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold border",
                        doc.status === 'Available' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        doc.status === 'Busy' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{doc.current_patient_count || 0}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              (doc.current_patient_count || 0) > 3 ? "bg-orange-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(((doc.current_patient_count || 0) / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {(isAdmin || role === 'Doctor') && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(isAdmin || (role === 'Doctor' && staffId === doc.staff_id)) && (
                            <button 
                              onClick={() => {
                                setEditingDoctor(doc);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#0d64a9] hover:bg-blue-50 rounded transition-colors"
                              title="Edit Doctor"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(doc.id || doc.staff_id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Doctor"
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
        <DoctorFormModal 
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          initialData={editingDoctor}
        />
      )}
    </div>
  );
}
