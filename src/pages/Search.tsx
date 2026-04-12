import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LibraryLoadingState } from "@/components/LibraryLoadingState";
import { StoriesGrid } from "@/components/StoriesGrid";
import { LibraryPagination } from "@/components/LibraryPagination";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 9;

export default function Search() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(searchQuery);

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['search-stories', searchQuery, currentPage],
    queryFn: async () => {
      if (!searchQuery) return { stories: [], totalCount: 0 };

      try {
        // Optimize the query by using individual ilike conditions
        const { data, error, count } = await supabase
          .from('stories')
          .select('*', { count: 'exact' })
          .or(
            `title.ilike.%${searchQuery}%,` +
            `synopsis.ilike.%${searchQuery}%`
          )
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * ITEMS_PER_PAGE, (currentPage * ITEMS_PER_PAGE) - 1);

        if (error) {
          console.error('Search error:', error);
          if (error.code === '57014') {
            toast({
              title: t("Error de búsqueda"),
              description: t("La búsqueda tardó demasiado. Por favor, intenta con términos más específicos."),
              variant: "destructive",
            });
          }
          throw error;
        }
        
        return {
          stories: data || [],
          totalCount: count || 0,
        };
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  });

  const totalPages = storiesData ? Math.ceil(storiesData.totalCount / ITEMS_PER_PAGE) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: inputValue, page: '1' });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((params) => {
      params.set('page', page.toString());
      return params;
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <SearchIcon className="h-8 w-8" />
        {t('Buscar historias')}
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder={t('Buscar por título, sinopsis o contenido...')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
        </div>
      </form>

      {searchQuery && (
        <p className="text-muted-foreground mb-8">
          {storiesData?.totalCount === 0
            ? t('No se encontraron historias')
            : t(`Se encontraron ${storiesData?.totalCount} historia${storiesData?.totalCount === 1 ? '' : 's'}`)}
        </p>
      )}

      {isLoading ? (
        <LibraryLoadingState />
      ) : (
        <>
          <StoriesGrid stories={storiesData?.stories || []} />
          {totalPages > 1 && (
            <LibraryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}