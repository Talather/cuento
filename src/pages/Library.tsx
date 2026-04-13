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

const ITEMS_PER_PAGE = 18;

interface LibraryResponse {
  stories: Story[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "likes-desc";
  const session = useSession();
  const { data: credits } = useUserCredits();
  const showUserStories = searchParams.get("filter") === "my-stories";

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['library-stories', showUserStories, session?.user?.id, currentPage, currentSort],
    queryFn: async () => {
      if (showUserStories && !session?.user?.id) {
        return { stories: [], totalCount: 0, page: 1, pageSize: ITEMS_PER_PAGE };
      }

      const { data, error } = await supabase.functions.invoke<LibraryResponse>('get-user-stories', {
        body: { 
          userId: showUserStories ? session?.user?.id : null,
          showTopRated: !showUserStories,
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          sort: currentSort,
        }
      });

      if (error) {
        console.error('Error fetching library stories:', error);
        throw error;
      }

      return data;
    },
    keepPreviousData: true,
  });

  const paginatedStories = storiesData?.stories || [];
  const totalPages = Math.ceil((storiesData?.totalCount || 0) / ITEMS_PER_PAGE);

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
