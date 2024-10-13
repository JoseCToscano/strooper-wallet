import { useState } from "react";
import { api } from "~/trpc/react";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { account, fundPubkey, fundSigner, native } from "~/lib/client-helpers";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";
import { type User } from "@prisma/client";

export const useCreateStellarPasskey = (strooperUser?: User) => {
  const [loading, setLoading] = useState(false);
  const setContractId = useContractStore((state) => state.setContractId);
  const setKeyId = useKeyStore((state) => state.setKeyId);

  const saveSigner = api.stellar.saveSigner.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => toast.success("Successfully saved signer"),
  });

  // Initialize tRPC mutation
  const { mutateAsync: sendTransaction, error } = api.stellar.send.useMutation({
    onSuccess: () => toast.success("Successfully sent XDR to Stellar network"),
    onError: ClientTRPCErrorHandler,
  });

  const fundWallet = async (contractId: string) => {
    try {
      setLoading(true);

      const { built, ...transfer } = await native.transfer({
        to: contractId,
        from: fundPubkey,
        amount: BigInt(100 * 10_000_000),
      });

      const a = await transfer.signAuthEntries({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        address: fundPubkey,
        signAuthEntry: (auth) => fundSigner.signAuthEntry(auth),
      });

      console.log("aaaa:", a);

      await sendTransaction({ xdr: built!.toXDR() });
      toast.success("Successfully funded wallet");
    } catch (err) {
      toast.error((err as Error)?.message ?? "Failed to fund wallet");
    } finally {
      setLoading(false);
    }
  };

  // Create a function to handle the wallet creation process
  const create = async (): Promise<string> => {
    try {
      setLoading(true);
      const user = "Strooper";
      const {
        keyId_base64,
        contractId: cid,
        built,
      } = await account.createWallet(
        user,
        strooperUser?.telegramUsername ?? "Strooper",
      );

      // Use tRPC mutation to send the transaction to the Stellar network
      const result = await sendTransaction({
        xdr: built.toXDR(),
      });
      if (result?.success) {
        // Store keyId and contractId in Zustand store
        setKeyId(keyId_base64);
        setContractId(cid);

        console.log("funding wallet");
        await saveSigner.mutateAsync({
          contractId: cid,
          signerId: keyId_base64,
        });
        // await fundWallet(cid);
        console.log("funded wallet");
        return cid;
      }
      throw new Error("Failed to create Stellar passkey");
    } catch (err) {
      toast.error(
        (err as Error)?.message ?? "Failed to create Stellar passkey",
      );
      throw new Error(
        (err as Error)?.message ?? "Failed to create Stellar passkey",
      );
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
