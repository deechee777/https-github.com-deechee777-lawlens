import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Database = {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          question_text: string;
          answer_text: string | null;
          source_url: string | null;
          is_public: boolean;
          status: 'pending' | 'answered' | 'researching';
          search_vector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_text: string;
          answer_text?: string | null;
          source_url?: string | null;
          is_public?: boolean;
          status?: 'pending' | 'answered' | 'researching';
          search_vector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_text?: string;
          answer_text?: string | null;
          source_url?: string | null;
          is_public?: boolean;
          status?: 'pending' | 'answered' | 'researching';
          search_vector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_email: string;
          stripe_payment_id: string | null;
          stripe_customer_id: string | null;
          question_id: string | null;
          amount_cents: number;
          currency: string;
          payment_type: 'one_time' | 'subscription';
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          stripe_payment_id?: string | null;
          stripe_customer_id?: string | null;
          question_id?: string | null;
          amount_cents: number;
          currency?: string;
          payment_type?: 'one_time' | 'subscription';
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          stripe_payment_id?: string | null;
          stripe_customer_id?: string | null;
          question_id?: string | null;
          amount_cents?: number;
          currency?: string;
          payment_type?: 'one_time' | 'subscription';
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      bad_decisions: {
        Row: {
          id: string;
          decision_text: string;
          risk_score: number;
          ai_explanation: string;
          share_slug: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          decision_text: string;
          risk_score: number;
          ai_explanation: string;
          share_slug?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          decision_text?: string;
          risk_score?: number;
          ai_explanation?: string;
          share_slug?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
};