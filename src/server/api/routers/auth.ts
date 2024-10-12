import { z } from "zod";
import base64url from "base64url";
import crypto from "crypto";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export function verifySignature(
  authenticatorData: Uint8Array,
  signature: Uint8Array,
  publicKey: string,
): boolean {
  try {
    // Step 1: Parse the clientDataJSON (base64url encoded)
    const clientDataHash = crypto
      .createHash("sha256")
      .update(authenticatorData)
      .digest();

    // Step 2: Create a verification object
    const verify = crypto.createVerify("SHA256");

    // Combine authenticatorData and clientDataHash for verification
    verify.update(Buffer.concat([authenticatorData, clientDataHash]));
    verify.end();

    // Step 3: Verify the signature using the public key
    const isValid = verify.verify(publicKey, signature);

    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}
export const authRouter = createTRPCRouter({
  createStrooperWallet: publicProcedure
    .input(
      z.object({
        userTelegramId: z.string(),
        stellarPublicKey: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Save the user's Stellar public key in the database
      const { userTelegramId, stellarPublicKey } = input;
      console.log(`Linking user ${userTelegramId} to Stellar public key`);
      console.log(`Stellar public key: ${stellarPublicKey}`);
      const user = await ctx.db.user.findFirstOrThrow({
        where: {
          telegramId: userTelegramId,
        },
      });

      await ctx.db.wallet.create({
        data: {
          publicKey: stellarPublicKey,
          userId: user.id,
        },
      });
      return { success: true };
    }),
  generateChallenge: publicProcedure.query(() => {
    const challenge = crypto.randomBytes(32).toString("hex"); // Random challenge
    return { challenge };
  }),
  validateChallenge: publicProcedure
    .input(
      z.object({
        id: z.string(),
        rawId: z.string(),
        response: z.object({
          clientDataJSON: z.string(),
          authenticatorData: z.string(),
          signature: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, rawId, response } = input;

      // Step 1: Verify the challenge (this must match the challenge the server generated)
      const clientDataJSON = JSON.parse(
        base64url.decode(response.clientDataJSON),
      );
      const challenge = "challenge_from_server"; // This should be fetched from the database
      if (clientDataJSON.challenge !== challenge) {
        throw new Error("Challenge mismatch");
      }

      // Step 2: Verify the signature using the stored public key
      const userPublicKey = "user_public_key"; // Fetch the user's public key from the database
      const isValidSignature = verifySignature(
        response.authenticatorData,
        response.signature,
        userPublicKey,
      );

      if (!isValidSignature) {
        throw new Error("Invalid signature");
      }

      // Step 3: Return success if all checks pass
      return { success: true };
    }),
  verifyWebAuthn: publicProcedure
    .input(
      z.object({
        clientDataJSON: z.string(),
        authenticatorData: z.string(),
        signature: z.string().optional(),
        publicKey: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const clientDataBuffer = base64url.toBuffer(input.clientDataJSON);
      const authenticatorBuffer = base64url.toBuffer(input.authenticatorData);
      const signatureBuffer = base64url.toBuffer(input.signature);

      // Generate the verification data
      const hash = crypto.createHash("sha256");
      hash.update(clientDataBuffer);
      const clientDataHash = hash.digest();

      const publicKeyBuffer = base64url.toBuffer(input.publicKey);
      const key = crypto.createPublicKey({
        key: publicKeyBuffer,
        format: "der",
        type: "spki",
      });

      // Verify the signature using WebAuthn public key
      const isVerified = crypto.verify(
        "sha256",
        Buffer.concat([authenticatorBuffer, clientDataHash]),
        key,
        signatureBuffer,
      );

      return isVerified;

      return { success: true };
    }),
  listWallets: publicProcedure
    .input(z.object({ telegramUserId: z.number() }))
    .query(async ({ input, ctx }) => {
      console.log(
        `Looking for wallets for telegramUserId: ${input.telegramUserId}`,
      );
      const user = await ctx.db.user.findFirstOrThrow({
        where: {
          telegramId: String(input.telegramUserId),
        },
        include: {
          wallets: true,
        },
      });
      console.log("user.wallets", user.wallets);
      return user.wallets;
    }),
});
