"use client";
import { useState } from "react";
import {
  Keypair,
  Transaction,
  Networks,
  TransactionBuilder,
  Horizon,
  BASE_FEE,
  Operation,
} from "@stellar/stellar-sdk";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import {
  getFullName,
  storeKey,
  storeCredentialId,
  storeData,
} from "~/lib/utils";
import { Button } from "~/components/ui/button";

const BOT_USERNAME = "stellar_wallet_poc_bot/stellar_passkey_poc";
const WalletCreation = () => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [passkeyCredential, setPasskeyCredential] = useState<any>(null);
  const searchParams = useSearchParams();

  const createStrooperWallet = api.auth.createStrooperWallet.useMutation();
  const verifyWebAuthn = api.auth.verifyWebAuthn.useMutation();
  const generateChallenge = api.auth.generateChallenge.useQuery();
  const { data } = api.telegram.getSession.useQuery(
    {
      sessionId: searchParams.get("sessionId") ?? "",
    },
    !!searchParams.get("sessionId"),
  ); // Function to generate Stellar Keypair
  const generateStellarKeypair = () => {
    const keypair = Keypair.random();
    setPublicKey(keypair.publicKey());
    setSecretKey(keypair.secret());
    console.log(
      "Generated Stellar Keypair:",
      keypair.publicKey(),
      keypair.secret(),
    );
    return keypair;
  };

  const registerPasskey = async (secretKey: string) => {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.subtle
    ) {
      console.log("WebCrypto API is supported");
    } else {
      console.error("WebCrypto API is not supported in this environment.");
      return;
    }

    if (!data?.session || !data?.user) {
      console.error("No user or session found");
      console.log(data);
      throw new Error("No user or session found");
    }

    try {
      console.log("Step 1: Starting passkey registration...");
      const { data: challengeData } = await generateChallenge.refetch();

      // Step 2: Register a new passkey using WebAuthn
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: new TextEncoder().encode(challengeData.challenge), // Challenge provided by the server
          rp: { name: "Strooper Wallet", id: window.location.hostname }, // Relying Party (RP) information
          user: {
            id: new TextEncoder().encode(data.user.id), // Unique identifier for the user
            name: data.user.telegramUsername, // Display name of the user
            displayName: `${getFullName(data.user)}`,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }], // Public key algorithm, -7 refers to ES256 (ECDSA with SHA-256)
          authenticatorSelection: {
            userVerification: "preferred",
            authenticatorAttachment: "platform",
          }, // Prefer biometric or PIN-based authentication
          attestation: "none", // Request attestation for device verification
        },
      })) as PublicKeyCredential;

      console.log(
        "Step 2 complete: WebAuthn registration response:",
        credential,
      );

      // Step 3: Extract WebAuthn registration response components
      const credentialId = credential.rawId;
      console.log("Step 3 complete: Extracted credentialId:", credentialId);

      // Store the credential ID in IndexedDB
      // Store the credential ID in IndexedDB
      const credentialIdUint8 = new Uint8Array(credentialId); // Convert ArrayBuffer to Uint8Array

      // Store the credential ID in IndexedDB
      await storeCredentialId(
        `${data.user.telegramId}-${publicKey}-credentialId`,
        credentialIdUint8,
      );
      console.log(
        "Saved credential ID:",
        `${data.user.telegramId}-${publicKey}-credentialId`,
        btoa(String.fromCharCode(...new Uint8Array(credentialId))),
        credentialIdUint8,
      );

      // Step 4: Generate an AES encryption key using the WebAuthn passkey (derived from clientDataJSON)
      const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // The key is extractable so it can be exported for storage
        ["encrypt", "decrypt"],
      );
      console.log("AES key generated successfully");

      // Store the AES key securely in IndexedDB using a unique identifier
      await storeKey(`${data.user.telegramId}-${publicKey}-aes-key`, aesKey);

      // Step 5: Encrypt the Stellar secret key using the AES key
      console.log("Step 5: Encrypting Stellar secret key...");
      const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector for AES-GCM
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        new TextEncoder().encode(secretKey),
      );
      console.log("Stellar secret key encrypted successfully");

      // Convert the encryptedData (ArrayBuffer) to Uint8Array for consistency
      const encryptedDataUint8 = new Uint8Array(encryptedData);

      // Store the encrypted secret key in IndexedDB using storeData
      await storeData(
        `${data.user.telegramId}-${publicKey}-encryptedSecretKey`,
        encryptedDataUint8,
      );

      console.log("Encrypted Stellar secret key stored successfully");
      // Store the initialization vector (IV) in IndexedDB using storeData
      await storeData(`${data.user.telegramId}-${publicKey}-encryptionIv`, iv);
      console.log("Encryption IV stored successfully");
      console.log("Passkey registration successful, secret key encrypted.");
      // Step 6: Store the Stellar public key in the database for the user
      await createStrooperWallet.mutateAsync({
        userTelegramId: data.user.telegramId,
        stellarPublicKey: publicKey,
      });

      console.log("Passkey registration successful, secret key encrypted.");
    } catch (error) {
      console.error("Passkey registration failed:", error);
      throw new Error(`Passkey registration failed: ${error.message}`);
    }
  };

  // Example function to fund Stellar Account
  const fundStellarAccount = async (publicKey: string) => {
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fund account");
      }
      console.log("Account funded:", await response.json());
      setAuthStatus("Account funded successfully");
    } catch (error) {
      console.error("Error funding Stellar account:", error);
      setAuthStatus("Failed to fund account");
    }
  };

  // UI Rendering
  return (
    <div>
      data: {data && <div>{JSON.stringify(data.session)}</div>}
      data: {data && <div>{JSON.stringify(data.user)}</div>}
      searchParams:{searchParams}
      <h1>Stellar Wallet Creation with Passkeys</h1>
      {!publicKey && (
        <button onClick={generateStellarKeypair}>
          Generate Stellar Keypair
        </button>
      )}
      {publicKey && (
        <>
          <p>Public Key: {publicKey}</p>
          <p>Secret Key: {secretKey}</p>

          <Button
            className="border-2 border-black"
            onClick={() => registerPasskey(secretKey || "")}
          >
            Create Passkey
          </Button>

          <button onClick={() => fundStellarAccount(publicKey)}>
            Fund Stellar Account
          </button>

          {authStatus && <p>{authStatus}</p>}
        </>
      )}
    </div>
  );
};

export default WalletCreation;
