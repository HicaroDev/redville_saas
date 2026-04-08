-- =====================================================
-- REDVILLE OBRAS SAAS - SCHEMA DEFINITIVO
-- Baseado na planilha: Galpão_Supermecado Portal 1.xlsx
-- =====================================================

-- 1. PROJETOS (OBRAS / GALPÕES)
-- Cada galpão (GLP1, GLP2...) é um projeto
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,           -- "GLP1"
  name TEXT NOT NULL,                  -- "Galpão Supermercado Portal 1"
  lote TEXT,                           -- "07"
  quadra TEXT,                         -- "08"
  street TEXT,                         -- "Rua Principal"
  cep TEXT,                            -- "00000-000"
  location TEXT,
  client_id UUID REFERENCES clients(id),
  area_m2 DECIMAL(10,2),
  height DECIMAL(10,2),
  budget_total DECIMAL(15,2) DEFAULT 0,
  cost_per_m2 DECIMAL(15,2),
  status TEXT DEFAULT 'em_andamento'   
    CHECK (status IN ('planejada','em_andamento','concluida','pausada')),
  start_date DATE,
  end_date DATE,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.1 CLIENTES (PROPRIETÁRIOS)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                  -- Nome do Proprietário
  document TEXT,                       -- CPF/CNPJ
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionando FK tardia (se necessário)
-- ALTER TABLE projects ADD CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES clients(id);

