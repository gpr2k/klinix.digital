import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ClientForm } from '@/components/ClientForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { useClients } from '@/hooks/useClients';
import { formatBirthDate } from '@/lib/format';
import { digitsOnly, formatWhatsapp } from '@/lib/whatsapp';
import type { Client, ClientInput } from '@/lib/types';

function matchesQuery(client: Client, query: string): boolean {
  if (query === '') return true;
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return true;
  if (client.full_name.toLowerCase().includes(normalized)) return true;
  const queryDigits = digitsOnly(query);
  if (
    queryDigits.length > 0 &&
    client.whatsapp &&
    digitsOnly(client.whatsapp).includes(queryDigits)
  ) {
    return true;
  }
  return false;
}

export function Clientes() {
  const clients = useClients();
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredClients = useMemo(
    () => clients.clients.filter((client) => matchesQuery(client, search)),
    [clients.clients, search],
  );

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (input: ClientInput) => {
    if (editing) {
      await clients.update(editing.id, input);
    } else {
      await clients.create(input);
    }
    closeForm();
  };

  const requestDelete = (client: Client) => {
    setPendingDelete(client);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await clients.remove(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Falha ao excluir o cliente.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestão de pacientes/clientes da clínica."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus size={16} />
            Novo cliente
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou WhatsApp"
            aria-label="Buscar clientes"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        {!clients.isLoading && !clients.error ? (
          <span className="text-xs text-slate-500">
            {filteredClients.length} de {clients.clients.length}
          </span>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {clients.error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-rose-700">
              Erro ao carregar clientes
            </p>
            <p className="mt-1 text-xs text-slate-500">{clients.error}</p>
            <button
              type="button"
              onClick={() => clients.reload()}
              className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Tentar novamente
            </button>
          </div>
        ) : clients.isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando clientes…
          </div>
        ) : clients.clients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhum cliente cadastrado ainda.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clique em "Novo cliente" para adicionar o primeiro.
            </p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhum cliente encontrado
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ajuste a busca ou limpe o campo para ver todos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3">
                    Nome
                  </th>
                  <th scope="col" className="px-4 py-3">
                    WhatsApp
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Nascimento
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Canal
                  </th>
                  <th scope="col" className="w-1 px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/clientes/${client.id}`}
                        className="font-medium text-slate-900 hover:text-brand-700 hover:underline"
                      >
                        {client.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {client.whatsapp ? formatWhatsapp(client.whatsapp) : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {formatBirthDate(client.birth_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {client.acquisition_channel ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(client)}
                          aria-label={`Editar ${client.full_name}`}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(client)}
                          aria-label={`Excluir ${client.full_name}`}
                          className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        description={
          editing
            ? 'Atualize os dados deste cliente.'
            : 'Cadastre um novo cliente na base.'
        }
      >
        <ClientForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Excluir cliente"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.full_name}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={isDeleting}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
