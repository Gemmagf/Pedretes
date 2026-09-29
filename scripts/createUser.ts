// Creates a Supabase Auth user. Usage:
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx tsx scripts/createUser.ts <email> <password> [name]
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const [email, password, name = 'Admin'] = process.argv.slice(2);

if (!url || !key || !email || !password) {
  console.error('Usage: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx tsx scripts/createUser.ts <email> <password> [name]');
  process.exit(1);
}

const supabase = createClient(url, key);
const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
console.log(`User created: ${email}. Confirm the email if confirmation is enabled in Supabase.`);
