"use client";
import { Button } from "~/components/ui/button";
import { Fingerprint } from "lucide-react";
import { shortStellarAddress } from "~/lib/utils";
import { useSigner } from "~/hooks/useSigner";
import { useContractStore } from "~/hooks/stores/useContractStore";

export default function SignTransaction() {
  const { fund, connect, transfer } = useSigner();
  const { contractId } = useContractStore();
  return (
    <div>
      <h1>Sign Stellar Transaction with {contractId}</h1>
      <p>KEY: {shortStellarAddress()}</p>

      <div>
        <h2>Transaction Details</h2>
        <p>
          <strong>Description:</strong> XLM
        </p>

        <Button
          className="mx-auto w-full max-w-screen-md bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
          size="lg"
          onClick={() =>
            transfer("GCLQTRLPMITD76LYTZA23E747YO2PEROCUUKT7AJ4V6UDXQAQNOYRERU")
          }
        >
          <Fingerprint className="mr-2 h-6 w-6" />
          Transfer
        </Button>
        <Button
          className="mx-auto w-full max-w-screen-md bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
          size="lg"
          onClick={() => fund(contractId)}
        >
          <Fingerprint className="mr-2 h-6 w-6" />
          Fund
        </Button>
        <Button
          className="mx-auto w-full max-w-screen-md bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
          size="lg"
          onClick={connect}
        >
          <Fingerprint className="mr-2 h-6 w-6" />
          Connect
        </Button>
      </div>
    </div>
  );
}
