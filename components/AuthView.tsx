import React, { useState } from 'react';
import { UserData, UserType } from '../types'; 
import { Eye, EyeOff, ShieldCheck, MessageSquare} from 'lucide-react';
import { ApiService } from '../services/api'; 


interface AuthViewProps {
    onNavigate: (view: string, profile?: UserType, userData?: UserData) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

  // Mantenemos el modo de recuperación de contraseña para el futuro
    const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'verify-code'>('login');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
        let response;

        if (isRegister) {
            response = await ApiService.auth.register({ name, email, password, phone });
        } else {
            response = await ApiService.auth.login({ email, password });
        }

      // 1. Construimos el objeto del usuario que App.tsx espera recibir
    const sessionUser: UserData = {
        id: response.userId || response.id,
        name: response.name || email, // Fallback si no viene nombre
        email: response.email || email,
        phone: response.phone,
        userType: response.personType || 'PERSONAL'
    };

      // 2. Guardamos en el almacenamiento local
    localStorage.setItem('juxa_token', response.token || 'dummy-token');
    localStorage.setItem('juxa_user_data', JSON.stringify(sessionUser));

      // 3. Avisamos a App.tsx que el login fue exitoso y pasamos el usuario
    onNavigate('LANDING', sessionUser.userType, sessionUser);

    } catch (err: any) {
        setError(err.message || "Error al conectar con los servicios de JUXA.");
    } finally {
        setIsLoading(false);
    }
};

return (
   <div className="min-h-screen flex flex-col bg-[#050505]">
            {/* 1. CONTENEDOR PRINCIPAL DIVIDIDO */}
            <div className="flex-1 flex flex-col lg:flex-row">
                
                {/* LADO IZQUIERDO: Mensaje de Impacto */}
                <div className="flex-1 flex flex-col justify-center items-center lg:items-center px-10 lg:px-20 border-r border-white/5 py-12">
                    <div className="max-w-2xl w-full flex flex-col items-center lg:items-center text-center">
                        {/* Logo JUXA */}
                        <img 
                            src="/LOGO2.png" 
                            alt="JUXA" 
                            className="h-16 md:h-24 w-auto mb-10 drop-shadow-[0_0_15px_rgba(39,85,194,0.3)]" 
                        />
                        
                        {/* Título Principal */}
                        <h1 className="text-6xl lg:text-8xl font-[1000] text-white leading-[0.95] tracking-tighter text-center lg:text-center">
                            EL FUTURO <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 italic font-light tracking-tighter">
                                DEL DERECHO.
                            </span>
                        </h1>
                        
                        {/* Descripción */}
                        <br />
                        <p className="ext-white/50 text-lg md:text-xl max-w-2xl text-center font-light leading-relaxed mb-12 px-4">
                            Análisis jurídico de alta precisión con inteligencia artificial. <br className="hidden md:block"/>
                            Estrategia legal inmediata, accesible y privada.
                        </p>
                    </div>
                </div>

                {/* LADO DERECHO: Contenedor del Login */}
                <div className="w-full lg:w-[550px] flex items-center justify-center p-6 lg:p-12 bg-[#080808]">
                    <div className="w-full max-w-md bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                        {/* Brillo sutil de fondo */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
                        
                        <div className="relative z-10 text-center mb-8">
                            <h2 className="text-3xl font-[950] text-white uppercase tracking-tighter">
                                {isRegister ? 'Únete a JUXA' : 'Bienvenido a JUXA'}
                            </h2>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">
                                Tu Asistente Legal Inteligente
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-[10px] font-black uppercase text-center border border-red-500/20 mb-6">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
                            {isRegister && (
                                <div className="space-y-4 animate-fade-in">
                                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-white transition-all text-sm" placeholder="Nombre Completo" />
                                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-white transition-all text-sm" placeholder="Teléfono" />
                                </div>
                            )}
                            
                            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-white transition-all text-sm" placeholder="Email" />
                        
                            <div className="relative">
                                <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-white transition-all text-sm pr-12" placeholder="Contraseña" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="flex justify-end mt-1">
                                <button type="button" onClick={() => setMode('forgot-password')} className="text-[11px] text-white/50 hover:text-blue-400 transition-all">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            <button disabled={isLoading} className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black rounded-2xl uppercase tracking-[0.3em] text-[10px] transition-all shadow-lg active:scale-95 mt-4" type="submit">
                                {isLoading ? 'Cargando...' : (isRegister ? 'Crear Cuenta' : 'Acceder')}
                            </button>
                        </form>

                        <div className="pt-6 mt-6 border-t border-white/5 relative z-10 text-center">
                            <button onClick={() => { setIsRegister(!isRegister); setError(null); }} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors">
                                {isRegister ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FOOTER SIMPLIFICADO */}
            <footer className="border-t border-white/5 py-6 px-10 bg-black z-10">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 gap-6">
                    
                    {/* Sección Izquierda: Identidad y Seguridad */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <span>© 2026 JUXA AI</span>
                        <span className="flex items-center text-emerald-600/80">
                            <ShieldCheck size={12} className="mr-1.5" />
                            Encriptación de grado legal
                        </span>
                        <span>Todos los derechos reservados</span>
                    </div>

                    {/* Sección Derecha: Contacto y Legales */}
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
                        <a href="https://wa.me/525618796239?text=Hola,%20solicito%20más%20información%20sobre%20el%20asistente%20legal%20JUXA%20IA." target="_blank" className="flex items-center hover:text-green-500 transition-colors">
                            <MessageSquare size={12} className="mr-1.5" />
                            WhatsApp: 56 1879 6239
                        </a>
                        <a href="mailto:soporte@juxa.mx" className="hover:text-blue-400 transition-colors">
                            soporte@juxa.mx
                        </a>
                        <div className="flex gap-4 border-l border-white/10 pl-6">
                            <a href="/AVISO_DE_PRIVACIDAD_INTEGRAL_JUXA.pdf" target="_blank" className="hover:text-white transition-colors">Privacidad</a>
                            <a href="/TÉRMINOS_Y_CONDICIONES_JUXA.pdf" target="_blank" className="hover:text-white transition-colors">Términos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};