import React, { useState, useEffect } from 'react';
import { useGraphStore, NodeType, ComplexityLevel, GraphNode } from '../hooks/graphStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import './NodePanel.css';

interface NodePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORM_VAZIO = {
  nome: '',
  descricao: '',
  data_inicio: '',
  data_fim: '',
  ferramentas: [] as string[],
  tarefas: [] as string[],
  complexidade: 'Média' as ComplexityLevel,
  conhecimentos: [] as string[],
  resultados: [] as string[],
  finalidade: '',
  contexto: '',
  exemplos_aplicacao: [] as string[],
};

type FormData = typeof FORM_VAZIO;

function extrairFormData(node: GraphNode): FormData {
  const base = { ...FORM_VAZIO, nome: node.nome };
  if (node.tipo === 'projeto') {
    return {
      ...base,
      descricao: node.descricao ?? '',
      data_inicio: node.data_inicio ?? '',
      data_fim: node.data_fim ?? '',
      ferramentas: node.ferramentas ?? [],
      tarefas: node.tarefas ?? [],
      complexidade: node.complexidade ?? 'Média',
      conhecimentos: node.conhecimentos ?? [],
      resultados: node.resultados ?? [],
    };
  }
  if (node.tipo === 'ferramenta') {
    return {
      ...base,
      finalidade: node.finalidade ?? '',
      contexto: node.contexto ?? '',
    };
  }
  // conhecimento
  return {
    ...base,
    descricao: node.descricao ?? '',
    exemplos_aplicacao: node.exemplos_aplicacao ?? [],
  };
}

export const NodePanel: React.FC<NodePanelProps> = ({ isOpen, onClose }) => {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const nodes = useGraphStore((s) => s.nodes);
  const addNode = useGraphStore((s) => s.addNode);
  const updateNode = useGraphStore((s) => s.updateNode);
  const deleteNode = useGraphStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const [isCreating, setIsCreating] = useState(true);
  const [nodeType, setNodeType] = useState<NodeType>('projeto');
  const [formData, setFormData] = useState<FormData>(FORM_VAZIO);

  const [listaInput, setListaInput] = useState('');

  // Carrega dados ao selecionar nó
  useEffect(() => {
    if (selectedNode) {
      setIsCreating(false);
      setNodeType(selectedNode.tipo);
      setFormData(extrairFormData(selectedNode));
    } else if (isOpen) {
      setIsCreating(true);
      setFormData(FORM_VAZIO);
    }
  }, [selectedNode, isOpen]);

  // Ao trocar o tipo durante criação, reseta campos específicos
  const handleTipoChange = (tipo: NodeType) => {
    setNodeType(tipo);
    setFormData(FORM_VAZIO);
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Nome do nó é obrigatório');
      return;
    }

    const nodeData: any = { nome: formData.nome.trim(), tipo: nodeType };

    if (nodeType === 'projeto') {
      nodeData.descricao = formData.descricao;
      nodeData.data_inicio = formData.data_inicio || undefined;
      nodeData.data_fim = formData.data_fim || undefined;
      nodeData.ferramentas = formData.ferramentas;
      nodeData.tarefas = formData.tarefas;
      nodeData.complexidade = formData.complexidade;
      nodeData.conhecimentos = formData.conhecimentos;
      nodeData.resultados = formData.resultados;
    } else if (nodeType === 'ferramenta') {
      nodeData.finalidade = formData.finalidade;
      nodeData.contexto = formData.contexto;
    } else {
      nodeData.descricao = formData.descricao;
      nodeData.exemplos_aplicacao = formData.exemplos_aplicacao;
    }

    if (selectedNode) {
      updateNode(selectedNodeId!, nodeData);
    } else {
      addNode(nodeData as any);
    }

    setIsCreating(false);
    setFormData(FORM_VAZIO);
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Tem certeza que deseja deletar este nó?')) {
      deleteNode(selectedNodeId);
      onClose();
    }
  };

  // Helpers para listas
  const addToList = (field: keyof FormData) => {
    const val = listaInput.trim();
    if (!val) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), val],
    }));
    setListaInput('');
  };

  const removeFromList = (field: keyof FormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  const renderLista = (field: keyof FormData, placeholder: string) => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={listaInput}
          onChange={(e) => setListaInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addToList(field)}
        />
        <Button onClick={() => addToList(field)} size="sm">
          <Plus size={16} />
        </Button>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {(formData[field] as string[]).map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-secondary p-2 rounded-md"
          >
            <span className="text-sm truncate">{item}</span>
            <button
              onClick={() => removeFromList(field, i)}
              className="text-destructive hover:text-destructive/80 shrink-0 ml-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

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
          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Nó</label>
            <Select value={nodeType} onValueChange={(v) => handleTipoChange(v as NodeType)}>
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

          {/* Nome (comum a todos) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Nome do nó"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
            />
          </div>

          {/* ─── Campos específicos por tipo ─── */}

          {nodeType === 'projeto' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descrição do projeto"
                  value={formData.descricao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Início</label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, data_inicio: e.target.value }))}
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
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, complexidade: v as ComplexityLevel }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ferramentas</label>
                {renderLista('ferramentas', 'Ex: Python, React, Docker')}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tarefas</label>
                {renderLista('tarefas', 'Ex: Coletar dados, Validar')}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conhecimentos</label>
                {renderLista('conhecimentos', 'Ex: Machine Learning, Estatística')}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados</label>
                {renderLista('resultados', 'Ex: Relatório final, Dashboard')}
              </div>
            </>
          )}

          {nodeType === 'ferramenta' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Finalidade</label>
                <Textarea
                  placeholder="Para que serve esta ferramenta?"
                  value={formData.finalidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, finalidade: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contexto</label>
                <Textarea
                  placeholder="Em que contexto esta ferramenta é utilizada?"
                  value={formData.contexto}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contexto: e.target.value }))}
                  rows={3}
                />
              </div>
            </>
          )}

          {nodeType === 'conhecimento' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descrição do conhecimento"
                  value={formData.descricao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Exemplos de Aplicação</label>
                {renderLista('exemplos_aplicacao', 'Ex: Classificação de imagens, Previsão de vendas')}
              </div>
            </>
          )}

          {/* Botões */}
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
