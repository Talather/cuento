import { useState } from "react";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface StoryFlagModalProps {
  storyId: string;
  storyTitle: string;
}

export function StoryFlagModal({ storyId, storyTitle }: StoryFlagModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to flag stories.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('story_flags')
      .insert({
        story_id: storyId,
        user_id: session.user.id,
        reason: reason.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit flag. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Story flagged",
      description: "Thank you for helping keep our community safe.",
    });

    setIsOpen(false);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
          <Flag className="h-4 w-4" />
          <span className="sr-only">Flag Story</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag Story</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with "{storyTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Please describe why you're flagging this story..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reason.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}