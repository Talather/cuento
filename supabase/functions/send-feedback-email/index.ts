import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackEmailRequest {
  storyId: string;
  storyTitle: string;
  name: string;
  email: string;
  whatsapp?: string;
  source?: string;
  storyRating: number;
  illustrationRating: number;
  comments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const feedback: FeedbackEmailRequest = await req.json();
    
    // Create the story URL using the request origin
    const storyUrl = `${new URL(req.url).origin}/story/${feedback.storyId}`;
    
    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Story Feedback Received</h1>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #444; margin-top: 0;">Story Details</h2>
          <p><strong>Title:</strong> ${feedback.storyTitle}</p>
          <p><a href="${storyUrl}" style="color: #0066cc; text-decoration: none;">View Story</a></p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #444; margin-top: 0;">Feedback Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Name:</strong></td>
              <td style="padding: 8px 0;">${feedback.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;">${feedback.email}</td>
            </tr>
            ${feedback.whatsapp ? `
            <tr>
              <td style="padding: 8px 0;"><strong>WhatsApp:</strong></td>
              <td style="padding: 8px 0;">${feedback.whatsapp}</td>
            </tr>
            ` : ''}
            ${feedback.source ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Source:</strong></td>
              <td style="padding: 8px 0;">${feedback.source}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0;"><strong>Story Rating:</strong></td>
              <td style="padding: 8px 0;">
                <span style="color: ${feedback.storyRating >= 7 ? '#28a745' : feedback.storyRating >= 4 ? '#ffc107' : '#dc3545'}">
                  ${feedback.storyRating}/10
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Illustration Rating:</strong></td>
              <td style="padding: 8px 0;">
                <span style="color: ${feedback.illustrationRating >= 7 ? '#28a745' : feedback.illustrationRating >= 4 ? '#ffc107' : '#dc3545'}">
                  ${feedback.illustrationRating}/10
                </span>
              </td>
            </tr>
          </table>
          ${feedback.comments ? `
          <div style="margin-top: 15px;">
            <h3 style="color: #444; margin-bottom: 10px;">Additional Comments:</h3>
            <p style="background: #fff; padding: 10px; border-radius: 4px; margin: 0;">
              ${feedback.comments}
            </p>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Feedback <feedback@cuentito.app>",
        to: ["admin+feedback@cuentito.app"],
        subject: `New Feedback for Story: ${feedback.storyTitle}`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in sendemail function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);