import { API_BASE } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, AlertTriangle, Edit2, Trash2, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { EquipmentFormModal } from './EquipmentFormModal';
export function EquipmentList() {
  const { session, role } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      


      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE}/api/equipment`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch equipment data.');
      }

      const data = await response.json();
      setEquipment(data);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    
    try {

      
      const response = await fetch(`${API_BASE}/api/equipment/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete equipment');
      }
      
      fetchEquipment();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  const handleSuccess = () => {
    fetchEquipment();
  };

  const filteredEquipment = equipment.filter(e => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = e.equipment_name?.toLowerCase().includes(searchLower) || e.id?.toString().includes(searchLower);
    const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalEquipment = equipment.reduce((sum, e) => sum + (e.quantity || 0), 0);
  const availableEquipment = equipment.reduce((sum, e) => sum + (e.available_quantity || 0), 0);
  const inUseEquipment = equipment.reduce((sum, e) => sum + ((e.quantity || 0) - (e.available_quantity || 0)), 0);
  const maintenanceEquipmentCount = equipment.filter(e => e.status === 'Maintenance').length;

  const isAdmin = role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#0d64a9]" />
            Equipment Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital equipment, track availability, and view maintenance status.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEquipment}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingEquipment(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-[#0d64a9] text-white text-sm font-bold shadow-sm hover:bg-[#0b538c] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Equipment
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
          <p className="text-sm text-slate-500 font-medium">Total Items</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalEquipment}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium">Available Items</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{availableEquipment}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">In Use</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{inUseEquipment}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
          <p className="text-sm text-amber-600 font-medium">Maintenance</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{maintenanceEquipmentCount}</p>
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
              placeholder="Search by Equipment Name..."
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
            <option value="Emergency">Emergency</option>
            <option value="ICU">ICU</option>
            <option value="General">General</option>
            <option value="Surgery">Surgery</option>
            <option value="Cardiology">Cardiology</option>
          </select>
          
          <select 
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d64a9]/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Equipment Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Total Qty</th>
                <th className="px-6 py-4">Available Qty</th>
                <th className="px-6 py-4">In Use Qty</th>
                <th className="px-6 py-4">Status</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0d64a9]" />
                      <p>Loading equipment...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    No equipment found matching your search.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{e.equipment_name}</td>
                    <td className="px-6 py-4 text-slate-600">{e.department}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{e.quantity}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{e.available_quantity}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{(e.quantity || 0) - (e.available_quantity || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold border",
                        e.status === 'Available' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        e.status === 'In Use' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {e.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingEquipment(e);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#0d64a9] hover:bg-blue-50 rounded transition-colors"
                            title="Edit Equipment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(e.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Equipment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {isModalOpen && isAdmin && (
        <EquipmentFormModal 
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          initialData={editingEquipment}
        />
      )}
    </div>
  );
}
