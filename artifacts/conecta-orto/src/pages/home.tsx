import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, Users, BookOpen, Award, ArrowRight } from "lucide-react";

const TARGET_DATE = new Date("2025-07-15T08:00:00").getTime();

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-[#0A1628]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full glass-panel border border-white/10 text-primary mb-6 text-sm font-medium">
              15 de Julho de 2025 • São Paulo, SP
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              O futuro da <span className="text-gradient-primary">Ortopedia</span>
              <br /> começa aqui.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Conectando profissionais, tecnologia e inovação no maior congresso de implantes ortopédicos do país.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/inscricao">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto">
                  Garantir minha vaga <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/minicursos">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-transparent border-white/20 text-white hover:bg-white/10">
                  Ver Minicursos
                </Button>
              </Link>
            </div>

            {/* Countdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">
                    {value.toString().padStart(2, "0")}
                  </span>
                  <span className="text-sm text-gray-400 uppercase tracking-wider">{unit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#0D1F3C]/50 border-y border-white/5 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">+300</h3>
              <p className="text-gray-400">Participantes</p>
            </div>
            <div className="text-center">
              <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">8</h3>
              <p className="text-gray-400">Palestras Magnas</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">2</h3>
              <p className="text-gray-400">Minicursos Práticos</p>
            </div>
            <div className="text-center">
              <Award className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">10h</h3>
              <p className="text-gray-400">Certificado</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Schedule Timeline */}
      <section className="py-24 bg-[#0A1628] relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Programação</h2>
            <p className="text-gray-400">Um dia intenso de muito aprendizado e networking.</p>
          </motion.div>

          <div className="space-y-6">
            {[
              { time: "08:00", title: "Credenciamento e Welcome Coffee", speaker: "" },
              { time: "09:00", title: "Abertura Oficial", speaker: "Dr. Carlos Silva" },
              { time: "09:30", title: "Inovações em Implantes de Quadril", speaker: "Dra. Ana Costa" },
              { time: "11:00", title: "Coffee Break", speaker: "" },
              { time: "11:30", title: "Cirurgia Robótica na Ortopedia", speaker: "Dr. Roberto Alves" },
              { time: "13:00", title: "Almoço", speaker: "" },
              { time: "14:30", title: "Minicursos (Sessões Paralelas)", speaker: "Diversos" },
              { time: "16:30", title: "Coffee Break", speaker: "" },
              { time: "17:00", title: "Mesa Redonda: O Futuro da Especialidade", speaker: "Convidados" },
              { time: "18:30", title: "Encerramento e Happy Hour", speaker: "" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 md:gap-8"
              >
                <div className="w-20 md:w-24 text-right pt-4 flex-shrink-0">
                  <span className="text-primary font-mono font-bold">{item.time}</span>
                </div>
                <div className="relative pb-8 flex-grow">
                  <div className="absolute left-[-17px] md:left-[-33px] top-5 w-3 h-3 bg-primary rounded-full ring-4 ring-[#0A1628]" />
                  <div className="absolute left-[-12px] md:left-[-28px] top-8 bottom-0 w-0.5 bg-white/10" />
                  <Card className="glass-panel border-white/10 bg-white/5">
                    <CardContent className="p-4 md:p-6">
                      <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                      {item.speaker && <p className="text-gray-400 text-sm">{item.speaker}</p>}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#0D1F3C]/30 relative z-10 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="text-left text-white hover:text-primary transition-colors">
                O certificado tem validade para horas complementares?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Sim, todos os participantes receberão um certificado de 10 horas que pode ser utilizado como horas complementares em instituições de ensino. Os minicursos possuem certificados adicionais.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="text-left text-white hover:text-primary transition-colors">
                Posso me inscrever em mais de um minicurso?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Não. Como os minicursos ocorrem simultaneamente durante a tarde do congresso, você só poderá escolher um para participar.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="text-left text-white hover:text-primary transition-colors">
                O almoço está incluso na inscrição?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                A inscrição inclui acesso a todas as palestras, material de apoio e coffee breaks (manhã e tarde). O almoço é por conta do congressista, mas teremos praça de alimentação no local.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Sponsors Placeholder */}
      <section className="py-24 bg-[#0A1628] relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-8">Patrocinadores Oficiais</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="w-32 h-12 bg-white/10 rounded-lg animate-pulse" />
            <div className="w-32 h-12 bg-white/10 rounded-lg animate-pulse delay-75" />
            <div className="w-32 h-12 bg-white/10 rounded-lg animate-pulse delay-150" />
            <div className="w-32 h-12 bg-white/10 rounded-lg animate-pulse delay-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
