# REDVILLE OBRAS SAAS – PLANO DE IMPLEMENTAÇÃO

Este documento serve como a verdade única para o desenvolvimento do sistema, consolidando os requisitos do PRD e as diretrizes do Master Plan.

## 🎯 OBJETIVO ATUAL
Sair do papel com um banco de dados robusto e uma interface funcional que reflita os dados financeiros das obras.

---

## 🛠️ FASE 1: FUNDAÇÃO & DATA-FIRST (EM CURSO)
**Status:** Início Imadiato  
**Objetivo:** Estruturar o núcleo PostgreSQL no Supabase.

### 1.1 Modelagem de Dados (SQL)
- [ ] Criar tabelas: `projects`, `cost_centers`, `categories`, `transactions`, `progress_logs`, `suppliers`.
- [ ] Definir Enums para status (Em Planejamento, Em Execução, Concluída).
- [ ] Configurar Row Level Security (RLS) para multi-tenancy.
- [ ] **Ação Especial:** Mapear colunas da planilha Excel do usuário para as tabelas.

### 1.2 Setup do Frontend
- [ ] Inicializar React + Vite + Tailwind CSS.
- [ ] Configurar biblioteca de ícones (Lucide) e componentes básicos (Shadcn/UI inspirados).
- [ ] Estruturar rotas base (`/dashboard`, `/projetos`, `/financeiro`).

---

## 🎨 FASE 2: UX/UI & PROTOTIPAGEM
**Status:** Próximo Passo  
**Objetivo:** Gerar o design visual para evitar erros de fluxo.

- [ ] Mockup do Dashboard Executivo (Consolidado Financeiro).
- [ ] Mockup da Tela de Lançamento (Foco em velocidade de input).
- [ ] Mockup de Evolução Física x Financeira.

---

## ⚙️ FASE 3: DESENVOLVIMENTO MVP (SPRINTS)

### SPRINT 1: Gestão de Ativos
- Cadastro e Listagem de Obras.
- Gerenciamento de Etapas/Centros de Custo.

### SPRINT 2: Motor Financeiro
- Fluxo de Caixa (Entradas/Saídas).
- Cálculo automático de saldo por obra.

### SPRINT 3: Inteligência (O "Pulo do Gato")
- Gráficos de Previsto x Realizado.
- Alertas de estouro de orçamento.
- Relatório de evolução física (Percentual de conclusão).

---

## 📈 SUCESSO DO PROJETO
O sistema será considerado bem-sucedido quando o usuário conseguir:
1. Importar seus dados atuais de Excel.
2. Ver o saldo de todas as suas obras em menos de 5 segundos.
3. Lançar uma despesa e ver o gráfico de evolução atualizar em tempo real.

---

> [!IMPORTANT]
> **Próxima Ação do Antigravity:** Aguardar planilha/dados do usuário e gerar o SQL final.
