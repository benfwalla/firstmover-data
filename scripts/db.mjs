import { Client } from 'pg';

export async function getDBClient() {
  const client = new Client({
    host: process.env.SUPABASE_HOST || 'aws-0-us-west-1.pooler.supabase.com',
    port: parseInt(process.env.SUPABASE_PORT || '6543'),
    database: process.env.SUPABASE_DB || 'postgres',
    user: process.env.SUPABASE_USER || '',
    password: process.env.SUPABASE_PASSWORD || '',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  return client;
}
