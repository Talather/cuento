import { NavLogo } from "./nav/NavLogo";
import { NavLinks } from "./nav/NavLinks";
import { NavActions } from "./nav/NavActions";
import { SubscriptionTiersModal } from "./SubscriptionTiersModal";
import { useNavigation } from "./nav/useNavigation";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Nav = () => {
  const {
    isAuthenticated,
    userName,
    showPricingModal,
    setShowPricingModal,
    handleLogout,
  } = useNavigation();

  const location = useLocation();

  // Close modal when route changes
  useEffect(() => {
    setShowPricingModal(false);
  }, [location.pathname, setShowPricingModal]);

  return (
    <>
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <NavLogo />
            <NavLinks 
              isAuthenticated={isAuthenticated}
              onPricingClick={() => setShowPricingModal(true)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <NavActions 
              isAuthenticated={isAuthenticated}
              userName={userName}
              onLogout={handleLogout}
              onUpgradeClick={() => setShowPricingModal(true)}
            />
          </div>
        </div>
      </nav>

      <SubscriptionTiersModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
      />
    </>
  );
};