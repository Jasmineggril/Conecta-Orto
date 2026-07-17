import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Plus, XCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface CertRecord {
  id: number;
  type: "event" | "minicourse";
  validationCode: string;
  workload: string;
  status: string;
  issuedAt: string;
  registrationId: number;
  minicourseId?: number;
  name: string;
  email: string;
  minicourseTitle?: string;
}

interface Registrant {
  id: number;
  name: string;
  email: string;
  emailConfirmed: boolean;
  eventPresence: boolean;
  certificateReleased: boolean;
}

interface Minicourse {
  id: number;
  title: string;
  workload: string;
  generatesCertificate: boolean;
}

export default function AdminCertificates() {
  const [certs, setCerts] = useState<CertRecord[]>([]);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [minicourses, setMinicourses] = useState<Minicourse[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [c, r, m] = await Promise.all([
      api.get<CertRecord[]>("/admin/certificates"),
      api.get<Registrant[]>("/admin/registrants"),
      api.get<Minicourse[]>("/minicourses/all"),
    ]);
    setCerts(c);
    setRegistrants(r);
    setMinicourses(m);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (cert: CertRecord) => {
    const newStatus = cert.status === "ativo" ? "cancelado" : "ativo";
    await api.put(`/admin/certificates/${cert.id}/status`, { status: newStatus });
    toast({ title: newStatus === "ativo" ? "Certificado reativado" : "Certificado cancelado" });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{certs.length} certificado{certs.length !== 1 ? "s" : ""} gerado{certs.length !== 1 ? "s" : ""}</p>
        <Button onClick={() => setShowGenerate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Gerar Certificado
        </Button>
      </div>

      <Card className="glass-panel border-white/10 bg-white/5 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Participante</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Minicurso</TableHead>
                <TableHead className="text-gray-400">Carga</TableHead>
                <TableHead className="text-gray-400">Código</TableHead>
                <TableHead className="text-gray-400">Emissão</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map((c) => (
                <TableRow key={c.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-gray-500 text-xs">{c.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={c.type === "event" ? "bg-primary/20 text-primary border-primary/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"}>
                      {c.type === "event" ? "Evento" : "Minicurso"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">{c.minicourseTitle ?? "—"}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{c.workload}</TableCell>
                  <TableCell>
                    <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-mono">{c.validationCode.slice(0, 8)}...</code>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {format(new Date(c.issuedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge className={c.status === "ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                      {c.status === "ativo" ? "Ativo" : "Cancelado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatus(c)}
                      className={c.status === "ativo" ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"}
                    >
                      {c.status === "ativo" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {certs.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="text-center text-gray-600 py-12">
                    <Award className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>Nenhum certificado gerado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showGenerate && (
        <GenerateDialog
          registrants={registrants}
          minicourses={minicourses}
          onClose={() => setShowGenerate(false)}
          onSaved={() => { setShowGenerate(false); load(); }}
        />
      )}
    </div>
  );
}

function GenerateDialog({
  registrants, minicourses, onClose, onSaved,
}: {
  registrants: Registrant[];
  minicourses: Minicourse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [registrationId, setRegistrationId] = useState<number | "">("");
  const [type, setType] = useState<"event" | "minicourse">("event");
  const [minicourseId, setMinicourseId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const certMinicourses = minicourses.filter(m => m.generatesCertificate);

  const generate = async () => {
    if (!registrationId) { toast({ variant: "destructive", title: "Selecione um participante" }); return; }
    if (type === "minicourse" && !minicourseId) { toast({ variant: "destructive", title: "Selecione um minicurso" }); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { registrationId: Number(registrationId), type };
      if (type === "minicourse" && minicourseId) {
        payload.minicourseId = Number(minicourseId);
        const mc = minicourses.find(m => m.id === Number(minicourseId));
        payload.workload = mc?.workload ?? "4 horas";
      }
      await api.post("/admin/certificates/generate", payload);
      toast({ title: "Certificado gerado com sucesso" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1F3C] border-white/10 text-white max-w-md">
        <DialogHeader><DialogTitle>Gerar Certificado</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Participante</label>
            <select
              value={registrationId}
              onChange={e => setRegistrationId(Number(e.target.value))}
              className="w-full mt-1 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 focus:outline-none focus:border-primary"
            >
              <option value="" className="bg-[#0D1F3C]">Selecione...</option>
              {registrants.map(r => (
                <option key={r.id} value={r.id} className="bg-[#0D1F3C]">{r.name} ({r.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            {(["event", "minicourse"] as const).map(t => (
              <Button
                key={t}
                type="button"
                variant={type === t ? "default" : "outline"}
                className={type !== t ? "border-white/10 text-gray-400 flex-1" : "flex-1"}
                onClick={() => setType(t)}
              >
                {t === "event" ? "Evento" : "Minicurso"}
              </Button>
            ))}
          </div>
          {type === "minicourse" && (
            <div>
              <label className="text-xs text-gray-400">Minicurso</label>
              <select
                value={minicourseId}
                onChange={e => setMinicourseId(Number(e.target.value))}
                className="w-full mt-1 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 focus:outline-none focus:border-primary"
              >
                <option value="" className="bg-[#0D1F3C]">Selecione...</option>
                {certMinicourses.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0D1F3C]">{m.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" className="border-white/10" onClick={onClose}>Cancelar</Button>
          <Button onClick={generate} disabled={saving}>{saving ? "Gerando..." : "Gerar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
