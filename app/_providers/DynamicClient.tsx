'use client'

import Config from '@/config';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { DynamicContextProvider, RemoveWallets, SolanaWalletConnectors} from "@/lib/dynamic"

export function CSDynamicContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <DynamicContextProvider
      settings={{
        apiBaseUrl: `https://${Config.dynamic.apiBaseUrl}/api/v0`,
        environmentId: Config.dynamic.environmentId,
        walletConnectors: [SolanaWalletConnectors],
        walletsFilter: RemoveWallets(['exodussol', 'glow', 'onekeysol']),
        events: {
          onLogout: async () => {
            router.push('/');
          }
        }
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}