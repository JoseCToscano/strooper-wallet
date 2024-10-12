"use client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSessionStore } from "~/hooks/stores/useSessionStore";

export const useStrooper = () => {
  const { user } = useSessionStore();

  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("Testnet");

  const { data: availableWallets } = api.auth.listWallets.useQuery(
    {
      telegramUserId: user?.id, // Get the user's telegram ID from the session
    },
    {
      enabled: !!user?.id,
    },
  );

  const { data, isLoading } = api.stellar.details.useQuery(
    {
      id: publicKey!,
    },
    {
      enabled: !!publicKey,
      refetchIntervalInBackground: true,
      refetchInterval: 5000,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  useEffect(() => {
    if (user?.wallet) {
      setPublicKey(user.wallet.publicKey);
    }
  }, [user]);

  return {
    network,
    setNetwork,
    publicKey,
    availableWallets,
    data,
  };
};
