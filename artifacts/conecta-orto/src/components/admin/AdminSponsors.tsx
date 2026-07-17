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
import { Plus, Pencil, Trash2, Building2, Globe } from "lucide-react";

interface Sponsor {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  category: string;
  displayOrder: number;
  active: boolean;
}

const EMPTY: Omit<Sponsor, "id"> = {
  name: "", logoUrl: "", websiteUrl: "", category: "apoio", displayOrder: 0, active: true,
};

const CATEGORIES = [
  { value: "patrocinador_oficial", label: "Patrocinador Oficial" },
  { value: "apoio_institucional", label: "Apoio Institucional" },
  { value: "apoio", label: "Apoio" },
  { value: "realizacao", label: "Realização" },
  { value: "parceiro", label: "Parceiro" },
];

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [editTarget, setEditTarget] = useState<Partial<Sponsor> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Sponsor[]>("/sponsors/all");
    setSponsors(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/admin/sponsors/${deleteTarget.id}`);
    toast({ title: "Patrocinador removido" });
    setDeleteTarget(null);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditTarget({ ...EMPTY })} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Patrocinador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sponsors.map((s) => (
          <Card key={s.id} className={`glass-panel border-white/10 ${s.active ? "bg-white/5" : "bg-white/2 opacity-60"}`}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                {s.logoUrl ? (
                  <img src={s.logoUrl} alt={s.name} className="h-12 max-w-[100px] object-contain bg-white/5 rounded-lg p-1" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{s.name}</p>
                  <Badge className="mt-1 text-xs bg-white/5 text-gray-400 border-white/10">
                    {CATEGORIES.find(c => c.value === s.category)?.label ?? s.category}
                  </Badge>
                </div>
                <Badge className={s.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400"}>
                  {s.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex gap-2 mt-4">
                {s.websiteUrl && (
                  <Button size="sm" variant="outline" className="border-white/10 text-gray-400" asChild>
                    <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer"><Globe className="w-3.5 h-3.5 mr-1" /> Site</a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="border-white/10 text-gray-300 flex-1" onClick={() => setEditTarget(s)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => setDeleteTarget(s)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {sponsors.length === 0 && (
          <div className="col-span-2 text-center text-gray-600 py-16">
            <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nenhum patrocinador cadastrado</p>
          </div>
        )}
      </div>

      {editTarget !== null && (
        <SponsorDialog initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="bg-[#0D1F3C] border-white/10 text-white">
            <DialogHeader><DialogTitle>Remover patrocinador</DialogTitle></DialogHeader>
            <p className="text-gray-300">Remover <strong>{deleteTarget.name}</strong>?</p>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>Remover</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SponsorDialog({ initial, onClose, onSaved }: { initial: Partial<Sponsor>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isEdit = !!initial.id;

  const set = (k: keyof typeof form, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name) { toast({ variant: "destructive", title: "Nome obrigatório" }); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/admin/sponsors/${initial.id}`, form);
      else await api.post("/admin/sponsors", form);
      toast({ title: isEdit ? "Patrocinador atualizado" : "Patrocinador adicionado" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1F3C] border-white/10 text-white max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Editar" : "Adicionar"} Patrocinador</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-400">Nome *</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-400">URL do logo</Label>
            <Input value={form.logoUrl} onChange={e => set("logoUrl", e.target.value)} placeholder="https://..." className="bg-black/20 border-white/10 text-white mt-1" />
            {form.logoUrl && <img src={form.logoUrl} alt="preview" className="mt-2 h-12 object-contain bg-white/5 rounded p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          </div>
          <div>
            <Label className="text-xs text-gray-400">Site</Label>
            <Input value={form.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} placeholder="https://..." className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Categoria</Label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 focus:outline-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#0D1F3C]">{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Ordem de exibição</Label>
            <Input type="number" value={form.displayOrder} onChange={e => set("displayOrder", Number(e.target.value))} className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={form.active} onCheckedChange={v => set("active", v)} id="sp-active" />
            <Label htmlFor="sp-active" className="text-sm text-gray-300">Ativo</Label>
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
