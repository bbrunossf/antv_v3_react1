import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useGraphStore, NodeType, ProjetoNode } from '../hooks/graphStore';
import type { LayoutType } from '../hooks/graphStore';
import './GraphCanvas.css';
//import { ListEnd } from 'lucide-react';

cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

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

function compactConcentric(cy: any) {
    const center = {
        x: cy.width() / 2,
        y: cy.height() / 2
    };

    // Raios escolhidos manualmente.
    const radius: Record<string, number> = {
        projeto: 0,
        ferramenta: 320,
        tag: 430
    };

    cy.nodes().forEach((node: any) => {

        const tipo = node.data("tipo");

        const r = radius[tipo];

        if (r === undefined)
            return;

        const p = node.position();

        const dx = p.x - center.x;
        const dy = p.y - center.y;

        const angle = Math.atan2(dy, dx);

        node.position({
            x: center.x + r * Math.cos(angle),
            y: center.y + r * Math.sin(angle)
        });

    });

    cy.fit(undefined, 40);

}

function spiralProjects(cy: any) {
  console.log("Organizando projetos em espiral...");

  const center = {
    x: cy.width() / 2,
    y: cy.height() / 2,
  };

  // Obtém apenas os projetos e ordena por data
  const projetos = cy
    .nodes('[tipo="projeto"]')
    .sort((a: any, b: any) =>
      (a.data("data_inicio") || "").localeCompare(
        b.data("data_inicio") || ""
      )
    );

  // Agrupa os projetos por ano
  const grupos = new Map<number, any[]>();

  projetos.forEach((node: any) => {
    const ano = Number(node.data("data_inicio")?.substring(0, 4));

    if (!grupos.has(ano)) {
      grupos.set(ano, []);
    }

    grupos.get(ano)!.push(node);
  });

  // Lista de anos em ordem crescente
  const anos = [...grupos.keys()].sort((a, b) => a - b);

  // Configurações da espiral
  const raioInicial = 40;
  const incrementoRaio = 90;

  // Quanto a espiral gira entre um ano e outro
  const incrementoAngulo = Math.PI / 3; // 60°

  anos.forEach((ano, indiceAno) => {

    const grupo = grupos.get(ano)!;

    const raio = raioInicial + indiceAno * incrementoRaio;

    const anguloCentral = indiceAno * incrementoAngulo;

    // Abre mais o arco conforme aumenta a quantidade de projetos
    const abertura = Math.min(
      Math.PI / 2,      // máximo de 90°
      grupo.length * 0.18
    );

    const passo =
      grupo.length > 1
        ? abertura / (grupo.length - 1)
        : 0;

    grupo.forEach((node: any, indiceProjeto: number) => {

      const angulo =
        grupo.length === 1
          ? anguloCentral
          : anguloCentral - abertura / 2 + indiceProjeto * passo;

      node.position({
        x: center.x + raio * Math.cos(angulo),
        y: center.y + raio * Math.sin(angulo),
      });

    });

  });

  cy.fit(undefined, 40);
}

function compactOuterRings(cy: any) {
  console.log("compactando os aneis...");

    const center = {
        x: cy.width()/2,
        y: cy.height()/2
    };

    const radius = {
        ferramenta:420,
        tag:540
    };

    cy.nodes().forEach((node:any)=>{
        const tipo=node.data("tipo");
        if(tipo==="projeto")
            return;
        const r=radius[tipo];
        if(!r)
            return;
        const p=node.position();
        const angle=Math.atan2(
            p.y-center.y,
            p.x-center.x
        );

        node.position({
            x:center.x+r*Math.cos(angle),
            y:center.y+r*Math.sin(angle)
        });
    });

    cy.fit(undefined,40);
}

function buildLayoutConfig(_cy: any, type: LayoutType, randomize: boolean): any {
  const base: any = {
    animate: true,
    animationDuration: 500,
    nodeRepulsion: 3000,
    avoidOverlap: true,
    refresh: 5,
    //maxSimulationTime: 3000,
    fit: true,
    padding: 30,
  };

  switch (type) {
    case 'concentric':
      return {
        ...base,
        name: 'concentric',

        concentric: (node: any) => {
          switch (node.data('tipo')) {
            case 'projeto':
              return 100;
            case 'ferramenta':
              return 50;
            default:
              return 10;
          }
        },

        levelWidth: () => 1,

        // Pode deixar pequeno, pois depois ajustaremos manualmente.
        minNodeSpacing: 2,
        startAngle: Math.PI / 2,
        clockwise: true,

        // sort: (a: any, b: any) =>
        //   (a.data('data_inicio') || '').localeCompare(
        //     b.data('data_inicio') || ''
        //   ),
        sort: (a: any, b: any) =>
          (a.data("data_inicio") || "")
          .localeCompare(b.data("data_inicio") || ""),

        animate: true,
        animationDuration: 500
      };

    case 'cose':
      return {
        ...base,
        name: 'cose',
        directed: false,
        nodeRepulsion: randomize ? 400000 : 4000,
        avoidOverlap: true,
        nodeSpacing: 50,
        componentSpacing: 100,
      };

    case 'cose-bilkent':
      return {
        ...base,
        name: 'cose-bilkent',
        idealEdgeLength: 100,
        nodeRepulsion: 4500,
        gravity: 0.25,
        numIter: 2500,
      };

    case 'dagre':
      return {
        ...base,
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        rankSep: 100,
        edgeSep: 10,
      };

    default:
      return { ...base, name: 'concentric' };
  }
}


