import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npcynlaeijpyshlnxomf.supabase.co';
const supabaseKey = 'sb_publishable_CIw2YRQXbUVvWq7TI8yHjg_QscGKpS1';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Users:', data);
  console.log('Error:', error);
}

test();
