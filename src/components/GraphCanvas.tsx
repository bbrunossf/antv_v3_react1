import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useGraphStore, NodeType } from '../hooks/graphStore';
import './GraphCanvas.css';

const getNodeColor = (tipo: NodeType) => {
  switch (tipo) {
    case 'projeto':
      return '#FF6B35';
    case 'ferramenta':
      return '#00D9FF';
    case 'conhecimento':
      return '#9B59B6';
    default:
      return '#888888';
  }
};

interface GraphCanvasProps {
  onNodeSelect?: (nodeId: string | null) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ onNodeSelect }) => {
  const cyRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Refs estáveis para callbacks — evita que handleCyInit mude de referência
  const onNodeSelectRef = useRef(onNodeSelect);
  onNodeSelectRef.current = onNodeSelect;
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const updateNodeRef = useRef(useGraphStore.getState().updateNode);


  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
  const selectNode = useGraphStore((state) => state.selectNode);
  const updateNode = useGraphStore((state) => state.updateNode);

  // Mantém refs atualizados para o callback estável
   selectNodeRef.current = selectNode;
   updateNodeRef.current = updateNode;

   // Build Cytoscape elements — posições vão em `position`, não em `data`
     const elements = useMemo(
       () => [
         ...nodes.map((node) => ({
           data: {
             id: node.id,
             label: node.nome,
             tipo: node.tipo,
           },
           // 🔑 Posição no lugar correto para o Cytoscape respeitar
           position:
             node.x != null && node.y != null
               ? { x: node.x, y: node.y }
               : undefined,
         })),
         ...edges.map((edge) => ({
           data: {
             id: edge.id,
             source: edge.source,
             target: edge.target,
           },
         })),
       ],
       [nodes, edges],
     );

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => getNodeColor(ele.data('tipo')),
        'label': 'data(label)',
        'width': 50,
        'height': 50,
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 10,
        'color': '#fff',
        'border-width': 2,
        'border-color': (ele: any) => {
          const hex = getNodeColor(ele.data('tipo'));
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.5)`;
        },

        'text-background-color': '#000',
        'text-background-opacity': 0.3,
        'text-background-padding': '2px',
      },
    },
    {
        selector: 'node[tipo="projeto"]',
        style: {
          shape: 'round-rectangle',
          'background-color': '#FF6B35'
        }
      },

      {
        selector: 'node[tipo="ferramenta"]',
        style: {
          shape: 'ellipse',
          'background-color': '#00D9FF'
        }
      },

      {
        selector: 'node[tipo="conhecimento"]',
        style: {
          shape: 'diamond',
          'background-color': '#9B59B6'
        }
      },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#FFD700',
        'border-width': 3,
      },
    },
    // {
    //   selector: 'node:hover',
    //   style: {
    //     'border-width': 3,
    //   },
    // },
    {
      selector: 'edge',
      style: {
        'line-color': '#D1D5DB',
        'width': 1.5,
        'opacity': 0.6,
        'curve-style': 'bezier',
      },
    },
  ];

  const handleCyInit = useCallback((cy: any) => {
    // Se é a mesma instância, ignora — evita reexecução em re-renders
    if (cyRef.current === cy) return;
    cyRef.current = cy;

    // Hover effect — alternativa ao seletor inválido :hover
    cy.on('mouseover', 'node', (evt: any) => {
      evt.target.style('border-width', 3);
    });
    cy.on('mouseout', 'node', (evt: any) => {
      evt.target.style('border-width', 2);
    });


    // Node click
    cy.on('tap', 'node', (evt: any) => {
      const nodeId = evt.target.id();
      selectNodeRef.current(nodeId);
      onNodeSelectRef.current?.(nodeId);
    });

    // Canvas click
    // cy.on('tap', (evt: any) => {
    //   if (evt.target === cy) {
    //     selectNodeRef.current(null);
    //     onNodeSelectRef.current?.(null);
    //     cy.elements().unselect();
    //   }
    // });

    // Node drag
    cy.on('dragfree', 'node', (evt: any) => {
      const nodeId = evt.target.id();
      const pos = evt.target.position();
      updateNodeRef.current(nodeId, { x: pos.x, y: pos.y });
    });

    // Layout
    const layout = cy.layout({
      name: 'cose',
      directed: false,
      animate: true,
      animationDuration: 500,
      nodeRepulsion: 400000,
      avoidOverlap: true,
      nodeSpacing: 50,
      componentSpacing: 100,
    });
    layout.run();
  }, []);



  // Update selected state
  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.elements().unselect();
    if (selectedNodeId) {
      cyRef.current.getElementById(selectedNodeId).select();
    }
  }, [selectedNodeId]);

  return (
    <div className="graph-canvas">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        cy={handleCyInit}
        userZoomingEnabled={true}
        //wheelSensitivity={1}
        minZoom={0.5}
        maxZoom={2.5}
        boxSelectionEnabled={false}
      />
    </div>
  );
};
