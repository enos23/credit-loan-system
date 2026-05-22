import { useEffect, useState } from 'react';
import { getAllClients, createClient, updateClient, deleteClient } from '../../api/clientsApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Pencil } from 'lucide-react';

const emptyForm = {
  cnp: '', firstName: '', lastName: '', email: '',
  phone: '', address: '', employmentStatus: '',
  monthlyIncome: '', monthlyExpenses: '', dateOfBirth: '',
};

const employmentLabel = {
  Employed: 'Angajat',
  Unemployed: 'Neangajat',
  SelfEmployed: 'PFA / Antreprenor',
  Retired: 'Pensionar',
};

const ClientForm = ({ form, setForm, onSubmit, onCancel, error, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>CNP</Label>
        <Input value={form.cnp} onChange={e => setForm({ ...form, cnp: e.target.value })} required maxLength={13} disabled={isEdit} />
      </div>
      <div className="space-y-2">
        <Label>Data nașterii</Label>
        <Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Prenume</Label>
        <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Nume</Label>
        <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Telefon</Label>
        <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Adresă</Label>
        <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Status angajare</Label>
        <Select value={form.employmentStatus} onValueChange={v => setForm({ ...form, employmentStatus: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selectează..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Employed">Angajat</SelectItem>
            <SelectItem value="Unemployed">Neangajat</SelectItem>
            <SelectItem value="SelfEmployed">PFA / Antreprenor</SelectItem>
            <SelectItem value="Retired">Pensionar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Venit lunar (RON)</Label>
        <Input type="number" value={form.monthlyIncome} onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Cheltuieli lunare (RON)</Label>
        <Input type="number" value={form.monthlyExpenses} onChange={e => setForm({ ...form, monthlyExpenses: e.target.value })} required />
      </div>
    </div>

    {error && <p className="text-red-500 text-sm">{error}</p>}

    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onCancel}>Anulează</Button>
      <Button type="submit">{isEdit ? 'Salvează modificările' : 'Salvează'}</Button>
    </div>
  </form>
);

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const [search, setSearch] = useState('');

  const fetchClients = async () => {
    try {
      const res = await getAllClients();
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createClient({
        ...form,
        monthlyIncome: parseFloat(form.monthlyIncome),
        monthlyExpenses: parseFloat(form.monthlyExpenses),
      });
      setAddOpen(false);
      setForm(emptyForm);
      fetchClients();
    } catch (err) {
      setError(err.response?.data || 'Eroare la crearea clientului.');
    }
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setEditForm({
      cnp: client.cnp,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      employmentStatus: client.employmentStatus,
      monthlyIncome: String(client.monthlyIncome),
      monthlyExpenses: String(client.monthlyExpenses),
      dateOfBirth: client.dateOfBirth
        ? new Date(client.dateOfBirth).toISOString().split('T')[0]
        : '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await updateClient(editingClient.id, {
        ...editForm,
        monthlyIncome: parseFloat(editForm.monthlyIncome),
        monthlyExpenses: parseFloat(editForm.monthlyExpenses),
      });
      setEditOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      setEditError(err.response?.data || 'Eroare la actualizarea clientului.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi acest client?')) return;
    try {
      await deleteClient(id);
      fetchClients();
    } catch {
      alert('Nu poți șterge un client care are cereri active.');
    }
  };

  const filtered = clients.filter(c =>
    `${c.firstName} ${c.lastName} ${c.cnp} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clienți</h1>
          <p className="text-slate-500">{clients.length} clienți înregistrați</p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>+ Client nou</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adaugă client nou</DialogTitle>
            </DialogHeader>
            <ClientForm
              form={form}
              setForm={setForm}
              onSubmit={handleAdd}
              onCancel={() => { setAddOpen(false); setError(''); }}
              error={error}
              isEdit={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editează client</DialogTitle>
          </DialogHeader>
          <ClientForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            onCancel={() => { setEditOpen(false); setEditError(''); }}
            error={editError}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      <div className="flex gap-4">
        <Input
          placeholder="Caută după nume, CNP sau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Se încarcă...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            {search ? 'Niciun client găsit.' : 'Nu există clienți înregistrați încă.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(client => (
            <Card key={client.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{client.firstName} {client.lastName}</p>
                      <p className="text-sm text-slate-500">{client.email} · CNP: {client.cnp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{employmentLabel[client.employmentStatus] || client.employmentStatus}</Badge>
                    <p className="text-sm text-slate-600">{client.monthlyIncome?.toLocaleString()} RON/lună</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(client)}
                      className="flex items-center gap-1.5"
                    >
                      <Pencil size={14} />
                      Editează
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      Șterge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
