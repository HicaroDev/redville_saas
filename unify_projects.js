import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  dotenv.config();
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function unifyProjects() {
  console.log("Checking projects...");
  const { data: projects } = await supabase.from('projects').select('*');
  console.log("Current Projects:", projects.map(p => ({ id: p.id, code: p.code, name: p.name })));

  const glpProjects = projects.filter(p => ['GLP1', 'GLP2', 'GLP3'].includes(p.code));
  
  if (glpProjects.length > 0) {
    console.log("Unifying GLP1, GLP2, GLP3...");
    
    // Create new unified project
    const { data: unified, error } = await supabase
      .from('projects')
      .upsert({
        code: 'SUPER-PORTAL',
        name: 'GALPÃO SUPER PORTAL',
        status: 'em_andamento',
        area_m2: 2700, // Sum of 900*3?
      }, { onConflict: 'code' })
      .select()
      .single();

    if (error) {
      console.error("Error creating unified project:", error.message);
      return;
    }

    console.log("Unified Project Created:", unified.id);

    // Reassign data from GLP1, GLP2, GLP3 to SUPER-PORTAL
    for (const oldP of glpProjects) {
        console.log(`Reassigning data from ${oldP.code} to SUPER-PORTAL...`);
        
        await supabase.from('project_stages').update({ project_id: unified.id }).eq('project_id', oldP.id);
        await supabase.from('budget_items').update({ project_id: unified.id }).eq('project_id', oldP.id);
        await supabase.from('cashbook_entries').update({ project_id: unified.id }).eq('project_id', oldP.id);
        await supabase.from('purchase_items').update({ project_id: unified.id }).eq('project_id', oldP.id);
        
        // Delete old project
        await supabase.from('projects').delete().eq('id', oldP.id);
    }
    console.log("Unification complete.");
  } else {
    // Check if SUPER-PORTAL already exists
    const superPortal = projects.find(p => p.code === 'SUPER-PORTAL');
    if (!superPortal) {
        console.log("Creating SUPER-PORTAL project...");
        await supabase.from('projects').insert({
            code: 'SUPER-PORTAL',
            name: 'GALPÃO SUPER PORTAL',
            status: 'em_andamento'
        });
    }
  }
}

unifyProjects();
