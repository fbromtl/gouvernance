import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * If Supabase env vars are missing we still export a client so imports don't
 * break, but `supabaseConfigured` will be false and the AuthProvider will
 * skip all Supabase calls gracefully.
 */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : (null as unknown as SupabaseClient) // placeholder — never called when !supabaseConfigured

export interface ContactMessage {
  id?: string
  prenom: string
  email: string
  organisme?: string
  message: string
  created_at?: string
}

export interface NewsletterSubscription {
  id?: string
  email: string
  created_at?: string
}

export async function submitContactForm(data: Omit<ContactMessage, 'id' | 'created_at'>) {
  const { error } = await supabase
    .from('contact_messages')
    .insert([data])

  if (error) throw error
  return true
}

export async function subscribeNewsletter(email: string) {
  const { error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email }])

  if (error) throw error
  return true
}
