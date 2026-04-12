import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePendingSubscription } from "@/hooks/usePendingSubscription";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const { handlePendingSubscription } = usePendingSubscription();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const pendingData = localStorage.getItem('pendingSubscription');
        if (pendingData) {
          const subscription = JSON.parse(pendingData);
          // console.log('Found pending subscription in Login:', subscription);
          
          if (subscription.paymentLink || subscription.originalPaymentLink) {
            const redirectUrl = subscription.paymentLink || subscription.originalPaymentLink;
            // console.log('Redirecting to payment link:', redirectUrl);
            window.location.href = redirectUrl;
            return;
          }
          
          await handlePendingSubscription(session);
        } else {
          navigate("/");
        }
      }
    });
  }, [navigate, handlePendingSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('auth.welcome_back')}</h2>
          <p className="text-muted-foreground mt-2">{t('auth.sign_in_continue')}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={["google", "facebook"]}
            redirectTo={window.location.origin + "/auth/callback"}
            onlyThirdPartyProviders={true}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
