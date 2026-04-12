import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const GENEROS = [
  "Aventura", "Ciencia ficción", "Comedia", "Cuento de hadas",
  "Cuentos clásicos", "Didáctico", "Drama", "Fantasía", "Fábulas",
  "Histórico", "Horror", "Misterio", "Poesía", "Romance",
  "Relatos de animales", "Relatos de superhéroes", "Mitología", 
  "Parábolas", "Realismo mágico",
];

export const GenreSelector = () => {
  const { t } = useTranslation();
  const form = useFormContext();

  return (
    <div className="col-span-2">
      <FormField
        control={form.control}
        name="favorite_genres"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("profile.favorite_genres")}</FormLabel>
            <div className="flex flex-wrap gap-2">
              {GENEROS.map((genre) => (
                <Button
                  key={genre}
                  type="button"
                  variant={field.value.includes(genre) ? "default" : "outline"}
                  onClick={() => {
                    const newValue = field.value.includes(genre)
                      ? field.value.filter((g) => g !== genre)
                      : [...field.value, genre];
                    field.onChange(newValue);
                  }}
                  className="h-8"
                >
                  {genre}
                </Button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};