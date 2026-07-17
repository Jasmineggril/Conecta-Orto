import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import { triggerSupabaseConfirmation } from "@/lib/supabase-auth";

const registrationSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  profession: z.string().min(2, "Profissão é obrigatória"),
});

export default function Registration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useUser();
  const [regCount, setRegCount] = useState<number | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      profession: "",
    },
  });

  useEffect(() => {
    const loadCount = async () => {
      const { count, error } = await supabase.from("registrations").select("id", { count: "exact", head: true });
      if (error) {
        console.error(error);
        return;
      }
      setRegCount(count ?? 0);
    };

    loadCount();
  }, []);

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    setSubmissionError(null);
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("registrations")
      .insert(values)
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      const message = error.message || "Ocorreu um erro ao processar sua inscrição. Tente novamente.";
      setSubmissionError(message);
      toast({
        variant: "destructive",
        title: "Erro na inscrição",
        description: message,
      });
      return;
    }

    setRegCount((current) => (current ?? 0) + 1);
    // Salva sessão do usuário
    if (data) setUser({ id: data.id, name: data.name, email: data.email });

    // Dispara e-mail de confirmação via Supabase Auth (não bloqueia o fluxo)
    triggerSupabaseConfirmation(
      values.email,
      values.name,
      window.location.origin,
    ).catch(console.error);

    toast({
      title: "Inscrição realizada! Verifique seu e-mail.",
      description: "Enviamos um link de confirmação para " + values.email + ". Confirme para garantir sua vaga.",
    });
    setLocation("/minicursos");
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Garanta sua Vaga</h1>
            <p className="text-gray-400">Preencha os dados abaixo para se inscrever no Conecta Orto 2026.</p>
            
            {regCount !== null && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-sm">
                <Users size={16} className="text-primary" />
                <span className="text-white font-medium">60 pessoas</span>
                <span className="text-gray-400">já confirmadas</span>
              </div>
            )}
            {submissionError && (
              <div className="mt-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200">
                <strong className="font-semibold">Erro:</strong> {submissionError}
              </div>
            )}
          </div>

          <Card className="glass-panel border-white/10 bg-[#0D1F3C]/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Dados Pessoais</CardTitle>
              <CardDescription className="text-gray-400">
                As informações serão usadas para seu crachá e certificado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. João da Silva" className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="joao@exemplo.com" className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Celular (WhatsApp)</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Cidade / Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasília, DF" className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Profissão / Especialidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-primary">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0D1F3C] border-white/10 text-white">
                              <SelectItem value="Ortopedista">Ortopedista</SelectItem>
                              <SelectItem value="Cirurgião">Cirurgião</SelectItem>
                              <SelectItem value="Residente">Residente</SelectItem>
                              <SelectItem value="Estudante">Estudante de Medicina</SelectItem>
                              <SelectItem value="Outros">Outros Profissionais</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6 mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processando..." : "Confirmar Inscrição"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
