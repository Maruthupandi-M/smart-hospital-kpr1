import type { ReactNode } from 'react';
import { ShieldCheck, Stethoscope, SquareAsterisk, MonitorCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export type Role = 'Doctor' | 'Nurse' | 'Receptionist' | 'Admin';

const roles: { id: Role; icon: ReactNode; label: string }[] = [
  { id: 'Doctor', icon: <Stethoscope className="w-[18px] h-[18px]" />, label: 'Doctor' },
  { id: 'Nurse', icon: <SquareAsterisk className="w-[18px] h-[18px]" />, label: 'Nurse' },
  { id: 'Receptionist', icon: <MonitorCheck className="w-[18px] h-[18px]" />, label: 'Receptionist' },
  { id: 'Admin', icon: <ShieldCheck className="w-[18px] h-[18px]" />, label: 'Admin' },
];

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleSelect: (role: Role) => void;
  disabled?: boolean;
}

export function RoleSelector({ selectedRole, onRoleSelect, disabled }: RoleSelectorProps) {
  return (
    <div className="space-y-2 mt-4">
      <label className="text-[13px] font-bold text-slate-700 block" id="role-selector-label">
        Clinical Role
      </label>
      <div 
        className="grid grid-cols-2 gap-2" 
        role="radiogroup" 
        aria-labelledby="role-selector-label"
      >
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onRoleSelect(role.id)}
              className={cn(
                "flex items-center gap-2.5 py-2.5 px-3 rounded-md border text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isSelected 
                  ? "bg-[#eef6fc] border-[#74a5d3] text-[#0d64a9]" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                disabled && "opacity-60 cursor-not-allowed hover:bg-white"
              )}
            >
              <div className={isSelected ? "text-[#0d64a9]" : "text-slate-500"}>
                {role.icon}
              </div>
              {role.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
