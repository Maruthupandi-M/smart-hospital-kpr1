import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Plus, LayoutDashboard, Users, Bed, Stethoscope, 
  HeartPulse, Stethoscope as EquipIcon, AlertTriangle, 
  ListChecks, Bell, FileText, LogOut, UserCircle, Activity 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: true },
  { name: 'Patients', href: '/dashboard/patients', icon: Users, current: true },
  { name: 'Beds', href: '/dashboard/beds', icon: Bed, current: true },
  { name: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope, current: true },
  { name: 'Nurses', href: '/dashboard/nurses', icon: HeartPulse, current: true },
  { name: 'Equipment', href: '/dashboard/equipment', icon: EquipIcon, current: true },
  { name: 'Emergency Resources', href: '/dashboard/emergency', icon: AlertTriangle, current: true },
  { name: 'Patient Queue', href: '/dashboard/queue', icon: ListChecks, current: true },
  { name: 'Simulations', href: '/dashboard/simulation', icon: Activity, current: true },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell, current: true },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, current: true },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircle, current: true },
];

export function DashboardLayout() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f0f6fc] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] hidden md:flex">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-[#e4f0fa] border border-[#d0e3f5] p-1.5 rounded-lg flex items-center justify-center shadow-sm">
            <div className="bg-[#006cb5] text-white p-0.5 rounded flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <span className="font-bold tracking-tight text-[#1a2f44] text-[15px] leading-tight">
            Hospital Resource <br/> System
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-semibold transition-colors",
                    isActive 
                      ? "bg-[#eef6fc] text-[#0d64a9]" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  aria-disabled={!item.current}
                  onClick={(e) => {
                    if (!item.current) e.preventDefault();
                  }}
                >
                  <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#0d64a9]" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{profile?.full_name || sessionStorage.getItem('demo_email') || 'Administrator'}</p>
              <p className="text-[12px] font-semibold text-[#0d64a9] mt-1">{role || 'Admin'}</p>
            </div>
            <Link to="/dashboard/profile" className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors">
              <UserCircle className="w-5 h-5 text-slate-500" />
            </Link>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button
              onClick={() => {
                sessionStorage.removeItem('demo');
                signOut();
                // Redirect will be handled by ProtectedRoute once state clears, or force it
                window.location.href = '/';
              }}
              className="text-slate-500 hover:text-red-600 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
