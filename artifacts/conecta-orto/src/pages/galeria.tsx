import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  abertura:    "Abertura",
  palestras:   "Palestras",
  minicursos:  "Minicursos",
  equipe:      "Equipe",
  encerramento:"Encerramento",
};

const CATEGORY_ORDER = ["abertura", "palestras", "minicursos", "equipe", "encerramento"];

const PLACEHOLDER_ITEMS: GalleryItem[] = [
  /* ── ABERTURA ── */
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    title: "Abertura do evento",
    caption: "Recepção dos participantes",
    altText: "Auditório no início do evento",
    category: "abertura",
    displayOrder: 1,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    title: "Cerimônia de abertura",
    caption: "Comissão organizadora na abertura oficial",
    altText: "Palco de abertura do congresso",
    category: "abertura",
    displayOrder: 2,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    title: "Credenciamento",
    caption: "Participantes se cadastrando na entrada",
    altText: "Mesa de credenciamento",
    category: "abertura",
    displayOrder: 3,
  },
  /* ── PALESTRAS ── */
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    title: "Palestra principal",
    caption: "Tecnologia em implantes ortopédicos",
    altText: "Palestrante apresentando slides",
    category: "palestras",
    displayOrder: 4,
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    title: "Mesa-redonda",
    caption: "Debate com especialistas em ortopedia",
    altText: "Painel de palestrantes",
    category: "palestras",
    displayOrder: 5,
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&q=80",
    title: "Demonstração de materiais",
    caption: "Materiais biocompatíveis",
    altText: "Demonstração de implantes",
    category: "palestras",
    displayOrder: 6,
  },
  /* ── MINICURSOS ── */
  {
    id: 7,
    imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80",
    title: "Demonstração prática",
    caption: "Materiais biocompatíveis em detalhe",
    altText: "Demonstração de materiais no laboratório",
    category: "minicursos",
    displayOrder: 7,
  },
  {
    id: 8,
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    title: "Sessão de minicurso",
    caption: "Participantes em atividade prática",
    altText: "Grupo em minicurso",
    category: "minicursos",
    displayOrder: 8,
  },
  {
    id: 9,
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    title: "Introdução aos Implantes",
    caption: "Minicurso 1 — teoria e prática",
    altText: "Alunos assistindo ao minicurso",
    category: "minicursos",
    displayOrder: 9,
  },
  /* ── EQUIPE ── */
  {
    id: 10,
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
    title: "Equipe organizadora",
    caption: "UnDF — Conecta Orto 2026",
    altText: "Equipe do evento",
    category: "equipe",
    displayOrder: 10,
  },
  {
    id: 11,
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    title: "Bastidores",
    caption: "Preparação antes do evento",
    altText: "Equipe preparando o evento",
    category: "equipe",
    displayOrder: 11,
  },
  /* ── ENCERRAMENTO ── */
  {
    id: 12,
    imageUrl: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=80",
    title: "Cerimônia de encerramento",
    caption: "Entrega de certificados e agradecimentos",
    altText: "Cerimônia de encerramento do congresso",
    category: "encerramento",
    displayOrder: 12,
  },
  {
    id: 13,
    imageUrl: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&q=80",
    title: "Foto final",
    caption: "Participantes e equipe — Conecta Orto 2026",
    altText: "Foto coletiva de encerramento",
    category: "encerramento",
    displayOrder: 13,
  },
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

  /* Category list preserving logical order */
  const presentCategories = CATEGORY_ORDER.filter(cat =>
    items.some(i => i.category === cat)
  );
  const categories = ["todos", ...presentCategories];

  const filtered = activeCategory === "todos"
    ? items
    : items.filter(i => i.category === activeCategory);

  const prev = () =>
    setLightboxIndex(i => (i !== null ? (i - 1 + filtered.length) % filtered.length : null));
  const next = () =>
    setLightboxIndex(i => (i !== null ? (i + 1) % filtered.length : null));

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
        {!loading && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className={activeCategory !== cat ? "border-white/10 text-gray-400 hover:text-white" : ""}
                onClick={() => { setActiveCategory(cat); setLightboxIndex(null); }}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="columns-2 md:columns-3 gap-3 space-y-3"
            >
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="break-inside-avoid cursor-pointer group"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <div className="relative overflow-hidden rounded-xl border border-white/10">
                    <img
                      src={item.imageUrl}
                      alt={item.altText || item.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end justify-start">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 w-full">
                        {item.title && (
                          <p className="text-white text-sm font-semibold leading-snug">{item.title}</p>
                        )}
                        {item.caption && (
                          <p className="text-gray-300 text-xs mt-0.5">{item.caption}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-20 text-gray-600">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma imagem nesta categoria ainda.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {filtered.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={e => { e.stopPropagation(); prev(); }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={e => { e.stopPropagation(); next(); }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              onClick={e => e.stopPropagation()}
              className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-4"
            >
              <img
                src={filtered[lightboxIndex].imageUrl}
                alt={filtered[lightboxIndex].altText || filtered[lightboxIndex].title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
              <div className="text-center">
                {filtered[lightboxIndex].title && (
                  <p className="text-white font-semibold">{filtered[lightboxIndex].title}</p>
                )}
                {filtered[lightboxIndex].caption && (
                  <p className="text-gray-400 text-sm mt-1">{filtered[lightboxIndex].caption}</p>
                )}
                <p className="text-gray-600 text-xs mt-2">
                  {lightboxIndex + 1} / {filtered.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
