import React from 'react';
import { useGraphStore } from '../hooks/graphStore';
import './NodeCounter.css';

export const NodeCounter: React.FC = () => {
  const nodes = useGraphStore((s) => s.nodes);

  const counts = {
    projeto: nodes.filter((n) => n.tipo === 'projeto').length,
    ferramenta: nodes.filter((n) => n.tipo === 'ferramenta').length,
    tag: nodes.filter((n) => n.tipo === 'tag').length,
  };

  return (
    <div className="node-counter">
      <span className="node-counter-item projeto">
        <span className="node-counter-dot" style={{ background: '#FF6B35' }} />
        Projetos: {counts.projeto}
      </span>
      <span className="node-counter-item ferramenta">
        <span className="node-counter-dot" style={{ background: '#00D9FF' }} />
        Ferramentas: {counts.ferramenta}
      </span>
      <span className="node-counter-item tag">
        <span className="node-counter-dot" style={{ background: '#10B981' }} />
        Tags: {counts.tag}
      </span>
      <span className="node-counter-item total">
        Total: {counts.projeto + counts.ferramenta + counts.tag}
      </span>
    </div>
  );
};
