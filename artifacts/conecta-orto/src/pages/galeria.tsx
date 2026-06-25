import { useState } from "react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Card, CardContent } from "@/components/ui/card";

const galleryItems = [
  { id: 1, title: "Palestra Magna", desc: "Abertura oficial", gradient: "from-blue-600 to-purple-600" },
  { id: 2, title: "Networking", desc: "Conexões valiosas", gradient: "from-blue-500 to-cyan-500" },
  { id: 3, title: "Minicurso Prático", desc: "Hands-on session", gradient: "from-indigo-600 to-blue-800" },
  { id: 4, title: "Coffee Break", desc: "Momentos de descontração", gradient: "from-purple-600 to-pink-600" },
  { id: 5, title: "Mesa Redonda", desc: "Debates enriquecedores", gradient: "from-cyan-600 to-teal-600" },
  { id: 6, title: "Premiação", desc: "Reconhecimento científico", gradient: "from-blue-700 to-indigo-800" },
  { id: 7, title: "Exposição", desc: "Stands de patrocinadores", gradient: "from-teal-600 to-emerald-600" },
  { id: 8, title: "Sessão de Pôsteres", desc: "Pesquisas inovadoras", gradient: "from-fuchsia-600 to-purple-600" },
  { id: 9, title: "Auditório Lotação", desc: "Engajamento total", gradient: "from-sky-600 to-blue-600" },
  { id: 10, title: "Simulação Realística", desc: "Tecnologia de ponta", gradient: "from-indigo-500 to-purple-500" },
  { id: 11, title: "Encerramento", desc: "Cerimônia final", gradient: "from-blue-800 to-blue-950" },
  { id: 12, title: "Happy Hour", desc: "Celebração do evento", gradient: "from-violet-600 to-fuchsia-600" },
];

const slides = galleryItems.map((item) => ({
  src: `https://placehold.co/1200x800/1E6FFF/white?text=Foto+${item.id}`,
  alt: item.title,
}));

export default function Galeria() {
  const [index, setIndex] = useState(-1);

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeria</h1>
          <p className="text-xl text-gray-400">
            Momentos marcantes do congresso
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="cursor-pointer"
              onClick={() => setIndex(idx)}
            >
              <Card className="overflow-hidden border-0 bg-transparent group">
                <CardContent className="p-0 relative aspect-4/3 rounded-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-3xl font-black mb-2 opacity-50">0{item.id}</span>
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    <p className="text-sm font-medium text-white/80">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Lightbox
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          slides={slides}
        />
      </div>
    </div>
  );
}
