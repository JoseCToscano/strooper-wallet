import { Button } from "~/components/ui/button";
import { ArrowUpIcon, Camera, Download, Eye, EyeOff, Send } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { fromStroops, shortStellarAddress } from "~/lib/utils";
import { api } from "~/trpc/react";
import { CreatePasskey } from "~/app/_components/CreatePasskey";
import SendMoneyForm from "~/app/_components/SendMoneyForm";
import ReceiveMoney from "~/app/_components/ReceiveMoney";
import { useContractStore } from "~/hooks/stores/useContractStore";

interface StrooperWalletProps {
  openUrl: (url: string) => void;
  onLogout?: () => void;
  openQRScanner?: () => void;
  triggerHapticFeedback?: (
    style:
      | "light"
      | "medium"
      | "heavy"
      | "rigid"
      | "soft"
      | "success"
      | "warning"
      | "error"
      | "selectionChanged",
  ) => void;
}

export const StrooperWallet: React.FC<StrooperWalletProps> = ({
  openUrl,
  onLogout,
  triggerHapticFeedback,
  openQRScanner,
}) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSendMoneyForm, setShowSendMoneyForm] = useState(false);
  const { contractId } = useContractStore();

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const { data: balance } = api.stellar.getBalance.useQuery(
    { contractAddress: String(contractId) },
    { enabled: !!contractId, refetchInterval: 5000 },
  );

  // if (!contractId) {
  //   return (
  //     <CreatePasskey
  //       openUrl={openUrl}
  //       triggerHapticFeedback={triggerHapticFeedback}
  //     />
  //   );
  // }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-1">
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="ghost"
              size="icon"
              aria-label="Scan QR Code"
              className="font-semibold text-zinc-500 hover:text-zinc-700"
            >
              Logout
            </Button>
          )}
          {openQRScanner && (
            <Button
              onClick={openQRScanner}
              variant="ghost"
              size="icon"
              aria-label="Scan QR Code"
              className="border-[1px] border-zinc-300 text-zinc-500 hover:text-zinc-700"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-zinc-50 p-6 text-center">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">
              Current Balance
              {shortStellarAddress(contractId)}
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-4xl font-bold text-zinc-900">
                {isBalanceHidden ? "•••••" : fromStroops(String(balance ?? ""))}{" "}
                XLM
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBalanceVisibility}
                className="text-zinc-500 hover:text-zinc-700"
              >
                {isBalanceHidden ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {isBalanceHidden ? "Show balance" : "Hide balance"}
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              className="bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
              size="lg"
              onClick={() => {
                setShowQR(false);
                setShowSendMoneyForm(!showSendMoneyForm);
              }}
            >
              {!showSendMoneyForm ? (
                <Send className="mr-2 h-5 w-5" />
              ) : (
                <ArrowUpIcon className="mr-2 h-5 w-5" />
              )}
              {showSendMoneyForm ? "Hide" : "Send"}
            </Button>
            <Button
              className="bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
              size="lg"
              onClick={() => {
                setShowSendMoneyForm(false);
                setShowQR(!showQR);
              }}
            >
              {!showQR ? (
                <Download className="mr-2 h-5 w-5" />
              ) : (
                <ArrowUpIcon className="mr-2 h-5 w-5" />
              )}
              {showQR ? "Hide QR" : "Receive"}
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Last updated: 2 minutes ago
          </p>
          {showSendMoneyForm && (
            <SendMoneyForm openUrl={openUrl} openQRScanner={openQRScanner} />
          )}
          {showQR && <ReceiveMoney />}
        </CardContent>
      </Card>
    </div>
  );
};
