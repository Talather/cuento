import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthModalHeader } from "./auth/AuthModalHeader";
import { AuthForm } from "./auth/AuthForm";
import { useStoryAttribution } from "@/hooks/useStoryAttribution";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegistrationModal = ({ open, onOpenChange }: RegistrationModalProps) => {
  const { id } = useParams<{ id: string }>();

  // Store story ID in localStorage when modal opens
  useEffect(() => {
    if (open && id) {
      localStorage.setItem('pendingStoryAttribution', id);
      // console.log('Stored story ID in localStorage:', id);
    }
  }, [open, id]);

  // Handle story attribution after sign in
  useStoryAttribution(onOpenChange, id);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <AuthModalHeader />
        <AuthForm storyId={id} />
      </AlertDialogContent>
    </AlertDialog>
  );
};
