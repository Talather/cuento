import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export async function ensureCuentitoUser(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data: existingCuentitoUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers({
    filter: {
      email: 'cuentito@lovablestories.com'
    }
  });

  if (checkError) {
    console.error('Error checking for Cuentito user:', checkError);
    throw checkError;
  }

  if (!existingCuentitoUser?.users?.length) {
    console.log('Creating Cuentito user as it does not exist...');
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'cuentito@lovablestories.com',
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        first_name: 'Cuentito',
        last_name: 'Bot'
      }
    });

    if (createError) {
      console.error('Error creating Cuentito user:', createError);
      throw createError;
    }
    console.log('Cuentito user created successfully');
  } else {
    console.log('Cuentito user already exists, skipping creation');
  }
}