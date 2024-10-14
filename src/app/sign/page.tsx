"use client";
import { Button } from "~/components/ui/button";
import { AlertCircle, Copy, Fingerprint, PlusCircle } from "lucide-react";
import {
  copyToClipboard,
  fromStroops,
  toStroops,
  shortStellarAddress,
  hasEnoughBalance,
} from "~/lib/utils";
import { useSigner } from "~/hooks/useSigner";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import LoadingDots from "~/components/icons/loading-dots";
import TransactionConfirmation from "~/app/sign/components/TransactionConfirmation";
import { useGetSigners } from "~/hooks/useGetSigners";
import { api } from "~/trpc/react";
import { useFunder } from "~/hooks/useFunder";

export default function SignTransaction() {
  const searchParams = useSearchParams();
  const { connect, transfer } = useSigner();
  const { contractId } = useContractStore();

  const [amount, setAmount] = useState(searchParams.get("amount"));
  const [address, setAddress] = useState(searchParams.get("to"));
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { getSigners } = useGetSigners();
  const { fund } = useFunder();

  const { data: balance, isLoading } = api.stellar.getBalance.useQuery(
    { contractAddress: String(contractId) },
    {
      enabled: !!contractId,
      refetchIntervalInBackground: true,
      refetchInterval: 3000,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  useEffect(() => {
    // Cleanups
    return () => setShowSuccess(false);
  }, []);

  useEffect(() => {
    console.log("contract id is: ", contractId);
    if (contractId) {
      console.log("getting signers for contract id: ", contractId);
      const signers = getSigners(contractId);
      console.log("signers are: ", signers);
    }
  }, [contractId]);

  if (showSuccess && amount && address) {
    return <TransactionConfirmation amount={amount} recipient={address} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="flex items-center justify-center space-y-1">
          <Image
            className="mx-auto my-0"
            src={"/helmet-black.png"}
            alt="Strooper Logo"
            width={65}
            height={65}
          />
          <CardTitle className="text-center text-2xl font-semibold text-zinc-900">
            Sign Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative -my-2 rounded-md bg-zinc-100 p-3 text-center">
            <p className="text-sm text-zinc-500">Available Balance</p>
            {isLoading ? (
              <LoadingDots />
            ) : (
              <p className="text-lg font-semibold">
                {balance ? fromStroops(balance) : "0.00"} XLM
              </p>
            )}
            {contractId && (
              <Button
                size="sm"
                variant="outline"
                className="absolute right-2 top-2 bg-white px-2 py-1 text-xs hover:bg-zinc-200"
                onClick={() => fund(contractId)}
              >
                <PlusCircle className="mr-1 h-3 w-3" />
                Fund account
              </Button>
            )}
          </div>
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
              {!hasEnoughBalance(balance, toStroops(amount)) && balance && (
                <span className="">
                  <p className="flex items-center pl-1 text-xs text-red-600">
                    <AlertCircle className="mr-0.5 inline-block h-3 w-3" />
                    Transfer amount exceeds balance
                  </p>
                </span>
              )}
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
                  value={address ? String(address) : ""}
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
                <span className="flex cursor-pointer font-mono text-zinc-700">
                  {shortStellarAddress(contractId ?? "")}
                  {contractId && (
                    <Copy
                      className="ml-1 h-4 w-4"
                      onClick={() => copyToClipboard(contractId)}
                    />
                  )}
                </span>
              </p>
              {address && (
                <p className="flex justify-between">
                  <span className="text-zinc-500">To:</span>
                  <span className="flex cursor-pointer font-mono text-zinc-700">
                    {shortStellarAddress(address ?? "")}
                    {contractId && (
                      <Copy
                        className="ml-1 h-4 w-4"
                        onClick={() => copyToClipboard(address)}
                      />
                    )}
                  </span>
                </p>
              )}
              {amount && (
                <p className="flex justify-between">
                  <span className="text-zinc-500">Amount:</span>
                  <span className="font-mono text-zinc-700">{amount} XLM</span>
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
            disabled={!address || !amount || isExecuting}
            className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
            size="lg"
            onClick={async () => {
              if (!address || !amount) {
                toast.error("Please enter a recipient address and amount");
                return;
              }
              setIsExecuting(true);
              transfer(address, BigInt(Number(amount ?? 1) * 10_000_000))
                .then(() => {
                  setShowSuccess(true);
                  setIsExecuting(false);
                })
                .catch(() => setIsExecuting(false));
            }}
          >
            <Fingerprint className="mr-2 h-6 w-6" />
            {isExecuting ? <LoadingDots color="white" /> : "Transfer"}{" "}
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
      <span className="mt-4 text-xs text-zinc-500">
        Strooper Wallet • ©2024
      </span>
    </div>
  );
}
