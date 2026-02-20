
import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  Connection, 
  Edge,
  MarkerType,
  Node,
  useNodesState,
  useEdgesState
} from 'reactflow';
import { JuxaNode } from './CustomNodes';
import { Sparkles, Layout, ZoomIn, ZoomOut, Download, GitBranch } from 'lucide-react';
import { UserRole } from '../types';

interface ArgumentCanvasProps {
    documentText: string;
    role: UserRole;
    nodes: Node[];
    edges: Edge[];
    onNodesChange: any; 
    onEdgesChange: any;
    isLoading: boolean;
    onGenerate: () => void;
}

const nodeTypes = {
    custom: JuxaNode,
};

export const ArgumentCanvas: React.FC<ArgumentCanvasProps> = ({ 
    documentText, 
    role, 
    nodes, 
    edges, 
    onNodesChange,
    onEdgesChange,
    isLoading,
    onGenerate
}) => {
    const [localNodes, setNodes, onNodesChangeLocal] = useNodesState(nodes);
    const [localEdges, setEdges, onEdgesChangeLocal] = useEdgesState(edges);

    // Sync from parent (when AI generates)
    React.useEffect(() => {
        setNodes(nodes);
        setEdges(edges);
    }, [nodes, edges]);

    const onConnectLocal = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#64748b' } }, eds)),
        [setEdges]
    );

    return (
        <div className="w-full h-full relative bg-[#050505] animate-fade-in" style={{ width: '100%', height: '100%' }}>
            {/* Toolbar Flotante */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 bg-[#0f0f11] border border-white/10 p-1.5 rounded-xl shadow-2xl">
                <button 
                    onClick={onGenerate}
                    disabled={isLoading || !documentText}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${isLoading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105'}`}
                >
                    {isLoading ? (
                        <div className="animate-spin w-3 h-3 border-2 border-white/20 border-t-white rounded-full mr-2"/>
                    ) : (
                        <Sparkles className="w-3 h-3 mr-2" />
                    )}
                    {localNodes.length > 0 ? 'REGENERAR ARGUMENTACIÓN' : 'GENERAR MAPA CON IA'}
                </button>
                <div className="w-px h-6 bg-white/10 mx-2"></div>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg" title="Auto Layout">
                    <Layout className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg" title="Exportar Imagen">
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Empty State */}
            {localNodes.length === 0 && !isLoading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                     <GitBranch className="w-24 h-24 text-slate-800 mb-4" />
                     <h3 className="text-slate-500 text-lg font-bold">Canvas de Argumentación Vacío</h3>
                     <p className="text-slate-600 text-sm max-w-md text-center mt-2">
                         La IA generará automáticamente el mapa lógico al entrar aquí si hay texto disponible.
                     </p>
                 </div>
            )}

            <ReactFlow
                nodes={localNodes}
                edges={localEdges}
                onNodesChange={onNodesChangeLocal}
                onEdgesChange={onEdgesChangeLocal}
                onConnect={onConnectLocal}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#050505]"
                minZoom={0.1}
                style={{ width: '100%', height: '100%' }}
            >
                <Background color="#1e293b" gap={20} size={1} />
                <Controls className="!bg-[#0f0f11] !border-white/10 !m-4 !rounded-lg overflow-hidden shadow-xl" />
                <MiniMap 
                    nodeStrokeColor={(n) => {
                        if (n.data.type === 'hecho') return '#3b82f6';
                        if (n.data.type === 'prueba') return '#f59e0b';
                        return '#64748b';
                    }}
                    nodeColor="#1e293b"
                    className="!bg-[#0f0f11] !border !border-white/10 !rounded-lg !bottom-4 !right-4 !w-48 !h-32" 
                    maskColor="rgba(0, 0, 0, 0.7)"
                />
            </ReactFlow>
        </div>
    );
};
