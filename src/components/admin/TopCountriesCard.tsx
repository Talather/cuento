
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CountryCount {
  country: string;
  count: number;
}

interface TopCountriesCardProps {
  title: string;
  functionName: 'get-top-countries' | 'get-top-countries-last-week';
}

export const TopCountriesCard = ({ title, functionName }: TopCountriesCardProps) => {
  const { data: countries, isLoading } = useQuery({
    queryKey: [functionName],
    queryFn: async () => {
      const { data, error } = await supabase
        .functions.invoke(functionName, {
          body: { limit_count: 10 }
        });

      if (error) throw error;
      return data as CountryCount[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {countries?.map((country, index) => (
            <div key={country.country} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {index + 1}) {country.country || "Unknown"}
              </span>
              <span className="font-medium">{country.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
