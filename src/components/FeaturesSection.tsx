import { Shield, Zap, Globe, Heart } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Gratuito",
    description: "Todo o conteúdo da nossa plataforma é totalmente gratuito, sem taxas ocultas ou limitações de acesso."
  },
  {
    icon: Zap,
    title: "Download Rápido",
    description: "Tecnologia otimizada para downloads rápidos e seguros, garantindo a melhor experiência do usuário."
  },
  {
    icon: Globe,
    title: "Acesso Universal",
    description: "Plataforma acessível de qualquer lugar do mundo, 24 horas por dia, 7 dias por semana."
  },
  {
    icon: Heart,
    title: "Feito com Amor",
    description: "Projeto desenvolvido por voluntários apaixonados por educação e tecnologia, para a comunidade."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Por que Escolher Nossa Plataforma?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Oferecemos a melhor experiência em conteúdo digital gratuito, com foco na qualidade, 
            acessibilidade e crescimento contínuo da nossa comunidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-center p-6 rounded-2xl hover:bg-card hover:shadow-card transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-6 group-hover:bg-gradient-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-secondary-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};