import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

const isDummy = supabaseUrl === 'http://localhost:54321';

// Create a mock session that the Python backend will also accept
const createMockSession = (email: string, role: string, id: string, staffId: string) => ({
  access_token: `mock_token_${role}_${id}_${staffId}`,
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock_refresh',
  user: {
    id,
    email,
    user_metadata: { role }
  }
});

class MockSupabase {
  auth = {
    signInWithPassword: async ({ email, password: _password }: any) => {
      let role = 'Receptionist';
      let id = 'rec-123';
      let staffId = 'REC-301';

      if (email.includes('admin')) {
        role = 'Admin'; id = 'admin-123'; staffId = 'ADM-001';
      } else if (email.includes('doctor')) {
        role = 'Doctor'; id = 'doc-123'; staffId = 'DOC-102';
      } else if (email.includes('nurse')) {
        role = 'Nurse'; id = 'nur-123'; staffId = 'NUR-205';
      }

      const session = createMockSession(email, role, id, staffId);
      localStorage.setItem('mock_session', JSON.stringify(session));
      return { data: { session, user: session.user }, error: null };
    },
    getSession: async () => {
      const stored = localStorage.getItem('mock_session');
      return { data: { session: stored ? JSON.parse(stored) : null }, error: null };
    },
    onAuthStateChange: (cb: any) => {
      const stored = localStorage.getItem('mock_session');
      cb('INITIAL_SESSION', stored ? JSON.parse(stored) : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: async () => {
      localStorage.removeItem('mock_session');
      return { error: null };
    }
  };

  from(table: string) {
    return {
      select: () => {
        return {
          eq: (_field: string, value: string) => {
            return {
              single: async () => {
                if (table === 'staff_profiles') {
                  if (value === 'admin-123') return { data: { role: 'Admin', staff_id: 'ADM-001', name: 'System Admin' }, error: null };
                  if (value === 'doc-123') return { data: { role: 'Doctor', staff_id: 'DOC-102', name: 'Dr. Smith' }, error: null };
                  if (value === 'nur-123') return { data: { role: 'Nurse', staff_id: 'NUR-205', name: 'Nurse John' }, error: null };
                  if (value === 'rec-123') return { data: { role: 'Receptionist', staff_id: 'REC-301', name: 'Alice' }, error: null };
                }
                return { data: null, error: new Error('Not found') };
              }
            };
          }
        };
      }
    };
  }
}

export const supabase = isDummy ? (new MockSupabase() as any) : realSupabase;
