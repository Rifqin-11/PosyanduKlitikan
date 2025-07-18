import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string;
          no: number;
          nik: string;
          name: string;
          date_of_birth: string;
          address: string;
          bb: number;
          tb: number;
          lila: number;
          gds: number;
          au: string;
          immunization: string;
          lp: number;
          td: string;
          hb: number;
          chol: number;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          no?: number;
          nik: string;
          name: string;
          date_of_birth: string;
          address: string;
          bb?: number;
          tb?: number;
          lila?: number;
          gds?: number;
          au?: string;
          immunization?: string;
          lp?: number;
          td?: string;
          hb?: number;
          chol?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          no?: number;
          nik?: string;
          name?: string;
          date_of_birth?: string;
          address?: string;
          bb?: number;
          tb?: number;
          lila?: number;
          gds?: number;
          au?: string;
          immunization?: string;
          lp?: number;
          td?: string;
          hb?: number;
          chol?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
};

export type Participant = Database['public']['Tables']['participants']['Row'];