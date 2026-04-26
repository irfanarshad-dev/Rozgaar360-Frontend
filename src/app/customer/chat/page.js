'use client';

import DashboardLayout from '@/app/components/ui/DashboardLayout';
import ChatPage from '../../chat/page';

export default function CustomerChatPage() {
  return (
    <DashboardLayout role="customer" contentClassName="p-0" showFooter={false} isFixedHeight={true}>
      <ChatPage embedded />
    </DashboardLayout>
  );
}
