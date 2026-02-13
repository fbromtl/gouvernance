import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
