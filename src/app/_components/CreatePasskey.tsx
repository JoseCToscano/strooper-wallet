"use client";
import { Button } from "~/components/ui/button";
import LoadingDots from "~/components/icons/loading-dots";
import { env } from "~/env";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import { useState } from "react";
import { useSessionStore } from "~/hooks/stores/useSessionStore";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle, Fingerprint, Key } from "lucide-react";
import Image from "next/image";
import { useCreateStellarPasskey } from "~/hooks/useCreateStellarPasskey";
import { useSigner } from "~/hooks/useSigner";
import { useRouter } from "next/navigation";

interface CreatePasskeyProps {
  comesFromBrowser?: boolean;
  openUrl: (url: string) => void;
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
export const CreatePasskey: React.FC<CreatePasskeyProps> = ({
  openUrl,
  triggerHapticFeedback,
  comesFromBrowser,
}) => {
  const [creatingPasskey, setCreatingPasskey] = useState(false);
  const [connectingPasskey, setConnectingPasskey] = useState(false);
  const router = useRouter();
  const [loadingPasskeySession, setLoadingPasskeySession] = useState(false);
  const { user } = useSessionStore();

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
        if (triggerHapticFeedback) {
          triggerHapticFeedback("success");
        }
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

  const { create } = useCreateStellarPasskey();
  const { connect } = useSigner();

  const createPasskey = async () => {
    if (!comesFromBrowser) {
      return redirectToBrowserForPasskey();
    }
    setCreatingPasskey(true);
    await create().catch((err) => {
      setCreatingPasskey(false);
      throw err;
    });
    setCreatingPasskey(false);
    void router.push("/sign");
  };
  const connectPasskey = async () => {
    setConnectingPasskey(true);
    await connect().catch((err) => {
      setConnectingPasskey(false);
      throw err;
    });
    setConnectingPasskey(false);
    void router.push("/sign");
  };

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
            Link Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-zinc-600">
            Generate a new passkey to securely access your Stellar wallet.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Key className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-500" />
              <p className="text-sm text-zinc-600">
                Passkeys provide a secure, passwordless way to access your
                wallet.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-500" />
              <p className="text-sm text-zinc-600">
                Your passkey is unique to this device and cannot be transferred.
              </p>
            </div>
          </div>

          {comesFromBrowser ? (
            <>
              <Button
                disabled={
                  loadingPasskeySession || creatingPasskey || connectingPasskey
                }
                onClick={createPasskey}
                className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
                size="lg"
              >
                {loadingPasskeySession || creatingPasskey ? (
                  <>
                    <LoadingDots color="white" />
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-6 w-6" />
                    Create New Passkey
                  </>
                )}
              </Button>
              <Button
                disabled={
                  loadingPasskeySession || creatingPasskey || connectingPasskey
                }
                onClick={connectPasskey}
                className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
                size="lg"
              >
                {connectingPasskey ? (
                  <>
                    <LoadingDots color="white" />
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-6 w-6" />
                    Connect Passkey
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={createPasskey}
              className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
              size="lg"
            >
              {loadingPasskeySession ? (
                <>
                  <LoadingDots />
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-6 w-6" />
                  Setup Passkey
                </>
              )}
            </Button>
          )}

          <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              What happens next?
            </h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-600">
              <li>
                You will be redirected to a secure browser to create a passkey
              </li>
              <li>
                Confirm the passkey using your device&apos;s authentication
                method
              </li>
              <li>Your wallet will be securely linked to this passkey</li>
            </ol>
          </div>

          <p className="text-center text-xs text-zinc-500">
            By generating a passkey, you agree to our terms of service and
            privacy policy.
          </p>
        </CardContent>
      </Card>
      <span className="mt-4 text-xs text-zinc-500">
        Strooper Wallet • ©2024
      </span>
    </div>
  );
};
