
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminUserType } from "@/types/admin";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { createSlug } from "@/utils/slugUtils";
import { Story } from "@/types/story";
import { Badge } from "@/components/ui/badge";

interface UserDetailsProps {
  user: AdminUserType;
  onClose: () => void;
}

export const UserDetails = ({ user, onClose }: UserDetailsProps) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const { data: userStories, isLoading } = useQuery({
    queryKey: ["user-stories", user.id],
    queryFn: async () => {
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return stories as Story[];
    },
  });

  const renderProfileDetail = (label: string, value: any) => {
    if (value === null || value === undefined) return null;
    
    // Handle arrays (like favorite_genres, teaching_institutions, teaching_levels)
    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{label}</h3>
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary">{item}</Badge>
            ))}
          </div>
        </div>
      ) : null;
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{label}</h3>
          <p>{value ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    
    // Default rendering for strings and numbers
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{label}</h3>
        <p>{value}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Details</span>
            <button onClick={handleClose} className="rounded-full p-1 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
              <p className="font-mono text-xs break-all">{user.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
              <p>{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
              <p>{user.profile?.first_name || ''} {user.profile?.last_name || ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
              <p>{user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Available Credits</h3>
              <p>{user.profile?.story_credits || 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Stories Count</h3>
              <p>{userStories?.length || 0}</p>
            </div>
            
            {/* Additional profile fields */}
            {renderProfileDetail("Country", user.profile?.country)}
            {renderProfileDetail("Age", user.profile?.age)}
            {renderProfileDetail("Is Teacher", user.profile?.is_teacher)}
            {renderProfileDetail("Teaching Experience (years)", user.profile?.teaching_experience)}
            {renderProfileDetail("Teaching Institutions", user.profile?.teaching_institutions)}
            {renderProfileDetail("Teaching Levels", user.profile?.teaching_levels)}
            {renderProfileDetail("Favorite Genres", user.profile?.favorite_genres)}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">User Stories</h3>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : userStories && userStories.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-center">Likes</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          <a 
                            href={`/story/${createSlug(story.title)}/${story.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline text-blue-600 dark:text-blue-400"
                          >
                            {story.title}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {story.prompt}
                        </TableCell>
                        <TableCell>
                          {format(new Date(story.created_at || ''), 'yyyy-MM-dd HH:mm')}
                        </TableCell>
                        <TableCell className="text-center">{story.likes}</TableCell>
                        <TableCell className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            story.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {story.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No stories found for this user.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
