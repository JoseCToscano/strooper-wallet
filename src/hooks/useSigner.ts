import { api } from "~/trpc/react"; // Import your tRPC client
import { ClientTRPCErrorHandler, shortStellarAddress } from "~/lib/utils";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { account, native, fundPubkey, fundSigner } from "~/lib/client-helpers";
import { useGetContractId } from "~/hooks/useGetContractId";
import toast from "react-hot-toast";
import { env } from "~/env";

export const useSigner = () => {
  const setContractId = useContractStore.getState().setContractId;
  const setKeyId = useKeyStore.getState().setKeyId;
  const { keyId } = useKeyStore.getState();
  const { contractId } = useContractStore.getState();
  const {
    mutateAsync: sendTransaction,
    isLoading,
    error,
  } = api.stellar.send.useMutation({
    onSuccess: () => toast.success("Successfully sent XDR to Stellar network"),
    onError: ClientTRPCErrorHandler,
  });

  const { getContractId } = useGetContractId();

  const connect = async () => {
    try {
      const {
        keyId: kid,
        keyId_base64,
        contractId: cid,
      } = await account.connectWallet({
        getContractId,
      });

      setKeyId(keyId_base64);
      setContractId(cid);

      console.log("KeyId: ", keyId_base64);
      console.log("ContractId: ", cid);
      toast.success(
        `Successfully extracted contract: ${cid}`,
        shortStellarAddress(cid),
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fund = async (to: string) => {
    try {
      const { built, ...transfer } = await native.transfer({
        from: fundPubkey,
        to,
        amount: BigInt(100 * 10_000_000),
      });

      console.log("xdr: ", built.toXDR());

      await transfer.signAuthEntries({
        address: fundPubkey,
        signAuthEntry: (auth) => fundSigner.signAuthEntry(auth),
      });

      // Use tRPC mutation to send the transaction to the Stellar network
      const result = await sendTransaction({
        xdr: built.toXDR(),
      });
      console.log("result:", result);
      return result;
    } catch (err: any) {
      alert(err.message);
    }
  };

  const transfer = async (to: string) => {
    try {
      console.log(
        "Will transfer from contractId:",
        shortStellarAddress(contractId),
        "to:",
        shortStellarAddress(to),
      );
      const at = await native.transfer({
        from: contractId,
        to,
        amount: BigInt(100 * 10_000_000),
      });

      console.log("at xdr:", at.toXDR());
      console.log("before sign");
      const signedXDR = await account.sign(at, { keyId });
      console.log("after sign");
      // Use tRPC mutation to send the transaction to the Stellar network
      console.log("before res");
      const result = await sendTransaction({
        xdr: signedXDR.built.toXDR(),
      });
      console.log("after res");
      console.log("result:", result);
      return result;
    } catch (err: any) {
      alert(err.message);
    }
  };

  return {
    fund,
    connect,
    transfer,
  };
};
