import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { account } from "~/lib/client-helpers";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";

export const useCreateStellarPasskey = () => {
  const [loading, setLoading] = useState(false);
  const setContractId = useContractStore((state) => state.setContractId);
  const setKeyId = useKeyStore((state) => state.setKeyId);

  // Initialize tRPC mutation
  const {
    mutateAsync: sendTransaction,
    isLoading,
    error,
  } = api.stellar.send.useMutation({
    onSuccess: () => toast.success("Successfully sent XDR to Stellar network"),
    onError: ClientTRPCErrorHandler,
  });

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    }
  }, [isLoading]);

  // Create a function to handle the wallet creation process
  const create = async () => {
    try {
      setLoading(true);
      const user = "Strooper";
      const {
        keyId_base64,
        contractId: cid,
        built,
      } = await account.createWallet(user, user);

      // Use tRPC mutation to send the transaction to the Stellar network
      const result = await sendTransaction({
        xdr: built.toXDR(),
      });
      console.log("result", result);

      if (result.success) {
        // Store keyId and contractId in Zustand store
        setKeyId(keyId_base64);
        setContractId(cid);

        console.log("KeyId: ", keyId_base64);
        console.log("ContractId: ", cid);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create Stellar passkey");
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
