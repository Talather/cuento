import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { BookOpen } from "lucide-react";

interface NavActionsProps {
  isAuthenticated: boolean;
  userName: string;
  onLogout: () => void;
  onUpgradeClick: () => void;
}

export const NavActions = ({ isAuthenticated, userName, onLogout, onUpgradeClick }: NavActionsProps) => {
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <a href="/login">Iniciar sesión</a>
        </Button>
        <Button asChild>
          <a href="/story/new">
            <BookOpen className="h-4 w-4" />
            Escribí un Cuentito gratis
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button asChild>
        <a href="/story/new">
          <BookOpen className="h-4 w-4" />
          Escribí un Cuentito
        </a>
      </Button>
      <UserMenu 
        userName={userName} 
        onLogout={onLogout}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
};