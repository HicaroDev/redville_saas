-- =====================================================
-- REDVILLE OBRAS SAAS - ENHANCEMENTS (PRESTADORES)
-- =====================================================

-- 1. NOVAS TABELAS PARA PRESTADORES DE SERVIÇO
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT, -- CPF/CNPJ
  phone TEXT,
  email TEXT,
  employees TEXT[], -- Lista de nomes de funcionários
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTRATOS DE PRESTAÇÃO DE SERVIÇO (Vínculo Prestador x Obra)
CREATE TABLE IF NOT EXISTS service_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  service_type TEXT, -- "Empreita", "Serviço", "M2", etc.
  description TEXT, -- Ex: "Alvenaria Galpão"
  unit_price DECIMAL(15,2), -- Ex: 32.00 (se for por m2)
  total_agreed_value DECIMAL(15,2), -- Valor total do contrato
  status TEXT DEFAULT 'ativo', -- "ativo", "concluído", "cancelado"
  start_date DATE,
  contract_url TEXT, -- Link para o PDF/Documento anexado
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEDIÇÕES E ENTREGAS (Para controle de saldo)
CREATE TABLE IF NOT EXISTS service_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES service_contracts(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  quantity DECIMAL(15,2) DEFAULT 1, -- Qtd medida (ex: 32 m2)
  total_amount DECIMAL(15,2) NOT NULL, -- Valor medido
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADICIONAR CAMPO EM LANÇAMENTOS PARA VÍNCULO COM PRESTADOR
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cashbook_entries' AND column_name='provider_id') THEN
    ALTER TABLE cashbook_entries ADD COLUMN provider_id UUID REFERENCES service_providers(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cashbook_entries' AND column_name='contract_id') THEN
    ALTER TABLE cashbook_entries ADD COLUMN contract_id UUID REFERENCES service_contracts(id);
  END IF;
END $$;
