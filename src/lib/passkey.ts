import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { account, native } from "~/lib/client-helpers";
import { api } from "~/trpc/react"; // assuming your helpers

export async function create() {
  const setContractId = useContractStore.getState().setContractId;
  const setKeyId = useKeyStore.getState().setKeyId;

  try {
    const user = "Strooper";
    const {
      keyId_base64,
      contractId: cid,
      built,
    } = await account.createWallet(user, user);

    await send(built.toXDR());

    // Store keyId and contractId in Zustand store and localStorage (handled by Zustand)
    setKeyId(keyId_base64);
    setContractId(cid);

    console.log("KeyId: ", keyId_base64);
    console.log("ContractId: ", cid);
  } catch (err: any) {
    alert(err.message);
  }
}

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

export async function fund(to: string) {
  try {
    const { built, ...transfer } = await native.transfer({
      to,
      from: fundPubkey,
      amount: BigInt(100 * 10_000_000),
    });

    await transfer.signAuthEntries({
      address: fundPubkey,
      signAuthEntry: (auth) => fundSigner.signAuthEntry(auth),
    });

    const res = await send(built!.toXDR());

    console.log(res);
  } catch (err: any) {
    alert(err.message);
  }
}

export async function send(xdr: string) {
  const sendTransaction = api.stellar.send.useMutation();
  return sendTransaction.mutateAsync({ xdr });
}

export async function getSigners(contractId: string) {
  return fetch(`/api/signers/${contractId}`).then(async (res) => {
    if (res.ok) return res.json();
    else throw await res.text();
  });
}

export async function getContractId(signer: string) {
  return fetch(`/api/contract-id/${signer}`).then(async (res) => {
    if (res.ok) return res.text();
    else throw await res.text();
  });
}
