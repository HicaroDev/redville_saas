/**
 * Hooks de dados — conectados ao Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ========== PROJETOS ==========
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('code');
    
    if (!error && data) {
      setProjects(data.map(p => ({
        ...p,
        project_code: p.code,
      })));
    } else {
      console.error('Erro ao buscar projetos:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
}

export async function deleteProject(id) {
  return await supabase.from('projects').delete().eq('id', id);
}

// ========== ETAPAS ==========
export function useStages(projectCode) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStages = useCallback(async () => {
    if (!projectCode) { setStages([]); setLoading(false); return; }
    
    setLoading(true);
    // Find project ID first
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .ilike('code', projectCode) // Caseless match
      .single();

    if (!project) { 
      console.warn('Projeto nao encontrado:', projectCode);
      setStages([]); 
      setLoading(false); 
      return; 
    }

    const { data, error } = await supabase
      .from('project_stages')
      .select('*')
      .eq('project_id', project.id)
      .order('sequence_id');
    
    if (!error && data) {
      setStages(data.map(s => ({ ...s, project_code: projectCode })));
    } else {
      setStages([]);
    }
    setLoading(false);
  }, [projectCode]);

  useEffect(() => { fetchStages(); }, [fetchStages]);

  return { stages, loading, refetch: fetchStages };
}

// ========== ALL STAGES (for dashboard) ==========
export function useAllStages() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('project_stages')
        .select('*, projects(code)')
        .order('sequence_id');
      
      if (!error && data) {
        setStages(data.map(s => ({
          ...s,
          project_code: s.projects?.code || '',
        })));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { stages, loading };
}

// ========== ITENS DE ORÇAMENTO (COMPRAS) ==========
export function useBudgetItems(projectCode) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    
    let query = supabase.from('budget_items').select('*');

    if (projectCode && projectCode !== 'all') {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .ilike('code', projectCode)
        .single();
      if (project) {
        query = query.eq('project_id', project.id);
      } else {
        setItems([]);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await query.order('stage_name');
    
    if (!error && data) {
      setItems(data.map(i => ({
        ...i,
        stage: i.stage_name,
        sub_stage: i.sub_stage,
        type: i.resource_type,
        qty: Number(i.quantity),
        unit_cost: Number(i.unit_cost),
        subtotal: Number(i.subtotal),
        actual: i.actual_cost != null ? Number(i.actual_cost) : null,
        sequence_id: i.sequence_id
      })));
    }
    setLoading(false);
  }, [projectCode]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return { items, loading, refetch: fetchItems };
}

// ========== LIVRO CAIXA ==========
export function useCashbook(projectCode) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    
    let query = supabase.from('cashbook_entries').select('*, wallets(name), projects(code)');

    if (projectCode && projectCode !== 'all') {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .ilike('code', projectCode)
        .single();
      if (project) {
        query = query.eq('project_id', project.id);
      } else {
        setEntries([]);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await query.order('entry_date');
    
    if (!error && data) {
      setEntries(data.map(e => ({
        ...e,
        date: e.entry_date,
        origin: e.expense_source || e.income_source || '',
        qty: Number(e.unit_qty),
        unit_value: Number(e.unit_value),
        total_out: Number(e.expense_amount),
        total_in: Number(e.income_amount),
      })));
    }
    setLoading(false);
  }, [projectCode]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  return { entries, loading, refetch: fetchEntries };
}

// ========== CRUD ==========
export async function createProject(projectData) {
  const { data, error } = await supabase.from('projects').insert(projectData).select().single();
  return { data, error };
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  return { data, error };
}

export async function createBudgetItem(itemData) {
  const { data, error } = await supabase.from('budget_items').insert(itemData).select().single();
  return { data, error };
}

export async function createCashbookEntry(entryData) {
  const { data, error } = await supabase.from('cashbook_entries').insert(entryData).select().single();
  return { data, error };
}

export async function updateCashbookEntry(id, updates) {
  const { data, error } = await supabase.from('cashbook_entries').update(updates).eq('id', id).select().single();
  return { data, error };
}

export async function deleteCashbookEntry(id) {
  return await supabase.from('cashbook_entries').delete().eq('id', id);
}

// ========== PROJECT STAGES CRUD ==========
export async function createProjectStage(stageData) {
  return await supabase.from('project_stages').insert(stageData).select().single();
}

export async function updateProjectStage(id, updates) {
  return await supabase.from('project_stages').update(updates).eq('id', id).select().single();
}

export async function deleteProjectStage(id) {
  return await supabase.from('project_stages').delete().eq('id', id);
}

// ========== BUDGET ITEMS CRUD ==========
export async function updateBudgetItem(id, updates) {
  return await supabase.from('budget_items').update(updates).eq('id', id).select().single();
}

export async function deleteBudgetItem(id) {
  return await supabase.from('budget_items').delete().eq('id', id);
}

export async function updateStageProgress(stageId, progressPct, status) {
  const { data, error } = await supabase
    .from('project_stages')
    .update({ progress_pct: progressPct, status })
    .eq('id', stageId)
    .select()
    .single();
  return { data, error };
}

// ========== RESOURCE TYPES (CATEGORIAS) ==========
export function useResourceTypes() {
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResourceTypes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resource_types')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setResourceTypes(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchResourceTypes(); }, [fetchResourceTypes]);

  return { resourceTypes, loading, refetch: fetchResourceTypes };
}

export async function createResourceType(typeData) {
  return await supabase.from('resource_types').insert(typeData).select().single();
}

export async function updateResourceType(id, updates) {
  return await supabase.from('resource_types').update(updates).eq('id', id).select().single();
}

export async function deleteResourceType(id) {
  return await supabase.from('resource_types').delete().eq('id', id);
}

// ========== CLIENTES ==========
export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return { clients, loading, refetch: fetchClients };
}

export async function createClient(clientData) {
  return await supabase.from('clients').insert(clientData).select().single();
}

export async function updateClient(id, updates) {
  return await supabase.from('clients').update(updates).eq('id', id).select().single();
}

export async function deleteClient(id) {
  return await supabase.from('clients').delete().eq('id', id);
}

// ========== CARTEIRAS (WALLETS) ==========
export function useWallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('wallets').select('*').order('name');
    if (!error && data) setWallets(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);
  return { wallets, loading, refetch: fetchWallets };
}

export async function createWallet(walletData) {
  return await supabase.from('wallets').insert(walletData).select().single();
}

export async function updateWallet(id, updates) {
  return await supabase.from('wallets').update(updates).eq('id', id).select().single();
}

// ========== DIRETÓRIO (CADASTRO GERAL) ==========
export function useDirectory(category) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('directory').select('*').order('name');
    if (category) query = query.eq('category', category);
    
    const { data, error } = await query;
    if (!error && data) setItems(data);
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  return { items, loading, refetch: fetchItems };
}

export async function createDirectoryItem(itemData) {
  return await supabase.from('directory').insert(itemData).select().single();
}

export async function updateDirectoryItem(id, updates) {
  return await supabase.from('directory').update(updates).eq('id', id).select().single();
}

export async function deleteDirectoryItem(id) {
  return await supabase.from('directory').delete().eq('id', id);
}

// ========== PRESTADORES DE SERVIÇO ==========
export function useServiceProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_providers')
      .select('*, service_contracts(*, projects(name, code))')
      .order('name');
    
    if (!error && data) {
      setProviders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  return { providers, loading, refetch: fetchProviders };
}

export async function updateServiceContract(id, updates) {
  return await supabase.from('service_contracts').update(updates).eq('id', id).select().single();
}
