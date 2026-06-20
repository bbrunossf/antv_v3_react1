import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type NodeType = 'projeto' | 'ferramenta' | 'conhecimento' | 'tag';
export type ComplexityLevel = 'Baixa' | 'Média' | 'Alta';

export interface ProjetoNode {
  id: string;
  tipo: 'projeto';
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  ferramentas?: string[];
  tarefas?: string[];
  complexidade?: ComplexityLevel;
  conhecimentos?: string[];
  resultados?: string[];
  x?: number;
  y?: number;
}

export interface FerramentaNode {
  id: string;
  tipo: 'ferramenta';
  nome: string;
  finalidade?: string;
  contexto?: string;
  x?: number;
  y?: number;
}

export interface ConhecimentoNode {
  id: string;
  tipo: 'conhecimento';
  nome: string;
  descricao?: string;
  exemplos_aplicacao?: string[];
  x?: number;
  y?: number;
}

export interface TagNode {
  id: string;
  tipo: 'tag';
  nome: string;
  peso?: number;
  descricao?: string;
  x?: number;
  y?: number;
}

export type GraphNode = ProjetoNode | FerramentaNode | ConhecimentoNode | TagNode;

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  tipo?: string;
}

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;

  // Node actions
  addNode: (node: Omit<GraphNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<GraphNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // Edge actions
  addEdge: (source: string, target: string, tipo?: string) => string;
  deleteEdge: (id: string) => void;

  // Batch operations
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;

  // Export/Import
  exportData: () => { nodes: GraphNode[]; edges: GraphEdge[] };
  importData: (data: { nodes: GraphNode[]; edges: GraphEdge[] }) => void;
  clearAll: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  addNode: (node) => {
    const id = uuidv4();
    const newNode: GraphNode = { ...node, id };
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    return id;
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  addEdge: (source, target, tipo = 'relacionado') => {
    const id = uuidv4();
    const newEdge: GraphEdge = { id, source, target, tipo };
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
    return id;
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  exportData: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
    };
  },

  importData: (data) => {
    set({
      nodes: data.nodes,
      edges: data.edges,
    });
  },

  clearAll: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  },
}));
