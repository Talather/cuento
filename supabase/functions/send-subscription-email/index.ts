import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
  planName: string;
  credits: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, planName, credits } = await req.json() as EmailRequest;

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Get user email from auth.users
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user?.email) {
      console.error('Error fetching user:', userError);
      throw new Error('Failed to fetch user email');
    }

    const userName = profile.first_name || 'Usuario';

    // Send email using Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: 'Cuentito 🤖📖',
          email: 'cuentito@cuenti.to'
        },
        to: [{
          email: user.email,
          name: `${profile.first_name} ${profile.last_name}`.trim() || user.email
        },
	{
	  email: 'cuentito@cuenti.to',
	  name: 'Cuentito'
	}],
        subject: '¡Gracias por tu suscripción a Cuentito!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <img src="https://cuenti.to/logo-cuentito.png" alt="Cuentito Logo" style="max-width: 150px; margin-bottom: 20px;">
            
            <h1 style="color: #ff5722; margin-bottom: 24px;">¡Gracias por tu suscripción!</h1>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola ${userName},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              ¡Tu suscripción al plan ${planName} ha sido activada con éxito! Ahora tienes ${credits} créditos disponibles para crear más Cuentitos increíbles.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Ingresa a la plataforma y comienza a crear historias únicas y mágicas.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://cuenti.to" 
                 style="background-color: #ff5722; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        font-weight: bold;">
                Seguir escribiendo Cuentitos
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 32px;">
              Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.
            </p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in send-subscription-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
