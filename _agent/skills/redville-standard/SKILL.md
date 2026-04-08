---
name: redville-standard
description: "Mantém o padrão visual e funcional 'Peso Pena' do Redville Obras SaaS, garantindo tipografia leve, design profissional e integridade de dados financeiros."
---

# 🏗️ REDVILLE STANDARD SKILL

Use esta skill para garantir que todas as modificações no sistema Redville Obras sigam a identidade visual premium e a arquitetura de dados estabelecida.

## 🎨 DESIGN GUIDELINES (OPERAÇÃO PESO PENA)

1. **Tipografia:** 
   - NUNCA use `font-black`. 
   - Use `font-bold` APENAS para títulos e indicadores de status.
   - Textos secundários devem usar `slate-400` ou `slate-500` e pesos `normal` ou `medium`.

2. **Componentes (src/index.css):**
   - **Títulos:** Use `.rv-header`.
   - **Cards:** Use `.rv-card`.
   - **Labels:** Use `.rv-label`.
   - **Inputs:** Use `.form-input`.

3. **Cores:** 
   - Primária: Redville Red (`#B91C1C`).
   - Fundo: Slate-50/30 para áreas de trabalho e White para cards.

## ⚙️ REGRAS TÉCNICAS

1. **Salvamento de Obras:** 
   - Garanta que `client_id` seja `null` se não houver seleção (evitar erro de UUID).
   - Mantenha os campos: Rua, Qd, Lt, CEP, Área, Orçamento e Observações.

2. **Financeiro (Lançamentos):**
   - Todo lançamento DEVE salvar `payment_method`, `wallet_id` e a origem correta (`expense_source` ou `income_source`).

3. **Navegação:** 
   - O menu de Cadastro Geral deve sempre suportar os 5 sub-itens: Fornecedores, Prestadores, Funcionários, Materiais e Clientes.

## 📝 FLUXO DE TRABALHO

Antes de finalizar qualquer tarefa, verifique:
- [ ] O design está leve ("Peso Pena")?
- [ ] Os campos obrigatórios estão sendo salvos?
- [ ] O arquivo `dados.md` foi atualizado com `( OK )`?
