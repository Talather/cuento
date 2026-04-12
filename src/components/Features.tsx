import { Lightbulb, Pencil, Wand2, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Features = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="py-20 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          {t("features.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("features.step1.title")}</h3>
            <p className="text-gray-600">{t("features.step1.description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Pencil className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("features.step2.title")}</h3>
            <p className="text-gray-600">{t("features.step2.description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Wand2 className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("features.step3.title")}</h3>
            <p className="text-gray-600">{t("features.step3.description")}</p>
          </div>
        </div>
        <div className="flex justify-center mt-12">
          <Button 
            onClick={() => navigate("/story/new")}
            size="lg"
          >
            <BookOpen className="h-4 w-4" />
            {t("features.button")}
          </Button>
        </div>
      </div>
    </div>
  );
};