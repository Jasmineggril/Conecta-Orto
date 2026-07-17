import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Linkedin, Youtube, MapPin, Mail, Phone, LogOut, User } from "lucide-react";
import logo from "@assets/image_1782408441192.png";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/inscricao", label: "Inscrição" },
    { href: "/minicursos", label: "Minicursos" },
    { href: "/certificados", label: "Certificados" },
    { href: "/localizacao", label: "Local" },
    { href: "/palestrantes", label: "Palestrantes" },
    { href: "/galeria", label: "Galeria" },
  ];

  // Iniciais do nome para o avatar
  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "glass-panel shadow-lg py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/">
            <img src={logo} alt="Conecta Orto" className="h-10 md:h-12 cursor-pointer" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                Área do Administrador
              </Button>
            </Link>

            {/* Avatar / Login indicator */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2 group focus:outline-none"
                  title={user.name}
                >
                  {/* Green dot indicator */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-sm font-bold select-none">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A1628]" />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white max-w-[100px] truncate hidden lg:block">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown */}
                {avatarOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl glass-panel border border-white/10 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Link href="/certificados" onClick={() => setAvatarOpen(false)}>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                        <User size={14} /> Meus Certificados
                      </button>
                    </Link>
                    <Link href="/minicursos" onClick={() => setAvatarOpen(false)}>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                        <User size={14} /> Meus Minicursos
                      </button>
                    </Link>
                    <button
                      onClick={() => { logout(); setAvatarOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/inscricao">
                <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors" title="Faça login com seu e-mail">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-600 rounded-full border-2 border-[#0A1628]" />
                  </div>
                </button>
              </Link>
            )}
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile avatar */}
            {user && (
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-xs font-bold">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-[#0A1628]" />
              </div>
            )}
            <button
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full glass-panel border-t border-white/10 py-4 flex flex-col items-center gap-4 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium w-full text-center py-2 ${
                  location === link.href ? "text-primary" : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="border-white/10 mt-2">
                Área do Administrador
              </Button>
            </Link>
            {user && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 transition-colors"
              >
                <LogOut size={14} /> Sair ({user.name.split(" ")[0]})
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow pt-20">{children}</main>

      <footer className="glass-panel mt-auto py-12 border-t border-white/10 text-gray-400">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col gap-4">
              <img src={logo} alt="Conecta Orto" className="h-10 w-fit" />
              <p className="text-sm">O Futuro dos Implantes Ortopédicos</p>
              <div className="flex gap-4 mt-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-white/5">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-white/5">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-white/5">
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold">Mapa do Site</h4>
              <ul className="space-y-2 text-sm flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/admin" className="hover:text-primary transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold">Contato</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4" /> contato@conectaorto.com.br
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4" /> (11) 3061-7000
                </li>
                <li className="flex items-center gap-3">
                  <Instagram className="h-4 w-4" /> @conectaorto
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  SHIN CA 2 – Lago Norte, Brasília – DF
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} Conecta Orto. Todos os direitos reservados.</p>
            <p>Evento realizado na Universidade do Distrito Federal Jorge Amaury</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
