import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sinomclhlaqwahtidetp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbm9tY2xobGFxd2FodGlkZXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzUyMjYsImV4cCI6MjA5MTQxMTIyNn0.uO8o-YCs_CYh9ezR4GxamScEdHQSgjwMmhppBWLKQB4'
);

const { data, error } = await supabase.auth.signUp({
  email: 'admin@pedretes.ch',
  password: 'Pedretes2026!',
  options: { data: { name: 'Admin' } }
});

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Usuari creat!');
  console.log('Email:    admin@pedretes.ch');
  console.log('Password: Pedretes2026!');
  console.log('Confirma el email si cal, o desactiva la confirmació a Supabase.');
}
