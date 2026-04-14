import { useEffect, useState } from 'react';
import ComponentCard from '../../../components/common/ComponentCard';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import type { Column } from '../../../components/tables/DataTables/DataTable';
import DataTableOnline from '../../../components/tables/DataTables/DataTableOnline';
import { Modal } from '../../../components/ui/modal';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import type { AuditLog, AuditLogChanges } from '../../../types/auditLogs.types';

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const ACTION_CONFIG: Record<string, { label: string; cls: string }> = {
  CREATE_ATTENDANCE_MANUAL: { label: 'Buat Manual', cls: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  UPDATE_ATTENDANCE_MANUAL: { label: 'Koreksi', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  DELETE: { label: 'Hapus', cls: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
  CREATE: { label: 'Buat', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  UPDATE: { label: 'Ubah', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
};

function getActionConfig(action: string) {
  if (ACTION_CONFIG[action]) return ACTION_CONFIG[action];
  const prefix = Object.keys(ACTION_CONFIG).find((k) => action.startsWith(k));
  if (prefix) return ACTION_CONFIG[prefix];
  return { label: action, cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
}

function ActionBadge({ action }: { action: string }) {
  const cfg = getActionConfig(action);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}
      title={action}
    >
      {cfg.label}
    </span>
  );
}

function ChangesSection({ label, data }: { label: string; data?: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div>
      <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400'>{label}</p>
      <div className='rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]'>
        <table className='w-full text-xs'>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className='border-b border-gray-100 last:border-0 dark:border-white/[0.04]'>
                <td className='py-1.5 pr-4 font-mono text-gray-400 align-top whitespace-nowrap'>{key}</td>
                <td className='py-1.5 font-medium text-gray-700 dark:text-gray-200 break-all'>
                  {value === null || value === undefined ? (
                    <span className='italic text-gray-300'>null</span>
                  ) : typeof value === 'object' ? (
                    <span className='font-mono'>{JSON.stringify(value)}</span>
                  ) : (
                    String(value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className='rounded-xl border border-gray-100 px-4 py-3 dark:border-white/[0.06]'>
      <p className='mb-0.5 text-xs text-gray-400'>{label}</p>
      <p className={`text-sm font-medium text-gray-700 dark:text-gray-200 break-all ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </p>
    </div>
  );
}

function DetailModal({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  if (!log) return null;
  const changes = log.changes as AuditLogChanges;
  return (
    <Modal isOpen={!!log} onClose={onClose} className='max-w-2xl p-6 sm:p-8'>
      <div className='mb-6 flex items-start gap-4'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10'>
          <svg className='h-6 w-6 text-brand-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
          </svg>
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Detail Audit Log</h3>
          <p className='mt-0.5 truncate text-sm text-gray-400'>ID: {log.id}</p>
        </div>
        <ActionBadge action={log.action} />
      </div>
      <div className='mb-5 grid gap-3 sm:grid-cols-2'>
        <InfoCard label='Action' value={log.action} mono />
        <InfoCard label='Entity' value={log.entity} mono />
        <InfoCard label='Entity ID' value={log.entityId} mono />
        <InfoCard label='User ID' value={log.userId} mono />
        <InfoCard label='User Role' value={log.userRole} />
        <InfoCard label='Waktu' value={formatDateTime(log.createdAt)} />
        {log.reason && (
          <div className='sm:col-span-2'>
            <InfoCard label='Alasan' value={log.reason} />
          </div>
        )}
      </div>
      <div className='space-y-4'>
        <ChangesSection label='Sebelum (Before)' data={changes?.before} />
        <ChangesSection label='Sesudah (After)' data={changes?.after} />
        {!changes?.before && !changes?.after && (
          <p className='text-xs italic text-gray-400'>Tidak ada data perubahan tercatat.</p>
        )}
      </div>
      <div className='mt-6 flex justify-end'>
        <button
          onClick={onClose}
          className='rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}

export default function AuditLogs() {
  const { auditLogs, meta, loading, error, fetchAll, handleQueryChange } = useAuditLogs();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAll({ page: 1, limit: 10, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Waktu',
      render: (row) => (
        <span className='whitespace-nowrap text-sm text-gray-600 dark:text-gray-300'>
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Action',
      width: 'w-36',
      render: (row) => <ActionBadge action={row.action} />,
    },
    {
      header: 'Entity',
      width: 'w-32',
      render: (row) => (
        <span className='font-mono text-xs text-gray-600 dark:text-gray-400'>{row.entity}</span>
      ),
    },
    {
      header: 'Entity ID',
      render: (row) => (
        <span
          className='block max-w-[160px] truncate font-mono text-xs text-gray-500 dark:text-gray-400'
          title={row.entityId}
        >
          {row.entityId}
        </span>
      ),
    },
    {
      header: 'Oleh (User ID)',
      render: (row) => (
        <div>
          <p
            className='max-w-[160px] truncate font-mono text-xs text-gray-600 dark:text-gray-300'
            title={row.userId}
          >
            {row.userId}
          </p>
          <p className='text-xs text-gray-400'>{row.userRole}</p>
        </div>
      ),
    },
    {
      header: 'Alasan',
      render: (row) =>
        row.reason ? (
          <span className='line-clamp-2 max-w-[200px] text-xs text-gray-500 dark:text-gray-400'>
            {row.reason}
          </span>
        ) : (
          <span className='text-xs italic text-gray-300'>—</span>
        ),
    },
    {
      header: 'Aksi',
      width: 'w-20',
      render: (row) => (
        <button
          onClick={() => setSelectedLog(row)}
          className='rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
        >
          Detail
        </button>
      ),
    },
  ];

  return (
    <>
      <PageMeta title='Audit Logs' description='Riwayat semua aktivitas perubahan data oleh admin' />
      <PageBreadcrumb pageTitle='Audit Logs' />
      <div className='space-y-6'>
        <ComponentCard
          title='Riwayat Audit'
          desc={`${meta?.total?.toLocaleString('id-ID') || '0'} aktivitas tercatat`}
        >
          {error && (
            <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'>
              {error}
            </div>
          )}
          <DataTableOnline
            columns={columns}
            data={auditLogs}
            meta={meta || { page: 1, limit: 10, total: 0, totalPages: 0 }}
            loading={loading}
            onQueryChange={handleQueryChange}
            searchPlaceholder='Cari action, entity, user ID...'
          />
        </ComponentCard>
      </div>
      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
