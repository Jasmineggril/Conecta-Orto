import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

const speakers = [
  {
    name: "Dr. Carlos Augusto Silva",
    specialty: "Coordenador do Evento, FMUSP",
    bio: "Cirurgião ortopedista especialista em quadril com mais de 20 anos de experiência. Coordenador do Serviço de Ortopedia do HC-FMUSP.",
    initials: "CS",
  },
  {
    name: "Dra. Ana Paula Costa",
    specialty: "Cirurgiã de Joelho, Unifesp",
    bio: "Referência nacional em artroplastias de revisão. Membro da SBOT e pesquisadora ativa na área de biomateriais.",
    initials: "AC",
  },
  {
    name: "Dr. Roberto Alves",
    specialty: "Coordenador de Minicurso",
    bio: "Pioneer em cirurgia robótica ortopédica no Brasil. Realizou mais de 500 cirurgias assistidas por robô.",
    initials: "RA",
  },
  {
    name: "Dr. Marcos Ferreira",
    specialty: "Traumatologia, USP Ribeirão",
    bio: "Especialista em trauma ortopédico e fixadores modernos. Professor associado da FMRP-USP.",
    initials: "MF",
  },
  {
    name: "Dra. Juliana Martins",
    specialty: "Coluna, HCor",
    bio: "Referência em cirurgia minimamente invasiva da coluna. Fellow pela Johns Hopkins University.",
    initials: "JM",
  },
  {
    name: "Dr. Pedro Carvalho",
    specialty: "Ombro e Cotovelo, Einstein",
    bio: "Membro da Sociedade Brasileira de Cirurgia do Ombro e Cotovelo. Treinamento nos EUA e Europa.",
    initials: "PC",
  },
];

export default function Palestrantes() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Palestrantes</h1>
          <p className="text-xl text-gray-400">
            Especialistas de referência nacional e internacional
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakers.map((speaker, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-panel border-white/10 bg-white/5 h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(30,111,255,0.3)] hover:border-primary/50 group">
                <CardContent className="p-8 text-center flex flex-col items-center h-full">
                  <Avatar className="w-32 h-32 mb-6 border-4 border-white/10 group-hover:border-primary/50 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white">
                      {speaker.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{speaker.name}</h3>
                  <p className="text-primary font-medium mb-4">{speaker.specialty}</p>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                    {speaker.bio}
                  </p>
                  
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/5 hover:bg-primary/20 hover:text-primary mt-auto">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
