// Mock data baseado na planilha real: Galpão_Supermecado Portal 1.xlsx

export const PROJECTS = [
  {
    id: '1',
    code: 'GLP1',
    name: 'Galpão Supermercado Portal 1',
    lote: '07',
    area_m2: 900,
    height: 7.5,
    budget_total: 445420.70,
    cost_per_m2: 494.91,
    status: 'em_andamento',
    start_date: '2026-03-18',
    end_date: '2026-05-01',
  },
  {
    id: '2',
    code: 'GLP2',
    name: 'Galpão Supermercado Portal 2',
    lote: '08',
    area_m2: 900,
    height: 7.5,
    budget_total: 420000.00,
    cost_per_m2: 466.67,
    status: 'em_andamento',
    start_date: '2026-03-18',
    end_date: '2026-05-15',
  },
];

export const STAGES = [
  { id: 1, project_code: 'GLP1', name: 'Demolição', duration_days: 3, progress_pct: 100, status: 'concluida', planned_start: '2026-03-18', planned_end: '2026-03-20', responsible: null, is_critical: false },
  { id: 2, project_code: 'GLP1', name: 'Projetos', duration_days: 7, progress_pct: 100, status: 'concluida', planned_start: '2026-03-21', planned_end: '2026-03-27', responsible: null, is_critical: false },
  { id: 3, project_code: 'GLP1', name: 'Documentos', duration_days: 3, progress_pct: 50, status: 'em_andamento', planned_start: '2026-03-28', planned_end: '2026-03-30', responsible: null, is_critical: true },
  { id: 4, project_code: 'GLP1', name: 'Placa de Obra', duration_days: 2, progress_pct: 50, status: 'nao_iniciada', planned_start: '2026-03-31', planned_end: '2026-04-01', responsible: null, is_critical: true },
  { id: 5, project_code: 'GLP1', name: 'Demarcação', duration_days: 2, progress_pct: 100, status: 'concluida', planned_start: '2026-03-23', planned_end: '2026-03-24', responsible: null, is_critical: true },
  { id: 6, project_code: 'GLP1', name: 'Topografia', duration_days: 3, progress_pct: 100, status: 'concluida', planned_start: '2026-03-23', planned_end: '2026-03-25', responsible: null, is_critical: false },
  { id: 7, project_code: 'GLP1', name: 'Terraplanagem', duration_days: 2, progress_pct: 50, status: 'atrasada', planned_start: '2026-03-24', planned_end: '2026-03-25', responsible: null, is_critical: false },
  { id: 8, project_code: 'GLP1', name: 'Fundação', duration_days: 5, progress_pct: 0, status: 'em_andamento', planned_start: '2026-03-30', planned_end: '2026-04-03', responsible: null, is_critical: true },
  { id: 9, project_code: 'GLP1', name: 'Estrutura Metálica', duration_days: 14, progress_pct: 50, status: 'em_andamento', planned_start: '2026-03-28', planned_end: '2026-04-10', responsible: 'David Serralheiro', is_critical: true },
  { id: 10, project_code: 'GLP1', name: 'Alvenaria', duration_days: 21, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-04', planned_end: '2026-04-24', responsible: null, is_critical: true },
  { id: 11, project_code: 'GLP1', name: 'Infra Pluvial', duration_days: 3, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-04', planned_end: '2026-04-06', responsible: null, is_critical: true },
  { id: 12, project_code: 'GLP1', name: 'Infra Esgoto', duration_days: 3, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-07', planned_end: '2026-04-09', responsible: null, is_critical: false },
  { id: 13, project_code: 'GLP1', name: 'Infra Hidráulica', duration_days: 2, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-10', planned_end: '2026-04-11', responsible: null, is_critical: false },
  { id: 14, project_code: 'GLP1', name: 'Infra Elétrica', duration_days: 2, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-07', planned_end: '2026-04-08', responsible: null, is_critical: false },
  { id: 15, project_code: 'GLP1', name: 'Cobertura', duration_days: 7, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-11', planned_end: '2026-04-17', responsible: null, is_critical: false },
  { id: 16, project_code: 'GLP1', name: 'Piso', duration_days: 12, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-12', planned_end: '2026-04-23', responsible: null, is_critical: false },
  { id: 17, project_code: 'GLP1', name: 'Portas', duration_days: 3, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-25', planned_end: '2026-04-27', responsible: null, is_critical: false },
  { id: 18, project_code: 'GLP1', name: 'Instalações', duration_days: 4, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-09', planned_end: '2026-04-12', responsible: null, is_critical: false },
  { id: 19, project_code: 'GLP1', name: 'Pintura', duration_days: 7, progress_pct: 0, status: 'nao_iniciada', planned_start: '2026-04-25', planned_end: '2026-05-01', responsible: null, is_critical: false },
];

export const BUDGET_ITEMS = [
  { project_code: 'GLP1', stage: 'Demolição', sub_stage: '1 Etapa', description: 'Demolição da casa três', type: 'LOC', unit: 'Empreita', qty: 1, unit_cost: 10000, subtotal: 10000, actual: 10000 },
  { project_code: 'GLP1', stage: 'Projetos', sub_stage: 'Arq/ Complementares', description: 'Projetos', type: 'MAT', unit: 'serviço', qty: 1, unit_cost: 0, subtotal: 0, actual: null },
  { project_code: 'GLP1', stage: 'Documentos', sub_stage: 'Art', description: 'Responsabilidade e de Projeto Arquitetonico', type: 'TAR', unit: 'bol', qty: 2, unit_cost: 190, subtotal: 380, actual: null },
  { project_code: 'GLP1', stage: 'Placa de Obra', sub_stage: 'Divulgação', description: 'Placa de divugação', type: 'MAT', unit: 'un', qty: 1, unit_cost: 500, subtotal: 500, actual: null },
  { project_code: 'GLP1', stage: 'Topografia', sub_stage: 'Projetos', description: 'Planaltimetrico', type: 'MO', unit: 'Empreita', qty: 1, unit_cost: 1250, subtotal: 1250, actual: null },
  { project_code: 'GLP1', stage: 'Terraplanagem', sub_stage: 'Transporte', description: 'Caminhão terra', type: 'LOC', unit: 'viagem', qty: 35, unit_cost: 300, subtotal: 10500, actual: null },
  { project_code: 'GLP1', stage: 'Fundação', sub_stage: 'Estacas', description: 'Estacas 3m (25 com 6 barras de 8mm)', type: 'MAT', unit: 'un', qty: 28, unit_cost: 75, subtotal: 2100, actual: 2377.20 },
  { project_code: 'GLP1', stage: 'Fundação', sub_stage: 'Blocos', description: 'Blocos 60x60x50', type: 'MAT', unit: 'un', qty: 28, unit_cost: 105, subtotal: 2940, actual: 2237.20 },
  { project_code: 'GLP1', stage: 'Fundação', sub_stage: 'Chumbadores', description: 'Chapa base 12mm + chumbadores', type: 'MAT', unit: 'un', qty: 28, unit_cost: 106, subtotal: 2968, actual: 3637.20 },
  { project_code: 'GLP1', stage: 'Fundação', sub_stage: 'Concreto', description: 'Concreto usinado', type: 'MAT', unit: 'm³', qty: 9.5, unit_cost: 560, subtotal: 5320, actual: null },
  { project_code: 'GLP1', stage: 'Fundação', sub_stage: 'Execução', description: 'Mão de obra', type: 'MO', unit: 'serviço', qty: 5, unit_cost: 520, subtotal: 2600, actual: null },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Pilares', description: '200x75x2,25', type: 'MAT', unit: 'barras', qty: 78, unit_cost: 269.80, subtotal: 21044.40, actual: 21060 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Tesouras', description: '150x60x2,0', type: 'MAT', unit: 'barras', qty: 51, unit_cost: 168, subtotal: 8568, actual: 8262 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Tesouras', description: '143x40x2,0', type: 'MAT', unit: 'barras', qty: 30, unit_cost: 143, subtotal: 4290, actual: 4509 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Tesouras', description: '127x2,0', type: 'MAT', unit: 'barras', qty: 150, unit_cost: 149, subtotal: 22350, actual: 23220 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Insumos', description: 'Eletrodo', type: 'MAT', unit: 'kg', qty: 75, unit_cost: 15.80, subtotal: 1185, actual: 432 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Insumos', description: 'Thinner', type: 'MAT', unit: 'lata', qty: 10, unit_cost: 145, subtotal: 1450, actual: 1035 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Pintura', description: 'Tinta primer', type: 'MAT', unit: 'balde', qty: 8, unit_cost: 389, subtotal: 3112, actual: 1080 },
  { project_code: 'GLP1', stage: 'Estrutura Metálica', sub_stage: 'Execução', description: 'Mão de obra', type: 'MO', unit: 'serviço', qty: 1, unit_cost: 9250, subtotal: 9250, actual: null },
  { project_code: 'GLP1', stage: 'Alvenaria', sub_stage: 'Blocos', description: 'Blocos', type: 'MAT', unit: 'un', qty: 6582, unit_cost: 3.80, subtotal: 25011.60, actual: 25550 },
  { project_code: 'GLP1', stage: 'Alvenaria', sub_stage: 'Canaletas', description: 'Canaletas', type: 'MAT', unit: 'un', qty: 1490, unit_cost: 4.20, subtotal: 6258, actual: 5945 },
];

export const CASHBOOK = [
  { id: 1, date: '2026-03-21', description: 'Projetos Vitor', source: 'Elton PIX', qty: 1, unit_value: 2500, total: 2500 },
  { id: 2, date: '2026-03-23', description: 'ART Complementares', source: 'Elton PIX', qty: 1, unit_value: 108.39, total: 108.39 },
  { id: 3, date: '2026-03-20', description: 'Gasolina Hícaro', source: 'Elton DÉBITO', qty: 1, unit_value: 100, total: 100 },
  { id: 4, date: '2026-03-18', description: '1a Etapa Demolição', source: 'Elton DINHEIRO', qty: 1, unit_value: 10000, total: 10000 },
  { id: 5, date: '2026-03-20', description: 'CIMENTO CSN 50KG', source: 'Elton PIX', qty: 500, unit_value: 34.50, total: 17250 },
  { id: 6, date: '2026-03-23', description: 'AREIA MÉDIA', source: 'Elton PIX', qty: 3, unit_value: 1900, total: 5700 },
  { id: 7, date: '2026-03-23', description: 'BRITA 0', source: 'Elton PIX', qty: 2, unit_value: 1850, total: 3700 },
  { id: 8, date: '2026-03-23', description: 'TELHA 50%', source: 'Elton DINHEIRO', qty: 1, unit_value: 47361, total: 47361 },
  { id: 9, date: '2026-03-23', description: 'BLOCO 50%', source: 'Elton DINHEIRO', qty: 1, unit_value: 15747.55, total: 15747.55 },
  { id: 10, date: '2026-03-23', description: 'ESTRUTURA', source: 'Elton DINHEIRO / PIX', qty: 1, unit_value: 60734.25, total: 60734.25 },
  { id: 11, date: '2026-03-23', description: 'HIDRAULICA', source: 'Elton DINHEIRO', qty: 1, unit_value: 3854.98, total: 3854.98 },
  { id: 12, date: '2026-03-23', description: 'FUNDAÇÃO', source: 'Elton DINHEIRO', qty: 1, unit_value: 16581.50, total: 16581.50 },
  { id: 13, date: '2026-03-24', description: 'NOTA 4382 NACIONAL', source: 'Elton PIX', qty: 1, unit_value: 18, total: 18 },
  { id: 14, date: '2026-03-24', description: 'NOTA 4385 NACIONAL', source: 'Elton PIX', qty: 1, unit_value: 109.20, total: 109.20 },
  { id: 15, date: '2026-03-24', description: 'NOTA 4364 NACIONAL', source: 'Elton PIX', qty: 1, unit_value: 260, total: 260 },
  { id: 16, date: '2026-03-24', description: 'FRETE CONTAINER', source: 'Elton PIX', qty: 1, unit_value: 150, total: 150 },
  { id: 17, date: '2026-03-27', description: 'Hicaro Adiantamento', source: 'Elton DINHEIRO', qty: 1, unit_value: 2500, total: 2500 },
  { id: 18, date: '2026-03-27', description: 'Lucas', source: 'Elton PIX', qty: 1, unit_value: 650, total: 650 },
  { id: 19, date: '2026-03-30', description: 'Serralheiro', source: 'Elton PIX', qty: 1, unit_value: 1600, total: 1600 },
  { id: 20, date: '2026-03-31', description: 'Câmara de ar (Adiantamento Socrates)', source: 'Elton PIX', qty: 1, unit_value: 31, total: 31 },
];

export const CASHBOOK_SUMMARY = {
  total_entradas: 0,
  total_saidas: 188955.87,
  saldo: -188955.87,
};

export const STATUS_MAP = {
  concluida: { label: 'Concluída', color: 'emerald' },
  em_andamento: { label: 'Em andamento', color: 'blue' },
  atrasada: { label: 'Atrasada', color: 'red' },
  nao_iniciada: { label: 'Não iniciada', color: 'slate' },
  planejada: { label: 'Planejada', color: 'slate' },
  pausada: { label: 'Pausada', color: 'amber' },
};

export const RESOURCE_TYPE_MAP = {
  MAT: { label: 'Material', color: 'blue' },
  MO: { label: 'Mão de Obra', color: 'amber' },
  LOC: { label: 'Locação', color: 'purple' },
  TAR: { label: 'Tarefa', color: 'slate' },
};
