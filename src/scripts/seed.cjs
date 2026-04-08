/**
 * Seed Script: Insere dados reais (já extraídos da planilha) no Supabase
 * 
 * Uso: node src/scripts/seed.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fjgytuvuzcchiuswkucc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ3l0dXZ1emNjaGl1c3drdWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjAyMDQsImV4cCI6MjA5MDUzNjIwNH0.yue7NWGYBXvePdXJv0yL6F9WXK_Czg8_4Y3_HVKOL1g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========== DADOS EXTRAÍDOS DA PLANILHA ==========

const PROJECTS = [
  {
    code: 'GLP1',
    name: 'Galpao Supermercado Portal 1',
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
    code: 'GLP2',
    name: 'Galpao Supermercado Portal 2',
    lote: '08',
    area_m2: 900,
    height: 7.5,
    budget_total: 420000.00,
    cost_per_m2: 466.67,
    status: 'em_andamento',
    start_date: '2026-04-01',
    end_date: '2026-06-15',
  },
];

const STAGES_GLP1 = [
  { sequence_id: 1, name: 'Demolicao', duration_days: 3, planned_start: '2026-03-18', planned_end: '2026-03-20', progress_pct: 100, status: 'concluida', is_critical: false },
  { sequence_id: 2, name: 'Projetos', duration_days: 7, planned_start: '2026-03-21', planned_end: '2026-03-27', progress_pct: 100, status: 'concluida', is_critical: false },
  { sequence_id: 3, name: 'Documentos', duration_days: 3, planned_start: '2026-03-28', planned_end: '2026-03-30', progress_pct: 50, status: 'em_andamento', is_critical: true },
  { sequence_id: 4, name: 'Placa de Obra', duration_days: 2, planned_start: '2026-03-31', planned_end: '2026-04-01', progress_pct: 50, status: 'nao_iniciada', is_critical: true },
  { sequence_id: 5, name: 'Demarcacao', duration_days: 2, planned_start: '2026-03-23', planned_end: '2026-03-24', progress_pct: 100, status: 'concluida', is_critical: false },
  { sequence_id: 6, name: 'Topografia', duration_days: 3, planned_start: '2026-03-23', planned_end: '2026-03-25', progress_pct: 100, status: 'concluida', is_critical: false },
  { sequence_id: 7, name: 'Terraplanagem', duration_days: 2, planned_start: '2026-03-24', planned_end: '2026-03-25', progress_pct: 50, status: 'atrasada', is_critical: false },
  { sequence_id: 8, name: 'Fundacao', duration_days: 5, planned_start: '2026-03-30', planned_end: '2026-04-03', progress_pct: 0, status: 'em_andamento', is_critical: true },
  { sequence_id: 9, name: 'Estrutura Metalica', duration_days: 14, planned_start: '2026-03-28', planned_end: '2026-04-10', progress_pct: 50, status: 'em_andamento', responsible: 'David Serralheiro', is_critical: true },
  { sequence_id: 10, name: 'Alvenaria', duration_days: 21, planned_start: '2026-04-04', planned_end: '2026-04-24', progress_pct: 0, status: 'nao_iniciada', is_critical: true },
  { sequence_id: 11, name: 'Infra Pluvial', duration_days: 3, planned_start: '2026-04-04', planned_end: '2026-04-06', progress_pct: 0, status: 'nao_iniciada', is_critical: true },
  { sequence_id: 12, name: 'Infra Esgoto', duration_days: 3, planned_start: '2026-04-07', planned_end: '2026-04-09', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 13, name: 'Infra Hidraulica', duration_days: 3, planned_start: '2026-04-10', planned_end: '2026-04-12', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 14, name: 'Infra Eletrica', duration_days: 3, planned_start: '2026-04-10', planned_end: '2026-04-12', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 15, name: 'Cobertura', duration_days: 7, planned_start: '2026-04-11', planned_end: '2026-04-17', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 16, name: 'Portas', duration_days: 3, planned_start: '2026-04-18', planned_end: '2026-04-20', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 17, name: 'Pintura', duration_days: 5, planned_start: '2026-04-21', planned_end: '2026-04-25', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 18, name: 'Piso / Calcada', duration_days: 5, planned_start: '2026-04-25', planned_end: '2026-04-29', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
  { sequence_id: 19, name: 'Limpeza Final', duration_days: 2, planned_start: '2026-04-30', planned_end: '2026-05-01', progress_pct: 0, status: 'nao_iniciada', is_critical: false },
];

const BUDGET_ITEMS_GLP1 = [
  { stage_name: 'Demolicao', sub_stage: 'Demolicao', description: 'Demolicao completa', resource_type: 'TAR', unit: 'servico', quantity: 1, unit_cost: 10000, subtotal: 10000, actual_cost: 10000 },
  { stage_name: 'Documentos', sub_stage: 'ART', description: 'ART Complementares', resource_type: 'TAR', unit: 'un', quantity: 1, unit_cost: 380, subtotal: 380, actual_cost: null },
  { stage_name: 'Placa de Obra', sub_stage: 'Placa', description: 'Placa de obra padrao', resource_type: 'MAT', unit: 'un', quantity: 1, unit_cost: 500, subtotal: 500, actual_cost: null },
  { stage_name: 'Topografia', sub_stage: 'Levantamento', description: 'Levantamento topografico', resource_type: 'TAR', unit: 'servico', quantity: 1, unit_cost: 1250, subtotal: 1250, actual_cost: null },
  { stage_name: 'Terraplanagem', sub_stage: 'Terraplanagem', description: 'Terraplanagem mecanizada', resource_type: 'TAR', unit: 'servico', quantity: 1, unit_cost: 10500, subtotal: 10500, actual_cost: null },
  { stage_name: 'Fundacao', sub_stage: 'Estacas', description: 'Estacas 3m (25 com 6 barras de 8mm)', resource_type: 'MAT', unit: 'un', quantity: 28, unit_cost: 75, subtotal: 2100, actual_cost: 2377.20 },
  { stage_name: 'Fundacao', sub_stage: 'Blocos', description: 'Blocos 60x60x50', resource_type: 'MAT', unit: 'un', quantity: 28, unit_cost: 105, subtotal: 2940, actual_cost: 2237.20 },
  { stage_name: 'Fundacao', sub_stage: 'Chumbadores', description: 'Chapa base 12mm + chumbadores', resource_type: 'MAT', unit: 'un', quantity: 28, unit_cost: 106, subtotal: 2968, actual_cost: 3637.20 },
  { stage_name: 'Fundacao', sub_stage: 'Concreto', description: 'Concreto usinado', resource_type: 'MAT', unit: 'm3', quantity: 9.5, unit_cost: 560, subtotal: 5320, actual_cost: null },
  { stage_name: 'Fundacao', sub_stage: 'Execucao', description: 'Mao de obra', resource_type: 'MO', unit: 'servico', quantity: 5, unit_cost: 520, subtotal: 2600, actual_cost: null },
  { stage_name: 'Estrutura Metalica', sub_stage: 'Pilares', description: 'Pilares', resource_type: 'MAT', unit: 'kg', quantity: 78, unit_cost: 269.80, subtotal: 21044.40, actual_cost: 21060 },
  { stage_name: 'Estrutura Metalica', sub_stage: 'Tesouras', description: 'Tesouras', resource_type: 'MAT', unit: 'kg', quantity: 78, unit_cost: 55, subtotal: 4290, actual_cost: 4509 },
  { stage_name: 'Estrutura Metalica', sub_stage: 'Tesouras', description: 'Tesouras (montagem)', resource_type: 'MO', unit: 'servico', quantity: 1, unit_cost: 22350, subtotal: 22350, actual_cost: 23220 },
  { stage_name: 'Estrutura Metalica', sub_stage: 'Terças', description: 'Tercas metalicas', resource_type: 'MAT', unit: 'barras', quantity: 100, unit_cost: 84.65, subtotal: 8465, actual_cost: 8809 },
  { stage_name: 'Estrutura Metalica', sub_stage: 'Contraventamento', description: 'Tirantes e cantoneiras', resource_type: 'MAT', unit: 'servico', quantity: 1, unit_cost: 15100, subtotal: 15100, actual_cost: null },
  { stage_name: 'Alvenaria', sub_stage: 'Blocos', description: 'Blocos ceramicos', resource_type: 'MAT', unit: 'un', quantity: 10000, unit_cost: 2.50, subtotal: 25012, actual_cost: 25550 },
  { stage_name: 'Alvenaria', sub_stage: 'Cimento', description: 'Cimento CSN 50KG', resource_type: 'MAT', unit: 'saco', quantity: 500, unit_cost: 34.50, subtotal: 17250, actual_cost: null },
];

const CASHBOOK_ENTRIES = [
  { sequence_id: 1, entry_date: '2026-03-20', description: 'Projetos Vitor', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 2500, expense_amount: 2500 },
  { sequence_id: 2, entry_date: '2026-03-22', description: 'ART Complementares', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 108.39, expense_amount: 108.39 },
  { sequence_id: 3, entry_date: '2026-03-19', description: 'Gasolina Hicaro', expense_source: 'Elton DEBITO', unit_qty: 1, unit_value: 100, expense_amount: 100 },
  { sequence_id: 4, entry_date: '2026-03-17', description: '1a Etapa Demolicao', expense_source: 'Elton DINHEIRO', unit_qty: 1, unit_value: 10000, expense_amount: 10000 },
  { sequence_id: 5, entry_date: '2026-03-19', description: 'CIMENTO CSN 50KG', expense_source: 'Elton PIX', unit_qty: 500, unit_value: 34.50, expense_amount: 17250 },
  { sequence_id: 6, entry_date: '2026-03-22', description: 'AREIA MEDIA', expense_source: 'Elton PIX', unit_qty: 3, unit_value: 1900, expense_amount: 5700 },
  { sequence_id: 7, entry_date: '2026-03-22', description: 'BRITA 0', expense_source: 'Elton PIX', unit_qty: 2, unit_value: 1850, expense_amount: 3700 },
  { sequence_id: 8, entry_date: '2026-03-22', description: 'TELHA 50%', expense_source: 'Elton DINHEIRO', unit_qty: 1, unit_value: 47361, expense_amount: 47361 },
  { sequence_id: 9, entry_date: '2026-03-22', description: 'BLOCO 50%', expense_source: 'Elton DINHEIRO', unit_qty: 1, unit_value: 15747.55, expense_amount: 15747.55 },
  { sequence_id: 10, entry_date: '2026-03-22', description: 'ESTRUTURA', expense_source: 'Elton DINHEIRO / PIX', unit_qty: 1, unit_value: 60734.25, expense_amount: 60734.25 },
  { sequence_id: 11, entry_date: '2026-03-22', description: 'HIDRAULICA', expense_source: 'Elton DINHEIRO', unit_qty: 1, unit_value: 3854.98, expense_amount: 3854.98 },
  { sequence_id: 12, entry_date: '2026-03-22', description: 'FUNDACAO', expense_source: 'Elton DINHEIRO', unit_qty: 1, unit_value: 16581.50, expense_amount: 16581.50 },
  { sequence_id: 13, entry_date: '2026-03-23', description: 'NOTA 4382 NACIONAL', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 18, expense_amount: 18 },
  { sequence_id: 14, entry_date: '2026-03-23', description: 'GASOLINA HICARO', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 100, expense_amount: 100 },
  { sequence_id: 15, entry_date: '2026-03-24', description: 'TOPOGRAFO', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 1000, expense_amount: 1000 },
  { sequence_id: 16, entry_date: '2026-03-24', description: 'JR TERRAPLENAGEM', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 1200, expense_amount: 1200 },
  { sequence_id: 17, entry_date: '2026-03-24', description: 'PONTALETES 1,5', expense_source: 'Redville PIX', unit_qty: 30, unit_value: 10, expense_amount: 300 },
  { sequence_id: 18, entry_date: '2026-03-25', description: 'LOCACAO RETRO', expense_source: 'Elton PIX', unit_qty: 3, unit_value: 250, expense_amount: 750 },
  { sequence_id: 19, entry_date: '2026-03-25', description: 'GASOLINA', expense_source: 'Elton PIX', unit_qty: 1, unit_value: 150, expense_amount: 150 },
  { sequence_id: 20, entry_date: '2026-03-25', description: 'ALMOCO EQUIPE', expense_source: 'Elton DINHEIRO', unit_qty: 1, unit_value: 800, expense_amount: 800 },
];

// ========== SEED ==========

async function seed() {
  console.log('🌱 Iniciando seed dos dados...\n');

  // 1. Inserir Projetos
  console.log('🏗  Inserindo projetos...');
  for (const proj of PROJECTS) {
    const { data, error } = await supabase
      .from('projects')
      .upsert(proj, { onConflict: 'code' })
      .select()
      .single();
    
    if (error) {
      console.error('  ❌ Erro projeto', proj.code, ':', error.message);
    } else {
      console.log('  ✅', data.code, '→', data.id);
    }
  }

  // 2. Buscar IDs dos projetos
  const { data: projects } = await supabase.from('projects').select('id, code');
  const projectMap = {};
  projects.forEach(p => { projectMap[p.code] = p.id; });
  console.log('\n📋 Projetos no banco:', Object.keys(projectMap).join(', '));

  const glp1Id = projectMap['GLP1'];
  if (!glp1Id) {
    console.error('❌ Projeto GLP1 nao encontrado!');
    return;
  }

  // 3. Inserir Etapas
  console.log('\n📊 Inserindo etapas (GLP1)...');
  const stagesWithProject = STAGES_GLP1.map(s => ({ ...s, project_id: glp1Id }));
  const { data: stagesInserted, error: stErr } = await supabase
    .from('project_stages')
    .upsert(stagesWithProject, { onConflict: 'project_id,sequence_id', ignoreDuplicates: true })
    .select();
  
  if (stErr) {
    // Tenta insert normal se upsert falhar
    const { data: si2, error: stErr2 } = await supabase
      .from('project_stages')
      .insert(stagesWithProject)
      .select();
    if (stErr2) console.error('  ❌ Erro etapas:', stErr2.message);
    else console.log('  ✅', si2.length, 'etapas inseridas');
  } else {
    console.log('  ✅', stagesInserted?.length || 0, 'etapas inseridas');
  }

  // 4. Inserir Itens de Orcamento
  console.log('\n💰 Inserindo itens de orcamento (GLP1)...');
  const budgetWithProject = BUDGET_ITEMS_GLP1.map(b => ({ ...b, project_id: glp1Id }));
  const { data: budgetInserted, error: buErr } = await supabase
    .from('budget_items')
    .insert(budgetWithProject)
    .select();
  
  if (buErr) console.error('  ❌ Erro orcamento:', buErr.message);
  else console.log('  ✅', budgetInserted.length, 'itens inseridos');

  // 5. Inserir Livro Caixa
  console.log('\n📖 Inserindo livro caixa (GLP1)...');
  const cashWithProject = CASHBOOK_ENTRIES.map(c => ({ ...c, project_id: glp1Id, income_amount: 0 }));
  const { data: cashInserted, error: csErr } = await supabase
    .from('cashbook_entries')
    .insert(cashWithProject)
    .select();
  
  if (csErr) console.error('  ❌ Erro livro caixa:', csErr.message);
  else console.log('  ✅', cashInserted.length, 'lancamentos inseridos');

  // 6. Verificacao final
  console.log('\n========================================');
  console.log('🎉 SEED CONCLUIDO!\n');
  
  const { count: pCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  const { count: sCount } = await supabase.from('project_stages').select('*', { count: 'exact', head: true });
  const { count: bCount } = await supabase.from('budget_items').select('*', { count: 'exact', head: true });
  const { count: cCount } = await supabase.from('cashbook_entries').select('*', { count: 'exact', head: true });
  
  console.log(`  📊 Projetos:     ${pCount}`);
  console.log(`  📊 Etapas:       ${sCount}`);
  console.log(`  📊 Orcamento:    ${bCount}`);
  console.log(`  📊 Livro Caixa:  ${cCount}`);
  console.log('\n========================================');
}

seed().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
