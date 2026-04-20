export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; name: string; email: string; phone: string | null
          role: 'user' | 'admin'; plan: 'Free' | 'Starter' | 'Pro' | 'VIP'
          credits: number; status: 'active' | 'suspended'
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      ai_jobs: {
        Row: {
          id: string; user_id: string
          job_type: 'image' | 'photo' | 'flyer' | 'song' | 'video'
          prompt: string | null; output_url: string | null; output_data: Json | null
          status: 'pending' | 'completed' | 'failed'; credits_used: number; provider: string | null
          video_template: string | null; video_format: string | null
          video_duration: number | null; thumbnail_url: string | null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_jobs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ai_jobs']['Insert']>
      }
      payments: {
        Row: {
          id: string; user_id: string; method: 'MTN MoMo' | 'Orange Money'
          amount: number; reference: string; payer_phone: string | null
          status: 'pending' | 'approved' | 'rejected'; credits_awarded: number
          verified_by: string | null; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      video_jobs: {
        Row: {
          id: string; user_id: string; ai_job_id: string | null
          template: string; format: string; duration: number
          brand: string; message: string; cta: string | null
          color: string; music: string; output_url: string | null; thumbnail_url: string | null
          status: 'queued' | 'rendering' | 'completed' | 'failed'
          error_message: string | null; render_time_ms: number | null
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['video_jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['video_jobs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      deduct_credits: { Args: { p_user_id: string; p_amount: number }; Returns: boolean }
    }
    Enums: Record<string, never>
  }
}

export type Profile  = Database['public']['Tables']['profiles']['Row']
export type AIJob    = Database['public']['Tables']['ai_jobs']['Row']
export type Payment  = Database['public']['Tables']['payments']['Row']
export type VideoJob = Database['public']['Tables']['video_jobs']['Row']
