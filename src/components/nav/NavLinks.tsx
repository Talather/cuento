import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Library, Search, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavLinksProps {
  isAuthenticated: boolean;
  onPricingClick: () => void;
}

export const NavLinks = ({ isAuthenticated, onPricingClick }: NavLinksProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleUnauthenticatedClick = () => {
    toast({
      title: "Acceso restringido",
      description: "Necesitas iniciar sesión para acceder a esta función",
      variant: "warning",
    });
  };

  return (
    <nav className="hidden md:flex items-center space-x-4">
      <Button 
        variant="ghost" 
        onClick={onPricingClick}
        className="text-sm font-medium flex items-center gap-2"
      >
        <DollarSign className="h-4 w-4" />
        {t('nav.pricing')}
      </Button>
      <Link to="/library" className="text-sm font-medium flex items-center gap-2">
        <Library className="h-4 w-4" />
        {t('nav.library')}
      </Link>
      {isAuthenticated ? (
        <Link to="/search" className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t('nav.search')}
        </Link>
      ) : (
        <Button
          variant="ghost"
          onClick={handleUnauthenticatedClick}
          className="text-sm font-medium flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {t('nav.search')}
        </Button>
      )}
    </nav>
  );
};