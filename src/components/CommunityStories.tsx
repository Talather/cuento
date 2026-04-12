import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export const CommunityStories = () => {
  const stories = [
    {
      title: "Ana, la exploradora espacial",
      image: "https://source.unsplash.com/random/400x300?space",
      excerpt: "Ana siempre soñó con viajar al espacio...",
    },
    {
      title: "Lucas y la tecnología digital",
      image: "https://source.unsplash.com/random/400x300?technology",
      excerpt: "Había una vez un niño que programaba...",
    },
    {
      title: "El amigo del bosque",
      image: "https://source.unsplash.com/random/400x300?forest",
      excerpt: "Todo comenzó en un pequeño bosque...",
    },
    {
      title: "El gato mágico de Sara",
      image: "https://source.unsplash.com/random/400x300?cat",
      excerpt: "Sara tenía un gato muy especial...",
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Cuentos favoritos de la comunidad
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden">
              <img src={story.image} alt={story.title} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{story.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{story.excerpt}</p>
                <Button variant="ghost" className="text-orange-500 hover:text-orange-600 p-0">
                  Leer más →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full">
            Escribir mi primer Cuento
          </Button>
        </div>
      </div>
    </div>
  );
};