import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifySupabaseCallback } from "@/lib/supabase-auth";

type Status = "loading" | "success" | "used" | "expired" | "invalid";

export default function ConfirmEmail() {
  const [status, setStatus] = useState<Status>("loading");
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      // 1. Verifica o callback do Supabase Auth na URL atual
      const { email, error } = await verifySupabaseCallback();

      if (!email || error) {
        // Fallback: tenta o sistema legado de token da nossa API
        // (para links antigos que ainda estejam circulando)
        const path = window.location.pathname; // /confirmar/:token
        const token = path.split("/confirmar/")[1];
        if (token && token.length > 10) {
          const res = await fetch(`/api/registrations/confirm/${token}`);
          const body = await res.json();
          if (res.ok) {
            setName(body.name ?? "");
            setStatus("success");
          } else if (res.status === 410) {
            setStatus(body.error?.includes("expirado") ? "expired" : "used");
          } else {
            setStatus("invalid");
          }
          return;
        }
        setStatus("invalid");
        return;
      }

      // 2. E-mail confirmado no Supabase — marca como confirmado na nossa DB
      const res = await fetch("/api/registrations/confirm-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();

      if (res.ok) {
        setName(body.name ?? "");
        setStatus("success");
      } else if (res.status === 409) {
        // Já estava confirmado
        setName(body.name ?? "");
        setStatus("used");
      } else {
        setStatus("invalid");
      }
    })();
  }, []);

  const configs: Record<Status, {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
  }> = {
    loading: {
      icon: <Loader2 className="w-10 h-10 animate-spin text-primary" />,
      title: "Verificando...",
      subtitle: "Aguarde enquanto validamos sua confirmação.",
      color: "text-primary",
    },
    success: {
      icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
      title: `Inscrição confirmada${name ? `, ${name.split(" ")[0]}!` : "!"}`,
      subtitle: "Seu cadastro foi confirmado com sucesso. Você já pode se inscrever nos minicursos.",
      color: "text-emerald-400",
    },
    used: {
      icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
      title: "E-mail já confirmado",
      subtitle: "Sua inscrição já está ativa. Aproveite o evento!",
      color: "text-emerald-400",
    },
    expired: {
      icon: <Clock className="w-10 h-10 text-amber-400" />,
      title: "Link expirado",
      subtitle: "Este link de confirmação expirou. Solicite um novo na página de inscrição.",
      color: "text-amber-400",
    },
    invalid: {
      icon: <XCircle className="w-10 h-10 text-red-400" />,
      title: "Link inválido",
      subtitle: "Não foi possível confirmar sua inscrição. Verifique o e-mail e tente novamente.",
      color: "text-red-400",
    },
  };

  const cfg = configs[status];

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="glass-panel border border-white/10 bg-[#0D1F3C]/80 rounded-2xl p-10">
          <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-primary rounded-full mb-8 -mx-10 -mt-10" />

          <div className="flex justify-center mb-6">{cfg.icon}</div>
          <h1 className={`text-2xl font-bold mb-3 ${cfg.color}`}>{cfg.title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{cfg.subtitle}</p>

          {(status === "success") && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-emerald-300 text-sm font-medium mb-1">✅ Próximos passos</p>
              <ul className="text-emerald-400/70 text-sm space-y-1">
                <li>• Acesse a página de Minicursos para garantir sua vaga</li>
                <li>• Compareça ao evento em 09 de julho de 2026</li>
                <li>• Seus certificados ficarão disponíveis após o evento</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {(status === "success" || status === "used") && (
              <Link href="/minicursos">
                <Button className="w-full">Ver Minicursos</Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:text-white">
                Voltar ao início
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-600">Conecta Orto 2026 — UnDF Jorge Amaury, Brasília — DF</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
