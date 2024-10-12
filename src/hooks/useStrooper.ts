"use client";
import { useEffect, useState } from "react";
import { Session } from "@prisma/client";
import { api } from "~/trpc/react";
import {
  getCredentialId,
  getData,
  getKey,
  shortStellarAddress,
} from "~/lib/utils";
import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { useSearchParams } from "next/navigation";

export const useStrooper = () => {
  const searchParams = useSearchParams();
  const [publicKey, setPublicKey] = useState<string>();
  const [network, setNetwork] = useState<string>();
  const [trustline, setTrustline] = useState<Record<string, number>>({});
  const [reload, setReload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [telegramUserId, setTelegramUserId] = useState<number>();
  const [transactionDetails, setTransactionDetails] = useState("");
  const [signatureSession, setSignatureSession] = useState<Session>();

  const { data: availableWallets } = api.auth.listWallets.useQuery(
    {
      telegramUserId,
    },
    {
      enabled: !!telegramUserId,
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

  const { data: session } = api.telegram.getSession.useQuery(
    { sessionId: searchParams.get("sessionId")! },
    !!searchParams.get("sessionId"), // Only run the query if sessionId exists
  );

  useEffect(() => {
    if (session?.user && session?.session) {
      console.log("Session:", session);
      console.log("session.user", session.user);
      setTelegramUserId(session.user.telegramId);
      setSignatureSession(session.session);
      setPublicKey(session.session.publicKey);
      const transaction = TransactionBuilder.fromXDR(
        session.session.unsignedXDR as string,
        "Testnet",
      );
      let transactionDescription = "";
      transaction.operations.forEach((operation) => {
        if (operation.type === "payment") {
          transactionDescription = `Payment of ${operation.amount} XLM to ${shortStellarAddress(operation.destination)}`;
        } else {
          transactionDescription = "Unknown operation";
        }
      });
      setTransactionDetails(transactionDescription);
    }
  }, [session]);

  useEffect(() => {
    const tl = trustline;
    data?.balances?.forEach((b) => {
      if (b.asset_type === "credit_alphanum12") {
        tl[b.asset_code] = Number(b.balance);
      }
    });
    setTrustline(tl);
  }, [data, reload]);

  const submitTransaction = async (xdr: string) => {
    try {
      console.log("Signed transaction XDR:");
      const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
      // Submit the signed transaction to Stellar Horizon server
      const server = new Horizon.Server("https://horizon-testnet.stellar.org");
      const res = await server.submitTransaction(tx);
      console.log("Transaction submitted:", res);
      window.location.href = "telegram://resolve?domain=stellar_passkey_poc"; // resolve?domain=stellar_wallet_poc_bot/stellar_passkey_poc
      return res;
    } catch (error) {
      console.error("Error submitting transaction:", error);
      throw new Error(`Failed to submit transaction: ${error.message}`);
    }
  };

  const signXDR = async (xdr: string): Promise<string> => {
    try {
      setLoading(true);
      if (!publicKey) {
        throw new Error("Public key not found");
      }
      console.log(
        "Signing transaction with public key:",
        publicKey,
        "telegramUserId:",
        telegramUserId,
      );
      // Step 1: Retrieve the credentialId from IndexedDB using the publicKey
      const credentialId = await getCredentialId(
        `${telegramUserId}-${publicKey}-credentialId`,
      );
      console.log(
        "Retrieved credentialId:",
        `${telegramUserId}-${publicKey}-credentialId`,
        credentialId,
      );
      if (!credentialId) {
        throw new Error("Credential ID not found in IndexedDB");
      }
      console.log("Retrieved credentialId:", credentialId);

      // Step 2: Trigger WebAuthn authentication using the stored credentialId (this should prompt FaceID)
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32), // Challenge from the server, you should replace this with your actual challenge
          allowCredentials: [
            {
              id: credentialId,
              type: "public-key",
            },
          ],
          userVerification: "required",
        },
      })) as PublicKeyCredential;

      console.log("Biometric authentication successful:", assertion);

      // Step 3: Retrieve the AES key from IndexedDB using the user-specific publicKey
      const aesKey = await getKey(`${telegramUserId}-${publicKey}-aes-key`);
      if (!aesKey) {
        throw new Error("AES key not found");
      }

      // Step 4: Retrieve the encrypted secret key and IV from IndexedDB using the publicKey
      const encryptedStellarSecretKey = await getData(
        `${telegramUserId}-${publicKey}-encryptedSecretKey`,
      );
      const encryptionIv = await getData(
        `${telegramUserId}-${publicKey}-encryptionIv`,
      );

      if (!encryptedStellarSecretKey || !encryptionIv) {
        throw new Error("Encrypted Stellar secret key or IV not found");
      }

      // Convert the encrypted data and IV from Uint8Array to ArrayBuffer for decryption
      const encryptedSecretKeyBuffer = new Uint8Array(encryptedStellarSecretKey)
        .buffer;
      const ivBuffer = new Uint8Array(encryptionIv).buffer;

      // Step 5: Decrypt the encrypted secret key using the AES key
      const decryptedSecretKeyBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBuffer, // Use the IV that was stored during encryption
        },
        aesKey,
        encryptedSecretKeyBuffer,
      );

      // Convert decrypted ArrayBuffer to a UTF-8 string (Stellar secret key)
      const decryptedSecretKey = new TextDecoder().decode(
        decryptedSecretKeyBuffer,
      );
      console.log("Decrypted Stellar Secret Key:", decryptedSecretKey);

      // Step 6: Use the Stellar SDK to sign the transaction with the decrypted secret key
      const keypair = Keypair.fromSecret(decryptedSecretKey);

      // Convert the unsigned XDR to a Stellar Transaction object
      const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);

      // Sign the transaction
      tx.sign(keypair);
      return tx.toXDR();
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw new Error(`Failed to sign transaction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signCurrentSession = async () => {
    if (!signatureSession) {
      throw new Error("No session found");
    }
    const xdr = signatureSession.unsignedXDR as string;
    const signedXDR = await signXDR(xdr);
    return submitTransaction(signedXDR);
  };

  return {
    publicKey,
    setPublicKey,
    network,
    setNetwork,
    isLoading,
    account: data,
    signXDR,
    submitTransaction,
    trustline,
    setReload,
    transactionDetails,
    signCurrentSession,
    availableWallets: availableWallets ?? [],
    setTelegramUserId,
    telegramUserId,
  };
};
