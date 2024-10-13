"use client";
import { Button } from "~/components/ui/button";
import { AlertCircle, Camera, Fingerprint, Shield } from "lucide-react";
import { fromStroops, shortStellarAddress } from "~/lib/utils";
import { useSigner } from "~/hooks/useSigner";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignTransaction() {
  const searchParams = useSearchParams();
  const { connect, transfer } = useSigner();
  const { contractId } = useContractStore();

  const [amount, setAmount] = useState(searchParams.get("amount"));
  const [address, setAddress] = useState(searchParams.get("to"));

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-zinc-700"
              >
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
                value={String(amount)}
                onChange={(e) => setAmount(String(e.target.value ?? ""))}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-zinc-700"
              >
                Recipient Address
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter recipient address"
                  className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
                  value={String(address)}
                  onChange={(e) => setAddress(String(e.target.value ?? ""))}
                />
              </div>
            </div>
          </div>
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
              {address && (
                <p className="flex justify-between">
                  <span className="text-zinc-500">To:</span>
                  <span className="font-mono text-zinc-700">
                    {shortStellarAddress(address ?? "")}
                  </span>
                </p>
              )}
              {amount && (
                <p className="flex justify-between">
                  <span className="text-zinc-500">Amount:</span>
                  <span className="font-mono text-zinc-700">
                    {fromStroops(amount)} XLM
                  </span>
                </p>
              )}
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
            disabled={!address || !amount}
            className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
            size="lg"
            onClick={async () => {
              if (!address || !amount) {
                toast.error("Please enter a recipient address and amount");
                return;
              }
              await transfer(address, BigInt(Number(amount ?? 1) * 10_000_000));
            }}
          >
            <Fingerprint className="mr-2 h-6 w-6" />
            Transfer
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
    </div>
  );
}
