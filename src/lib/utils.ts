import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type AnyClientTypes } from "@trpc/server/unstable-core-do-not-import";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the URL for the Stellar Horizon server based on the network
 * @param network
 */
export function getHorizonServerUrl(network: string): string {
  return network === "Testnet"
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";
}
export function getFullName(user: WebAppUser): string {
  return user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name;
}

// Open or create the IndexedDB database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("crypto-store", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("keys");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store the CryptoKey in IndexedDB
export async function storeKey(keyId: string, key: CryptoKey): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");

  // Export the CryptoKey to a storable format (like JWK)
  const exportedKey = await crypto.subtle.exportKey("jwk", key); // Export as JWK format

  store.put(exportedKey, keyId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Retrieve the CryptoKey from IndexedDB
export async function getKey(keyId: string): Promise<CryptoKey> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readonly");
  const store = transaction.objectStore("keys");

  const request = store.get(keyId);

  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const exportedKey = request.result;
      if (exportedKey) {
        // Import the JWK back into a CryptoKey
        const importedKey = await crypto.subtle.importKey(
          "jwk",
          exportedKey,
          { name: "AES-GCM", length: 256 },
          false, // Not extractable
          ["encrypt", "decrypt"],
        );
        resolve(importedKey);
      } else {
        reject(new Error("Key not found"));
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function storeCredentialId(
  keyId: string,
  credentialId: Uint8Array,
): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");

  // Store the credentialId as a base64 string for easier retrieval
  const credentialIdBase64 = btoa(String.fromCharCode(...credentialId));
  store.put(credentialIdBase64, keyId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getCredentialId(keyId: string): Promise<Uint8Array> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readonly");
  const store = transaction.objectStore("keys");

  const request = store.get(keyId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const credentialIdBase64 = request.result;
      console.log("request", request);
      if (credentialIdBase64) {
        // Convert the base64 string back into a Uint8Array
        const credentialId = Uint8Array.from(atob(credentialIdBase64), (c) =>
          c.charCodeAt(0),
        );
        resolve(credentialId);
      } else {
        reject(new Error("Credential ID not found"));
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// Store non-CryptoKey data (ArrayBuffer, Uint8Array) in IndexedDB
export async function storeData(
  keyId: string,
  data: ArrayBuffer | Uint8Array,
): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");

  // Ensure data is in ArrayBuffer format for consistency
  const bufferData = data instanceof Uint8Array ? data.buffer : data;

  store.put(bufferData, keyId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getData(keyId: string): Promise<ArrayBuffer | null> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readonly");
  const store = transaction.objectStore("keys");

  const request = store.get(keyId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        // Ensure the result is in ArrayBuffer format
        resolve(result instanceof ArrayBuffer ? result : null);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export function shortStellarAddress(
  longAddress: string,
  charsToShow = 4,
): string {
  if (!longAddress) return "";
  return (
    longAddress.slice(0, charsToShow) + "..." + longAddress.slice(-charsToShow)
  );
}

export function copyToClipboard(text: string, silence = false) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // toast.success("Copied to clipboard");
    })
    .catch(() => {
      if (!silence) {
        // toast.error("Failed to copy to clipboard");
      }
    });
}

export function generateQrCode(data: string): string {
  const size = "100x100";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
}

export function ClientTRPCErrorHandler<T extends AnyClientTypes>(
  x?: TRPCClientErrorLike<T>,
) {
  if (x?.message) {
    toast.error(x?.message);
  } else if ((x?.data as { code: string })?.code === "INTERNAL_SERVER_ERROR") {
    toast.error("We are facing some issues. Please try again later");
  } else if ((x?.data as { code: string })?.code === "BAD_REQUEST") {
    toast.error("Invalid request. Please try again later");
  } else if ((x?.data as { code: string })?.code === "UNAUTHORIZED") {
    toast.error("Unauthorized request. Please try again later");
  } else if (x?.message) {
    toast.error(x?.message);
  } else {
    toast.error("We are facing some issues! Please try again later");
  }
}
