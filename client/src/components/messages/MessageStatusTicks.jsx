import { Check, CheckCheck } from 'lucide-react';
import { getMessageStatus } from '../../utils/messageFormat';
import './MessageStatusTicks.css';

export default function MessageStatusTicks({ message, viewerRole, className = '' }) {
  const status = getMessageStatus(message, viewerRole);
  if (!status) return null;

  return (
    <span
      className={`msg-status-ticks msg-status-ticks--${status} ${className}`.trim()}
      aria-label={status === 'read' ? 'Read' : status === 'delivered' ? 'Delivered' : 'Sent'}
      title={status === 'read' ? 'Read' : status === 'delivered' ? 'Delivered' : 'Sent'}
    >
      {status === 'sent' ? <Check size={14} /> : <CheckCheck size={14} />}
    </span>
  );
}
