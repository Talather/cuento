import { Palette, Link, FileText, Book } from "lucide-react";
import { Button } from "./ui/button";

export const PremiumFeatures = () => {
  return (
    <div className="py-20 bg-gray-900 text-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Convertí tus Cuentitos a Super Cuentitos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { icon: Palette, title: "Crea mejores personajes" },
            { icon: FileText, title: "Define el estilo de tus imágenes" },
            { icon: Book, title: "Descarga el Cuento en PDF" },
            { icon: Link, title: "Compartí los links de tus Cuentos" },
            { icon: Book, title: "Recibe el libro impreso en casa" },
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8" />
              </div>
              <p className="text-sm">{feature.title}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full">
            Cambiar Plan
          </Button>
        </div>
      </div>
    </div>
  );
};