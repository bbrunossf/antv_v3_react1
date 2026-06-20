import React, { useState } from 'react';
import { useGraphStore } from '../hooks/graphStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Trash2 } from 'lucide-react';
import './RelationPanel.css';

interface RelationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RelationPanel: React.FC<RelationPanelProps> = ({ isOpen, onClose }) => {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const addEdge = useGraphStore((state) => state.addEdge);
  const deleteEdge = useGraphStore((state) => state.deleteEdge);

  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relationType, setRelationType] = useState('relacionado');

  const handleAddRelation = () => {
    if (!sourceId || !targetId) {
      alert('Selecione nó de origem e destino');
      return;
    }

    if (sourceId === targetId) {
      alert('Não é possível criar relação com o mesmo nó');
      return;
    }

    addEdge(sourceId, targetId, relationType);
    setSourceId('');
    setTargetId('');
    setRelationType('relacionado');
  };

  if (!isOpen) return null;

  return (
    <div className="relation-panel-overlay" onClick={onClose}>
      <Card className="relation-panel" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Criar Relação</CardTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Source Node Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nó de Origem</label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nó" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.nome} ({node.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Node Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nó de Destino</label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nó" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.nome} ({node.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relation Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Relação</label>
            <Select value={relationType} onValueChange={setRelationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relacionado">Relacionado</SelectItem>
                <SelectItem value="usa">Usa</SelectItem>
                <SelectItem value="requer">Requer</SelectItem>
                <SelectItem value="precede">Precede</SelectItem>
                <SelectItem value="sucede">Sucede</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddRelation} className="flex-1">
              Criar Relação
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>

          {/* Existing Relations */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Relações Existentes</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {edges.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma relação criada</p>
              ) : (
                edges.map((edge) => {
                  const source = nodes.find((n) => n.id === edge.source);
                  const target = nodes.find((n) => n.id === edge.target);
                  return (
                    <div
                      key={edge.id}
                      className="flex items-center justify-between bg-secondary p-2 rounded-md text-xs"
                    >
                      <span>
                        {source?.nome} → {target?.nome}
                      </span>
                      <button
                        onClick={() => deleteEdge(edge.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
