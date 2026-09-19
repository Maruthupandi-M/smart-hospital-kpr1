import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, IdCard, KeyRound, ShieldCheck, Lock, Asterisk } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RoleSelector, type Role } from './RoleSelector';
import { supabase } from '../../lib/supabase';

export function LoginForm() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('Doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrors({});
    let isValid = true;
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email) {
      newErrors.email = 'Staff ID or Email is required.';
      isValid = false;
    }
    if (!password) {
      newErrors.password = 'Passcode is required.';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // Hackathon bypass: any staff-related email + any password works
      const isAdminEmail = cleanEmail.includes('admin');
      const isDoctorEmail = cleanEmail.includes('doctor') || cleanEmail.includes('doc') || cleanEmail.includes('dr.');
      const isNurseEmail = cleanEmail.includes('nurse') || cleanEmail.includes('nur');
      const isReceptionistEmail = cleanEmail.includes('receptionist') || cleanEmail.includes('reception') || cleanEmail.includes('rec');
      
      if (isAdminEmail || isDoctorEmail || isNurseEmail || isReceptionistEmail) {
          let role = 'Receptionist';
          let id = 'rec-123';
          let staffId = 'REC-301';
          
          if (isAdminEmail)       { role = 'Admin';       id = 'admin-123'; staffId = 'ADM-001'; }
          else if (isDoctorEmail) { role = 'Doctor';      id = 'doc-123';   staffId = 'DOC-102'; }
          else if (isNurseEmail)  { role = 'Nurse';       id = 'nur-123';   staffId = 'NUR-205'; }
          
          const session = {
            access_token: `mock_token_${role}_${id}_${staffId}`,
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock_refresh',
            user: { id, email: cleanEmail, user_metadata: { role, staff_id: staffId } }
          };
          localStorage.setItem('mock_session', JSON.stringify(session));
          window.location.href = '/dashboard';
          return;
      }

      // Fallback: try real Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ general: 'Invalid credentials. Try: admin@hospital.org / doctor@hospital.org / nurse@hospital.org / receptionist@hospital.org with any password.' });
      } else if (data.session) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Authentication failed. Server may be unavailable.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergency = () => {
    // Break glass protocol logic
    setIsEmergency(true);
    setTimeout(() => setIsEmergency(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200/80 p-5 pt-4">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-[18px] h-[18px] text-[#0d64a9]" />
          <h2 className="text-base font-bold text-slate-800">Staff Verification</h2>
        </div>
        
        {/* Simple Toggle switch visual */}
        <div className="w-8 h-4 bg-blue-100 rounded-full flex items-center p-0.5 cursor-pointer">
          <div className="w-3 h-3 bg-[#0d64a9] rounded-full translate-x-4"></div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[13px] font-bold text-slate-700 block">
            Staff ID or Clinical Email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <IdCard className="w-[18px] h-[18px]" />
            </div>
            <input
              id="email"
              type="text"
              value={email}
              disabled={isLoading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({...errors, email: undefined});
              }}
              className={cn(
                "w-full pl-9 pr-4 py-2.5 rounded-md border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed",
                errors.email 
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                  : "border-slate-300 focus:border-[#0d64a9] focus:ring-blue-500/20 placeholder:text-slate-500/70"
              )}
              placeholder="STF-8094 or user@hospital.org"
              autoComplete="username"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs text-red-500 font-medium mt-1" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[13px] font-bold text-slate-700 block">
            Security Passcode
          </label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <KeyRound className="w-[18px] h-[18px]" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={isLoading}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: undefined});
              }}
              className={cn(
                "w-full pl-9 pr-10 py-2.5 rounded-md border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed",
                errors.password 
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                  : "border-slate-300 focus:border-[#0d64a9] focus:ring-blue-500/20 placeholder:text-slate-500/70"
              )}
              placeholder="••••••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-red-500 font-medium mt-1" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {errors.general && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-[13px] font-medium border border-red-200" role="alert">
            {errors.general}
          </div>
        )}

        <RoleSelector 
          selectedRole={selectedRole} 
          onRoleSelect={setSelectedRole} 
          disabled={isLoading}
        />

        <div className="pt-2 space-y-2.5">
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#006cb5] hover:bg-[#005a96] text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-[18px] w-[18px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Lock className="w-[18px] h-[18px]" />
            )}
            Authenticate & Enter Portal
          </button>

          {/* Emergency Access Button */}
          <button
            type="button"
            onClick={handleEmergency}
            disabled={isLoading}
            className="w-full bg-[#fdf0f0] border border-[#f5c2c2] hover:bg-[#fae3e3] text-[#cc2929] font-semibold py-2.5 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-[13px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isEmergency ? (
              <svg className="animate-spin -ml-1 h-[14px] w-[14px] text-[#cc2929]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Asterisk className="w-4 h-4 stroke-[3]" />
            )}
            Emergency Incident Access (Break-Glass Protocol)
          </button>
        </div>
        
      </form>
    </div>
  );
}
