import { Link } from "react-router-dom";
import { NavLogo } from "./nav/NavLogo";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full border-t border-gray-100 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <NavLogo />
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <Link 
              to="/story/new" 
              className="text-primary hover:text-primary/90 font-medium"
            >
              {t('footer.write_story')}
            </Link>
            <Link to="/contact" className="hover:text-primary">
              {t('footer.contact')}
            </Link>
            <Link to="/terms-of-service" className="hover:text-primary">
              {t('footer.terms')}
            </Link>
            <Link to="/privacy-policy" className="hover:text-primary">
              {t('footer.privacy')}
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Cuentito. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};