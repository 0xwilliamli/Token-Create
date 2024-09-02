import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(process.env.NEXTAUTH_URL || '', process.env.NEXTAUTH_SECRET || '')

