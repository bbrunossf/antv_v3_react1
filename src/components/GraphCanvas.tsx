import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { useGraphStore, NodeType, ProjetoNode } from '../hooks/graphStore';
import './GraphCanvas.css';

cytoscape.use(cola);

const getNodeColor = (tipo: NodeType) => {
  switch (tipo) {
    case 'projeto':
      return '#FF6B35';
    case 'ferramenta':
      return '#00D9FF';
    case 'tag':
      return '#10B981';
    default:
      return '#888888';
  }
};

interface GraphCanvasProps {
  onNodeSelect?: (nodeId: string | null) => void;
  searchTerm?: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ onNodeSelect, searchTerm }) => {
  const cyRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Refs estáveis para callbacks — evita que handleCyInit mude de referência
  const onNodeSelectRef = useRef(onNodeSelect);
  onNodeSelectRef.current = onNodeSelect;
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const updateNodeRef = useRef(useGraphStore.getState().updateNode);
  const layoutTrigger = useGraphStore((state) => state.layoutTrigger);



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
         ...edges.map((edge) => {
           const data: any = {
             id: edge.id,
             source: edge.source,
             target: edge.target,
           };
           const src = nodes.find((n) => n.id === edge.source);
           const tgt = nodes.find((n) => n.id === edge.target);
           if (src?.tipo === 'projeto' && tgt?.tipo === 'tag') {
             const tagEntry = (src as ProjetoNode).tags?.find(
               (t) => t.nome.toLowerCase() === tgt.nome.toLowerCase()
             );
             if (tagEntry) {
               data.peso = tagEntry.peso;
             }
           }
           return { data };
         }),

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
        selector: 'node[tipo="tag"]',
        style: {
          shape: 'diamond',
          'background-color': '#10B981'
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
        'width': (ele: any) => {
                  const peso = ele.data('peso');
                  return peso ? Math.max(0.5, peso * 1.5) : 1.5;
                },
        'opacity': 0.6,
        'curve-style': 'bezier',
      },
    },
    {
      selector: '.faded',
      style: {
        'opacity': 0.15,
        'text-opacity': 0,
      },
    },

  ];

  const handleCyInit = useCallback((cy: any) => {
    // Se é a mesma instância, ignora — evita reexecução em re-renders
    if (cyRef.current === cy) return;
    cyRef.current = cy;

    // Hover effect — alternativa ao seletor inválido :hover
    // cy.on('mouseover', 'node', (evt: any) => {
    //   evt.target.style('border-width', 3);
    // });
    // cy.on('mouseout', 'node', (evt: any) => {
    //   evt.target.style('border-width', 2);
    // });

    // Highlight — conectados em foco, resto esmaecido
    cy.on('mouseover', 'node', (evt: any) => {
      const connected = evt.target.closedNeighborhood();
      cy.elements().difference(connected).addClass('faded');
      connected.removeClass('faded');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('faded');
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
      // name: 'cose',
      // directed: false,
      // animate: true,
      // animationDuration: 500,
      // nodeRepulsion: 400000,
      // avoidOverlap: true,
      // nodeSpacing: 50,
      // componentSpacing: 100,
      name: 'cola',
      animate: true,
      refresh: 1,
      maxSimulationTime: 4000,
      ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
      fit: true, // on every layout reposition of nodes, fit the viewport
      padding: 30, // padding around the simulation
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

      // positioning options
      randomize: true, // use random node positions at beginning of layout
      avoidOverlap: true, // if true, prevents overlap of node bounding boxes
      handleDisconnected: true, // if true, avoids disconnected components from overlapping
      convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
      flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
      alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
      gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
      centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)
    });

    layout.on('layoutstop', () => {
          cy.nodes().forEach((node: any) => {
            const pos = node.position();
            updateNodeRef.current(node.id(), { x: pos.x, y: pos.y });
          });
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


  // Layout manual (botão "Embaralhar")
  useEffect(() => {
    if (!cyRef.current || layoutTrigger === 0) return;

    const timer = setTimeout(() => {
      if (!cyRef.current) return;
      const layout = cyRef.current.layout({
        name: 'cola',
        animate: true,
        refresh: 1,
        maxSimulationTime: 4000,
        ungrabifyWhileSimulating: false,
        fit: true,
        padding: 30,
        randomize: true,           // posições aleatórias
        avoidOverlap: true,
        handleDisconnected: true,
        convergenceThreshold: 0.01,
        centerGraph: true,
      });
      layout.on('layoutstop', () => {
        cyRef.current.nodes().forEach((node: any) => {
          const pos = node.position();
          updateNodeRef.current(node.id(), { x: pos.x, y: pos.y });
        });
      });
      layout.run();
    }, 100);

    return () => clearTimeout(timer);
  }, [layoutTrigger]);

  // Realce de busca
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().removeClass('faded');

    const term = searchTerm?.trim();
    if (!term) return;

    const lower = term.toLowerCase();
    const matched = cyRef.current.nodes().filter((n: any) =>
      n.data('label').toLowerCase().includes(lower)
    );

    if (matched.length === 0) return;

    cyRef.current.elements().addClass('faded');
    matched.removeClass('faded');
    matched.connectedEdges().removeClass('faded');
    matched.neighborhood().removeClass('faded');
  }, [searchTerm]);


  // Reexecuta o layout cola quando novos nós são adicionados
  const prevNodeCountRef = useRef(nodes.length);

  useEffect(() => {
    if (!cyRef.current) return;

    const prev = prevNodeCountRef.current;
    prevNodeCountRef.current = nodes.length;

    // Ignora montagem inicial (prev=0) e remoções
    if (prev === 0 || nodes.length <= prev) return;

    // Timeout para o cytoscape processar os novos elementos
    const timer = setTimeout(() => {
      if (!cyRef.current) return;

      const layout = cyRef.current.layout({
        name: 'cola',
        animate: true,
        refresh: 1,
        maxSimulationTime: 4000,
        ungrabifyWhileSimulating: false,
        fit: true,
        padding: 30,
        randomize: false,            // usa posições atuais como ponto de partida
        avoidOverlap: true,
        handleDisconnected: true,
        convergenceThreshold: 0.01,
        centerGraph: false,          // não centraliza — preserva o arranjo existente
      });

      layout.on('layoutstop', () => {
        cyRef.current.nodes().forEach((node: any) => {
          const pos = node.position();
          updateNodeRef.current(node.id(), { x: pos.x, y: pos.y });
        });
      });

      layout.run();
    }, 150);

    return () => clearTimeout(timer);
  }, [nodes.length]);


  return (
    <div className="graph-canvas">
      <CytoscapeComponent
        cytoscape={cytoscape}
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
