import {
  Account,
  Keypair,
  SorobanRpc,
  StrKey,
} from "@stellar/stellar-sdk/minimal";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Buffer } from "buffer";
import { PasskeyKit, SACClient } from "passkey-kit";
import { env } from "~/env";

export const rpc = new SorobanRpc.Server(env.NEXT_PUBLIC_RPC_URL);

export const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32));
export const mockSource = new Account(mockPubkey, "0");

export const account = new PasskeyKit({
  rpcUrl: env.NEXT_PUBLIC_RPC_URL,
  networkPassphrase: env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
  factoryContractId: env.NEXT_PUBLIC_FACTORY_CONTRACT_ID,
});

export const fundKeypair = new Promise<Keypair>(async (resolve) => {
  const now = new Date();

  now.setMinutes(0, 0, 0);

  const nowData = new TextEncoder().encode(now.getTime().toString());
  const hashBuffer = crypto.subtle
    ? await crypto.subtle.digest("SHA-256", nowData)
    : crypto.getRandomValues(new Uint8Array(32));
  const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer));
  const publicKey = keypair.publicKey();

  rpc
    .getAccount(publicKey)
    .catch(() => rpc.requestAirdrop(publicKey))
    .then(console.log)
    .catch(() => {});

  resolve(keypair);
});
export const fundPubkey = (await fundKeypair).publicKey();
export const fundSigner = basicNodeSigner(
  await fundKeypair,
  env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
);

export const sac = new SACClient({
  rpcUrl: env.NEXT_PUBLIC_RPC_URL,
  networkPassphrase: env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
});
export const native = sac.getSACClient(env.NEXT_PUBLIC_NATIVE_CONTRACT_ID);