export const GraphCanvas: React.FC<GraphCanvasProps> = ({ onNodeSelect, searchTerm }) => {
  const cyRef = useRef<any>(null);
  //const initializedRef = useRef(false);

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

  const layoutType = useGraphStore((s) => s.layoutType);
  //const layoutTrigger = useGraphStore((s) => s.layoutTrigger);

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
          data_inicio: node.tipo === 'projeto'
            ? (node as ProjetoNode).data_inicio : undefined,
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

        // Determina o tipo de relação para estilização
        if (
          (src?.tipo === 'projeto' && tgt?.tipo === 'ferramenta') ||
          (src?.tipo === 'ferramenta' && tgt?.tipo === 'projeto')
        ) {
          data.tipo_relacao = 'ferramenta';
        } else if (
          (src?.tipo === 'projeto' && tgt?.tipo === 'tag') ||
          (src?.tipo === 'tag' && tgt?.tipo === 'projeto')
        ) {
          data.tipo_relacao = 'tag';
        }

        if (src?.tipo === 'projeto' && tgt?.tipo === 'tag') {
          const tagEntry = (src as ProjetoNode).tags?.find(
            (t) => t.nome.toLowerCase() === tgt.nome.toLowerCase()
          );
          if (tagEntry) {
            data.peso = tagEntry.peso;
          }
        }

        return { data, classes: 'edge-hidden' };
      }),

    ],
    [nodes, edges],
  );

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => getNodeColor(ele.data('tipo')),
        "background-opacity" : 0.3,
        'label': 'data(label)',
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
        'text-background-opacity': 0.15,
        'text-background-padding': '2px',
      },
    },
    {
        selector: 'node[tipo="projeto"]',
        style: {
          shape: 'ellipse',
          'width': 60,
          'height': 60,
          'text-valign': 'center',
          'text-halign': 'right',
          'text-margin-x': 10,
          'font-size': 16,
          'text-wrap': 'wrap',
          'text-max-width': '260px',
          'text-overflow-wrap': 'whitespace',
        }
      },

      {
        selector: 'node[tipo="ferramenta"]',
        style: {
          shape: 'ellipse',
          'width': 50,
          'height': 50,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 16,
        }
      },

      {
        selector: 'node[tipo="tag"]',
        style: {
          shape: 'diamond',
          'width': 40,
          'height': 40,
          'text-valign': 'center',
          'text-halign': 'right',
          'font-size': 22,
          'text-wrap': 'wrap',
          'text-max-width': '160px',
          'text-overflow-wrap': 'whitespace',
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
    // Aresta padrão (outros tipos de relação)
    {
      selector: 'edge',
      style: {
        'line-color': '#D1D5DB',
        'width': 1.5,
        'opacity': 0.5,
        'curve-style': 'straight-triangle',
      },
    },
    // Aresta projeto ↔ ferramenta (sólida, azul ciano)
    {
      selector: 'edge[tipo_relacao="ferramenta"]',
      style: {
        'line-color': '#00D9FF',
        'line-style': 'solid',
        'width': 2.5,
        'opacity': 0.8,
        'curve-style': 'straight-triangle',
      },
    },
    // Aresta projeto ↔ tag (dashed, verde)
    {
      selector: 'edge[tipo_relacao="tag"]',
      style: {
        'line-color': '#10B981',
        'line-style': 'dashed',
        'width': (ele: any) => {
          const peso = ele.data('peso');
          return peso ? Math.max(1, peso * 2) : 2;
        },
        'opacity': 0.8,
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
    {
      selector: '.edge-hidden',
      style: {
        'opacity': 0,
      },
    },


  ];

  // ── Helper: roda layout e salva posições ──
  const runAndSaveLayout = useCallback((cy: any, type: LayoutType, shuffle: boolean) => {
    const config = buildLayoutConfig(cy, type, shuffle);
    const layout = cy.layout(config);
    layout.on('layoutstop', () => {
      spiralProjects(cy);
      compactOuterRings(cy);

      cy.nodes().forEach((node: any) => {
        const pos = node.position();
        updateNodeRef.current(node.id(), { x: pos.x, y: pos.y });
      });


    });
    layout.run();
    cy.fit(undefined, 40);
  }, []);



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
    // Highlight — conectados em foco, resto esmaecido
    cy.on('mouseover', 'node', (evt: any) => {
      const connected = evt.target.closedNeighborhood();
      cy.elements().difference(connected).addClass('faded');
      connected.removeClass('faded');
      // Exibe as arestas conectadas ao nó sob o mouse
      connected.edges().removeClass('edge-hidden');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('faded');
      // Oculta todas as arestas novamente
      cy.edges().addClass('edge-hidden');
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

    // Layout inicial
    runAndSaveLayout(cy, useGraphStore.getState().layoutType, true);
     }, [runAndSaveLayout]);

    // Layout
    //const layout = cy.layout({
      // name: 'cose',
      // directed: false,
      // animate: true,
      // animationDuration: 500,
      // nodeRepulsion: 400000,
      // avoidOverlap: true,
      // nodeSpacing: 50,
      // componentSpacing: 100,
      // name: 'cola',
      // animate: true,
      // refresh: 1,
      // maxSimulationTime: 4000,
      // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
      // fit: true, // on every layout reposition of nodes, fit the viewport
      // padding: 30, // padding around the simulation
      // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      // nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

      // positioning options
    //   randomize: true, // use random node positions at beginning of layout
    //   avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    //   handleDisconnected: true, // if true, avoids disconnected components from overlapping
    //   convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    //   flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    //   alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
    //   gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
    //   centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)
    // });



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

      runAndSaveLayout(cyRef.current, useGraphStore.getState().layoutType, true);
         }, 100);
         return () => clearTimeout(timer);
       }, [layoutTrigger, runAndSaveLayout]);


  // Realce de busca
  // Realce de busca
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().removeClass('faded');

    const term = searchTerm?.trim();
    if (!term) {
      // Sem busca ativa → esconde todas as arestas
      cyRef.current.edges().addClass('edge-hidden');
      return;
    }

    const lower = term.toLowerCase();
    const matched = cyRef.current.nodes().filter((n: any) =>
      n.data('label').toLowerCase().includes(lower)
    );

    if (matched.length === 0) return;

    cyRef.current.elements().addClass('faded');
    matched.removeClass('faded');
    matched.connectedEdges().removeClass('faded').removeClass('edge-hidden');
    matched.neighborhood().removeClass('faded');
  }, [searchTerm]);



  // Reexecuta o layout cola quando novos nós são adicionados
  const prevNodeCountRef = useRef(nodes.length);
  useEffect(() => {
    if (!cyRef.current) return;

    const prev = prevNodeCountRef.current;
    prevNodeCountRef.current = nodes.length;

    // Ignora montagem inicial (prev=0) e remoções
    if (nodes.length <= prev) return;

    // Timeout para o cytoscape processar os novos elementos
    const timer = setTimeout(() => {
      if (!cyRef.current) return;

      runAndSaveLayout(cyRef.current, useGraphStore.getState().layoutType, false);
         }, 150);
         return () => clearTimeout(timer);
       }, [nodes.length, runAndSaveLayout]);

      // const layout = cyRef.current.layout({
      //   name: 'cola',
      //   animate: true,
      //   refresh: 1,
      //   maxSimulationTime: 4000,
      //   ungrabifyWhileSimulating: false,
      //   fit: true,
      //   padding: 30,
      //   randomize: false,            // usa posições atuais como ponto de partida
      //   avoidOverlap: true,
      //   handleDisconnected: true,
      //   convergenceThreshold: 0.01,
      //   centerGraph: false,          // não centraliza — preserva o arranjo existente
      // });

    //   layout.on('layoutstop', () => {
    //     cyRef.current.nodes().forEach((node: any) => {
    //       const pos = node.position();
    //       updateNodeRef.current(node.id(), { x: pos.x, y: pos.y });
    //     });
    //   });

    //   layout.run();
    // }, 150);

  //   return () => clearTimeout(timer);
  // }, [nodes.length]);

  // ── Troca de layout ──
    const prevLayoutRef = useRef(layoutType);
    useEffect(() => {
      if (!cyRef.current) return;
      if (prevLayoutRef.current === layoutType) return;
      prevLayoutRef.current = layoutType;
      const timer = setTimeout(() => {
        if (!cyRef.current) return;
        runAndSaveLayout(cyRef.current, layoutType, true);
      }, 100);
      return () => clearTimeout(timer);
    }, [layoutType, runAndSaveLayout]);


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
