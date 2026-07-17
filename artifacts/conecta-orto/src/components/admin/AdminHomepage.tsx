import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FIELDS = [
  { key: "title", label: "Título principal", placeholder: "Conecta Orto 2026" },
  { key: "subtitle", label: "Subtítulo", placeholder: "O Futuro dos Implantes Ortopédicos" },
  { key: "description", label: "Descrição do evento", placeholder: "Texto de apresentação...", multiline: true },
  { key: "event_date", label: "Data do evento", placeholder: "09 de Julho de 2026" },
  { key: "event_time", label: "Horário do evento", placeholder: "08:00 – 18:00" },
  { key: "event_location", label: "Local", placeholder: "UnDF Jorge Amaury, Lago Norte, Brasília — DF" },
  { key: "event_address", label: "Endereço completo", placeholder: "..." },
  { key: "registration_open", label: "Inscrições abertas?", placeholder: "true ou false" },
  { key: "registration_message", label: "Mensagem de inscrição", placeholder: "Ex: Inscrições encerradas." },
  { key: "contact_email", label: "E-mail de contato", placeholder: "contato@conectaorto.com.br" },
  { key: "contact_phone", label: "Telefone de contato", placeholder: "+55 61 99999-9999" },
  { key: "notice", label: "Aviso no topo (deixe vazio para ocultar)", placeholder: "Ex: Vagas limitadas!" },
  { key: "institutional_text", label: "Texto institucional", placeholder: "UnDF — Universidade do Distrito Federal...", multiline: true },
];

export default function AdminHomepage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api.get<Record<string, string>>("/homepage").then(data => {
      setContent(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/homepage", content);
      toast({ title: "Conteúdo da página inicial atualizado" });
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Edite o conteúdo da página inicial. As alterações aparecem imediatamente no site.
        </p>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <Card
            key={field.key}
            className={`glass-panel border-white/10 bg-white/5 ${field.multiline ? "md:col-span-2" : ""}`}
          >
            <CardContent className="pt-4">
              <Label className="text-xs text-gray-400 uppercase tracking-wider">{field.label}</Label>
              {field.multiline ? (
                <textarea
                  value={content[field.key] ?? ""}
                  onChange={(e) => setContent((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full mt-2 bg-black/20 border border-white/10 rounded-md text-white text-sm p-2 resize-y focus:outline-none focus:border-primary placeholder:text-gray-600"
                />
              ) : (
                <Input
                  value={content[field.key] ?? ""}
                  onChange={(e) => setContent((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="mt-2 bg-black/20 border-white/10 text-white placeholder:text-gray-600"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
