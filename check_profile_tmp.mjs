import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
const get = (k) => env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim();
const url = get('VITE_SUPABASE_URL');
const serviceKey = get('SUPABASE_SERVICE_ROLE_KEY');

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

const res = await fetch(`${url}/rest/v1/profiles?select=*`, { headers });
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
