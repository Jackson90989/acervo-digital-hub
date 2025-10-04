import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ana Silva",
    role: "Estudante de Engenharia",
    avatar: "AS",
    content: "A biblioteca digital é fantástica! Encontrei ótimos livros para meus estudos e o sistema de download é muito prático.",
    rating: 5
  },
  {
    name: "João Pereira",
    role: "Desenvolvedor Python",
    avatar: "JP",
    content: "Os jogos em Python são incríveis e muito bem documentados. Ajudaram muito no meu aprendizado de programação.",
    rating: 5
  },
  {
    name: "Mariana Costa",
    role: "Professora",
    avatar: "MC",
    content: "A interface é simples e intuitiva. Uso constantemente para encontrar materiais educacionais para minhas aulas.",
    rating: 5
  },
  {
    name: "Carlos Santos",
    role: "Designer",
    avatar: "CS",
    content: "Projeto incrível! A qualidade do conteúdo e a facilidade de acesso fazem toda a diferença na minha rotina de estudos.",
    rating: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            O que Nossa Comunidade Diz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Depoimentos reais de pessoas que transformaram seus estudos e projetos com nossa plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="h-8 w-8 text-primary mb-6" />
              
              <p className="text-foreground leading-relaxed text-lg mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};