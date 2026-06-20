import React, { useState, useEffect } from 'react';
import { useGraphStore, NodeType, ComplexityLevel } from '../hooks/graphStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Trash2 } from 'lucide-react';
import './NodePanel.css';

interface NodePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NodePanel: React.FC<NodePanelProps> = ({ isOpen, onClose }) => {
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
  const nodes = useGraphStore((state) => state.nodes);
  const addNode = useGraphStore((state) => state.addNode);
  const updateNode = useGraphStore((state) => state.updateNode);
  const deleteNode = useGraphStore((state) => state.deleteNode);

  const [isCreating, setIsCreating] = useState(false);
  const [nodeType, setNodeType] = useState<NodeType>('projeto');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    ferramentas: [] as string[],
    tarefas: [] as string[],
    complexidade: 'Média' as ComplexityLevel,
  });

  const [newTool, setNewTool] = useState('');
  const [newTask, setNewTask] = useState('');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Load selected node data
  useEffect(() => {
    if (selectedNode) {
      setIsCreating(false);
      setNodeType(selectedNode.tipo);
      setFormData({
        nome: selectedNode.nome || '',
        descricao: selectedNode.descricao || '',
        data_inicio: selectedNode.data_inicio || '',
        data_fim: selectedNode.data_fim || '',
        ferramentas: selectedNode.ferramentas || [],
        tarefas: selectedNode.tarefas || [],
        complexidade: selectedNode.complexidade || 'Média',
      });
    } else {
      setIsCreating(true);
      setFormData({
        nome: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        ferramentas: [],
        tarefas: [],
        complexidade: 'Média',
      });
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Nome do nó é obrigatório');
      return;
    }

    if (selectedNode) {
      updateNode(selectedNodeId!, {
        ...formData,
        tipo: nodeType,
      });
    } else {
      addNode({
        tipo: nodeType,
        ...formData,
      });
    }

    setIsCreating(false);
    setFormData({
      nome: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      ferramentas: [],
      tarefas: [],
      complexidade: 'Média',
    });
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Tem certeza que deseja deletar este nó?')) {
      deleteNode(selectedNodeId);
      onClose();
    }
  };

  const handleAddTool = () => {
    if (newTool.trim()) {
      setFormData((prev) => ({
        ...prev,
        ferramentas: [...prev.ferramentas, newTool.trim()],
      }));
      setNewTool('');
    }
  };

  const handleRemoveTool = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ferramentas: prev.ferramentas.filter((_, i) => i !== index),
    }));
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setFormData((prev) => ({
        ...prev,
        tarefas: [...prev.tarefas, newTask.trim()],
      }));
      setNewTask('');
    }
  };

  const handleRemoveTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tarefas: prev.tarefas.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="node-panel-overlay" onClick={onClose}>
      <Card className="node-panel" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{selectedNode ? 'Editar Nó' : 'Novo Nó'}</CardTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Node Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Nó</label>
            <Select value={nodeType} onValueChange={(value) => setNodeType(value as NodeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="projeto">Projeto</SelectItem>
                <SelectItem value="ferramenta">Ferramenta</SelectItem>
                <SelectItem value="conhecimento">Conhecimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Nome do nó"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Descrição do nó"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Tabs for additional fields */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="tools">Ferramentas</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Início</label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, data_inicio: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fim</label>
                  <Input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData((prev) => ({ ...prev, data_fim: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Complexidade</label>
                <Select
                  value={formData.complexidade}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, complexidade: value as ComplexityLevel }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adicionar Ferramenta</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Python, React, etc"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
                  />
                  <Button onClick={handleAddTool} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ferramentas</label>
                <div className="space-y-2">
                  {formData.ferramentas.map((tool, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-secondary p-2 rounded-md"
                    >
                      <span className="text-sm">{tool}</span>
                      <button
                        onClick={() => handleRemoveTool(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adicionar Tarefa</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Coletar dados, Validar resultados"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Button onClick={handleAddTask} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tarefas</label>
                <div className="space-y-2">
                  {formData.tarefas.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-secondary p-2 rounded-md"
                    >
                      <span className="text-sm">{task}</span>
                      <button
                        onClick={() => handleRemoveTask(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {selectedNode ? 'Atualizar' : 'Criar'}
            </Button>
            {selectedNode && (
              <Button onClick={handleDelete} variant="destructive">
                Deletar
              </Button>
            )}
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
