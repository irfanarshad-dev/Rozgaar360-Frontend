'use client';

import DashboardLayout from '@/app/components/ui/DashboardLayout';
import ChatPage from '@/app/components/ChatPage';

export default function WorkerChatPage() {
  return (
    <DashboardLayout role="worker" contentClassName="p-0" showFooter={false} isFixedHeight={true}>
      <ChatPage embedded />
    </DashboardLayout>
  );
}
