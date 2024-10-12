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
import { AlertCircle, Fingerprint, Shield } from "lucide-react";

interface CreatePasskeyProps {
  openUrl: (url: string) => void;
  triggerHapticFeedback?: (v: string) => void;
}
export const CreatePasskey: React.FC<CreatePasskeyProps> = ({
  openUrl,
  triggerHapticFeedback,
}) => {
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

  const createPasskey = () => {
    redirectToBrowserForPasskey();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="flex items-center justify-center space-y-1">
          <Shield className="mb-2 h-8 w-8 text-zinc-700" />
          <CardTitle className="text-center text-2xl font-semibold text-zinc-900">
            Passkey Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              Passkey details
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-zinc-500">Host:</span>
                <span className="font-mono text-zinc-700">
                  {env.NEXT_PUBLIC_APP_URL}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500">Telegram username</span>
                <span className="font-mono text-zinc-700">
                  {user?.username}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg bg-zinc-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-600">
              You will be redirected to a secure browser window to create your
              passkey. You can later use this passkey to sign transactions.
            </p>
          </div>

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
                Create Passkey
              </>
            )}
          </Button>

          <p className="text-center text-xs text-zinc-500">
            By signing, you agree to the terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
