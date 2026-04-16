import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Try to load env from .env file
if (fs.existsSync('.env')) {
  dotenv.config();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key missing in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  {
    full_name: 'Administrador Redville',
    email: 'Admin@redville.com',
    password: 'redville123',
    role: 'admin',
    permissions: {
      obras: ['Visualizar', 'Criar', 'Editar Orçamento'],
      financeiro: ['Lançamentos', 'Livro Caixa', 'Pagamentos'],
      config: ['Usuários', 'Cadastros', 'Configurações']
    }
  },
  {
    full_name: 'Lucas Redville',
    email: 'Lucas@redville.com.br',
    password: 'admin123@',
    role: 'admin',
    permissions: {
      obras: ['Visualizar', 'Criar', 'Editar Orçamento'],
      financeiro: ['Lançamentos', 'Livro Caixa', 'Pagamentos'],
      config: ['Usuários', 'Cadastros', 'Configurações']
    }
  }
];

async function seedUsers() {
  console.log("Seeding users...");
  for (const user of users) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(user, { onConflict: 'email' });
    
    if (error) {
      console.error(`Error inserting user ${user.email}:`, error.message);
    } else {
      console.log(`User ${user.email} inserted/updated successfully.`);
    }
  }
}

seedUsers();
