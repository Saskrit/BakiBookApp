import { useState } from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import {
  archivePaidEntry,
  unarchivePaidEntry,
  hidePaidEntry,
  restorePaidEntry,
} from '../../services/paidEntries';
import { useAppDialog } from '../../contexts/AppDialogContext';
import './LedgerEntryActions.css';

export default function LedgerEntryActions({ entry, viewerRole, filter, onUpdated }) {
  const { confirm } = useAppDialog();
  const [acting, setActing] = useState(false);

  if (entry.kind !== 'paid' || !entry.paymentId) return null;

  const handleAction = async (action) => {
    setActing(true);
    try {
      await action();
      onUpdated?.();
    } catch (err) {
      window.alert(err.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  if (viewerRole === 'customer') {
    if (filter === 'archived') {
      return (
        <button
          type="button"
          className="ledger-entry-action"
          disabled={acting}
          onClick={() =>
            handleAction(() => unarchivePaidEntry(entry.paymentId))
          }
        >
          <ArchiveRestore size={14} /> Restore
        </button>
      );
    }

    return (
      <button
        type="button"
        className="ledger-entry-action"
        disabled={acting}
        onClick={() =>
          handleAction(async () => {
            const ok = await confirm({
              title: 'Archive this paid entry?',
              message: 'This hides it from your ledger only. Your shopkeeper will still see it.',
              confirmLabel: 'Archive',
            });
            if (ok) await archivePaidEntry(entry.paymentId);
          })
        }
      >
        <Archive size={14} /> Archive
      </button>
    );
  }

  return (
    <button
      type="button"
      className="ledger-entry-action ledger-entry-action--danger"
      disabled={acting}
      onClick={() =>
        handleAction(async () => {
          const ok = await confirm({
            title: 'Remove from your ledger?',
            message: 'This hides the entry on your side only. The customer account and their view are not affected.',
            confirmLabel: 'Remove',
            variant: 'danger',
          });
          if (ok) await hidePaidEntry(entry.paymentId);
        })
      }
    >
      <Trash2 size={14} /> Remove
    </button>
  );
}

export function LedgerFilterTabs({ filter, onChange, viewerRole }) {
  return (
    <div className="ledger-filter-tabs">
      <button
        type="button"
        className={filter === 'active' ? 'active' : ''}
        onClick={() => onChange('active')}
      >
        Active
      </button>
      {viewerRole === 'customer' && (
        <button
          type="button"
          className={filter === 'archived' ? 'active' : ''}
          onClick={() => onChange('archived')}
        >
          Archived
        </button>
      )}
    </div>
  );
}

export function LedgerTypeBadge({ entry }) {
  if (entry.kind === 'paid' || entry.type === 'Paid') {
    return <span className="app-type-pill app-type-pill--paid">Paid</span>;
  }
  if (entry.type === 'Credit') {
    return <span className="app-type-pill app-type-pill--credit">Credit</span>;
  }
  return <span className="app-type-pill app-type-pill--payment">Payment</span>;
}
