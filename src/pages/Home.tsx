import React, { useState, useCallback } from 'react';
import { useGraphStore } from '../hooks/graphStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodePanel } from '@/components/NodePanel';
import { RelationPanel } from '@/components/RelationPanel';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import './Home.css';

export default function Home() {
  useLocalStorage();
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isRelationPanelOpen, setIsRelationPanelOpen] = useState(false);

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
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.nodes && data.edges) {
              importData(data);
              toast.success('Dados importados com sucesso!');
            } else {
              toast.error('Formato de arquivo inválido');
            }
          } catch (error) {
            toast.error('Erro ao importar arquivo');
          }
        };
        reader.readAsText(file);
      }
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

  return (
    <div className="home-container">
      <Header
        onNewNode={handleNewNode}
        onNewRelation={handleNewRelation}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
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
