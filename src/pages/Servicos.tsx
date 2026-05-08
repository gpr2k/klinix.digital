import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { useRole } from '@/components/RoleGate';
import { ServiceForm } from '@/components/ServiceForm';
import { useCategories } from '@/hooks/useCategories';
import { useServices } from '@/hooks/useServices';
import { formatBRL, formatDuration } from '@/lib/format';
import type { ServiceInput, ServiceWithCategory } from '@/lib/types';

export function Servicos() {
  const services = useServices();
  const categories = useCategories();
  const role = useRole();
  const isAdmin = role === 'ADMIN';

  const [editing, setEditing] = useState<ServiceWithCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<ServiceWithCategory | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (service: ServiceWithCategory) => {
    setEditing(service);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (input: ServiceInput) => {
    if (editing) {
      await services.update(editing.id, input);
    } else {
      await services.create(input);
    }
    closeForm();
  };

  const requestDelete = (service: ServiceWithCategory) => {
    setPendingDelete(service);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await services.remove(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Falha ao excluir o serviço.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços por categoria, com duração e preço."
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              <Plus size={16} />
              Novo serviço
            </button>
          ) : null
        }
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {services.error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-rose-700">
              Erro ao carregar serviços
            </p>
            <p className="mt-1 text-xs text-slate-500">{services.error}</p>
            <button
              type="button"
              onClick={() => services.reload()}
              className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Tentar novamente
            </button>
          </div>
        ) : services.isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando serviços…
          </div>
        ) : services.services.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhum serviço cadastrado ainda.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clique em "Novo serviço" para adicionar o primeiro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3">
                    Serviço
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Categoria
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Duração
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Valor base
                  </th>
                  <th scope="col" className="w-1 px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {service.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {service.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {formatDuration(service.duration_minutes)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {formatBRL(service.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(service)}
                            aria-label={`Editar ${service.name}`}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(service)}
                            aria-label={`Excluir ${service.name}`}
                            className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
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
        title={editing ? 'Editar serviço' : 'Novo serviço'}
        description={
          editing
            ? 'Atualize as informações deste serviço.'
            : 'Cadastre um novo serviço no catálogo da clínica.'
        }
      >
        <ServiceForm
          initial={editing}
          categories={categories.categories}
          onCreateCategory={categories.create}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Excluir serviço"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Esta ação não pode ser desfeita.`
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
