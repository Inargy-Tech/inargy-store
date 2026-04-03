import { createServerSupabase } from './src/lib/supabase-server.js';
import { getProducts } from './src/lib/queries.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabaseServer = await createServerSupabase();
  const res = await getProducts({ category: '', search: '', sort: 'created_at', order: 'desc', page: 1 }, supabaseServer);
  console.log(res);
}
run();
