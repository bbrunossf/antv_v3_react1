import React, { useEffect, useRef } from 'react';
import { Graph, Node, Edge } from 'cytoscape-react';

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

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  onNodeSelect,
}) => {
  const cyRef = useRef<any>(null);

  const {
    nodes,
    edges,
    selectedNodeId,
    selectNode,
    updateNode,
  } = useGraphStore();

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    cy.elements().unselect();

    if (selectedNodeId) {
      cy.getElementById(selectedNodeId).select();
    }
  }, [selectedNodeId]);

  return (
    <div className="graph-canvas">
      <Graph
        cy={(cy) => {
          cyRef.current = cy;

          cy.on('tap', 'node', (evt) => {
            const nodeId = evt.target.id();

            selectNode(nodeId);

            onNodeSelect?.(nodeId);
          });

          cy.on('dragfree', 'node', (evt) => {
            const nodeId = evt.target.id();

            const pos = evt.target.position();

            updateNode(nodeId, {
              x: pos.x,
              y: pos.y,
            });
          });

          cy.layout({
            name: 'cose',
            animate: true,
            avoidOverlap: true,
          }).run();
        }}

        style={{
          width: '100%',
          height: '100%',
        }}
      >

        {nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            position={{
              x: node.x ?? 0,
              y: node.y ?? 0,
            }}
            data={{
              tipo: node.tipo,
            }}
          >
            <div
              className="graph-node"
              style={{
                backgroundColor: getNodeColor(node.tipo),
              }}
            >
              <strong>{node.nome}</strong>
            </div>
          </Node>
        ))}

        {edges.map((edge) => (
          <Edge
            key={edge.id}
            id={edge.id}
            source={edge.source}
            target={edge.target}
          />
        ))}

      </Graph>
    </div>
  );
};
