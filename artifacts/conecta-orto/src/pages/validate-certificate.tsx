import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Award, Calendar, MapPin, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CertData {
  valid: boolean;
  name?: string;
  type?: string;
  title?: string;
  workload?: string;
  issuedAt?: string;
  validationCode?: string;
  status?: string;
  error?: string;
}

export default function ValidateCertificate() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertData | null>(null);

  useEffect(() => {
    if (!code) { setLoading(false); return; }
    fetch(`/api/certificates/validate/${code}`)
      .then(r => r.json())
      .then(body => { setData(body); setLoading(false); })
      .catch(() => { setData({ valid: false, error: "Erro ao validar o certificado." }); setLoading(false); });
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="glass-panel border border-white/10 bg-[#0D1F3C]/80 rounded-2xl overflow-hidden">
          {/* Top bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-blue-400 to-primary" />

          <div className="p-8">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-gray-400">Validando certificado...</p>
              </div>
            )}

            {!loading && data && (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${data.valid ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {data.valid
                      ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      : <XCircle className="w-8 h-8 text-red-400" />
                    }
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className={`text-xl font-bold mb-2 ${data.valid ? "text-emerald-400" : "text-red-400"}`}>
                    {data.valid ? "Certificado Válido" : "Certificado Inválido"}
                  </p>
                  {!data.valid && <p className="text-gray-400 text-sm">{data.error ?? "Este certificado não pôde ser verificado."}</p>}
                </div>

                {data.valid && data.name && (
                  <div className="space-y-4">
                    {/* Certificate card */}
                    <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-gradient-to-br from-[#0a1f44] to-[#091535]">
                      <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-primary" />
                      <div className="px-6 py-6 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
                          {data.type === "event" ? "Certificado de Participação" : "Certificado de Minicurso"}
                        </p>
                        <p className="text-gray-400 text-sm mb-1">Certificamos que</p>
                        <p className="text-2xl font-bold italic text-white mb-4">{data.name}</p>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">
                          {data.type === "event"
                            ? <>participou do <strong className="text-white">Conecta Orto 2026</strong>, realizado em 09 de julho de 2026 na UnDF Jorge Amaury, Brasília — DF</>
                            : <>concluiu o minicurso <strong className="text-white">"{data.title}"</strong></>
                          }
                          {data.workload && <>, com carga horária de <strong className="text-white">{data.workload}</strong>.</>}
                        </p>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-primary" />
                      <div className="px-6 py-3 bg-black/20 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Award className="w-3 h-3 text-primary" /> Conecta Orto 2026</span>
                        {data.status === "cancelado" && <span className="text-red-400 font-medium">CANCELADO</span>}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Emitido em</p>
                        <p className="text-white text-sm font-medium">
                          {data.issuedAt ? format(new Date(data.issuedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className={`text-sm font-medium ${data.status === "ativo" ? "text-emerald-400" : "text-red-400"}`}>
                          {data.status === "ativo" ? "✓ Ativo" : "✗ Cancelado"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Código de autenticidade</p>
                      <code className="text-primary font-mono text-sm">{data.validationCode}</code>
                    </div>

                    <div className="flex gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 09 de Julho de 2026</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> UnDF Jorge Amaury, Brasília — DF</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/certificados">
            <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
              Consultar certificados
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
