import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogOut, LayoutDashboard, Users, BookOpen, Award, Mic, Image, Home, Building2, Settings } from "lucide-react";
import { api } from "@/lib/api";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminStudents from "@/components/admin/AdminStudents";
import AdminMinicourses from "@/components/admin/AdminMinicourses";
import AdminSpeakers from "@/components/admin/AdminSpeakers";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminHomepage from "@/components/admin/AdminHomepage";
import AdminSponsors from "@/components/admin/AdminSponsors";
import AdminCertificates from "@/components/admin/AdminCertificates";

type TabId = "overview" | "students" | "minicourses" | "certificates" | "speakers" | "gallery" | "homepage" | "sponsors" | "settings";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview",     label: "Visão Geral",   icon: LayoutDashboard },
  { id: "students",     label: "Alunos",         icon: Users           },
  { id: "minicourses",  label: "Minicursos",     icon: BookOpen        },
  { id: "certificates", label: "Certificados",   icon: Award           },
  { id: "speakers",     label: "Palestrantes",   icon: Mic             },
  { id: "gallery",      label: "Galeria",        icon: Image           },
  { id: "homepage",     label: "Página Inicial", icon: Home            },
  { id: "sponsors",     label: "Patrocinadores", icon: Building2       },
  { id: "settings",     label: "Configurações",  icon: Settings        },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("admin_token")) setIsAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const { token } = await api.post<{ token: string }>("/admin/login", { password });
      localStorage.setItem("admin_token", token);
      setIsAuthenticated(true);
      toast({ title: "Login realizado com sucesso" });
    } catch {
      toast({ variant: "destructive", title: "Senha incorreta" });
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-panel border-white/10 bg-[#0D1F3C]/80">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary w-7 h-7" />
            </div>
            <CardTitle className="text-2xl text-white">Área Restrita</CardTitle>
            <p className="text-gray-500 text-sm mt-1">Acesso exclusivo para administradores</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <Input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-white/10 text-white h-12 text-center text-lg"
                autoFocus
              />
              <Button type="submit" className="w-full h-12" disabled={loggingIn}>
                {loggingIn ? "Verificando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0D1F3C] border-r border-white/10 z-30
        transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-white/10">
          <div className="text-lg font-bold text-white">
            <span className="text-primary">Conecta</span> Orto
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Painel Administrativo</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-white/5"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0D1F3C]">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-semibold">{TABS.find(t => t.id === activeTab)?.label}</span>
          <Button variant="ghost" size="icon" className="text-gray-400 h-8 w-8" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Desktop header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">{TABS.find(t => t.id === activeTab)?.label}</h1>
                <p className="text-gray-500 text-sm mt-0.5">Conecta Orto 2026</p>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "overview"     && <AdminOverview />}
            {activeTab === "students"     && <AdminStudents />}
            {activeTab === "minicourses"  && <AdminMinicourses />}
            {activeTab === "certificates" && <AdminCertificates />}
            {activeTab === "speakers"     && <AdminSpeakers />}
            {activeTab === "gallery"      && <AdminGallery />}
            {activeTab === "homepage"     && <AdminHomepage />}
            {activeTab === "sponsors"     && <AdminSponsors />}
            {activeTab === "settings"     && <SettingsPanel onLogout={handleLogout} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsPanel({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-6 max-w-lg">
      <Card className="glass-panel border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white text-base">Sessão Administrativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400">
            Você está autenticado como administrador do Conecta Orto.
            A sessão expira após 8 horas de inatividade.
          </p>
          <p className="text-xs text-gray-500">
            Para alterar a senha, atualize a variável de ambiente <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary">ADMIN_PASSWORD</code> no painel da Replit.
          </p>
          <Button variant="outline" className="border-red-500/30 text-red-400 hover:text-red-300 mt-2" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Encerrar sessão
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white text-base">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p>🗓️ Evento: <span className="text-white">09 de Julho de 2026</span></p>
          <p>📍 Local: <span className="text-white">UnDF Jorge Amaury, Brasília — DF</span></p>
          <p>🏛️ Universidade do Distrito Federal Professor Jorge Amaury Maia Nunes — UnDF</p>
        </CardContent>
      </Card>
    </div>
  );
}
