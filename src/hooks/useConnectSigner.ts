import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { account } from "~/lib/client-helpers";
import { api } from "~/trpc/react";

export const useConnectSigner = () => {
  const setContractId = useContractStore.getState().setContractId;
  const setKeyId = useKeyStore.getState().setKeyId;

  const getContractIdQuery = api.stellar.getContractId.useQuery;
  const connect = async () => {
    try {
      const {
        keyId: kid,
        keyId_base64,
        contractId: cid,
      } = await account.connectWallet({
        getContractId: (signerId: string) => {
          // Call the TRPC query dynamically
          return getContractIdQuery(signerId)
            .then((res) => res.data)
            .catch((err) => {
              throw err;
            });
        },
      });

      setKeyId(keyId_base64);
      setContractId(cid);

      console.log("KeyId: ", keyId_base64);
      console.log("ContractId: ", cid);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return { connect };
};
