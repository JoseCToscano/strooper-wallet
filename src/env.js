import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    TELEGRAM_BOT_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LAUNCHTUBE_URL: z.string().url(),
    LAUNCHETUBE_JWT: z.string(),
    MERCURYT_URL: z.string().url(),
    MERCURY_JWT: z.string(),
    FUNDER_SECRET_KEY: z.string(),
    FUNDER_PUBLIC_KEY: z.string(),
    NATIVE_CONTRACT_ID: z.string(),
    RPC_URL: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_FACTORY_CONTRACT_ID: z.string(),
    NEXT_PUBLIC_NATIVE_CONTRACT_ID: z.string(),
    NEXT_PUBLIC_RPC_URL: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_TELEGRAM_BOT_URL: z.string(),
    NEXT_PUBLIC_NETWORK_PASSPHRASE: z.string(), //
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_TELEGRAM_BOT_URL: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL,
    NEXT_PUBLIC_FACTORY_CONTRACT_ID:
      process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID,
    NEXT_PUBLIC_NATIVE_CONTRACT_ID: process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ID,
    NEXT_PUBLIC_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    LAUNCHTUBE_URL: process.env.LAUNCHTUBE_URL,
    MERCURYT_URL: process.env.MERCURYT_URL,
    LAUNCHETUBE_JWT: process.env.LAUNCHETUBE_JWT,
    MERCURY_JWT: process.env.MERCURY_JWT,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    TELEGRAM_BOT_URL: process.env.TELEGRAM_BOT_URL,
    FUNDER_SECRET_KEY: process.env.FUNDER_SECRET_KEY,
    FUNDER_PUBLIC_KEY: process.env.FUNDER_PUBLIC_KEY,
    NATIVE_CONTRACT_ID: process.env.NATIVE_CONTRACT_ID,
    RPC_URL: process.env.RPC_URL,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
