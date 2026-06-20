import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Link2, Download, Trash2, RotateCcw } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onNewNode: () => void;
  onNewRelation: () => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewNode,
  onNewRelation,
  onExport,
  onImport,
  onClear,
}) => {
  return (
    <header className="header">
      <div className="header-content">
        {/* Logo and Title */}
        <div className="header-title">
          <div className="logo">
            <svg viewBox="0 0 100 100" width="32" height="32">
              <circle cx="30" cy="30" r="12" fill="#FF6B35" opacity="0.9" />
              <circle cx="70" cy="30" r="12" fill="#00D9FF" opacity="0.9" />
              <circle cx="50" cy="70" r="12" fill="#9B59B6" opacity="0.9" />
              <line x1="30" y1="30" x2="70" y2="30" stroke="#D1D5DB" strokeWidth="1.5" />
              <line x1="30" y1="30" x2="50" y2="70" stroke="#D1D5DB" strokeWidth="1.5" />
              <line x1="70" y1="30" x2="50" y2="70" stroke="#D1D5DB" strokeWidth="1.5" />
            </svg>
          </div>
          <h1>Tech Project Graph</h1>
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          <Button
            onClick={onNewNode}
            size="sm"
            className="gap-2"
            title="Criar novo nó (Projeto, Ferramenta ou Conhecimento)"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Nó</span>
          </Button>

          <Button
            onClick={onNewRelation}
            size="sm"
            variant="outline"
            className="gap-2"
            title="Criar relação entre nós"
          >
            <Link2 size={16} />
            <span className="hidden sm:inline">Relação</span>
          </Button>

          <Button
            onClick={onExport}
            size="sm"
            variant="outline"
            className="gap-2"
            title="Exportar dados como JSON"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </Button>

          <Button
            onClick={onImport}
            size="sm"
            variant="outline"
            className="gap-2"
            title="Importar dados de JSON"
          >
            <Download size={16} className="rotate-180" />
            <span className="hidden sm:inline">Importar</span>
          </Button>

          <Button
            onClick={onClear}
            size="sm"
            variant="destructive"
            className="gap-2"
            title="Limpar todos os dados"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
