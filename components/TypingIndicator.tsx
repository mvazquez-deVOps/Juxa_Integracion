import { Scale } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="flex-1 max-w-3xl">
        {/* Cambiamos bg-white por bg-white/5 (transparencia) y ajustamos el borde */}
        <div className="rounded-2xl px-6 py-4 shadow-sm bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {/* Ajustamos el color de los puntos para que brillen sutilmente en el fondo oscuro */}
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            {/* Texto en gris suave con tracking para estilo "Tech" */}
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">
              Escribiendo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
