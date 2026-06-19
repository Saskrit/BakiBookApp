import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eraser, Trash2, Ban, Unlock } from 'lucide-react';
import {
  clearChat,
  deleteChat,
  blockCustomerMessaging,
  unblockCustomerMessaging,
} from '../../services/messages';
import { useAppDialog } from '../../contexts/AppDialogContext';

export default function ConversationActionsMenu({
  customerId,
  customerName,
  messagingBlocked,
  onActionComplete,
  variant = 'shopkeeper',
}) {
  const { alert, confirm } = useAppDialog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const wrapRef = useRef(null);
  const isShopkeeper = variant === 'shopkeeper';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runAction = async (action) => {
    if (acting) return;
    setActing(true);
    try {
      await action();
      setMenuOpen(false);
    } catch (err) {
      await alert({ title: 'Action failed', message: err.message, variant: 'error' });
    } finally {
      setActing(false);
    }
  };

  const handleClear = () =>
    runAction(async () => {
      const approved = await confirm({
        title: 'Clear chat',
        message: 'Clear all messages in this chat?',
        confirmLabel: 'Clear chat',
        variant: 'danger',
      });
      if (!approved) return;
      await clearChat(customerId);
      onActionComplete?.(false);
    });

  const handleDelete = () =>
    runAction(async () => {
      const approved = await confirm({
        title: 'Delete chat',
        message: 'Delete this chat from your inbox?',
        confirmLabel: 'Delete chat',
        variant: 'danger',
      });
      if (!approved) return;
      await deleteChat(customerId);
      onActionComplete?.(true);
    });

  const handleBlock = () =>
    runAction(async () => {
      if (messagingBlocked) {
        const approved = await confirm({
          title: 'Unblock customer',
          message: 'Unblock this customer from messaging?',
          confirmLabel: 'Unblock',
        });
        if (!approved) return;
        await unblockCustomerMessaging(customerId);
      } else {
        const approved = await confirm({
          title: 'Block customer',
          message: 'Block this customer from messaging you?',
          confirmLabel: 'Block',
          variant: 'danger',
        });
        if (!approved) return;
        await blockCustomerMessaging(customerId);
      }
      onActionComplete?.(false);
    });

  return (
    <div
      ref={wrapRef}
      className={`messages-convo-menu ${menuOpen ? 'messages-convo-menu--open' : ''}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="messages-convo-menu__trigger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <strong>{customerName}</strong>
        <ChevronDown size={14} className="messages-convo-menu__chevron" aria-hidden="true" />
      </button>

      {menuOpen && (
        <div className="messages-convo-menu__dropdown" role="menu">
          <button type="button" role="menuitem" disabled={acting} onClick={handleClear}>
            <Eraser size={15} />
            Clear chat
          </button>
          <button type="button" role="menuitem" disabled={acting} onClick={handleDelete}>
            <Trash2 size={15} />
            Delete chat
          </button>
          {isShopkeeper && (
            <button
              type="button"
              role="menuitem"
              disabled={acting}
              className={messagingBlocked ? '' : 'messages-convo-menu__danger'}
              onClick={handleBlock}
            >
              {messagingBlocked ? <Unlock size={15} /> : <Ban size={15} />}
              {messagingBlocked ? 'Unblock' : 'Block'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
