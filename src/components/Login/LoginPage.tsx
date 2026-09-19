import { Plus } from 'lucide-react';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#f0f6fc] flex flex-col items-center pt-8 md:pt-16 px-4 font-sans text-slate-800">
      
      <div className="w-full max-w-[380px] space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="bg-[#e4f0fa] border border-[#d0e3f5] p-1.5 rounded-lg flex items-center justify-center shadow-sm">
            <div className="bg-[#006cb5] text-white p-0.5 rounded flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1a2f44]">Hospital Resource System</h1>
        </div>

        {/* Login Form Card */}
        <LoginForm />
        
      </div>

    </div>
  );
}
