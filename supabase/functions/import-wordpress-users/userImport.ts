import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { ImportResults, WordPressUser } from './types.ts'

export async function processUsers(users: WordPressUser[], supabaseAdmin: ReturnType<typeof createClient>): Promise<ImportResults> {
  const results: ImportResults = {
    success: 0,
    errors: [],
    duplicates: []
  }

  // Check for duplicate emails in input data
  const emailCounts = new Map<string, number[]>();
  users.forEach((user, index) => {
    if (!emailCounts.has(user.email)) {
      emailCounts.set(user.email, []);
    }
    emailCounts.get(user.email)?.push(index);
  });

  // Process each unique email
  for (const [email, indices] of emailCounts.entries()) {
    try {
      console.log(`Processing email: ${email}`);
      
      // Get auth user information with exact email match
      const { data: { users: existingUsers }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: email.toLowerCase() // Ensure case-insensitive comparison
        }
      });
      
      if (getUserError) {
        console.error(`Error checking for existing user ${email}:`, getUserError);
        indices.forEach(index => {
          results.errors.push({
            email,
            error: `Error checking for existing user: ${getUserError.message}`,
            index
          });
        });
        continue;
      }

      // Debug logging
      console.log(`User search results for ${email}:`, existingUsers);
      
      // Check for exact email match
      const existingUser = existingUsers?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        console.log(`User already exists in auth system: ${email}`);
        indices.forEach(index => {
          results.duplicates.push({ 
            email, 
            index,
            existingIn: 'supabase'
          });
        });
      } else {
        const userToImport = users[indices[0]]; // Take the first instance if multiple
        console.log(`Creating new user: ${email} with data:`, userToImport);

        try {
          // Create the user in auth.users with proper metadata
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userToImport.email,
            email_confirm: true,
            user_metadata: {
              wordpress_id: userToImport.id,
              first_name: userToImport.first_name,
              last_name: userToImport.last_name,
              remaining_stories: userToImport.remaining_stories,
              username: userToImport.username,
              google_access_token: userToImport.google_access_token,
              fb_user_access_token: userToImport.fb_user_access_token
            }
          });

          if (createError) {
            console.error(`Error creating user ${email}:`, createError);
            indices.forEach(index => {
              results.errors.push({
                email,
                error: createError.message,
                index
              });
            });
          } else {
            // Create profile entry with correct data
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: newUser.user.id,
                wordpress_user_id: userToImport.id,
                first_name: userToImport.first_name,
                last_name: userToImport.last_name,
                story_credits: userToImport.remaining_stories,
                username: userToImport.username,
                imported_at: new Date().toISOString()
              });

            if (profileError) {
              console.error(`Error creating profile for ${email}:`, profileError);
              results.errors.push({
                email,
                error: `Profile creation failed: ${profileError.message}`,
                index: indices[0]
              });
            } else {
              console.log(`Successfully created user and profile: ${email}`);
              results.success++;
            }
          }
        } catch (createError) {
          console.error(`Exception creating user ${email}:`, createError);
          indices.forEach(index => {
            results.errors.push({
              email,
              error: createError instanceof Error ? createError.message : String(createError),
              index
            });
          });
        }
      }
    } catch (error) {
      console.error(`Error processing user ${email}:`, error);
      indices.forEach(index => {
        results.errors.push({
          email,
          error: error instanceof Error ? error.message : String(error),
          index
        });
      });
    }
  }

  return results;
}