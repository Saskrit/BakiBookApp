import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { fetchMessages, sendMessage } from '../../services/messages';
import { useSocket, useSocketEvent } from '../../contexts/SocketProvider';
import { useAppDialog } from '../../contexts/AppDialogContext';
import MessageStatusTicks from './MessageStatusTicks';
import { formatMessageClockTime, formatChatDateSeparator, getDayKey } from '../../utils/messageFormat';
import '../../pages/shared/SharedAccountPage.css';
import './MessageStatusTicks.css';

function renderMessageItems(messages, viewerRole) {
  let lastDayKey = null;
  const items = [];

  messages.forEach((msg) => {
    const dayKey = getDayKey(msg.createdAt);
    if (dayKey && dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      items.push(
        <div key={`date-${dayKey}`} className="shared-chat__date-separator">
          <span>{formatChatDateSeparator(msg.createdAt)}</span>
        </div>
      );
    }

    const isMine = msg.senderRole === viewerRole;
    items.push(
      <div key={msg.id} className={`shared-chat__bubble ${isMine ? 'shared-chat__bubble--mine' : ''}`}>
        {!isMine && <span className="shared-chat__role">{msg.senderRole}</span>}
        <p>{msg.body}</p>
        <div className="shared-chat__bubble-footer">
          <time>{formatMessageClockTime(msg.createdAt)}</time>
          {isMine && <MessageStatusTicks message={msg} viewerRole={viewerRole} />}
        </div>
      </div>
    );
  });

  return items;
}

export default function ChatPanel({
  customerId,
  canSend,
  viewerRole,
  compact = false,
  hideHead = false,
  blocked = false,
}) {
  const socket = useSocket();
  const { alert } = useAppDialog();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    fetchMessages(customerId)
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    if (!socket || !customerId) return;
    socket.emit('join:customer', customerId);
    return () => socket.emit('leave:customer', customerId);
  }, [socket, customerId]);

  useSocketEvent('message:new', (msg) => {
    if (msg.customerId === customerId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) {
          return prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m));
        }
        return [...prev, msg];
      });
    }
  }, [customerId]);

  useSocketEvent('message:status', (msg) => {
    if (msg.customerId === customerId) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
    }
  }, [customerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !canSend) return;
    setSending(true);
    try {
      const data = await sendMessage(customerId, text.trim());
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      setText('');
    } catch (err) {
      await alert({ title: 'Message failed', message: err.message, variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  if (!customerId) {
    return (
      <div className={`shared-chat app-card ${compact ? 'shared-chat--compact' : ''}`}>
        <div className="shared-chat__body shared-chat__body--empty">
          <MessageCircle size={32} />
          <p>Select a conversation to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`shared-chat app-card ${compact ? 'shared-chat--compact' : ''}`}>
      {!hideHead && (
        <div className="shared-chat__head">
          <MessageCircle size={18} />
          <strong>Messages</strong>
          {!canSend && viewerRole === 'customer' && (
            <span className="app-badge app-badge--warn">Link account to reply</span>
          )}
        </div>
      )}
      {!canSend && viewerRole === 'customer' && (
        <p className="shared-chat__notice">
          Accept the shop link invitation to view and reply to messages.
        </p>
      )}
      <div className="shared-chat__body">
        {loading ? <p className="app-empty">Loading messages...</p> : messages.length === 0 ? (
          <p className="app-empty">No messages yet. Start the conversation.</p>
        ) : (
          renderMessageItems(messages, viewerRole)
        )}
        <div ref={bottomRef} />
      </div>
      <form className="shared-chat__form" onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            blocked
              ? 'Customer is blocked'
              : canSend
                ? 'Type a message...'
                : 'Link account to message'
          }
          disabled={!canSend || sending || blocked}
        />
        <button
          type="submit"
          className="app-btn app-btn--primary"
          disabled={!canSend || sending || !text.trim() || blocked}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
