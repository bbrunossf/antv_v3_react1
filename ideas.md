# Tech Project Graph - Design Brainstorm

## Três Abordagens Estilísticas

### 1. **Minimalist Data Visualization**
**Breve Descrição:** Interface limpa e funcional, focada em clareza dos dados com tipografia elegante e espaçamento generoso. Paleta monocromática com acentos sutis.
**Probabilidade:** 0.08

### 2. **Dark Tech Dashboard**
**Breve Descrição:** Estética de painel técnico moderno com tema escuro, linhas de grade suaves, acentos neon/cyan, e animações fluidas que remetem a interfaces de engenharia.
**Probabilidade:** 0.06

### 3. **Organic Network Aesthetic** ✅ **ESCOLHIDA**
**Breve Descrição:** Design inspirado em redes biológicas e sistemas naturais. Nós fluem organicamente, com cores quentes e frias representando diferentes tipos de elementos, transições suaves e uma sensação de crescimento e conexão.
**Probabilidade:** 0.07

---

## Abordagem Escolhida: Organic Network Aesthetic

### **Design Movement**
Inspiração em **Biophilic Design** e **Systems Thinking Visualization** — combina a elegância de redes naturais com a precisão de representação de dados técnicos. Referências: interfaces de análise de redes científicas, visualizações de dados em biologia, e dashboards de engenharia modernos.

### **Core Principles**
1. **Fluidez Orgânica:** Nós e conexões fluem naturalmente, sem rigidez de grade. Layouts são dinâmicos e responsivos.
2. **Hierarquia Cromática:** Cores quentes (laranja, coral) para projetos; cores frias (azul, ciano) para ferramentas; tons neutros para conhecimentos. Cada tipo tem uma identidade visual clara.
3. **Profundidade e Camadas:** Uso de sombras suaves, blur, e sobreposição para criar sensação de profundidade. Nós mais importantes ficam visualmente "à frente".
4. **Minimalismo Funcional:** Interface limpa, sem poluição visual. Apenas elementos essenciais são visíveis; detalhes aparecem sob interação.

### **Color Philosophy**
- **Primária (Projetos):** Gradiente de laranja a coral (`#FF6B35` → `#FF8C42`) — energia, ação, criatividade.
- **Secundária (Ferramentas):** Azul ciano (`#00D9FF` → `#0099CC`) — tecnologia, precisão, confiabilidade.
- **Terciária (Conhecimentos):** Roxo suave (`#9B59B6` → `#C39BD3`) — aprendizado, crescimento, sabedoria.
- **Fundo:** Gradiente sutil de cinza escuro (`#1A1A2E`) a preto (`#0F0F1E`) — profundidade sem agressividade.
- **Acentos:** Branco com 85% opacidade para textos; verde menta (`#1ABC9C`) para estados de sucesso/hover.

### **Layout Paradigm**
- **Canvas Central Dinâmico:** Grafo ocupa 70% da tela, com painel lateral colapsável (30%) para edição.
- **Sidebar Flutuante:** Painel de ferramentas flutua à direita, com transição suave ao expandir/colapsar.
- **Header Minimalista:** Apenas logo, título e botões de ação (novo nó, novo link, exportar). Sem navegação complexa.
- **Espaço Negativo:** Margens generosas ao redor do canvas para não parecer apertado.

### **Signature Elements**
1. **Nós com Aura:** Cada nó tem um halo de cor com blur que se intensifica ao hover. Representa "energia" do elemento.
2. **Linhas Animadas:** Conexões entre nós têm uma animação sutil de "pulso" ou gradiente fluindo, sugerindo fluxo de informação.
3. **Padrão de Fundo:** Padrão de pontos muito suave ou grid hexagonal de baixa opacidade no fundo do canvas, reforçando tema de rede.

### **Interaction Philosophy**
- **Hover Inteligente:** Ao passar sobre um nó, sua aura se expande, conexões relacionadas se iluminam, e detalhes aparecem em tooltip.
- **Seleção Visual:** Nó selecionado tem aura brilhante e pulsante. Conexões relacionadas ganham cor mais vibrante.
- **Drag & Drop Suave:** Arrastar nó é fluido, com feedback visual imediato (sombra aumenta, aura se expande).
- **Zoom Contextual:** Zoom suave com mouse wheel; duplo clique centraliza nó. Sem saltos abruptos.

### **Animation**
- **Entrada de Nós:** Fade-in + scale(0.8 → 1) com duração 400ms, easing `cubic-bezier(0.23, 1, 0.32, 1)`.
- **Hover de Nó:** Aura expande com blur aumentando, duração 200ms.
- **Pulsação de Conexões:** Gradiente flui ao longo da linha com loop infinito, velocidade 3s.
- **Transições de Painel:** Sidebar desliza suavemente com 300ms, backdrop blur aparece gradualmente.
- **Feedback de Clique:** Nó clicado tem micro-animação de "pop" (scale 1 → 1.05 → 1) com 150ms.

### **Typography System**
- **Display Font:** `Poppins Bold` (700) para títulos e nomes de nós. Moderna, geométrica, transmite precisão.
- **Body Font:** `Inter Regular` (400) para descrições e labels. Legível, neutra, profissional.
- **Accent Font:** `Poppins SemiBold` (600) para CTAs e labels de ferramentas.
- **Hierarquia:**
  - Títulos de nós: 18px Poppins Bold
  - Descrições: 13px Inter Regular, opacidade 75%
  - Labels de botões: 14px Poppins SemiBold
  - Tooltips: 12px Inter Regular

### **Brand Essence**
**Posicionamento:** Plataforma para engenheiros e pesquisadores visualizarem e gerenciarem a complexidade de seus projetos técnicos, transformando dados em narrativas visuais intuitivas.

**Personalidade:** Precisa, Elegante, Inspiradora.

### **Brand Voice**
- **Headlines:** Diretas, ativas, técnicas mas acessíveis. Ex: "Conecte seus projetos", "Visualize sua jornada técnica".
- **CTAs:** Imperativos claros. Ex: "Adicionar Nó", "Criar Relação", "Explorar Grafo".
- **Microcopy:** Descritiva e útil. Ex: "Arraste para mover", "Clique para editar detalhes", "Duplo clique para centralizar".

### **Wordmark & Logo**
Um símbolo abstrato de três nós conectados em triângulo, com linhas fluindo entre eles. Cores: laranja, azul e roxo. Sem texto — apenas o símbolo geométrico e orgânico ao mesmo tempo.

### **Signature Brand Color**
**Laranja Coral Vibrante** (`#FF6B35`) — representa energia, criatividade e ação. É a cor que mais aparece e define a identidade visual.

---

## Decisões de Implementação

### Estrutura de Dados
- **Nós:** `{ id, tipo, nome, descricao, data_inicio?, data_fim?, ferramentas?, tarefas?, complexidade? }`
- **Tipos de Nó:** `projeto`, `ferramenta`, `conhecimento`
- **Relações:** `{ id, source, target, tipo }`

### Persistência
- LocalStorage para dados (JSON stringificado)
- Exportação/Importação de JSON para backup

### Componentes Principais
1. **GraphCanvas:** Componente principal do G6
2. **NodePanel:** Painel lateral para criar/editar nós
3. **RelationPanel:** Interface para criar relações
4. **Header:** Logo, título, botões de ação
5. **Toolbar:** Botões de zoom, reset, exportar

### Responsividade
- Desktop: Grafo 70%, painel 30%
- Tablet: Grafo 65%, painel colapsável
- Mobile: Grafo full-width, painel em drawer inferior

