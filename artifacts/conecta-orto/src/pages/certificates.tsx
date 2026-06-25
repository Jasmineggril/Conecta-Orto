import { useState } from "react";
import { motion } from "framer-motion";
import { useLookupRegistration } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RegistrationWithEnrollments } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Certificates() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<RegistrationWithEnrollments | null>(null);
  const lookupRegistration = useLookupRegistration();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    lookupRegistration.mutate(
      { data: { email } },
      {
        onSuccess: (res) => {
          setData(res);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Não encontrado",
            description: "Nenhum certificado encontrado para este e-mail.",
          });
          setData(null);
        },
      }
    );
  };

  const handleDownload = (type: string) => {
    toast({
      title: "Download iniciado",
      description: `Gerando certificado ${type}...`,
    });
    // In a real app, this would trigger a PDF download
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12 relative">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Certificados</h1>
          <p className="text-gray-400">
            Digite o e-mail cadastrado na sua inscrição para acessar seus certificados de participação e minicursos.
          </p>
        </motion.div>

        <Card className="glass-panel border-white/10 bg-[#0D1F3C]/50 mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Seu e-mail de inscrição"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10 text-white h-12"
                />
              </div>
              <Button type="submit" className="h-12 px-8" disabled={lookupRegistration.isPending}>
                {lookupRegistration.isPending ? "Buscando..." : "Buscar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Certificados Disponíveis para {data.name}</h3>
            
            {/* Main Congress Certificate */}
            <Card className="glass-panel border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="text-primary w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-white">Certificado de Participação</CardTitle>
                  <CardDescription className="text-gray-300">Conecta Orto 2025 - Carga Horária: 10h</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={() => handleDownload("Geral")}>
                  <Download className="w-4 h-4 mr-2" /> Baixar PDF
                </Button>
              </CardContent>
            </Card>

            {/* Minicourse Certificates */}
            {data.enrollments.map((enrollment) => (
              <Card key={enrollment.minicourseId} className="glass-panel border-white/10 bg-white/5">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Award className="text-gray-300 w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Minicurso: {enrollment.title}</CardTitle>
                    <CardDescription className="text-gray-400">Instrutor: {enrollment.instructor} - Carga Horária: 4h</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={() => handleDownload(`Minicurso ${enrollment.minicourseId}`)}>
                    <Download className="w-4 h-4 mr-2" /> Baixar PDF
                  </Button>
                </CardContent>
              </Card>
            ))}

            {data.enrollments.length === 0 && (
              <p className="text-sm text-gray-500 text-center pt-4">Você não possui certificados de minicursos.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
