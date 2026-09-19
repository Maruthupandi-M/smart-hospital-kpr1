import { useAuth } from '../../contexts/AuthContext';
import { UserCircle, Mail, Briefcase, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function Profile() {
  const { user, profile, role } = useAuth();

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <UserCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profile Not Found</h2>
        <p className="mt-2 text-sm">Staff profile not found. Please contact the administrator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#e4f0fa] p-2 rounded-lg">
          <UserCircle className="w-6 h-6 text-[#0d64a9]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Profile</h1>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d64a9] to-[#006cb5] h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-[#0d64a9] font-bold text-3xl">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{profile.full_name}</h2>
              <p className="text-[#0d64a9] font-bold mt-1 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {role}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Staff ID
                </p>
                <p className="font-semibold text-slate-700">{profile.staff_id || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </p>
                <p className="font-semibold text-slate-700">{user.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Department
                </p>
                <p className="font-semibold text-slate-700">{profile.department || 'General'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Specialization
                </p>
                <p className="font-semibold text-slate-700">{profile.specialization || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
