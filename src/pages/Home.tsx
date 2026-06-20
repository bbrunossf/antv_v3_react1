import React, { useState, useCallback } from 'react';
import { useGraphStore } from '../hooks/graphStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodePanel } from '@/components/NodePanel';
import { RelationPanel } from '@/components/RelationPanel';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import './Home.css';

const TIPOS_VALIDOS = ['projeto', 'ferramenta', 'conhecimento'] as const;
const TIPO_PADRAO = 'projeto';

function normalizeImportData(data: any): {
  nodes: any[];
  edges: any[];
  warnings: string[];
} | string {
  if (!data || typeof data !== 'object') {
    return 'O arquivo não contém um objeto JSON válido.';
  }
  if (!Array.isArray(data.nodes)) {
    return 'Campo "nodes" ausente ou não é um array.';
  }

  const warnings: string[] = [];
  const nodes: any[] = [];
  const rawEdges = Array.isArray(data.edges) ? data.edges : [];

  // Normaliza nós
  for (let i = 0; i < data.nodes.length; i++) {
    const src = data.nodes[i];

    // Validações obrigatórias
    if (!src.nome) {
      return `Nó #${i + 1}: campo "nome" ausente (obrigatório).`;
    }

    // Auto-preenchimento
    if (!src.id) {
      src.id = uuidv4();
      warnings.push(`Nó "${src.nome}": id gerado automaticamente → ${src.id}`);
    }
    if (!src.tipo) {
      src.tipo = TIPO_PADRAO;
      warnings.push(`Nó "${src.nome}": tipo ausente, definido como "${TIPO_PADRAO}".`);
    }
    if (src.tipo && !TIPOS_VALIDOS.includes(src.tipo)) {
      return `Nó "${src.nome}" (${src.id}): tipo "${src.tipo}" inválido. Tipos válidos: ${TIPOS_VALIDOS.join(', ')}.`;
    }

    if (src.tipo === 'ferramenta') {
      nodes.push({
        id: src.id,
        tipo: 'ferramenta',
        nome: src.nome,
        finalidade: src.finalidade ?? '',
        contexto: src.contexto ?? '',
        x: src.x ?? undefined,
        y: src.y ?? undefined,
      });
    } else if (src.tipo === 'conhecimento') {
      nodes.push({
        id: src.id,
        tipo: 'conhecimento',
        nome: src.nome,
        descricao: src.descricao ?? '',
        exemplos_aplicacao: src.exemplos_aplicacao ?? [],
        x: src.x ?? undefined,
        y: src.y ?? undefined,
      });
    } else {
      // projeto (padrão)
      nodes.push({
        id: src.id,
        tipo: 'projeto',
        nome: src.nome,
        descricao: src.descricao ?? '',
        data_inicio: src.data_inicio ?? undefined,
        data_fim: src.data_fim ?? undefined,
        ferramentas: src.ferramentas ?? [],
        tarefas: src.tarefas ?? [],
        complexidade: src.complexidade ?? undefined,
        conhecimentos: src.conhecimentos ?? [],
        resultados: src.resultados ?? [],
        x: src.x ?? undefined,
        y: src.y ?? undefined,
      });
    }

  }

  // Normaliza arestas
  const edges: any[] = [];
  for (let i = 0; i < rawEdges.length; i++) {
    const src = rawEdges[i];

    if (!src.source) {
      return `Aresta #${i + 1}: campo "source" ausente (obrigatório).`;
    }
    if (!src.target) {
      return `Aresta #${i + 1}: campo "target" ausente (obrigatório).`;
    }

    if (!src.id) {
      src.id = uuidv4();
      warnings.push(`Aresta ${src.source} → ${src.target}: id gerado automaticamente.`);
    }

    edges.push({
      id: src.id,
      source: src.source,
      target: src.target,
      tipo: src.tipo ?? 'relacionado',
    });
  }

  return { nodes, edges, warnings };
}


export default function Home() {
  useLocalStorage();
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isRelationPanelOpen, setIsRelationPanelOpen] = useState(false);

  const nodes = useGraphStore((state) => state.nodes);
  const addNode = useGraphStore((state) => state.addNode);
  const exportData = useGraphStore((state) => state.exportData);
  const importData = useGraphStore((state) => state.importData);
  const clearAll = useGraphStore((state) => state.clearAll);

  const handleNewNode = useCallback(() => {
    useGraphStore.setState({ selectedNodeId: null });
    setIsNodePanelOpen(true);
  }, []);

  const handleNewRelation = useCallback(() => {
    setIsRelationPanelOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    const data = exportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech-graph-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  }, [exportData]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        // 1. Parse JSON
        let data: any;
        try {
          data = JSON.parse(event.target.result);
        } catch (parseError: any) {
          toast.error(`JSON inválido: ${parseError.message}`);
          return;
        }

        // 2. Valida e normaliza (preenche ids, defaults, etc.)
        const result = normalizeImportData(data);
        if (typeof result === 'string') {
          toast.error(result);
          return;
        }

        // 3. Exibe avisos (ids gerados, tipo padrão, etc.)
        for (const warning of result.warnings) {
          toast.warning(warning);
        }

        // 4. Importa
        try {
          importData(result);
          const edgeMsg = result.edges.length > 0
            ? ` e ${result.edges.length} arestas`
            : ' (sem arestas)';
          toast.success(`Importado: ${result.nodes.length} nós${edgeMsg}.`);
        } catch (importError: any) {
          toast.error(`Erro ao aplicar dados: ${importError.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importData]);


  const handleClear = useCallback(() => {
    if (
      confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')
    ) {
      clearAll();
      toast.success('Todos os dados foram limpos');
    }
  }, [clearAll]);

  const handleSyncTools = useCallback(() => {
    const projetos = nodes.filter(
      (n): n is import('../hooks/graphStore').ProjetoNode => n.tipo === 'projeto'
    );
    const ferramentasExistentes = new Set(
      nodes
        .filter((n) => n.tipo === 'ferramenta')
        .map((n) => n.nome.trim().toLowerCase())
    );

    const novasFerramentas = new Set<string>();

    for (const projeto of projetos) {
      for (const nomeBruto of projeto.ferramentas ?? []) {
        const nome = nomeBruto.trim();
        if (nome && !ferramentasExistentes.has(nome.toLowerCase())) {
          novasFerramentas.add(nome);
          ferramentasExistentes.add(nome.toLowerCase()); // evita duplicadas na mesma batelada
        }
      }
    }

    if (novasFerramentas.size === 0) {
      toast.info('Nenhuma ferramenta nova encontrada. Todas já possuem nós.');
      return;
    }

    for (const nome of novasFerramentas) {
      addNode({
        tipo: 'ferramenta',
        nome,
      } as any);
    }

    toast.success(`${novasFerramentas.size} nó(s) de ferramenta criado(s).`);
  }, [nodes, addNode]);

  return (
    <div className="home-container">
      <Header
        onNewNode={handleNewNode}
        onNewRelation={handleNewRelation}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
        onSyncTools={handleSyncTools}
      />

      <div className="graph-container">
        <GraphCanvas
          onNodeSelect={(nodeId) => {
            if (nodeId) {
              setIsNodePanelOpen(true);
            }
          }}
        />
      </div>

      <NodePanel isOpen={isNodePanelOpen} onClose={() => setIsNodePanelOpen(false)} />
      <RelationPanel isOpen={isRelationPanelOpen} onClose={() => setIsRelationPanelOpen(false)} />
    </div>
  );
}
