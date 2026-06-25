import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useCreateRegistration, useGetRegistrations, getGetRegistrationsQueryKey } from "@workspace/api-client-react";
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
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { data: regCount } = useGetRegistrations();
  const createRegistration = useCreateRegistration();

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

  const onSubmit = (values: z.infer<typeof registrationSchema>) => {
    createRegistration.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRegistrationsQueryKey() });
          toast({
            title: "Inscrição realizada com sucesso!",
            description: "Você já pode se matricular nos minicursos.",
          });
          setLocation("/minicursos");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Erro na inscrição",
            description: error.error || "Ocorreu um erro ao processar sua inscrição. Tente novamente.",
          });
        },
      }
    );
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
            <p className="text-gray-400">Preencha os dados abaixo para se inscrever no Conecta Orto 2025.</p>
            
            {regCount && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-sm">
                <Users size={16} className="text-primary" />
                <span className="text-white font-medium">{regCount.count} congressistas</span>
                <span className="text-gray-400">já confirmados</span>
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
                            <Input placeholder="São Paulo, SP" className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary" {...field} />
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
                    disabled={createRegistration.isPending}
                  >
                    {createRegistration.isPending ? "Processando..." : "Confirmar Inscrição"}
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
