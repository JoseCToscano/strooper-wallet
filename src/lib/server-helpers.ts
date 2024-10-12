import { PasskeyServer } from "passkey-kit";
import { env } from "~/env";

export const account = new PasskeyServer({
  rpcUrl: env.NEXT_PUBLIC_RPC_URL,
  launchtubeUrl: env.LAUNCHTUBE_URL,
  launchtubeJwt: env.LAUNCHETUBE_JWT,
  mercuryUrl: env.MERCURYT_URL,
  mercuryJwt: env.MERCURY_JWT,
});
