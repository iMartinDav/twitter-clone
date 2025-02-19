import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Load environment variables from .env.local
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getToken() {
  try {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: 'your-test-email@example.com',    // Replace with your test email
      password: 'your-test-password',          // Replace with your test password
    })

    if (error) throw error
    if (!session) throw new Error('No session')

    console.log('Access Token:', session.access_token)
  } catch (error) {
    console.error('Error:', error)
  }
}

getToken()
