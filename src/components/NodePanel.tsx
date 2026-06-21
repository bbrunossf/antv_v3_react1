import React, { useState, useEffect } from 'react';
import { useGraphStore, NodeType, ComplexityLevel, GraphNode } from '../hooks/graphStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  tags: [] as { nome: string; peso: number }[],
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
      tags: node.tags ?? [],
    };
  }
  if (node.tipo === 'ferramenta') {
    return { ...base, finalidade: node.finalidade ?? '', contexto: node.contexto ?? '' };
  }
  return { ...base };
}

export const NodePanel: React.FC<NodePanelProps> = ({ isOpen, onClose }) => {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const addNode = useGraphStore((s) => s.addNode);
  const updateNode = useGraphStore((s) => s.updateNode);
  const deleteNode = useGraphStore((s) => s.deleteNode);
  const deleteEdge = useGraphStore((s) => s.deleteEdge);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const visible = isOpen || !!selectedNodeId;

  const [nodeType, setNodeType] = useState<NodeType>('projeto');
  const [formData, setFormData] = useState<FormData>(FORM_VAZIO);
  const [listaInputs, setListaInputs] = useState<Record<string, string>>({});

  // Carrega dados ao selecionar nó ou abrir em modo criação
  useEffect(() => {
    if (selectedNode) {
      setNodeType(selectedNode.tipo);
      setFormData(extrairFormData(selectedNode));
    } else if (isOpen) {
      setFormData(FORM_VAZIO);
    }
  }, [selectedNode, isOpen]);

  const handleTipoChange = (tipo: NodeType) => {
    setNodeType(tipo);
    setFormData(FORM_VAZIO);
  };

  // ── Helpers de lista ──
  const addToList = (field: keyof FormData) => {
    const val = (listaInputs[field] ?? '').trim();
    if (!val) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), val],
    }));
    setListaInputs((prev) => ({ ...prev, [field]: '' }));
  };

  const removeFromList = (field: keyof FormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const renderLista = (field: keyof FormData, placeholder: string) => (
    <div className="node-panel-section">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={listaInputs[field] ?? ''}
          onChange={(e) => setListaInputs((prev) => ({ ...prev, [field]: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && addToList(field)}
        />
        <Button onClick={() => addToList(field)} size="sm"><Plus size={16} /></Button>
      </div>
      <div className="max-h-28 overflow-y-auto space-y-1">
        {(formData[field] as string[]).map((item, i) => (
          <div key={i} className="node-panel-list-item">
            <span className="truncate text-sm">{item}</span>
            <button onClick={() => removeFromList(field, i)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Save ──
  const handleSave = () => {
    if (!formData.nome.trim()) { alert('Nome do nó é obrigatório'); return; }

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
      nodeData.tags = formData.tags;

      // Remove edges e nós tag órfãos ao editar
      if (selectedNode && selectedNode.tipo === 'projeto') {
        const oldNames = (selectedNode.tags ?? []).map((t) => t.nome.toLowerCase());
        const newNames = (formData.tags ?? []).map((t: { nome: string }) => t.nome.toLowerCase());
        for (const nome of oldNames.filter((n) => !newNames.includes(n))) {
          const tagNode = nodes.find((n) => n.tipo === 'tag' && n.nome.toLowerCase() === nome);
          if (!tagNode) continue;
          const edge = edges.find((e) => e.source === selectedNodeId && e.target === tagNode.id);
          if (edge) deleteEdge(edge.id);
          if (!edges.some((e) => e.target === tagNode.id && e.source !== selectedNodeId)) {
            deleteNode(tagNode.id);
          }
        }
      }
    } else if (nodeType === 'ferramenta') {
      nodeData.finalidade = formData.finalidade;
      nodeData.contexto = formData.contexto;
    }

    if (selectedNode) {
      updateNode(selectedNodeId!, nodeData);
    } else {
      addNode(nodeData as any);
    }
    setFormData(FORM_VAZIO);
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Tem certeza que deseja deletar este nó?')) {
      deleteNode(selectedNodeId);
      onClose();
    }
  };

  const handleClose = () => {
    useGraphStore.setState({ selectedNodeId: null });
    onClose();
  };

  // ── Render ──
  return (
    <aside className={`node-panel${visible ? ' visible' : ''}`}>
      <div className="node-panel-header">
        <h2 className="node-panel-title">
          {selectedNode ? 'Editar' : 'Novo Nó'}
          {selectedNode && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({selectedNode.tipo})
            </span>
          )}
        </h2>
        <button onClick={handleClose} className="node-panel-close">
          <X size={20} />
        </button>
      </div>

      <div className="node-panel-body">
        {!selectedNode && (
          <div className="node-panel-section">
            <label className="node-panel-label">Tipo de Nó</label>
            <Select value={nodeType} onValueChange={(v) => handleTipoChange(v as NodeType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="projeto">Projeto</SelectItem>
                <SelectItem value="ferramenta">Ferramenta</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="node-panel-section">
          <label className="node-panel-label">Nome</label>
          <Input
            placeholder="Nome do nó"
            value={formData.nome}
            onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
          />
        </div>

        {nodeType === 'projeto' && (
          <>
            <div className="node-panel-section">
              <label className="node-panel-label">Descrição</label>
              <Textarea
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="node-panel-section">
                <label className="node-panel-label">Início</label>
                <Input type="date" value={formData.data_inicio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, data_inicio: e.target.value }))} />
              </div>
              <div className="node-panel-section">
                <label className="node-panel-label">Fim</label>
                <Input type="date" value={formData.data_fim}
                  onChange={(e) => setFormData((prev) => ({ ...prev, data_fim: e.target.value }))} />
              </div>
            </div>
            <div className="node-panel-section">
              <label className="node-panel-label">Complexidade</label>
              <Select value={formData.complexidade}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, complexidade: v as ComplexityLevel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="node-panel-section">
              <label className="node-panel-label">Ferramentas</label>
              {renderLista('ferramentas', 'Python, React...')}
            </div>
            <div className="node-panel-section">
              <label className="node-panel-label">Tarefas</label>
              {renderLista('tarefas', 'Coletar dados...')}
            </div>
            <div className="node-panel-section">
              <label className="node-panel-label">Conhecimentos</label>
              {renderLista('conhecimentos', 'Machine Learning...')}
            </div>
            <div className="node-panel-section">
              <label className="node-panel-label">Resultados</label>
              {renderLista('resultados', 'Dashboard...')}
            </div>

            {/* Tags com peso */}
            <div className="node-panel-section">
              <label className="node-panel-label">Tags</label>
              <div className="node-panel-tag-row">
                <Input placeholder="Nome"
                  value={listaInputs['tags_nome'] ?? ''}
                  onChange={(e) => setListaInputs((prev) => ({ ...prev, tags_nome: e.target.value }))} />
                <Input type="number" placeholder="Peso" min={1}
                  value={listaInputs['tags_peso'] ?? '1'}
                  onChange={(e) => setListaInputs((prev) => ({ ...prev, tags_peso: e.target.value }))} />
                <Button size="sm" onClick={() => {
                  const nome = (listaInputs['tags_nome'] ?? '').trim();
                  const peso = Number(listaInputs['tags_peso'] ?? '1') || 1;
                  if (!nome) return;
                  setFormData((prev) => ({ ...prev, tags: [...prev.tags, { nome, peso }] }));
                  setListaInputs((prev) => ({ ...prev, tags_nome: '', tags_peso: '1' }));
                }}><Plus size={16} /></Button>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="node-panel-list-item">
                    <span className="truncate text-sm">{tag.nome}</span>
                    <span className="text-xs text-muted-foreground mx-2">peso: {tag.peso}</span>
                    <button onClick={() => setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((_, idx) => idx !== i),
                    }))}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {nodeType === 'ferramenta' && (
          <>
            <div className="node-panel-section">
              <label className="node-panel-label">Finalidade</label>
              <Textarea rows={3} value={formData.finalidade}
                onChange={(e) => setFormData((prev) => ({ ...prev, finalidade: e.target.value }))} />
            </div>
            <div className="node-panel-section">
              <label className="node-panel-label">Contexto</label>
              <Textarea rows={3} value={formData.contexto}
                onChange={(e) => setFormData((prev) => ({ ...prev, contexto: e.target.value }))} />
            </div>
          </>
        )}
      </div>

      <div className="node-panel-footer">
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            {selectedNode ? 'Atualizar' : 'Criar'}
          </Button>
          {selectedNode && (
            <Button onClick={handleDelete} variant="destructive">Deletar</Button>
          )}
          <Button onClick={handleClose} variant="outline">Cancelar</Button>
        </div>
      </div>
    </aside>
  );
};
