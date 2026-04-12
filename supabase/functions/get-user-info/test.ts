const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const response = await fetch(`${SUPABASE_URL}/functions/v1/get-user-info`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'eduardosalgado6@gmail.com'
  })
});

const data = await response.json();
console.log('User Information:', JSON.stringify(data, null, 2));