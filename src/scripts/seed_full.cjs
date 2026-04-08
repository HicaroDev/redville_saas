/**
 * Seed COMPLETO: Extrai dados da planilha Excel e insere no Supabase
 * Uso: node src/scripts/seed_full.cjs
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL = 'https://fjgytuvuzcchiuswkucc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ3l0dXZ1emNjaGl1c3drdWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjAyMDQsImV4cCI6MjA5MDUzNjIwNH0.yue7NWGYBXvePdXJv0yL6F9WXK_Czg8_4Y3_HVKOL1g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const filePath = path.join(__dirname, '..', '..', 'Galpão_Supermecado Portal 1.xlsx');

async function seedFull() {
  console.log('📂 Lendo planilha:', filePath);
  const wb = XLSX.readFile(filePath, { cellDates: true });

  // ============ 1. LIMPAR DADOS ANTIGOS ============
  console.log('\n🧹 Limpando dados antigos...');
  await supabase.from('cashbook_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('budget_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('project_stages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  ✅ Tabelas limpas');

  // ============ 2. PROJETO ============
  console.log('\n🏗  Upsert projeto GLP1...');
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .upsert({
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
    }, { onConflict: 'code' })
    .select()
    .single();

  if (pErr) { console.error('❌', pErr.message); return; }
  console.log('  ✅ GLP1 →', project.id);
  const projectId = project.id;

  // ============ 3. OBRAS (ORCAMENTO) ============
  console.log('\n💰 Inserindo itens de orcamento da aba OBRAS...');
  const obrasRows = XLSX.utils.sheet_to_json(wb.Sheets['OBRAS'], { header: 1, defval: '', raw: true });
  // Header: [Galpao, Etapa, Subetapa, Descricao, Tipo, Unidade, Quantidade, Custo Unitario, Subtotal, Realizado, Fornecedor, Data entrega, Obs]
  const budgetItems = [];
  for (let i = 2; i < obrasRows.length; i++) {
    const r = obrasRows[i];
    if (!r[0] || r[0] === '') continue; // skip empty
    const qty = typeof r[6] === 'number' ? r[6] : 0;
    const unitCost = typeof r[7] === 'number' ? r[7] : 0;
    const subtotal = typeof r[8] === 'number' ? r[8] : 0;
    let actual = r[9];
    if (actual === '' || actual === '-' || actual == null) actual = null;
    else actual = Number(actual);

    let resType = String(r[4] || 'MAT').toUpperCase().trim();
    if (!['MAT','MO','LOC','TAR'].includes(resType)) {
      if (resType.includes('MO')) resType = 'MO';
      else resType = 'MAT';
    }

    budgetItems.push({
      project_id: projectId,
      stage_name: String(r[1] || '').trim(),
      sub_stage: String(r[2] || '').trim(),
      description: String(r[3] || '').trim(),
      resource_type: resType,
      unit: String(r[5] || 'un').trim(),
      quantity: qty,
      unit_cost: unitCost,
      subtotal: subtotal,
      actual_cost: actual,
      supplier: r[10] ? String(r[10]).trim() : null,
      delivery_date: r[11] instanceof Date ? r[11].toISOString().split('T')[0] : null,
      observations: r[12] ? String(r[12]).trim() : null,
    });
  }

  if (budgetItems.length > 0) {
    const { error: bErr } = await supabase.from('budget_items').insert(budgetItems);
    if (bErr) console.error('  ❌ Erro orcamento:', bErr.message);
    else console.log(`  ✅ ${budgetItems.length} itens inseridos`);
  }

  // ============ 4. EVOLUCAO (ETAPAS) ============
  console.log('\n📊 Inserindo etapas da aba EVOLUCAO...');
  const evolRows = XLSX.utils.sheet_to_json(wb.Sheets['EVOLUÇÃO'], { header: 1, defval: '', raw: true });
  
  // Detect header row - look for row with "Atividade" or "Nome" or similar
  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, evolRows.length); i++) {
    const row = evolRows[i];
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('atividade') || rowStr.includes('etapa') || rowStr.includes('nome')) {
      headerIdx = i;
      break;
    }
  }
  console.log('  Header detectado na linha:', headerIdx);
  console.log('  Colunas:', JSON.stringify(evolRows[headerIdx]?.slice(0, 12)));

  const stages = [];
  for (let i = headerIdx + 1; i < evolRows.length; i++) {
    const r = evolRows[i];
    const name = String(r[1] || r[0] || '').trim();
    if (!name || name === '') continue;

    let status = 'nao_iniciada';
    const progress = typeof r[8] === 'number' ? Math.round(r[8] * (r[8] <= 1 ? 100 : 1)) : 0;
    if (progress >= 100) status = 'concluida';
    else if (progress > 0) status = 'em_andamento';

    // Parse dates
    let startDate = null, endDate = null;
    if (r[5] instanceof Date) startDate = r[5].toISOString().split('T')[0];
    else if (typeof r[5] === 'string' && r[5]) startDate = r[5];
    if (r[6] instanceof Date) endDate = r[6].toISOString().split('T')[0];
    else if (typeof r[6] === 'string' && r[6]) endDate = r[6];

    const duration = typeof r[4] === 'number' ? r[4] : null;

    stages.push({
      project_id: projectId,
      sequence_id: stages.length + 1,
      name: name,
      duration_days: duration,
      planned_start: startDate,
      planned_end: endDate,
      progress_pct: progress,
      status: status,
      responsible: r[9] ? String(r[9]).trim() : null,
      is_critical: false,
    });
  }

  if (stages.length > 0) {
    const { error: sErr } = await supabase.from('project_stages').insert(stages);
    if (sErr) console.error('  ❌ Erro etapas:', sErr.message);
    else console.log(`  ✅ ${stages.length} etapas inseridas`);
  }

  // ============ 5. LIVRO CAIXA ============
  console.log('\n📖 Inserindo livro caixa...');
  const caixaRows = XLSX.utils.sheet_to_json(wb.Sheets['LIVRO CAIXA'], { header: 1, defval: '', raw: true });
  
  // Find header row
  let caixaHeader = 0;
  for (let i = 0; i < Math.min(10, caixaRows.length); i++) {
    const rowStr = caixaRows[i].join(' ').toLowerCase();
    if (rowStr.includes('descrição') || rowStr.includes('descricao') || rowStr.includes('data')) {
      caixaHeader = i;
      break;
    }
  }
  console.log('  Header caixa na linha:', caixaHeader);
  console.log('  Colunas:', JSON.stringify(caixaRows[caixaHeader]?.slice(0, 12)));

  const cashEntries = [];
  for (let i = caixaHeader + 1; i < caixaRows.length; i++) {
    const r = caixaRows[i];
    const desc = String(r[3] || r[2] || r[1] || '').trim();
    if (!desc || desc === '') continue;

    let entryDate = null;
    // Find date column
    for (let c = 0; c < 5; c++) {
      if (r[c] instanceof Date) {
        entryDate = r[c].toISOString().split('T')[0];
        break;
      }
    }
    if (!entryDate) entryDate = '2026-03-22'; // default

    const expenseAmount = typeof r[8] === 'number' ? r[8] : 0;
    if (expenseAmount === 0) continue; // skip empty entries

    cashEntries.push({
      project_id: projectId,
      sequence_id: cashEntries.length + 1,
      entry_date: entryDate,
      description: desc,
      income_source: null,
      income_amount: 0,
      expense_source: r[7] ? String(r[7]).trim() : 'Elton',
      unit_qty: typeof r[5] === 'number' ? r[5] : 1,
      unit_value: typeof r[6] === 'number' ? r[6] : expenseAmount,
      expense_amount: expenseAmount,
      observations: r[9] ? String(r[9]).trim() : null,
    });
  }

  if (cashEntries.length > 0) {
    const { error: cErr } = await supabase.from('cashbook_entries').insert(cashEntries);
    if (cErr) console.error('  ❌ Erro caixa:', cErr.message);
    else console.log(`  ✅ ${cashEntries.length} lancamentos inseridos`);
  }

  // ============ RESUMO FINAL ============
  console.log('\n========================================');
  const { count: pC } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  const { count: sC } = await supabase.from('project_stages').select('*', { count: 'exact', head: true });
  const { count: bC } = await supabase.from('budget_items').select('*', { count: 'exact', head: true });
  const { count: cC } = await supabase.from('cashbook_entries').select('*', { count: 'exact', head: true });

  console.log('🎉 SEED COMPLETO!');
  console.log(`  📊 Projetos:     ${pC}`);
  console.log(`  📊 Etapas:       ${sC}`);
  console.log(`  📊 Orcamento:    ${bC} (antes eram 17, agora COMPLETO)`);
  console.log(`  📊 Livro Caixa:  ${cC}`);
  console.log('========================================');
}

seedFull().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
