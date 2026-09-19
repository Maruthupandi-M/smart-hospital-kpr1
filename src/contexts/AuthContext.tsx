import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Role } from '../components/Login/RoleSelector';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: Role | null;
  staffId: string | null;
  profile: any | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const stored = localStorage.getItem('mock_session');
    if (stored) {
      const parsedSession = JSON.parse(stored);
      setSession(parsedSession);
      setUser(parsedSession.user);
      setRole(parsedSession.user.user_metadata.role);
      setStaffId(parsedSession.user.user_metadata.staff_id);
      setIsLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setIsLoading(false);
        }
      });
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const stored = localStorage.getItem('mock_session');
      if (stored) return; // Ignore real auth events if using bypass

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setStaffId(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setRole(data.role as Role);
        setStaffId(data.staff_id);
        setProfile(data);
      } else {
        // Fallback: use role from the mock session's user_metadata
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const metaRole = currentSession?.user?.user_metadata?.role;
        if (metaRole) {
          setRole(metaRole as Role);
          setStaffId(currentSession?.user?.user_metadata?.staff_id || null);
          setProfile({ role: metaRole, name: currentSession?.user?.email });
        } else {
          console.error("Error fetching role:", error);
        }
      }
    } catch (err) {
      console.error("Failed to fetch role:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setRole(null);
    setStaffId(null);
    setProfile(null);
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, staffId, profile, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
