import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StoryShareModalProps {
  storyTitle: string;
  storyUrl: string;
}

export function StoryShareModal({ storyTitle, storyUrl }: StoryShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(storyTitle)}&url=${encodeURIComponent(storyUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${storyTitle} ${storyUrl}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(storyUrl)}&description=${encodeURIComponent(storyTitle)}`,
  };

  const handleShare = (platform: string) => {
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    toast({
      title: "Share link copied!",
      description: `Share this story on ${platform}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share Story</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this story</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-4 w-4" />
            Share on Twitter
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-4 w-4" />
            Share on Facebook
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleShare('whatsapp')}
          >
            <Share className="h-4 w-4" />
            Share on WhatsApp
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleShare('pinterest')}
          >
            <Share className="h-4 w-4" />
            Share on Pinterest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}