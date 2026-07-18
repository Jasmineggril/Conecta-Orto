import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, Users, FlaskConical, BookOpen, Wrench, Monitor, HeartPulse, CheckCircle2, RefreshCw } from "lucide-react";
import { useUser } from "@/lib/user-context";

interface MinicourseItem {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  type: string;
  maxCapacity: number;
  enrollmentCount: number;
  enrollmentsClosed: boolean;
  date: string;
  time: string;
  location: string;
}

const TYPE_MAP: Record<string, { label: string; color: string; Icon: any }> = {
  teoria:      { label: "Teórico",    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",         Icon: BookOpen },
  pratico:     { label: "Prático",    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", Icon: Wrench },
  tecnologia:  { label: "Tecnologia", color: "bg-violet-500/15 text-violet-300 border-violet-500/30",   Icon: Monitor },
  clinico:     { label: "Clínico",    color: "bg-pink-500/15 text-pink-300 border-pink-500/30",         Icon: HeartPulse },
  laboratorio: { label: "Lab",        color: "bg-amber-500/15 text-amber-300 border-amber-500/30",      Icon: FlaskConical },
};

export default function Minicourses() {
  const { toast } = useToast();
  const { user, setUser } = useUser();

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
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());

  async function loadMinicourses() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.get<MinicourseItem[]>("/minicourses");
      setMinicourses(data);
    } catch (err: any) {
      console.error(err);
      setLoadError(err?.message ?? "Erro ao carregar minicursos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUserEnrollments(userId: number) {
    try {
      const reg = await api.get<{ enrollments: { minicourseId: number }[] }>(`/registrations/by-id/${userId}`);
      if (reg?.enrollments) {
        setEnrolledCourseIds(new Set(reg.enrollments.map((e) => e.minicourseId)));
      }
    } catch {
      // silently ignore — not critical
    }
  }

  useEffect(() => {
    loadMinicourses();
    if (user?.id) loadUserEnrollments(user.id);
  }, [user?.id]);

  const handleEnrollClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setEnrollmentError(null);
    if (user) {
      setEmail(user.email);
      setRegistrationId(user.id);
      setRegistrationName(user.name);
      setModalStep("confirm");
    } else {
      setEmail("");
      setRegistrationId(null);
      setRegistrationName("");
      setModalStep("email");
    }
  };

  const handleLookup = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Erro", description: "Informe seu e-mail." });
      return;
    }
    setIsLookupPending(true);
    try {
      const reg = await api.post<{ id: number; name: string }>("/registrations/lookup", { email });
      setRegistrationId(reg.id);
      setRegistrationName(reg.name);
      setModalStep("confirm");
      setUser({ id: reg.id, name: reg.name, email });
    } catch (err: any) {
      const message = err?.message ?? "Você precisa se inscrever no evento primeiro.";
      setEnrollmentError(message);
      toast({ variant: "destructive", title: "Cadastro não encontrado", description: message });
    } finally {
      setIsLookupPending(false);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedCourseId || !registrationId) return;
    setIsEnrollmentPending(true);
    try {
      await api.post("/enrollments", { registrationId, minicourseId: selectedCourseId });
      toast({ title: "Matrícula confirmada!", description: "Você foi matriculado com sucesso." });
      setEnrolledCourseIds((prev) => new Set(prev).add(selectedCourseId));
      setSelectedCourseId(null);
      setEmail("");
      setRegistrationId(null);
      setRegistrationName("");
      await loadMinicourses();
    } catch (err: any) {
      const message = err?.message ?? "Erro ao realizar matrícula.";
      setEnrollmentError(message);
      toast({ variant: "destructive", title: "Erro na matrícula", description: message });
    } finally {
      setIsEnrollmentPending(false);
    }
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
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Carregando minicursos...</p>
          </div>
        ) : loadError ? (
          <div className="max-w-2xl mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center text-red-100">
            <p className="font-semibold text-lg mb-2">Erro ao carregar minicursos</p>
            <p className="text-sm text-red-300 mb-6">{loadError}</p>
            <Button variant="outline" onClick={loadMinicourses} className="gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10">
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {minicourses.map((course) => {
              const percentage = course.maxCapacity ? Math.round((course.enrollmentCount / course.maxCapacity) * 100) : 0;
              const isFull = course.enrollmentCount >= course.maxCapacity || course.enrollmentsClosed;
              const typeInfo = TYPE_MAP[course.type] ?? TYPE_MAP["pratico"];
              const isEnrolled = enrolledCourseIds.has(course.id);

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
                        <Badge
                          variant={isFull ? "destructive" : "outline"}
                          className={!isFull ? "border-emerald-500/40 text-emerald-400 text-xs" : "text-xs"}
                        >
                          {isFull ? "Esgotado" : "Vagas Abertas"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-white leading-snug">{course.title}</CardTitle>
                      <CardDescription className="text-gray-400 mt-2 line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-300">
                          <User className="w-4 h-4 mr-2 text-primary shrink-0" />
                          <span>Instrutor: <strong>{course.instructor}</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-primary shrink-0" />
                          <span>Duração: {course.duration}</span>
                        </div>
                        {course.date && (
                          <div className="flex items-center text-sm text-gray-300">
                            <span className="w-4 h-4 mr-2 text-primary text-center shrink-0">📅</span>
                            <span>{course.date}{course.time ? ` — ${course.time}` : ""}</span>
                          </div>
                        )}
                        {course.location && (
                          <div className="flex items-center text-sm text-gray-300">
                            <span className="w-4 h-4 mr-2 text-primary text-center shrink-0">📍</span>
                            <span>{course.location}</span>
                          </div>
                        )}
                        <div className="pt-3 mt-3 border-t border-white/10">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Users className="w-4 h-4" /> Vagas preenchidas
                            </span>
                            <span className="font-medium text-white">
                              {course.enrollmentCount} / {course.maxCapacity}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2 bg-black/40" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        disabled={isFull || isEnrolled}
                        onClick={() => handleEnrollClick(course.id)}
                        variant={isEnrolled ? "outline" : "default"}
                      >
                        {isEnrolled ? "✓ Inscrito" : isFull ? "Esgotado" : "Garantir Vaga"}
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
                {modalStep === "email"
                  ? "Identifique-se com o e-mail usado na inscrição do congresso."
                  : "Confirme sua matrícula."}
              </DialogDescription>
            </DialogHeader>

            {enrollmentError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
                {enrollmentError}
              </div>
            )}

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
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <Button className="w-full" onClick={handleLookup} disabled={isLookupPending}>
                  {isLookupPending ? "Buscando..." : "Continuar"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-black/20 border border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Inscrição encontrada para:</p>
                  <p className="font-bold text-lg text-white">{registrationName}</p>
                </div>
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Você pode se inscrever em quantos minicursos quiser!
                </p>
                <Button className="w-full" onClick={handleConfirmEnrollment} disabled={isEnrollmentPending}>
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
