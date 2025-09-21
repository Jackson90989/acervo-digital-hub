import { BookOpen, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { StatsSection } from "@/components/StatsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { VolunteerSection } from "@/components/VolunteerSection";
import { Footer } from "@/components/Footer";
import { BrowserRouter } from 'react-router-dom';
import { Link, useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border/50 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">100% Gratuito • Sempre</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Bem-vindo ao nosso
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Acervo Digital</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Descubra milhares de livros em PDF e jogos interativos em Python, totalmente gratuitos. 
                Uma plataforma colaborativa construída pela comunidade, para a comunidade.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link to="/books">
    <Button variant="hero" size="xl" className="group">
      <BookOpen className="h-5 w-5 mr-2" />
      Explorar Livros
      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
    </Button>
  </Link>
<Link to="/games">
    <Button variant="hero" size="xl" className="group">
      <BookOpen className="h-5 w-5 mr-2" />
      Explorar Jogos
      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
    </Button>
     </Link>

              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span>2.500+ Livros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Download className="h-4 w-4" />
                  </div>
                  <span>150+ Jogos</span>
                </div>
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="animate-scale-in">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <VolunteerSection />
      <Footer />
    </div>
  );
};

export default Index;
