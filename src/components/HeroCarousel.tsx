import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLibrary from "@/assets/hero-library.jpg";
import heroGames from "@/assets/hero-games.jpg";
import heroCommunity from "@/assets/hero-community.jpg";

const carouselImages = [
  {
    src: heroLibrary,
    alt: "Biblioteca Digital Moderna",
    title: "Biblioteca Digital",
    description: "Acesse milhares de livros em formato PDF"
  },
  {
    src: heroGames,
    alt: "Jogos em Python",
    title: "Jogos Interativos",
    description: "Baixe e explore jogos desenvolvidos em Python"
  },
  {
    src: heroCommunity,
    alt: "Comunidade Colaborativa",
    title: "Comunidade",
    description: "Faça parte da nossa comunidade de aprendizado"
  }
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide]);

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 6000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-card group">
      {/* Main carousel container */}
      <div className="relative w-full h-full">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="text-2xl lg:text-3xl font-bold mb-2 animate-fade-in">
                {image.title}
              </h3>
              <p className="text-lg lg:text-xl opacity-90 animate-fade-in">
                {image.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <Button
        variant="glass"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        onClick={goToPrevious}
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="glass"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        onClick={goToNext}
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-white scale-110 shadow-glow" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};