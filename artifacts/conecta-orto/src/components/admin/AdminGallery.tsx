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
import { Plus, Pencil, Trash2, Image, Eye, EyeOff } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  altText: string;
  imageUrl: string;
  category: string;
  displayOrder: number;
  active: boolean;
}

const EMPTY: Omit<GalleryItem, "id"> = {
  title: "", caption: "", altText: "", imageUrl: "",
  category: "geral", displayOrder: 0, active: true,
};

const CATEGORIES = ["geral", "palestras", "minicursos", "abertura", "encerramento", "equipe"];

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editTarget, setEditTarget] = useState<Partial<GalleryItem> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<GalleryItem[]>("/gallery/all");
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (item: GalleryItem) => {
    await api.put(`/admin/gallery/${item.id}`, { ...item, active: !item.active });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/admin/gallery/${deleteTarget.id}`);
    toast({ title: "Imagem removida" });
    setDeleteTarget(null);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">{items.length} imagem{items.length !== 1 ? "s" : ""} na galeria</p>
        <Button onClick={() => setEditTarget({ ...EMPTY })} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Imagem
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <Card key={item.id} className={`glass-panel border-white/10 overflow-hidden ${!item.active ? "opacity-50" : ""}`}>
            <div className="relative aspect-video bg-black/40">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.altText || item.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = ""; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-600" />
                </div>
              )}
              {!item.active && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <CardContent className="pt-3 pb-3 px-3">
              {item.title && <p className="text-white text-sm font-medium truncate">{item.title}</p>}
              {item.caption && <p className="text-gray-500 text-xs truncate">{item.caption}</p>}
              <div className="flex items-center justify-between mt-2">
                <Badge className="text-xs bg-white/5 text-gray-400 border-white/10">{item.category}</Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400" onClick={() => toggleActive(item)} title={item.active ? "Ocultar" : "Mostrar"}>
                    {item.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400" onClick={() => setEditTarget(item)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="col-span-4 text-center text-gray-600 py-16">
            <Image className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nenhuma imagem na galeria</p>
          </div>
        )}
      </div>

      {editTarget !== null && (
        <GalleryDialog initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="bg-[#0D1F3C] border-white/10 text-white">
            <DialogHeader><DialogTitle>Remover imagem</DialogTitle></DialogHeader>
            <p className="text-gray-300">Remover esta imagem da galeria?</p>
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

function GalleryDialog({ initial, onClose, onSaved }: { initial: Partial<GalleryItem>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isEdit = !!initial.id;

  const set = (k: keyof typeof form, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.imageUrl) { toast({ variant: "destructive", title: "URL da imagem obrigatória" }); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/admin/gallery/${initial.id}`, form);
      else await api.post("/admin/gallery", form);
      toast({ title: isEdit ? "Imagem atualizada" : "Imagem adicionada" });
      onSaved();
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1F3C] border-white/10 text-white max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar" : "Adicionar"} Imagem</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-400">URL da imagem *</Label>
            <Input value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          {form.imageUrl && (
            <div className="aspect-video bg-black/40 rounded-lg overflow-hidden">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          <div>
            <Label className="text-xs text-gray-400">Título</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Legenda</Label>
            <Input value={form.caption} onChange={e => set("caption", e.target.value)} className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Texto alternativo (acessibilidade)</Label>
            <Input value={form.altText} onChange={e => set("altText", e.target.value)} className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Categoria</Label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 focus:outline-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0D1F3C]">{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Ordem de exibição</Label>
            <Input type="number" value={form.displayOrder} onChange={e => set("displayOrder", Number(e.target.value))} className="bg-black/20 border-white/10 text-white mt-1" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={form.active} onCheckedChange={v => set("active", v)} id="gal-active" />
            <Label htmlFor="gal-active" className="text-sm text-gray-300">Visível na galeria</Label>
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
