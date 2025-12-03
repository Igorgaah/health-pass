import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  health_plan?: string;
  phone?: string;
  birth_date?: string;
}

interface User {
  id: string;
  email: string;
  profile?: Profile;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch with setTimeout to avoid deadlock
          setTimeout(async () => {
            await fetchUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        profile: profile || undefined,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate('/auth');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refetch profile
      await fetchUserProfile({ id: user.id, email: user.email } as SupabaseUser);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
