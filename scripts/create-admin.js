import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('.', '.env');
config({ path: envPath });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

const supabase = createClient(url, key);
const email = `admin-${Date.now()}@test.com`;
const password = 'Admin1234!';

console.log('Creating admin user:', email);

const signup = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'admin',
    },
  },
});

console.log('signUp result:', JSON.stringify(signup, null, 2));

if (signup.error) {
  process.exit(1);
}

const signin = await supabase.auth.signInWithPassword({
  email,
  password,
});

console.log('signIn result:', JSON.stringify(signin, null, 2));

if (signin.error) {
  console.warn('Sign-in failed: the account may require email confirmation.');
}

console.log('NEW ADMIN CREDENTIALS:');
console.log('Email:', email);
console.log('Password:', password);
