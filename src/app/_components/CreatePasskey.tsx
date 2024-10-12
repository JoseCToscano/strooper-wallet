"use client";
import { Button } from "~/components/ui/button";
import LoadingDots from "~/components/icons/loading-dots";
import { env } from "~/env";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import { useState } from "react";

interface CreatePasskeyProps {
  openUrl: (url: string) => void;
}
export const CreatePasskey: React.FC<CreatePasskeyProps> = ({ openUrl }) => {
  const [loadingPasskeySession, setLoadingPasskeySession] = useState(false);

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

  return (
    <div className="flex items-center justify-center bg-transparent p-4">
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
      </div>
    </div>
  );
};
