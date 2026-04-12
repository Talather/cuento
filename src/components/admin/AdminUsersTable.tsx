
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserDetails } from "@/components/admin/UserDetails";
import { Loader2, Download, User } from "lucide-react";
import { format } from "date-fns";
import { AdminUserType } from "@/types/admin";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const AdminUsersTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserType | null>(null);
  const { t } = useTranslation();
  
  // Separate state for the actual search term to be sent to the server
  const [serverSearchTerm, setServerSearchTerm] = useState("");

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", serverSearchTerm],
    queryFn: async () => {
      try {
        // Get users from auth service (admin only endpoint)
        const { data: usersData, error } = await supabase.functions.invoke("get-all-users", {
          body: { 
            searchQuery: serverSearchTerm || undefined,
            limit: 10 // Only load 10 users initially
          },
        });

        if (error) throw error;
        return usersData.users;
      } catch (error) {
        toast.error(t("Error loading users"));
        console.error("Error loading users:", error);
        return [];
      }
    },
  });

  const handleSearch = () => {
    // Update the server search term which will trigger a refetch
    setServerSearchTerm(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleExportCSV = () => {
    if (!users) return;
    
    const headers = [
      "User ID", "Email", "First Name", "Last Name", 
      "Credits", "Created At", "Stories Count"
    ];
    
    const csvData = users.map((user: AdminUserType) => [
      user.id,
      user.email,
      user.profile?.first_name || "",
      user.profile?.last_name || "",
      user.profile?.story_credits || 0,
      user.created_at,
      user.stories_count || 0
    ]);
    
    const csv = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => 
        typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
      ).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRowClick = (user: AdminUserType) => {
    setSelectedUser(user);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input 
            placeholder={t("Search users...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-sm"
          />
          <Button onClick={handleSearch}>{t("Search")}</Button>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          {t("Export CSV")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("User ID")}</TableHead>
              <TableHead>{t("Email")}</TableHead>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Credits")}</TableHead>
              <TableHead>{t("Created")}</TableHead>
              <TableHead className="text-right">{t("Stories")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user: AdminUserType) => (
                <TableRow 
                  key={user.id} 
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="font-mono text-xs">
                    {user.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.profile?.first_name || ''} {user.profile?.last_name || ''}
                  </TableCell>
                  <TableCell>{user.profile?.story_credits || 0}</TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">{user.stories_count || 0}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {serverSearchTerm ? t("No users found matching your search.") : t("No users found.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserDetails 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};
