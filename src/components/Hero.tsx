import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { getStorageUrl } from "@/utils/config";

export const Hero = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  return <div className="relative min-h-[650px] bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between pt-20 pb-12">
        <div className="flex flex-col text-left max-w-[700px] z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-tight whitespace-pre-line">
            {t("hero.title")}
          </h1>
          <p className="text-gray-650 mb-8 text-lg">
            {t("hero.description")}
          </p>
          <Button onClick={() => navigate("/story/new")} size="lg">
            <BookOpen className="h-4 w-4" />
            {t("hero.button")}
          </Button>
        </div>
        <div className="w-full md:w-[700px] h-[500px] mt-8 md:mt-0 md:-mr-20 overflow-hidden">
          <img src={getStorageUrl('images/caperucita.png')} className="w-[140%] h-full object-contain object-left animate-float ml-[20%]" />
        </div>
      </div>
    </div>;
};
