import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users, BookOpen } from "lucide-react";

interface Minicourse {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  maxCapacity: number;
  type: string;
  active: boolean;
  date: string;
  time: string;
  location: string;
  workload: string;
  generatesCertificate: boolean;
  enrollmentsClosed: boolean;
  enrollmentCount: number;
}

const EMPTY: Omit<Minicourse, "id" | "enrollmentCount"> = {
  title: "", instructor: "", description: "", duration: "1h30",
  maxCapacity: 30, type: "pratico", active: true,
  date: "", time: "", location: "", workload: "4 horas",
  generatesCertificate: true, enrollmentsClosed: false,
};

export default function AdminMinicourses() {
  const [courses, setCourses] = useState<Minicourse[]>([]);
  const [editTarget, setEditTarget] = useState<Minicourse | Partial<Minicourse> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Minicourse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Minicourse[]>("/minicourses/all");
    setCourses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/admin/minicourses/${deleteTarget.id}`);
    toast({ title: "Minicurso excluído" });
    setDeleteTarget(null);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditTarget({ ...EMPTY })} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Minicurso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c) => {
          const pct = Math.round((c.enrollmentCount / c.maxCapacity) * 100);
          return (
            <Card key={c.id} className={`glass-panel border-white/10 ${c.active ? "bg-white/5" : "bg-white/2 opacity-60"}`}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{c.title}</p>
                    <p className="text-sm text-gray-400 truncate">{c.instructor}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="secondary" className={c.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400"}>
                      {c.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>{c.workload}</span>
                  {c.date && <span>{c.date} {c.time && `às ${c.time}`}</span>}
                  {c.location && <span>📍 {c.location}</span>}
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrollmentCount}/{c.maxCapacity} inscritos</span>
                  <span className="text-xs text-gray-500">{pct}%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 mb-4">
                  <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-white/10 text-gray-300 flex-1" onClick={() => setEditTarget(c)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {courses.length === 0 && (
          <div className="col-span-2 text-center text-gray-600 py-16">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nenhum minicurso cadastrado</p>
          </div>
        )}
      </div>

      {editTarget !== null && (
        <MinicourseDialog
          initial={editTarget as Partial<Minicourse>}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="bg-[#0D1F3C] border-white/10 text-white">
            <DialogHeader><DialogTitle>Excluir minicurso</DialogTitle></DialogHeader>
            <p className="text-gray-300">Excluir <strong>{deleteTarget.title}</strong>? Todas as inscrições serão removidas.</p>
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

function MinicourseDialog({
  initial, onClose, onSaved,
}: {
  initial: Partial<Minicourse>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isEdit = !!initial.id;

  const set = (key: keyof typeof form, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const save = async () => {
    if (!form.title || !form.instructor || !form.description) {
      toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios" });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/admin/minicourses/${initial.id}`, form);
      } else {
        await api.post("/admin/minicourses", form);
      }
      toast({ title: isEdit ? "Minicurso atualizado" : "Minicurso criado" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally {
      setSaving(false);
    }
  };

  const tf = (key: keyof typeof form, label: string) => (
    <div key={key}>
      <Label className="text-xs text-gray-400">{label}</Label>
      <Input
        value={String(form[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
        className="bg-black/20 border-white/10 text-white mt-1"
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1F3C] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar" : "Novo"} Minicurso</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {tf("title", "Título *")}
          {tf("instructor", "Professor/Instrutor *")}
          <div>
            <Label className="text-xs text-gray-400">Descrição *</Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full mt-1 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 resize-none focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {tf("duration", "Duração (ex: 1h30)")}
            {tf("workload", "Carga horária (ex: 4 horas)")}
            {tf("date", "Data")}
            {tf("time", "Horário")}
            {tf("location", "Local")}
            <div>
              <Label className="text-xs text-gray-400">Vagas máximas</Label>
              <Input
                type="number"
                value={form.maxCapacity}
                onChange={(e) => set("maxCapacity", Number(e.target.value))}
                className="bg-black/20 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} id="active" />
              <Label htmlFor="active" className="text-sm text-gray-300">Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.generatesCertificate} onCheckedChange={(v) => set("generatesCertificate", v)} id="cert" />
              <Label htmlFor="cert" className="text-sm text-gray-300">Gera certificado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.enrollmentsClosed} onCheckedChange={(v) => set("enrollmentsClosed", v)} id="closed" />
              <Label htmlFor="closed" className="text-sm text-gray-300">Inscrições encerradas</Label>
            </div>
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
