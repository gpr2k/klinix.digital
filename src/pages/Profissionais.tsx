import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { ProfessionalForm } from '@/components/ProfessionalForm';
import { useProfessionals } from '@/hooks/useProfessionals';
import { timeToMinutes } from '@/lib/format';
import { WEEKDAYS } from '@/lib/schedule';
import type {
  ProfessionalInput,
  ProfessionalSchedule,
  ProfessionalWithSchedules,
} from '@/lib/types';

function workingDaysSummary(schedules: ProfessionalSchedule[]): string {
  const working = schedules
    .filter((schedule) => schedule.is_working)
    .sort((a, b) => a.day_of_week - b.day_of_week);
  if (working.length === 0) return 'Sem expediente';
  return working
    .map((schedule) => {
      const meta = WEEKDAYS.find(
        (entry) => entry.day === schedule.day_of_week,
      );
      return meta?.short ?? '?';
    })
    .join(', ');
}

function weeklyHours(schedules: ProfessionalSchedule[]): string {
  const totalMinutes = schedules.reduce((sum, schedule) => {
    if (!schedule.is_working) return sum;
    const start = timeToMinutes(schedule.start_time);
    const end = timeToMinutes(schedule.end_time);
    return sum + Math.max(end - start, 0);
  }, 0);
  if (totalMinutes === 0) return '0h';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function Profissionais() {
  const professionals = useProfessionals();

  const [editing, setEditing] = useState<ProfessionalWithSchedules | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [pendingDelete, setPendingDelete] =
    useState<ProfessionalWithSchedules | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (professional: ProfessionalWithSchedules) => {
    setEditing(professional);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (input: ProfessionalInput) => {
    if (editing) {
      await professionals.update(editing.id, input);
    } else {
      await professionals.create(input);
    }
    closeForm();
  };

  const requestDelete = (professional: ProfessionalWithSchedules) => {
    setPendingDelete(professional);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await professionals.remove(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Falha ao excluir o profissional.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profissionais"
        description="Equipe e suas grades de horários."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus size={16} />
            Novo profissional
          </button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {professionals.error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-rose-700">
              Erro ao carregar profissionais
            </p>
            <p className="mt-1 text-xs text-slate-500">{professionals.error}</p>
            <button
              type="button"
              onClick={() => professionals.reload()}
              className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Tentar novamente
            </button>
          </div>
        ) : professionals.isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando profissionais…
          </div>
        ) : professionals.professionals.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhum profissional cadastrado ainda.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Clique em "Novo profissional" para adicionar o primeiro.
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
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Dias de expediente
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Horas/semana
                  </th>
                  <th scope="col" className="w-1 px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {professionals.professionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {professional.name}
                    </td>
                    <td className="px-4 py-3">
                      {professional.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {workingDaysSummary(professional.schedules)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {weeklyHours(professional.schedules)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(professional)}
                          aria-label={`Editar ${professional.name}`}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(professional)}
                          aria-label={`Excluir ${professional.name}`}
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
        title={editing ? 'Editar profissional' : 'Novo profissional'}
        description={
          editing
            ? 'Atualize os dados e a grade de horários.'
            : 'Cadastre um novo profissional e defina a grade semanal.'
        }
      >
        <ProfessionalForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Excluir profissional"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? A grade de horários será removida junto.`
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
