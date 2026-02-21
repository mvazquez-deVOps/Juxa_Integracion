import React, { useState } from 'react';
import { UserData, UserType } from '../types'; 
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="max-w-md mx-auto py-20 px-6 min-h-screen flex items-center justify-center bg-black">
        <div className="bg-[#0A0A0A] p-10 rounded-[3rem] shadow-2xl border border-blue-500/30 space-y-10 w-full backdrop-blur-md">
            <div className="text-center">
            <div className="flex justify-center mb-6">
                <img src="/LOGO2.png" alt="JUXA" className="h-14 w-auto" />
            </div>
            <h2 className="text-3xl font-[950] text-white uppercase tracking-tighter">
                {isRegister ? 'Únete a JUXA' : 'Bienvenido a JUXA'}
            </h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">
                Tu Asistente Legal Inteligente
            </p>
            </div>

            {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-[10px] font-black uppercase text-center border border-red-500/20">
                {error}
            </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
                <div className="space-y-4">
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 text-white transition-all text-sm" placeholder="Nombre Completo" />
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 text-white transition-all text-sm" placeholder="Teléfono" />
                </div>
            )}
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 text-white transition-all text-sm" placeholder="Email" />
            
            <div className="relative">
                <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 text-white transition-all text-sm pr-12" placeholder="Contraseña" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <div className="flex justify-end mt-1">
                <button type="button" onClick={() => setMode('forgot-password')} className="text-[11px] text-white/50 hover:text-white transition-all">
                ¿Olvidaste tu contraseña?
                </button>
            </div>

            <button disabled={isLoading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl uppercase tracking-[0.3em] text-[10px] transition-all shadow-lg active:scale-95 mt-4" type="submit">
                {isLoading ? 'Cargando...' : (isRegister ? 'Crear Cuenta' : 'Acceder')}
            </button>
            </form>

            <div className="pt-4 border-t border-white/5">
            <button onClick={() => { setIsRegister(!isRegister); setError(null); }} className="w-full text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors py-2">
                {isRegister ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
            </button>
            </div>
        </div>
        </div>
    );
};