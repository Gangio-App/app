import { Suspense } from 'react';
import Loading from '@/components/Loading';
import ServerSettingsClient from './ServerSettingsClient';
import { use } from 'react';

// This is a server component that handles data fetching
export default function ServerSettingsPage({ params }: { params: { serverId: string } }) {
  const serverId = params.serverId;

  console.log(`[ServerSettingsPage] Received serverId param: ${serverId}`);

  return (
    <Suspense fallback={<Loading />}>
      <ServerSettingsClient serverId={serverId} />
    </Suspense>
  );
} 