import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Search, Download, Pencil, Trash2, CheckCircle2, UserCheck,
  MailCheck, Award, X, Plus, RefreshCw,
} from "lucide-react";

interface Registrant {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  profession: string;
  status: string;
  emailConfirmed: boolean;
  eventPresence: boolean;
  certificateReleased: boolean;
  createdAt: string;
  minicourses: Array<{ id: number; title: string }>;
}

interface Minicourse {
  id: number;
  title: string;
}

export default function AdminStudents() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [minicourses, setMinicourses] = useState<Minicourse[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");
  const [editTarget, setEditTarget] = useState<Registrant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registrant | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [regs, courses] = await Promise.all([
      api.get<Registrant[]>("/admin/registrants"),
      api.get<Minicourse[]>("/minicourses/all"),
    ]);
    setRegistrants(regs);
    setMinicourses(courses);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = registrants.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "confirmed" && r.emailConfirmed) ||
      (filter === "pending" && !r.emailConfirmed);
    return matchSearch && matchFilter;
  });

  const handlePresence = async (r: Registrant) => {
    await api.post(`/admin/registrants/${r.id}/presence`, { present: !r.eventPresence });
    toast({ title: !r.eventPresence ? "Presença confirmada" : "Presença removida" });
    load();
  };

  const handleConfirm = async (r: Registrant) => {
    await api.post(`/admin/registrants/${r.id}/confirm`, {});
    toast({ title: "Inscrição confirmada manualmente" });
    load();
  };

  const handleReleaseCert = async (r: Registrant) => {
    await api.post(`/admin/registrants/${r.id}/release-certificate`, { released: !r.certificateReleased });
    toast({ title: !r.certificateReleased ? "Certificado liberado" : "Certificado bloqueado" });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/admin/registrants/${deleteTarget.id}`);
    toast({ title: "Participante excluído" });
    setDeleteTarget(null);
    load();
  };

  const handleResend = async (r: Registrant) => {
    try {
      await api.post(`/registrations/${r.id}/resend-confirmation`, {});
      toast({ title: "E-mail de confirmação reenviado" });
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    }
  };

  const exportCSV = () => {
    const headers = ["Nome", "E-mail", "Telefone", "Cidade", "Profissão", "Status", "Presença", "Certificado", "Minicursos", "Data"];
    const rows = filtered.map((r) => [
      `"${r.name}"`, `"${r.email}"`, `"${r.phone}"`, `"${r.city}"`, `"${r.profession}"`,
      `"${r.emailConfirmed ? "Confirmado" : "Pendente"}"`,
      `"${r.eventPresence ? "Sim" : "Não"}"`,
      `"${r.certificateReleased ? "Liberado" : "Bloqueado"}"`,
      `"${r.minicourses.map(m => m.title).join(" / ")}"`,
      `"${format(new Date(r.createdAt), "dd/MM/yyyy HH:mm")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `participantes_${format(new Date(), "yyyyMMdd")}.csv` });
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/20 border-white/10 text-white"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "confirmed", "pending"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className={filter !== f ? "border-white/10 text-gray-400" : ""}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todos" : f === "confirmed" ? "Confirmados" : "Pendentes"}
            </Button>
          ))}
        </div>
        <Button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-700 shrink-0" size="sm">
          <Download className="w-4 h-4 mr-1" /> CSV
        </Button>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} participante{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

      <Card className="glass-panel border-white/10 bg-white/5 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">E-mail</TableHead>
                <TableHead className="text-gray-400">Cidade</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Presença</TableHead>
                <TableHead className="text-gray-400">Minicursos</TableHead>
                <TableHead className="text-gray-400">Data</TableHead>
                <TableHead className="text-gray-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{r.name}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{r.email}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{r.city}</TableCell>
                  <TableCell>
                    <Badge variant={r.emailConfirmed ? "default" : "secondary"} className={r.emailConfirmed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}>
                      {r.emailConfirmed ? "Confirmado" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={r.eventPresence ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-white/5 text-gray-500"}>
                      {r.eventPresence ? "✓ Presente" : "Ausente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {r.minicourses.length > 0 ? r.minicourses.map(m => m.title).join(", ") : "—"}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {format(new Date(r.createdAt), "dd/MM/yy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!r.emailConfirmed && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-400 hover:text-amber-300" title="Confirmar e-mail manualmente" onClick={() => handleConfirm(r)}>
                          <MailCheck className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {!r.emailConfirmed && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-white" title="Reenviar e-mail de confirmação" onClick={() => handleResend(r)}>
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className={`h-7 w-7 ${r.eventPresence ? "text-blue-400" : "text-gray-500"} hover:text-blue-300`} title="Marcar/desmarcar presença" onClick={() => handlePresence(r)}>
                        <UserCheck className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className={`h-7 w-7 ${r.certificateReleased ? "text-primary" : "text-gray-500"} hover:text-primary`} title="Liberar/bloquear certificado" onClick={() => handleReleaseCert(r)}>
                        <Award className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-white" title="Editar" onClick={() => setEditTarget(r)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-400" title="Excluir" onClick={() => setDeleteTarget(r)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="text-center text-gray-600 py-12">
                    Nenhum participante encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editTarget && (
        <EditStudentDialog
          registrant={editTarget}
          minicourses={minicourses}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="bg-[#0D1F3C] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Excluir participante</DialogTitle>
            </DialogHeader>
            <p className="text-gray-300">
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditStudentDialog({
  registrant, minicourses, onClose, onSaved,
}: {
  registrant: Registrant;
  minicourses: Minicourse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...registrant });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/registrants/${registrant.id}`, form);
      toast({ title: "Dados atualizados" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addMinicourse = async (minicourseId: number) => {
    try {
      await api.post(`/admin/registrants/${registrant.id}/enrollments`, { minicourseId });
      toast({ title: "Inscrito no minicurso" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    }
  };

  const removeMinicourse = async (minicourseId: number) => {
    await api.delete(`/admin/registrants/${registrant.id}/enrollments/${minicourseId}`);
    toast({ title: "Removido do minicurso" });
    onSaved();
  };

  const f = (key: keyof typeof form) => ({
    value: String(form[key] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [key]: e.target.value })),
    className: "bg-black/20 border-white/10 text-white",
  });

  const notEnrolled = minicourses.filter(m => !form.minicourses.some(e => e.id === m.id));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1F3C] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar participante</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {(["name", "email", "phone", "city", "profession"] as const).map((key) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{
                key === "name" ? "Nome" : key === "email" ? "E-mail" : key === "phone" ? "Telefone" : key === "city" ? "Cidade" : "Profissão"
              }</label>
              <Input {...f(key)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Minicursos inscritos</label>
            <div className="flex flex-wrap gap-2">
              {form.minicourses.map(m => (
                <Badge key={m.id} className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1 pr-1">
                  {m.title}
                  <button onClick={() => removeMinicourse(m.id)} className="ml-1 hover:text-red-400"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
              {form.minicourses.length === 0 && <span className="text-gray-600 text-sm">Nenhum</span>}
            </div>
            {notEnrolled.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Adicionar a minicurso:</p>
                <div className="flex flex-wrap gap-1">
                  {notEnrolled.map(m => (
                    <Button key={m.id} size="sm" variant="outline" className="h-7 text-xs border-white/10 text-gray-300" onClick={() => addMinicourse(m.id)}>
                      <Plus className="w-3 h-3 mr-1" />{m.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" className="border-white/10" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
