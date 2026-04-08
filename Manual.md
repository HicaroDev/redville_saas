# 📘 MANUAL DO PROJETO – REDVILLE OBRAS SAAS

Este documento descreve o papel de cada **Agente**, cada **Skill** e a arquitetura geral do sistema multi-agente que opera o desenvolvimento do Redville.

---

## 🤖 AGENTES (MULTI-AGENT SYSTEM)

### 🎯 1. Product Manager (Gestor)
**Responsabilidade:**
- Garantir alinhamento com o PRD (Product Requirements Document)
- Priorizar o backlog de tarefas
- Decidir o que entra no MVP e o que fica para depois
- Validar se cada funcionalidade resolve um problema real

**Base Teórica:**
- Marty Cagan – *Inspired* (Product Operating Model)
- Eric Ries – *Lean Startup* (Build-Measure-Learn)

**Quando atua:**
- Na definição de escopo de cada Sprint
- Ao priorizar features (ex: "Livro Caixa antes de Estoque")
- Ao validar se a interface responde a pergunta: *"Que decisão o usuário toma aqui?"*

---

### 🎨 2. UX/UI Designer
**Responsabilidade:**
- Criar interfaces minimalistas e de alta usabilidade
- Garantir hierarquia visual clara
- Seguir o Design System (cores, tipografia, espaçamento)
- Prototipar telas antes da codificação

**Regra de Ouro:**
> 👉 *"Se precisar explicar, está errado."*

**Princípios aplicados:**
- Inspiração: Stripe, Linear, Notion
- Paleta neutra + 1 cor de acento (Blue #2563EB)
- Fundo claro (#F8FAFC), cards brancos, sombras suaves
- "No-Line Rule" — bordas substituídas por tonal layering
- Máximo 5 ações por tela
- Cores com significado: Verde=OK, Vermelho=Risco, Amarelo=Atenção

**Quando atua:**
- Antes de cada nova tela ser codificada
- Na criação de mockups e wireframes
- Na revisão de usabilidade

---

### ⚙️ 3. Software Engineer
**Responsabilidade:**
- Implementar frontend (React + Tailwind) e backend (Supabase)
- Garantir performance e responsividade
- Escrever código limpo e componentes reutilizáveis
- Integrar banco de dados com a interface

**Stack Tecnológica:**
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hospedagem:** Vercel

**Quando atua:**
- Na codificação de componentes (Sidebar, Topbar, Cards, Tabelas)
- Na integração com Supabase (queries, RLS, views)
- Na otimização de performance

---

### 🧪 4. QA Engineer
**Responsabilidade:**
- Testar funcionalidades em cada Sprint
- Garantir estabilidade e consistência visual
- Validar dados financeiros (precisão de cálculos)
- Reportar bugs e regressões

**Quando atua:**
- Após cada feature ser implementada
- Na validação de cálculos (Orçado vs Realizado, Saldo Caixa)
- Na revisão de responsividade (Desktop/Mobile)

---

### 🧠 5. Data Engineer (Futuro)
**Responsabilidade:**
- Estruturar métricas e KPIs avançados
- Preparar dashboards de BI
- Configurar pipelines de dados

**Quando atua:**
- Na Fase 3+ (Inteligência Gerencial)
- Na criação de relatórios automatizados

---

### 🤖 6. Orchestrator Agent (Antigravity)
**Responsabilidade:**
- Coordenar todos os agentes acima
- Garantir fluxo de trabalho contínuo
- Manter alinhamento entre PRD, Design e Código
- Tomar decisões técnicas quando há ambiguidade

**Fluxo de Coordenação:**
```
Product Manager → UX Designer → Engineer → QA → Deploy
```

---

## 🛠️ SKILLS (COMPETÊNCIAS DO SISTEMA)

### 1. Project Modeler
**Propósito:** Definir estrutura de projetos e centros de custo
- **Entrada:** Nome do projeto, fases/etapas
- **Saída:** JSON estruturado do projeto
- **Passos:** Criar projeto → Definir centros de custo → Validar hierarquia
- **Restrição:** Deve seguir estrutura hierárquica (Etapa > Subetapa > Item)

### 2. Cost Engine
**Propósito:** Gerenciar lançamentos financeiros e cálculos
- **Entrada:** Valor, categoria (MAT/MO/LOC/TAR), ID do projeto
- **Saída:** Registros financeiros atualizados
- **Passos:** Validar input → Armazenar custo → Atualizar totais
- **Restrição:** Nenhum registro órfão (todo lançamento precisa de obra e etapa)

### 3. Dashboard Generator
**Propósito:** Gerar insights visuais em tempo real
- **Entrada:** Dados financeiros + dados de progresso
- **Saída:** Gráficos de Orçado vs Realizado, KPIs, alertas
- **Passos:** Agregar dados → Calcular métricas → Renderizar UI
- **Restrição:** Atualização em tempo real

### 4. Cash Flow Consolidator
**Propósito:** Centralizar dados financeiros (Livro Caixa)
- **Entrada:** Todas as transações de todos os projetos
- **Saída:** Fluxo de caixa global (Entradas, Saídas, Saldo)
- **Passos:** Merge de dados → Classificar entradas/saídas → Calcular saldo
- **Formatos de origem:** PIX, DINHEIRO, DÉBITO (conforme planilha)

### 5. Progress Tracker
**Propósito:** Rastrear evolução física e financeira
- **Entrada:** Input de progresso (%) + orçamento
- **Saída:** % de conclusão física vs financeira
- **Passos:** Calcular ratios → Comparar planejado vs real
- **Dados:** WBS, Duração, Predecessoras, Caminho Crítico

---

## 📁 ESTRUTURA DE ARQUIVOS DO PROJETO

```
c:\DEV\REDVILLE\
├── src/
│   ├── components/       # Componentes reutilizáveis (Sidebar, Topbar)
│   ├── pages/            # Páginas do sistema (Dashboard, Obras, etc.)
│   └── data/             # Dados mock (baseados na planilha real)
├── database_schema.sql   # Schema SQL para Supabase
├── design_system.md      # Tokens de design (cores, tipografia)
├── implementation_plan.md # Roadmap de implementação
├── prd.md                # Product Requirements Document
├── agents_guide.md       # Estratégia multi-agente
├── meta_prompts.md       # Skills do sistema
├── tasks.md              # Tracker de tarefas
├── Manual.md             # ESTE ARQUIVO
└── .eenv                 # Credenciais Supabase (SENSÍVEL)
```

---

## 🔄 FLUXO DE TRABALHO

1. **Product Manager** define a prioridade
2. **UX/UI Designer** cria os mockups da tela
3. **Software Engineer** implementa no React
4. **QA Engineer** testa e valida
5. **Orchestrator** coordena e avança para a próxima feature

---

## 📊 STATUS ATUAL DO PROJETO

| Item | Status |
|---|---|
| PRD definido | ✅ Completo |
| Schema SQL modelado | ✅ Completo (baseado na planilha real) |
| Design System definido | ✅ Completo |
| Mockups gerados | ✅ Completo (Stitch + Antigravity) |
| Frontend inicializado | ✅ React + Vite + Tailwind |
| Dashboard implementado | 🔄 Em andamento |
| Supabase integrado | ⏳ Próximo passo |
| Autenticação | ⏳ Backlog |

---

> [!IMPORTANT]
> Este manual deve ser atualizado a cada Sprint para refletir o progresso real do projeto.
