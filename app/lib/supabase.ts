import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el lado del servidor
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el lado del navegador
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      user_energy_data: {
        Row: {
          id: string
          user_id: string
          month: string
          year: number
          initial_reading: number
          readings: any[]
          total_consumption: number
          estimated_cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          year: number
          initial_reading: number
          readings?: any[]
          total_consumption?: number
          estimated_cost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          year?: number
          initial_reading?: number
          readings?: any[]
          total_consumption?: number
          estimated_cost?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_tariff_config: {
        Row: {
          id: string
          user_id: string
          price_per_kwh: number
          additional_fees: number
          public_lighting_fee?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          price_per_kwh: number
          additional_fees: number
          public_lighting_fee?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          price_per_kwh?: number
          additional_fees?: number
          public_lighting_fee?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}