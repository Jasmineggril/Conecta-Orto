import { useState, useEffect } from "react";
import { 
  useAdminLogin, 
  useGetAdminStats, 
  useGetAdminRegistrants,
  getGetAdminStatsQueryKey,
  getGetAdminRegistrantsQueryKey,
  setAuthTokenGetter
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Users, Lock, LogOut } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const adminLogin = useAdminLogin();
  
  // Set the token getter for Orval hooks
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("admin_token"));
    if (localStorage.getItem("admin_token")) {
      setIsAuthenticated(true);
    }
  }, []);

  const { data: stats, refetch: refetchStats } = useGetAdminStats({
    query: { enabled: isAuthenticated, queryKey: getGetAdminStatsQueryKey() }
  });
  
  const { data: registrants, refetch: refetchRegistrants } = useGetAdminRegistrants({
    query: { enabled: isAuthenticated, queryKey: getGetAdminRegistrantsQueryKey() }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate(
      { data: { password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("admin_token", data.token);
          setIsAuthenticated(true);
          toast({ title: "Login realizado com sucesso" });
          refetchStats();
          refetchRegistrants();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Senha incorreta" });
        }
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const exportCSV = () => {
    if (!registrants) return;

    const headers = ["Nome", "E-mail", "Telefone", "Cidade", "Profissão", "Minicursos", "Data Inscrição"];
    const rows = registrants.map(r => [
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.city}"`,
      `"${r.profession}"`,
      `"${r.minicourses.join(' / ')}"`,
      `"${format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `conecta_orto_registrants_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-panel border-white/10 bg-[#0D1F3C]/80">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary w-6 h-6" />
            </div>
            <CardTitle className="text-2xl text-white">Área Restrita</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border-white/10 text-white h-12 text-center text-lg"
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={adminLogin.isPending}>
                {adminLogin.isPending ? "Acessando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Painel de Controle</h1>
          <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-panel border-white/10 bg-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Inscritos</p>
                    <h3 className="text-4xl font-bold text-white">{stats.totalRegistrants}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="text-primary w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {stats.minicourseEnrollments.map((course) => {
              const pct = Math.round((course.enrollmentCount / course.maxCapacity) * 100);
              return (
                <Card key={course.id} className="glass-panel border-white/10 bg-white/5">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-400 truncate mb-1" title={course.title}>
                      Minicurso: {course.title}
                    </p>
                    <div className="flex items-end justify-between mb-2">
                      <h3 className="text-2xl font-bold text-white">{course.enrollmentCount}</h3>
                      <span className="text-sm text-gray-400">/ {course.maxCapacity} vagas</span>
                    </div>
                    <Progress value={pct} className="h-2 bg-black/40" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Table Section */}
        <Card className="glass-panel border-white/10 bg-[#0D1F3C]/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-white">Inscrições Recentes</CardTitle>
            <Button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white border-0">
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {registrants && (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">E-mail</TableHead>
                    <TableHead className="text-gray-400">Telefone</TableHead>
                    <TableHead className="text-gray-400">Cidade</TableHead>
                    <TableHead className="text-gray-400">Profissão</TableHead>
                    <TableHead className="text-gray-400">Minicursos</TableHead>
                    <TableHead className="text-gray-400 text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrants.map((r) => (
                    <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{r.name}</TableCell>
                      <TableCell className="text-gray-300">{r.email}</TableCell>
                      <TableCell className="text-gray-300">{r.phone}</TableCell>
                      <TableCell className="text-gray-300">{r.city}</TableCell>
                      <TableCell className="text-gray-300">{r.profession}</TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-[200px] truncate" title={r.minicourses.join(', ')}>
                        {r.minicourses.length > 0 ? r.minicourses.join(', ') : '-'}
                      </TableCell>
                      <TableCell className="text-gray-400 text-right text-sm">
                        {format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {registrants.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Nenhuma inscrição encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
