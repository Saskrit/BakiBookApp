import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { MessageCircle, Menu } from 'lucide-react';
import ChatPanel from './ChatPanel';
import ConversationChatHead from './ConversationChatHead';
import ConversationActionsMenu from './ConversationActionsMenu';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { fetchConversations } from '../../services/messages';
import { useSocketEvent } from '../../contexts/SocketProvider';
import MessageStatusTicks from './MessageStatusTicks';
import { formatMessageTime } from '../../utils/messageFormat';
import '../../pages/shopkeeper/MessagesPage.css';

function formatPreview(body) {
  if (!body) return 'No messages yet';
  return body.length > 48 ? `${body.slice(0, 45)}...` : body;
}

export default function MessagesInbox({
  viewerRole,
  messagesBasePath,
  toggleMenu,
  showActionsMenu = false,
  actionsMenuVariant = 'shopkeeper',
  getDisplayName,
  getAvatarChar,
  getChatSubtitle,
  getAccountLink,
  getAccountLinkLabel = () => 'View account',
  emptyMessage,
  emptyLink,
  emptyLinkLabel,
}) {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [chatRefreshKey, setChatRefreshKey] = useState(0);
  const { data, loading, error, reload } = useApi(() => fetchConversations(), []);
  const conversations = data?.conversations || [];

  useSocketEvent('message:new', reload, []);
  useSocketEvent('message:status', reload, []);

  const activeConversation = customerId
    ? conversations.find((c) => c.customerId === customerId)
    : null;

  const handleChatAction = (deleted = false) => {
    reload();
    setChatRefreshKey((k) => k + 1);
    if (deleted) {
      navigate(messagesBasePath);
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-page">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-layout">
        <aside className="messages-layout__list app-card">
          <div className="messages-layout__list-head">
            <button
              type="button"
              className="messages-layout__menu-btn"
              onClick={toggleMenu}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <strong>Conversations</strong>
          </div>
          {conversations.length === 0 ? (
            <div className="messages-layout__empty">
              <MessageCircle size={28} />
              <p>{emptyMessage}</p>
              {emptyLink && (
                <Link to={emptyLink} className="app-link-btn">{emptyLinkLabel}</Link>
              )}
            </div>
          ) : (
            <ul className="messages-conversations">
              {conversations.map((conv) => {
                const isActive = conv.customerId === customerId;
                const displayName = getDisplayName(conv);
                return (
                  <li key={conv.customerId}>
                    <div
                      role="button"
                      tabIndex={0}
                      className={`messages-conversations__item ${isActive ? 'messages-conversations__item--active' : ''}`}
                      onClick={() => navigate(`${messagesBasePath}/${conv.customerId}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`${messagesBasePath}/${conv.customerId}`);
                        }
                      }}
                    >
                      <span className="messages-conversations__avatar">
                        {getAvatarChar(conv)}
                      </span>
                      <span className="messages-conversations__body">
                        <span className="messages-conversations__top">
                          {showActionsMenu ? (
                            <ConversationActionsMenu
                              customerId={conv.customerId}
                              customerName={displayName}
                              messagingBlocked={conv.messagingBlocked}
                              variant={actionsMenuVariant}
                              onActionComplete={(deleted) => handleChatAction(deleted)}
                            />
                          ) : (
                            <strong className="messages-conversations__name">{displayName}</strong>
                          )}
                          <span className="messages-conversations__meta">
                            {conv.lastMessage?.createdAt && (
                              <time className="messages-conversations__time">
                                {formatMessageTime(conv.lastMessage.createdAt)}
                              </time>
                            )}
                          </span>
                        </span>
                        <span className="messages-conversations__preview">
                          {conv.lastMessage?.senderRole === viewerRole && (
                            <MessageStatusTicks
                              message={conv.lastMessage}
                              viewerRole={viewerRole}
                              className="messages-conversations__ticks"
                            />
                          )}
                          <span className="messages-conversations__preview-text">
                            {formatPreview(conv.lastMessage?.body)}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="messages-conversations__unread">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </span>
                          )}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="messages-layout__chat">
          {activeConversation ? (
            <>
              <ConversationChatHead
                customerId={activeConversation.customerId}
                customerName={getDisplayName(activeConversation)}
                messagingBlocked={activeConversation.messagingBlocked}
                lastMessageAt={activeConversation.lastMessage?.createdAt}
                subtitle={getChatSubtitle(activeConversation)}
                accountLink={getAccountLink(activeConversation)}
                accountLinkLabel={getAccountLinkLabel(activeConversation)}
              />
              <ChatPanel
                key={`${activeConversation.customerId}-${chatRefreshKey}`}
                customerId={activeConversation.customerId}
                canSend={viewerRole === 'shopkeeper' || !activeConversation.messagingBlocked}
                viewerRole={viewerRole}
                compact
                hideHead
                blocked={viewerRole === 'customer' && activeConversation.messagingBlocked}
              />
            </>
          ) : (
            <ChatPanel customerId={null} canSend={false} viewerRole={viewerRole} compact hideHead />
          )}
        </div>
      </div>
    </div>
  );
}
