import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  session: Session | null;
  loading: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;

export const useAdminAuth = create<AdminAuthState>((set) => ({
  session: null,
  loading: true,
  init: async () => {
    try {
      // First, try to get the existing session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, loading: false });
      
      // Then set up the subscription for future changes
      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
          set({ session: newSession, loading: false });
        });
        authSubscription = data.subscription;
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ session: null, loading: false });
    }
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ session: data.session, loading: false });
  },
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin'
        }
      }
    });
    if (error) throw error;
    set({ session: data.session, loading: false });
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, loading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ session: null, loading: false });
      throw error;
    }
  },
}));
