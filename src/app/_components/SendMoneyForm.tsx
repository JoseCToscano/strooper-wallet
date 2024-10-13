"use client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Camera, Send } from "lucide-react";

export default function SendMoneyForm({
  openQRScanner,
}: {
  openQRScanner: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium text-zinc-700">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
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
              placeholder="0x..."
              className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-2 border-zinc-300 hover:bg-zinc-100"
              onClick={openQRScanner}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Scan QR Code</span>
            </Button>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
        size="lg"
      >
        <Send className="mr-2 h-5 w-5" />
        Send Money
      </Button>

      <p className="text-center text-xs text-zinc-500">
        By sending, you agree to the terms of service and privacy policy.
      </p>
    </div>
  );
}
