import { useEffect } from 'react';
import { useGraphStore } from './graphStore';

const STORAGE_KEY = 'tech-project-graph-data';

export const useLocalStorage = () => {
  const { nodes, edges } = useGraphStore();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.nodes && data.edges) {
          useGraphStore.setState({
            nodes: data.nodes,
            edges: data.edges,
          });
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    } else {
      // Load example data on first visit
      loadExampleData();
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [nodes, edges]);
};

const loadExampleData = () => {
  const exampleData = {
    nodes: [
      {
        id: 'proj_1',
        tipo: 'projeto' as const,
        nome: 'Análise de Vendas',
        descricao: 'Projeto de análise de dados de vendas com visualizações em Power BI',
        data_inicio: '2026-01-01',
        data_fim: '2026-03-01',
        ferramentas: ['Python', 'Pandas', 'Power BI'],
        tarefas: ['Coletar dados de vendas', 'Limpar e transformar os dados', 'Criar dashboards no Power BI'],
        complexidade: 'Alta' as const,
        x: 100,
        y: 100,
      },
      {
        id: 'proj_2',
        tipo: 'projeto' as const,
        nome: 'Previsão de Demanda',
        descricao: 'Modelo de machine learning para prever demanda futura',
        data_inicio: '2026-02-01',
        data_fim: '2026-04-01',
        ferramentas: ['Python', 'Scikit-learn', 'SQL'],
        tarefas: ['Coletar dados históricos', 'Treinar modelo de previsão', 'Validar resultados'],
        complexidade: 'Média' as const,
        x: 400,
        y: 100,
      },
      {
        id: 'tool_1',
        tipo: 'ferramenta' as const,
        nome: 'Python',
        descricao: 'Linguagem de programação para análise de dados',
        x: 100,
        y: 300,
      },
      {
        id: 'tool_2',
        tipo: 'ferramenta' as const,
        nome: 'Pandas',
        descricao: 'Biblioteca Python para manipulação de dados',
        x: 250,
        y: 300,
      },
      {
        id: 'tool_3',
        tipo: 'ferramenta' as const,
        nome: 'Power BI',
        descricao: 'Ferramenta de visualização de dados',
        x: 400,
        y: 300,
      },
      {
        id: 'tool_4',
        tipo: 'ferramenta' as const,
        nome: 'Scikit-learn',
        descricao: 'Biblioteca Python para machine learning',
        x: 550,
        y: 300,
      },
      {
        id: 'know_1',
        tipo: 'conhecimento' as const,
        nome: 'Análise Exploratória de Dados',
        descricao: 'Técnicas para explorar e entender dados',
        x: 250,
        y: 500,
      },
      {
        id: 'know_2',
        tipo: 'conhecimento' as const,
        nome: 'Machine Learning',
        descricao: 'Algoritmos e técnicas de aprendizado de máquina',
        x: 450,
        y: 500,
      },
    ],
    edges: [
      { id: 'edge_1', source: 'proj_1', target: 'tool_1', tipo: 'usa' },
      { id: 'edge_2', source: 'proj_1', target: 'tool_2', tipo: 'usa' },
      { id: 'edge_3', source: 'proj_1', target: 'tool_3', tipo: 'usa' },
      { id: 'edge_4', source: 'proj_2', target: 'tool_1', tipo: 'usa' },
      { id: 'edge_5', source: 'proj_2', target: 'tool_4', tipo: 'usa' },
      { id: 'edge_6', source: 'proj_1', target: 'know_1', tipo: 'requer' },
      { id: 'edge_7', source: 'proj_2', target: 'know_2', tipo: 'requer' },
      { id: 'edge_8', source: 'proj_1', target: 'proj_2', tipo: 'precede' },
    ],
  };

  useGraphStore.setState({
    nodes: exampleData.nodes,
    edges: exampleData.edges,
  });
};
