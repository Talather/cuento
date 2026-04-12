import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { LibraryHeader } from "@/components/LibraryHeader";
import { StoriesGrid } from "@/components/StoriesGrid";
import { LibraryLoadingState } from "@/components/LibraryLoadingState";
import { LibraryPagination } from "@/components/LibraryPagination";
import { SEO } from "@/components/SEO";
import { Story } from "@/types/story";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useUserCredits } from "@/hooks/useUserCredits";

const ITEMS_PER_PAGE = 9;

interface LibraryResponse {
  stories: Story[];
}

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "likes-desc";
  const session = useSession();
  const { data: credits } = useUserCredits();
  const showUserStories = searchParams.get("filter") === "my-stories";

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['library-stories', showUserStories, session?.user?.id],
    queryFn: async () => {
      if (showUserStories && !session?.user?.id) {
        throw new Error("User must be authenticated to view their stories");
      }

      const { data, error } = await supabase.functions.invoke<LibraryResponse>('get-user-stories', {
        body: { 
          userId: showUserStories ? session?.user?.id : null,
          showTopRated: !showUserStories
        }
      });

      if (error) {
        console.error('Error fetching library stories:', error);
        throw error;
      }

      return data;
    },
  });

  const stories = storiesData?.stories || [];
  
  const sortedStories = [...stories].sort((a, b) => {
    const [field, order] = currentSort.split('-');
    if (field === 'likes') {
      return order === 'asc' ? (a.likes - b.likes) : (b.likes - a.likes);
    } else {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return order === 'asc' ? (dateA - dateB) : (dateB - dateA);
    }
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStories = sortedStories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(stories.length / ITEMS_PER_PAGE);

  const handleSortChange = (value: string) => {
    setSearchParams((params) => {
      params.set('sort', value);
      params.set('page', '1');
      return params;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((params) => {
      params.set('page', page.toString());
      return params;
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <LibraryHeader currentSort={currentSort} onSortChange={handleSortChange} />
        <LibraryLoadingState />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <SEO 
        title="Biblioteca | Cuenti.to"
        description="Los mejores cuentos infantiles en Cuenti.to"
        url="https://cuenti.to/library"
      />
      <LibraryHeader 
        currentSort={currentSort} 
        onSortChange={handleSortChange} 
      />
      <StoriesGrid stories={paginatedStories} />
      <LibraryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
