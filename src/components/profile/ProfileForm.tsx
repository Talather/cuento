import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useSessionData } from "@/hooks/useSessionData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { BasicFields } from "./BasicFields";
import { GenreSelector } from "./GenreSelector";
import { TeacherFields } from "./TeacherFields";

const TEACHING_LEVELS = ["preschool", "primary", "secondary", "university"] as const;
type TeachingLevel = (typeof TEACHING_LEVELS)[number];

const formSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  age: z.coerce.number().min(1).max(120),
  country: z.string().min(1),
  favorite_genres: z.array(z.string()).min(1),
  is_teacher: z.boolean().default(false),
  teaching_levels: z.array(z.enum(TEACHING_LEVELS)).optional(),
  teaching_experience: z.coerce.number().min(0).max(60).optional(),
  teaching_institutions: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  onSuccess: () => void;
}

export const ProfileForm = ({ onSuccess }: ProfileFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: session } = useSessionData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      age: 0,
      country: "",
      favorite_genres: [],
      is_teacher: false,
      teaching_levels: [],
      teaching_experience: 0,
      teaching_institutions: [""],
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          form.reset({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            age: profile.age || 0,
            country: profile.country || "",
            favorite_genres: profile.favorite_genres || [],
            is_teacher: profile.is_teacher || false,
            teaching_levels: (profile.teaching_levels || []) as TeachingLevel[],
            teaching_experience: profile.teaching_experience || 0,
            teaching_institutions: profile.teaching_institutions || [""],
          });
        }
      }
    };

    loadProfile();
  }, [session?.user?.id, form]);

  const onSubmit = async (values: FormValues) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          age: values.age,
          country: values.country,
          favorite_genres: values.favorite_genres,
          is_teacher: values.is_teacher,
          teaching_levels: values.is_teacher ? values.teaching_levels : null,
          teaching_experience: values.is_teacher ? values.teaching_experience : null,
          teaching_institutions: values.is_teacher ? values.teaching_institutions?.filter(Boolean) : null,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: t("common.success"),
        description: t("profile.update_success"),
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("common.error"),
        description: t("profile.update_error"),
        variant: "destructive",
      });
    }
  };

  const watchIsTeacher = form.watch("is_teacher");

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            <BasicFields />
            <GenreSelector />
            {watchIsTeacher && <TeacherFields />}
            <div className="col-span-2">
              <Button type="submit" className="w-full">
                {t("common.save")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};