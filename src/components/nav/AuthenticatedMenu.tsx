import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Library, Heart, BookText } from "lucide-react";
import { useSessionData } from "@/hooks/useSessionData";

export const AuthenticatedMenu = () => {
  const navigate = useNavigate();
  const { data: session } = useSessionData();

  return (
    <>
      <Button
        variant="ghost"
        className="text-gray-600 hover:text-primary flex items-center gap-2"
        onClick={() => navigate(`/library?id=${session?.user?.id}`)}
      >
        <BookText className="h-4 w-4" />
        Mis Cuentos
      </Button>
      <Button
        variant="ghost"
        className="text-gray-600 hover:text-primary flex items-center gap-2"
        onClick={() => navigate("/liked")}
      >
        <Heart className="h-4 w-4" />
        Me Gusta
      </Button>
    </>
  );
};