import { useState } from "react";
import { motion } from "framer-motion";
import { useGetMinicourses, useLookupRegistration, useCreateEnrollment, getGetMinicoursesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Minicourses() {
  const { data: minicourses, isLoading } = useGetMinicourses();
  const lookupRegistration = useLookupRegistration();
  const createEnrollment = useCreateEnrollment();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [modalStep, setModalStep] = useState<"email" | "confirm">("email");
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [registrationName, setRegistrationName] = useState("");

  const handleEnrollClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setEmail("");
    setModalStep("email");
    setRegistrationId(null);
  };

  const handleLookup = () => {
    if (!email) {
      toast({ variant: "destructive", title: "Erro", description: "Informe seu e-mail." });
      return;
    }

    lookupRegistration.mutate(
      { data: { email } },
      {
        onSuccess: (data) => {
          setRegistrationId(data.id);
          setRegistrationName(data.name);
          setModalStep("confirm");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Registro não encontrado",
            description: "Não encontramos uma inscrição com este e-mail. Faça sua inscrição primeiro.",
          });
        },
      }
    );
  };

  const handleConfirmEnrollment = () => {
    if (!selectedCourseId || !registrationId) return;

    createEnrollment.mutate(
      { data: { minicourseId: selectedCourseId, registrationId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMinicoursesQueryKey() });
          toast({
            title: "Matrícula confirmada!",
            description: "Você foi matriculado no minicurso com sucesso.",
          });
          setSelectedCourseId(null);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Erro na matrícula",
            description: error.error || "Você já está matriculado neste ou em outro minicurso.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-12 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Minicursos Práticos</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Aprofunde seus conhecimentos técnicos. As vagas são limitadas e acontecem simultaneamente, então escolha com sabedoria.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {minicourses?.map((course) => {
              const percentage = Math.round((course.enrollmentCount / course.maxCapacity) * 100);
              const isFull = course.enrollmentCount >= course.maxCapacity;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="h-full flex flex-col glass-panel border-white/10 bg-[#0D1F3C]/50">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={isFull ? "destructive" : "default"} className={!isFull ? "bg-primary text-primary-foreground" : ""}>
                          {isFull ? "Esgotado" : "Vagas Abertas"}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl text-white">{course.title}</CardTitle>
                      <CardDescription className="text-gray-400 mt-2 line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <User className="w-4 h-4 mr-2 text-primary" />
                          <span>Instrutor: <strong>{course.instructor}</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          <span>Duração: {course.duration}</span>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-white/10">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400 flex items-center gap-1"><Users className="w-4 h-4" /> Vagas preenchidas</span>
                            <span className="font-medium text-white">{course.enrollmentCount} / {course.maxCapacity}</span>
                          </div>
                          <Progress value={percentage} className="h-2 bg-black/40" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        disabled={isFull}
                        onClick={() => handleEnrollClick(course.id)}
                      >
                        {isFull ? "Lista de Espera" : "Garantir Vaga"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Enrollment Modal */}
        <Dialog open={selectedCourseId !== null} onOpenChange={(open) => !open && setSelectedCourseId(null)}>
          <DialogContent className="glass-panel border-white/10 bg-[#0D1F3C] text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Matrícula no Minicurso</DialogTitle>
              <DialogDescription className="text-gray-400">
                {modalStep === "email" ? "Identifique-se com o e-mail usado na inscrição do congresso." : "Confirme sua matrícula."}
              </DialogDescription>
            </DialogHeader>

            {modalStep === "email" ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Seu E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="joao@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleLookup}
                  disabled={lookupRegistration.isPending}
                >
                  {lookupRegistration.isPending ? "Buscando..." : "Continuar"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-black/20 border border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Inscrição encontrada para:</p>
                  <p className="font-bold text-lg text-white">{registrationName}</p>
                </div>
                <p className="text-sm text-gray-300">
                  Atenção: Você só pode se matricular em um minicurso.
                </p>
                <Button 
                  className="w-full" 
                  onClick={handleConfirmEnrollment}
                  disabled={createEnrollment.isPending}
                >
                  {createEnrollment.isPending ? "Confirmando..." : "Confirmar Matrícula"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
