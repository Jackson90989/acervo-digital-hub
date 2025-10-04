import { BookOpen, Download, Users, Trophy } from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    number: "2,500+",
    label: "Livros Disponíveis",
    description: "Acervo em constante crescimento"
  },
  {
    icon: Download,
    number: "50K+",
    label: "Downloads Realizados",
    description: "Conteúdo acessado mensalmente"
  },
  {
    icon: Users,
    number: "10K+",
    label: "Usuários Ativos",
    description: "Comunidade engajada"
  },
  {
    icon: Trophy,
    number: "150+",
    label: "Jogos em Python",
    description: "Projetos interativos"
  }
];

export const StatsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Números que Impressionam
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa plataforma cresce constantemente, oferecendo cada vez mais conteúdo de qualidade para nossa comunidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {stat.label}
                </h3>
                
                <p className="text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};