import { Button } from "~/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Camera,
  Download,
  Eye,
  EyeOff,
  Send,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ClientTRPCErrorHandler, fromStroops } from "~/lib/utils";
import { useSessionStore } from "~/hooks/stores/useSessionStore";

import { env } from "~/env";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { CreatePasskey } from "~/app/_components/CreatePasskey";
import SendMoneyForm from "~/app/_components/SendMoneyForm";
import ReceiveMoney from "~/app/_components/ReceiveMoney";
import { useContractStore } from "~/hooks/stores/useContractStore";
import Image from "next/image";

interface StrooperWalletProps {
  openUrl: (url: string) => void;
  onLogout: () => void;
  openQRScanner: () => void;
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
  const [isBalanceHidden, setIsBalanceHidden] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showSendMoneyForm, setShowSendMoneyForm] = useState(false);
  const { user } = useSessionStore();
  const { contractId } = useContractStore();

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const { data: balance } = api.stellar.getBalance.useQuery(
    { contractAddress: String(contractId) },
    { enabled: !!contractId, refetchInterval: 5000 },
  );

  const signSession = api.telegram.session.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => toast.success("Sign ession created"),
  });

  const transferXLM = async () => {
    const sessionData = await signSession.mutateAsync({
      telegramUserId: user!.id,
    });
    if (sessionData) {
      openUrl(`${env.NEXT_PUBLIC_APP_URL}/sign?sessionId=${sessionData.id}`);
    }
  };

  if (!contractId) {
    return (
      <CreatePasskey
        openUrl={openUrl}
        triggerHapticFeedback={triggerHapticFeedback}
      />
    );
  }

  if (showSendMoneyForm) {
    return <SendMoneyForm openQRScanner={openQRScanner} />;
  }

  if (showQR) {
    return <ReceiveMoney />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="flex items-center justify-center space-y-1">
          <Button
            onClick={openQRScanner}
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            aria-label="Scan QR Code"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            aria-label="Scan QR Code"
          >
            logout
          </Button>
          <Image
            className="mx-auto my-0"
            src={"/helmet-black.png"}
            alt="Strooper Logo"
            width={65}
            height={65}
          />
          {/*<Shield className="mb-2 h-8 w-8 text-zinc-700" />*/}
          <CardTitle className="text-center text-2xl font-semibold text-zinc-900">
            Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-zinc-50 p-6 text-center">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">
              Current Balance
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-4xl font-bold text-zinc-900">
                {isBalanceHidden ? "••••••" : fromStroops(balance)} XLM
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
              <Send className="mr-2 h-5 w-5" />
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
                <ArrowDownIcon className="mr-2 h-4 w-4" />
              )}
              {showQR ? "Hide QR" : "Receive"}
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Last updated: 2 minutes ago
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
