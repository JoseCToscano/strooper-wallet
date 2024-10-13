"use client";
import { Button } from "~/components/ui/button";
import { AlertCircle, Fingerprint, Shield } from "lucide-react";
import { shortStellarAddress } from "~/lib/utils";
import { useSigner } from "~/hooks/useSigner";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function SignTransaction() {
  const { connect, transfer } = useSigner();
  const { contractId } = useContractStore();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="flex items-center justify-center space-y-1">
          <Shield className="mb-2 h-8 w-8 text-zinc-700" />
          <CardTitle className="text-center text-2xl font-semibold text-zinc-900">
            Sign Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              Transaction Details
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-zinc-500">From:</span>
                <span className="font-mono text-zinc-700">
                  {shortStellarAddress(contractId ?? "")}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500">To:</span>
                <span className="font-mono text-zinc-700">
                  {shortStellarAddress("ABCCVBDDDDDDRERU")}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500">Amount:</span>
                <span className="font-mono text-zinc-700">100 XLM</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg bg-zinc-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-600">
              Ensure you&apos;re on a secure network before signing this
              transaction.
            </p>
          </div>
          <Button
            className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
            size="lg"
            onClick={async () => {
              await transfer(
                "GCLQTRLPMITD76LYTZA23E747YO2PEROCUUKT7AJ4V6UDXQAQNOYRERU",
              );
            }}
          >
            <Fingerprint className="mr-2 h-6 w-6" />
            Transferr
          </Button>
          <Button
            className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
            size="lg"
            onClick={connect}
          >
            <Fingerprint className="mr-2 h-6 w-6" />
            Connect
          </Button>
        </CardContent>
      </Card>

      {/*<hr />

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
        </Button>*/}
    </div>
  );
}
