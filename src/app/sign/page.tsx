"use client";
import { Button } from "~/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useStrooper } from "~/hooks/useStrooper";
import { shortStellarAddress } from "~/lib/utils";

export default function SignTransaction() {
  const { transactionDetails, signCurrentSession, publicKey } = useStrooper();

  return (
    <div>
      <h1>Sign Stellar Transaction</h1>
      <p>KEY: {shortStellarAddress(publicKey)}</p>

      {transactionDetails ? (
        <div>
          <h2>Transaction Details</h2>
          <p>
            <strong>Description:</strong> {transactionDetails} XLM
          </p>

          <Button
            className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
            size="lg"
            onClick={signCurrentSession}
          >
            <Fingerprint className="mr-2 h-6 w-6" />
            Sign
          </Button>
        </div>
      ) : (
        <p>No transaction found for this session.</p>
      )}
    </div>
  );
}
