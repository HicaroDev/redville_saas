# 🏗️ REDVILLE STANDARD — DESIGN SYSTEM & GUIDELINES

Este documento define o padrão de excelência visual e funcional para o ecossistema Redville Obras. Deve ser seguido rigorosamente por qualquer agente ou desenvolvedor para evitar inconsistências estéticas.

---

## ⚖️ REGRAS DE OURO (GOLDEN RULES)

1. **OPERAÇÃO PESO PENA:** Evite o uso de `font-black` ou excesso de `font-bold`. A hierarquia visual deve vir do tamanho e cor (slate-500 para legendas, slate-900 para títulos) e não de pesos pesados.
2. **NUNCA REMOVER CAMPOS:** Ao refatorar uma página, nunca remova campos existentes sem autorização explícita (ex: Rua, Qd, Lt em Obras foram restaurados e devem permanecer).
3. **RELACIONAMENTO DE DADOS:** Todo lançamento deve ter sua **Carteira** (wallet_id), **Obra** (project_id) e **Forma de Pagamento**.
4. **ESTÉTICA HIGH-END:** Use `backdrop-blur`, gradientes suaves (slate-50 para emerald-50) e micro-interações (hover effects em tabelas).

---

## 🎨 PALETA DE CORES

- **🔴 Redville Principal:** `#B91C1C` (Red 700) - Usado em botões de ação primária e headers de destaque.
- **🛡️ Escala de Cinza:** Slate (900 para títulos, 600 para texto comum, 400 para legendas).
- **✅ Sucesso/Feedback:** Emerald (700 para positivo), Amber (600 para avisos).

---

## 🏛️ COMPONENTES PADRONIZADOS (index.css)

### 1. Header & Títulos
- Use a classe `.rv-header` para h1.
- Use a classe `.rv-label` (uppercase, tracking-wider, text-xs) para labels de tabelas e cabeçalhos de cards.

### 2. Cards & Containers
- Classe `.rv-card`: `bg-white`, `border border-slate-100`, `rounded-xl`, `shadow-sm`.

### 3. Formulários
- Classe `.form-input`: `rounded-lg`, `border-slate-200`, `focus:ring-red-700`.
- **Importante:** Mantenha fontes dos inputs como `font-medium` ou `font-semibold` para facilitar a leitura.

### 4. Botões
- `btn-primary-gradient`: O botão padrão Redville (vermelho para o topo).
- Botões de ação em tabelas: `p-2 hover:bg-red-50 hover:text-red-700 transition-all`.

---

## 🕵️‍♂️ AUDITORIA E LIMPEZA (DEBT REDUCTION)

- Ao editar arquivos como `Lancamentos.jsx` ou `Obras.jsx`, verifique se não há estilos "ad-hoc" (inline CSS ou classes Tailwind redundantes).
- Garanta que o `client_id` seja enviado como `null` se vazio (evitar erro de UUID).

---

### ( OK ) DOCUMENTO HOMOLOGADO POR ELTON / ADMIN
*Última atualização: 08/04/2026*
