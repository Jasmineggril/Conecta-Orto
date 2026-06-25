import { useEffect, useRef, useState } from "react";
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
import {
  Users, BookOpen, Award, ArrowRight, MapPin, Calendar,
  Microscope, Stethoscope, Brain, Shield
} from "lucide-react";

const TARGET_DATE = new Date("2026-07-09T08:00:00").getTime();

const SCHEDULE = [
  { time: "08:00", title: "Credenciamento e recepção", type: "logistics", speaker: "" },
  { time: "08:30", title: "Abertura oficial do Conecta Orto", type: "opening", speaker: "Comissão Organizadora" },
  { time: "09:00", title: "Medo de implantes: o que a engenharia pode explicar", type: "lecture", speaker: "Palestra" },
  { time: "10:00", title: "Materiais biocompatíveis e segurança no corpo humano", type: "lecture", speaker: "Palestra" },
  { time: "11:00", title: "Demonstração: placas, pinos e próteses ortopédicas", type: "demo", speaker: "Demonstração prática" },
  { time: "12:00", title: "Intervalo para almoço", type: "break", speaker: "" },
  { time: "14:00", title: "Minicurso 1 — Introdução aos Implantes Ortopédicos", type: "minicourse", speaker: "Sessão prática" },
  { time: "15:30", title: "Minicurso 2 — Materiais Biocompatíveis", type: "minicourse", speaker: "Sessão prática" },
  { time: "16:30", title: "Mesa-redonda: tecnologia, saúde e confiança do paciente", type: "roundtable", speaker: "Convidados" },
  { time: "17:30", title: "Encerramento e orientações sobre certificados", type: "closing", speaker: "" },
  { time: "18:00", title: "Final do evento", type: "logistics", speaker: "" },
];

