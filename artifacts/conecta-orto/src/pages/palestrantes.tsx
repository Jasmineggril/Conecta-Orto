import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Mic, Calendar, Clock } from "lucide-react";

interface Speaker {
  id: number;
  name: string;
  title: string;
  institution: string;
  bio: string;
  talkTopic: string;
  talkDate: string;
  talkTime: string;
  linkedinUrl?: string | null;
  photoUrl?: string | null;
  displayOrder: number;
}

// Fallback speakers for when DB has none yet
const FALLBACK_SPEAKERS: Speaker[] = [
  { id: 1, name: "Dr. Carlos Augusto Silva", title: "Coordenador do Evento, FMUSP", institution: "FMUSP", bio: "Cirurgião ortopedista especialista em quadril com mais de 20 anos de experiência. Coordenador do Serviço de Ortopedia do HC-FMUSP.", talkTopic: "Abertura oficial do Conecta Orto", talkDate: "09/07/2026", talkTime: "08:30", linkedinUrl: null, photoUrl: null, displayOrder: 1 },
  { id: 2, name: "Dra. Ana Paula Costa", title: "Cirurgiã de Joelho, Unifesp", institution: "Unifesp", bio: "Referência nacional em artroplastias de revisão. Membro da SBOT e pesquisadora ativa na área de biomateriais.", talkTopic: "Medo de implantes: o que a engenharia pode explicar", talkDate: "09/07/2026", talkTime: "09:00", linkedinUrl: null, photoUrl: null, displayOrder: 2 },
  { id: 3, name: "Dr. Roberto Alves", title: "Coordenador de Minicurso", institution: "UnDF", bio: "Pioneer em cirurgia robótica ortopédica no Brasil. Realizou mais de 500 cirurgias assistidas por robô.", talkTopic: "Materiais biocompatíveis e segurança no corpo humano", talkDate: "09/07/2026", talkTime: "10:00", linkedinUrl: null, photoUrl: null, displayOrder: 3 },
  { id: 4, name: "Dr. Marcos Ferreira", title: "Traumatologia, USP Ribeirão", institution: "FMRP-USP", bio: "Especialista em trauma ortopédico e fixadores modernos. Professor associado da FMRP-USP.", talkTopic: "Demonstração: placas, pinos e próteses ortopédicas", talkDate: "09/07/2026", talkTime: "11:00", linkedinUrl: null, photoUrl: null, displayOrder: 4 },
];

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export default function Palestrantes() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/speakers")
      .then(r => r.json())
      .then((data: Speaker[]) => {
        setSpeakers(data.length > 0 ? data : FALLBACK_SPEAKERS);
      })
      .catch(() => setSpeakers(FALLBACK_SPEAKERS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Mic size={12} /> Palestrantes Confirmados
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nossos Palestrantes</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Profissionais de referência nacional que irão compartilhar conhecimento e experiência no Conecta Orto 2026.
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker, i) => (
              <motion.div
                key={speaker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="h-full glass-panel border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-14 h-14 border border-primary/20 shrink-0">
                        <AvatarImage src={speaker.photoUrl ?? undefined} alt={speaker.name} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                          {getInitials(speaker.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white leading-tight">{speaker.name}</p>
                        <p className="text-primary text-xs mt-0.5 truncate">{speaker.title}</p>
                        {speaker.institution && <p className="text-gray-500 text-xs truncate">{speaker.institution}</p>}
                      </div>
                    </div>

                    {speaker.bio && (
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">{speaker.bio}</p>
                    )}

                    {speaker.talkTopic && (
                      <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-4">
                        <p className="text-xs text-primary font-medium mb-0.5">🎤 Tema</p>
                        <p className="text-white text-sm">{speaker.talkTopic}</p>
                        {(speaker.talkDate || speaker.talkTime) && (
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            {speaker.talkDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {speaker.talkDate}</span>}
                            {speaker.talkTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {speaker.talkTime}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {speaker.linkedinUrl && (
                      <Button size="sm" variant="outline" className="w-full border-white/10 text-gray-300 hover:text-white gap-2" asChild>
                        <a href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
