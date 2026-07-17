import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import {
  MapPin, ZoomIn, ZoomOut, Maximize2, ExternalLink,
  Download, Search, X, Clock, Navigation, Car, Bus,
  BookOpen, FlaskConical, Dumbbell, GraduationCap,
  Droplets, DoorOpen, Leaf, Coffee, Accessibility
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── MARKERS ──────────────────────────────────────────────────────────────────
const MARKERS = [
  {
    id: "biblioteca",
    name: "Biblioteca",
    icon: BookOpen,
    color: "#3b82f6",
    bgColor: "bg-blue-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/40",
    x: 28,
    y: 37,
    desc: "Espaço para estudos e apoio aos participantes do congresso.",
    horario: "08h00 às 18h00",
    uso: "Consulta, estudo e suporte bibliográfico.",
    category: "biblioteca",
  },
  {
    id: "lab01",
    name: "Laboratório 01",
    icon: FlaskConical,
    color: "#a855f7",
    bgColor: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
    x: 67,
    y: 42,
    desc: "Demonstrações práticas sobre implantes ortopédicos.",
    horario: "08h00 às 18h00",
    uso: "Demonstrações e experimentos ao vivo.",
    category: "laboratorio",
  },
  {
    id: "lab03",
    name: "Laboratório 03",
    icon: FlaskConical,
    color: "#a855f7",
    bgColor: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
    x: 64,
    y: 57,
    desc: "Demonstrações práticas sobre implantes ortopédicos.",
    horario: "08h00 às 18h00",
    uso: "Demonstrações e experimentos ao vivo.",
    category: "laboratorio",
  },
  {
    id: "lab04",
    name: "Laboratório 04",
    icon: FlaskConical,
    color: "#a855f7",
    bgColor: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
    x: 30,
    y: 52,
    desc: "Demonstrações práticas sobre implantes ortopédicos.",
    horario: "08h00 às 18h00",
    uso: "Demonstrações e experimentos ao vivo.",
    category: "laboratorio",
  },
  {
    id: "treinamento",
    name: "Sala de Treinamento",
    icon: Dumbbell,
    color: "#f97316",
    bgColor: "bg-orange-500",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/40",
    x: 61,
    y: 27,
    desc: "Oficinas e treinamentos durante o congresso.",
    horario: "08h00 às 18h00",
    uso: "Workshops e atividades práticas.",
    category: "treinamento",
  },
  {
    id: "sala01",
    name: "Sala de Aula 01",
    icon: GraduationCap,
    color: "#8b5cf6",
    bgColor: "bg-violet-500",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/40",
    x: 38,
    y: 67,
    desc: "Ambiente destinado aos minicursos e atividades teóricas do congresso.",
    horario: "08h00 às 18h00",
    uso: "Minicurso 1 – Introdução aos Implantes.",
    category: "sala",
  },
  {
    id: "sala02",
    name: "Sala de Aula 02",
    icon: GraduationCap,
    color: "#8b5cf6",
    bgColor: "bg-violet-500",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/40",
    x: 53,
    y: 65,
    desc: "Ambiente destinado aos minicursos e atividades teóricas do congresso.",
    horario: "08h00 às 18h00",
    uso: "Minicurso 2 – Materiais Biocompatíveis.",
    category: "sala",
  },
  {
    id: "banheiros",
    name: "Banheiros",
    icon: Droplets,
    color: "#eab308",
    bgColor: "bg-yellow-500",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    x: 50,
    y: 21,
    desc: "Sanitários disponíveis para todos os participantes.",
    horario: "08h00 às 18h00",
    uso: "Sanitários masculino, feminino e acessível.",
    category: "banheiro",
  },
  {
    id: "entrada",
    name: "Entrada Principal",
    icon: DoorOpen,
    color: "#ef4444",
    bgColor: "bg-red-500",
    textColor: "text-red-400",
    borderColor: "border-red-500/40",
    x: 51,
    y: 78,
    desc: "Acesso principal ao evento e credenciamento.",
    horario: "07h30 às 09h00",
    uso: "Credenciamento e entrega de crachás.",
    category: "entrada",
  },
  {
    id: "jardim",
    name: "Jardim Central",
    icon: Leaf,
    color: "#22c55e",
    bgColor: "bg-green-500",
    textColor: "text-green-400",
    borderColor: "border-green-500/40",
    x: 50,
    y: 50,
    desc: "Área de convivência e Coffee Break.",
    horario: "08h00 às 18h00",
    uso: "Coffee Break — 10h00 e 16h00.",
    category: "jardim",
  },
];

const LEGEND = [
  { color: "bg-blue-500", label: "Biblioteca" },
  { color: "bg-purple-500", label: "Laboratórios" },
  { color: "bg-orange-500", label: "Sala de Treinamento" },
  { color: "bg-violet-500", label: "Salas de Aula" },
  { color: "bg-yellow-500", label: "Banheiros" },
  { color: "bg-red-500", label: "Entrada Principal" },
  { color: "bg-green-500", label: "Jardim Central" },
];

// ─── CONTROLS ─────────────────────────────────────────────────────────────────
function MapControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
      {[
        { Icon: ZoomIn, action: () => zoomIn(), title: "Zoom +" },
        { Icon: ZoomOut, action: () => zoomOut(), title: "Zoom −" },
        { Icon: Maximize2, action: () => resetTransform(), title: "Reset" },
      ].map(({ Icon, action, title }) => (
        <button
          key={title}
          onClick={action}
          title={title}
          className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

// ─── MARKER COMPONENT ─────────────────────────────────────────────────────────
function Marker({
  marker, active, highlighted, onClick,
}: {
  marker: typeof MARKERS[0];
  active: boolean;
  highlighted: boolean;
  onClick: () => void;
}) {
  const Icon = marker.icon;
  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -100%)" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: highlighted ? 1.4 : active ? 1.2 : 1, opacity: 1 }}
      whileHover={{ scale: 1.3, zIndex: 50 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: marker.color, opacity: 0.3 }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Pin */}
      <div
        className="relative w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30"
        style={{ backgroundColor: marker.color }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      {/* Pin tail */}
      <div
        className="w-0 h-0 mx-auto"
        style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `8px solid ${marker.color}`,
        }}
      />
    </motion.div>
  );
}

// ─── POPUP CARD ───────────────────────────────────────────────────────────────
function MarkerPopup({ marker, onClose }: { marker: typeof MARKERS[0]; onClose: () => void }) {
  const Icon = marker.icon;
  const googleMapsUrl = `https://maps.app.goo.gl/YtRMHDGmYWnx67gy7`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-4 right-4 z-30 w-72 rounded-2xl border border-white/10 bg-[#0D1F3C]/95 backdrop-blur-md shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10" style={{ background: `${marker.color}20` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: marker.color }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm">{marker.name}</h3>
          <p className="text-gray-400 text-xs truncate">{marker.desc}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Horário</span>
            <p className="text-white font-medium">{marker.horario}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Utilização</span>
            <p className="text-white">{marker.uso}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <button
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: marker.color }}
          >
            <Navigation className="w-4 h-4" /> Traçar rota
          </button>
        </a>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Localizacao() {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const transformRef = useRef<any>(null);

  const active = MARKERS.find((m) => m.id === activeMarker) ?? null;

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    if (!q.trim()) { setHighlightedId(null); return; }
    const found = MARKERS.find((m) =>
      m.name.toLowerCase().includes(q.toLowerCase()) ||
      m.category.toLowerCase().includes(q.toLowerCase()) ||
      m.desc.toLowerCase().includes(q.toLowerCase())
    );
    if (found) {
      setHighlightedId(found.id);
      setActiveMarker(found.id);
    } else {
      setHighlightedId(null);
    }
  }, []);

  const suggestions = search.trim()
    ? MARKERS.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* ─── HEADER ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-5">
            <MapPin size={14} /> Localização Interativa
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">Localização Interativa</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Encontre facilmente cada ambiente do congresso.<br />
            <span className="text-sm">Clique nos marcadores para mais informações</span>
          </p>
        </motion.div>

        {/* ─── TOOLBAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Encontrar ambiente..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/8"
            />
            {search && (
              <button onClick={() => { setSearch(""); setHighlightedId(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-1 left-0 right-0 bg-[#0D1F3C] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl"
                >
                  {suggestions.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setSearch(m.name); setHighlightedId(m.id); setActiveMarker(m.id); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors"
                      >
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.color }}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white text-sm">{m.name}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 ml-auto">
            <a href="/planta-campus.pdf" download>
              <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white gap-2">
                <Download className="w-4 h-4" /> Baixar planta (PDF)
              </Button>
            </a>
            <a href="https://maps.app.goo.gl/YtRMHDGmYWnx67gy7" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2">
                <MapPin className="w-4 h-4" /> Abrir no Google Maps
              </Button>
            </a>
          </div>
        </motion.div>

        {/* ─── MAP ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="relative rounded-2xl border border-white/10 bg-[#0D1F3C]/60 overflow-hidden mb-6"
          style={{ height: 520 }}
        >
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            wheel={{ step: 0.1 }}
          >
            {() => (
              <>
                <MapControls />
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: "100%", height: "100%" }}
                >
                  {/* Floor plan + markers */}
                  <div
                    className="relative w-full h-full"
                    onClick={() => { setActiveMarker(null); setHighlightedId(null); setSearch(""); }}
                  >
                    <img
                      src="/planta-terreo.png"
                      alt="Planta Baixa Pavimento Térreo"
                      className="w-full h-full object-contain bg-white"
                      draggable={false}
                    />
                    {/* Marker overlay — same coordinate system as img */}
                    <div className="absolute inset-0">
                      {MARKERS.map((m) => (
                        <Marker
                          key={m.id}
                          marker={m}
                          active={activeMarker === m.id}
                          highlighted={highlightedId === m.id}
                          onClick={() => setActiveMarker(activeMarker === m.id ? null : m.id)}
                        />
                      ))}
                    </div>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          {/* Popup */}
          <AnimatePresence>
            {active && (
              <MarkerPopup
                key={active.id}
                marker={active}
                onClose={() => setActiveMarker(null)}
              />
            )}
          </AnimatePresence>

          {/* Hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-black/40 backdrop-blur px-3 py-1 rounded-full pointer-events-none">
            Use Ctrl + Scroll ou pinça para zoom
          </div>
        </motion.div>

        {/* ─── LEGEND ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* ─── INFO BAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-14"
        >
          {[
            { Icon: MapPin, label: "Campus UnDF", sub: "Universidade do Distrito Federal", color: "text-primary" },
            { Icon: Clock, label: "Horário do Evento", sub: "08h00 às 18h00", color: "text-primary" },
            { Icon: Car, label: "Estacionamento", sub: "Gratuito no campus", color: "text-primary" },
            { Icon: Accessibility, label: "Acessibilidade", sub: "Local acessível", color: "text-primary" },
            { Icon: Coffee, label: "Coffee Break", sub: "No Jardim Central", color: "text-primary" },
          ].map(({ Icon, label, sub, color }) => (
            <div key={label} className="glass-panel border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{label}</p>
                <p className="text-gray-400 text-xs truncate">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ─── GOOGLE MAPS ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Como Chegar</h2>
          <div className="rounded-2xl overflow-hidden border border-white/10 mb-8">
            <iframe
              src="https://maps.google.com/maps?q=SHIN+CA+2,+Lago+Norte,+Bras%C3%ADlia,+DF,+71503-502&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-[400px] border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "🚗", title: "De Carro", desc: "Estacionamento gratuito no campus. Acesso pela DF-003 (Estrada Parque Contorno)." },
              { emoji: "🚌", title: "De Ônibus", desc: "Linhas que passam pelo Lago Norte (SHIN CA 2). Verifique o itinerário no DFTRANS." },
              { emoji: "🚕", title: "De App / Táxi", desc: "Uber e 99 disponíveis na região. Endereço: SHIN CA 2, Lago Norte, Brasília – DF." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="glass-panel border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
