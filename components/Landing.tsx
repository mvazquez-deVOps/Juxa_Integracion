import React from 'react';
import { UserType } from '../types.ts';
import { motion } from 'framer-motion';
import { Shield, Zap, Scale, ArrowRight, CheckCircle2, MessageCircle, Mail, ShieldCheck, FileText } from 'lucide-react';



export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const faqs = [
    { q: "¿Es legalmente vinculante?", a: "Generamos una orientación táctica basada en legislación vigente. Es la base estratégica para que un abogado proceda con éxito." },
    { q: "¿Por qué JUXA?", a: "A diferencia de IAs genéricas, JUXA procesa códigos reales del marco jurídico mexicano para darte una ruta crítica ejecutable." },
    { q: "Confidencialidad", a: "Privacidad grado militar AES-256. Tus datos son anonimizados, garantizando el secreto profesional tecnológico." }
  ];

  return (
    <div className="bg-[#000000] min-h-screen text-white selection:bg-primary/30 font-sans">
      {/* GLOW DE FONDO AMBIENTAL */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-32 flex flex-col items-center">
        
        {/* LOGO PROMINENTE AJUSTADO */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 md:mb-12 w-full flex justify-center px-4"
        >
          <img 
            src="/LOGO2.png" 
            alt="JUXA" 
            className="h-20 sm:h-25 md:h-30 lg:h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(51,96,126,0.2)]" 
          />
        </motion.div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight text-center mb-8 leading-[1.1] md:leading-[0.9]">
          EL FUTURO <br />
          <span className="text-primary italic font-light tracking-tighter">DEL DERECHO.</span>
        </h1>
        
        <p className="text-white/50 text-lg md:text-xl max-w-2xl text-center font-light leading-relaxed mb-12 px-4">
          Análisis jurídico de alta precisión con inteligencia artificial. <br/>
          <span className="text-white/80">Estrategia legal inmediata, accesible y privada.</span>
        </p>

        <div className="relative group">
          {/* GLOBITO DE TEXTO ANIMADO */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -4, 0], 
            }}
            transition={{ 
              duration: 0.5,
              y: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut"
              }
            }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 md:left-full md:-top-10 md:translate-x-0 md:ml-8 z-20 whitespace-nowrap flex flex-col items-center md:items-start"
          >
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(0, 179, 134, 0.3)", 
                  "0 0 40px rgba(39, 85, 194, 0.5)", 
                  "0 0 20px rgba(0, 179, 134, 0.3)"
                ] 
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
              /* DEGRADADO JUXA: De Verde Esmeralda (#00b386) a Azul Eléctrico (#2755c2) */
              className="bg-linear-to-br from-[#00b386] to-[#2755c2] text-black text-[14px] md:text-[16px] uppercase tracking-normal px-8 py-4 rounded-[1.5rem] md:rounded-[2rem] relative text-center leading-snug shadow-2xl"
            >
              ¡Regístrate! <br /> 
              <span className="text-[12px] md:text-[13px] opacity-90">Primer mes gratis</span>
              
              {/* Triangulito conector - usamos el color final del degradado (Azul) */}
              <div className="absolute 
                bottom-[-6px] left-1/2 -translate-x-1/2 
                md:bottom-auto md:top-1/2 md:-left-2 md:-translate-y-1/2 md:translate-x-0 
                w-4 h-4 bg-primary rotate-45" 
              />
            </motion.div>
          </motion.div>

        <button 
          onClick={() => onNavigate('login')}
          className="group relative px-12 py-5 bg-primary text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
        >
          <span className="relative z-10">Iniciar sesión</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
      </section>
      

      {/* SECCIÓN DE PERFILES (CARDS TIPO HARVEY) *
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div 
            onClick={() => onNavigate('login', 'PERSONAL')}
            className="group cursor-pointer p-6 md:p-10 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/[0.04] hover:border-primary/50 transition-all duration-500"
          >
            <Shield className="w-8 h-8 text-primary mb-6 transition-transform group-hover:scale-110" />
            <h4 className="text-2xl font-bold mb-3">Defensa Personal</h4>
            <p className="text-white/40 text-sm leading-relaxed mb-8 italic">Orientación en materia familiar, penal y civil para ciudadanos.</p>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              Iniciar Registro <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('login', 'BUSINESS')}
            className="group cursor-pointer p-6 md:p-10 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/[0.04] hover:border-primary/50 transition-all duration-500"
          >
            <Zap className="w-8 h-8 text-secondary mb-6 transition-transform group-hover:scale-110" />
            <h4 className="text-2xl font-bold mb-3">Blindaje Corporativo</h4>
            <p className="text-white/40 text-sm leading-relaxed mb-8 italic">Contratos, riesgos y cumplimiento mercantil para empresas de alto nivel.</p>
            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
              Perfil Business <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section> /}

      {/* COMPARATIVA MINIMALISTA 
      <section className="py-32 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-primary text-[10px] font-bold uppercase tracking-[0.5em] mb-4">Benchmark</h2>
            <h3 className="text-4xl md:text-6xl font-bold italic tracking-tighter">SISTEMA <span className="text-white/20 text-not-italic font-light">vs</span> TRADICIÓN</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
            {[
              { label: "Objetividad", trad: "Subjetiva / Humana", juxa: "Algorítmica / 100%" },
              { label: "Disponibilidad", trad: "Horario de Oficina", juxa: "24/7 Global" },
              { label: "Costo Inicial", trad: "Honorarios Altos", juxa: "Democratizado" }
            ].map((row, i) => (
              <React.Fragment key={i}>
                <div className="bg-black p-6 md:p-8 text-[10px] uppercase tracking-widest text-primary font-black border-b border-white/5 md:border-b-0">{row.label}</div>
                <div className="bg-black p-6 md:p-8 text-sm text-white/60 italic border-b border-white/5 md:border-b-0 flex justify-between md:block">
                  <span className="md:hidden text-[8px] uppercase tracking-tighter not-italic opacity-40">Tradición:</span>{row.trad}</div>
                <div className="bg-primary/10 p-6 md:p-8 text-sm font-bold text-primary border-l-0 md:border-l border-white/5 flex justify-between md:block">
                  <span className="md:hidden text-[8px] uppercase tracking-tighter opacity-40">Juxa AI:</span>{row.juxa}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ REFINADO 
      <section className="py-40 max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold tracking-tight mb-4 uppercase">Protocolos de Información</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-white/10 transition-all">
              <summary className="list-none flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-white/70 outline-none">
                {faq.q}
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-open:rotate-180 transition-transform">
                  <ArrowRight className="w-3 h-3 rotate-90" />
                </div>
              </summary>
              <p className="mt-4 text-sm text-white/40 leading-relaxed font-light italic">"{faq.a}"</p>
            </details>
          ))}
        </div>
      </section> */}

      {/* FOOTER SIMPLE */}
      <footer className="py-5 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-center md:text-left">
            
            {/* Identidad */}
            <div className="space-y-3">
              <img src="/LOGO2.png" alt="JUXA" className="h-7 w-auto mx-auto md:mx-0 opacity-80" />
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] leading-relaxed">
                El nuevo estándar en derecho
              </p>
            </div>

            {/* Legal */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Protocolos Legales</h4>
              
              <div className="space-y-3">
                {/* Aviso de Privacidad */}
                <a 
                  href="/AVISO_DE_PRIVACIDAD_INTEGRAL_JUXA.pdf" 
                  target="_blank" 
                  className="group flex items-center gap-3 transition-all"
                >
                  <div className="w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <ShieldCheck size={12} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold group-hover:text-primary transition-colors">Privacidad</span>
                    <span className="text-[11px] text-white/60 font-light italic group-hover:text-white transition-colors">Aviso Integral</span>
                  </div>
                </a>

                {/* Términos y Condiciones */}
                <a 
                  href="/TÉRMINOS_Y_CONDICIONES_JUXA.pdf" 
                  target="_blank" 
                  className="group flex items-center gap-3 transition-all"
                >
                  <div className="w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText size={12} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold group-hover:text-primary transition-colors">Servicio</span>
                    <span className="text-[11px] text-white/60 font-light italic group-hover:text-white transition-colors">Términos y Condiciones</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Contacto & Soporte */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Canales de Enlace</h4>
              
              <div className="space-y-3">
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/525618796239?text=Hola%20JUXA,%20solicito%20más%20información%20sobre%20el%20asistente%20legal%20IA." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 transition-all"
                >
                  <div className="w-7 h-7 rounded-full border border-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-black transition-all">
                    <MessageCircle size={12} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold group-hover:text-secondary transition-colors">Información</span>
                    <span className="text-[11px] text-white/60 font-light italic group-hover:text-white transition-colors">WhatsApp: 56 1879 6239</span>
                  </div>
                </a>

                {/* Email Soporte */}
                <a 
                  href="mailto:soporte@juxa.mx"
                  className="group flex items-center gap-3 transition-all"
                >
                  <div className="w-7 h-7 rounded-full border border-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-black transition-all">
                    <Mail size={12} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold group-hover:text-secondary transition-colors">Soporte Técnico</span>
                    <span className="text-[11px] text-white/60 font-light italic group-hover:text-white transition-colors">soporte@juxa.mx</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Línea final de Copyright */}
          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[8px] text-white/30 uppercase tracking-[0.4em]">
              © 2026 JUXA AI | Encriptación de grado legal | Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};