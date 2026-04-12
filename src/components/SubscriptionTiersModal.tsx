import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SubscriptionModalContent } from "@/components/subscription/SubscriptionModalContent";

interface SubscriptionTiersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionTiersModal({ open, onOpenChange }: SubscriptionTiersModalProps) {
  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          onOpenChange(false);
        }}
      >
        <SubscriptionModalContent />
      </DialogContent>
    </Dialog>
  );
}