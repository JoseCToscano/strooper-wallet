"use client";
import { type FC, useState } from "react";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import LoadingDots from "~/components/icons/loading-dots";
import { useCreateStellarPasskey } from "~/hooks/useCreateStellarPasskey";
import { env } from "~/env";
import { AlertCircle, Fingerprint, Shield } from "lucide-react";
import LoadingCard from "~/app/_components/LoadingCard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";

export const NewPassKey: FC = () => {
  const [creatingPasskey, setCreatingPasskey] = useState(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const session = api.telegram.getSession.useQuery(
    {
      sessionId: sessionId!,
    },
    {
      enabled: !!sessionId,
    },
  );

  const { mutateAsync: linkContractIdToSession } =
    api.telegram.updateSession.useMutation({
      onSuccess: () => toast.success("Session updated"),
      onError: ClientTRPCErrorHandler,
    });

  const { create, loading: loadingPasskeySession } = useCreateStellarPasskey(
    session.data?.user,
  );

  if (session.loading || !session?.data?.user) {
    return <LoadingCard />;
  }

  const createPasskey = async () => {
    setCreatingPasskey(true);
    const contractId = await create();
    await linkContractIdToSession({
      sessionId: sessionId!,
      contractAddressId: contractId,
    });
    setCreatingPasskey(false);
    window.location.href = env.NEXT_PUBLIC_TELEGRAM_BOT_URL;
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
                  {session?.data?.user?.telegramUsername}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg bg-zinc-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-600">
              By creating a passkey, you will be able to securely sign
              transactions using your Telegram account and your device&apos;s
              biometrics.
            </p>
          </div>

          <Button
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

export default NewPassKey;
