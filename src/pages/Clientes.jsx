import { useState } from 'react';
import { Plus, Trash2, Edit3, User, Mail, Phone, Search, Loader2 } from 'lucide-react';
import { useClients, createClient, updateClient, deleteClient } from '../hooks/useData';

export default function ClientesPage() {
  const { clients, loading, refetch } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Iniciando salvamento de cliente...', formData);
      let result;
      if (editingId) {
        result = await updateClient(editingId, formData);
      } else {
        result = await createClient(formData);
      }
      
      if (result && result.error) {
         console.error('Erro retornado pelo Supabase:', result.error);
         throw result.error;
      }

      console.log('Salvo com sucesso!');
      setFormData({ name: '', document: '', phone: '', email: '', address: '' });
      setShowForm(false);
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Falha crítica ao salvar:', err);
      alert("Erro ao salvar: " + (err.message || "Verifique sua conexão com o banco de dados."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      document: client.document || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || ''
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este cliente permanentemente?")) return;
    await deleteClient(id);
    refetch();
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document && c.document.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastro de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de proprietários e investidores</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', document: '', phone: '', email: '', address: '' }); }}
          className="btn-primary-gradient flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 animate-in fade-in zoom-in duration-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            {editingId ? 'Editar Cliente' : 'Dados do Novo Cliente'}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Nome / Proprietário</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">CPF / CNPJ</label>
              <input
                type="text"
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                className="form-input"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="form-input"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="form-input"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-medium text-slate-500">Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="form-input"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-gradient flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase py-4 px-6">Cliente</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase py-4 px-6">Contato</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase py-4 px-6">Documento</th>
                  <th className="text-right text-[11px] font-semibold text-slate-500 uppercase py-4 px-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{client.address || 'Sem endereço'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" /> {client.phone || '—'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" /> {client.email || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {client.document || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 italic">Nenhum cliente cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
