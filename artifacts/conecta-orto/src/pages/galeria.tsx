import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  altText: string;
  imageUrl: string;
  category: string;
  displayOrder: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  geral: "Geral",
  palestras: "Palestras",
  minicursos: "Minicursos",
  abertura: "Abertura",
  encerramento: "Encerramento",
  equipe: "Equipe",
};

// Placeholder images when gallery has no items yet
const PLACEHOLDER_ITEMS: GalleryItem[] = [
  { id: 1, imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80", title: "Abertura do evento", caption: "Recepção dos participantes", altText: "Auditório no início do evento", category: "abertura", displayOrder: 1 },
  { id: 2, imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80", title: "Palestra principal", caption: "Tecnologia em implantes ortopédicos", altText: "Palestrante apresentando slides", category: "palestras", displayOrder: 2 },
  { id: 3, imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80", title: "Demonstração prática", caption: "Materiais biocompatíveis", altText: "Demonstração de materiais", category: "minicursos", displayOrder: 3 },
  { id: 4, imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80", title: "Sessão de minicurso", caption: "Participantes em atividade", altText: "Grupo em minicurso", category: "minicursos", displayOrder: 4 },
  { id: 5, imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80", title: "Equipe organizadora", caption: "UnDF — Conecta Orto 2026", altText: "Equipe do evento", category: "equipe", displayOrder: 5 },
  { id: 6, imageUrl: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=80", title: "Encerramento", caption: "Cerimônia de entrega de certificados", altText: "Cerimônia de encerramento", category: "encerramento", displayOrder: 6 },
];

export default function Galeria() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then((data: GalleryItem[]) => {
        setItems(data.length > 0 ? data : PLACEHOLDER_ITEMS);
      })
      .catch(() => setItems(PLACEHOLDER_ITEMS))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["todos", ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = activeCategory === "todos"
    ? items
    : items.filter(i => i.category === activeCategory);

  const prev = () => setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const next = () => setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, filtered.length]);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <ImageIcon size={12} /> Galeria
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeria de Fotos</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Confira os registros do Conecta Orto 2026 — das palestras aos minicursos.
          </p>
        </motion.div>

        {/* Category filter */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className={activeCategory !== cat ? "border-white/10 text-gray-400 hover:text-white" : ""}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "todos" ? "Todos" : CATEGORY_LABELS[cat] ?? cat}
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setLightboxIndex(idx)}
              >
                <div className="relative overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={item.imageUrl}
                    alt={item.altText || item.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-start">
                    {(item.title || item.caption) && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
                        {item.title && <p className="text-white text-sm font-medium">{item.title}</p>}
                        {item.caption && <p className="text-gray-300 text-xs">{item.caption}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-600">
                <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Nenhuma imagem nesta categoria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
              onClick={() => setLightboxIndex(null)}
              aria-label="Fechar"
            >
              <X className="w-7 h-7" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-9 h-9" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Próxima"
            >
              <ChevronRight className="w-9 h-9" />
            </button>

            <div onClick={e => e.stopPropagation()} className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-3">
              <img
                src={filtered[lightboxIndex].imageUrl}
                alt={filtered[lightboxIndex].altText || filtered[lightboxIndex].title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
              />
              {(filtered[lightboxIndex].title || filtered[lightboxIndex].caption) && (
                <div className="text-center">
                  {filtered[lightboxIndex].title && <p className="text-white font-medium">{filtered[lightboxIndex].title}</p>}
                  {filtered[lightboxIndex].caption && <p className="text-gray-400 text-sm">{filtered[lightboxIndex].caption}</p>}
                </div>
              )}
              <p className="text-gray-600 text-xs">{lightboxIndex + 1} / {filtered.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