const TYPE_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  logistics:  { dot: "bg-gray-500",    badge: "bg-gray-500/15 text-gray-400 border-gray-500/20",    label: "Logística" },
  opening:    { dot: "bg-primary",     badge: "bg-primary/15 text-primary border-primary/20",         label: "Abertura" },
  lecture:    { dot: "bg-blue-400",    badge: "bg-blue-400/15 text-blue-300 border-blue-400/20",      label: "Palestra" },
  demo:       { dot: "bg-violet-400",  badge: "bg-violet-400/15 text-violet-300 border-violet-400/20",label: "Demonstração" },
  break:      { dot: "bg-amber-400",   badge: "bg-amber-400/15 text-amber-300 border-amber-400/20",   label: "Intervalo" },
  minicourse: { dot: "bg-emerald-400", badge: "bg-emerald-400/15 text-emerald-300 border-emerald-400/20", label: "Minicurso" },
  roundtable: { dot: "bg-pink-400",    badge: "bg-pink-400/15 text-pink-300 border-pink-400/20",      label: "Mesa-redonda" },
  closing:    { dot: "bg-primary",     badge: "bg-primary/15 text-primary border-primary/20",         label: "Encerramento" },
};

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const scheduleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const distance = TARGET_DATE - Date.now();
      if (distance < 0) return;
      setTimeLeft({
        days:    Math.floor(distance / 86_400_000),
        hours:   Math.floor((distance % 86_400_000) / 3_600_000),
        minutes: Math.floor((distance % 3_600_000) / 60_000),
        seconds: Math.floor((distance % 60_000) / 1_000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const scrollToSchedule = () => {
    scheduleRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const COUNTDOWN_LABELS = ["Dias", "Horas", "Minutos", "Segundos"];
  const countdownValues = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#040d1a]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(30,111,255,0.25),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A1628] to-transparent" />
          {/* decorative grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(#1E6FFF 1px, transparent 1px), linear-gradient(to right, #1E6FFF 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Congresso Aberto à Comunidade — Inscrição Gratuita
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-none">
              Conecta<br />
              <span className="text-gradient-primary">Orto</span>
              <span className="text-white"> 2026</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 font-light mb-3 max-w-3xl mx-auto">
              O Futuro dos Implantes Ortopédicos
            </p>
            <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto">
              Desmistificando a tecnologia que devolve movimento. Um evento acolhedor para pacientes, curiosos e futuros profissionais da saúde.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-12">
              <span className="flex items-center gap-1.5"><Calendar size={15} className="text-primary" /> 09 de Julho de 2026</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="flex items-center gap-1.5"><MapPin size={15} className="text-primary" /> Campus Norte FMUSP, São Paulo</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <Link href="/inscricao">
                <Button size="lg" className="text-base px-8 py-6 h-auto font-semibold shadow-lg shadow-primary/30">
                  Inscreva-se gratuitamente <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline" size="lg"
                onClick={scrollToSchedule}
                className="text-base px-8 py-6 h-auto bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Ver Programação
              </Button>
              <Link href="/localizacao">
                <Button variant="ghost" size="lg" className="text-base px-8 py-6 h-auto text-gray-400 hover:text-white hover:bg-white/5">
                  Como chegar
                </Button>
              </Link>
            </div>

            {/* Countdown */}
            <div className="grid grid-cols-4 gap-3 md:gap-5 max-w-2xl mx-auto">
              {countdownValues.map((val, i) => (
                <div key={i} className="glass-panel rounded-2xl py-6 px-2 flex flex-col items-center justify-center border border-primary/10">
                  <span className="text-3xl md:text-5xl font-mono font-bold text-white tabular-nums">
                    {val.toString().padStart(2, "0")}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-widest mt-2">{COUNTDOWN_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ABOUT / PILLARS ──────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A1628]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que participar?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Um espaço seguro para entender os implantes ortopédicos sem jargões, com clareza e confiança.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Conhecimento acessível", desc: "Especialistas explicam o funcionamento dos implantes de forma simples, sem jargões complexos." },
              { icon: Shield, title: "Segurança comprovada", desc: "Entenda como os materiais biocompatíveis são testados e aprovados antes de chegarem ao mercado." },
              { icon: Microscope, title: "Demonstração prática", desc: "Veja e toque em próteses, placas e pinos reais. A tecnologia que salva vidas de perto." },
              { icon: Stethoscope, title: "Conexão com especialistas", desc: "Converse diretamente com cirurgiões ortopedistas em uma mesa-redonda aberta." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-panel border-white/5 bg-white/[0.03] h-full group hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-[#0A1628] to-[#0D1F3C] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "+300", label: "Participantes esperados" },
              { value: "8",    label: "Palestras e demonstrações" },
              { value: "2",    label: "Minicursos práticos" },
              { value: "10h",  label: "Carga horária certificada" },
            ].map(({ value, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black text-gradient-primary mb-2">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCHEDULE TIMELINE ────────────────────────────────────────── */}
      <section ref={scheduleRef} id="programacao" className="py-24 bg-[#0D1F3C]">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Programação do Congresso</h2>
            <p className="text-gray-400">Um dia dedicado a desmistificar os implantes ortopédicos para a comunidade.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
              <Calendar size={14} /> 09 de Julho de 2026
            </div>
          </motion.div>

          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[88px] md:left-[104px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

            <div className="space-y-4">
              {SCHEDULE.map((item, i) => {
                const style = TYPE_STYLES[item.type];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="flex gap-6"
                  >
                    {/* time */}
                    <div className="w-20 md:w-24 flex-shrink-0 text-right pt-4">
                      <span className="text-primary font-mono font-bold text-sm">{item.time}</span>
                    </div>

                    {/* dot */}
                    <div className="relative flex-shrink-0 flex items-start pt-5">
                      <div className={`w-3 h-3 rounded-full ${style.dot} ring-4 ring-[#0D1F3C] z-10`} />
                    </div>

                    {/* card */}
                    <div className="flex-grow pb-4 min-w-0">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium mb-1.5 ${style.badge}`}>
                        {style.label}
                      </div>
                      <h4 className="text-white font-semibold leading-snug">{item.title}</h4>
                      {item.speaker && <p className="text-gray-500 text-sm mt-0.5">{item.speaker}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CERTIFICATE PREVIEW ──────────────────────────────────────── */}
      <section className="py-24 bg-[#0A1628]">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Certificado de Participação</h2>
            <p className="text-gray-400">Todos os presentes recebem um certificado digital de 10 horas.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-3xl"
          >
            {/* Certificate card */}
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/10"
              style={{ background: "linear-gradient(135deg, #0a1f44 0%, #0d2050 40%, #091535 100%)" }}
            >
              {/* top stripe */}
              <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-primary" />

              <div className="px-10 py-12 md:px-16 md:py-14 text-center relative">
                {/* decorative corner circles */}
                <div className="absolute top-6 left-6 w-20 h-20 rounded-full border border-primary/10 opacity-40" />
                <div className="absolute top-4 left-4 w-28 h-28 rounded-full border border-primary/05 opacity-30" />
                <div className="absolute bottom-6 right-6 w-20 h-20 rounded-full border border-primary/10 opacity-40" />
                <div className="absolute bottom-4 right-4 w-28 h-28 rounded-full border border-primary/05 opacity-30" />

                <div className="relative z-10">
                  <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-6">Certificado de Participação</p>

                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6" />

                  <p className="text-gray-400 text-sm mb-3">Certificamos que</p>
                  <p className="text-3xl md:text-4xl font-bold text-white mb-4 italic">Nome do Participante</p>

                  <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
                    participou do <strong className="text-white">Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</strong>,
                    realizado em 09 de julho de 2026, Campus Norte FMUSP, São Paulo — SP,
                    com carga horária de <strong className="text-white">10 (dez) horas</strong>.
                  </p>

                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />

                  <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-8">
                    <div className="text-center">
                      <div className="w-32 h-px bg-gray-500 mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">Prof. Dr. Carlos Augusto Silva</p>
                      <p className="text-gray-500 text-xs">Coordenador — FMUSP</p>
                    </div>
                    <div className="text-center">
                      <div className="w-32 h-px bg-gray-500 mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">Comissão Organizadora</p>
                      <p className="text-gray-500 text-xs">Conecta Orto 2026</p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                    <Award size={12} className="text-primary" />
                    Verificação: conectaorto.com.br/certificados
                  </div>
                </div>
              </div>

              {/* bottom stripe */}
              <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-primary" />
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Este é um modelo do certificado. Para obter o seu, acesse a página de certificados após o evento.
            </p>

            <div className="flex justify-center mt-4">
              <Link href="/certificados">
                <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                  <Award className="w-4 h-4 mr-2" /> Acessar meus certificados
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0D1F3C] border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              { q: "O evento é gratuito?", a: "Sim. A inscrição é totalmente gratuita. As vagas são limitadas, então garanta a sua o quanto antes." },
              { q: "Onde será realizado o evento?", a: "O Conecta Orto 2026 acontece no Campus Norte da FMUSP (Faculdade de Medicina da USP), Av. Dr. Arnaldo, 455 – São Paulo, SP. Há estacionamento no local e acesso fácil pela Estação Consolação do Metrô." },
              { q: "O certificado tem validade para horas complementares?", a: "Sim. Todos os participantes recebem um certificado de 10 horas que pode ser utilizado como horas complementares em diversas instituições de ensino." },
              { q: "Posso me inscrever em mais de um minicurso?", a: "Não. Como os minicursos ocorrem em paralelo durante a tarde, você poderá participar de apenas um. Escolha com atenção ao se inscrever." },
              { q: "O almoço está incluso?", a: "A inscrição inclui acesso a todas as atividades e coffee breaks (manhã e tarde). O almoço é por conta do congressista — haverá praça de alimentação próxima ao Campus." },
              { q: "Preciso ter conhecimento médico para participar?", a: "Não. O evento foi criado para qualquer pessoa curiosa sobre saúde e tecnologia. As palestras são apresentadas de forma acessível, sem jargões técnicos." },
            ].map(({ q, a }, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-panel border border-white/10 rounded-xl px-2">
                <AccordionTrigger className="text-left text-white hover:text-primary transition-colors py-5 font-medium">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-5 leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── SPONSORS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A1628] border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-gray-600 uppercase mb-10">Patrocinadores Oficiais</p>
          <div className="mb-6">
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Diamante</p>
            <div className="flex justify-center">
              <div className="w-52 h-16 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
                <span className="text-gray-700 text-sm font-medium">Seu logo aqui</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Ouro</p>
            <div className="flex justify-center gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="w-40 h-12 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center">
                  <span className="text-gray-700 text-xs">Seu logo aqui</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Prata</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-28 h-10 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center">
                  <span className="text-gray-700 text-xs">Logo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
