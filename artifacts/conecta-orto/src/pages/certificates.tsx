import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Award, Download, Calendar, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

/* ─── Types ─────────────────────────────────────────────────────── */
interface CertInfo {
  id: number;
  type: "event" | "minicourse";
  validationCode: string;
  workload: string;
  status: string;
  issuedAt: string;
  minicourseId?: number;
  minicourseTitle?: string;
  minicourseInstructor?: string;
}

interface RegistrationInfo {
  id: number;
  name: string;
  emailConfirmed: boolean;
  eventPresence: boolean;
  certificateReleased: boolean;
}

interface LookupResult {
  registration: RegistrationInfo;
  certificates: CertInfo[];
  enrollments: Array<{ title: string; instructor: string; workload: string; generatesCertificate: boolean }>;
  eligibility: { event: boolean };
}

/* ─── PDF generation (no external library — uses Blob + HTML) ───── */
function generatePDFBlob(opts: {
  name: string;
  type: "event" | "minicourse";
  title: string;
  hours: string;
  instructor?: string;
  validationCode: string;
  issuedAt?: string;
  enrolledCourses?: string[];
}): void {
  const isPrimary = opts.type === "event";
  const accentColor = isPrimary ? "#1E6FFF" : "#6b7280";
  const bgTop = isPrimary ? "#0a1f44" : "#0f1e35";
  const bgBot = isPrimary ? "#091535" : "#111e30";
  const kind = isPrimary ? "Certificado de Participação" : "Certificado de Minicurso";
  const shortCode = opts.validationCode ? opts.validationCode.slice(0, 16).toUpperCase() : "";
  const issuedDate = opts.issuedAt
    ? new Date(opts.issuedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  let minicoursesText = "";
  if (isPrimary && opts.enrolledCourses && opts.enrolledCourses.length > 0) {
    minicoursesText = ` além de ter participado dos minicursos: <em>${opts.enrolledCourses.join(", ")}</em>,`;
  }

  const bodyText = isPrimary
    ? `participou do <strong>Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</strong>, realizado em 09 de julho de 2026 na Universidade do Distrito Federal Professor Jorge Amaury Maia Nunes — UnDF, Lago Norte, Brasília — DF,${minicoursesText} com carga horária total de <strong>${opts.hours}</strong>.`
    : `concluiu o minicurso <strong>"${opts.title}"</strong>${opts.instructor ? `, ministrado por <strong>${opts.instructor}</strong>` : ""}, com carga horária de <strong>${opts.hours}</strong>.`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${location.origin}/certificados/validar/${opts.validationCode}`)}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>${kind} – ${opts.name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4 landscape;margin:0}
html,body{
  font-family:'Inter',sans-serif;
  width:297mm;height:210mm;overflow:hidden;
  background:linear-gradient(135deg,${bgTop} 0%,${bgBot} 100%);
  color:#fff;
}
.cert{width:100%;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.bar{height:10px;background:linear-gradient(90deg,${accentColor},#60a5fa,${accentColor})}
.deco-tl{position:absolute;top:20px;left:20px;width:120px;height:120px;border-radius:50%;border:1px solid rgba(255,255,255,0.05)}
.deco-br{position:absolute;bottom:30px;right:20px;width:100px;height:100px;border-radius:50%;border:1px solid rgba(255,255,255,0.05)}
.body{flex:1;display:flex;align-items:center;justify-content:center;padding:12mm 28mm;position:relative;z-index:1}
.inner{text-align:center;max-width:200mm}
.kind{text-transform:uppercase;letter-spacing:0.3em;font-size:10px;font-weight:700;color:${accentColor};margin-bottom:8px}
.divider{width:50px;height:1px;background:linear-gradient(90deg,transparent,${accentColor},transparent);margin:0 auto 12px}
.certifies{font-size:12px;color:#9ca3af;margin-bottom:4px}
.participant{font-family:'Playfair Display',Georgia,serif;font-size:36px;font-style:italic;font-weight:700;color:#fff;margin-bottom:12px;line-height:1.1}
.description{font-size:12px;color:#d1d5db;max-width:460px;margin:0 auto 14px;line-height:1.8}
.meta{display:flex;gap:20px;justify-content:center;font-size:10px;color:#6b7280;margin-bottom:14px}
.footer-row{padding:6px 28mm;background:rgba(0,0,0,0.2);display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#4b5563}
.qr{position:absolute;right:20mm;bottom:40px;text-align:center}
.qr img{width:60px;height:60px;border:1px solid rgba(255,255,255,0.1);border-radius:4px}
.qr p{font-size:7px;color:#4b5563;margin-top:2px}
.code-box{position:absolute;left:20mm;bottom:40px;font-size:8px;color:#4b5563}
.code-box span{font-family:monospace;color:${accentColor};font-size:9px}
</style>
</head>
<body>
<div class="cert">
  <div class="bar"></div>
  <div class="deco-tl"></div>
  <div class="deco-br"></div>
  <div class="body">
    <div class="inner">
      <div class="kind">${kind}</div>
      <div class="divider"></div>
      <div class="certifies">Certificamos que</div>
      <div class="participant">${opts.name}</div>
      <div class="description">${bodyText}</div>
      <div class="divider"></div>
      <div class="meta">
        <span>📅 09 de Julho de 2026</span>
        <span>📍 UnDF Jorge Amaury, Brasília — DF</span>
        <span>📆 Emitido em ${issuedDate}</span>
      </div>
    </div>
  </div>
  ${shortCode ? `<div class="code-box">Código de validação:<br/><span>${shortCode}</span></div>` : ""}
  <div class="qr">
    <img src="${qrUrl}" alt="QR Code de validação"/>
    <p>Validar certificado</p>
  </div>
  <div class="bar"></div>
  <div class="footer-row">
    <span>Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</span>
    <span>Universidade do Distrito Federal Professor Jorge Amaury Maia Nunes — UnDF</span>
  </div>
</div>
<script>
window.onload=function(){setTimeout(function(){window.print();},800)};
<\/script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Permita pop-ups para baixar o certificado."); return; }
  win.document.write(html);
  win.document.close();
}

/* ─── Certificate Card ────────────────────────────────────────── */
function CertificateCard({
  cert, name, enrolledCourses,
}: {
  cert: CertInfo;
  name: string;
  enrolledCourses?: string[];
}) {
  const isPrimary = cert.type === "event";
  const isActive = cert.status === "ativo";

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
              ? <>participou do <strong className="text-white">Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</strong>, realizado em 09 de julho de 2026, UnDF Jorge Amaury, Brasília — DF, {enrolledCourses && enrolledCourses.length > 0 && <>concluiu os minicursos <strong className="text-white">{enrolledCourses.join(", ")}</strong>, </>}com carga horária de <strong className="text-white">{cert.workload}</strong>.</>
              : <>concluiu o minicurso <strong className="text-white">"{cert.minicourseTitle}"</strong>{cert.minicourseInstructor ? <>, ministrado por <strong className="text-white">{cert.minicourseInstructor}</strong></> : null}, com carga horária de <strong className="text-white">{cert.workload}</strong>.</>
            }
          </p>
          <div className={`w-12 h-px mx-auto mb-4 ${isPrimary ? "bg-gradient-to-r from-transparent via-primary to-transparent" : "bg-gradient-to-r from-transparent via-gray-500 to-transparent"}`} />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={11} /> 09 de Julho de 2026</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1"><MapPin size={11} /> UnDF Jorge Amaury, Brasília — DF</span>
          </div>
          {cert.validationCode && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <code className="text-xs text-gray-600 font-mono">{cert.validationCode.slice(0, 16).toUpperCase()}</code>
              <Link href={`/certificados/validar/${cert.validationCode}`}>
                <span className="text-xs text-primary underline cursor-pointer">validar</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className={`h-1.5 ${isPrimary ? "bg-gradient-to-r from-primary via-blue-400 to-primary" : "bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"}`} />

      <div className="px-8 py-4 bg-black/20 flex items-center justify-between">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Award size={11} className={isPrimary ? "text-primary" : "text-gray-500"} />
          {isActive ? "Ativo" : "Cancelado"}
        </span>
        <Button
          size="sm"
          variant={isPrimary ? "default" : "outline"}
          className={`text-xs h-8 gap-1.5 ${!isPrimary ? "border-white/10 text-gray-400 hover:text-white" : ""}`}
          disabled={!isActive}
          onClick={() => generatePDFBlob({
            name,
            type: cert.type,
            title: cert.minicourseTitle ?? "Conecta Orto 2026",
            hours: cert.workload,
            instructor: cert.minicourseInstructor,
            validationCode: cert.validationCode,
            issuedAt: cert.issuedAt,
            enrolledCourses,
          })}
        >
          <Download className="w-3 h-3" /> Baixar PDF
        </Button>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Certificates() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setResult(null);
    setNotFound(false);
    setErrorMsg("");

    const res = await fetch(`/api/certificates/lookup?email=${encodeURIComponent(email.toLowerCase())}`);
    const body = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      if (res.status === 403) {
        setErrorMsg(body.error ?? "Cadastro não confirmado.");
      } else {
        setNotFound(true);
      }
      return;
    }
    setResult(body);
  };

  const enrolledCourseTitles = result?.enrollments.map(e => e.title) ?? [];

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
            Informe o e-mail usado na inscrição para visualizar e baixar seus certificados em PDF.
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
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error states */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">Nenhum cadastro encontrado para este e-mail.</p>
              </div>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-amber-300 text-sm">{errorMsg}</p>
                  <p className="text-amber-400/60 text-xs mt-1">Verifique sua caixa de entrada e spam para o e-mail de confirmação.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">{result.registration.name}</p>
                  <p className="text-gray-500 text-sm">{result.certificates.length} certificado{result.certificates.length !== 1 ? "s" : ""} disponíve{result.certificates.length !== 1 ? "is" : "l"}</p>
                </div>
              </div>

              {result.certificates.length === 0 && (
                <div className="text-center py-12 glass-panel border border-white/10 rounded-2xl">
                  <Award className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 font-medium mb-2">Nenhum certificado disponível</p>
                  <p className="text-gray-600 text-sm max-w-sm mx-auto">
                    Os certificados são liberados após confirmação de presença e aprovação pela organização do evento.
                  </p>
                  {!result.registration.emailConfirmed && (
                    <p className="text-amber-400 text-xs mt-3">⚠️ Seu e-mail ainda não foi confirmado.</p>
                  )}
                  {result.registration.emailConfirmed && !result.registration.eventPresence && (
                    <p className="text-amber-400 text-xs mt-3">⚠️ Sua presença no evento ainda não foi registrada.</p>
                  )}
                  {result.registration.emailConfirmed && result.registration.eventPresence && !result.registration.certificateReleased && (
                    <p className="text-amber-400 text-xs mt-3">⚠️ Os certificados ainda não foram liberados pela organização.</p>
                  )}
                </div>
              )}

              {result.certificates.map(cert => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  name={result.registration.name}
                  enrolledCourses={cert.type === "event" ? enrolledCourseTitles : undefined}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview when no search yet */}
        {!result && !isLoading && !notFound && !errorMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
            <p className="text-center text-gray-600 text-sm mb-8">— prévia do certificado —</p>
            <CertificateCard
              cert={{ id: 0, type: "event", validationCode: "PREVIEW", workload: "10 horas", status: "ativo", issuedAt: new Date().toISOString() }}
              name="Nome do Participante"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
