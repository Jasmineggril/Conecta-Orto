import { useState } from "react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { MapPin, Building2, TreePine } from "lucide-react";

const campusPhotos = [
  {
    id: 1,
    title: "Campus UnDF — Fachada",
    desc: "Primeiro campus da UnDF entregue no Lago Norte",
    src: "https://i0.wp.com/bernadetealves.com/wp-content/uploads/2022/07/Ibaneis-Rocha-entrega-primeiro-Campus-para-a-UnDF-no-Lago-Norte-com-apoio-da-Terracap-instalacoes-Bernadete-Alves.jpg?resize=910,611&ssl=1",
  },
  {
    id: 2,
    title: "Campus UnDF — Vista Geral",
    desc: "Universidade do Distrito Federal Jorge Amaury, SHIN CA 2",
    src: "https://i0.wp.com/bernadetealves.com/wp-content/uploads/2022/07/Ibaneis-Rocha-entrega-primeiro-Campus-da-UnDF-no-Lago-Norte-Helvia-Paranagua-Bernadete-Alves.jpg?resize=910,607&ssl=1",
  },
  {
    id: 3,
    title: "Campus UnDF — Espaços Internos",
    desc: "Salas modernas e laboratórios do campus",
    src: "https://i0.wp.com/bernadetealves.com/wp-content/uploads/2022/07/Ibaneis-Rocha-entrega-primeiro-Campus-para-a-UnDF-no-Lago-Norte-com-apoio-da-Terracap-interior-Bernadete-Alves.jpg?resize=910,609&ssl=1",
  },
  {
    id: 4,
    title: "Campus UnDF — Estrutura",
    desc: "Infraestrutura completa para eventos e atividades acadêmicas",
    src: "https://osdivergentes.com.br/wp-content/uploads/2022/06/UnDF-ganha-o-primeiro-campus-no-Lago-Norte_Ibanes-GDF1-696x487.jpg",
  },
];

const vizinhancaPhotos = [
  {
    id: 5,
    title: "Parque Vivencial do Lago Norte",
    desc: "Área verde a poucos metros do campus",
    src: "https://www.euamobrasilia.com.br/images/eu-amo-brasilia-prainha-do-lago-norte-leandro-boldech.jpg",
  },
  {
    id: 6,
    title: "Lago Norte — Natureza e Qualidade de Vida",
    desc: "Um dos bairros mais tranquilos de Brasília",
    src: "https://euamobrasilia.com.br/images/eu-amo-brasilia-parque-ecologico-peninsula-sul-leandro-boldech.jpg",
  },
  {
    id: 7,
    title: "Parque do Lago Norte",
    desc: "Espaço ideal para descanso e lazer próximo ao evento",
    src: "https://www.parquemunicipal.com/content-wp/uploads/2026/04/Parque-Lago-Norte.png",
  },
];

const allPhotos = [...campusPhotos, ...vizinhancaPhotos];
const slides = allPhotos.map((p) => ({ src: p.src, alt: p.title }));

export default function Galeria() {
  const [index, setIndex] = useState(-1);

  const openPhoto = (globalIdx: number) => setIndex(globalIdx);

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <MapPin size={14} /> SHIN CA 2 – Lago Norte, Brasília – DF
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Conheça o Local</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            O Conecta Orto 2026 acontece na Universidade do Distrito Federal Jorge Amaury, em um campus moderno às margens do Lago Norte.
          </p>
        </motion.div>

        {/* Campus Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">O Campus</h2>
              <p className="text-sm text-gray-400">Universidade do Distrito Federal Professor Jorge Amaury Maia Nunes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {campusPhotos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} onClick={() => openPhoto(idx)} />
            ))}
          </div>
        </section>

        {/* Neighborhood Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">O Entorno</h2>
              <p className="text-sm text-gray-400">Lago Norte — natureza, tranquilidade e fácil acesso</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {vizinhancaPhotos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} onClick={() => openPhoto(campusPhotos.length + idx)} />
            ))}
          </div>
        </section>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-panel border border-white/10 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">Quer conhecer o campus pessoalmente?</h3>
          <p className="text-gray-400 mb-5">
            O campus fica no SHIN CA 2, Lago Norte — bem localizado e com estacionamento no local.
          </p>
          <a
            href="/localizacao"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <MapPin className="w-4 h-4" /> Ver como chegar
          </a>
        </motion.div>

      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
      />
    </div>
  );
}

function PhotoCard({ photo, onClick }: { photo: { title: string; desc: string; src: string }; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="cursor-pointer group rounded-2xl overflow-hidden border border-white/10 bg-[#0D1F3C]/50 hover:border-primary/30 transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-[#0A1628]">
        <img
          src={photo.src}
          alt={photo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-medium">{photo.title}</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-1">{photo.title}</h3>
        <p className="text-gray-400 text-xs">{photo.desc}</p>
      </div>
    </motion.div>
  );
}
