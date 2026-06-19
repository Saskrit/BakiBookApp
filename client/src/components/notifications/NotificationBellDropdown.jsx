import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../../services/ledger';
import { useSocketEvent } from '../../contexts/SocketProvider';
import './NotificationBellDropdown.css';

const DEFAULT_LIMIT = 5;

export default function NotificationBellDropdown({
  unreadCount = 0,
  onCountChange,
  seeAllLink = '/shop/notifications',
  limit = DEFAULT_LIMIT,
  resolveLink,
  triggerClassName = 'sk-header__icon-btn notif-bell__trigger',
}) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecent = () => {
    setLoading(true);
    fetchNotifications({ limit, page: 1, filter: 'all' })
      .then((data) => setItems((data?.notifications || []).slice(0, limit)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) loadRecent();
  }, [open, limit]);

  useSocketEvent('notification:new', () => {
    if (open) loadRecent();
    onCountChange?.();
  }, [open, onCountChange, limit]);

  useSocketEvent('notification:count', (payload) => {
    if (typeof payload?.count === 'number') {
      onCountChange?.(payload.count);
    }
  }, [onCountChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async (notification) => {
    setOpen(false);
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        onCountChange?.();
      } catch {
        /* ignore */
      }
    }
    if (resolveLink) {
      navigate(resolveLink(notification));
    }
  };

  return (
    <div className="notif-bell" ref={wrapRef}>
      <button
        type="button"
        className={triggerClassName}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-bell__dot">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-bell__dropdown">
          <div className="notif-bell__head">
            <strong>Notifications</strong>
            {unreadCount > 0 && <span className="notif-bell__pill">{unreadCount} new</span>}
          </div>

          <div className="notif-bell__list">
            {loading ? (
              <p className="notif-bell__empty">Loading...</p>
            ) : !items.length ? (
              <p className="notif-bell__empty">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-bell__item ${!n.read ? 'notif-bell__item--unread' : ''}`}
                  onClick={() => handleOpen(n)}
                >
                  <div className="notif-bell__item-body">
                    <strong>{n.title}</strong>
                    <p>{n.body}</p>
                  </div>
                  <time dateTime={n.time}>{n.date}</time>
                </button>
              ))
            )}
          </div>

          <Link to={seeAllLink} className="notif-bell__foot" onClick={() => setOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
