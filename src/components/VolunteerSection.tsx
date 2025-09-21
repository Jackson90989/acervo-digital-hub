import { Mail, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const VolunteerSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Torne-se um Voluntário Administrador
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Estamos sempre buscando pessoas engajadas e dedicadas para ajudar a manter e expandir 
              nosso acervo digital. Como voluntário administrador, você poderá contribuir postando novos 
              livros e jogos para a comunidade, ajudando a tornar nosso projeto ainda mais completo e acessível.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Como Voluntário, Você Pode:
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Adicionar Conteúdo</h4>
                      <p className="text-muted-foreground">Faça upload de livros e jogos de qualidade para nossa biblioteca.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Moderar Comunidade</h4>
                      <p className="text-muted-foreground">Ajude a manter um ambiente saudável e colaborativo.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Suporte aos Usuários</h4>
                      <p className="text-muted-foreground">Responda dúvidas e ajude novos membros da comunidade.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="bg-gradient-subtle rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Interessado em Participar?
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Entre em contato conosco e faça parte da equipe que está transformando o acesso ao conhecimento!
                  </p>
                </div>
                
                <Button 
                  variant="hero" 
                  size="lg"
                  className="w-full lg:w-auto"
                  onClick={() => window.location.href = 'mailto:contato@acervodigital.com?subject=Interesse%20em%20ser%20Voluntário%20Administrador'}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Entrar em Contato
                </Button>
                
                <p className="text-sm text-muted-foreground mt-4">
                  contato@acervodigital.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};