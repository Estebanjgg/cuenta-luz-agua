import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Reading } from '@/app/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el lado del servidor
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Instancia singleton para el navegador para evitar múltiples clientes
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

// Cliente para el lado del navegador (singleton)
export const createSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    // En el servidor, crear una nueva instancia
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  // En el navegador, usar singleton
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  return browserClient
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
          reading_day: number
          readings: Reading[]
          total_consumption: number
          estimated_cost: number
          tariff_flag: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          year: number
          initial_reading: number
          reading_day?: number
          readings?: Reading[]
          total_consumption?: number
          estimated_cost?: number
          tariff_flag?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          year?: number
          initial_reading?: number
          reading_day?: number
          readings?: Reading[]
          total_consumption?: number
          estimated_cost?: number
          tariff_flag?: string
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