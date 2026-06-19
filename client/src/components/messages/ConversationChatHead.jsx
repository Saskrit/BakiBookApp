import { Link } from 'react-router-dom';
import { formatMessageTime } from '../../utils/messageFormat';

export default function ConversationChatHead({
  customerId,
  customerName,
  messagingBlocked,
  lastMessageAt,
  subtitle,
  accountLink,
  accountLinkLabel = 'View account',
}) {
  const resolvedSubtitle =
    subtitle ?? (messagingBlocked ? 'Blocked from messaging' : 'Linked customer');
  const resolvedAccountLink = accountLink ?? `/shop/customers/${customerId}/account`;

  return (
    <div className="messages-layout__chat-head app-card">
      <div className="messages-layout__chat-head-info">
        <strong>{customerName}</strong>
        <p>{resolvedSubtitle}</p>
      </div>

      {lastMessageAt && (
        <time className="messages-chat-head__time" dateTime={lastMessageAt}>
          {formatMessageTime(lastMessageAt)}
        </time>
      )}

      <Link
        to={resolvedAccountLink}
        className="app-btn app-btn--outline app-btn--sm"
      >
        {accountLinkLabel}
      </Link>
    </div>
  );
}
