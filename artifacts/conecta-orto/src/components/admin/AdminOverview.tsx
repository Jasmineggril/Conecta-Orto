import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle2, Clock, Award, Mic, BookOpen } from "lucide-react";

interface Stats {
  totalRegistrants: number;
  confirmed: number;
  pending: number;
  speakerCount: number;
  certCount: number;
  minicourseEnrollments: Array<{
    id: number;
    title: string;
    enrollmentCount: number;
    maxCapacity: number;
    active: boolean;
  }>;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;
  }

  const statCards = [
    { label: "Total Inscritos", value: stats.totalRegistrants, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "E-mails Confirmados", value: stats.confirmed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Palestrantes", value: stats.speakerCount, icon: Mic, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Certificados Gerados", value: stats.certCount, icon: Award, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="glass-panel border-white/10 bg-white/5">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-panel border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Vagas por Minicurso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.minicourseEnrollments.map((c) => {
            const pct = Math.round((c.enrollmentCount / c.maxCapacity) * 100);
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300 truncate max-w-[70%]" title={c.title}>
                    {c.title}
                    {!c.active && <span className="ml-2 text-xs text-gray-600">(inativo)</span>}
                  </span>
                  <span className="text-sm text-gray-400 ml-2 shrink-0">
                    {c.enrollmentCount} / {c.maxCapacity} vagas
                  </span>
                </div>
                <Progress
                  value={pct}
                  className="h-2 bg-black/40"
                />
              </div>
            );
          })}
          {stats.minicourseEnrollments.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-4">Nenhum minicurso cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
