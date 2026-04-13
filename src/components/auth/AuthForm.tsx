import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface AuthFormProps {
  storyId: string | undefined;
}

export const AuthForm = ({ storyId }: AuthFormProps) => {
  // Store story ID before OAuth redirect
  useEffect(() => {
    if (storyId) {
      const handleOAuthSignIn = () => {
        localStorage.setItem('pendingStoryAttribution', storyId);
      };

      // Add event listeners to OAuth buttons after a short delay to ensure buttons are rendered
      const timer = setTimeout(() => {
        const oauthButtons = document.querySelectorAll('[data-provider]');
        oauthButtons.forEach(button => {
          button.addEventListener('click', handleOAuthSignIn);
        });
      }, 500);

      // Cleanup
      return () => {
        clearTimeout(timer);
        const oauthButtons = document.querySelectorAll('[data-provider]');
        oauthButtons.forEach(button => {
          button.removeEventListener('click', handleOAuthSignIn);
        });
      };
    }
  }, [storyId]);

  return (
    <div className="bg-card p-6 rounded-lg">
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'rgb(var(--primary))',
                brandAccent: 'rgb(var(--primary))',
              },
            },
          },
          className: {
            button: 'auth-button',
          },
        }}
        localization={{
          variables: {
            sign_in: {
              social_provider_text: "Ingresa con {{provider}}"
            },
            sign_up: {
              social_provider_text: "Ingresa con {{provider}}"
            },
          },
        }}
        theme="light"
        providers={["google"]}
        redirectTo={window.location.origin + "/auth/callback"}
        onlyThirdPartyProviders={true}
        view="sign_in"
      />
    </div>
  );
};