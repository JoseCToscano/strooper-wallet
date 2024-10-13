import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import {
  type AnyClientTypes,
  TRPCError,
} from "@trpc/server/unstable-core-do-not-import";
import { Horizon } from "@stellar/stellar-sdk";
import { AxiosError } from "axios";

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
    request.onerror = () => reject(request.error as Error);
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
    transaction.onerror = () => reject(transaction.error as Error);
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
      const exportedKey = request.result as string;
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
    request.onerror = () => reject(request.error as Error);
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
    transaction.onerror = () => reject(transaction.error as Error);
  });
}

export async function getCredentialId(keyId: string): Promise<Uint8Array> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readonly");
  const store = transaction.objectStore("keys");

  const request = store.get(keyId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const credentialIdBase64 = request.result as string;
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
    request.onerror = () => reject(request.error as Error);
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
    transaction.onerror = () => reject(transaction.error as Error);
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
    request.onerror = () => reject(request.error as Error);
  });
}

export function shortStellarAddress(
  longAddress?: string,
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

export function handleHorizonServerError(error: unknown) {
  console.log("hi:)");
  let message = "Failed to send transaction to blockchain";
  const axiosError = error as AxiosError<Horizon.HorizonApi.ErrorResponseData>;
  if (
    typeof (axiosError?.response as { detail?: string })?.detail === "string"
  ) {
    message = (axiosError?.response as { detail?: string })?.detail ?? message;
  } else if (axiosError?.response?.data) {
    switch (axiosError.response.data.title) {
      case "Rate Limit Exceeded":
        message = "Rate limit exceeded. Please try again in a few seconds";
        break;
      case "Internal Server Error":
        message = "We are facing some issues. Please try again later";
        break;
      case "Transaction Failed":
        message = "Transaction failed";
        const txError = parsedTransactionFailedError(axiosError.response.data);
        if (txError) {
          message = `Transaction failed: ${txError}`;
        }
        break;
      default:
        message = "Failed to send transaction to blockchain";
        break;
    }
  }
  console.log(message);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message,
  });
}
function parsedTransactionFailedError(
  failedTXError?: Horizon.HorizonApi.ErrorResponseData.TransactionFailed,
) {
  console.log("failedTXError", failedTXError);
  if (!failedTXError) return;
  const { extras } = failedTXError;
  let message = "Unknown error";
  if (!extras) {
    return message;
  }
  if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH
  ) {
    message = "Invalid transaction signature";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE
  ) {
    message = "Transaction expired. Please try again";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT
  ) {
    message = "Source account does not exist";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_FAILED,
    )
  ) {
    message = "One of the operations failed (none were applied)";
  } else if (extras.result_codes.operations?.includes("op_no_issuer")) {
    message = "The issuer account does not exist. ¿Has network been restored?";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_EARLY,
    )
  ) {
    message = "The ledger closeTime was before the minTime";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE,
    )
  ) {
    message = "The ledger closeTime was after the maxTime";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_MISSING_OPERATION,
    )
  ) {
    message = "No operation was specified";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ,
    )
  ) {
    message = "The sequence number does not match source account";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ
  ) {
    message = "The sequence number does not match source account";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH,
    )
  ) {
    message =
      "Check if you have the required permissions and signatures for this Network";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_BALANCE,
    )
  ) {
    message = "You don't have enough balance to perform this operation";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT,
    )
  ) {
    message = "The source account does not exist";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH_EXTRA,
    )
  ) {
    message = "There are unused signatures attached to the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_FEE,
    )
  ) {
    message = "The fee is insufficient for the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INTERNAL_ERROR,
    )
  ) {
    message = "An unknown error occurred while processing the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_NOT_SUPPORTED,
    )
  ) {
    message = "The operation is not supported by the network";
  } else if (extras.result_codes.operations?.includes("op_buy_no_trust")) {
    message = "You need to establish trustline first";
  } else if (extras.result_codes.operations?.includes("op_low_reserve")) {
    message = "You don't have enough XLM to create the offer";
  } else if (extras.result_codes.operations?.includes("op_bad_auth")) {
    message =
      "There are missing valid signatures, or the transaction was submitted to the wrong network";
  } else if (extras.result_codes.operations?.includes("op_no_source_account")) {
    message = "There is no source account";
  } else if (extras.result_codes.operations?.includes("op_not_supported")) {
    message = "The operation is not supported by the network";
  } else if (
    extras.result_codes.operations?.includes("op_too_many_subentries")
  ) {
    message = "Max number of subentries (1000) already reached";
  }
  return message;
}
