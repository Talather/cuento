import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const TEACHING_LEVELS = ["preschool", "primary", "secondary", "university"] as const;

export const TeacherFields = () => {
  const { t } = useTranslation();
  const form = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teaching_institutions",
  });

  return (
    <>
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="teaching_levels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.teaching_levels")}</FormLabel>
              <div className="flex flex-wrap gap-2">
                {TEACHING_LEVELS.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={field.value?.includes(level) ? "default" : "outline"}
                    onClick={() => {
                      const newValue = field.value?.includes(level)
                        ? field.value.filter((l) => l !== level)
                        : [...(field.value || []), level];
                      field.onChange(newValue);
                    }}
                    className="h-8"
                  >
                    {t(`profile.levels.${level}`)}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="teaching_experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("profile.teaching_experience")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="col-span-2">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`teaching_institutions.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {index === 0 ? t("profile.teaching_institutions") : ""}
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append("")}
          >
            {t("profile.add_institution")}
          </Button>
        </div>
      </div>
    </>
  );
};