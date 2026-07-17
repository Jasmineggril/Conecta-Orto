/**
 * Guided tour component using custom implementation with framer-motion.
 * No external library needed — fully accessible, responsive, keyboard-navigable.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  selector: string;      // CSS selector for the element to highlight
  title: string;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

const STEPS: TourStep[] = [
  { selector: 'body', title: "Bem-vindo ao Conecta Orto!", text: "Este tutorial rápido vai mostrar como se inscrever no evento, escolher minicursos e consultar seus certificados.", position: "bottom" },
  { selector: '[href="/inscricao"], a[href*="inscricao"]', title: "Faça sua inscrição", text: "Clique aqui para realizar sua inscrição gratuita no Conecta Orto. Você receberá um e-mail para confirmar o cadastro.", position: "bottom" },
  { selector: '[href="/minicursos"], a[href*="minicursos"]', title: "Escolha seus minicursos", text: "Depois de confirmar seu cadastro, acesse esta área para conhecer os minicursos disponíveis e garantir sua vaga.", position: "bottom" },
  { selector: '[href="/certificados"], a[href*="certificados"]', title: "Consulte seus certificados", text: "Após a confirmação da presença e a liberação pela organização, pesquise seu e-mail para baixar seus certificados em PDF.", position: "bottom" },
  { selector: '[href="/palestrantes"], a[href*="palestrantes"]', title: "Conheça os palestrantes", text: "Veja quem participará do evento, os temas apresentados e os horários das palestras.", position: "bottom" },
  { selector: '[href="/galeria"], a[href*="galeria"]', title: "Explore a galeria", text: "Confira imagens do evento, das atividades e dos minicursos.", position: "bottom" },
  { selector: '[href="/localizacao"], a[href*="localizacao"]', title: "Como chegar", text: "Encontre as informações de localização e acesso à Universidade do Distrito Federal Jorge Amaury Maia Nunes — UnDF.", position: "bottom" },
];

const STORAGE_KEY = "conectaorto_tour_done";

function getElementRect(selector: string): DOMRect | null {
  if (selector === "body") return null;
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect() : null;
}

interface HighlightBox {
  top: number; left: number; width: number; height: number;
}

export default function GuidedTour() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState<HighlightBox | null>(null);
  const [popupPos, setPopupPos] = useState({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Show welcome popup on first visit
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setShowWelcome(true), 1500);
    }
  }, []);

  const dismissAll = useCallback(() => {
    setShowWelcome(false);
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  const startTour = useCallback(() => {
    setShowWelcome(false);
    setStep(0);
    setActive(true);
  }, []);

  const updateHighlight = useCallback((stepIndex: number) => {
    const { selector } = STEPS[stepIndex];
    const rect = getElementRect(selector);
    const pad = 8;

    if (!rect) {
      setHighlight(null);
      setPopupPos({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });
      return;
    }

    const scrollY = window.scrollY;
    setHighlight({
      top: rect.top + scrollY - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    // Position popup below element (with bounds check)
    const popTop = rect.bottom + scrollY + pad + 20;
    const popLeft = Math.max(16, Math.min(rect.left + rect.width / 2, window.innerWidth - 200));
    setPopupPos({
      top: `${popTop}px`,
      left: `${popLeft}px`,
      transform: "translateX(-50%)",
    });

    // Scroll element into view
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: prefersReduced.current ? "auto" : "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (!active) return;
    updateHighlight(step);
    window.addEventListener("resize", () => updateHighlight(step));
    return () => window.removeEventListener("resize", () => updateHighlight(step));
  }, [active, step, updateHighlight]);

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismissAll();
  };
  const goPrev = () => { if (step > 0) setStep(s => s - 1); };

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissAll();
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, step, dismissAll]);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Restart tour button */}
      <button
        onClick={() => { setShowWelcome(false); setStep(0); setActive(true); localStorage.removeItem(STORAGE_KEY); }}
        className="fixed bottom-5 right-5 z-40 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-full p-3 transition-colors"
        title="Ver tutorial novamente"
        aria-label="Ver tutorial novamente"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Welcome popup */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismissAll} />
            <div className="relative bg-[#0D1F3C] border border-white/15 rounded-2xl p-8 max-w-sm w-full shadow-2xl z-10">
              <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-primary rounded-full -mx-8 -mt-8 mb-6 rounded-t-2xl" />
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao Conecta Orto</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Inscreva-se no evento, escolha seus minicursos e consulte seus certificados em um só lugar.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={startTour} className="w-full">
                  Começar tutorial
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-gray-400" onClick={dismissAll}>
                  Explorar sozinho
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Highlight cutout */}
            {highlight && (
              <div
                className="absolute bg-transparent pointer-events-none"
                style={{
                  top: highlight.top,
                  left: highlight.left,
                  width: highlight.width,
                  height: highlight.height,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                  borderRadius: 10,
                  border: "2px solid rgba(30,111,255,0.7)",
                  animation: prefersReduced.current ? "none" : "pulse-ring 2s ease-in-out infinite",
                }}
              />
            )}

            {/* Popup */}
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute pointer-events-auto"
              style={popupPos}
            >
              <div className="bg-[#0D1F3C] border border-primary/30 rounded-xl shadow-2xl p-5 max-w-[300px] w-[300px]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-white font-semibold text-sm leading-snug">{currentStep.title}</p>
                  <button
                    onClick={dismissAll}
                    className="text-gray-500 hover:text-white shrink-0 -mt-0.5"
                    aria-label="Fechar tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{currentStep.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Etapa {step + 1} de {STEPS.length}</span>
                  <div className="flex gap-1.5">
                    {step > 0 && (
                      <Button size="sm" variant="outline" className="h-8 border-white/10 text-gray-400 px-3" onClick={goPrev}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" className="h-8 px-4" onClick={goNext}>
                      {isLast ? "Concluir" : <ChevronRight className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
                {/* Progress dots */}
                <div className="flex justify-center gap-1 mt-3">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${i === step ? "w-4 bg-primary" : "w-1.5 bg-white/20"}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 3px rgba(30,111,255,0.4); }
          50%       { box-shadow: 0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 6px rgba(30,111,255,0.2); }
        }
      `}</style>
    </>
  );
}
