import { Button } from "@/components/ui/button";
import { ChevronDown, BookText, Heart, UserRound, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSessionData } from "@/hooks/useSessionData";

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
  onUpgradeClick: () => void;
}

export const UserMenu = ({ userName, onLogout, onUpgradeClick }: UserMenuProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: session } = useSessionData();
  const isAdmin = session?.user?.app_metadata?.is_super_admin === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          Bienvenido, {userName.split('@')[0]}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          {t('nav.edit_profile')}
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onUpgradeClick}>
          $ Subí de nivel
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate(`/library?id=${session?.user?.id}`)} 
          className="flex items-center gap-2"
        >
          <BookText className="h-4 w-4" />
          {t('nav.my_stories')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/liked")} className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          {t('nav.liked')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
