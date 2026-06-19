import ShopkeeperPage, { useShopkeeperUser, useShopkeeperShell } from '../../components/app/ShopkeeperPage';
import MessagesInbox from '../../components/messages/MessagesInbox';
import '../../components/app/AppPages.css';
import './MessagesPage.css';

function ShopMessagesInbox() {
  const { toggleMenu } = useShopkeeperShell();

  return (
    <MessagesInbox
      viewerRole="shopkeeper"
      messagesBasePath="/shop/messages"
      toggleMenu={toggleMenu}
      showActionsMenu
      actionsMenuVariant="shopkeeper"
      getDisplayName={(conv) => conv.customerName}
      getAvatarChar={(conv) => conv.customerName?.charAt(0) || '?'}
      getChatSubtitle={(conv) =>
        conv.messagingBlocked ? 'Blocked from messaging' : 'Linked customer'
      }
      getAccountLink={(conv) => `/shop/customers/${conv.customerId}/account`}
      emptyMessage="No linked customers to message yet."
      emptyLink="/shop/customers"
      emptyLinkLabel="View customers"
    />
  );
}

export function ShopMessagesPage() {
  const user = useShopkeeperUser();

  return (
    <ShopkeeperPage user={user} activeNav="messages" fullPage>
      <ShopMessagesInbox />
    </ShopkeeperPage>
  );
}
