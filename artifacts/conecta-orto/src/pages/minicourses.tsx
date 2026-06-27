import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, Users, FlaskConical, BookOpen, Wrench, Monitor, HeartPulse } from "lucide-react";

interface MinicourseItem {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  type: string;
  capacity: number;
  created_at: string;
  enrollment_count: number;
}

export default function Minicourses() {
  const { toast } = useToast();

  const [minicourses, setMinicourses] = useState<MinicourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [modalStep, setModalStep] = useState<"email" | "confirm">("email");
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [registrationName, setRegistrationName] = useState("");
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isLookupPending, setIsLookupPending] = useState(false);
  const [isEnrollmentPending, setIsEnrollmentPending] = useState(false);

  const handleEnrollClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setEmail("");
    setModalStep("email");
    setRegistrationId(null);
    setRegistrationName("");
    setEnrollmentError(null);
  };

  const handleLookup = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Erro", description: "Informe seu e-mail." });
      return;
    }

    setIsLookupPending(true);

    const { data, error } = await supabase
      .from("registrations")
      .select("id, name")
      .eq("email", email)
      .single();

    setIsLookupPending(false);

    if (error) {
      console.error(error);
      const message = "Você precisa se inscrever no evento primeiro.";
      setEnrollmentError(message);
      toast({ variant: "destructive", title: "Cadastro não encontrado", description: message });
      return;
    }

    setRegistrationId(data.id);
    setRegistrationName(data.name);
    setModalStep("confirm");
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedCourseId || !registrationId) return;
    setIsEnrollmentPending(true);

    const { error } = await supabase
      .from("enrollments")
      .insert({ registration_id: registrationId, minicourse_id: selectedCourseId });

    setIsEnrollmentPending(false);

    if (error) {
      console.error(error);
      const message = error.message || "Erro ao realizar matrícula.";
      setEnrollmentError(message);
      toast({ variant: "destructive", title: "Erro na matrícula", description: message });
      return;
    }

    toast({ title: "Matrícula confirmada!", description: "Você foi matriculado no minicurso com sucesso." });
    setSelectedCourseId(null);
    setEmail("");
    setRegistrationId(null);
    setRegistrationName("");
    await loadMinicourses();
  };

  async function loadMinicourses() {
    setIsLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("minicourses")
      .select("*, enrollments(minicourse_id)");

    if (error) {
      console.error(error);
      setLoadError(error.message || "Erro ao carregar minicursos.");
      setIsLoading(false);
      return;
    }

    const courses: MinicourseItem[] = (data ?? []).map((item: any) => ({
      id: item.id,
      title: item.title,
      instructor: item.instructor,
      duration: item.duration,
      type: item.type ?? "pratico",
      capacity: item.max_capacity ?? item.maxCapacity ?? 0,
      created_at: item.created_at,
      enrollment_count: item.enrollments?.length ?? 0,
    }));

    setMinicourses(courses);
    setIsLoading(false);
  }

  useEffect(() => {
    loadMinicourses();
  }, []);

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
        ) : loadError ? (
          <div className="max-w-2xl mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center text-red-100">
            <p className="font-semibold mb-2">Erro ao carregar minicursos</p>
            <p>{loadError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {minicourses?.map((course) => {
              const percentage = course.capacity ? Math.round((course.enrollment_count / course.capacity) * 100) : 0;
              const isFull = course.enrollment_count >= course.capacity;
              const TYPE_MAP: Record<string, { label: string; color: string; Icon: any }> = {
                teoria:      { label: "Teórico",    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",    Icon: BookOpen },
                pratico:     { label: "Prático",    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", Icon: Wrench },
                tecnologia:  { label: "Tecnologia", color: "bg-violet-500/15 text-violet-300 border-violet-500/30",  Icon: Monitor },
                clinico:     { label: "Clínico",    color: "bg-pink-500/15 text-pink-300 border-pink-500/30",       Icon: HeartPulse },
                laboratorio: { label: "Lab",        color: "bg-amber-500/15 text-amber-300 border-amber-500/30",    Icon: FlaskConical },
              };
              const typeInfo = TYPE_MAP[course.type] ?? TYPE_MAP["pratico"];

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="h-full flex flex-col glass-panel border-white/10 bg-[#0D1F3C]/50 hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                        <Badge className={`border text-xs font-medium ${typeInfo.color}`}>
                          <typeInfo.Icon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        <Badge variant={isFull ? "destructive" : "outline"} className={!isFull ? "border-emerald-500/40 text-emerald-400 text-xs" : "text-xs"}>
                          {isFull ? "Esgotado" : "Vagas Abertas"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-white leading-snug">{course.title}</CardTitle>
                      <CardDescription className="text-gray-400 mt-2 line-clamp-3">
                        Instrutor: {course.instructor}
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
                            <span className="font-medium text-white">{course.enrollment_count} / {course.capacity}</span>
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
                  disabled={isLookupPending}
                >
                  {isLookupPending ? "Buscando..." : "Continuar"}
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
                  disabled={isEnrollmentPending}
                >
                  {isEnrollmentPending ? "Confirmando..." : "Confirmar Matrícula"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
