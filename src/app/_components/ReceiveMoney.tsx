"use client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Shield, Share2, Copy } from "lucide-react";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { generateQrCode, shortStellarAddress } from "~/lib/utils";
import { env } from "~/env";
import Image from "next/image";

export default function ReceiveMoney() {
  const { contractId: walletAddress } = useContractStore();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(walletAddress ?? "")
      .then(() => alert("Address copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "My Wallet Address",
          text: `Here's my wallet address: ${walletAddress ?? ""}`,
          url: `https://example.com/send?address=${walletAddress ?? ""}`,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      alert("Web Share API is not supported in your browser");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center rounded-lg bg-zinc-50 p-4">
          {/* Replace this with an actual QR code component */}
          <Image
            src={generateQrCode(
              `${env.NEXT_PUBLIC_APP_URL}/sign?to=${String(walletAddress ?? "")}`,
            )}
            width="250"
            height="250"
            alt="QR Code"
            className="rounded-md"
            style={{ aspectRatio: "200/200", objectFit: "cover" }}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium text-zinc-700"
          >
            Your Wallet Address
          </Label>
          <div className="flex space-x-2">
            <Input
              id="address"
              type="text"
              value={shortStellarAddress(walletAddress ?? "")}
              readOnly
              className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-zinc-300 hover:bg-zinc-100"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy address</span>
            </Button>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
        size="lg"
        onClick={handleShare}
      >
        <Share2 className="mr-2 h-5 w-5" />
        Share Address
      </Button>

      <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
        <h2 className="text-sm font-semibold text-zinc-700">
          How to Receive Money
        </h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-600">
          <li>Share your QR code or wallet address with the sender</li>
          <li>The sender scans the QR code or enters your address</li>
          <li>Once sent, the funds will appear in your wallet</li>
        </ol>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Always verify the sender before sharing your wallet address.
      </p>
    </div>
  );
}