-- 2. ETAPAS DA OBRA (EVOLUÇÃO / CRONOGRAMA)
-- Cada linha da aba EVOLUÇÃO vira um registro aqui
CREATE TABLE IF NOT EXISTS project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sequence_id INTEGER,                 -- ID sequencial (1, 2, 3...)
  wbs TEXT,                            -- "1.0", "2.0"
  level INTEGER DEFAULT 1,            -- Nível hierárquico
  name TEXT NOT NULL,                  -- "Demolição", "Fundação", "Estrutura Metálica"
  duration_days INTEGER,              -- Duração em dias
  predecessor_id INTEGER,             -- ID da etapa predecessora
  planned_start DATE,                 -- Data Início Planejada
  planned_end DATE,                   -- Data Fim Planejada
  actual_start DATE,                  -- Data Início Real
  actual_end DATE,                    -- Data Fim Real
  progress_pct DECIMAL(5,2) DEFAULT 0,-- % Concluído (0 a 100)
  status TEXT DEFAULT 'nao_iniciada'
    CHECK (status IN ('nao_iniciada','em_andamento','concluida','atrasada')),
  responsible TEXT,                    -- "David Serralheiro"
  estimated_cost DECIMAL(15,2),
  slack_days INTEGER,                  -- Folga (dias)
  is_critical BOOLEAN DEFAULT FALSE,   -- Caminho crítico
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ITENS DO ORÇAMENTO (ABA OBRAS)
-- Cada linha da aba OBRAS vira um item de orçamento
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES project_stages(id), -- Vínculo real por ID
  stage_name TEXT NOT NULL,            -- Nome da etapa (redundância para busca)
  description TEXT NOT NULL,           -- "Blocos 60x60x50", "Concreto usinado"
  execution_days INTEGER DEFAULT 0,    -- Tempo de execução estimado (em dias)
  resource_type TEXT NOT NULL          
    CHECK (resource_type IN ('MAT','MO','LOC','TAR')),
  unit TEXT,                           -- "un", "m³", "barras"
  quantity DECIMAL(15,4) DEFAULT 0,
  unit_cost DECIMAL(15,2) DEFAULT 0,
  subtotal DECIMAL(15,2) DEFAULT 0,    -- Quantidade x Custo Unitário
  actual_cost DECIMAL(15,2),           -- REALIZADO
  supplier TEXT,                       -- Fornecedor
  delivery_date DATE,                  -- Data de entrega
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LIVRO CAIXA (ABA LIVRO CAIXA)
-- Registro de todas as movimentações financeiras
CREATE TABLE IF NOT EXISTS cashbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  sequence_id INTEGER,                 -- ID sequencial
  entry_date DATE NOT NULL,            -- Data do lançamento
  description TEXT NOT NULL,           -- "CIMENTO CSN 50KG", "Projetos Vitor"
  income_source TEXT,                  -- Origem da Entrada (quando for receita)
  income_amount DECIMAL(15,2) DEFAULT 0,  -- Valor da Entrada
  expense_source TEXT,                 -- "Elton PIX", "Elton DINHEIRO", "Elton DÉBITO"
  unit_qty DECIMAL(15,4) DEFAULT 1,    -- UN (quantidade de unidades)
  unit_value DECIMAL(15,2) DEFAULT 0,  -- Valor Unitário
  expense_amount DECIMAL(15,2) DEFAULT 0, -- Valor da Saída (total)
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LISTA DE COMPRAS (ABA LISTA DE COMPRAS - futuro)
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage_name TEXT,                     -- "Demarcação", "Fundação"
  description TEXT NOT NULL,           -- "Pontalete 1,5m", "Mangueira de nível"
  quantity DECIMAL(15,4) DEFAULT 0,
  unit TEXT,                           -- "UM", "Metros", "KG"
  planned_start DATE,
  planned_end DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'pendente'
    CHECK (status IN ('pendente','comprado','entregue','cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CATEGORIAS FINANCEIRAS (tipos de recurso expandidos)
CREATE TABLE IF NOT EXISTS resource_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,           -- "MAT", "MO", "LOC", "TAR"
  name TEXT NOT NULL,                  -- "Material", "Mão de Obra", "Locação", "Tarefa"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed de categorias
INSERT INTO resource_types (code, name) VALUES
  ('MAT', 'Material'),
  ('MO', 'Mão de Obra'),
  ('LOC', 'Locação'),
  ('TAR', 'Tarefa')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_budget_items_project ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_stage ON budget_items(stage_name);
CREATE INDEX IF NOT EXISTS idx_budget_items_type ON budget_items(resource_type);
CREATE INDEX IF NOT EXISTS idx_stages_project ON project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_status ON project_stages(status);
CREATE INDEX IF NOT EXISTS idx_cashbook_project ON cashbook_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_cashbook_date ON cashbook_entries(entry_date);

-- =====================================================
-- VIEWS PARA DASHBOARD
-- =====================================================

-- View: Resumo financeiro por projeto
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.budget_total,
  COALESCE(SUM(bi.subtotal), 0) AS total_orcado,
  COALESCE(SUM(bi.actual_cost), 0) AS total_realizado,
  COALESCE(SUM(bi.subtotal), 0) - COALESCE(SUM(bi.actual_cost), 0) AS desvio,
  CASE WHEN SUM(bi.subtotal) > 0 
    THEN ROUND((SUM(bi.actual_cost) / SUM(bi.subtotal)) * 100, 2) 
    ELSE 0 
  END AS pct_gasto
FROM projects p
LEFT JOIN budget_items bi ON bi.project_id = p.id
GROUP BY p.id, p.code, p.name, p.budget_total;

-- View: Saldo do livro caixa
CREATE OR REPLACE VIEW v_cashbook_balance AS
SELECT
  project_id,
  SUM(income_amount) AS total_entradas,
  SUM(expense_amount) AS total_saidas,
  SUM(income_amount) - SUM(expense_amount) AS saldo
FROM cashbook_entries
GROUP BY project_id;

-- View: Progresso médio por projeto
CREATE OR REPLACE VIEW v_project_progress AS
SELECT
  project_id,
  COUNT(*) AS total_etapas,
  COUNT(*) FILTER (WHERE status = 'concluida') AS etapas_concluidas,
  COUNT(*) FILTER (WHERE status = 'atrasada') AS etapas_atrasadas,
  ROUND(AVG(progress_pct), 2) AS progresso_medio
FROM project_stages
GROUP BY project_id;
