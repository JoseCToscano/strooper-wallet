"use client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  RefreshCwIcon,
  ScanIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import {
  cn,
  copyToClipboard,
  generateQrCode,
  shortStellarAddress,
} from "~/lib/utils";
import { api } from "~/trpc/react";
import { Horizon } from "@stellar/stellar-sdk";
import dayjs from "dayjs";
import { useStrooper } from "~/hooks/useStrooper";

const tokens = [
  { id: 1, name: "Ethereum", symbol: "ETH", balance: "1.2345", icon: "🔷" },
  { id: 2, name: "USD Coin", symbol: "USDC", balance: "100.00", icon: "💵" },
  { id: 3, name: "Chainlink", symbol: "LINK", balance: "50.75", icon: "⛓️" },
  { id: 4, name: "Uniswap", symbol: "UNI", balance: "25.5", icon: "🦄" },
];

interface WalletProps {
  scanQrCode: () => void;
}
export const Wallet: React.FC<WalletProps> = ({ scanQrCode }) => {
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const { publicKey, availableWallets } = useStrooper();

  const { data: account } = api.telegram.accountData.useQuery({
    publicKey,
  });

  const recentOperations = api.telegram.operations.useQuery({
    id: publicKey,
    limit: 25,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl font-bold">
            Stellar Wallet
          </CardTitle>
          availableWallets: {JSON.stringify(availableWallets)}
          <Button
            onClick={scanQrCode}
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            aria-label="Scan QR Code"
          >
            <ScanIcon className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-center">
            <p className="mb-1 text-sm text-gray-500">Your Balance</p>
            <h2 className="text-4xl font-bold">1001.1234 XLM</h2>
          </div>
          <div className="mb-6 flex justify-between">
            <Button
              disabled
              title="Coming soon"
              variant="outline"
              className="w-[48%]"
            >
              <ArrowUpIcon className="mr-2 h-4 w-4" /> Send
            </Button>
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="w-[48%]"
            >
              {!showQR && <ArrowDownIcon className="mr-2 h-4 w-4" />}
              {showQR ? "Hide QR" : "Receive"}
            </Button>
          </div>
          {showQR && (
            <div className="flex w-full items-center justify-center rounded-t-md bg-gray-100 p-4">
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <Image
                src={generateQrCode(publicKey ?? "")}
                width="250"
                height="250"
                alt="QR Code"
                className="rounded-md"
                style={{ aspectRatio: "200/200", objectFit: "cover" }}
              />
            </div>
          )}
          <div
            className={cn(
              "mb-6 flex items-center justify-between rounded-b-md bg-gray-100 p-3",
              !showQR && "rounded-t-md",
            )}
          >
            <span className="text-sm text-gray-600">
              {shortStellarAddress(publicKey ?? "")}
            </span>
            <Button
              onClick={() => copyToClipboard(publicKey ?? "")}
              variant="ghost"
              size="icon"
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-6">
            <h3 className="mb-2 font-semibold">Your Assets</h3>
            <ul className="space-y-2">
              {(
                account?.balances?.filter(
                  (b) => b.asset_type !== "native",
                ) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[]
              )?.map((asset, id) => (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">
                      {tokens[id % tokens.length]!.icon}
                    </span>
                    <div>
                      <p className="font-medium">{asset.asset_code}</p>
                      <p className="text-sm text-gray-500">
                        {shortStellarAddress(asset.asset_issuer)}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">{Number(asset.balance)}</span>
                </li>
              ))}
              {/*{tokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">{token.icon}</span>
                    <div>
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-gray-500">{token.symbol}</p>
                    </div>
                  </div>
                  <span className="font-medium">{token.balance}</span>
                </li>
              ))}*/}
            </ul>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Recent Transactions</h3>
              <Button
                onClick={() => {
                  void recentOperations.refetch();
                }}
                variant="ghost"
                size="icon"
              >
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {recentOperations.data?.map((op) => (
                <li
                  key={op.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                >
                  <div className="flex w-full items-center justify-center">
                    <div className="flex w-full items-center gap-2">
                      {/*<Icons.StellarIcon width={15} height={15} />*/}
                      <span className="flex-grow text-sm">
                        {op.label}
                        {/*<div className="text-gray-500">
                          {op.asset_code && (
                            <Badge className="border-0 bg-gradient-to-br from-black to-gray-400 text-xs">
                              {op.asset_code}
                            </Badge>
                          )}
                        </div>*/}
                        <div className="ml-0.5 w-full">
                          {op.desc.split(",").map((d, i) => (
                            <div
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                      </span>
                    </div>

                    <div className="flex-end w-40 items-end justify-end text-right">
                      <span className={`mr-1 text-right text-xs font-medium`}>
                        {dayjs(op.created_at).format("MMM D")}
                      </span>
                      <span
                        className={`text-right text-xs font-normal text-muted-foreground`}
                      >
                        {dayjs(op.created_at).format("HH:mm")}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
