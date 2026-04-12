import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LibraryHeader } from "@/components/LibraryHeader";
import { LibraryLoadingState } from "@/components/LibraryLoadingState";
import { StoriesGrid } from "@/components/StoriesGrid";
import { LibraryPagination } from "@/components/LibraryPagination";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 9;

export default function TaggedStories() {
  const { tag } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "likes-desc";
  const { t } = useTranslation();

  const decodedTag = tag ? decodeURIComponent(tag).replace(/-/g, ' ') : '';

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['tagged-stories', decodedTag, currentPage, currentSort],
    queryFn: async () => {
      let query = supabase
        .from('stories')
        .select('*', { count: 'exact' })
        .ilike('tags', `%${decodedTag}%`);

      // Apply sorting
      const [sortField, sortOrder] = currentSort.split('-');
      if (sortField === 'likes') {
        query = query.order('likes', { ascending: sortOrder === 'asc' });
      } else if (sortField === 'date') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(start, start + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        stories: data,
        totalCount: count || 0,
      };
    },
  });

  const totalPages = storiesData ? Math.ceil(storiesData.totalCount / ITEMS_PER_PAGE) : 0;

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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">
        {t('pages.tagged_stories.count', {
          count: storiesData?.totalCount || 0,
          tag: decodedTag
        })}
      </h1>
      <LibraryHeader currentSort={currentSort} onSortChange={handleSortChange} />
      {isLoading ? (
        <LibraryLoadingState />
      ) : (
        <>
          <StoriesGrid stories={storiesData?.stories || []} />
          <LibraryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}