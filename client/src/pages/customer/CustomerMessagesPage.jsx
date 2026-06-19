import CustomerPage, { useCustomerUser, useCustomerShell } from '../../components/app/CustomerPage';
import MessagesInbox from '../../components/messages/MessagesInbox';
import '../../components/app/AppPages.css';
import '../shopkeeper/MessagesPage.css';

function CustomerMessagesInbox() {
  const { toggleMenu } = useCustomerShell();

  return (
    <MessagesInbox
      viewerRole="customer"
      messagesBasePath="/portal/messages"
      toggleMenu={toggleMenu}
      showActionsMenu
      actionsMenuVariant="customer"
      getDisplayName={(conv) => conv.shopName || conv.customerName}
      getAvatarChar={(conv) => (conv.shopName || conv.customerName)?.charAt(0) || '?'}
      getChatSubtitle={() => 'Linked shop'}
      getAccountLink={(conv) => `/portal/shops/${conv.customerId}`}
      getAccountLinkLabel={() => 'View shop account'}
      emptyMessage="No linked shops to message yet."
      emptyLink="/portal/shops"
      emptyLinkLabel="View my shops"
    />
  );
}

export function CustomerMessagesPage() {
  const user = useCustomerUser();

  return (
    <CustomerPage user={user} activeNav="messages" fullPage>
      <CustomerMessagesInbox />
    </CustomerPage>
  );
}
