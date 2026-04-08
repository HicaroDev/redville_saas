# 🏗 Redville SaaS Roadmap - Fase de Gestão Real

Abaixo, o planejamento atualizado incorporando a extração dos 3 galpões da planilha e as novas solicitações do `dados.md`.

## 📍 Fase 3: Conexão & Sincronização Local (Concluída)
- [x] Extração total da planilha `Galpão_Supermercado Portal 1.xlsx`.
- [x] Sincronização dos 3 galpões (**GLP1, GLP2, GLP3**) no Supabase.
- [x] Dashboard dinâmico conectando Obras, Orçado e Livro Caixa.

## 🚀 Fase 4: Módulo de Cadastros & Qualidade (Em Processo)
> "Transformar dados estáticos em cadastros vivos para manter a qualidade."

- [x] **Cadastro de Materiais**: Criar tabela `resource_types` e UI para gerenciar catálogo de itens padrão. (**CONCLUÍDO**)
- [x] **Cadastro de Clientes**: Vincular cada obra a um cliente (Lote + Proprietário). (**UI CONCLUÍDA**)
- [ ] **Upgrade Obras**:
    - **Orçamento Cliente**: Área para cadastrar o orçamento aprovado versus o custo real.
    - **Contratos**: Botão para anexar ou vincular o contrato assinado à obra.
    - **Gestor de Etapas**: Interface para adicionar/editar etapas e subetapas manualmente (além da planilha).

## 🔐 Fase 5: Usuário & Governança
- [ ] **Módulo Usuários**: Criar sistema de login via Supabase Auth + tabela `profiles`.
- [ ] **Permissões (ADM Master)**: 
    - ADM: Acesso total a Financeiro e Configurações.
    - Engenheiro/Mestre: Acesso apenas a Evolução de Obras.
    - Vizualizador: Apenas leitura.

## 💰 Fase 6: Motor Financeiro & Carteiras
- [ ] **Centros de Custo (Carteiras)**: Consolidar "Carteira Dono", "Carteira RedVille" e "Carteira por Obra" (Livro Caixa dinâmico).

---
*Atualizado por Antigravity (Orchestrator) em 01/04/2026*
