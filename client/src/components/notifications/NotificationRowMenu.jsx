import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Check, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import {
  markNotificationRead,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
} from '../../services/ledger';
import { useAppDialog } from '../../contexts/AppDialogContext';
import './NotificationRowMenu.css';

export default function NotificationRowMenu({ notification, onUpdated }) {
  const { confirm } = useAppDialog();
  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const run = async (action) => {
    if (acting) return;
    setActing(true);
    try {
      await action();
      setOpen(false);
      onUpdated?.();
    } finally {
      setActing(false);
    }
  };

  const handleMarkRead = () =>
    run(async () => {
      if (!notification.read) {
        await markNotificationRead(notification.id);
      }
    });

  const handleArchive = () =>
    run(async () => {
      await archiveNotification(notification.id);
    });

  const handleUnarchive = () =>
    run(async () => {
      await unarchiveNotification(notification.id);
    });

  const handleDelete = () =>
    run(async () => {
      const approved = await confirm({
        title: 'Delete notification',
        message: 'Delete this notification permanently?',
        confirmLabel: 'Delete',
        variant: 'danger',
      });
      if (!approved) return;
      await deleteNotification(notification.id);
    });

  return (
    <div className="notif-row-menu" ref={wrapRef}>
      <button
        type="button"
        className="notif-row-menu__trigger"
        aria-label="Notification options"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="notif-row-menu__dropdown">
          {!notification.read && (
            <button type="button" onClick={handleMarkRead} disabled={acting}>
              <Check size={16} /> Mark as read
            </button>
          )}
          {notification.archived ? (
            <button type="button" onClick={handleUnarchive} disabled={acting}>
              <ArchiveRestore size={16} /> Unarchive
            </button>
          ) : (
            <button type="button" onClick={handleArchive} disabled={acting}>
              <Archive size={16} /> Archive
            </button>
          )}
          <button type="button" className="notif-row-menu__danger" onClick={handleDelete} disabled={acting}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
