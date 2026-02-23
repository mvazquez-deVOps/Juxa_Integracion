import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ShieldAlert, Send, Laptop } from "lucide-react";
import { toast } from "sonner";
import { ApiService } from '../../../services/api';

export function DenunciaModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const savedUser = JSON.parse(localStorage.getItem('juxa_user_data') || '{}');
    const [formData, setFormData] = useState({
        nivel: '',
        categoria: '',
        nombre: '',
        descripcion: ''
    });

const getPlatformInfo = () => {
    const userAgent = navigator.userAgent;
    let platform = "Desconocida";
    if (userAgent.indexOf("Win") !== -1) platform = "Windows";
    if (userAgent.indexOf("Mac") !== -1) platform = "MacOS";
    if (userAgent.indexOf("X11") !== -1) platform = "UNIX";
    if (userAgent.indexOf("Linux") !== -1) platform = "Linux";
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) platform += " (Móvil)";
    
    return `${platform} - ${navigator.vendor || 'Navegador Estándar'}`;
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nivel || !formData.categoria || !formData.nombre || !formData.descripcion) {
        toast.error("Por favor completa todos los campos obligatorios.");
        return;
    }

    setLoading(true);
    
    try {
        const savedUser = JSON.parse(localStorage.getItem('juxa_user_data') || '{}');
        await ApiService.denuncias.enviar({
        ...formData,
        userId: savedUser.id,
        contactoEmail: savedUser.email || 'Usuario no identificado',
        plataforma: getPlatformInfo(),
        fechaHora: new Date().toLocaleString('es-MX')
    });
    
        toast.success("Incidencia enviada correctamente a soporte");
        setFormData({ nivel: '', categoria: '', nombre: '', descripcion: '' });
        setOpen(false);
    } catch (error) {
        console.error("Error en el envío:", error);
        toast.error("No se pudo conectar con el servidor de reportes.");
    } finally {
        setLoading(false);
    }
};

return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 md:px-5 py-2.5 rounded-full border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/20 transition-all mr-3">
                <ShieldAlert size={14} className="text-red-500" />
                <span className="hidden md:inline">Reportar</span>
            </button>
        </DialogTrigger>
        
        <DialogContent className="bg-card border-white/10 text-white sm:max-w-[450px]">
            <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="text-red-500 w-5 h-5" />
                <DialogTitle className="uppercase tracking-widest text-sm font-black text-red-500">Reportar Incidencia</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-xs italic">
                Este reporte será enviado desde: <span className="text-primary-foreground font-bold">{savedUser.email}</span>
            </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-white/50">Nivel de Urgencia</Label>
                <Select onValueChange={(val) => setFormData({...formData, nivel: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Nivel..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-white">
                    <SelectItem value="bajo">Bajo</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="alto">Alto / Crítico</SelectItem>
                    </SelectContent>
                </Select>
                </div>

                <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-white/50">Categoría</Label>
                <Select onValueChange={(val) => setFormData({...formData, categoria: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Tipo..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-white">
                    <SelectItem value="tecnico">Error Técnico</SelectItem>
                    <SelectItem value="interfaz">Interfaz / UI</SelectItem>
                    <SelectItem value="datos">Error de Datos</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-white/50">Título del Incidente</Label>
                <Input 
                placeholder="Breve nombre del problema" 
                className="bg-white/5 border-white/10 rounded-xl"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-white/50">Descripción Detallada</Label>
                <Textarea 
                placeholder="Describa los pasos que realizó y lo que sucedió..." 
                className="bg-white/5 border-white/10 rounded-xl min-h-[120px]"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
            </div>

            <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-lg border border-white/5">
                <Laptop size={12} className="text-white/30" />
                <span className="text-[8px] text-white/30 uppercase tracking-tighter">
                Detección automática: {getPlatformInfo()}
                </span>
            </div>

            <DialogFooter>
                <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl py-6 shadow-lg shadow-red-600/20"
                >
                {loading ? 'Transmitiendo...' : (
                    <span className="flex items-center gap-2">
                    <Send size={12} />
                    Enviar a soporte
                    </span>
                )}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );
}