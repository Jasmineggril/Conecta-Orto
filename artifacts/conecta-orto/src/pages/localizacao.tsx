import { motion } from "framer-motion";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ZoomIn, ZoomOut, Maximize, ExternalLink } from "lucide-react";

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="flex gap-2 mb-4 justify-center md:justify-start">
      <Button variant="outline" size="icon" className="glass-panel" onClick={() => zoomIn()}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="glass-panel" onClick={() => zoomOut()}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="glass-panel" onClick={() => resetTransform()}>
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function Localizacao() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Conheça o Local do Evento</h1>
          <p className="text-xl text-gray-400">
            Campus Norte FMUSP – Av. Dr. Arnaldo, 455, São Paulo, SP
          </p>
        </motion.div>

        {/* Floor Plan Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="glass-panel p-6 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Planta do Evento</h2>
            <TransformWrapper initialScale={1}>
              <Controls />
              <div className="w-full overflow-hidden border border-white/10 rounded-xl bg-white/5 relative">
                <TransformComponent wrapperClass="w-full" contentClass="w-full">
                  <iframe
                    src="/planta-campus.pdf"
                    className="w-full h-[600px] border-0"
                    title="Planta do Campus"
                  />
                </TransformComponent>
              </div>
            </TransformWrapper>
            <p className="text-sm text-gray-400 mt-4 text-center">
              Use Ctrl+Scroll ou os botões para ampliar
            </p>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { color: "bg-blue-500", name: "Auditório Principal", desc: "Palestras magnas e abertura" },
              { color: "bg-green-500", name: "Recepção e Credenciamento", desc: "Entrada e entrega de crachás" },
              { color: "bg-yellow-500", name: "Banheiros", desc: "Sanitários e fraldário" },
              { color: "bg-purple-500", name: "Laboratórios e Salas Práticas", desc: "Hands-on sessions" },
              { color: "bg-orange-500", name: "Salas dos Minicursos", desc: "Aulas teóricas e workshops" },
              { color: "bg-red-500", name: "Entrada Principal", desc: "Acesso principal do evento" },
              { color: "bg-gray-500", name: "Estacionamento", desc: "Estacionamento exclusivo no campus" },
            ].map((item, idx) => (
              <Card key={idx} className="glass-panel border-white/10 bg-white/5">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${item.color}`} />
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Google Maps Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Como Chegar</h2>
          
          <div className="glass-panel p-2 rounded-2xl mb-8 overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Av.+Dr.+Arnaldo,+455,+São+Paulo,+SP&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-[450px] rounded-xl border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>

          <div className="flex justify-center mb-12">
            <a
              href="https://maps.app.goo.gl/YtRMHDGmYWnx67gy7"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8 font-semibold">
                <MapPin className="mr-2 h-5 w-5" />
                Abrir no Google Maps
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel border-white/10 bg-white/5 text-center p-6">
              <CardContent className="p-0 space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-xl">🚇</span>
                </div>
                <h3 className="font-bold text-lg text-white">De Metrô</h3>
                <p className="text-gray-400 text-sm">
                  Estação Consolação (Linha 2-Verde)
                  <br />Aprox. 10 min de caminhada
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/10 bg-white/5 text-center p-6">
              <CardContent className="p-0 space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-xl">🚗</span>
                </div>
                <h3 className="font-bold text-lg text-white">De Carro</h3>
                <p className="text-gray-400 text-sm">
                  Estacionamento no Campus
                  <br />Vagas limitadas, chegue cedo
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/10 bg-white/5 text-center p-6">
              <CardContent className="p-0 space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-xl">🚌</span>
                </div>
                <h3 className="font-bold text-lg text-white">De Ônibus</h3>
                <p className="text-gray-400 text-sm">
                  Linhas 702P-10, 6286, 875A-10
                  <br />Paradas próximas à entrada
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
