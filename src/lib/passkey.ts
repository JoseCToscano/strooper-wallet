import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { account, native } from "~/lib/client-helpers";
import { api } from "~/trpc/react"; // assuming your helpers

export async function connect() {
  const setContractId = useContractStore.getState().setContractId;
  const setKeyId = useKeyStore.getState().setKeyId;

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
  } catch (err: any) {
    alert(err.message);
  }
}

export async function getSigners(contractId: string) {
  return fetch(`/api/signers/${contractId}`).then(async (res) => {
    if (res.ok) return res.json();
    else throw await res.text();
  });
}

export async function getContractId(signer: string) {
  console.log("signer:", signer);
  return fetch(`/api/contract-id/${signer}`).then(async (res) => {
    if (res.ok) return res.text();
    else throw await res.text();
  });
}
