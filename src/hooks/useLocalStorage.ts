import { useEffect } from 'react';
import { useGraphStore } from './graphStore';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'tech-project-graph-data';

export const useLocalStorage = () => {
  const { nodes, edges } = useGraphStore();

  // Carrega mydata.json na montagem
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}mydata.json`)
      .then((res) => {
        if (!res.ok) throw new Error('mydata.json não encontrado');
        return res.json();
      })
      .then((data) => {
        if (data.nodes && Array.isArray(data.nodes)) {
          const normNodes = data.nodes.map((n: any) => ({
            ...n,
            id: n.id || uuidv4(),
          }));
          useGraphStore.setState({
            nodes: normNodes,
            edges: data.edges || [],
          });
        }
      })
      .catch(() => {
        // mydata.json não existe → canvas vazio, sem ação
      });
  }, []);

  // Salva alterações no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);
};
