import { Button } from "~/components/ui/button";
import Image from "next/image";
import { ArrowDownIcon, ArrowUpIcon, Camera, ScanIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ClientTRPCErrorHandler, generateQrCode } from "~/lib/utils";
import { useSessionStore } from "~/hooks/stores/useSessionStore";

import { env } from "~/env";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { CreatePasskey } from "~/app/_components/CreatePasskey";
import SendMoneyForm from "~/app/_components/SendMoneyForm";
import ReceiveMoney from "~/app/_components/ReceiveMoney";
import { useContractStore } from "~/hooks/stores/useContractStore";

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
  const [showQR, setShowQR] = useState(false);
  const [showSendMoneyForm, setShowSendMoneyForm] = useState(false);
  const [amount] = useState<number>(Math.floor(Math.random() * 100));
  const { user } = useSessionStore();
  const { contractId } = useContractStore();

  const { data: balance } = api.stellar.getBalance.useQuery(
    { contractAddress: String(contractId) },
    { enabled: !!contractId },
  );

  const signSession = api.telegram.session.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => toast.success("Sign ession created"),
  });

  const { data: activeSession } = api.telegram.getActiveSession.useQuery(
    {
      telegramUserId: String(user?.id),
    },
    {
      enabled: !!user?.id,
    },
  );

  const transferXLM = async () => {
    const sessionData = await signSession.mutateAsync({
      telegramUserId: user!.id,
    });
    if (sessionData) {
      openUrl(`${env.NEXT_PUBLIC_APP_URL}/sign?sessionId=${sessionData.id}`);
    }
  };

  if (!activeSession?.contractAddress && !user?.defaultContractAddress) {
    return (
      <CreatePasskey
        openUrl={openUrl}
        triggerHapticFeedback={triggerHapticFeedback}
      />
    );
  }

  return (
    <Card className="min-h-screen w-full max-w-md border-0 bg-white p-4 shadow-lg">
      <CardHeader className="pb-2">
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
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-gray-500">Your Balance</p>
          <h2 className="text-4xl font-bold">{balance} XLM</h2>
        </div>
        <div className="mb-6 flex justify-between">
          <Button
            onClick={() => {
              setShowQR(false);
              setShowSendMoneyForm(!showSendMoneyForm);
            }}
            title="Coming soon"
            variant="outline"
            className="w-[48%]"
          >
            {!showSendMoneyForm && <ArrowUpIcon className="mr-2 h-4 w-4" />}
            {showSendMoneyForm ? "Hide" : "Send"}
          </Button>
          <Button
            onClick={() => {
              setShowSendMoneyForm(false);
              setShowQR(!showQR);
            }}
            variant="outline"
            className="w-[48%]"
          >
            {!showQR && <ArrowDownIcon className="mr-2 h-4 w-4" />}
            {showQR ? "Hide QR" : "Receive"}
          </Button>
        </div>
        {showQR && <ReceiveMoney />}
        {showSendMoneyForm && <SendMoneyForm openQRScanner={openQRScanner} />}
      </CardContent>
    </Card>
  );
};
