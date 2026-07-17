import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Mic, Linkedin } from "lucide-react";

interface Speaker {
  id: number;
  name: string;
  title: string;
  institution: string;
  bio: string;
  talkTopic: string;
  talkDate: string;
  talkTime: string;
  linkedinUrl?: string | null;
  photoUrl?: string | null;
  displayOrder: number;
  active: boolean;
}

const EMPTY: Omit<Speaker, "id"> = {
  name: "", title: "", institution: "", bio: "", talkTopic: "",
  talkDate: "", talkTime: "", linkedinUrl: "", photoUrl: "",
  displayOrder: 0, active: true,
};

export default function AdminSpeakers() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [editTarget, setEditTarget] = useState<Partial<Speaker> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Speaker | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Speaker[]>("/speakers/all");
    setSpeakers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/admin/speakers/${deleteTarget.id}`);
    toast({ title: "Palestrante excluído" });
    setDeleteTarget(null);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditTarget({ ...EMPTY })} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Palestrante
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {speakers.map((s) => (
          <Card key={s.id} className={`glass-panel border-white/10 ${s.active ? "bg-white/5" : "bg-white/2 opacity-60"}`}>
            <CardContent className="pt-5">
              <div className="flex items-start gap-4">
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt={s.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{s.name}</p>
                  <p className="text-sm text-gray-400 truncate">{s.title}</p>
                  {s.institution && <p className="text-xs text-gray-500 truncate">{s.institution}</p>}
                </div>
                <Badge className={s.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400"}>
                  {s.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              {s.talkTopic && (
                <p className="text-sm text-gray-400 mt-3 line-clamp-2">🎤 {s.talkTopic}</p>
              )}
              {(s.talkDate || s.talkTime) && (
                <p className="text-xs text-gray-500 mt-1">{s.talkDate} {s.talkTime && `às ${s.talkTime}`}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="border-white/10 text-gray-300 flex-1" onClick={() => setEditTarget(s)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                {s.linkedinUrl && (
                  <Button size="sm" variant="outline" className="border-white/10 text-blue-400" asChild>
                    <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="w-3.5 h-3.5" /></a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => setDeleteTarget(s)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {speakers.length === 0 && (
          <div className="col-span-2 text-center text-gray-600 py-16">
            <Mic className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nenhum palestrante cadastrado</p>
          </div>
        )}
      </div>

      {editTarget !== null && (
        <SpeakerDialog initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="bg-[#0D1F3C] border-white/10 text-white">
            <DialogHeader><DialogTitle>Excluir palestrante</DialogTitle></DialogHeader>
            <p className="text-gray-300">Excluir <strong>{deleteTarget.name}</strong>?</p>
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

function SpeakerDialog({ initial, onClose, onSaved }: { initial: Partial<Speaker>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isEdit = !!initial.id;

  const set = (k: keyof typeof form, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name) { toast({ variant: "destructive", title: "Nome obrigatório" }); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/admin/speakers/${initial.id}`, form);
      else await api.post("/admin/speakers", form);
      toast({ title: isEdit ? "Palestrante atualizado" : "Palestrante criado" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally { setSaving(false); }
  };

  const tf = (key: keyof typeof form, label: string, placeholder?: string) => (
    <div key={key}>
      <Label className="text-xs text-gray-400">{label}</Label>
      <Input value={String(form[key] ?? "")} onChange={e => set(key, e.target.value)} placeholder={placeholder} className="bg-black/20 border-white/10 text-white mt-1" />
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1F3C] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar" : "Novo"} Palestrante</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {tf("name", "Nome *")}
          {tf("title", "Cargo/Especialidade")}
          {tf("institution", "Instituição")}
          <div>
            <Label className="text-xs text-gray-400">Biografia</Label>
            <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} className="w-full mt-1 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 resize-none focus:outline-none focus:border-primary" />
          </div>
          {tf("talkTopic", "Tema da palestra")}
          <div className="grid grid-cols-2 gap-3">
            {tf("talkDate", "Data")}
            {tf("talkTime", "Horário")}
          </div>
          {tf("linkedinUrl", "LinkedIn ou link profissional")}
          {tf("photoUrl", "URL da foto")}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400">Ordem de exibição</Label>
              <Input type="number" value={form.displayOrder} onChange={e => set("displayOrder", Number(e.target.value))} className="bg-black/20 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={form.active} onCheckedChange={v => set("active", v)} id="spk-active" />
            <Label htmlFor="spk-active" className="text-sm text-gray-300">Ativo</Label>
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
