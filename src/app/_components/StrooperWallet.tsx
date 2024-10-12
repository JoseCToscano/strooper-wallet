import { Button } from "~/components/ui/button";

export const StrooperWallet = () => {
  const redirectToBrowserForPasskey = () => {
    // const domain = "https://0503fa22d87e.ngrok.app";
    // console.log("user", user);
    // sessionCreator
    //   .mutateAsync({ telegramUserId: String(user?.id) })
    //   .then((session) => {
    //     const url = `${domain}/passkey?sessionId=${session.id}`;
    //     window.Telegram.WebApp.openLink(url);
    //   })
    //   .catch((error) => {
    //     console.error("Error creating session:", error);
    //   });
  };

  const createPasskey = () => {
    redirectToBrowserForPasskey();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <div className="flex flex-col gap-2">
        <Button
          className="w-full rounded-md border-[1px] border-zinc-800 p-2 text-lg text-zinc-800 transition-colors duration-300 hover:bg-zinc-900"
          onClick={createPasskey}
        >
          Create Passkey in Browser
        </Button>
        <h1>Strooper Wallet</h1>
        <p>Wallet detailsd</p>
      </div>
    </div>
  );
};
