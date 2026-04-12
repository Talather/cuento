
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { searchQuery, limit = 10 } = await req.json().catch(() => ({}))

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current user to verify admin status
    const { data: { user: currentUser }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using the has_role function
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: currentUser.id, _role: 'admin' })

    // Fallback to email check for backwards compatibility
    const isAdmin = hasAdminRole === true || currentUser.email === (Deno.env.get('ADMIN_EMAIL') ?? '')

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only admins can access this endpoint' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Starting search with query: ${searchQuery || 'none'}`);
    
    let users = [];
    let authError = null;

    if (searchQuery) {
      console.log(`Searching for users with query: "${searchQuery}"`);
      
      // Get all users first
      const { data: allUsers, error: allUsersError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000 // Increase this number to get more users at once
      });
      
      if (allUsersError) {
        console.error("Error fetching users:", allUsersError);
        throw allUsersError;
      }
      
      console.log(`Total users fetched: ${allUsers?.users?.length || 0}`);
      
      // First, try to find exact email match
      const exactEmailMatch = allUsers?.users?.find(user => 
        user.email?.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (exactEmailMatch) {
        console.log(`Found exact email match for: ${searchQuery}`);
        users = [exactEmailMatch];
      } else {
        // If no exact match, try partial email match
        const emailMatches = allUsers?.users?.filter(user => 
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];
        
        console.log(`Found ${emailMatches.length} partial email matches`);
        
        if (emailMatches.length > 0) {
          users = emailMatches;
        } else {
          // If no email matches, try searching by name in profiles
          console.log('No users found by email, searching by name');
          
          const { data: matchingProfiles, error: profileSearchError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
            .limit(100);
            
          if (profileSearchError) {
            console.error("Profile search error:", profileSearchError);
            throw profileSearchError;
          }
          
          console.log(`Found ${matchingProfiles?.length || 0} matching profiles by name`);
          
          // Get the users corresponding to the matching profiles
          if (matchingProfiles && matchingProfiles.length > 0) {
            const matchingProfileIds = matchingProfiles.map(p => p.id);
            users = allUsers?.users?.filter(user => 
              matchingProfileIds.includes(user.id)
            ) || [];
          }
        }
      }
      
      console.log(`Final search result count: ${users.length}`);
    } else {
      // For initial load, just get limited number of users
      console.log(`Loading initial ${limit} users`);
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        perPage: limit
      });
      
      if (error) {
        authError = error;
        throw error;
      }
      
      users = data.users || [];
    }

    // Get all profiles for the found users
    const userIds = users.map(user => user.id);
    let profiles = [];
    
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        throw profilesError;
      }
      
      profiles = profilesData || [];
    }

    // Get all stories for the users we have
    let stories = [];
    
    if (userIds.length > 0) {
      const { data: storiesData, error: storiesError } = await supabaseAdmin
        .from('stories')
        .select('id, user_id')
        .in('user_id', userIds);
        
      if (storiesError) {
        throw storiesError;
      }
      
      stories = storiesData || [];
    }

    // Count stories per user 
    const storyCountsMap = {};
    stories.forEach(story => {
      if (story.user_id) {
        storyCountsMap[story.user_id] = (storyCountsMap[story.user_id] || 0) + 1;
      }
    });

    // Combine user data with profiles and story counts
    const enrichedUsers = users.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      const storyCount = storyCountsMap[user.id] || 0;

      return {
        ...user,
        profile,
        stories_count: storyCount
      };
    });

    return new Response(
      JSON.stringify({ users: enrichedUsers || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
