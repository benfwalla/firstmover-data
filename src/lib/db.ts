import { Client } from 'pg';

const HOSTS = [
  'aws-0-us-west-1.pooler.supabase.com',
  '54.177.55.191',
  '52.8.172.168',
];

export async function getDBClient(): Promise<Client> {
  const config = {
    port: 6543,
    database: 'postgres',
    user: 'readonly_agent.tdrshcdwetrbivhjikup',
    password: process.env.SUPABASE_PASSWORD || '',
    ssl: { rejectUnauthorized: false, servername: 'aws-0-us-west-1.pooler.supabase.com' } as any,
    connectionTimeoutMillis: 8000,
  };

  for (const host of HOSTS) {
    try {
      const client = new Client({ ...config, host });
      await client.connect();
      return client;
    } catch (e) {
      // Try next host
    }
  }
  throw new Error('All database connection attempts failed');
}
