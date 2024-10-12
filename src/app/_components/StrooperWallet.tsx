import { Button } from "~/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Fingerprint,
  ScanIcon,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ClientTRPCErrorHandler, generateQrCode } from "~/lib/utils";
import { useStrooper } from "~/hooks/useStrooper";
import { useSessionStore } from "~/hooks/stores/useSessionStore";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { env } from "~/env";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import LoadingDots from "~/components/icons/loading-dots";

interface StrooperWalletProps {
  openUrl: (url: string) => void;
}

export const StrooperWallet: React.FC<StrooperWalletProps> = ({ openUrl }) => {
  const [loadingPasskeySession, setLoadingPasskeySession] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [amount] = useState<number>(Math.floor(Math.random() * 100));
  const { user } = useSessionStore();
  const { publicKey, availableWallets } = useStrooper(user.id);

  const sessionCreator = api.telegram.session.useMutation({
    onSuccess: (data) => {
      toast.success("Session created successfully");
      console.log("Session created successfully:", data);
    },
    onError: ClientTRPCErrorHandler,
  });

  const redirectToBrowserForPasskey = () => {
    setLoadingPasskeySession(true);
    sessionCreator
      .mutateAsync({ telegramUserId: String(user?.id) })
      .then((session) => {
        const url = `${env.NEXT_PUBLIC_APP_URL}/new-passkey?sessionId=${session.id}`;
        openUrl(url);
      })
      .catch((error) => {
        console.error("Error creating session:", error);
      })
      .finally(() => {
        setLoadingPasskeySession(false);
      });
  };

  const createPasskey = () => {
    redirectToBrowserForPasskey();
  };

  const paymentSignature = () => {
    // const domain = "https://0503fa22d87e.ngrok.app";
    // paymentSessionCreator
    //   .mutateAsync({
    //     telegramUserId: String(user!.id),
    //     publicKey: "GCATIM6TLJ7DY26PI6CYYB2F2DD3WX3IO6ZGMC6PKWCYI7URNQXD75TI",
    //     amount,
    //     receiverAddress:
    //       "GAU5J6CXFZXOG62FGGE7TF2F3QBJJRYS46YTLT2PGMF7CPP4XPW23SWQ",
    //   })
    //   .then((session) => {
    //     const url = `${domain}/sign?sessionId=${session.id}`;
    //     window.Telegram.WebApp.openLink(url);
    //   })
    //   .catch((error) => {
    //     console.error("Error creating session:", error);
    //   });
  };

  function scanQrCode() {
    // if (window?.Telegram && window?.Telegram?.WebApp) {
    //   window.Telegram.WebApp.showScanQrPopup({
    //     text: "Please scan the QR code",
    //   });
    //
    //   // Listen for the event when QR code data is received
    //   window.Telegram.WebApp.onEvent("qrTextReceived", (data) => {
    //     if (data && data.data) {
    //       console.log("QR code scanned:", data.data);
    //       alert(`Scanned QR Code: ${data.data}`);
    //     } else {
    //       console.error("No data received from QR scan");
    //     }
    //   });
    //
    //   // Listen for when the QR scanner popup is closed
    //   window.Telegram.WebApp.onEvent("scanQrPopupClosed", () => {
    //     console.log("QR code scan popup closed");
    //   });
    // } else {
    //   console.error("Telegram WebApp is not available.");
    // }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <div className="flex flex-col gap-2">
        <Button
          className="w-full rounded-md border-[1px] border-zinc-800 p-2 text-lg text-zinc-800 transition-colors duration-300 hover:bg-zinc-900"
          onClick={createPasskey}
        >
          {loadingPasskeySession ? (
            <>
              <LoadingDots />
            </>
          ) : (
            "Create Passkey"
          )}
        </Button>
        <Button
          className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
          size="lg"
          onClick={paymentSignature}
        >
          <Fingerprint className="mr-2 h-6 w-6" />
          SEND {amount} XLM
        </Button>
        <Button
          className="w-full rounded-md border-[1px] border-zinc-800 p-2 text-lg text-zinc-800 transition-colors duration-300 hover:bg-zinc-900"
          onClick={() => {
            // window.Telegram.WebApp.BiometricManager.updateBiometricToken("");
            // setIsAuthenticated(false);
          }}
        >
          Logout
        </Button>
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-2xl font-bold">
              Stellar Wallet
            </CardTitle>
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
                  src={generateQrCode("publicKey ?? ")}
                  width="250"
                  height="250"
                  alt="QR Code"
                  className="rounded-md"
                  style={{ aspectRatio: "200/200", objectFit: "cover" }}
                />
              </div>
            )}
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  {availableWallets?.map((wallet) => (
                    <SelectItem key={wallet.publicKey} value="apple">
                      Apple
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Your Assets</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
