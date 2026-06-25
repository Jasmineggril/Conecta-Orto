import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLookupRegistration } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Award, Download, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RegistrationWithEnrollments } from "@workspace/api-client-react";

function CertificateCard({
  name,
  type,
  title,
  hours,
  instructor,
}: {
  name: string;
  type: "event" | "minicourse";
  title: string;
  hours: string;
  instructor?: string;
}) {
  const isPrimary = type === "event";

  return (
    <div
      className="relative rounded-2xl overflow-hidden border shadow-xl"
      style={{
        borderColor: isPrimary ? "rgba(30,111,255,0.35)" : "rgba(255,255,255,0.1)",
        background: isPrimary
          ? "linear-gradient(135deg, #0a1f44 0%, #0d2050 50%, #091535 100%)"
          : "linear-gradient(135deg, #0f1e35 0%, #111e30 100%)",
      }}
    >
      <div className={`h-1.5 ${isPrimary ? "bg-gradient-to-r from-primary via-blue-400 to-primary" : "bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"}`} />

      <div className="px-8 py-10 text-center relative">
        {/* decorative */}
        <div className="absolute top-4 left-4 w-16 h-16 rounded-full border border-white/5 opacity-40" />
        <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full border border-white/5 opacity-40" />

        <div className="relative z-10">
          <p className={`uppercase tracking-[0.3em] text-xs font-semibold mb-4 ${isPrimary ? "text-primary" : "text-gray-400"}`}>
            {isPrimary ? "Certificado de Participação" : "Certificado de Minicurso"}
          </p>

          <div className={`w-12 h-px mx-auto mb-4 ${isPrimary ? "bg-gradient-to-r from-transparent via-primary to-transparent" : "bg-gradient-to-r from-transparent via-gray-500 to-transparent"}`} />

          <p className="text-gray-400 text-sm mb-2">Certificamos que</p>
          <p className={`text-2xl md:text-3xl font-bold mb-3 italic ${isPrimary ? "text-white" : "text-gray-200"}`}>{name}</p>

          <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed mb-4">
            {isPrimary
              ? <>participou do <strong className="text-white">Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</strong>, realizado em 09 de julho de 2026, Universidade do Distrito Federal Jorge Amaury, Lago Norte, Brasília — DF, com carga horária de <strong className="text-white">{hours}</strong>.</>
              : <>concluiu o minicurso <strong className="text-white">"{title}"</strong>{instructor ? <>, ministrado por <strong className="text-white">{instructor}</strong></> : null}, com carga horária de <strong className="text-white">{hours}</strong>.</>
            }
          </p>

          <div className={`w-12 h-px mx-auto mb-6 ${isPrimary ? "bg-gradient-to-r from-transparent via-primary to-transparent" : "bg-gradient-to-r from-transparent via-gray-500 to-transparent"}`} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={11} /> 09 de Julho de 2026</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1"><MapPin size={11} /> UnDF Jorge Amaury, Brasília — DF</span>
          </div>
        </div>
      </div>

      <div className={`h-1.5 ${isPrimary ? "bg-gradient-to-r from-primary via-blue-400 to-primary" : "bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"}`} />

      <div className="px-8 py-4 bg-black/20 flex items-center justify-between">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Award size={11} className={isPrimary ? "text-primary" : "text-gray-500"} />
          conectaorto.com.br/certificados
        </span>
        <Button
          size="sm"
          variant={isPrimary ? "default" : "outline"}
          className={`text-xs h-8 ${!isPrimary ? "border-white/10 text-gray-400 hover:text-white" : ""}`}
          onClick={() => {}}
        >
          <Download className="w-3 h-3 mr-1" /> Baixar PDF
        </Button>
      </div>
    </div>
  );
}

export default function Certificates() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<RegistrationWithEnrollments | null>(null);
  const lookupRegistration = useLookupRegistration();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    lookupRegistration.mutate(
      { data: { email } },
      {
        onSuccess: (res) => setData(res),
        onError: () => {
          toast({ variant: "destructive", title: "Não encontrado", description: "Nenhum cadastro encontrado para este e-mail." });
          setData(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Award size={12} /> Certificados de Participação
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Seus Certificados</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Informe o e-mail usado na inscrição no evento para visualizar seus certificados de participação.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-panel border-white/10 bg-[#0D1F3C]/50 mb-10">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white h-12 placeholder:text-gray-600"
                  />
                </div>
                <Button type="submit" className="h-12 px-8" disabled={lookupRegistration.isPending}>
                  {lookupRegistration.isPending ? "Buscando..." : "Buscar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">{data.name}</p>
                  <p className="text-gray-500 text-sm">{data.enrollments.length + 1} certificado{data.enrollments.length !== 0 ? "s" : ""} disponível{data.enrollments.length !== 0 ? "is" : ""}</p>
                </div>
              </div>

              <CertificateCard name={data.name} type="event" title="Conecta Orto 2026" hours="10 (dez) horas" />

              {data.enrollments.map((enrollment) => (
                <CertificateCard
                  key={enrollment.minicourseId}
                  name={data.name}
                  type="minicourse"
                  title={enrollment.title}
                  hours="4 (quatro) horas"
                  instructor={enrollment.instructor}
                />
              ))}

              {data.enrollments.length === 0 && (
                <p className="text-center text-gray-600 text-sm pt-2">
                  Você não possui certificados de minicursos. Ainda é possível se inscrever em minicursos.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview note (when no search done yet) */}
        {!data && !lookupRegistration.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
            <p className="text-center text-gray-600 text-sm mb-8">— prévia do certificado —</p>
            <CertificateCard name="Nome do Participante" type="event" title="Conecta Orto 2026" hours="10 (dez) horas" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
