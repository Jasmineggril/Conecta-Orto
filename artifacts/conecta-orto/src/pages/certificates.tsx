import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Award, Download, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─────────────────────────────────────────────────────────
   Utilitário: abre janela de impressão (salvar como PDF)
   ───────────────────────────────────────────────────────── */
function printCertificate(opts: {
  name: string;
  type: "event" | "minicourse";
  title: string;
  hours: string;
  instructor?: string;
}) {
  const isPrimary = opts.type === "event";

  const bodyText = isPrimary
    ? `participou do <strong>Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</strong>,
       realizado em 09 de julho de 2026, Universidade do Distrito Federal Jorge Amaury,
       Lago Norte, Brasília — DF, com carga horária de <strong>${opts.hours}</strong>.`
    : `concluiu o minicurso <strong>&ldquo;${opts.title}&rdquo;</strong>${
        opts.instructor ? `, ministrado por <strong>${opts.instructor}</strong>` : ""
      }, com carga horária de <strong>${opts.hours}</strong>.`;

  const accentColor = isPrimary ? "#1E6FFF" : "#6b7280";
  const bgTop = isPrimary ? "#0a1f44" : "#0f1e35";
  const bgBot = isPrimary ? "#091535" : "#111e30";
  const kind = isPrimary ? "Certificado de Participação" : "Certificado de Minicurso";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${kind} – ${opts.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 0; }
    body {
      font-family: 'Inter', sans-serif;
      width: 297mm; height: 210mm;
      overflow: hidden;
      background: linear-gradient(135deg, ${bgTop} 0%, ${bgBot} 100%);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .cert { width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; }
    .bar { height: 10px; background: linear-gradient(90deg, ${accentColor}, #60a5fa, ${accentColor}); }
    .circle-tl { position: absolute; top: 30px; left: 30px; width: 120px; height: 120px;
      border-radius: 50%; border: 1px solid rgba(255,255,255,0.06); }
    .circle-br { position: absolute; bottom: 30px; right: 30px; width: 120px; height: 120px;
      border-radius: 50%; border: 1px solid rgba(255,255,255,0.06); }
    .body {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 16mm 28mm; text-align: center;
    }
    .label { text-transform: uppercase; letter-spacing: 0.3em; font-size: 11px;
      font-weight: 600; color: ${accentColor}; margin-bottom: 10px; }
    .divider { width: 60px; height: 1px;
      background: linear-gradient(90deg, transparent, ${accentColor}, transparent);
      margin: 0 auto 14px; }
    .certifies { font-size: 13px; color: #9ca3af; margin-bottom: 6px; }
    .participant-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 38px; font-style: italic; font-weight: 700;
      color: #fff; margin-bottom: 14px; line-height: 1.1;
    }
    .description { font-size: 13px; color: #d1d5db; max-width: 480px;
      line-height: 1.8; margin-bottom: 18px; }
    .meta { display: flex; gap: 24px; justify-content: center;
      font-size: 11px; color: #6b7280; margin-top: 4px; }
    .footer {
      padding: 8px 28mm; background: rgba(0,0,0,0.25);
      display: flex; justify-content: space-between; align-items: center;
      font-size: 10px; color: #4b5563;
    }
  </style>
</head>
<body>
<div class="cert">
  <div class="bar"></div>
  <div class="circle-tl"></div>
  <div class="circle-br"></div>
  <div class="body">
    <div class="label">${kind}</div>
    <div class="divider"></div>
    <div class="certifies">Certificamos que</div>
    <div class="participant-name">${opts.name}</div>
    <div class="description">${bodyText}</div>
    <div class="divider"></div>
    <div class="meta">
      <span>📅 09 de Julho de 2026</span>
      <span>📍 UnDF Jorge Amaury, Brasília — DF</span>
    </div>
  </div>
  <div class="bar"></div>
  <div class="footer">
    <span>🏅 conectaorto.com.br/certificados</span>
    <span>Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</span>
  </div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); setTimeout(function(){ window.close(); }, 800); }, 600);
  };
<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Permita pop-ups para baixar o certificado.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

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
          onClick={() => printCertificate({ name, type, title, hours, instructor })}
        >
          <Download className="w-3 h-3 mr-1" /> Baixar PDF
        </Button>
      </div>
    </div>
  );
}

interface EnrollmentRecord {
  minicourse_id: number;
  minicourses: {
    title: string;
    instructor: string;
  } | null;
}

interface CertificateData {
  id: number;
  name: string;
  enrollments: Array<{ title: string; instructor: string }>; 
}

export default function Certificates() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setData(null);

    const { data: registration, error: registrationError } = await supabase
      .from("registrations")
      .select("id, name")
      .eq("email", email)
      .single();

    if (registrationError || !registration) {
      setIsLoading(false);
      toast({ variant: "destructive", title: "Não encontrado", description: "Nenhum cadastro encontrado para este e-mail." });
      return;
    }

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("minicourse_id, minicourses(title, instructor)")
      .eq("registration_id", registration.id);

    setIsLoading(false);

    if (enrollmentsError) {
      console.error(enrollmentsError);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível buscar os certificados." });
      return;
    }

    setData({
      id: registration.id,
      name: registration.name,
      enrollments: (enrollments ?? []).map((item: any) => {
        const related = item.minicourses?.[0] ?? item.minicourses;
        return {
          title: related?.title ?? "Minicurso",
          instructor: related?.instructor ?? "",
        };
      }),
    });
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
                <Button type="submit" className="h-12 px-8" disabled={isLoading}>
                  {isLoading ? "Buscando..." : "Buscar"}
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

              {data.enrollments.map((enrollment, index) => (
                <CertificateCard
                  key={`${enrollment.title}-${index}`}
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
        {!data && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
            <p className="text-center text-gray-600 text-sm mb-8">— prévia do certificado —</p>
            <CertificateCard name="Nome do Participante" type="event" title="Conecta Orto 2026" hours="10 (dez) horas" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
