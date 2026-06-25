import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import logo from "@assets/image_1782408441192.png";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/inscricao", label: "Inscrição" },
    { href: "/minicursos", label: "Minicursos" },
    { href: "/certificados", label: "Certificados" },
  ];

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
                Área do Congressista
              </Button>
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
                Área do Congressista
              </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow pt-20">{children}</main>

      <footer className="glass-panel mt-auto py-8 border-t-0 border-b-0 border-x-0 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={logo} alt="Conecta Orto" className="h-8 opacity-50 grayscale" />
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Conecta Orto. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
