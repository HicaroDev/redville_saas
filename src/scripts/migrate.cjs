/**
 * Script de migração: Excel → Supabase
 * 
 * USO:
 * 1. Configure a anon key correta no .env
 * 2. Execute o schema SQL no Supabase SQL Editor (database_schema.sql)
 * 3. Rode: node src/scripts/migrate.cjs
 * 
 * Pré-requisito: npm install xlsx @supabase/supabase-js dotenv
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Config - altere se necessário
const SUPABASE_URL = 'https://fjgytuvuzcchiuswkucc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WDfDfaMQvzb7lr6QzoBdDQ_xSznJD6c'; // Substituir pela anon key real
const EXCEL_PATH = path.join(__dirname, '..', '..', 'Galpão_Supermecado Portal 1.xlsx');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('📂 Lendo planilha:', EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);

  // ===== 1. INSERIR PROJETO =====
  console.log('\n🏗️ Inserindo projeto...');
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .upsert({
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
    }, { onConflict: 'code' })
    .select()
    .single();

  if (projErr) {
    console.error('❌ Erro ao inserir projeto:', projErr);
    return;
  }
  console.log('✅ Projeto:', project.code, '→', project.id);
  const projectId = project.id;

  // ===== 2. INSERIR ETAPAS (EVOLUÇÃO) =====
  console.log('\n📊 Processando aba EVOLUÇÃO...');
  const evolSheet = wb.Sheets['EVOLUÇÃO'] || wb.Sheets['EVOLUCAO'];
  if (evolSheet) {
    const evolData = XLSX.utils.sheet_to_json(evolSheet, { defval: null });
    const stages = evolData
      .filter(row => row['Etapa'] || row['Nome'] || row['Atividade'])
      .map((row, idx) => ({
        project_id: projectId,
        sequence_id: idx + 1,
        wbs: String(row['WBS'] || row['ID'] || idx + 1),
        level: row['Nível'] || row['Level'] || 1,
        name: row['Etapa'] || row['Nome'] || row['Atividade'] || `Etapa ${idx + 1}`,
        duration_days: row['Duração'] || row['Duração (dias)'] || null,
        predecessor_id: row['Predecessora'] || null,
        planned_start: parseDate(row['Início'] || row['Data Início'] || row['Início Planejado']),
        planned_end: parseDate(row['Fim'] || row['Data Fim'] || row['Fim Planejado']),
        actual_start: parseDate(row['Início Real']),
        actual_end: parseDate(row['Fim Real']),
        progress_pct: row['% Concluído'] || row['%'] || 0,
        status: mapStatus(row['Status'] || 'nao_iniciada'),
        responsible: row['Responsável'] || null,
        estimated_cost: row['Custo Estimado'] || row['Custo'] || null,
        slack_days: row['Folga'] || null,
        is_critical: row['Crítico'] === 'Sim' || row['Crítico'] === true || false,
      }));

    if (stages.length > 0) {
      const { error: stgErr } = await supabase.from('project_stages').insert(stages);
      if (stgErr) console.error('❌ Erro etapas:', stgErr);
      else console.log(`✅ ${stages.length} etapas inseridas`);
    }
  }

  // ===== 3. INSERIR ITENS DO ORÇAMENTO (OBRAS) =====
  console.log('\n💰 Processando aba OBRAS...');
  const obrasSheet = wb.Sheets['OBRAS'];
  if (obrasSheet) {
    const obrasData = XLSX.utils.sheet_to_json(obrasSheet, { defval: null });
    const budgetItems = obrasData
      .filter(row => row['Descrição'] || row['Item'])
      .map(row => ({
        project_id: projectId,
        stage_name: row['Etapa'] || 'Geral',
        sub_stage: row['Subetapa'] || row['Sub Etapa'] || null,
        description: row['Descrição'] || row['Item'] || 'Sem descrição',
        resource_type: mapResourceType(row['Tipo'] || 'MAT'),
        unit: row['Unidade'] || row['UN'] || 'un',
        quantity: row['Quantidade'] || row['Qtd'] || 0,
        unit_cost: row['Custo Unitário'] || row['Custo Un'] || row['Valor'] || 0,
        subtotal: row['Subtotal'] || row['Total'] || 0,
        actual_cost: row['Realizado'] || row['Real'] || null,
        supplier: row['Fornecedor'] || null,
        delivery_date: parseDate(row['Data Entrega']),
        observations: row['Observações'] || row['Obs'] || null,
      }));

    if (budgetItems.length > 0) {
      const { error: budErr } = await supabase.from('budget_items').insert(budgetItems);
      if (budErr) console.error('❌ Erro orçamento:', budErr);
      else console.log(`✅ ${budgetItems.length} itens de orçamento inseridos`);
    }
  }

  // ===== 4. INSERIR LIVRO CAIXA =====
  console.log('\n📖 Processando aba LIVRO CAIXA...');
  const caixaSheet = wb.Sheets['LIVRO CAIXA'];
  if (caixaSheet) {
    const caixaData = XLSX.utils.sheet_to_json(caixaSheet, { defval: null });
    const entries = caixaData
      .filter(row => row['Descrição'] || row['DESCRIÇÃO'])
      .map((row, idx) => ({
        project_id: projectId,
        sequence_id: idx + 1,
        entry_date: parseDate(row['Data'] || row['DATA']) || '2026-03-18',
        description: row['Descrição'] || row['DESCRIÇÃO'] || 'Sem descrição',
        income_source: row['Origem Entrada'] || null,
        income_amount: row['Entrada'] || row['ENTRADA'] || 0,
        expense_source: row['Origem Saída'] || row['Origem'] || null,
        unit_qty: row['UN'] || row['Qtd'] || 1,
        unit_value: row['Valor UN'] || row['Valor Unitário'] || 0,
        expense_amount: row['Saída'] || row['SAÍDA'] || row['Total'] || 0,
        observations: row['Obs'] || row['Observações'] || null,
      }));

    if (entries.length > 0) {
      const { error: cxErr } = await supabase.from('cashbook_entries').insert(entries);
      if (cxErr) console.error('❌ Erro livro caixa:', cxErr);
      else console.log(`✅ ${entries.length} lançamentos inseridos`);
    }
  }

  console.log('\n🎉 Migração concluída!');
}

// ===== HELPERS =====
function parseDate(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value);
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  return null;
}

function mapStatus(status) {
  const s = String(status).toLowerCase().trim();
  if (s.includes('conclu') || s.includes('feito') || s.includes('100')) return 'concluida';
  if (s.includes('andament') || s.includes('execu')) return 'em_andamento';
  if (s.includes('atras')) return 'atrasada';
  return 'nao_iniciada';
}

function mapResourceType(type) {
  const t = String(type).toUpperCase().trim();
  if (['MAT', 'MATERIAL'].includes(t)) return 'MAT';
  if (['MO', 'MÃO DE OBRA', 'MAO DE OBRA'].includes(t)) return 'MO';
  if (['LOC', 'LOCAÇÃO', 'LOCACAO'].includes(t)) return 'LOC';
  if (['TAR', 'TAREFA'].includes(t)) return 'TAR';
  return 'MAT';
}

migrate().catch(console.error);
