import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FILE_PATH = './Galpão_Supermecado Portal 1.xlsx';

async function run() {
  console.log("🚀 Iniciando importação...");
  
  const workbook = XLSX.readFile(FILE_PATH);
  
  // 1. GARANTIR PROJETOS (GLP1, GLP2, GLP3)
  const projectsMap = {};
  const projectCodes = ['GLP1', 'GLP2', 'GLP3'];
  
  for (const code of projectCodes) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, code')
      .eq('code', code)
      .single();
    
    if (data) {
      projectsMap[code] = data.id;
    } else {
      console.log(`➕ Criando projeto ${code}...`);
      const { data: newP, error: errP } = await supabase
        .from('projects')
        .insert({ 
          code, 
          name: `Galpão Supermercado ${code}`, 
          area_m2: 300,
          status: 'em_andamento'
        })
        .select()
        .single();
      if (newP) projectsMap[code] = newP.id;
    }
  }

  // 2. IMPORTAR ETAPAS (Aba: CRONOGRAMA )
  console.log("📝 Importando Etapas (Cronograma)...");
  const cronoSheet = workbook.Sheets["CRONOGRAMA "];
  const cronoData = XLSX.utils.sheet_to_json(cronoSheet);
  
  for (const row of cronoData) {
    const projectCode = row['Galpão'];
    const projectId = projectsMap[projectCode];
    
    if (projectId) {
      // Convert Excel dates
      const startDate = row['Data Início Planejada'] ? new Date((row['Data Início Planejada'] - 25569) * 86400 * 1000).toISOString() : null;
      const endDate = row['Data Fim Planejada'] ? new Date((row['Data Fim Planejada'] - 25569) * 86400 * 1000).toISOString() : null;

      await supabase.from('project_stages').insert({
        project_id: projectId,
        sequence_id: row['ID'],
        wbs: String(row['WBS']),
        level: row['Nível'],
        name: row['Etapa'],
        duration_days: row['Duração (dias)'],
        planned_start: startDate,
        planned_end: endDate,
        progress_pct: (row['% Concluído'] || 0) * 100,
        status: row['Status'] === 'Concluída' ? 'concluida' : 
                row['Status'] === 'Em andamento' ? 'em_andamento' : 
                row['Status'] === 'Atrasada' ? 'atrasada' : 'nao_iniciada',
        responsible: row['Responsável']
      });
    }
  }

  // 3. IMPORTAR ITENS DE ORÇAMENTO (Aba: Etapas de obras)
  console.log("💰 Importando Itens de Orçamento (Obras)...");
  const obrasSheet = workbook.Sheets["Etapas de obras"];
  const obrasData = XLSX.utils.sheet_to_json(obrasSheet, { range: 1 }); // Start at row 2 (L1)
  
  for (const row of obrasData) {
    const galpaoField = row['Galpão']; // e.g. "GLP1/2/3"
    if (!galpaoField) continue;

    const targetedCodes = galpaoField.includes('GLP1/2/3') ? ['GLP1', 'GLP2', 'GLP3'] : [galpaoField];

    for (const code of targetedCodes) {
      const projectId = projectsMap[code];
      if (projectId) {
        // Tentar encontrar a etapa correspondente para vincular o ID
        const { data: stage } = await supabase
          .from('project_stages')
          .select('id')
          .eq('project_id', projectId)
          .ilike('name', row['Etapa'])
          .maybeSingle();

        await supabase.from('budget_items').insert({
          project_id: projectId,
          stage_id: stage?.id || null, // Link real por ID
          stage_name: row['Etapa'],
          sub_stage: row['Subetapa'],
          description: row['Descrição'],
          resource_type: row['Tipo'] || 'MAT',
          unit: row['Unidade'],
          quantity: row['Quantidade'],
          unit_cost: row['Custo Unitário'],
          subtotal: row['Subtotal'],
          actual_cost: row['Realizado'],
          supplier: row['Fornecedor '],
          delivery_date: row['Data de entrega'] ? new Date((row['Data de entrega'] - 25569) * 86400 * 1000).toISOString() : null,
          observations: row['Observações']
        });
      }
    }
  }

  // 4. IMPORTAR LIVRO CAIXA
  console.log("📖 Importando Livro Caixa...");
  const caixaSheet = workbook.Sheets["LIVRO CAIXA"];
  const caixaData = XLSX.utils.sheet_to_json(caixaSheet, { range: 5 }); // Start at row 6 (L5)
  
  for (const row of caixaData) {
    if (!row['Data']) continue;
    
    // For now, assume all cashbook entries are general or linked to GLP1 if not specified
    // But usually Excel cashbooks in these templates are global.
    // I'll link to GLP1 as it's the primary project in the Excel.
    const projectId = projectsMap['GLP1'];

    await supabase.from('cashbook_entries').insert({
      project_id: projectId,
      sequence_id: row['ID'],
      entry_date: new Date((row['Data'] - 25569) * 86400 * 1000).toISOString(),
      description: row['Descrição'],
      income_amount: row['Entrada '] || 0,
      expense_source: row['Origem Saída'],
      unit_qty: row['UN'] || 1,
      unit_value: row['Valor UN'] || 0,
      expense_amount: row['Saida'] || 0,
      observations: row['Obs']
    });
  }

  console.log("✅ Importação concluída com sucesso!");
}

run().catch(err => console.error("❌ Erro fatal:", err));
